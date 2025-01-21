import './styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';

export default function DeleteAgency() {
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedStatus = localStorage.getItem('status');

    if (storedStatus !== 'admin') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      router.push('/');
      return;
    }

    // ดึงข้อมูลหน่วยงานจาก API
    fetch('/api/get-agencies')
      .then((res) => res.json())
      .then((data) => {
        setAgencies(data.agencies);
        if (data.agencies.length > 0) {
          setSelectedAgency(data.agencies[0].id_extage); // ตั้งค่าตัวเลือกเริ่มต้น
        }
      })
      .catch((err) => {
        console.error('Error fetching agencies:', err);
        alert('เกิดข้อผิดพลาดในการดึงข้อมูลหน่วยงาน');
      });
  }, [router]);

  const handleDelete = async () => {
    if (!selectedAgency) {
      alert('กรุณาเลือกหน่วยงานที่ต้องการลบ');
      return;
    }

    const confirmDelete = confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหน่วยงานนี้?');
    if (!confirmDelete) return;

    try {
      const response = await fetch('/api/delete-agency', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_extage: selectedAgency }),
      });

      if (response.ok) {
        alert('ลบหน่วยงานสำเร็จ!');
        setAgencies(agencies.filter((agency) => agency.id_extage !== selectedAgency));
        setSelectedAgency('');
      } else {
        alert('เกิดข้อผิดพลาดในการลบหน่วยงาน');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">ลบหน่วยงานที่จัดฝึกอบรม</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">เลือกหน่วยงานที่ต้องการลบ</label>
              <select
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {agencies.map((agency) => (
                  <option key={agency.id_extage} value={agency.id_extage}>
                    {agency.subname_extage} - {agency.name_extage}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleDelete}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              ลบหน่วยงาน
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
