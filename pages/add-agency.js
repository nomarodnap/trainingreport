import './styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../components/Header';

export default function AddAgency() {
  const [formData, setFormData] = useState({
    id_extage: "",
    subname_extage: "",
    name_extage: "",
  });

  const router = useRouter();

  useEffect(() => {
    const storedStatus = localStorage.getItem('status');

    if (storedStatus !== 'admin') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      router.push('/'); 
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/add-agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("เพิ่มหน่วยงานสำเร็จ!");
        setFormData({
          id_extage: "",
          subname_extage: "",
          name_extage: "",
        });
      } else {
        alert("เกิดข้อผิดพลาดในการเพิ่มหน่วยงาน");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาด");
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">เพิ่มหน่วยงานที่จัดฝึกอบรม</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ชื่อย่อหน่วยงานที่จัดฝึกอบรม</label>
              <input
                type="text"
                name="subname_extage"
                value={formData.subname_extage}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ชื่อเต็มหน่วยงาน</label>
              <input
                type="text"
                name="name_extage"
                value={formData.name_extage}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              เพิ่มหน่วยงานที่จัดฝึกอบรม
            </button>
          </form>


<div className="mt-6 flex justify-end space-x-4">
  <button
    onClick={() => router.push('/delete-agency')}
    className="bg-red-500 text-white py-2 px-4 rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
  >
    ลบหน่วยงาน
  </button>
</div>



        </div>
      </div>
    </>
  );
}
