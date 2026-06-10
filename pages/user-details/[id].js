import '../styles.css';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from "next/router";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';
import { faEnvelope, faPhone, faMapMarkerAlt, faBook, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

export default function UserDetails() {
    const [userDetails, setUserDetails] = useState(null);
	    const [checkerDetails, setCheckerDetails] = useState(null);

    const [reports, setReports] = useState([]);
    const [filters, setFilters] = useState([{ field: 'id', value: '' }]);
    const [showTable, setShowTable] = useState(1);
    const router = useRouter();
    const { id } = router.query;
    const [loading, setLoading] = useState(true);
	    const [username, setUsername] = useState('');


const [currentPage, setCurrentPage] = useState(1); // หน้าปัจจุบัน
    const [rowsPerPage, setRowsPerPage] = useState(25); // จำนวนแถวต่อหน้า (ค่าเริ่มต้น)
const [storedStatus, setStoredStatus] = useState(null);
	const [filterMode, setFilterMode] = useState("AND"); // ค่าตั้งต้นเป็น AND
	
		    const [showFilters, setShowFilters] = useState(false); // state ควบคุมการแสดง
		    const [filtersAND, setFiltersAND] = useState([]);
    const [filtersOR, setFiltersOR] = useState([]);
	
	const [filtersNOT, setFiltersNOT] = useState([]);

    const [checkedStatusFilter, setCheckedStatusFilter] = useState("all"); // all, checked, unchecked


  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          router.push("/signin");
          return;
        }

        const data = await res.json();
        setUsername(data.username);
        // setStatus(data.status); // ถ้าต้องใช้ status ด้วย
      } catch (error) {
        console.error("Session check failed:", error);
        router.push("/signin");
      }
    };

    checkSession();
  }, []);
  


    useEffect(() => {
        if (username) {
            fetchCheckerDetails(); 
        }
    }, [username]);



    const fetchCheckerDetails = async () => {
        try {

        const response = await axios.get(`/api/users?username=${username}`);
        
            setCheckerDetails(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };


  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) {
          console.warn('Session not found, redirecting...');
          router.push('/signin');
          return;
        }

        const data = await res.json();
        console.log('Stored Status:', data.status);
        setStoredStatus(data.status);
      } catch (err) {
        console.error('Error fetching session:', err);
        router.push('/signin');
      }
    };

    fetchSession();
  }, []);


