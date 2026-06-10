import './styles.css';

import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from "next/router";
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnnouncementCarousel from '../components/AnnouncementCarousel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope, faPhone, faMapMarkerAlt, faBook, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

import * as XLSX from 'xlsx';
import { TourProvider, useTour, Tour } from '@reactour/tour'



const steps = [
  {
    selector: '[data-tour="add-form-button"]',
    content: (
      <div className="text-left text-gray-900">
        <h2 className="text-xl font-bold text-green-600 mb-2">📌 ขั้นตอนที่ 1</h2>
        <p>
          กดที่ปุ่ม{" "}
          <span className="bg-green-500 px-2 py-1 rounded text-white font-semibold">
            เพิ่มแบบ กบค.1
          </span>{" "}
          เพื่อเริ่มกรอกแบบฟอร์มรายงานฝึกอบรมของคุณ
        </p>
      </div>
    ),
    style: {
      padding: '20px',
      borderRadius: '1rem',
      border: '2px solid #22c55e',
      maxWidth: '400px',
    },
  },
  {
    selector: '[data-tour="main-container"]',
    content: (
      <div className="text-left text-gray-900">
        <h2 className="text-xl font-bold text-yellow-600 mb-2">📊 ขั้นตอนที่ 2</h2>
        <p>
          เมื่อคุณกรอกแบบฟอร์มแล้ว ข้อมูลจะมาแสดงใน{" "}
          <span className="font-semibold text-blue-600">ตารางรายงานผล</span>{" "}
          ด้านล่างนี้
        </p>
      </div>
    ),
    style: {
      padding: '20px',
      borderRadius: '1rem',
      border: '2px solid #facc15',
      maxWidth: '400px',
    },
  },
  {
    selector: '[data-tour="search-bar"]',
    content: (
      <div className="text-left text-gray-900">
        <h2 className="text-xl font-bold text-indigo-600 mb-2">🔍 ขั้นตอนที่ 3</h2>
        <p>
          คุณสามารถค้นหารายงานที่กรอกไว้แล้วได้จาก{" "}
          <span className="font-semibold text-indigo-800">ช่องค้นหานี้</span> เพื่อดูย้อนหลังหรือแก้ไขข้อมูล
        </p>
      </div>
    ),
    style: {
      padding: '20px',
      borderRadius: '1rem',
      border: '2px solid #6366f1', // indigo-500
      maxWidth: '400px',
    },
  },
  {
    selector: '[data-tour="help-section"]',
    content: (
      <div className="text-left text-gray-900">
        <h2 className="text-xl font-bold text-rose-600 mb-2">📘 ขั้นตอนที่ 4</h2>
        <p>
          หากมีข้อสงสัยเพิ่มเติม กรุณา{" "}
          <span className="text-rose-800 font-semibold underline">ศึกษาคู่มือการใช้งาน</span>{" "}
          ที่เราจัดเตรียมไว้ให้
        </p>
      </div>
    ),
    style: {
      padding: '20px',
      borderRadius: '1rem',
      border: '2px solid #f43f5e', // rose-500
      maxWidth: '400px',
    },
  },
];


export default function DirectReportPage() {
  return (
    <TourProvider steps={steps}>
      <DirectReport />
    </TourProvider>
  );
}





