// pages/reports.js
import './styles.css';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useRouter } from 'next/router'; // ใช้สำหรับ redirect
import * as XLSX from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faSave, faStickyNote } from "@fortawesome/free-solid-svg-icons";

import { faEye } from "@fortawesome/free-solid-svg-icons";









export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [showTable, setShowTable] = useState(1);
  const [userDetails, setUserDetails] = useState(null);

  const [notes, setNotes] = useState({});
  const [showTextarea, setShowTextarea] = useState({});

  const [filterMode, setFilterMode] = useState("AND"); // ค่าตั้งต้นเป็น AND
  const [showFilters, setShowFilters] = useState(false); // state ควบคุมการแสดง
  const [filtersAND, setFiltersAND] = useState([]);
  const [filtersOR, setFiltersOR] = useState([]);

  const [filtersNOT, setFiltersNOT] = useState([]);

  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [checkedStatusFilter, setCheckedStatusFilter] = useState("all"); // all, checked, unchecked
  const [showBackToTop, setShowBackToTop] = useState(false);

  // ฟังก์ชัน scroll กลับไปด้านบน
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // ติดตาม scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 300); // แสดงปุ่มเมื่อ scroll ลงไปมากกว่า 300px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // อัปเดตค่าโน้ตเมื่อพิมพ์
  const handleNoteChange = (id, text) => {
    setNotes((prev) => ({ ...prev, [id]: text }));
  };

  // ส่งโน้ตไปบันทึกในฐานข้อมูล
  const saveNote = async (id) => {
    if (!notes[id]) return;

    try {
      const response = await fetch(`/api/saveNote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: id, note: notes[id] }),
      });

      if (response.ok) {
        alert("บันทึกโน้ตสำเร็จ!");
        setShowTextarea((prev) => ({ ...prev, [id]: false })); // ปิด textarea หลังบันทึก
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกโน้ต");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };


  const [username, setUsername] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) throw new Error('Unauthorized');

        const user = await res.json();
        setUsername(user.username); // ดึงชื่อผู้ใช้จาก session
      } catch (error) {
        router.push('/signin'); // หากไม่มี session หรือ error ให้ redirect
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (username) {
      fetchUserDetails();
    }
  }, [username]);

  const fetchUserDetails = async () => {
    try {
      console.log("Fetching user details for:", username); // ✅ Debug ก่อนส่ง Request

      const response = await axios.get(`/api/users?username=${username}`);

      console.log("API Response:", response); // ✅ ดู Response ทั้งหมด
      console.log("API Data:", response.data); // ✅ ดูข้อมูลที่ได้จาก API
      setUserDetails(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };



  const [filters, setFilters] = useState([
    { field: "formCode", value: "" }
  ]);

  const [currentPage, setCurrentPage] = useState(1); // หน้าปัจจุบัน
  const [rowsPerPage, setRowsPerPage] = useState(150); // จำนวนแถวต่อหน้า (ค่าเริ่มต้น)



  const handleToggleTable = (tableNumber) => {
    setShowTable(tableNumber); // แสดงตารางตามหมายเลขที่เลือก
  };




  const router = useRouter(); // ตัวช่วยสำหรับ redirect
  const { reportId } = router.query;



  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) throw new Error('Unauthorized');

        const user = await res.json();

        if (user.status !== 'admin' && user.status !== 'superadmin' && user.status !== 'approver' && user.status !== 'approver2') {
          alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
          router.push('/');
        }
      } catch (err) {
        // ถ้าไม่มี session หรือเกิด error ให้ redirect ออก
        alert('กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้');
        router.push('/signin');
      }
    };

    checkStatus();
  }, [router]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {

      setIsLoadingReports(true); // เริ่มแสดง overlay

      console.log("Fetching reports from API..."); // Debug: แสดงข้อความก่อนเรียก API
      const response = await axios.get('/api/reports');
      console.log("Response data:", response.data); // Debug: ตรวจสอบข้อมูลที่ได้รับ
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error); // Debug: แสดง error ที่เกิดขึ้น
    } finally {
      setIsLoadingReports(false); // ซ่อน overlay เมื่อเสร็จ
    }
  };




  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
    return `${day}/${month}/${year}`;
  };

  // ไม่มีการแม็ปฝั่ง client อีกต่อไป ใช้ whoEdit_nickname จาก API โดยตรง

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


  const redirectToEditForm = (id) => {
    console.log("This function is called"); // เพิ่ม Debug ตรงนี้
    console.log("Edit button clicked with ID:", id);
    console.log("User status:", userDetails?.status); // Debug: ดู status ของ user

    if (!id) {
      console.log("ID is not defined, cannot navigate to form.");
      return;
    }

    // ตรวจสอบ status ของ user และนำทางไปยังหน้าต่างๆ ตามสิทธิ์
    let targetPage = '/editt'; // ค่าเริ่มต้นสำหรับ admin

    if (userDetails?.status === 'superadmin') {
      targetPage = '/edittt';
    } else if (userDetails?.status === 'admin') {
      targetPage = '/editt';
    }

    console.log("Redirecting to:", targetPage);

    setTimeout(() => {
      console.warn("Redirecting to form page now...");
      router.push(`${targetPage}?id=${id}`);
    }, 500); // รอ 500ms ก่อนเปลี่ยนหน้า
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
      "รหัสบัตรประชาชน": report.username,
      "คำนำหน้าชื่อ": report.title,
      "ชื่อ": report.first_name,
      "นามสกุล": report.last_name,
      "ประเภท": report.type,
      "ตำแหน่ง": report.position,
      "ระดับ": report.level,
      "กอง": report.department,
      "กลุ่ม": report.group_name,
      "ฝ่าย": report.under_department1,
      "ชื่อหลักสูตร": report.courseName,
      "หน่วยงานที่จัด": report.trainingOrg,
      "วิธีการอบรม": report.trainingMethod,
      "สถานที่อบรม": report.hybridLocation,
      "วันที่เข้ารับการฝึกอบรม": formatDate(report.startDate),
      "วันที่สิ้นสุดการฝึกอบรม": formatDate(report.endDate),
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
      "ตรวจสอบ": report.checked,
      "วันที่ส่ง": formatDate(report.submitTime)

    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const exportToExcel2 = () => {
    const fileName = window.prompt("กรุณาตั้งชื่อไฟล์ (ไม่ต้องใส่นามสกุล):", "Reports") || "Reports";


    const data = filteredReports.map(report => {
      // ดึงค่าจำนวนวันและชั่วโมงจากสตริง เช่น "5 วัน 16 ชม. 20 นาที"
      const periodText = report.period || "";
      const dayMatch = periodText.match(/(\d+)\s*วัน/);
      const hourMatch = periodText.match(/(\d+)\s*ชม/);

      const days = dayMatch ? dayMatch[1] : "";
      const hours = hourMatch ? hourMatch[1] : "";

      return {
        "เลขประจำตัวประชาชน": report.username,
        "ชื่อ-นามสกุล": `${report.first_name} ${report.last_name}`,
        "ประเภทการอบรม": "1",
        "ชื่อหลักสูตร": report.courseName,
        "รุ่นที่อบรม": "",
        "วันที่เริ่มต้น (TEXT)": formatDate(report.startDate),
        "วันที่สิ้นสุด (TEXT)": formatDate(report.endDate),
        "จำนวนวัน": days,
        "จำนวนชั่วโมง": hours,
        "หน่วยงานที่จัด": report.trainingOrg,
        "สถานที่อบรม": report.hybridLocation && report.hybridLocation.trim() !== ""
          ? report.hybridLocation
          : report.trainingMethod,
        "ประเทศที่จัด": "",
        "ชื่อทุน": "",
        "ประเทศเจ้าของทุน": "",
        "หมายเหตุ": "",
        "ผ่าน/ไม่ผ่าน": "ผ่าน",
        "เลขที่หนังสือนำส่ง": "",
        "วันที่หนังสือนำส่ง (TEXT)": "",
        "โครงการฝึกอบรม": "",
        "หลักสูตรอื่นๆ": "",
        "วุฒิที่ได้รับ": "",
        "คะแนน": "",
        "วัตถุประสงค์": "",
        "เลขที่คำสั่ง": "",
        "วันที่เลขที่คำสั่ง": "",
        "พิมพ์ในรายงาน": "",
        "ค่าใช้จ่าย": report.totalCost === "0.00" ? "" : report.totalCost,
        "วันที่รายงานตัวกลับ": "",
        "หลักสูตรนักบริหารหรือเทียบเท่า": "",
        "ชื่อย่อ (ใช้พิมพ์)": ""

      };
    });


    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const exportToExcelForApprover = () => {
    const fileName = window.prompt("กรุณาตั้งชื่อไฟล์ (ไม่ต้องใส่นามสกุล):", "Reports") || "Reports";

    const data = filteredReports.map(report => ({
      "รหัสรายงาน": report.formCode,
      "ปีงบประมาณ": calculateFiscalYear(report.startDate),
      "คำนำหน้าชื่อ": report.title,
      "ชื่อ": report.first_name,
      "นามสกุล": report.last_name,
      "ประเภท": report.type,
      "ตำแหน่ง": report.position,
      "ระดับ": report.level,
      "กอง": report.department,
      "กลุ่ม": report.group_name,
      "ฝ่าย": report.under_department1,
      "ชื่อหลักสูตร": report.courseName,
      "หน่วยงานที่จัด": report.trainingOrg,
      "วิธีการอบรม": report.trainingMethod,
      "สถานที่อบรม": report.hybridLocation,
      "วันที่เข้ารับการฝึกอบรม": formatDate(report.startDate),
      "วันที่สิ้นสุดการฝึกอบรม": formatDate(report.endDate),
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
      "วันที่ส่ง": formatDate(report.submitTime)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };


  const calculateTotalCost = () => {
    return currentReports.reduce((total, report) => total + (Number(report.totalCost) || 0), 0);
  };



  // --- helper: แปลง input หลายรูปแบบเป็น Date object ---
  // รับ input ที่อาจเป็น:
  // - "13/10/2568" (dd/mm/yyyy พ.ศ.)
  // - "13/10/2025" (dd/mm/yyyy ค.ศ.)
  // - ISO string "2025-10-13T00:00:00.000Z"
  // - Date object
  function parseDateInput(input) {
    if (!input) return null;

    // ถ้าเป็น Date อยู่แล้ว
    if (input instanceof Date && !isNaN(input)) return input;

    // ถ้าเป็น ISO หรือ ค.ศ. ในรูปแบบที่ new Date() เข้าใจ
    const asDate = new Date(input);
    if (input.length >= 8 && !isNaN(asDate)) {
      // BUT: ถ้า input เป็น "13/10/2568", new Date("13/10/2568") มักจะ invalid -> handle below
      // ถ้า new Date สำเร็จและเป็น ISO-like ให้คืนค่า
      // ตรวจสอบว่ input มี "/" หรือ "-" เพื่อเลือก path ต่อไป
      if (!input.includes("/")) return asDate;
    }

    // กรณีรูปแบบ dd/mm/yyyy (อาจเป็น พ.ศ. หรือ ค.ศ.)
    const parts = input.split("/");
    if (parts.length === 3) {
      let d = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10);
      let y = parseInt(parts[2], 10);
      if (isNaN(d) || isNaN(m) || isNaN(y)) return null;

      // ถ้าเป็นปีพุทธศักราช (>= 2500 สมมติเป็น พ.ศ.) -> ลบ 543
      if (y > 2400) y = y - 543;

      // สร้าง Date (เดือนใน JS เป็น 0-based)
      const dt = new Date(y, m - 1, d);
      if (!isNaN(dt)) return dt;
    }

    // ถ้าไม่ตรงรูปแบบข้างต้น คืน null
    return null;
  }

  // --- helper: แปลง input หลายรูปแบบเป็น Date object ---
  function parseDateInput(input) {
    if (!input) return null;

    if (input instanceof Date && !isNaN(input)) return input;

    // ถ้าเป็นตัวเลข timestamp
    if (typeof input === 'number' && !isNaN(input)) return new Date(input);

    // ถ้าเป็น string ที่เป็น ISO หรือ ค.ศ. ที่ new Date เข้าใจ (และไม่มี '/')
    if (typeof input === 'string' && !input.includes('/')) {
      const asDate = new Date(input);
      if (!isNaN(asDate)) return asDate;
    }

    // รูปแบบ dd/mm/yyyy (อาจเป็น พ.ศ. หรือ ค.ศ.)
    if (typeof input === 'string' && input.includes('/')) {
      const parts = input.split('/');
      if (parts.length === 3) {
        let d = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        let y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          if (y > 2400) y = y - 543; // ถ้าเป็น พ.ศ.
          const dt = new Date(y, m - 1, d);
          if (!isNaN(dt)) return dt;
        }
      }
    }

    return null;
  }

  function matchesCondition(report, filter) {
    if (!filter || !filter.field) return true;

    // ปีงบประมาณ
    if (filter.field === "fiscalYear") {
      const fiscalYear = calculateFiscalYear(report.startDate);
      return fiscalYear.toString().includes(String(filter.value || ""));
    }

    // ฟิลด์ที่เป็นวันที่
    if (["startDate", "endDate", "submitTime", "editTime"].includes(filter.field)) {
      // ถ้า report ไม่มีค่าวันที่ ให้ถือว่าไม่ผ่าน (หรือปรับตามต้องการ)
      const reportDate = parseDateInput(report[filter.field]);
      if (!reportDate) return false;

      // ถ้ามี from/to ให้ตรวจช่วง
      if (filter.from || filter.to) {
        const fromDate = parseDateInput(filter.from) || new Date("1900-01-01");
        const toDate = parseDateInput(filter.to) || new Date("9999-12-31");
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        return reportDate >= fromDate && reportDate <= toDate;
      }

      // ถ้ามีค่า value (string) -> เปรียบเทียบตาม format ของฟังก์ชัน formatDate (dd/mm/พ.ศ.)
      if (filter.value) {
        const reportStr = formatDate(report[filter.field]); // คุณมีฟังก์ชัน formatDate ที่คืน dd/mm/พ.ศ.
        return reportStr.includes(filter.value);
      }

      // ไม่มีเงื่อนไขเพิ่มเติม -> ผ่าน
      return true;
    }

    // กรณีทั่วไป (string compare)
    const fieldValue = String(report[filter.field] ?? "").toLowerCase();
    const searchValue = String(filter.value ?? "").toLowerCase();
    if ((fieldValue === "" || fieldValue === "undefined") && searchValue === "n/a") return true;

    return fieldValue.includes(searchValue);
  }





  const filteredReports = reports
    .filter((report) => {
      if (reportId) return report.id.toString() === reportId;

      const matchesDepartment =
        userDetails?.department ? report.department === userDetails.department : true;

      const matchesGroup =
        userDetails?.group_name ? report.group_name === userDetails.group_name : true;

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

      // แทนที่ส่วน passAND / passOR / passNOT ที่มีอยู่ด้วยโค้ดนี้

      // AND
      const passAND = filtersAND.every((filter) => {
        // ถ้าไม่มีเงื่อนไขใด ๆ (value, from, to ว่าง) -> ข้าม
        if (!(filter.value || filter.from || filter.to)) return true;
        return matchesCondition(report, filter);
      });

      // OR
      const passOR = filtersOR.length === 0 || filtersOR.some((filter) => {
        if (!(filter.value || filter.from || filter.to)) return false;
        return matchesCondition(report, filter);
      });

      // NOT
      const passNOT = filtersNOT.every((filter) => {
        if (!(filter.value || filter.from || filter.to)) return true;
        return !matchesCondition(report, filter);
      });

      // เพิ่มเงื่อนไข matchesDepartment สำหรับ approver
      const baseCondition = passQuick && passAND && passOR && passNOT && passCheckedStatus;
      if (userDetails?.status === 'approver') {
        return baseCondition && matchesDepartment;
      } else if (userDetails?.status === 'approver2') {
        return baseCondition && matchesGroup;
      }
      return baseCondition;
    })
    .sort((a, b) => b.formCode - a.formCode);

  const handleFilterChangeF = (index, key, value) => {

    const newFilters = [...filters];
    newFilters[index][key] = value;
    setFilters(newFilters);
    setCurrentPage(1);
  };


  const handleFilterChange = (mode, index, key, value) => {
    if (mode === "AND") {
      setFiltersAND(prev => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
    } else if (mode === "OR") {
      setFiltersOR(prev => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
    } else if (mode === "NOT") {
      setFiltersNOT(prev => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
    }
  };


  const addFilter = (mode) => {
    const newFilter = { field: "formCode", value: "", from: "", to: "" };

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

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentReports = filteredReports.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // รีเซ็ตไปที่หน้าแรกเมื่อเปลี่ยนค่า
  };

  const [jumpPage, setJumpPage] = useState("");

  const handleJumpToPage = () => {
    const pageNumber = parseInt(jumpPage, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setJumpPage("");
    } else {
      alert(`กรุณากรอกเลขหน้าระหว่าง 1 ถึง ${totalPages}`);
    }
  };



  const handleCheckStatus = async (reportId, currentStatus, username) => {
    try {
      const currentUser = username || '';

      // หากสถานะปัจจุบันเป็น "ตรวจสอบแล้ว ..."
      if (currentStatus.startsWith("ตรวจสอบแล้ว")) {
        const approverName = currentStatus.replace(/^ตรวจสอบแล้ว\s*/, '').trim();

        // ตรวจสอบสิทธิ์: ถ้าไม่ใช่ superadmin และชื่อไม่ตรงกับผู้ตรวจเดิม -> ไม่อนุญาต
        if (approverName && approverName !== currentUser && userDetails?.status !== 'superadmin') {
          alert(`ไม่สามารถเปลี่ยนสถานะได้ เนื่องจากรายการนี้ถูกตรวจสอบโดย ${approverName}`);
          return;
        }
      }

      // กำหนดสถานะใหม่
      const newStatus = currentStatus.startsWith("ตรวจสอบแล้ว")
        ? "รอตรวจสอบ"
        : `ตรวจสอบแล้ว ${currentUser}`;

      const response = await axios.post("/api/reports/checkStatus", {
        reportId,
        checked: newStatus,
      });

      if (response.data.success) {
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === reportId ? { ...report, checked: newStatus } : report
          )
        );
      } else {
        alert("เกิดข้อผิดพลาด: " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("ไม่สามารถอัปเดตสถานะได้");
    }
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
      <ToastContainer />

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
                    <h4 className="font-semibold text-base mb-2">
                      โหมดตัวกรอง AND (ทุกเงื่อนไขต้องตรง)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {filtersAND.map((filter, index) => (
                        <div key={index} className="flex flex-col space-y-2 p-2 border rounded-lg">
                          {/* ตัวเลือกฟิลด์ */}
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
                              <option value="checked">ตรวจสอบ</option>
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
                            <optgroup label="ข้อมูลบุคลากร">
                              <option value="full_name">ชื่อ-นามสกุล</option>
                              {userDetails?.status !== 'approver' && (
                                <option value="nickname">ชื่อเล่น</option>
                              )}
                              <option value="type">ประเภท</option>
                              <option value="position">ตำแหน่ง</option>
                              <option value="level">ระดับ</option>
                              {userDetails?.status !== 'approver' && (
                                <option value="department">สำนัก/กอง/ศูนย์</option>
                              )}
                              <option value="group_name">กลุ่ม/ฝ่าย</option>
                            </optgroup>
                            {(userDetails?.status === 'superadmin' || userDetails?.status === 'admin') && (
                              <optgroup label="เพิ่มโน๊ต">
                                <option value="note">โน๊ต</option>
                              </optgroup>
                            )}
                          </select>

                          {/* ถ้าเป็นฟิลด์วันที่ → ใช้ input text 2 ช่อง (กรอก string ได้) */}
                          {["startDate", "endDate", "submitTime", "editTime"].includes(filter.field) ? (
                            <div className="flex flex-col space-y-1">
                              <label>ตั้งแต่วันที่:</label>
                              <input
                                type="text"
                                value={filter.from || ""}
                                onChange={(e) =>
                                  handleFilterChange("AND", index, "from", e.target.value)
                                }
                                placeholder="เช่น 25/12/2568"
                                className="border px-4 py-2 rounded"
                              />
                              <label>ถึงวันที่:</label>
                              <input
                                type="text"
                                value={filter.to || ""}
                                onChange={(e) =>
                                  handleFilterChange("AND", index, "to", e.target.value)
                                }
                                placeholder="เช่น 24/01/2569"
                                className="border px-4 py-2 rounded"
                              />
                            </div>
                          ) : (
                            // ฟิลด์ทั่วไป ใช้ text input ปกติ
                            <input
                              type="text"
                              value={filter.value || ""}
                              onChange={(e) =>
                                handleFilterChange("AND", index, "value", e.target.value)
                              }
                              placeholder="ค้นหา..."
                              className="border px-4 py-2 rounded"
                            />
                          )}

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
                    <h4 className="font-semibold text-base mb-2">
                      โหมดตัวกรอง OR (เงื่อนไขใดเงื่อนไขหนึ่งตรง)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {filtersOR.map((filter, index) => (
                        <div key={index} className="flex flex-col space-y-2 p-2 border rounded-lg">
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
                              <option value="checked">ตรวจสอบ</option>
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
                            <optgroup label="ข้อมูลบุคลากร">
                              <option value="full_name">ชื่อ-นามสกุล</option>
                              {userDetails?.status !== 'approver' && (
                                <option value="nickname">ชื่อเล่น</option>
                              )}
                              <option value="type">ประเภท</option>
                              <option value="position">ตำแหน่ง</option>
                              <option value="level">ระดับ</option>
                              {userDetails?.status !== 'approver' && (
                                <option value="department">สำนัก/กอง/ศูนย์</option>
                              )}
                              <option value="group_name">กลุ่ม/ฝ่าย</option>
                            </optgroup>
                            {(userDetails?.status === 'superadmin' || userDetails?.status === 'admin') && (
                              <optgroup label="โน๊ต">
                                <option value="note">โน๊ต</option>
                              </optgroup>
                            )}
                          </select>

                          {/* ถ้าเป็นฟิลด์วันที่ */}
                          {["startDate", "endDate", "submitTime", "editTime"].includes(filter.field) ? (
                            <div className="flex flex-col space-y-1">
                              <label>ตั้งแต่วันที่:</label>
                              <input
                                type="text"
                                value={filter.from || ""}
                                onChange={(e) =>
                                  handleFilterChange("OR", index, "from", e.target.value)
                                }
                                placeholder="เช่น 25/12/2568"
                                className="border px-4 py-2 rounded"
                              />
                              <label>ถึงวันที่:</label>
                              <input
                                type="text"
                                value={filter.to || ""}
                                onChange={(e) =>
                                  handleFilterChange("OR", index, "to", e.target.value)
                                }
                                placeholder="เช่น 24/01/2569"
                                className="border px-4 py-2 rounded"
                              />
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={filter.value || ""}
                              onChange={(e) =>
                                handleFilterChange("OR", index, "value", e.target.value)
                              }
                              placeholder="ค้นหา..."
                              className="border px-4 py-2 rounded"
                            />
                          )}

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
                    <h4 className="font-semibold text-base mb-2">
                      โหมดตัวกรอง NOT (ไม่ตรงตามเงื่อนไขที่กำหนด)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {filtersNOT.map((filter, index) => (
                        <div key={index} className="flex flex-col space-y-2 p-2 border rounded-lg">
                          <select
                            value={filter.field}
                            onChange={(e) =>
                              handleFilterChange("NOT", index, "field", e.target.value)
                            }
                            className="border px-4 py-2 rounded"
                          >
                            <optgroup label="ข้อมูลทั่วไป">
                              <option value="formCode">รหัสรายงาน</option>
                              <option value="username">ผู้ส่ง (เลขบัตรประชาชน)</option>
                              <option value="courseName">ชื่อหลักสูตร</option>
                              <option value="checked">ตรวจสอบ</option>
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
                            <optgroup label="ข้อมูลบุคลากร">
                              <option value="full_name">ชื่อ-นามสกุล</option>
                              {userDetails?.status !== 'approver' && (
                                <option value="nickname">ชื่อเล่น</option>
                              )}
                              <option value="type">ประเภท</option>
                              <option value="position">ตำแหน่ง</option>
                              <option value="level">ระดับ</option>
                              {userDetails?.status !== 'approver' && (
                                <option value="department">สำนัก/กอง/ศูนย์</option>
                              )}
                              <option value="group_name">กลุ่ม/ฝ่าย</option>
                            </optgroup>
                            {(userDetails?.status === 'superadmin' || userDetails?.status === 'admin') && (
                              <optgroup label="โน๊ต">
                                <option value="note">โน๊ต</option>
                              </optgroup>
                            )}
                          </select>

                          {/* ฟิลด์วันที่ */}
                          {["startDate", "endDate", "submitTime", "editTime"].includes(filter.field) ? (
                            <div className="flex flex-col space-y-1">
                              <label>ตั้งแต่วันที่:</label>
                              <input
                                type="text"
                                value={filter.from || ""}
                                onChange={(e) =>
                                  handleFilterChange("NOT", index, "from", e.target.value)
                                }
                                placeholder="เช่น 01/10/2568"
                                className="border px-4 py-2 rounded"
                              />
                              <label>ถึงวันที่:</label>
                              <input
                                type="text"
                                value={filter.to || ""}
                                onChange={(e) =>
                                  handleFilterChange("NOT", index, "to", e.target.value)
                                }
                                placeholder="เช่น 31/10/2568"
                                className="border px-4 py-2 rounded"
                              />
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={filter.value || ""}
                              onChange={(e) =>
                                handleFilterChange("NOT", index, "value", e.target.value)
                              }
                              placeholder="ค้นหา..."
                              className="border px-4 py-2 rounded"
                            />
                          )}

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
        <div className="sticky top-16 z-40 bg-gradient-to-r from-purple-500 to-indigo-600 py-2 shadow-md">
          <div className="flex space-x-2">
            <button onClick={() => handleToggleTable(1)} className="bg-blue-500 text-white py-1 px-3 rounded">ข้อมูลอบรม</button>
            <button onClick={() => handleToggleTable(2)} className="bg-blue-500 text-white py-1 px-3 rounded">ค่าใช้จ่าย</button>
            <button onClick={() => handleToggleTable(3)} className="bg-blue-500 text-white py-1 px-3 rounded">ที่มางบประมาณ</button>
            <button onClick={() => handleToggleTable(4)} className="bg-blue-500 text-white py-1 px-3 rounded">เอกสารแนบ</button>
            <button onClick={() => handleToggleTable(5)} className="bg-blue-500 text-white py-1 px-3 rounded">อื่นๆ</button>
            <button onClick={() => handleToggleTable(6)} className="bg-blue-500 text-white py-1 px-3 rounded">ข้อมูลผู้ส่ง</button>
            {(userDetails?.status === 'superadmin' || userDetails?.status === 'admin') && (
              <button onClick={() => handleToggleTable(7)} className="bg-blue-500 text-white py-1 px-3 rounded">เพิ่มโน๊ต</button>
            )}
          </div>
        </div>

        {showTable === 1 && (<div> <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
          <thead className="bg-blue-800 text-white sticky top-24 z-30">
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
              {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>
              )}
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
                      href={`/user-details/${report.user_id}`}
                      className="text-blue-600 underline flex items-center justify-center gap-2"
                    >
                      {userDetails?.status === 'approver' || userDetails?.status === 'approver2' ? report.username : (report.nickname ?? report.username)}
                      <FontAwesomeIcon icon={faEye} className="text-blue-600 hover:text-blue" />
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>


                <td className="border px-4 py-2 text-center">
                  {report.courseName}
                  {report.trainingBatch && ` ${report.generation || ''} ${report.trainingBatch}`}
                </td>
                <td className="border px-4 py-2 text-center">{report.trainingOrg}</td>
                <td className="border px-4 py-2 text-center">{report.trainingMethod}</td>
                <td className="border px-4 py-2 text-center">{report.hybridLocation || "N/A"}</td>
                <td className="border px-4 py-2 text-center">{formatDate(report.startDate)}</td>
                <td className="border px-4 py-2 text-center">{formatDate(report.endDate)}</td>
                <td className="border px-4 py-2 text-center">{report.period}</td>


                {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                  <td className="border px-4 py-2 text-center">
                    <>
                      <button
                        onClick={() => redirectToEditForm(report.id)}
                        disabled={report.checked && report.checked.startsWith("ตรวจสอบแล้ว")}
                        className={`${report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "bg-gray-400 cursor-not-allowed text-white font-semibold py-1 px-3 rounded-full ml-2" : "bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"}`}
                        title={report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "รายการถูกตรวจสอบแล้ว ไม่สามารถแก้ไขได้" : "แก้ไข"}
                      >
                        แก้ไข
                      </button>
                      {userDetails?.status === 'superadmin' && (
                        <button
                          onClick={() => deleteReport(report.id)}
                          disabled={report.checked && report.checked.startsWith("ตรวจสอบแล้ว")}
                          className={`${report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "bg-gray-400 cursor-not-allowed text-white font-semibold py-1 px-3 rounded-full ml-2" : "bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"}`}
                          title={report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "รายการถูกตรวจสอบแล้ว ไม่สามารถลบได้" : "ลบ"}
                        >
                          ลบ
                        </button>
                      )}
                    </>

                  </td>
                )}


                <td className="border px-4 py-2 text-center">
                  {userDetails?.status === 'approver' || userDetails?.status === 'approver2' ? (
                    report.checked?.includes("รอ") ? (
                      <span className="font-bold text-red-600">รอตรวจสอบ</span>
                    ) : report.checked?.includes("แล้ว") ? (
                      <span className="font-bold text-green-600">ตรวจสอบแล้ว</span>
                    ) : (
                      "N/A"
                    )
                  ) : (
                    <button
                      className={report.checked.startsWith("ตรวจสอบแล้ว")
                        ? "bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                        : "bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"}
                      onClick={() => {
                        console.log("User Title before calling function:", userDetails?.username);
                        handleCheckStatus(report.id, report.checked, userDetails?.nickname || userDetails?.username);
                      }}
                    >
                      {report.checked}
                    </button>
                  )}
                </td>


              </tr>
            ))}
          </tbody>
        </table> </div>

        )}

        {showTable === 2 && (
          <div> <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
            <thead className="sticky top-24 z-30">
              <tr className="bg-blue-800 text-white">
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รหัสรายงาน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ผู้ส่ง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าลงทะเบียน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าที่พัก</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าเดินทาง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ค่าเบี้ยเลี้ยง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รวมค่าใช้จ่าย</th>
                {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                  <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>
                )}
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
                        href={`/user-details/${report.user_id}`}
                        className="text-blue-600 underline flex items-center justify-center gap-2"
                      >
                        {userDetails?.status === 'approver' || userDetails?.status === 'approver2' ? report.username : (report.nickname ?? report.username)}
                        <FontAwesomeIcon icon={faEye} className="text-blue-600 hover:text-blue" />
                      </a>
                    ) : (
                      "N/A"
                    )}
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


                  {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                    <td className="border px-4 py-2 text-center">
                      <>
                        <button
                          onClick={() => redirectToEditForm(report.id)}
                          disabled={report.checked && report.checked.startsWith("ตรวจสอบแล้ว")}
                          className={`${report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "bg-gray-400 cursor-not-allowed text-white font-semibold py-1 px-3 rounded-full ml-2" : "bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"}`}
                          title={report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "รายการถูกตรวจสอบแล้ว ไม่สามารถแก้ไขได้" : "แก้ไข"}
                        >
                          แก้ไข
                        </button>
                        {userDetails?.status === 'superadmin' && (
                          <button
                            onClick={() => deleteReport(report.id)}
                            disabled={report.checked && report.checked.startsWith("ตรวจสอบแล้ว")}
                            className={`${report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "bg-gray-400 cursor-not-allowed text-white font-semibold py-1 px-3 rounded-full ml-2" : "bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"}`}
                            title={report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "รายการถูกตรวจสอบแล้ว ไม่สามารถลบได้" : "ลบ"}
                          >
                            ลบ
                          </button>
                        )}
                      </>
                    </td>
                  )}
                  <td className="border px-4 py-2 text-center">
                    {userDetails?.status === 'approver' || userDetails?.status === 'approver2' ? (
                      report.checked?.includes("รอ") ? (
                        <span className="font-bold text-red-600">รอตรวจสอบ</span>
                      ) : report.checked?.includes("แล้ว") ? (
                        <span className="font-bold text-green-600">ตรวจสอบแล้ว</span>
                      ) : (
                        "N/A"
                      )
                    ) : (
                      <button
                        className={report.checked.startsWith("ตรวจสอบแล้ว")
                          ? "bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                          : "bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"}
                        onClick={() => {
                          console.log("User Title before calling function:", userDetails?.username);
                          handleCheckStatus(report.id, report.checked, userDetails?.nickname || userDetails?.username);
                        }}
                      >
                        {report.checked}
                      </button>
                    )}
                  </td>


                </tr>
              ))}

              <tr className="bg-gray-300">

                <td colSpan="7" className="border px-4 py-2 font-bold text-right">จำนวนเงินทั้งสิ้น:</td>
                <td className="border px-4 py-2 font-bold text-center">{calculateTotalCost()}</td>
                <td></td>
                <td></td>
                <td></td>


              </tr>
            </tbody>
          </table> </div>
        )}

        {showTable === 3 && (
          <div> <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
            <thead className="sticky top-24 z-30">
              <tr className="bg-blue-800 text-white">
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รหัสรายงาน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ผู้ส่ง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">งบจากกรมประมง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">แผนงาน/โครงการ</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">งบจากหน่วยงานอื่น</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">หน่วยงานที่สนับสนุนงบ</th>

                {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                  <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>
                )}
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
                        href={`/user-details/${report.user_id}`}
                        className="text-blue-600 underline flex items-center justify-center gap-2"
                      >
                        {userDetails?.status === 'approver' || userDetails?.status === 'approver2' ? report.username : (report.nickname ?? report.username)}
                        <FontAwesomeIcon icon={faEye} className="text-blue-600 hover:text-blue" />
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>

                  <td className="border px-4 py-2 text-center">
                    {report.courseName}
                    {report.trainingBatch && ` ${report.generation || ''} ${report.trainingBatch}`}
                  </td>
                  <td className="border px-4 py-2 text-center">{report.internalBudget || "N/A"}</td>
                  <td className="border px-4 py-2 text-center">{report.planBudget || "N/A"}</td>
                  <td className="border px-4 py-2 text-center">{report.externalBudget || "N/A"}</td>
                  <td className="border px-4 py-2 text-center">{report.externalAgency || "N/A"}</td>
                  {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                    <td className="border px-4 py-2 text-center">
                      <>
                        <button
                          onClick={() => redirectToEditForm(report.id)}
                          disabled={report.checked && report.checked.startsWith("ตรวจสอบแล้ว")}
                          className={`${report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "bg-gray-400 cursor-not-allowed text-white font-semibold py-1 px-3 rounded-full ml-2" : "bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"}`}
                          title={report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "รายการถูกตรวจสอบแล้ว ไม่สามารถแก้ไขได้" : "แก้ไข"}
                        >
                          แก้ไข
                        </button>
                        {userDetails?.status === 'superadmin' && (
                          <button
                            onClick={() => deleteReport(report.id)}
                            disabled={report.checked && report.checked.startsWith("ตรวจสอบแล้ว")}
                            className={`${report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "bg-gray-400 cursor-not-allowed text-white font-semibold py-1 px-3 rounded-full ml-2" : "bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"}`}
                            title={report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "รายการถูกตรวจสอบแล้ว ไม่สามารถลบได้" : "ลบ"}
                          >
                            ลบ
                          </button>
                        )}
                      </>
                    </td>
                  )}
                  <td className="border px-4 py-2 text-center">
                    {userDetails?.status === 'approver' || userDetails?.status === 'approver2' ? (
                      report.checked?.includes("รอ") ? (
                        <span className="font-bold text-red-600">รอตรวจสอบ</span>
                      ) : report.checked?.includes("แล้ว") ? (
                        <span className="font-bold text-green-600">ตรวจสอบแล้ว</span>
                      ) : (
                        "N/A"
                      )
                    ) : (
                      <button
                        className={report.checked.startsWith("ตรวจสอบแล้ว")
                          ? "bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                          : "bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"}
                        onClick={() => {
                          console.log("User Title before calling function:", userDetails?.username);
                          handleCheckStatus(report.id, report.checked, userDetails?.nickname || userDetails?.username);
                        }}
                      >
                        {report.checked}
                      </button>
                    )}
                  </td>




                </tr>
              ))}
            </tbody>
          </table> </div>
        )}

        {showTable === 4 && (
          <div> <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
            <thead className="sticky top-24 z-30">
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
                {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                  <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>
                )}
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
                        href={`/user-details/${report.user_id}`}
                        className="text-blue-600 underline flex items-center justify-center gap-2"
                      >
                        {userDetails?.status === 'approver' || userDetails?.status === 'approver2' ? report.username : (report.nickname ?? report.username)}
                        <FontAwesomeIcon icon={faEye} className="text-blue-600 hover:text-blue" />
                      </a>
                    ) : (
                      "N/A"
                    )}
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




                  {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                    <td className="border px-4 py-2 text-center">
                      <>
                        <button
                          onClick={() => redirectToEditForm(report.id)}
                          disabled={report.checked && report.checked.startsWith("ตรวจสอบแล้ว")}
                          className={`${report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "bg-gray-400 cursor-not-allowed text-white font-semibold py-1 px-3 rounded-full ml-2" : "bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"}`}
                          title={report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "รายการถูกตรวจสอบแล้ว ไม่สามารถแก้ไขได้" : "แก้ไข"}
                        >
                          แก้ไข
                        </button>
                        {userDetails?.status === 'superadmin' && (
                          <button
                            onClick={() => deleteReport(report.id)}
                            disabled={report.checked && report.checked.startsWith("ตรวจสอบแล้ว")}
                            className={`${report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "bg-gray-400 cursor-not-allowed text-white font-semibold py-1 px-3 rounded-full ml-2" : "bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"}`}
                            title={report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "รายการถูกตรวจสอบแล้ว ไม่สามารถลบได้" : "ลบ"}
                          >
                            ลบ
                          </button>
                        )}
                      </>
                    </td>
                  )}
                  <td className="border px-4 py-2 text-center">
                    {userDetails?.status === 'approver' || userDetails?.status === 'approver2' ? (
                      report.checked?.includes("รอ") ? (
                        <span className="font-bold text-red-600">รอตรวจสอบ</span>
                      ) : report.checked?.includes("แล้ว") ? (
                        <span className="font-bold text-green-600">ตรวจสอบแล้ว</span>
                      ) : (
                        "N/A"
                      )
                    ) : (
                      <button
                        className={report.checked.startsWith("ตรวจสอบแล้ว")
                          ? "bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                          : "bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"}
                        onClick={() => {
                          console.log("User Title before calling function:", userDetails?.username);
                          handleCheckStatus(report.id, report.checked, userDetails?.nickname || userDetails?.username);
                        }}
                      >
                        {report.checked}
                      </button>
                    )}
                  </td>




                </tr>
              ))}
            </tbody>
          </table> </div>
        )}


        {showTable === 5 && (
          <div> <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
            <thead className="sticky top-24 z-30">
              <tr className="bg-blue-800 text-white">
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รหัสรายงาน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ผู้ส่ง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ปีงบประมาณ</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">วันที่ส่ง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">วันที่แก้ไขล่าสุด</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ผู้ที่แก้ไขล่าสุด</th>
                {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                  <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>
                )}
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
                        href={`/user-details/${report.user_id}`}
                        className="text-blue-600 underline flex items-center justify-center gap-2"
                      >
                        {userDetails?.status === 'approver' || userDetails?.status === 'approver2' ? report.username : (report.nickname ?? report.username)}
                        <FontAwesomeIcon icon={faEye} className="text-blue-600 hover:text-blue" />
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>

                  <td className="border px-4 py-2 text-center">
                    {report.courseName}
                    {report.trainingBatch && ` ${report.generation || ''} ${report.trainingBatch}`}
                  </td>
                  <td className="border px-4 py-2 text-center">{calculateFiscalYear(report.startDate)}</td>

                  <td className="border px-4 py-2 text-center">{formatDate(report.submitTime)}</td>
                  <td className="border px-4 py-2 text-center">  {report.editTime ? formatDate(report.editTime) : "N/A"}</td>
                  <td className="border px-4 py-2 text-center">  {userDetails?.status === 'approver' || userDetails?.status === 'approver2' ? (report.whoEdit || "N/A") : (report.whoEdit_nickname || report.whoEdit || "N/A")}</td>




                  {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                    <td className="border px-4 py-2 text-center">
                      <>
                        <button
                          onClick={() => redirectToEditForm(report.id)}
                          disabled={report.checked && report.checked.startsWith("ตรวจสอบแล้ว")}
                          className={`${report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "bg-gray-400 cursor-not-allowed text-white font-semibold py-1 px-3 rounded-full ml-2" : "bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"}`}
                          title={report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "รายการถูกตรวจสอบแล้ว ไม่สามารถแก้ไขได้" : "แก้ไข"}
                        >
                          แก้ไข
                        </button>
                        {userDetails?.status === 'superadmin' && (
                          <button
                            onClick={() => deleteReport(report.id)}
                            disabled={report.checked && report.checked.startsWith("ตรวจสอบแล้ว")}
                            className={`${report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "bg-gray-400 cursor-not-allowed text-white font-semibold py-1 px-3 rounded-full ml-2" : "bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"}`}
                            title={report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "รายการถูกตรวจสอบแล้ว ไม่สามารถลบได้" : "ลบ"}
                          >
                            ลบ
                          </button>
                        )}
                      </>
                    </td>
                  )}
                  <td className="border px-4 py-2 text-center">
                    {userDetails?.status === 'approver' || userDetails?.status === 'approver2' ? (
                      report.checked?.includes("รอ") ? (
                        <span className="font-bold text-red-600">รอตรวจสอบ</span>
                      ) : report.checked?.includes("แล้ว") ? (
                        <span className="font-bold text-green-600">ตรวจสอบแล้ว</span>
                      ) : (
                        "N/A"
                      )
                    ) : (
                      <button
                        className={report.checked.startsWith("ตรวจสอบแล้ว")
                          ? "bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                          : "bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"}
                        onClick={() => {
                          console.log("User Title before calling function:", userDetails?.username);
                          handleCheckStatus(report.id, report.checked, userDetails?.nickname || userDetails?.username);
                        }}
                      >
                        {report.checked}
                      </button>
                    )}
                  </td>




                </tr>
              ))}
            </tbody>
          </table> </div>
        )}


        {showTable === 6 && (
          <div> <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
            <thead className="sticky top-24 z-30">
              <tr className="bg-green-800 text-white">
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รหัสรายงาน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">เลขบัตรประชาชน</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อ-สกุล</th>
                {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                  <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อเล่น</th>
                )}
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ประเภท</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ตำแหน่ง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">สังกัด/กอง</th>
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">กลุ่ม/ฝ่าย</th>
                {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                  <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>
                )}
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
                  {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                    <td className="border px-4 py-2 text-center">
                      {report.nickname}
                    </td>
                  )}

                  <td className="border px-4 py-2 text-center">{report.type}</td>
                  <td className="border px-4 py-2 text-center">
                    {report.position}{report.level}
                  </td>
                  <td className="border px-4 py-2 text-center">{report.department}</td>
                  <td className="border px-4 py-2 text-center">{report.group_name} {report.under_department1}</td>

                  {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                    <td className="border px-4 py-2 text-center">
                      <>
                        <button
                          onClick={() => redirectToEditForm(report.id)}
                          disabled={report.checked && report.checked.startsWith("ตรวจสอบแล้ว")}
                          className={`${report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "bg-gray-400 cursor-not-allowed text-white font-semibold py-1 px-3 rounded-full ml-2" : "bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"}`}
                          title={report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "รายการถูกตรวจสอบแล้ว ไม่สามารถแก้ไขได้" : "แก้ไข"}
                        >
                          แก้ไข
                        </button>
                        {userDetails?.status === 'superadmin' && (
                          <button
                            onClick={() => deleteReport(report.id)}
                            disabled={report.checked && report.checked.startsWith("ตรวจสอบแล้ว")}
                            className={`${report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "bg-gray-400 cursor-not-allowed text-white font-semibold py-1 px-3 rounded-full ml-2" : "bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"}`}
                            title={report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "รายการถูกตรวจสอบแล้ว ไม่สามารถลบได้" : "ลบ"}
                          >
                            ลบ
                          </button>
                        )}
                      </>
                    </td>
                  )}
                  <td className="border px-4 py-2 text-center">
                    {userDetails?.status === 'approver' || userDetails?.status === 'approver2' ? (
                      report.checked?.includes("รอ") ? (
                        <span className="font-bold text-red-600">รอตรวจสอบ</span>
                      ) : report.checked?.includes("แล้ว") ? (
                        <span className="font-bold text-green-600">ตรวจสอบแล้ว</span>
                      ) : (
                        "N/A"
                      )
                    ) : (
                      <button
                        className={report.checked.startsWith("ตรวจสอบแล้ว")
                          ? "bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                          : "bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"}
                        onClick={() => {
                          console.log("User Title before calling function:", userDetails?.username);
                          handleCheckStatus(report.id, report.checked, userDetails?.nickname || userDetails?.username);
                        }}
                      >
                        {report.checked}
                      </button>
                    )}
                  </td>



                </tr>
              ))}
            </tbody>

          </table> </div>
        )}


        {showTable === 7 && (<div > <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
          <thead className="bg-blue-800 text-white sticky top-24 z-30">
            <tr>
              <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">รหัสรายงาน</th>
              <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ผู้ส่ง</th>
              <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ชื่อหลักสูตร</th>
              <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">เบอร์โทรศัพท์</th>
              <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">โน๊ต</th>
              {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                <th className="py-3 px-4 border-b border-gray-200 hidden md:table-cell">ดำเนินการ</th>
              )}
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
                      href={`/user-details/${report.user_id}`}
                      className="text-blue-600 underline flex items-center justify-center gap-2"
                    >
                      {userDetails?.status === 'approver' || userDetails?.status === 'approver2' ? report.username : (report.nickname ?? report.username)}
                      <FontAwesomeIcon icon={faEye} className="text-blue-600 hover:text-blue" />
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>


                <td className="border px-4 py-2 text-center">
                  {report.courseName}
                  {report.trainingBatch && ` ${report.generation || ''} ${report.trainingBatch}`}
                </td>

                <td className="border px-4 py-2 text-center">{report.telephone || "N/A"}</td>
                <td className="border px-4 py-2 text-center">
                  {/* แสดงโน้ตถ้ามี */}
                  {report.note && (
                    <div className="mb-2 text-green-700 font-semibold whitespace-pre-wrap">
                      {report.note}
                    </div>
                  )}

                  {/* ถ้ายังไม่อยู่ในโหมดแก้ไข */}
                  {!showTextarea[report.id] ? (
                    <button
                      onClick={() => setShowTextarea((prev) => ({ ...prev, [report.id]: true }))}
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faStickyNote} />
                      {report.note ? "แก้ไขโน้ต" : "เพิ่มโน้ต"}
                    </button>
                  ) : (
                    <div className="mt-2 flex flex-col items-center">
                      <textarea
                        value={notes[report.id] || ""}
                        onChange={(e) => handleNoteChange(report.id, e.target.value)}
                        className="border border-gray-300 rounded w-48 p-2"
                        placeholder="พิมพ์โน้ตที่นี่..."
                      ></textarea>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => saveNote(report.id)}
                          className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faSave} />
                          บันทึก
                        </button>
                        <button
                          onClick={() => setShowTextarea((prev) => ({ ...prev, [report.id]: false }))}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  )}
                </td>




                {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
                  <td className="border px-4 py-2 text-center">
                    <>
                      <button
                        onClick={() => redirectToEditForm(report.id)}
                        disabled={report.checked && report.checked.startsWith("ตรวจสอบแล้ว")}
                        className={`${report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "bg-gray-400 cursor-not-allowed text-white font-semibold py-1 px-3 rounded-full ml-2" : "bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"}`}
                        title={report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "รายการถูกตรวจสอบแล้ว ไม่สามารถแก้ไขได้" : "แก้ไข"}
                      >
                        แก้ไข
                      </button>
                      {userDetails?.status === 'superadmin' && (
                        <button
                          onClick={() => deleteReport(report.id)}
                          disabled={report.checked && report.checked.startsWith("ตรวจสอบแล้ว")}
                          className={`${report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "bg-gray-400 cursor-not-allowed text-white font-semibold py-1 px-3 rounded-full ml-2" : "bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"}`}
                          title={report.checked && report.checked.startsWith("ตรวจสอบแล้ว") ? "รายการถูกตรวจสอบแล้ว ไม่สามารถลบได้" : "ลบ"}
                        >
                          ลบ
                        </button>
                      )}
                    </>
                  </td>
                )}


                <td className="border px-4 py-2 text-center">
                  {userDetails?.status === 'approver' || userDetails?.status === 'approver2' ? (
                    report.checked?.includes("รอ") ? (
                      <span className="font-bold text-red-600">รอตรวจสอบ</span>
                    ) : report.checked?.includes("แล้ว") ? (
                      <span className="font-bold text-green-600">ตรวจสอบแล้ว</span>
                    ) : (
                      "N/A"
                    )
                  ) : (
                    <button
                      className={report.checked.startsWith("ตรวจสอบแล้ว")
                        ? "bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                        : "bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"}
                      onClick={() => {
                        console.log("User Title before calling function:", userDetails?.username);
                        handleCheckStatus(report.id, report.checked, userDetails?.nickname || userDetails?.username);
                      }}
                    >
                      {report.checked}
                    </button>
                  )}
                </td>



              </tr>
            ))}
          </tbody>
        </table> </div>

        )}

        <div className="flex justify-center items-center w-full mt-4 space-x-2">
          {/* ปุ่ม First */}
          <button
            onClick={() => setCurrentPage(1)}
            className={`py-2 px-3 rounded ${currentPage === 1
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            disabled={currentPage === 1}
          >
            « First
          </button>

          {/* ปุ่ม Previous */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`py-2 px-3 rounded ${currentPage === 1
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            disabled={currentPage === 1}
          >
            ‹ Prev
          </button>

          {/* หมายเลขหน้า */}
          {(() => {
            const pageButtons = [];
            const maxVisible = 5; // จำนวนหน้าที่จะแสดงรอบๆ
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisible - 1);

            if (end - start < maxVisible - 1) {
              start = Math.max(1, end - maxVisible + 1);
            }

            // หน้าแรกเสมอ
            if (start > 1) {
              pageButtons.push(
                <button
                  key={1}
                  onClick={() => setCurrentPage(1)}
                  className={`py-1 px-3 rounded ${currentPage === 1
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                >
                  1
                </button>
              );

              if (start > 2) {
                pageButtons.push(
                  <span key="start-ellipsis" className="text-gray-400 px-2">
                    ...
                  </span>
                );
              }
            }

            // หน้าตรงกลาง
            for (let i = start; i <= end; i++) {
              pageButtons.push(
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`py-1 px-3 rounded ${currentPage === i
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                >
                  {i}
                </button>
              );
            }

            // หน้าสุดท้ายเสมอ
            if (end < totalPages) {
              if (end < totalPages - 1) {
                pageButtons.push(
                  <span key="end-ellipsis" className="text-gray-400 px-2">
                    ...
                  </span>
                );
              }

              pageButtons.push(
                <button
                  key={totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className={`py-1 px-3 rounded ${currentPage === totalPages
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                >
                  {totalPages}
                </button>
              );
            }

            return pageButtons;
          })()}

          {/* ปุ่ม Next */}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={`py-2 px-3 rounded ${currentPage === totalPages
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            disabled={currentPage === totalPages}
          >
            Next ›
          </button>

          {/* ปุ่ม Last */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            className={`py-2 px-3 rounded ${currentPage === totalPages
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            disabled={currentPage === totalPages}
          >
            Last »
          </button>

          {/* Jump to Page */}
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-gray-700 font-semibold">ไปที่หน้า:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              className="border rounded px-2 py-1 w-16 text-center text-black"
              value={jumpPage || ''}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleJumpToPage();
                }
              }}
            />
            <button
              onClick={handleJumpToPage}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
            >
              Go
            </button>
          </div>
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


        <div className="flex gap-4 mt-4">

          {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
            <button
              onClick={exportToExcel}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            >
              Export to Excel
            </button>
          )}
          {(userDetails?.status === 'admin' || userDetails?.status === 'superadmin') && (
            <button
              onClick={exportToExcel2}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
            >
              Excel สำหรับลงระบบ DPIS
            </button>
          )}

          {(userDetails?.status === 'approver' || userDetails?.status === 'approver2') && (
            <button
              onClick={exportToExcelForApprover}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            >
              Export to Excel
            </button>
          )}
        </div>


        {/* ปุ่ม Back to Top */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg z-50 transition-all duration-300"
            title="กลับไปด้านบน"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}

        <Footer />

      </div>
    </>
  );
}
