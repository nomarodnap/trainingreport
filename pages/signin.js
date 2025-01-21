import './styles.css';
import React, { useState } from 'react'; // เพิ่ม React และ useState
import { useRouter } from 'next/router';
import Link from 'next/link'; // Import Link จาก Next.js

export default function Signin() {
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [message, setMessage] = useState('');
  const router = useRouter();

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      // เก็บข้อมูลผู้ใช้ใน localStorage (ถ้าต้องการ)
      console.log('Storing user data:', data.user);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('status', data.user.status); // เก็บสถานะ

      setTimeout(() => {
        router.push('/'); // เปลี่ยนเส้นทางหลังจากเข้าสู่ระบบสำเร็จ
      }, 100);
    } else {
      setMessage(data.message); // แสดงข้อความเตือนจาก backend
    }
  } catch (error) {
    console.error('ข้อผิดพลาดใน handleSubmit:', error);
    setMessage('ไม่สามารถเข้าสู่ระบบได้ในขณะนี้ โปรดลองใหม่ภายหลัง');
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-700 text-center mb-6">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username or Email"
              onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Sign In
          </button>
        </form>
        {message && <p className="text-red-500 text-sm text-center mt-4">{message}</p>}
        <p className="text-gray-600 text-sm text-center mt-4">
          ยังไม่มีบัญชี?{' '}
          <Link href="/signup" className="text-blue-500 hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
        <p className="text-gray-600 text-sm text-center mt-4">
          ลืมรหัสผ่าน?{' '}
          <Link href="/reset-password-request" className="text-blue-500 hover:underline">
            ขอรีเซ็ตรหัสผ่าน
          </Link>
        </p>
      </div>
    </div>
  );
}
