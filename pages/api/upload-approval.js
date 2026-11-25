import { handleDocumentUpload } from '../../lib/documentUpload';

// API handler
export default function handler(req, res) {
  return handleDocumentUpload(req, res, 'approval');
}

// ปิดการตั้งค่า API
export const config = {
  api: {
    bodyParser: false, // ปิด bodyParser เพื่อรองรับไฟล์อัปโหลด
  },
};
