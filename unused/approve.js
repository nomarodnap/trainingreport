// pages/reports.js
import './styles.css';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import Header from '../components/Header';
import { useRouter } from 'next/router'; // ใช้สำหรับ redirect
import * as XLSX from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { getSessionUser } from '@/utils/getSessionUser'; // ปรับ path ตามจริง
import Footer from '../components/Footer';
import { faEnvelope, faPhone, faMapMarkerAlt, faBook, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";


export default function ApprovePage() {
    const [reports, setReports] = useState([]);
    const [showTable, setShowTable] = useState(1);
  const router = useRouter(); // ตัวช่วยสำหรับ redirect

    const [username, setUsername] = useState('');
	  const [status, setStatus] = useState('');

    const [userDetails, setUserDetails] = useState(null); 

const [currentPage, setCurrentPage] = useState(1); // หน้าปัจจุบัน
    const [rowsPerPage, setRowsPerPage] = useState(25); // จำนวนแถวต่อหน้า (ค่าเริ่มต้น)
  	const [filterMode, setFilterMode] = useState("AND"); // ค่าตั้งต้นเป็น AND
	    const [showFilters, setShowFilters] = useState(false); // state ควบคุมการแสดง
		    const [filtersAND, setFiltersAND] = useState([]);
    const [filtersOR, setFiltersOR] = useState([]);
	
	const [filtersNOT, setFiltersNOT] = useState([]);

const [isLoadingReports, setIsLoadingReports] = useState(false);
const [checkedStatusFilter, setCheckedStatusFilter] = useState("all"); // all, checked, unchecked


  useEffect(() => {
    const checkSession = async () => {
      const user = await getSessionUser();
      if (!user) {
        router.push('/signin');
      } else {
        setUsername(user.username);
        setStatus(user.status);

        if (user.status !== 'approver') {
          alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
          router.push('/');
        }
      }
    };

    checkSession();
  }, [router]);


    useEffect(() => {
        if (username) {
            fetchUserDetails(); 
        }
    }, [username]);






useEffect(() => {
    if (username && !userDetails) {
        fetchUserDetails();
    }
}, [username]);






const [filters, setFilters] = useState([
    { field: "formCode", value: "" }
]);



const handleToggleTable = (tableNumber) => {
    setShowTable(tableNumber); // แสดงตารางตามหมายเลขที่เลือก
};



    useEffect(() => {
        fetchReports();
    }, []);

const fetchReports = async () => {
	  setIsLoadingReports(true); // เริ่มแสดง overlay

    try {
        console.log("Fetching reports from API..."); // Debug: แสดงข้อความก่อนเรียก API
        const response = await axios.get('/api/reports');
        console.log("Response data:", response.data); // Debug: ตรวจสอบข้อมูลที่ได้รับ
        setReports(response.data);
    } catch (error) {
        console.error('Error fetching reports:', error); // Debug: แสดง error ที่เกิดขึ้น
    }finally {
    setIsLoadingReports(false); // ซ่อน overlay เมื่อเสร็จ
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

    const formatDateBuddhist = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = (date.getFullYear() + 543).toString();
        return `${day}/${month}/${year}`;
    };

const calculateFiscalYear = (startDate) => {
    const date = new Date(startDate);
    let year = date.getFullYear() + 543; // แปลงปี ค.ศ. เป็น พ.ศ.
    const month = date.getMonth(); // เดือนเริ่มจาก 0 (มกราคม)

    // ถ้าเดือนตั้งแต่ตุลาคม (9) เป็นต้นไป ให้บวกปีอีก 1
    if (month >= 9) {
        year += 1;
    }


    return year;
};

const calculateTotalCost = () => {
    return currentReports.reduce((total, report) => total + (Number(report.totalCost) || 0), 0);

};
  const { reportId } = router.query;


function matchesCondition(report, filter) {
    if (filter.field === "fiscalYear") {
        const fiscalYear = calculateFiscalYear(report.submitTime);
        return fiscalYear.toString().includes(filter.value);
    }

    if (filter.field === "full_name") {
        const fullName = `${report.title || ""} ${report.first_name || ""} ${report.last_name || ""}`.toLowerCase();
        return fullName.includes(filter.value.toLowerCase());
    }
	
	    if (filter.field === "full_position") {
        const fullPosition = `${report.position || ""}${report.level || ""}`.toLowerCase();
        return fullPosition.includes(filter.value.toLowerCase());
    }

    let fieldValue = report[filter.field];

    if (["startDate", "endDate", "submitTime"].includes(filter.field)) {
        fieldValue = formatDate(fieldValue);
    }

    if ((fieldValue === null || fieldValue === undefined) && filter.value.trim().toUpperCase() === "N/A") {
        return true;
    }

    return fieldValue?.toString().toLowerCase().includes(filter.value.toLowerCase());
}
	
	
	
const filteredReports = reports
  .filter((report) => {
    if (reportId) return report.id.toString() === reportId;

    const matchesDepartment =
      userDetails?.department ? report.department === userDetails.department : true;

    // ค้นหาด่วน
    const passQuick = filters.every((filter) => {
      if (!filter.value) return true;
      const fieldValue = String(report[filter.field] ?? "").toLowerCase();
      return fieldValue.includes(filter.value.toLowerCase());
    });

    // ตรวจสอบสถานะการตรวจสอบ
    let passCheckedStatus = true;
    if (checkedStatusFilter === "checked") {
      passCheckedStatus = (report.checked || "").toString().startsWith("ตรวจสอบแล้ว");
    } else if (checkedStatusFilter === "unchecked") {
      passCheckedStatus = (report.checked || "").toString().includes("รอตรวจสอบ");
    }

    // AND / OR / NOT
    const passAND = filtersAND.every((filter) => {
      if (!filter.value) return true;
      return matchesCondition(report, filter);
    });

    const passOR = filtersOR.length === 0 || filtersOR.some((filter) => {
      if (!filter.value) return false;
      return matchesCondition(report, filter);
    });

    const passNOT = filtersNOT.every((filter) => {
      if (!filter.value) return true;
      return !matchesCondition(report, filter);
    });

    return passQuick && passAND && passOR && passNOT && passCheckedStatus && matchesDepartment;
  })
  .sort((a, b) => b.formCode - a.formCode);


const handleFilterChange = (mode, index, field, value) => {
    let updated;
    if (mode === "AND") {
        updated = [...filtersAND];
        updated[index][field] = value;
        setFiltersAND(updated);
    } else if (mode === "OR") {
        updated = [...filtersOR];
        updated[index][field] = value;
        setFiltersOR(updated);
    } else if (mode === "NOT") {
        updated = [...filtersNOT];
        updated[index][field] = value;
        setFiltersNOT(updated);
    }
};

const addFilter = (mode) => {
    const newFilter = { field: "formCode", value: "" };

    if (mode === "AND") {
        setFiltersAND([...filtersAND, newFilter]);
    } else if (mode === "OR") {
        setFiltersOR([...filtersOR, newFilter]);
    } else if (mode === "NOT") {
        setFiltersNOT([...filtersNOT, newFilter]);
    }
};

const removeFilter = (mode, index) => {
    let updated;
    if (mode === "AND") {
        updated = [...filtersAND];
        updated.splice(index, 1);
        setFiltersAND(updated);
    } else if (mode === "OR") {
        updated = [...filtersOR];
        updated.splice(index, 1);
        setFiltersOR(updated);
    } else if (mode === "NOT") {
        updated = [...filtersNOT];
        updated.splice(index, 1);
        setFiltersNOT(updated);
    }
};

const handleFilterChangeF = (index, key, value) => {

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


const exportToExcel = () => {
				const fileName = window.prompt("กรุณาตั้งชื่อไฟล์ (ไม่ต้องใส่นามสกุล):", "Reports") || "Reports";

    const data = filteredReports.map(report => ({
        "รหัสรายงาน": report.formCode,
        "ปีงบประมาณ": calculateFiscalYear(report.submitTime),
		"รหัสบัตรประชาชน": report.username,
        "ชื่อ-นามสกุล": `${report.title}${report.first_name} ${report.last_name}`,
		"ตำแหน่ง": `${report.position}${report.level}`,
		"สังกัด/กอง": report.department,
		"กลุ่ม/ฝ่าย": `${report.group_name} ${report.under_department1}`,
        "ชื่อหลักสูตร": report.courseName,
        "หน่วยงานที่จัด": report.trainingOrg,
        "วิธีการอบรม": report.trainingMethod,
        "สถานที่อบรม": report.hybridLocation,
        "วันที่เข้ารับการฝึกอบรม": formatDateBuddhist(report.startDate),
        "วันที่สิ้นสุดการฝึกอบรม": formatDateBuddhist(report.endDate),
        "ระยะเวลาการฝึกอบรม": report.period,
		"ค่าลงทะเบียน": report.regFeeAmount,
		"ค่าที่พัก": report.accommodationFeeAmount,
		"ค่าเดินทาง": report.transportationFeeAmount,
		"ค่าเบี้ยเลี้ยง": report.allowanceFeeAmount,
        "ค่าใช้จ่ายรวม": report.totalCost,
		"งบจากกรมประมง": report.internalBudget,
		"แผนงาน/โครงการ": report.planBudget,
		"งบจากหน่วยงานอื่น": report.externalBudget,
		"หน่วยงานที่สนับสนุนงบ": report.externalAgency,
		"พัฒนาตนเอง": report.knowledgeSelfDevelop,
		"พัฒนางาน": report.knowledgeWorkImprove,
		"ได้ความรู้": report.knowledgeTeamwork,
		"ประสิทธิผล": report.knowledgeEfficiency,
		"บูรณาการ": report.knowledgeNetworking,
    "ตรวจสอบ": report.checked?.includes("รอ")
        ? "รอตรวจสอบ"
        : report.checked?.includes("แล้ว")
        ? "ตรวจสอบแล้ว"
        : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};


const startIndex = (currentPage - 1) * rowsPerPage;
const currentReports = filteredReports.slice(startIndex, startIndex + rowsPerPage);
const totalPages = Math.ceil(filteredReports.length / rowsPerPage);

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1); // รีเซ็ตไปที่หน้าแรกเมื่อเปลี่ยนค่า
    };


    return (
<>

{isLoadingReports && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="text-white text-lg flex items-center gap-3">
      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      <span>กำลังโหลด...</span>
    </div>
  </div>
)}
            <Header />

        <div className="container mx-auto p-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-extrabold mb-6 text-center">Aroval Dashboard</h1>




<div className="mb-4 p-4 bg-white text-gray-800 rounded-lg shadow">
<div className="mb-4">
<br />
<div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4" >
    {filters.map((filter, index) => (
        <div key={index} className="flex items-center space-x-2" data-tour="search-bar">
            <select
                value={filter.field}
                onChange={(e) => handleFilterChangeF(index, "field", e.target.value)}
                className="border px-4 py-2 rounded"
            >
                <option value="formCode">รหัสรายงาน</option>
				<option value="username">ผู้ส่ง (รหัสบัตรประชาชน)</option>
				<option value="courseName">ชื่อหลักสูตร</option>
                <option value="trainingOrg">หน่วยงานที่จัด</option>
                <option value="trainingMethod">วิธีการอบรม</option>
                <option value="hybridLocation">สถานที่จัดฝึกอบรม</option>

            </select>
            <input
                type="text"
                value={filter.value}
                onChange={(e) => handleFilterChangeF(index, "value", e.target.value)}
                placeholder="ค้นหาด่วน..."
                className="border px-4 py-2 rounded flex-grow"
            />

        </div>
    ))}
</div>

<br />
        <div className="mb-4 border p-4 rounded shadow">
            <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-lg font-semibold text-left w-full focus:outline-none"
            >
                <span className="mr-2">{showFilters ? '▾' : '▸'}</span>
                🔍 ค้นหารายงาน (Advance)
            </button>

            {showFilters && (
                <div className="mt-4 space-y-8">

                    {/* ตัวกรองแบบ AND */}
                    <div>
                        <h4 className="font-semibold text-base mb-2">โหมดตัวกรอง AND (ทุกเงื่อนไขต้องตรง)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {filtersAND.map((filter, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <select
                                        value={filter.field}
                                        onChange={(e) =>
                                            handleFilterChange("AND", index, "field", e.target.value)
                                        }
                                        className="border px-4 py-2 rounded"
                                    >
  <optgroup label="ข้อมูลทั่วไป">
    <option value="formCode">รหัสรายงาน</option>
	<option value="username">ผู้ส่ง (เลขบัตรประชาชน)</option>
    <option value="courseName">ชื่อหลักสูตร</option>
  </optgroup>
  <optgroup label="ข้อมูลอบรม">

    <option value="trainingOrg">หน่วยงานที่จัด</option>
    <option value="trainingMethod">วิธีการอบรม</option>
    <option value="hybridLocation">สถานที่จัดฝึกอบรม</option>
    <option value="startDate">วันที่เข้ารับการฝึกอบรม</option>
    <option value="endDate">วันที่สิ้นสุดการฝึกอบรม</option>
	  </optgroup>
  <optgroup label="ที่มางบประมาณ">

    <option value="planBudget">แผนงาน/โครงการ</option>
    <option value="externalAgency">หน่วยงานที่สนับสนุนงบ</option>
	</optgroup>
	  <optgroup label="อื่นๆ">

    <option value="fiscalYear">ปีงบประมาณ</option>
    <option value="submitTime">วันที่ส่ง</option>
    <option value="editTime">วันที่แก้ไขล่าสุด</option>
  </optgroup>

  <optgroup label="ข้อมูลผู้ส่ง">
    <option value="full_name">ชื่อ-สกุล</option>
    <option value="type">ประเภท</option>
    <option value="full_position">ตำแหน่ง</option>
    <option value="department">สำนัก/กอง</option>
    <option value="group_name">กลุ่ม/ฝ่าย</option>
  </optgroup>

                                    </select>
                                    <input
                                        type="text"
                                        value={filter.value}
                                        onChange={(e) =>
                                            handleFilterChange("AND", index, "value", e.target.value)
                                        }
                                        placeholder="ค้นหา..."
                                        className="border px-4 py-2 rounded flex-grow"
                                    />
                                    <button
                                        onClick={() => removeFilter("AND", index)}
                                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => addFilter("AND")}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-4 rounded"
                        >
                            เพิ่มเงื่อนไข AND
                        </button>
                    </div>

                    {/* ตัวกรองแบบ OR */}
                    <div>
                        <h4 className="font-semibold text-base mb-2">โหมดตัวกรอง OR (เงื่อนไขใดเงื่อนไขหนึ่งตรง)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {filtersOR.map((filter, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <select
                                        value={filter.field}
                                        onChange={(e) =>
                                            handleFilterChange("OR", index, "field", e.target.value)
                                        }
                                        className="border px-4 py-2 rounded"
                                    >
                                          <optgroup label="ข้อมูลทั่วไป">
    <option value="formCode">รหัสรายงาน</option>
	<option value="username">ผู้ส่ง (เลขบัตรประชาชน)</option>
	<option value="courseName">ชื่อหลักสูตร</option>
  </optgroup>
  <optgroup label="ข้อมูลอบรม">
    
    <option value="trainingOrg">หน่วยงานที่จัด</option>
    <option value="trainingMethod">วิธีการอบรม</option>
    <option value="hybridLocation">สถานที่จัดฝึกอบรม</option>
    <option value="startDate">วันที่เข้ารับการฝึกอบรม</option>
    <option value="endDate">วันที่สิ้นสุดการฝึกอบรม</option>
	  </optgroup>
  <optgroup label="ที่มางบประมาณ">

    <option value="planBudget">แผนงาน/โครงการ</option>
    <option value="externalAgency">งบจากหน่วยงานอื่น</option>
	</optgroup>
	  <optgroup label="อื่นๆ">

    <option value="fiscalYear">ปีงบประมาณ</option>
    <option value="submitTime">วันที่ส่ง</option>
    <option value="editTime">วันที่แก้ไขล่าสุด</option>
  </optgroup>

  <optgroup label="ข้อมูลบุคลากร">
    <option value="full_name">ชื่อ-สกุล</option>
    <option value="type">ประเภท</option>
    <option value="full_position">ตำแหน่ง</option>
    <option value="department">สำนัก/กอง</option>
    <option value="group_name">กลุ่ม/ฝ่าย</option>
  </optgroup>

                                    </select>
                                    <input
                                        type="text"
                                        value={filter.value}
                                        onChange={(e) =>
                                            handleFilterChange("OR", index, "value", e.target.value)
                                        }
                                        placeholder="ค้นหา..."
                                        className="border px-4 py-2 rounded flex-grow"
                                    />
                                    <button
                                        onClick={() => removeFilter("OR", index)}
                                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => addFilter("OR")}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-4 rounded"
                        >
                            เพิ่มเงื่อนไข OR
                        </button>
                    </div>
					
					{/* ตัวกรองแบบ NOT */}
<div>
    <h4 className="font-semibold text-base mb-2">โหมดตัวกรอง NOT (ไม่ตรงตามเงื่อนไขที่กำหนด)</h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {filtersNOT.map((filter, index) => (
            <div key={index} className="flex items-center space-x-2">
                <select
                    value={filter.field}
                    onChange={(e) =>
                        handleFilterChange("NOT", index, "field", e.target.value)
                    }
                    className="border px-4 py-2 rounded"
                >
                    {/* ใส่ options ตามปกติ */}
                      <optgroup label="ข้อมูลทั่วไป">
    <option value="formCode">รหัสรายงาน</option>
	<option value="username">ผู้ส่ง (เลขบัตรประชาชน)</option>
	<option value="courseName">ชื่อหลักสูตร</option>
  </optgroup>
  <optgroup label="ข้อมูลอบรม">
    
    <option value="trainingOrg">หน่วยงานที่จัด</option>
    <option value="trainingMethod">วิธีการอบรม</option>
    <option value="hybridLocation">สถานที่จัดฝึกอบรม</option>
    <option value="startDate">วันที่เข้ารับการฝึกอบรม</option>
    <option value="endDate">วันที่สิ้นสุดการฝึกอบรม</option>
	  </optgroup>
  <optgroup label="ที่มางบประมาณ">

    <option value="planBudget">แผนงาน/โครงการ</option>
    <option value="externalAgency">งบจากหน่วยงานอื่น</option>
	</optgroup>
	  <optgroup label="อื่นๆ">

    <option value="fiscalYear">ปีงบประมาณ</option>
    <option value="submitTime">วันที่ส่ง</option>
    <option value="editTime">วันที่แก้ไขล่าสุด</option>
  </optgroup>

  <optgroup label="ข้อมูลบุคลากร">
    <option value="full_name">ชื่อ-สกุล</option>
    <option value="type">ประเภท</option>
    <option value="full_position">ตำแหน่ง</option>
    <option value="department">สำนัก/กอง</option>
    <option value="group_name">กลุ่ม/ฝ่าย</option>
  </optgroup>

                </select>
                <input
                    type="text"
                    value={filter.value}
                    onChange={(e) =>
                        handleFilterChange("NOT", index, "value", e.target.value)
                    }
                    placeholder="ค้นหา..."
                    className="border px-4 py-2 rounded flex-grow"
                />
                <button
                    onClick={() => removeFilter("NOT", index)}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded"
                >
                    ลบ
                </button>
            </div>
        ))}
    </div>
    <button
        onClick={() => addFilter("NOT")}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-4 rounded"
    >
        เพิ่มเงื่อนไข NOT
    </button>
</div>

					
                </div>
            )}
			
			


			
        </div>

			<div className="mb-4">
  <label className="font-semibold mr-2">สถานะการตรวจสอบ:</label>
  <select
    value={checkedStatusFilter}
    onChange={(e) => setCheckedStatusFilter(e.target.value)}
    className="border px-4 py-2 rounded"
  >
    <option value="all">แสดงทั้งหมด</option>
    <option value="checked">ตรวจสอบแล้ว</option>
    <option value="unchecked">รอตรวจสอบ</option>
  </select>
</div>


</div>
</div>
<div className="flex space-x-2">
    <button onClick={() => handleToggleTable(1)} className="bg-blue-500 text-white py-1 px-3 rounded">ข้อมูลอบรม</button>
    <button onClick={() => handleToggleTable(2)} className="bg-blue-500 text-white py-1 px-3 rounded">ค่าใช้จ่าย</button>
    <button onClick={() => handleToggleTable(3)} className="bg-blue-500 text-white py-1 px-3 rounded">ที่มางบประมาณ</button>
    <button onClick={() => handleToggleTable(4)} className="bg-blue-500 text-white py-1 px-3 rounded">เอกสารแนบ</button>
	    <button onClick={() => handleToggleTable(5)} className="bg-blue-500 text-white py-1 px-3 rounded">อื่นๆ</button>
	    <button onClick={() => handleToggleTable(6)} className="bg-blue-500 text-white py-1 px-3 rounded">ข้อมูลผู้ส่ง</button>

</div>

                {showTable === 1 && (  <div className="overflow-x-auto"> <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
    <thead className="bg-blue-800 text-white">
      <tr>
        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รหัสรายงาน</th>
		<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ผู้ส่ง</th>
        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>
        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">หน่วยงานที่จัด</th>
        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">วิธีการอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">สถานที่จัดฝึกอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">วันที่เข้ารับการฝึกอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">วันที่สิ้นสุดการฝึกอบรม</th>
		<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ระยะเวลาการฝึกอบรม</th>
        
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
        className="text-blue-600 underline flex items-center justify-center gap-2"
    >
        {report.formCode}
        <FontAwesomeIcon icon={faPrint} className="text-blue-600 hover:text-blue" />
    </a>
</td>

<td className="border px-4 py-2 text-center">

    {report.id ? (
        <a
            href={`/user-details/${report.user_id}`} // ใช้ user.id ที่ถูกต้อง
            className="text-blue-600 underline flex items-center justify-center gap-2"
        >
{report.username}
<FontAwesomeIcon icon={faEye} className="text-blue-600 hover:text-blue" />

        </a>
    ) : (
        "N/A"
    )}
</td>


            <td className="border px-4 py-2 text-center">{report.courseName}</td>
            <td className="border px-4 py-2 text-center">{report.trainingOrg}</td>
            <td className="border px-4 py-2 text-center">{report.trainingMethod}</td>
            <td className="border px-4 py-2 text-center">{report.hybridLocation || "N/A"}</td>
            <td className="border px-4 py-2 text-center">{formatDateBuddhist(report.startDate)}</td>
            <td className="border px-4 py-2 text-center">{formatDateBuddhist(report.endDate)}</td>
			<td className="border px-4 py-2 text-center">{report.period}</td>




                        </tr>
                    ))}
                </tbody>
            </table> </div>

)}

{showTable === 2 && (
    <div className="overflow-x-auto"> <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
        <thead>
            <tr className="bg-blue-800 text-white">
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รหัสรายงาน</th>
	        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ผู้ส่ง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าลงทะเบียน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าที่พัก</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าเดินทาง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าเบี้ยเลี้ยง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รวมค่าใช้จ่าย</th>
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
                className="text-blue-600 underline flex items-center justify-center gap-2"
            >
                {report.formCode}
				        <FontAwesomeIcon icon={faPrint} className="text-blue-600 hover:text-blue" />

            </a>
        </td>
		<td className="border px-4 py-2 text-center">

    {report.id ? (
        <a
            href={`/user-details/${report.user_id}`} // ใช้ user.id ที่ถูกต้อง
            className="text-blue-600 underline flex items-center justify-center gap-2"
        >
{report.username}
<FontAwesomeIcon icon={faEye} className="text-blue-600 hover:text-blue" />

        </a>
    ) : (
        "N/A"
    )}
</td>

            <td className="border px-4 py-2 text-center">{report.courseName}</td>
                    <td className="border px-4 py-2 text-center">{report.regFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.accommodationFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.transportationFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.allowanceFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.totalCost || "N/A"}</td>




</tr>
            ))}

    <tr className="bg-gray-300">

        <td colSpan="7" className="border px-4 py-2 font-bold text-right">จำนวนเงินทั้งสิ้น:</td>
        <td className="border px-4 py-2 font-bold text-center">{calculateTotalCost()}</td> 
	<td></td>
	<td></td>


    </tr>
        </tbody>
    </table> </div>
)}

{showTable === 3 && (
    <div className="overflow-x-auto"> <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
        <thead>
            <tr className="bg-blue-800 text-white">
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รหัสรายงาน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ผู้ส่ง</th>
	        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">งบจากกรมประมง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">แผนงาน/โครงการ</th>
				<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">งบจากหน่วยงานอื่น</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">หน่วยงานที่สนับสนุนงบ</th>

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
                className="text-blue-600 underline flex items-center justify-center gap-2"
            >
                {report.formCode}
				        <FontAwesomeIcon icon={faPrint} className="text-blue-600 hover:text-blue" />

            </a>
        </td>
        <td className="border px-4 py-2 text-center">

    {report.id ? (
        <a
            href={`/user-details/${report.user_id}`} // ใช้ user.id ที่ถูกต้อง
            className="text-blue-600 underline flex items-center justify-center gap-2"
        >
{report.username}
<FontAwesomeIcon icon={faEye} className="text-blue-600 hover:text-blue" />

        </a>
    ) : (
        "N/A"
    )}
</td>

            <td className="border px-4 py-2 text-center">{report.courseName}</td>
                    <td className="border px-4 py-2 text-center">{report.internalBudget || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.planBudget || "N/A"}</td>
					<td className="border px-4 py-2 text-center">{report.externalBudget || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.externalAgency || "N/A"}</td>


                </tr>
            ))}
        </tbody>
    </table> </div>
)}

