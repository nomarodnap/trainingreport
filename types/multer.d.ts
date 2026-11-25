declare module "multer" {
  import type { IncomingMessage, ServerResponse } from "http";

  export interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }

  export type FileFilterCallback = (error: Error | null, acceptFile?: boolean) => void;

  export interface DiskStorageOptions {
    destination?:
      | string
      | ((
          req: IncomingMessage,
          file: MulterFile,
          callback: (error: Error | null, destination: string) => void
        ) => void);
    filename?: (
      req: IncomingMessage,
      file: MulterFile,
      callback: (error: Error | null, filename: string) => void
    ) => void;
  }

  export interface MulterOptions {
    storage?: unknown;
    fileFilter?: (
      req: IncomingMessage,
      file: MulterFile,
      callback: FileFilterCallback
    ) => void;
  }

  export type RequestHandler = (
    req: IncomingMessage,
    res: ServerResponse,
    callback: (err?: unknown) => void
  ) => void;

  export interface MulterInstance {
    single(fieldName: string): RequestHandler;
  }

  export class MulterError extends Error {
    code: string;
    field?: string;
  }

  interface MulterFactory {
    (options?: MulterOptions): MulterInstance;
    diskStorage(options: DiskStorageOptions): unknown;
    MulterError: typeof MulterError;
  }

  const multer: MulterFactory;
  export default multer;
}
