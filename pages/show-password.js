import './styles.css';
import React, { useEffect, useState } from "react";
import axios from 'axios';
import Header from '../components/Header';
import { useRouter } from 'next/router';
import Head from 'next/head';


export default function ShowPasswordPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) throw new Error('Unauthorized');

        const user = await res.json();

        if (user.status !== 'superadmin') {
          alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
          router.push('/');
          return;
        }
      } catch (err) {
        // ถ้าไม่มี session หรือเกิด error ให้ redirect ออก
        alert('กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้');
        router.push('/signin');
        return;
      }
    };

    checkStatus();
  }, [router]);

  const handleFetchPassword = async () => {
    try {
      const res = await axios.post('/api/show-password', { username });
      setPassword(res.data.password);
      setError('');
    } catch (err) {
      setPassword('');
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <>
      <Head>
        <title>แสดงรหัสผ่าน - ระบบรายงานผลการฝึกอบรมฯ กรมประมง</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="หน้าจัดการรหัสผ่านสำหรับผู้ดูแลระบบ" />
      </Head>
      <Header />
    <div style={{ padding: 20 }}>
      <h1>แสดงรหัสผ่าน</h1>
      <input
        type="text"
        placeholder="กรอก Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: 8, width: 300 }}
      />
      <button onClick={handleFetchPassword} style={{ marginLeft: 10, padding: 8 }}>
        แสดงรหัสผ่าน
      </button>

      {password && (
        <div style={{ marginTop: 20 }}>
          <strong>รหัสผ่าน:</strong> {password}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 20, color: 'red' }}>
          <strong>{error}</strong>
        </div>
      )}
    </div>
    </>
  );
}