{showTable === 4 && (
    <div className="overflow-x-auto"> <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
        <thead>
            <tr className="bg-blue-800 text-white">
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รหัสรายงาน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ผู้ส่ง</th>
	        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>

                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">พัฒนาตนเอง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">พัฒนางาน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ได้ความรู้</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ประสิทธิผล</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">บูรณาการ</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">อนุมัติตัวบุคคล</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">โครงการฝึกอบรม</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ประกาศนียบัตร</th>

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
                className="text-blue-600 underline flex items-center justify-center gap-2"
            >
                {report.formCode}
				        <FontAwesomeIcon icon={faPrint} className="text-blue-600 hover:text-blue" />

            </a>
        </td>
        <td className="border px-4 py-2 text-center">

    {report.id ? (
        <a
            href={`/user-details/${report.user_id}`} // ใช้ user.id ที่ถูกต้อง
            className="text-blue-600 underline flex items-center justify-center gap-2"
        >
{report.username}
<FontAwesomeIcon icon={faEye} className="text-blue-600 hover:text-blue" />

        </a>
    ) : (
        "N/A"
    )}
</td>
            <td className="border px-4 py-2 text-center">{report.courseName}</td>

                    <td className="border px-4 py-2 text-center">{report.knowledgeSelfDevelop}</td>
                    <td className="border px-4 py-2 text-center">{report.knowledgeWorkImprove}</td>
                    <td className="border px-4 py-2 text-center">{report.knowledgeTeamwork}</td>
                    <td className="border px-4 py-2 text-center">{report.knowledgeEfficiency}</td>
                    <td className="border px-4 py-2 text-center">{report.knowledgeNetworking}</td>
					
			
					
					           <td className="border px-4 py-2 text-center">
                {report.approval_document ? (
                    <a
                        href={report.approval_document}
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
           <td className="border px-4 py-2 text-center">
                {report.training_project_document ? (
                    <a
                        href={report.training_project_document}
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






                </tr>
            ))}
        </tbody>
    </table> </div>
)}

{showTable === 5 && (
    <div className="overflow-x-auto"> <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
        <thead>
            <tr className="bg-blue-800 text-white">
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รหัสรายงาน</th>
				                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ผู้ส่ง</th>

	        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>

        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ปีงบประมาณ</th>
				<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">วันที่ส่ง</th>
				<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">วันที่แก้ไขล่าสุด</th> 
				<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ผู้ที่แก้ไขล่าสุด</th> 
				        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ตรวจสอบ</th>

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
        className="text-blue-600 underline flex items-center justify-center gap-2"
    >
        {report.formCode}
        <FontAwesomeIcon icon={faPrint} className="text-blue-600 hover:text-blue" />
    </a>
</td>
        <td className="border px-4 py-2 text-center">

    {report.id ? (
        <a
            href={`/user-details/${report.user_id}`} // ใช้ user.id ที่ถูกต้อง
            className="text-blue-600 underline flex items-center justify-center gap-2"
        >
{report.username}
<FontAwesomeIcon icon={faEye} className="text-blue-600 hover:text-blue" />

        </a>
    ) : (
        "N/A"
    )}
</td>

            <td className="border px-4 py-2 text-center">{report.courseName}</td>

            <td className="border px-4 py-2 text-center">{calculateFiscalYear(report.startDate)}</td>

			
			
            <td className="border px-4 py-2 text-center">{formatDateBuddhist(report.submitTime)}</td>
            <td className="border px-4 py-2 text-center">  {report.editTime ? formatDateBuddhist(report.editTime) : "N/A"}</td>
			<td className="border px-4 py-2 text-center">  {report.whoEdit ? report.whoEdit : "N/A"}</td>
<td className="border px-4 py-2 text-center">
  {report.checked?.includes("รอ") ? (
    <span className="font-bold text-red-600">รอตรวจสอบ</span>
  ) : report.checked?.includes("แล้ว") ? (
    <span className="font-bold text-green-600">ตรวจสอบแล้ว</span>
  ) : (
    "N/A"
  )}
</td>




                </tr>
            ))}
        </tbody>
    </table> </div>
)}