function DirectReport() {
  const [reports, setReports] = useState([]);
  const [username, setUsername] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [showTable, setShowTable] = useState(1); // สถานะสำหรับแสดงตาราง (1: ตารางหลัก, 2: ตารางที่สอง)
  const router = useRouter();
  const [filters, setFilters] = useState([
    { field: "formCode", value: "" },
  ]);


  const [currentPage, setCurrentPage] = useState(1); // หน้าปัจจุบัน
  const [rowsPerPage, setRowsPerPage] = useState(25); // จำนวนแถวต่อหน้า (ค่าเริ่มต้น)

  const [filterMode, setFilterMode] = useState("AND"); // ค่าตั้งต้นเป็น AND
  const [showFilters, setShowFilters] = useState(false); // state ควบคุมการแสดง
  const [filtersAND, setFiltersAND] = useState([]);
  const [filtersOR, setFiltersOR] = useState([]);

  const [filtersNOT, setFiltersNOT] = useState([]);


  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const { isOpen, setIsOpen } = useTour();
  const [isClient, setIsClient] = useState(false)
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselItems, setCarouselItems] = useState([]);
  const [hasSeenTourState, setHasSeenTourState] = useState(null);

  useEffect(() => {
    setIsClient(true);
    // Fetch carousel images from backend
    const fetchCarouselImages = async () => {
      try {
        const response = await fetch('/api/carousel-images');
        const data = await response.json();
        // Allow the user to just put files, and we play them!
        if (data && data.length > 0) {
          setCarouselItems(data);
          setShowCarousel(true);
        }
      } catch (e) {
        console.error("Failed to load carousel images", e);
      }
    };
    fetchCarouselImages();
  }, [])


  useEffect(() => {
    const fetchUserAndCheckTour = async () => {
      try {
        const response = await axios.get('/api/auth/session', { withCredentials: true });
        const { username, status, name, is_user_mode } = response.data;

        if (username && status) {
          setUsername(username);
          setStatus(status);
          setName(name);
          setIsUserMode(Boolean(is_user_mode));
          setUserDetails({ username, status, name });

          // 🔍 ตรวจสอบ tour
          try {
            const res = await fetch(`/api/user?username=${username}`);
            const data = await res.json();
            console.log("📦 ข้อมูลจาก /api/user:", data);
            
            // Set the state directly from the API response
            setHasSeenTourState(Number(data.hasSeenTour));

            if (data.isFirstLogin || Number(data.hasSeenTour) === 0) {
              console.log("🎯 ผู้ใช้ล็อกอินครั้งแรก → เปิด Tour");
              setIsOpen(true);
            }
          } catch (err) {
            console.error("❌ ดึงข้อมูล tour ล้มเหลว:", err);
            setHasSeenTourState(1); // Default to 1 to show UI safely
          }
        } else {
          router.push('/signin');
        }
      } catch (error) {
        console.warn("Session หมดอายุหรือยังไม่ login:", error);
        router.push('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndCheckTour();
  }, []);

  const handleClose = async () => {
    setIsOpen(false)
    try {
      const response = await fetch('/api/user/markAsSeen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      console.log("📩 ส่ง markAsSeen สำเร็จ:", data);
    } catch (error) {
      console.error("❌ ส่ง markAsSeen ล้มเหลว:", error);
    }
  }





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

  const addFilter = (mode) => {
    const newFilter = { field: "courseName", value: "" };

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



  const filteredReports = reports.filter((report) =>
    filters.every((filter) => {
      if (!filter.value) return true; // ข้ามเงื่อนไขที่ไม่มีค่าค้นหา

      if (filter.field === "fiscalYear") {
        const fiscalYear = calculateFiscalYear(report.startDate);
        return fiscalYear.toString().includes(filter.value);
      }

      const fieldValue = report[filter.field]?.toString().toLowerCase();
      return fieldValue?.includes(filter.value.toLowerCase());
    })
  );





  const fetchReports = async () => {
    setIsLoadingReports(true); // เริ่มแสดง overlay

    try {
      const response = await axios.get('/api/reports');
      const filteredReports = response.data
        .filter((report) => report.username === username)
        .sort((a, b) => b.formCode - a.formCode);
      setReports(filteredReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoadingReports(false); // ซ่อน overlay เมื่อเสร็จ
    }
  };


  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`/api/users?username=${username}`);
      console.log("User data:", response.data);
      setUserDetails(response.data); // ตรวจสอบว่า response.data มี is_user_mode ด้วย
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
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

  const exportToExcel = () => {
    const fileName = window.prompt("กรุณาตั้งชื่อไฟล์ (ไม่ต้องใส่นามสกุล):", "Reports") || "Reports";

    const data = filteredReports.map(report => ({
      "รหัสรายงาน": report.formCode,
      "ปีงบประมาณ": calculateFiscalYear(report.startDate),
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



  const [status, setStatus] = useState(null);
  const [isUserMode, setIsUserMode] = useState(null);
  const [name, setName] = useState('');




  return (




    <>



      <Header />
      {showCarousel && hasSeenTourState !== null && hasSeenTourState !== 0 && !isOpen && (
        <AnnouncementCarousel 
          items={carouselItems} 
          onClose={() => setShowCarousel(false)} 
        />
      )}
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





      <ToastContainer />



      <div className="container mx-auto p-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Training Reports for {username}</h1>




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
            <div className="flex justify-end mt-6 space-x-4">



              {/* superadmin และ admin ในโหมดผู้ดูแล */}
              {(status === 'superadmin' || status === 'admin') && !isUserMode && (
                <>

                  <button
                    onClick={() => window.location.href = '/support-list'}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg text-md md:text-lg transition-all duration-200 hover:scale-105 hover:animate-glow-rgb"
                  >
                    รายการคำร้อง
                  </button>

                  <button
                    onClick={() => window.location.href = '/form2'}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg text-md md:text-lg transition-all duration-200 hover:scale-105 hover:animate-glow-rgb"
                  >
                    กบค.2
                  </button>




                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg text-md md:text-lg transition-all duration-200 hover:scale-105 hover:animate-glow-rgb"
                  >
                    แดชบอร์ด
                  </button>

                  <button
                    onClick={() => window.location.href = '/users'}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg text-md md:text-lg transition-all duration-200 hover:scale-105 hover:animate-glow-rgb"
                  >
                    จัดการผู้ใช้
                  </button>

                  <button
                    onClick={() => window.location.href = '/reports'}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-md md:text-lg transition-all duration-200 hover:scale-105 hover:animate-glow-rgb"
                  >
                    เช็ครายงานทั้งหมด
                  </button>



                </>
              )}

              {/* approver ในโหมดผู้ดูแล */}


              {(['approver', 'approver2', 'checker'].includes(status)) && !isUserMode && (
                <>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg text-md md:text-lg transition-all duration-200 hover:scale-105 hover:animate-glow-rgb"
                  >
                    แดชบอร์ด
                  </button>

                  <button
                    onClick={() => window.location.href = '/users'}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg text-md md:text-lg transition-all duration-200 hover:scale-105 hover:animate-glow-rgb"
                  >
                    จัดการบุคลากร
                  </button>

                  <button
                    onClick={() => window.location.href = '/reports'}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-md md:text-lg transition-all duration-200 hover:scale-105 hover:animate-glow-rgb"
                  >
                    รายงานของบุคลากร
                  </button>
                </>
              )}

              {/* ทุกคนในโหมดผู้ใช้งาน */}
              {(status === 'user' || isUserMode) && (
                <>
                  <button
                    data-tour="add-form-button"
                    onClick={async () => {
                      try {
                        await fetch('/api/user/markAsSeen', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ username }), // ใช้ username ใน fetch ได้เลย
                        });
                        console.log("✅ อัปเดต hasSeenTour สำเร็จ");
                      } catch (error) {
                        console.error("❌ อัปเดต hasSeenTour ล้มเหลว:", error);
                      } finally {
                        window.location.href = '/form';
                      }
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg text-md md:text-lg transition-all duration-200 hover:scale-105 hover:animate-glow-rgb"
                  >
                    เพิ่มแบบ กบค.1
                  </button>
                </>
              )}
            </div>


            <br />
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4" >
              {filters.map((filter, index) => (
                <div key={index} className="flex items-center space-x-2" data-tour="search-bar">
                  <select
                    value={filter.field}
                    onChange={(e) => handleFilterChange(index, "field", e.target.value)}
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
                    onChange={(e) => handleFilterChange(index, "value", e.target.value)}
                    placeholder="ค้นหา..."
                    className="border px-4 py-2 rounded flex-grow"
                  />

                </div>
              ))}
            </div>






          </div>


        )}

        <div className="flex space-x-2">
          <button onClick={() => handleToggleTable(1)} className="bg-blue-500 text-white py-1 px-3 rounded">ข้อมูลอบรม</button>
          <button onClick={() => handleToggleTable(2)} className="bg-blue-500 text-white py-1 px-3 rounded">ค่าใช้จ่าย</button>
          <button onClick={() => handleToggleTable(3)} className="bg-blue-500 text-white py-1 px-3 rounded">ที่มางบประมาณ</button>
          <button onClick={() => handleToggleTable(4)} className="bg-blue-500 text-white py-1 px-3 rounded">เอกสารแนบ</button>
          <button onClick={() => handleToggleTable(5)} className="bg-blue-500 text-white py-1 px-3 rounded">อื่นๆ</button>
        </div>
        {showTable === 1 && (
          <div className="overflow-x-auto w-full" data-tour="main-container"><table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
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
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>
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
                    {report.courseName}
                    {report.trainingBatch && ` ${report.generation || ''} ${report.trainingBatch}`}
                  </td>
                  <td className="border px-4 py-2 text-center">{report.trainingOrg}</td>
                  <td className="border px-4 py-2 text-center">{report.trainingMethod}</td>
                  <td className="border px-4 py-2 text-center">{report.hybridLocation || "N/A"}</td>
                  <td className="border px-4 py-2 text-center">{formatDateBuddhist(report.startDate)}</td>
                  <td className="border px-4 py-2 text-center">{formatDateBuddhist(report.endDate)}</td>
                  <td className="border px-4 py-2 text-center">{report.period}</td>

                  <td className="border px-4 py-2 text-center">
                    {report.checked.includes("ตรวจสอบแล้ว")
                      ? (
                        <span className="text-green-500 font-semibold">ตรวจสอบแล้ว</span>
                      ) : (
                        <>
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

                        </>
                      )}
                  </td>

                </tr>
              ))}


            </tbody>
          </table></div>
        )}
        {showTable === 2 && (
          <div className="overflow-x-auto w-full"><table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รหัสรายงาน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าลงทะเบียน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าที่พัก</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าเดินทาง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าเบี้ยเลี้ยง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รวมค่าใช้จ่าย</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>
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
                    {report.courseName}
                    {report.trainingBatch && ` ${report.generation || ''} ${report.trainingBatch}`}
                  </td>
                  <td className="border px-4 py-2 text-center">{report.regFeeAmount || "N/A"}</td>
                  <td className="border px-4 py-2 text-center">{report.accommodationFeeAmount || "N/A"}</td>
                  <td className="border px-4 py-2 text-center">{report.transportationFeeAmount || "N/A"}</td>
                  <td className="border px-4 py-2 text-center">{report.allowanceFeeAmount || "N/A"}</td>
                  <td className="border px-4 py-2 text-center">{report.totalCost || "N/A"}</td>

                  <td className="border px-4 py-2 text-center">
                    {report.checked.includes("ตรวจสอบแล้ว")
                      ? (
                        <span className="text-green-500 font-semibold">ตรวจสอบแล้ว</span>
                      ) : (
                        <>
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

                        </>
                      )}
                  </td>
                </tr>
              ))}


            </tbody>
          </table></div>
        )}

        {showTable === 3 && (
          <div className="overflow-x-auto w-full"><table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รหัสรายงาน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">งบจากกรมประมง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">แผนงาน/โครงการ</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">งบจากหน่วยงานอื่น</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">หน่วยงานที่สนับสนุนงบ</th>

                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>
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
                    {report.courseName}
                    {report.trainingBatch && ` ${report.generation || ''} ${report.trainingBatch}`}
                  </td>
                  <td className="border px-4 py-2 text-center">{report.internalBudget || "N/A"}</td>
                  <td className="border px-4 py-2 text-center">{report.planBudget || "N/A"}</td>
                  <td className="border px-4 py-2 text-center">{report.externalBudget || "N/A"}</td>
                  <td className="border px-4 py-2 text-center">{report.externalAgency || "N/A"}</td>


                  <td className="border px-4 py-2 text-center">
                    {report.checked.includes("ตรวจสอบแล้ว")
                      ? (
                        <span className="text-green-500 font-semibold">ตรวจสอบแล้ว</span>
                      ) : (
                        <>
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

                        </>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}


        {showTable === 4 && (
          <div className="overflow-x-auto w-full"><table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
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
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>
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
                    {report.courseName}
                    {report.trainingBatch && ` ${report.generation || ''} ${report.trainingBatch}`}
                  </td>

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





                  <td className="border px-4 py-2 text-center">
                    {report.checked.includes("ตรวจสอบแล้ว")
                      ? (
                        <span className="text-green-500 font-semibold">ตรวจสอบแล้ว</span>
                      ) : (
                        <>
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
                        </>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}


        {showTable === 5 && (
          <div className="overflow-x-auto w-full"><table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รหัสรายงาน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>

                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ปีงบประมาณ</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">วันที่ส่ง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">วันที่แก้ไขล่าสุด</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รายการที่ต้องแก้ไข</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>
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
                    {report.courseName}
                    {report.trainingBatch && ` ${report.generation || ''} ${report.trainingBatch}`}
                  </td>

                  <td className="border px-4 py-2 text-center">{calculateFiscalYear(report.startDate)}</td>



                  <td className="border px-4 py-2 text-center">{formatDateBuddhist(report.submitTime)}</td>
                  <td className="border px-4 py-2 text-center">  {report.editTime ? formatDateBuddhist(report.editTime) : "N/A"}</td>
                  <td className="border px-4 py-2 text-center">  {report.note ? report.note : "N/A"}</td>



                  <td className="border px-4 py-2 text-center">
                    {report.checked.includes("ตรวจสอบแล้ว")
                      ? (
                        <span className="text-green-500 font-semibold">ตรวจสอบแล้ว</span>
                      ) : (
                        <>
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
                        </>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}



        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`py-2 px-4 rounded ${currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
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
            className={`py-2 px-4 rounded ${currentPage === totalPages ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
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




      {isLoading && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"> <div className="text-white text-lg flex items-center gap-3"> <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path> </svg> <span>กำลังโหลด...</span> </div> </div>)}

    </>
  );
}
