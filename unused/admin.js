import './styles.css';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";


export default function Signin() {
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [message, setMessage] = useState('');
  const router = useRouter();
const [isHolding, setIsHolding] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
const res = await fetch('/api/signin', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(form), // ✅ แก้ตรงนี้ด้วย ไม่ต้อง wrap ด้วย { form }
});

const data = await res.json();

      if (res.ok) {
        // ไม่ต้อง set localStorage แล้ว ให้ backend จัดการ session cookie แทน
        router.push('/');
      } else {
        setMessage(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (error) {
      console.error('ข้อผิดพลาดใน handleSubmit:', error);
      setMessage('ไม่สามารถเข้าสู่ระบบได้ในขณะนี้ โปรดลองใหม่ภายหลัง');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Section for Logo and System Title */}
      <div className="flex items-center mb-8">
        <img
          src="/logo.png" // ใส่โลโก้ของระบบ (ให้แน่ใจว่าไฟล์โลโก้อยู่ใน public folder)
          alt="กรมประมง โลโก้"
          className="h-12 w-12 mr-4"
        />
        <h1 className="text-3xl font-bold text-gray-700">
          ระบบรายงานผลการฝึกอบรมกรมประมง
        </h1>
      </div>

      {/* Sign In Form */}
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">Sign In for Admin Only</h2>
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
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
            onClick={() => setShowPassword((prev) => !prev)} // เปลี่ยนเป็น toggle
          >
            <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
          </button>
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
          ลืมรหัสผ่าน?{' '}
          <Link href="/reset-password-request" className="text-blue-500 hover:underline">
            ขอรีเซ็ตรหัสผ่าน
          </Link>
        </p>
      </div>
    </div>
  );
}