useEffect(() => {
    console.log('storedStatus:', storedStatus);
    console.log('checkerDetails:', checkerDetails);
    console.log('userDetails:', userDetails);

    // ถ้ายังโหลดไม่ครบ อย่าทำอะไร
    if (!storedStatus || !checkerDetails || !userDetails) {
        return;
    }

    if (storedStatus === 'admin' || storedStatus === 'superadmin' || storedStatus === 'checker') {
        return;
    }

    if (storedStatus === 'approver') {
        if (checkerDetails.department !== userDetails.department) {
            console.log('Approver ไม่ใช่หน่วยงานเดียวกัน, redirecting to index page');
            router.push('/');
        }
        return;
    }

    if (storedStatus === 'approver2') {
        const checkerGroup = String(checkerDetails.group_name || '').trim();
        const userGroup = String(userDetails.group_name || '').trim();
        if (checkerGroup !== userGroup) {
            console.log('Approver2 ไม่ใช่กลุ่มเดียวกัน, redirecting to index page', checkerGroup, userGroup);
            router.push('/');
        }
        return;
    }

    console.log('User is not authorized, redirecting to index page');
    router.push('/');
}, [storedStatus, router, checkerDetails, userDetails]);

	


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/users/${id}?includeReports=true`);
                setUserDetails(response.data);
                setReports(response.data.trainingReports || []); // ถ้ามี trainingReports ให้เก็บไว้ใน state
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('ไม่สามารถโหลดข้อมูลได้');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);


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

    // ฟังก์ชันช่วยคำนวณปีงบประมาณ
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

  const { reportId } = router.query;


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
	
	
function matchesCondition(report, filter) {
    if (filter.field === "fiscalYear") {
        const fiscalYear = calculateFiscalYear(report.submitTime);
        return fiscalYear.toString().includes(filter.value);
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
        // กรองจาก reportId หากมีใน query
        if (reportId) {
            return report.id.toString() === reportId;
        }

        // ค้นหาด่วน (Quick search) จาก filters
        const passQuick = filters.every((filter) => {
            if (!filter.value) return true;
            const fieldValue = String(report[filter.field] ?? "").toLowerCase();
            return fieldValue.includes(filter.value.toLowerCase());
        });

        // กรองตามสถานะตรวจสอบ
        let passCheckedStatus = true;
        if (checkedStatusFilter === "checked") {
          passCheckedStatus = (report.checked || "").toString().startsWith("ตรวจสอบแล้ว");
        } else if (checkedStatusFilter === "unchecked") {
          passCheckedStatus = (report.checked || "").toString().includes("รอตรวจสอบ");
        }

        // เงื่อนไข AND
        const passAND = filtersAND.every((filter) => {
            if (!filter.value) return true;
            return matchesCondition(report, filter);
        });

        // เงื่อนไข OR
        const passOR = filtersOR.length === 0 || filtersOR.some((filter) => {
            if (!filter.value) return false;
            return matchesCondition(report, filter);
        });

        // เงื่อนไข NOT
        const passNOT = filtersNOT.every((filter) => {
            if (!filter.value) return true;
            return !matchesCondition(report, filter);
        });

        // รวมทุกเงื่อนไข
        return passQuick && passCheckedStatus && passAND && passOR && passNOT;
    })
    .sort((a, b) => b.formCode - a.formCode);




if (loading) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="flex flex-col items-center space-y-4">
        {/* spinner */}
        <svg
          className="animate-spin h-10 w-10 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <p className="text-white text-lg">กำลังโหลด...</p>
      </div>
    </div>
  );
}

const handleToggleTable = (tableNumber) => {
    setShowTable(tableNumber); // แสดงตารางตามหมายเลขที่เลือก
};

const calculateTotalCost = () => {
    return currentReports.reduce((total, report) => total + (Number(report.totalCost) || 0), 0);

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
    router.push(`/editt?id=${id}`);
  }, 500); // รอ 500ms ก่อนเปลี่ยนหน้า
};

	
	const exportToExcel = () => {
		const fileName = window.prompt("กรุณาตั้งชื่อไฟล์ (ไม่ต้องใส่นามสกุล):", "Reports") || "Reports";

    const data = filteredReports.map(report => ({
        "รหัสรายงาน": report.formCode,
        "ปีงบประมาณ": calculateFiscalYear(report.submitTime),
        "รหัสบัตรประชาชน": userDetails.username,
        "ชื่อ-นามสกุล": `${userDetails.title}${userDetails.first_name} ${userDetails.last_name}`,
        "ตำแหน่ง": `${userDetails.position}${userDetails.level}`,
        "สังกัด/กอง": userDetails.department,
        "กลุ่ม/ฝ่าย": `${userDetails.group_name} ${userDetails.under_department1}`,
        "ชื่อหลักสูตร": report.courseName,
        "หน่วยงานที่จัด": report.trainingOrg,
        "วิธีการอบรม": report.trainingMethod,
        "สถานที่อบรม": report.hybridLocation,
        "วันที่เข้ารับการฝึกอบรม": formatDateBuddhist(report.startDate),
        "วันที่สิ้นสุดการฝึกอบรม": formatDateBuddhist(report.endDate),
        "ระยะเวลาการฝึกอบรม": report.period
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
	
	
	const handleFilterChangeF = (index, key, value) => {

        const newFilters = [...filters];
        newFilters[index][key] = value;
        setFilters(newFilters);
    };
	
	
	
	
	
	
	
    return (
<>
            <Header />

    <ToastContainer />



<div className="container mx-auto p-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-lg">
    <h1 className="text-2xl font-bold mb-4 text-center">Training Reports for {userDetails.username}</h1>




    {/* User Details Section */}
    {userDetails && (
<div className="mb-4 p-4 bg-white text-gray-800 rounded-lg shadow">
    <h2 className="text-lg font-semibold mb-3">เลขบัตรประจำตัวประชาชน:  {userDetails.username || "N/A"}</h2>
    <div className="grid grid-cols-3 gap-4 text-sm">
        <div><strong>ชื่อ-สกุล:</strong> {userDetails.title} {userDetails.first_name} {userDetails.last_name}</div>
	    <div><strong>ประเภท:</strong> {userDetails.type || "N/A"}</div>
        <div><strong>ตำแหน่ง/ระดับ:</strong> {userDetails.position || "N/A"}{userDetails.level || ""}</div>
        <div><strong>สังกัด/กอง:</strong> {userDetails.department || "N/A"}</div>
        <div><strong>กลุ่ม/ฝ่าย:</strong> {userDetails.group_name || "N/A"} {userDetails.under_department1 || ""}</div>
    </div>


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

        <div className="mb-4 border p-4 rounded shadow">
            <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-lg font-semibold text-left w-full focus:outline-none"
            >
                <span className="mr-2">{showFilters ? '▾' : '▸'}</span>
                🔍 ค้นหารายงาน
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
    <option value="externalAgency">หน่วยงานสนับสนุนงบ</option>
	</optgroup>
	  <optgroup label="อื่นๆ">

    <option value="fiscalYear">ปีงบประมาณ</option>
    <option value="submitTime">วันที่ส่ง</option>
    <option value="editTime">วันที่แก้ไขล่าสุด</option>
    <option value="checked">ตรวจสอบ</option>
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
    <option value="checked">ตรวจสอบ</option>
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
    <option value="checked">ตรวจสอบ</option>
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


    )}
	
	<div className="flex space-x-2">
    <button onClick={() => handleToggleTable(1)} className="bg-blue-500 text-white py-1 px-3 rounded">ข้อมุลอบรม</button>
    <button onClick={() => handleToggleTable(2)} className="bg-blue-500 text-white py-1 px-3 rounded">ค่าใช้จ่าย</button>
    <button onClick={() => handleToggleTable(3)} className="bg-blue-500 text-white py-1 px-3 rounded">ที่มางบประมาณ</button>
	<button onClick={() => handleToggleTable(4)} className="bg-blue-500 text-white py-1 px-3 rounded">เอกสารแนบ</button>
	<button onClick={() => handleToggleTable(5)} className="bg-blue-500 text-white py-1 px-3 rounded">อื่นๆ</button>
	</div>
  {showTable === 1 && (
    <div className="overflow-x-auto"> <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
<thead>
    <tr className="bg-blue-800 text-white">
        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รหัสรายงาน</th>
        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>
        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">หน่วยงานที่จัด</th>
        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">วิธีการอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">สถานที่จัดฝึกอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">วันที่เข้ารับการฝึกอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">วันที่สิ้นสุดการฝึกอบรม</th>
		<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ระยะเวลาการฝึกอบรม</th>

        {(storedStatus === 'adminx' || storedStatus === 'superadminx')&& (<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>)}
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
            <td className="border px-4 py-2 text-center">{report.courseName}</td>
            <td className="border px-4 py-2 text-center">{report.trainingOrg}</td>
            <td className="border px-4 py-2 text-center">{report.trainingMethod}</td>
            <td className="border px-4 py-2 text-center">{report.hybridLocation || "N/A"}</td>
            <td className="border px-4 py-2 text-center">{formatDateBuddhist(report.startDate)}</td>
            <td className="border px-4 py-2 text-center">{formatDateBuddhist(report.endDate)}</td>
			<td className="border px-4 py-2 text-center">{report.period}</td>

          {(storedStatus === 'adminx' || storedStatus === 'superadminx')&& (
            <td className="border px-4 py-2 text-center">
              <button
                onClick={() => redirectToEditForm(report.id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"
              >
                แก้ไข
              </button>
            </td>
          )}


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
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าลงทะเบียน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าที่พัก</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าเดินทาง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าเบี้ยเลี้ยง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รวมค่าใช้จ่าย</th>
        {(storedStatus === 'adminx' || storedStatus === 'superadminx')&& (<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>)}
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
            <td className="border px-4 py-2 text-center">{report.courseName}</td>
                    <td className="border px-4 py-2 text-center">{report.regFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.accommodationFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.transportationFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.allowanceFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.totalCost || "N/A"}</td>


          {(storedStatus === 'adminx' || storedStatus === 'superadminx')&& (
            <td className="border px-4 py-2 text-center">
              <button
                onClick={() => redirectToEditForm(report.id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"
              >
                แก้ไข
              </button>
            </td>
          )}

                </tr>
            ))}

    <tr className="bg-gray-300">
        <td colSpan="6" className="border px-4 py-2 font-bold text-right">จำนวนเงินทั้งสิ้น:</td>
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
	        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">งบจากกรมประมง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">แผนงาน/โครงการ</th>
				<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">งบจากหน่วยงานอื่น</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">หน่วยงานสนับสนุนงบ</th>

        {(storedStatus === 'adminx' || storedStatus === 'superadminx')&& (<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>)}
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
            <td className="border px-4 py-2 text-center">{report.courseName}</td>
                    <td className="border px-4 py-2 text-center">{report.internalBudget || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.planBudget || "N/A"}</td>
					<td className="border px-4 py-2 text-center">{report.externalBudget || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.externalAgency || "N/A"}</td>


          {(storedStatus === 'adminx' || storedStatus === 'superadminx')&& (
            <td className="border px-4 py-2 text-center">
              <button
                onClick={() => redirectToEditForm(report.id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"
              >
                แก้ไข
              </button>
            </td>
          )}

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
	        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>

                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">พัฒนาตนเอง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">พัฒนางาน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ได้ความรู้</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ประสิทธิผล</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">บูรณาการ</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">อนุมัติตัวบุคคล</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">โครงการฝึกอบรม</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ประกาศนียบัตร</th>
        {(storedStatus === 'adminx' || storedStatus === 'superadminx')&& (<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>)}
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
			
			

          {(storedStatus === 'adminx' || storedStatus === 'superadminx')&& (
            <td className="border px-4 py-2 text-center">
              <button
                onClick={() => redirectToEditForm(report.id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"
              >
                แก้ไข
              </button>
            </td>
          )}

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
	        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>

        <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ปีงบประมาณ</th>
				<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">วันที่ส่ง</th>
				<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">วันที่แก้ไขล่าสุด</th> 
				<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ผู้ที่แก้ไขล่าสุด</th> 
								        {['approver', 'approver2', 'checker'].includes(storedStatus) && <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ตรวจสอบ</th>}

        {(storedStatus === 'adminx' || storedStatus === 'superadminx')&& (<th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>)}
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
            <td className="border px-4 py-2 text-center">{report.courseName}</td>

            <td className="border px-4 py-2 text-center">{calculateFiscalYear(report.startDate)}</td>

			
			
            <td className="border px-4 py-2 text-center">{formatDateBuddhist(report.submitTime)}</td>
            <td className="border px-4 py-2 text-center">  {report.editTime ? formatDateBuddhist(report.editTime) : "N/A"}</td>
			<td className="border px-4 py-2 text-center">  {report.whoEdit ? report.whoEdit : "N/A"}</td>
			{['approver', 'approver2', 'checker'].includes(storedStatus) && <td className="border px-4 py-2 text-center">
  {report.checked?.includes("รอ") ? (
    <span className="font-bold text-red-600">รอตรวจสอบ</span>
  ) : report.checked?.includes("แล้ว") ? (
    <span className="font-bold text-green-600">ตรวจสอบแล้ว</span>
  ) : (
    "N/A"
  )}
			</td>		}


          {(storedStatus === 'adminx' || storedStatus === 'superadminx')&& (
            <td className="border px-4 py-2 text-center">
              <button
                onClick={() => redirectToEditForm(report.id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"
              >
                แก้ไข
              </button>
            </td>
          )}

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
