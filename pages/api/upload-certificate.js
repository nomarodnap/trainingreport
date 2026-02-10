import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadDirectory = 'D:\\uploads'; // กำหนดไดเรกทอรีสำหรับเก็บไฟล์อัปโหลด (External Folder)

// ตรวจสอบว่าโฟลเดอร์สำหรับอัปโหลดมีอยู่หรือไม่ ถ้าไม่มีให้สร้างใหม่
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// ฟังก์ชันทำความสะอาดชื่อไฟล์ (ลบอักขระที่ไม่ปลอดภัย)
const sanitizeFileName = (fileName) => {
  return fileName.replace(/[\/\\?%*:|"<>]/g, '_'); // แทนที่อักขระต้องห้ามด้วย "_"
};

// การกำหนดค่า Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    // แปลงชื่อไฟล์เป็น UTF-8 และทำความสะอาดชื่อไฟล์
    const originalName = Buffer.from(file.originalname, 'binary').toString('utf-8');
    const fileExtension = path.extname(originalName);
    const baseName = path.basename(originalName, fileExtension);
    const cleanBaseName = sanitizeFileName(baseName).substring(0, 20);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${cleanBaseName}${fileExtension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // ยอมรับไฟล์
  } else {
    cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (.jpeg, .png) หรือ PDF เท่านั้น')); // ปฏิเสธไฟล์
  }
};

const upload = multer({ storage, fileFilter });

// API handler
export default function handler(req, res) {
  if (req.method === 'POST') {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (req.file) {
        const fileUrl = `/uploads/${encodeURIComponent(req.file.filename)}`; // เข้ารหัส URL ให้รองรับภาษาไทย
        return res.status(200).json({ fileUrl });
      } else {
        return res.status(400).json({ message: 'ไม่มีไฟล์ถูกอัปโหลด' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// ปิดการตั้งค่า API
export const config = {
  api: {
    bodyParser: false, // ปิด bodyParser เพื่อรองรับไฟล์อัปโหลด
  },
};
