import './styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';

export default function DeleteCourse() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedStatus = localStorage.getItem('status');

    if (storedStatus !== 'admin') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      router.push('/');
      return;
    }

    // ดึงข้อมูลคอร์สจาก API
    fetch('/api/get-courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses);
        if (data.courses.length > 0) {
          setSelectedCourse(data.courses[0].id_macou); // ตั้งค่าตัวเลือกเริ่มต้น
        }
      })
      .catch((err) => {
        console.error('Error fetching courses:', err);
        alert('เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส');
      });
  }, [router]);

  const handleDelete = async () => {
    if (!selectedCourse) {
      alert('กรุณาเลือกคอร์สที่ต้องการลบ');
      return;
    }

    const confirmDelete = confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคอร์สนี้?');
    if (!confirmDelete) return;

    try {
      const response = await fetch('/api/delete-course', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_macou: selectedCourse }),
      });

      if (response.ok) {
        alert('ลบคอร์สสำเร็จ!');
        setCourses(courses.filter((course) => course.id_macou !== selectedCourse));
        setSelectedCourse('');
      } else {
        alert('เกิดข้อผิดพลาดในการลบคอร์ส');
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">ลบคอร์สฝึกอบรม</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">เลือกคอร์สที่ต้องการลบ</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {courses.map((course) => (
                  <option key={course.id_macou} value={course.id_macou}>
                    {course.code_cou} - {course.name_cou}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleDelete}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              ลบคอร์ส
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
