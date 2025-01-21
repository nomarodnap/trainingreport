import './styles.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Header from '../components/Header';


export default function EditProfile() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    position: '',
    level: '',
    department: '',
    group: '',
    underDepartment1: '',
    underDepartment2: '',
    newPassword: '', // รหัสผ่านใหม่
    confirmPassword: '', // ยืนยันรหัสผ่านใหม่
    currentPassword: '', // รหัสผ่านปัจจุบัน
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
console.log('Stored username:', storedUser); // Debug ตรงนี้

    if (storedUser) {
      fetchUserData(storedUser);
    } else {
      setMessage('กรุณาล็อกอินใหม่');
    }
  }, []);

const fetchUserData = async (username) => {
  try {
    const res = await axios.get(`/api/users?username=${username}`);
    const data = res.data;

    if (res.status === 200) {
      setForm((prevForm) => ({
        ...prevForm,
        username: data.username || '',
        email: data.email || '',
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        phone: data.phone_number || '',
        position: data.position || '',
        level: data.level || '',
        department: data.department || '',
        group: data.group_name || '',
        underDepartment1: data.under_department1 || '',
        underDepartment2: data.under_department2 || '',
      }));
    } else {
      setMessage('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    }
  } catch (error) {
    setMessage('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้');
    console.error('Error fetching user data:', error);
  }
};



const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setMessage('');

  if (form.newPassword && form.newPassword !== form.confirmPassword) {
    setMessage('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
    setIsLoading(false);
    return;
  }

  if (!form.currentPassword) {
    setMessage('กรุณากรอกรหัสผ่านปัจจุบัน');
    setIsLoading(false);
    return;
  }

  try {
    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isPasswordValid = await verifyCurrentPassword(form.currentPassword);
    if (!isPasswordValid) {
      setMessage('รหัสผ่านปัจจุบันไม่ถูกต้อง');
      setIsLoading(false);
      return;
    }

    // ส่งข้อมูลไปยัง API
    const res = await axios.put('/api/updateUserProfile', form);

    if (res.status === 200) {
      setMessage('ข้อมูลได้ถูกบันทึกเรียบร้อยแล้ว');
    } else {
      setMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  } catch (error) {
    setMessage('ไม่สามารถบันทึกข้อมูลได้');
    console.error('Error updating user data:', error);
  } finally {
    setIsLoading(false);
  }
};


const verifyCurrentPassword = async (currentPassword) => {
  try {
    console.log("Verifying current password with:", {
      currentPassword,
      username: form.username
    });
    const res = await axios.post('/api/verifyPassword', {
      currentPassword,
      username: form.username // ส่ง username ที่กรอกในฟอร์มไปด้วย
    });

    // ตรวจสอบผลลัพธ์จาก backend
    console.log("Response:", res.data);
    
    // เพิ่มการคืนค่าผลลัพธ์จาก backend
    return res.data.isValid; // คืนค่า isValid จาก backend
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return false; // หากเกิดข้อผิดพลาดคืนค่า false
  }
};









  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

useEffect(() => {
  console.log('Form data:', form);
}, [form]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Header />
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-gray-700 text-center mb-6">
          แก้ไขข้อมูลส่วนตัว
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="username"
              value={form.username}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-200 focus:outline-none"
            />
          </div>


<div>
  <input
    type="text"
    name="email"
    value={form.email}
    disabled
    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-200 focus:outline-none"
  />
</div>
<div>
  <input
    type="text"
    name="firstName"
    placeholder="ชื่อจริง"
    value={form.firstName}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
  />
</div>
<div>
  <input
    type="text"
    name="lastName"
    placeholder="นามสกุล"
    value={form.lastName}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
  />
</div>
<div>
  <input
    type="text"
    name="phone"
    placeholder="เบอร์โทรศัพท์"
    value={form.phone}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
  />
</div>
<div>
  <input
    type="text"
    name="position"
    placeholder="ตำแหน่ง"
    value={form.position}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
  />
</div>
<div>
  <input
    type="text"
    name="level"
    placeholder="ระดับ"
    value={form.level}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
  />
</div>
<div>
  <select
    name="department"
    value={form.department}
    onChange={handleChange}
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
  >
    <option value="" disabled>
      กรุณาเลือกกอง *
    </option>
    <option value="กลุ่มพัฒนาระบบบริหาร">กลุ่มพัฒนาระบบบริหาร</option>
    <option value="กลุ่มตรวจสอบภายใน">กลุ่มตรวจสอบภายใน</option>
    <option value="สำนักงานเลขานุการกรม">สำนักงานเลขานุการกรม</option>
    <option value="กองบริหารทรัพยากรบุคคล">กองบริหารทรัพยากรบุคคล</option>
    <option value="กองบริหารการคลัง">กองบริหารการคลัง</option>
    <option value="กองยุทธศาสตร์และแผนงาน">กองยุทธศาสตร์และแผนงาน</option>
    <option value="กองประมงต่างประเทศ">กองประมงต่างประเทศ</option>
    <option value="ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร">ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร</option>
    <option value="กองวิจัยและพัฒนาเทคโนโลยีอุตสาหกรรมสัตว์น้ำ">
      กองวิจัยและพัฒนาเทคโนโลยีอุตสาหกรรมสัตว์น้ำ
    </option>
    <option value="กองตรวจสอบคุณภาพสินค้าประมง">กองตรวจสอบคุณภาพสินค้าประมง</option>
    <option value="กองวิจัยและพัฒนาพันธุกรรมสัตว์น้ำ">กองวิจัยและพัฒนาพันธุกรรมสัตว์น้ำ</option>
    <option value="กองตรวจการประมง">กองตรวจการประมง</option>
    <option value="กองนโยบายและแผนพัฒนาการประมง">กองนโยบายและแผนพัฒนาการประมง</option>
    <option value="กองวิจัยและพัฒนาการเพาะเลี้ยงสัตว์น้ำชายฝั่ง">
      กองวิจัยและพัฒนาการเพาะเลี้ยงสัตว์น้ำชายฝั่ง
    </option>
    <option value="กองวิจัยและพัฒนาประมงทะเล">กองวิจัยและพัฒนาประมงทะเล</option>
    <option value="กองวิจัยและพัฒนาการเพาะเลี้ยงสัตว์น้ำจืด">
      กองวิจัยและพัฒนาการเพาะเลี้ยงสัตว์น้ำจืด
    </option>
    <option value="กองกฏหมาย">กองกฏหมาย</option>
    <option value="กองพัฒนาระบบการรับรองมาตรฐานสินค้าประมงและหลักฐานเ">
      กองพัฒนาระบบการรับรองมาตรฐานสินค้าประมงและหลักฐานเ
    </option>
    <option value="กองตรวจสอบเรือประมง สินค้าสัตว์น้ำและปัจจัยการผลิต">
      กองตรวจสอบเรือประมง สินค้าสัตว์น้ำและปัจจัยการผลิต
    </option>
    <option value="กองโครงการอันเนื่องจากพระราชดำริและกิจกรรมพิเศษ">
      กองโครงการอันเนื่องจากพระราชดำริและกิจกรรมพิเศษ
    </option>
    <option value="กองบริหารจัดการทรัพยากรและกำหนดมาตรการ">
      กองบริหารจัดการทรัพยากรและกำหนดมาตรการ
    </option>
    <option value="กองบริหารจัดการเรือประมงและการทำการประมง">
      กองบริหารจัดการเรือประมงและการทำการประมง
    </option>
    <option value="กองวิจัยและพัฒนาประมงน้ำจืด">กองวิจัยและพัฒนาประมงน้ำจืด</option>
    <option value="กองวิจัยและพัฒนาสุขภาพสัตว์น้ำ">กองวิจัยและพัฒนาสุขภาพสัตว์น้ำ</option>
    <option value="กองวิจัยและพัฒนาอาหารสัตว์น้ำ">กองวิจัยและพัฒนาอาหารสัตว์น้ำ</option>
  </select>
</div>

<div>
  <input
    type="text"
    name="group"
    placeholder="กลุ่ม"
    value={form.group}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
  />
</div>
<div>
  <input
    type="text"
    name="underDepartment1"
    placeholder="ฝ่ายย่อยที่ 1"
    value={form.underDepartment1}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
  />
</div>
<div>
  <input
    type="text"
    name="underDepartment2"
    placeholder="ฝ่ายย่อยที่ 2"
    value={form.underDepartment2}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
  />
</div>

          <div>
            <input
              type="password"
              name="currentPassword"
              placeholder="รหัสผ่านปัจจุบัน *"
              value={form.currentPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
            />
          </div>
          <div>
            <input
              type="password"
              name="newPassword"
              placeholder="รหัสผ่านใหม่ (ไม่จำเป็นต้องกรอก)"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
            />
          </div>
          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="ยืนยันรหัสผ่านใหม่"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 rounded-md text-white ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 transition'
            }`}
          >
            {isLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
}
