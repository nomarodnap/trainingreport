// pages/approve.js
import './styles.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { useRouter } from 'next/router'; // ใช้สำหรับ redirect

export default function ApprovePage() {
    const [reports, setReports] = useState([]);
    const [showTable, setShowTable] = useState(1);
  const router = useRouter(); // ตัวช่วยสำหรับ redirect

    const [username, setUsername] = useState('');
    const [userDetails, setUserDetails] = useState(null); 

const [currentPage, setCurrentPage] = useState(1); // หน้าปัจจุบัน
const rowsPerPage = 20; // จำนวนแถวต่อหน้า



useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
        // ถ้ายังไม่ได้ login ให้ redirect ไปที่หน้า signin
        router.push('/signin');
    } else {
        setUsername(storedUsername);
    }
}, []);


    useEffect(() => {
        if (username) {
            fetchUserDetails(); 
        }
    }, [username]);




  useEffect(() => {
    const storedStatus = localStorage.getItem('status');


    // ตรวจสอบสถานะผู้ใช้งาน
    if (storedStatus !== 'approver') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      router.push('/'); // redirect ไปหน้า index
    }
  }, [router]);


useEffect(() => {
    if (username && !userDetails) {
        fetchUserDetails();
    }
}, [username]);






const [filters, setFilters] = useState([
    { field: "id", value: "" }
]);



const handleToggleTable = (tableNumber) => {
    setShowTable(tableNumber); // แสดงตารางตามหมายเลขที่เลือก
};



    useEffect(() => {
        fetchReports();
    }, []);

const fetchReports = async () => {
    try {
        console.log("Fetching reports from API..."); // Debug: แสดงข้อความก่อนเรียก API
        const response = await axios.get('/api/reports');
        console.log("Response data:", response.data); // Debug: ตรวจสอบข้อมูลที่ได้รับ
        setReports(response.data);
    } catch (error) {
        console.error('Error fetching reports:', error); // Debug: แสดง error ที่เกิดขึ้น
    }
};


const updateState = async (id, state) => {
    console.log("Updating state for report ID:", id, "to", state); // Debug: แสดง ID และสถานะที่ต้องการอัปเดต
    try {
        const response = await axios.post('/api/approve', { id, state });
        console.log("Update successful. Response:", response.data); // Debug: แสดงข้อมูล response
        setReports((prevReports) =>
            prevReports.map((report) =>
                report.id === id ? { ...report, state } : report
            )
        );
    } catch (error) {
        console.error(`Error updating state for ID ${id}:`, error); // Debug: แสดง error
    }
};


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const calculateFiscalYear = (dateString) => {
        const date = new Date(dateString);
        let year = date.getFullYear() + 543;
        if (date.getMonth() >= 9) year += 1;
        return year;
    };

const calculateTotalCost = () => {
    return reports.reduce((total, report) => total + (Number(report.totalCost) || 0), 0);
};


const filteredReports = reports
    .filter((report) => {
        // กรองข้อมูลตามฟิลเตอร์ที่ผู้ใช้เลือก
        const matchesFilters = filters.every((filter) => {
            if (!filter.value) return true;
            if (filter.field === "fiscalYear") {
                const fiscalYear = calculateFiscalYear(report.submitTime);
                return fiscalYear.toString().includes(filter.value);
            }
            const fieldValue = report[filter.field]?.toString().toLowerCase();
            return fieldValue?.includes(filter.value.toLowerCase());
        });

        // กรองข้อมูลเพิ่มเติมด้วย userDetails.department
        const matchesDepartment =
            userDetails?.department ? report.department === userDetails.department : true;

        return matchesFilters && matchesDepartment;
    })
    .sort((a, b) => b.id - a.id); // เรียงลำดับจากมากไปน้อย



const addFilter = () => {
    setFilters([...filters, { field: "fiscalYear", value: "" }]);
};


const removeFilter = (index) => {
    if (filters.length > 1) {
        setFilters(filters.filter((_, i) => i !== index));
    }
};

const handleFilterChange = (index, key, value) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    setFilters(newFilters);
};


    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`/api/users?username=${username}`);
            setUserDetails(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };


