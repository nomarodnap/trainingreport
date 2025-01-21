import './styles.css';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Signup() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '', 
    position: '',
    level: '',
    department: '',
    group: '',
    underDepartment1: '',
    underDepartment2: '',
  });

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

const [isSuccessMessage, setIsSuccessMessage] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
	setIsSuccessMessage(false);
      setMessage('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }


    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.firstName ||
      !form.lastName ||
      !form.phone ||
      !form.position ||
	!form.department ||
	!form.group
    ) {
	setIsSuccessMessage(false);
      setMessage('กรุณากรอกข้อมูลในช่องที่มีเครื่องหมาย * ให้ครบ');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

if (res.ok) {
  setIsSuccessMessage(true);
  setMessage('สมัครสมาชิกสำเร็จ! โปรดตรวจสอบอีเมลของคุณเพื่อยืนยันการสมัคร');
  setForm({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    position: '',
    level: '',
    department: '',
    group: '',
    underDepartment1: '',
    underDepartment2: '',
  });
} else {
  setIsSuccessMessage(false);
  setMessage(data.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
}

    } catch (error) {
	setIsSuccessMessage(false);
      setMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ โปรดลองอีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-gray-700 text-center mb-6">
          สมัครสมาชิก
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username *"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password *"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password *"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <input
              type="text"
              name="firstName"
              placeholder="ชื่อ *"
              value={form.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="text"
              name="lastName"
              placeholder="นามสกุล *"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="text"
              name="phone"
              placeholder="เบอร์โทรศัพท์ *"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="text"
              name="position"
              placeholder="ตำแหน่ง *"
              value={form.position}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
        <input
          type="text"
          name="level"
          placeholder="ระดับ"
          value={form.level}
          onChange={handleChange}
	  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
    <option value="กองวิจัยและพัฒนาเทคโนโลยีอุตสาหกรรมสัตว์น้ำ">กองวิจัยและพัฒนาเทคโนโลยีอุตสาหกรรมสัตว์น้ำ</option>
    <option value="กองตรวจสอบคุณภาพสินค้าประมง">กองตรวจสอบคุณภาพสินค้าประมง</option>
    <option value="กองวิจัยและพัฒนาพันธุกรรมสัตว์น้ำ">กองวิจัยและพัฒนาพันธุกรรมสัตว์น้ำ</option>
    <option value="กองตรวจการประมง">กองตรวจการประมง</option>
    <option value="กองนโยบายและแผนพัฒนาการประมง">กองนโยบายและแผนพัฒนาการประมง</option>
    <option value="กองวิจัยและพัฒนาการเพาะเลี้ยงสัตว์น้ำชายฝั่ง">กองวิจัยและพัฒนาการเพาะเลี้ยงสัตว์น้ำชายฝั่ง</option>
    <option value="กองวิจัยและพัฒนาประมงทะเล">กองวิจัยและพัฒนาประมงทะเล</option>
    <option value="กองวิจัยและพัฒนาการเพาะเลี้ยงสัตว์น้ำจืด">กองวิจัยและพัฒนาการเพาะเลี้ยงสัตว์น้ำจืด</option>
    <option value="กองกฏหมาย">กองกฏหมาย</option>
    <option value="กองพัฒนาระบบการรับรองมาตรฐานสินค้าประมงและหลักฐานเ">กองพัฒนาระบบการรับรองมาตรฐานสินค้าประมงและหลักฐานเ</option>
    <option value="กองตรวจสอบเรือประมง สินค้าสัตว์น้ำและปัจจัยการผลิต">กองตรวจสอบเรือประมง สินค้าสัตว์น้ำและปัจจัยการผลิต</option>
    <option value="กองโครงการอันเนื่องจากพระราชดำริและกิจกรรมพิเศษ">กองโครงการอันเนื่องจากพระราชดำริและกิจกรรมพิเศษ</option>
    <option value="กองบริหารจัดการทรัพยากรและกำหนดมาตรการ">กองบริหารจัดการทรัพยากรและกำหนดมาตรการ</option>
    <option value="กองบริหารจัดการเรือประมงและการทำการประมง">กองบริหารจัดการเรือประมงและการทำการประมง</option>
    <option value="กองวิจัยและพัฒนาประมงน้ำจืด">กองวิจัยและพัฒนาประมงน้ำจืด</option>
    <option value="กองวิจัยและพัฒนาสุขภาพสัตว์น้ำ">กองวิจัยและพัฒนาสุขภาพสัตว์น้ำ</option>
    <option value="กองวิจัยและพัฒนาอาหารสัตว์น้ำ">กองวิจัยและพัฒนาอาหารสัตว์น้ำ</option>
  </select>
</div>


          <div>
        <input
          type="text"
          name="group"
          placeholder="กลุ่ม *"
          value={form.group}
          onChange={handleChange}
	  required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
          </div>
          <div>
        <input
          type="text"
          name="underDepartment1"
          placeholder="ภายใต้กอง1"
          value={form.underDepartment1}
          onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
          </div>
          <div>
        <input
          type="text"
          name="underDepartment2"
          placeholder="ภายใต้กอง2"
          value={form.underDepartment2}
          onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </button>
        </form>
{message && (
  <p
    className={`text-center mt-4 ${
      isSuccessMessage ? 'text-green-500' : 'text-red-500'
    }`}
  >
    {message}
  </p>
)}
      </div>
    </div>
  );
}