{showTable === 6 && (
            <div className="overflow-x-auto"> <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
                <thead>
                    <tr className="bg-green-800 text-white">
					                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รหัสรายงาน</th>
                        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">เลขบัตรประจำตัวประชาชน</th>
                        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อ-สกุล</th>
						<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ประเภท</th>
                        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ตำแหน่ง</th>
                        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">สังกัด/กอง</th>
                        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">กลุ่ม/ฝ่าย</th>

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
                className="text-blue-600 underline flex items-center justify-center gap-2"
            >
                {report.formCode}
				        <FontAwesomeIcon icon={faPrint} className="text-blue-600 hover:text-blue" />

            </a>
        </td>
<td className="border px-4 py-2 text-center">

    {report.id ? (
        <a
            href={`/user-details/${report.user_id}`} // ใช้ report.id ที่ถูกต้อง
            className="text-blue-600 underline flex items-center justify-center gap-2"
        >
{report.username}
<FontAwesomeIcon icon={faEye} className="text-blue-600 hover:text-blue" />

        </a>
    ) : (
        "N/A"
    )}
</td>


            <td className="border px-4 py-2 text-center">
                {report.title} {report.first_name} {report.last_name}
            </td>
			<td className="border px-4 py-2 text-center">{report.type}</td>
            <td className="border px-4 py-2 text-center">
                {report.position}{report.level}
            </td>
            <td className="border px-4 py-2 text-center">{report.department}</td>
            <td className="border px-4 py-2 text-center">{report.group_name} {report.under_department1}</td>


        </tr>
    ))}
</tbody>

            </table> </div>
)}




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

<div className="mt-4 space-y-4">
    {/* Dropdown เลือกจำนวนแถวต่อหน้า */}
    <div className="flex flex-col items-start">
        <label htmlFor="rowsPerPage" className="text-white font-semibold mb-1">
            แสดงแถวต่อหน้า:
        </label>
        <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border rounded px-3 py-2 text-black"
        >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
        </select>
    </div>



</div>


<button
    onClick={exportToExcel}
    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded mt-4"
>
    Export to Excel
</button>

<Footer />


        </div>
    </>
    );
}
