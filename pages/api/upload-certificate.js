import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadDirectory = path.join(process.cwd(), 'public/uploads'); // กำหนดไดเรกทอรีสำหรับเก็บไฟล์อัปโหลด

// ตรวจสอบว่าโฟลเดอร์สำหรับอัปโหลดมีอยู่หรือไม่ ถ้าไม่มีให้สร้างใหม่
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// การกำหนดค่า Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
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
        // หากมีข้อผิดพลาดที่เกี่ยวข้องกับ Multer
        return res.status(400).json({ message: err.message });
      } else if (err) {
        // ข้อผิดพลาดทั่วไปอื่น ๆ
        return res.status(400).json({ message: err.message });
      }

      // ถ้าอัปโหลดสำเร็จ
      if (req.file) {
        const fileUrl = `/uploads/${req.file.filename}`;
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
