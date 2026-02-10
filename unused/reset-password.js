import './styles.css';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      setMessage('');
      return;
    }

    try {
      await axios.post('/api/reset-password', { token, password });
      setMessage('รหัสผ่านของคุณได้รับการรีเซ็ตเรียบร้อยแล้ว');
      setError('');

      // เปลี่ยนเส้นทางไปที่หน้า Signin หลังจากสำเร็จ
      setTimeout(() => {
        router.push('/signin');
      }, 2000); // หน่วงเวลา 2 วินาทีก่อนเปลี่ยนหน้า
    } catch (err) {
      setError('ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-700 text-center mb-6">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Reset Password
          </button>
        </form>
        {message && (
          <p className="text-green-500 text-sm text-center mt-4">
            {message} <br /> กำลังเปลี่ยนเส้นทางไปยังหน้า Sign In...
          </p>
        )}
        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
      </div>
    </div>
  );
}
