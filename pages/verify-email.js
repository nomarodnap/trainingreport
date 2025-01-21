import './styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { code } = router.query;

  useEffect(() => {
    const verifyEmail = async () => {
      if (code) {
        try {
          const response = await fetch(`/api/verify-email?code=${code}`);
          const data = await response.json();
          setMessage(data.message);
        } catch (err) {
          setMessage('เกิดข้อผิดพลาดในการยืนยันอีเมล');
        } finally {
          setLoading(false);
        }
      }
    };

    verifyEmail();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-700 text-center mb-6">ยืนยันอีเมล</h1>
        <p className="text-center text-gray-600 mb-6">{message}</p>

        {message.includes('สำเร็จ') && (
          <div className="text-center">
            <Link href="/signin" className="text-blue-500 hover:underline">
              คลิกที่นี่เพื่อเข้าสู่ระบบ
            </Link>
          </div>
        )}

        {message.includes('ผิดพลาด') && (
          <div className="text-center">
            <p className="text-red-500">กรุณาติดต่อผู้ดูแลระบบหากปัญหายังคงอยู่</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
