import './styles.css';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from "next/router";
import Header from '../components/Header';


export default function DirectReport() {
    const [reports, setReports] = useState([]);
    const [username, setUsername] = useState('');
    const [userDetails, setUserDetails] = useState(null); 
    const [showTable, setShowTable] = useState(1); // สถานะสำหรับแสดงตาราง (1: ตารางหลัก, 2: ตารางที่สอง)
    const router = useRouter();
const [filters, setFilters] = useState([
    { field: "id", value: "" },
]);

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
            fetchReports();
            fetchUserDetails(); 
        }
    }, [username]);

const handleFilterChange = (index, key, value) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    setFilters(newFilters);
};

const addFilter = () => {
    setFilters([...filters, { field: "id", value: "" }]);
};

const removeFilter = (index) => {
    if (filters.length > 1) {
        setFilters(filters.filter((_, i) => i !== index));
    }
};



const calculateFiscalYear = (submitTime) => {
    const date = new Date(submitTime);
    let year = date.getFullYear() + 543; // แปลงปี ค.ศ. เป็น พ.ศ.
    const month = date.getMonth(); // เดือนเริ่มจาก 0 (มกราคม)

    // ถ้าเดือนตั้งแต่ตุลาคม (9) เป็นต้นไป ให้บวกปีอีก 1
    if (month >= 9) {
        year += 1;
    }


    return year;
};



const filteredReports = reports.filter((report) =>
    filters.every((filter) => {
        if (!filter.value) return true; // ข้ามเงื่อนไขที่ไม่มีค่าค้นหา

        if (filter.field === "fiscalYear") {
            const fiscalYear = calculateFiscalYear(report.submitTime);
            return fiscalYear.toString().includes(filter.value);
        }

        const fieldValue = report[filter.field]?.toString().toLowerCase();
        return fieldValue?.includes(filter.value.toLowerCase());
    })
);




    const fetchReports = async () => {
        try {
            const response = await axios.get('/api/reports');
            const filteredReports = response.data
                .filter((report) => report.username === username)
                .sort((a, b) => b.id - a.id); 
            setReports(filteredReports);
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };


    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`/api/users?username=${username}`);
            setUserDetails(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

const handleToggleTable = (tableNumber) => {
    setShowTable(tableNumber); // แสดงตารางตามหมายเลขที่เลือก
};



const redirectToEditForm = (id) => {
  console.log("This function is called"); // เพิ่ม Debug ตรงนี้
  console.log("Edit button clicked with ID:", id);


  if (!id) {
    console.log("ID is not defined, cannot navigate to form.");
    return;
  }

  setTimeout(() => {
       console.warn("Redirecting to form page now...");
    router.push(`/edit?id=${id}`);
  }, 500); // รอ 500ms ก่อนเปลี่ยนหน้า
};



const calculateTotalCost = () => {
    return reports.reduce((total, report) => total + (Number(report.totalCost) || 0), 0);
};


const deleteReport = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
        try {
            await axios.delete(`/api/reports?id=${id}`);
            setReports((prevReports) => prevReports.filter((report) => report.id !== id));
            toast.success("Report deleted successfully!");
        } catch (error) {
            toast.error("Error deleting report. Please try again.");
            console.error('Error deleting report:', error);
        }
    }
};