const startIndex = (currentPage - 1) * rowsPerPage;
const currentReports = filteredReports.slice(startIndex, startIndex + rowsPerPage);
const totalPages = Math.ceil(filteredReports.length / rowsPerPage);


    return (
<>
            <Header />

        <div className="container mx-auto p-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-extrabold mb-6 text-center">Aroval Dashboard</h1>




<div className="mb-4 p-4 bg-white text-gray-800 rounded-lg shadow">
<div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
    {filters.map((filter, index) => (
        <div key={index} className="flex items-center space-x-2">
            <select
                value={filter.field}
                onChange={(e) => handleFilterChange(index, "field", e.target.value)}
                className="border px-4 py-2 rounded"
            >
                <option value="fiscalYear">ปีงบประมาณ</option>
                <option value="id">รหัสรายงาน</option>
                <option value="courseCode">วิชา</option>
                <option value="category">หมวด</option>
                <option value="trainingOrg">หน่วยงานที่จัด</option>
                <option value="trainingMethod">วิธีการอบรม</option>
                <option value="hybridLocation">สถานที่อบรม</option>
                <option value="category">วันที่เริ่มอบรม</option>
                <option value="category">วันที่สิ้นสุดการอบรม</option>
                <option value="condition">สถานะ</option>
                <option value="regFeeAmount">ค่าลงทะเบียน</option>
                <option value="accommodationFeeAmount">ค่าที่พัก</option>
                <option value="transportationFeeAmount">ค่าเดินทาง</option>
                <option value="allowanceFeeAmount">ค่าเบี้ยเลี้ยง</option>
                <option value="totalCost">รวมค่าใช้จ่าย</option>
                <option value="internalBudget">เบิกงบจากกรมประมง</option>
                <option value="externalAgency">หน่วยงานอื่นที่สนับสนุนงบ</option>
                <option value="externalBudget">เบิกงบจากหน่วยงานอื่น</option>
                <option value="planBudget">เบิกจ่ายงบจากแผนงาน</option>
                <option value="projectOutput">ผลผลิต/โครงการ</option>
                <option value="mainActivity">กิจกรรมหลัก</option>
                <option value="subActivity">กิจกรรมย่อย</option>
                <option value="knowledgeSelfDevelop">พัฒนาตนเอง</option>
                <option value="knowledgeWorkImprove">พัฒนางาน</option>
                <option value="knowledgeTeamwork">ได้ความรู้</option>
                <option value="knowledgeEfficiency">ประสิทธิผล</option>
                <option value="knowledgeNetworking">บูรณาการ</option>
                <option value="user_id">รหัสยูเซอร์</option>
                <option value="username">ยูเซอร์เนม</option>
                <option value="email">อีเมล</option>
                <option value="first_name">ชื่อ</option>
                <option value="last_name">นามสกุล</option>
                <option value="phone_number">เบอร์โทร</option>
                <option value="positionLevel">ตำแหน่ง</option>
                <option value="department">สำนัก/กอง/ศูนย์</option>
                <option value="group_name">กลุ่ม/ฝ่าย</option>
                <option value="status">สถานะ</option>
            </select>
            <input
                type="text"
                value={filter.value}
                onChange={(e) => handleFilterChange(index, "value", e.target.value)}
                placeholder="ค้นหา..."
                className="border px-4 py-2 rounded flex-grow"
            />
            <button
                onClick={() => removeFilter(index)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded"
            >
                ลบ
            </button>
        </div>
    ))}
</div>
<div className="mb-4">
    <button
        onClick={addFilter}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded mt-4 md:mt-0"
    >
        เพิ่มเงื่อนไข
    </button>
</div>

</div>

                {showTable === 1 && (  <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
    <thead className="bg-blue-800 text-white">
      <tr>
        <th className="py-3 px-4 border-b border-gray-200">รหัสรายงาน</th>
        <th className="py-3 px-4 border-b border-gray-200">ปีงบประมาณ</th>
    <th className="py-3 px-4 border-b border-gray-200">ชื่อ-นามสกุล</th> {/* เพิ่มคอลัมน์นี้ */}
        <th className="py-3 px-4 border-b border-gray-200">วิชา</th>
        <th className="py-3 px-4 border-b border-gray-200">หมวด</th>
        <th className="py-3 px-4 border-b border-gray-200">หน่วยงานที่จัด</th>
        <th className="py-3 px-4 border-b border-gray-200">วิธีการอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">สถานที่อบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">วันที่เริ่มอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">วันที่สิ้นสุดการอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">ประกาศนียบัตร</th>
        <th className="py-3 px-4 border-b border-gray-200">สถานะ</th>
        <th className="py-3 px-4 border-b border-gray-200">ดำเนินการ</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredReports.map((report, index) => (
        <tr key={report.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-blue-100'}>
        <td className="border px-4 py-2 text-center">
            <a
                href={`/api/pdf/${report.id}`} // ลิงก์ที่ส่ง primary key
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
            >
                {report.id}
            </a>
        </td>
            <td className="border px-4 py-2 text-center">{calculateFiscalYear(report.submitTime)}</td>
      <td className="border px-4 py-2 text-center">{`${report.first_name} ${report.last_name}`}</td> {/* เพิ่มข้อมูลชื่อ-นามสกุล */}
            <td className="border px-4 py-2 text-center">{report.courseCode}</td>
            <td className="border px-4 py-2 text-center">{report.category}</td>
            <td className="border px-4 py-2 text-center">{report.trainingOrg}</td>
            <td className="border px-4 py-2 text-center">{report.trainingMethod}</td>
            <td className="border px-4 py-2 text-center">{report.hybridLocation || "N/A"}</td>
            <td className="border px-4 py-2 text-center">{formatDate(report.startDate)}</td>
            <td className="border px-4 py-2 text-center">{formatDate(report.endDate)}</td>
            <td className="border px-4 py-2 text-center">
                {report.certificate_url ? (
                    <a
                        href={report.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                    >
                        View
                    </a>
                ) : (
                    "N/A"
                )}
            </td> 

<td 
    className={`border px-4 py-2 text-center font-semibold 
        ${
            report.state === "อนุมัติแล้ว" ? "text-green-600" :
            report.state === "ไม่อนุมัติ" ? "text-red-600" :
            "text-yellow-500"
        }
    `}
>
    {report.state || "รออนุมัติ"}
</td>


                            <td className="border px-4 py-2 text-center">
                                <button
                                    onClick={() => updateState(report.id, 'อนุมัติแล้ว')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg mr-2"
                                >
                                    อนุมัติ
                                </button>
                                <button
                                    onClick={() => updateState(report.id, 'ไม่อนุมัติ')}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    ไม่อนุมัติ
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

)}

{showTable === 2 && (
    <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
        <thead>
            <tr className="bg-blue-800 text-white">
                <th className="py-3 px-4 border-b border-gray-200">รหัสรายงาน</th>
		<th className="py-3 px-4 border-b border-gray-200">ปีงบประมาณ</th>
    <th className="py-3 px-4 border-b border-gray-200">ชื่อ-นามสกุล</th> {/* เพิ่มคอลัมน์นี้ */}
                <th className="py-3 px-4 border-b border-gray-200">วิชา</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าลงทะเบียน</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าที่พัก</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าเดินทาง</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าเบี้ยเลี้ยง</th>
                <th className="py-3 px-4 border-b border-gray-200">รวมค่าใช้จ่าย</th>
                <th className="py-3 px-4 border-b border-gray-200">เบิกงบจากกรมประมง</th>
                <th className="py-3 px-4 border-b border-gray-200">หน่วยงานอื่นที่สนับสนุนงบ</th>
                <th className="py-3 px-4 border-b border-gray-200">เบิกงบจากหน่วยงานอื่น</th>
        <th className="py-3 px-4 border-b border-gray-200">สถานะ</th>
        <th className="py-3 px-4 border-b border-gray-200">ดำเนินการ</th>
            </tr>
        </thead>
        <tbody>
            {filteredReports.map((report) => (
                <tr key={report.id}>
        <td className="border px-4 py-2 text-center">
            <a
                href={`/api/pdf/${report.id}`} // ลิงก์ที่ส่ง primary key
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
            >
                {report.id}
            </a>
        </td>
		    <td className="border px-4 py-2 text-center">{calculateFiscalYear(report.submitTime)}</td>
      <td className="border px-4 py-2 text-center">{`${report.first_name} ${report.last_name}`}</td> {/* เพิ่มข้อมูลชื่อ-นามสกุล */}
                    <td className="border px-4 py-2 text-center">{report.courseCode}</td>
                    <td className="border px-4 py-2 text-center">{report.regFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.accommodationFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.transportationFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.allowanceFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.totalCost || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.internalBudget || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.externalAgency || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.externalBudget || "N/A"}</td>
<td 
    className={`border px-4 py-2 text-center font-semibold 
        ${
            report.state === "อนุมัติแล้ว" ? "text-green-600" :
            report.state === "ไม่อนุมัติ" ? "text-red-600" :
            "text-yellow-500"
        }
    `}
>
    {report.state || "รออนุมัติ"}
</td>

                            <td className="border px-4 py-2 text-center">
                                <button
                                    onClick={() => updateState(report.id, 'อนุมัติแล้ว')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg mr-2"
                                >
                                    อนุมัติ
                                </button>
                                <button
                                    onClick={() => updateState(report.id, 'ไม่อนุมัติ')}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    ไม่อนุมัติ
                                </button>
                            </td>
</tr>
            ))}

    <tr className="bg-gray-300">
        <td colSpan="8" className="border px-4 py-2 font-bold text-right">จำนวนเงินทั้งสิ้น:</td>
        <td className="border px-4 py-2 font-bold text-center">{calculateTotalCost()}</td>
	<td></td>
	<td></td><td></td>
                                        <td>
                                </td>


    </tr>
        </tbody>
    </table>
)}

{showTable === 3 && (
    <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg mt-4">
        <thead>
            <tr className="bg-blue-800 text-white">
                <th className="py-3 px-4 border-b border-gray-200">รหัสรายงาน</th>
		<th className="py-3 px-4 border-b border-gray-200">ปีงบประมาณ</th>
    <th className="py-3 px-4 border-b border-gray-200">ชื่อ-นามสกุล</th> {/* เพิ่มคอลัมน์นี้ */}
                <th className="py-3 px-4 border-b border-gray-200">วิชา</th>
                <th className="py-3 px-4 border-b border-gray-200">เบิกจ่ายงบจากแผนงาน</th>
                <th className="py-3 px-4 border-b border-gray-200">ผลผลิต/โครงการ</th>
                <th className="py-3 px-4 border-b border-gray-200">กิจกรรมหลัก</th>
                <th className="py-3 px-4 border-b border-gray-200">กิจกรรมย่อย</th>
                <th className="py-3 px-4 border-b border-gray-200">พัฒนาตนเอง</th>
                <th className="py-3 px-4 border-b border-gray-200">พัฒนางาน</th>
                <th className="py-3 px-4 border-b border-gray-200">ได้ความรู้</th>
                <th className="py-3 px-4 border-b border-gray-200">ประสิทธิผล</th>
                <th className="py-3 px-4 border-b border-gray-200">บูรณาการ</th>
        <th className="py-3 px-4 border-b border-gray-200">สถานะ</th>
        <th className="py-3 px-4 border-b border-gray-200">ดำเนินการ</th>
            </tr>
        </thead>
        <tbody>
            {filteredReports.map((report) => (
                <tr key={report.id}>
        <td className="border px-4 py-2 text-center">
            <a
                href={`/api/pdf/${report.id}`} // ลิงก์ที่ส่ง primary key
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
            >
                {report.id}
            </a>
        </td>
		    <td className="border px-4 py-2 text-center">{calculateFiscalYear(report.submitTime)}</td>
      <td className="border px-4 py-2 text-center">{`${report.first_name} ${report.last_name}`}</td> {/* เพิ่มข้อมูลชื่อ-นามสกุล */}
                    <td className="border px-4 py-2 text-center">{report.courseCode}</td>
                    <td className="border px-4 py-2 text-center">{report.planBudget || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.projectOutput || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.mainActivity || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.subActivity || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.knowledgeSelfDevelop}</td>
                    <td className="border px-4 py-2 text-center">{report.knowledgeWorkImprove}</td>
                    <td className="border px-4 py-2 text-center">{report.knowledgeTeamwork}</td>
                    <td className="border px-4 py-2 text-center">{report.knowledgeEfficiency}</td>
                    <td className="border px-4 py-2 text-center">{report.knowledgeNetworking}</td>
<td 
    className={`border px-4 py-2 text-center font-semibold 
        ${
            report.state === "อนุมัติแล้ว" ? "text-green-600" :
            report.state === "ไม่อนุมัติ" ? "text-red-600" :
            "text-yellow-500"
        }
    `}
>
    {report.state || "รออนุมัติ"}
</td>

                            <td className="border px-4 py-2 text-center">
                                <button
                                    onClick={() => updateState(report.id, 'อนุมัติแล้ว')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg mr-2"
                                >
                                    อนุมัติ
                                </button>
                                <button
                                    onClick={() => updateState(report.id, 'ไม่อนุมัติ')}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    ไม่อนุมัติ
                                </button>
                            </td>

                </tr>
            ))}
        </tbody>
    </table>
)}



{showTable === 4 && (
            <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
                <thead>
                    <tr className="bg-green-800 text-white">
                        <th className="py-3 px-4 border-b border-gray-200">รหัสรายงาน</th>
                        <th className="py-3 px-4 border-b border-gray-200">รหัสยูเซอร์</th>
                        <th className="py-3 px-4 border-b border-gray-200">ยูเซอร์เนม</th>
                        <th className="py-3 px-4 border-b border-gray-200">อีเมล์</th>
                        <th className="py-3 px-4 border-b border-gray-200">ชื่อ-นามสกุล</th>
                        <th className="py-3 px-4 border-b border-gray-200">เบอร์โทร</th>
                        <th className="py-3 px-4 border-b border-gray-200">ตำแหน่ง</th>
                        <th className="py-3 px-4 border-b border-gray-200">สำนัก/กอง/ศูนย์</th>
                        <th className="py-3 px-4 border-b border-gray-200">กลุ่ม/ฝ่าย</th>
                       {/* <th className="py-3 px-4 border-b border-gray-200">under_department1</th> 
                    <th className="py-3 px-4 border-b border-gray-200">under_department2</th>  */}
                        <th className="py-3 px-4 border-b border-gray-200">Status</th>
                        <th className="py-3 px-4 border-b border-gray-200">Actions</th>
                    </tr>
                </thead>
<tbody>
    {filteredReports.map((user, index) => (
        <tr key={user.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-blue-100'}>

        <td className="border px-4 py-2 text-center">
            <a
                href={`/api/pdf/${user.id}`} // ลิงก์ที่ส่ง primary key
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
            >
                {user.id}
            </a>
        </td>
<td className="border px-4 py-2 text-center">

    {user.id ? (
        <a
            href={`/user-details/${user.user_id}`} // ใช้ user.id ที่ถูกต้อง
            className="text-blue-600 underline hover:text-blue-800"
        >
{user.user_id}

        </a>
    ) : (
        "N/A"
    )}
</td>


            <td className="border px-4 py-2 text-center">
{user.username}

</td>


            <td className="border px-4 py-2 text-center">{user.email}</td>
            <td className="border px-4 py-2 text-center">
                {user.first_name} {user.last_name}
            </td>
            <td className="border px-4 py-2 text-center">{user.phone_number}</td>
            <td className="border px-4 py-2 text-center">
                {user.position}{user.level}
            </td>
            <td className="border px-4 py-2 text-center">{user.department}</td>
            <td className="border px-4 py-2 text-center">{user.group_name}</td>
            <td className="border px-4 py-2 text-center">{user.status}</td>
                            <td className="border px-4 py-2 text-center">
                                <button
                                    onClick={() => updateState(report.id, 'อนุมัติแล้ว')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg mr-2"
                                >
                                    อนุมัติ
                                </button>
                                <button
                                    onClick={() => updateState(report.id, 'ไม่อนุมัติ')}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    ไม่อนุมัติ
                                </button>
                            </td>
        </tr>
    ))}
</tbody>

            </table>
)}


<div className="flex space-x-2">
    <button onClick={() => handleToggleTable(1)} className="bg-blue-500 text-white py-1 px-3 rounded">ตาราง 1</button>
    <button onClick={() => handleToggleTable(2)} className="bg-blue-500 text-white py-1 px-3 rounded">ตาราง 2</button>
    <button onClick={() => handleToggleTable(3)} className="bg-blue-500 text-white py-1 px-3 rounded">ตาราง 3</button>
    <button onClick={() => handleToggleTable(4)} className="bg-blue-500 text-white py-1 px-3 rounded">ตาราง 4</button>
</div>


<div className="flex justify-between items-center mt-4">
    <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        className={`py-2 px-4 rounded ${
            currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
        disabled={currentPage === 1}
    >
        Previous
    </button>
    <span className="text-white font-semibold">
        Page {currentPage} of {totalPages}
    </span>
    <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        className={`py-2 px-4 rounded ${
            currentPage === totalPages ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
        disabled={currentPage === totalPages}
    >
        Next
    </button>
</div>


        </div>
</>
    );
}
