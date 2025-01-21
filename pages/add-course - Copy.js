import './styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';

export default function AddCourse() {
  const [formData, setFormData] = useState({
    code_cou: "",
    name_cou: "",
    category: "Digital Governance, Standard, and Compliance",
    id_extage: "01",
    id_learn: "01",
  });

    const router = useRouter();


useEffect(() => {
  const storedStatus = localStorage.getItem('status');
  
  // ตรวจสอบสถานะผู้ใช้งาน
  if (storedStatus !== 'admin') {
    alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
    router.push('/'); // redirect ไปหน้า index
  }
}, [router]);


useEffect(() => {
    // ดึง storedStatus จาก localStorage
    const storedStatus = localStorage.getItem('status');

    // Debug: แสดงค่า storedStatus ใน console
    console.log('Stored Status:', storedStatus);

    // ตรวจสอบสถานะ
    if (storedStatus !== 'admin') {
        console.log('User is not admin, redirecting to index page');
        router.push('/'); // Redirect หากสถานะไม่ใช่ admin
        return;
    }

}, [router]);

  const categories = [
    "Digital Governance, Standard, and Compliance",
    "Digital Leadership​",
    "Digital Literacy",
    "Digital Service and Process Design",
    "Digital Technology",
    "Digital Transformation",
    "Strategic and Project Management",
    "Techonlogy",
    "การพัฒนากรอบความคิด",
    "การพัฒนาองค์ความรู้",
    "ทักษะดิจิทัล",
    "ทักษะด้านภาษา",
    "ทักษะเชิงยุทธศาสตร์และภาวะผู้นำ",
    "หลักสูตร",
  ];

  const extages = [
    { label: "GDCC - สำนักงานคณะกรรมการดิจิทัลเพื่อเศรษฐกิจและสังคมแห่ง", value: "01" },
    { label: "TDGA - สถาบันพัฒนาบุคลากรภาครัฐด้านดิจิทัล", value: "02" },
    { label: "สำนักงาน ก.พ. - สำนักงานคณะกรรมการข้าราชการพลเรือน", value: "03" },
    { label: "สำนักงาน ก.พ.ร. - สำนักงานคณะกรรมการพัฒนาระบบราชการ", value: "04" },
  ];

  const learningMethods = [
    { label: "E-learning", value: "01" },
    { label: "Online เช่น Zoom/Microsoft Team/Google Meet หรืออื่น ๆ", value: "02" },
    { label: "Onsite", value: "03" },
    { label: "Hybrid (Online และ Onsite)", value: "04" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/add-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("เพิ่มวิชาสำเร็จ!");
        setFormData({
          code_cou: "",
          name_cou: "",
          category: "Digital Governance, Standard, and Compliance",
          id_extage: "01",
          id_learn: "01",
        });
      } else {
        alert("เกิดข้อผิดพลาดในการเพิ่มวิชา");
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">เพิ่มวิชาลงฐานข้อมูล</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสย่อวิชา</label>
            <input
              type="text"
              name="code_cou"
              value={formData.code_cou}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ชื่อเต็มวิชา</label>
            <input
              type="text"
              name="name_cou"
              value={formData.name_cou}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">หมวด</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">หน่วยงานที่จัด</label>
            <select
              name="id_extage"
              value={formData.id_extage}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {extages.map((ext) => (
                <option key={ext.value} value={ext.value}>
                  {ext.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">วิธีการอบรม</label>
            <select
              name="id_learn"
              value={formData.id_learn}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {learningMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            เพิ่มวิชา
          </button>
        </form>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => router.push('/add-agency')}
              className="bg-green-500 text-white py-2 px-4 rounded-md shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              เพิ่มหน่วยงาน
            </button>
            <button
              onClick={() => router.push('/delete-course')}
              className="bg-red-500 text-white py-2 px-4 rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              ลบวิชา
            </button>
          </div>



      </div>
    </div>
        </>
  );
}
