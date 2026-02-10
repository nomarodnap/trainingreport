import './styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';

export default function DeleteCourse() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const router = useRouter();

  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState('');

  const [formData, setFormData] = useState({
    trainingOrg: '',
    courseCode: '',
  });

  useEffect(() => {
    const storedStatus = localStorage.getItem('status');

    if (storedStatus !== 'admin') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      router.push('/');
      return;
    }

    fetch('/api/get-courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses);
        if (data.courses.length > 0) {
          setSelectedCourse(data.courses[0].id_macou);
        }
      })
      .catch((err) => {
        console.error('Error fetching courses:', err);
        alert('เกิดข้อผิดพลาดในการดึงข้อมูลวิชา');
      });
  }, [router]);

  useEffect(() => {
    const fetchAgencies = async () => {
      const response = await fetch("/api/getAgencies");
      const data = await response.json();
      setAgencies(data);
    };

    fetchAgencies();
  }, []);

  const handleDelete = async () => {
    if (!selectedCourse) {
      alert('กรุณาเลือกวิชาที่ต้องการลบ');
      return;
    }

    const confirmDelete = confirm('คุณแน่ใจหรือไม่ว่าต้องการลบวิชานี้?');
    if (!confirmDelete) return;

    try {
      const response = await fetch('/api/delete-course', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_macou: selectedCourse }),
      });

      if (response.ok) {
        alert('ลบวิชาสำเร็จ!');
        setCourses(courses.filter((course) => course.id_macou !== selectedCourse));
        setSelectedCourse('');
      } else {
        alert('เกิดข้อผิดพลาดในการลบวิชา');
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
        <div className="relative w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">ลบวิชาฝึกอบรม</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">เลือกหน่วยงานที่จัดฝึกอบรม</label>
              <select
                id="trainingOrg"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedAgency = agencies.find(
                    (agency) => `${agency.id_extage}` === selectedId
                  );
                  if (selectedAgency) {
                    setSelectedAgency(selectedAgency.name_extage);
                    setFormData({
                      ...formData,
                      trainingOrg: `${selectedAgency.subname_extage} - ${selectedAgency.name_extage}`,
                    });
                  }
                }}
              >
                <option value="">-- กรุณาเลือก --</option>
                {agencies.map((agency) => (
                  <option key={agency.id_extage} value={agency.id_extage}>
                    {agency.subname_extage} - {agency.name_extage}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">เลือกวิชาที่ต้องการลบ</label>
              <select
                id="courseCode"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedCourse}
                onChange={(e) => {
                  const selectedCode = e.target.value;
                  setSelectedCourse(selectedCode);
                  setFormData({
                    ...formData,
                    courseCode: selectedCode,
                  });
                }}
              >
                {selectedAgency === "" ? (
                  <option value="">-- กรุณาเลือกหน่วยงานที่จัดฝึกอบรมก่อน --</option>
                ) : (
                  <>
                    <option value="">-- กรุณาเลือก --</option>
                    {courses
                      .filter((course) => {
                        return (
                          course.name_extage.includes(selectedAgency) ||
                          course.subname_extage.includes(selectedAgency)
                        );
                      })
                      .map((course) => (
                        <option key={course.id_macou} value={course.id_macou}>
                          {course.code_cou} - {course.name_cou}
                        </option>
                      ))}
                  </>
                )}
              </select>
            </div>

            <button
              onClick={handleDelete}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              ลบวิชา
            </button>
          </div>



<div className="mt-6 flex justify-between gap-2">
  <button
    onClick={() => router.back()} // ใช้ router.back() เพื่อย้อนกลับไปหน้าก่อนหน้า
    className="bg-gray-500 text-white py-2 px-4 rounded-md shadow hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
  >
    ย้อนกลับ
  </button>
  <div className="flex gap-2">

  </div>
</div>

        </div>
      </div>
    </>
  );
}
