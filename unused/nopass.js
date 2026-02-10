import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import './styles.css';



export default function SignIn() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login_dpis6', { username });
      if (res.data.success) {
        router.push('/dashboard');
      } else {
        setError('ไม่พบผู้ใช้นี้ในระบบ');
      }
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาด โปรดลองอีกครั้ง');
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: 'auto' }}>
      <h1>เข้าสู่ระบบ</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: 10, width: '100%', marginBottom: 10 }}
        />
        <button type="submit" style={{ padding: 10, width: '100%' }}>
          เข้าสู่ระบบ
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
