import { useState } from 'react';
import axios from 'axios';

export default function ShowPasswordPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
  );
}