const startIndex = (currentPage - 1) * rowsPerPage;
const currentReports = filteredReports.slice(startIndex, startIndex + rowsPerPage);
const totalPages = Math.ceil(filteredReports.length / rowsPerPage);


    return (
<>
            <Header />

    <ToastContainer />



<div className="container mx-auto p-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-lg">
    <h1 className="text-2xl font-bold mb-4 text-center">Training Reports for {username}</h1>




    {/* User Details Section */}
    {userDetails && (
<div className="mb-4 p-4 bg-white text-gray-800 rounded-lg shadow">
    <h2 className="text-lg font-semibold mb-3">ข้อมูลผู้ใช้รหัส:  {userDetails.id || "N/A"}</h2>
    <div className="grid grid-cols-4 gap-4 text-sm">
        <div><strong>ชื่อ-นามสกุล:</strong> {userDetails.first_name} {userDetails.last_name}</div>
        <div><strong>เบอร์โทรศัพท์:</strong> {userDetails.phone_number || "N/A"}</div>
        <div><strong>ตำแหน่ง:</strong> {userDetails.position || "N/A"}</div>
        <div><strong>ระดับ:</strong> {userDetails.level || "N/A"}</div>
        <div><strong>สำนัก/กอง/ศูนย์:</strong> {userDetails.department || "N/A"}</div>
        <div><strong>กลุ่ม/ฝ่าย:</strong> {userDetails.group_name || "N/A"}</div>
        <div><strong>หน่วยงานภายใต้กอง 1:</strong> {userDetails.under_department1 || "N/A"}</div>
        <div><strong>หน่วยงานภายใต้กอง 2:</strong> {userDetails.under_department2 || "N/A"}</div>
    </div>
<div className="flex justify-end mt-6 space-x-4">
    {userDetails?.status === 'admin' && (
        <>
            <button
                onClick={() => window.location.href = '/reports'}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-5 rounded-lg text-md md:text-lg transition-all duration-200 shadow-lg"
            >
                เช็ครายงานทั้งหมด
            </button>
            <button
                onClick={() => window.location.href = '/users'}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-lg text-md md:text-lg transition-all duration-200 shadow-lg"
            >
                จัดการผู้ใช้
            </button>
    <button
        onClick={() => window.location.href = '/add-course'}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-md md:text-lg transition-all duration-200 shadow-lg"
    >
        เพิ่มวิชา
    </button>

        </>
    )}

    {userDetails?.status === 'approver' && (
        <>
    <button
        onClick={() => window.location.href = '/approve'}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-md md:text-lg transition-all duration-200 shadow-lg"
    >
        อนุมัติการฝึกอบรม
    </button>

        </>
    )}
    <button
        onClick={() => window.location.href = '/form'}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg text-md md:text-lg transition-all duration-200 shadow-lg"
    >
        เพิ่มแบบ กบค
    </button>
</div>



<div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
    {filters.map((filter, index) => (
        <div key={index} className="flex items-center space-x-2">
            <select
                value={filter.field}
                onChange={(e) => handleFilterChange(index, "field", e.target.value)}
                className="border px-4 py-2 rounded"
            >
                <option value="id">รหัสรายงาน</option>
                <option value="fiscalYear">ปีงบประมาณ</option>
                <option value="courseCode">วิชา</option>
                <option value="category">หมวด</option>
                <option value="trainingOrg">หน่วยงานที่จัด</option>
                <option value="trainingMethod">วิธีการอบรม</option>
                <option value="hybridLocation">สถานที่อบรม</option>
                <option value="category">วันที่เริ่มอบรม</option>
                <option value="category">วันที่สิ้นสุดการอบรม</option>
                <option value="state">สถานะ</option>
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
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-4 rounded"
    >
        เพิ่มเงื่อนไข
    </button>
</div>





</div>

    )}
  {showTable === 1 && (
    <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
<thead>
    <tr className="bg-blue-800 text-white">
        <th className="py-3 px-4 border-b border-gray-200">รหัสรายงาน</th>
        <th className="py-3 px-4 border-b border-gray-200">ปีงบประมาณ</th>
        <th className="py-3 px-4 border-b border-gray-200">วิชา</th>
        <th className="py-3 px-4 border-b border-gray-200">หมวด</th>
        <th className="py-3 px-4 border-b border-gray-200">หน่วยงานที่จัด</th>
        <th className="py-3 px-4 border-b border-gray-200">วิธีการอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">สถานที่อบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">วันที่เริ่มอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">วันที่สิ้นสุดการอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">ประกาศนียบัตร</th> {/* เพิ่มหัวข้อ Certificate */}
        <th className="py-3 px-4 border-b border-gray-200">สถานะ</th>
        <th className="py-3 px-4 border-b border-gray-200">ดำเนินการ</th>
    </tr>
</thead>
<tbody>
    {currentReports.map((report, index) => (
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
            </td> {/* แสดงลิงก์ Certificate */}
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
                    onClick={() => redirectToEditForm(report.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"
                >
                    แก้ไข
                </button>
                <button
                    onClick={() => deleteReport(report.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"
                >
                    ลบ
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
                <th className="py-3 px-4 border-b border-gray-200">วิชา</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าลงทะเบียน</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าที่พัก</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าเดินทาง</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าเบี้ยเลี้ยง</th>
                <th className="py-3 px-4 border-b border-gray-200">รวมค่าใช้จ่าย</th>
                <th className="py-3 px-4 border-b border-gray-200">เบิกงบจากกรมประมง</th>
                <th className="py-3 px-4 border-b border-gray-200">หน่วยงานอื่นที่สนับสนุนงบ</th>
                <th className="py-3 px-4 border-b border-gray-200">เบิกงบจากหน่วยงานอื่น</th>
        <th className="py-3 px-4 border-b border-gray-200">ดำเนินการ</th>
            </tr>
        </thead>
        <tbody>
            {currentReports.map((report) => (
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
                    <td className="border px-4 py-2 text-center">{report.courseCode}</td>
                    <td className="border px-4 py-2 text-center">{report.regFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.accommodationFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.transportationFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.allowanceFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.totalCost || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.internalBudget || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.externalAgency || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.externalBudget || "N/A"}</td>
            <td className="border px-4 py-2 text-center">
                <button
                    onClick={() => redirectToEditForm(report.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"
                >
                    แก้ไข
                </button>
                <button
                    onClick={() => deleteReport(report.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"
                >
                    ลบ
                </button>
            </td>
                </tr>
            ))}

    <tr className="bg-gray-300">
        <td colSpan="7" className="border px-4 py-2 font-bold text-right">จำนวนเงินทั้งสิ้น:</td>
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
        <th className="py-3 px-4 border-b border-gray-200">ดำเนินการ</th>
            </tr>
        </thead>
        <tbody>
            {currentReports.map((report) => (
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

            <td className="border px-4 py-2 text-center">
                <button
                    onClick={() => redirectToEditForm(report.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"
                >
                    แก้ไข
                </button>
                <button
                    onClick={() => deleteReport(report.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"
                >
                    ลบ
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
