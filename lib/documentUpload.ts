import fs from "fs";
import path from "path";
import multer, { type MulterFile, type MulterOptions } from "multer";
import * as Sentry from "@sentry/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  attachSessionUserContext,
  sanitizeErrorForLog,
  withBusinessSpan,
} from "./sentry";

const UPLOAD_DIRECTORY = "D:\\uploads";

function ensureUploadDirectory() {
  if (!fs.existsSync(UPLOAD_DIRECTORY)) {
    fs.mkdirSync(UPLOAD_DIRECTORY, { recursive: true });
  }
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[\/\\?%*:|"<>]/g, "_");
}

function createUploadMiddleware() {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureUploadDirectory();
      cb(null, UPLOAD_DIRECTORY);
    },
    filename: (_req, file, cb) => {
      const originalName = Buffer.from(file.originalname, "binary").toString(
        "utf-8"
      );
      const fileExtension = path.extname(originalName);
      const baseName = path.basename(originalName, fileExtension);
      const cleanBaseName = sanitizeFileName(baseName).substring(0, 20);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${cleanBaseName}${fileExtension}`);
    },
  });

  const fileFilter: MulterOptions["fileFilter"] = (_req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("รองรับเฉพาะไฟล์รูปภาพ (.jpeg, .png) หรือ PDF เท่านั้น"));
    }
  };

  return multer({ storage, fileFilter }).single("file");
}

const singleFileUpload = createUploadMiddleware();

function runUploadMiddleware(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<MulterFile | undefined> {
  return new Promise((resolve, reject) => {
    singleFileUpload(req, res, (err: unknown) => {
      if (err) {
        reject(err);
        return;
      }
      resolve((req as NextApiRequest & { file?: MulterFile }).file);
    });
  });
}

/**
 * Shared Pages Router handler for document uploads with Sentry span + wide event logging.
 */
export async function handleDocumentUpload(
  req: NextApiRequest,
  res: NextApiResponse,
  documentType: "approval" | "certificate"
) {
  attachSessionUserContext(req);

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const startedAt = Date.now();

  try {
    const uploadedFile = await withBusinessSpan(
      "upload.save_file",
      "file.write",
      { "upload.document_type": documentType },
      async (span) => {
        const file = await runUploadMiddleware(req, res);
        if (!file) {
          span.setAttribute("upload.success", false);
          return undefined;
        }

        const fileExt = path.extname(file.filename).toLowerCase();
        span.setAttributes({
          "upload.success": true,
          "file.size": file.size,
          "upload.mime_type": file.mimetype,
          "upload.file_ext": fileExt,
        });
        return file;
      }
    );

    const durationMs = Date.now() - startedAt;

    if (!uploadedFile) {
      Sentry.logger.warn("Document upload rejected: missing file", {
        document_type: documentType,
        duration_ms: durationMs,
        status: "missing_file",
        http_status: 400,
      });
      return res.status(400).json({ message: "ไม่มีไฟล์ถูกอัปโหลด" });
    }

    const fileUrl = `/uploads/${encodeURIComponent(uploadedFile.filename)}`;
    Sentry.logger.info("Document uploaded successfully", {
      document_type: documentType,
      file_size: uploadedFile.size,
      mime_type: uploadedFile.mimetype,
      duration_ms: durationMs,
      status: "success",
      http_status: 200,
    });

    return res.status(200).json({ fileUrl });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const isClientRejection =
      error instanceof multer.MulterError ||
      (error instanceof Error &&
        error.message.includes("รองรับเฉพาะไฟล์รูปภาพ"));

    if (isClientRejection) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid file upload";
      Sentry.logger.warn("Document upload validation failed", {
        document_type: documentType,
        duration_ms: durationMs,
        status: "validation_error",
        http_status: 400,
        error_message: errorMessage,
      });
      return res.status(400).json({ message: errorMessage });
    }

    Sentry.logger.error("Document upload failed", {
      document_type: documentType,
      duration_ms: durationMs,
      status: "error",
      http_status: 500,
      ...sanitizeErrorForLog(error),
    });
    Sentry.captureException(error);
    return res.status(500).json({ message: "Upload failed" });
  }
}
