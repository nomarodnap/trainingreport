import './styles.css';
import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import th from 'date-fns/locale/th';
import { format, sub } from 'date-fns';
import axios from "axios";
import { useParams } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { useRouter } from "next/router";
import Header from '../components/Header';
import ThaiDatePicker from '../components/Calendar';
import DragDropUpload from '../components/DragDropUpload';


registerLocale('th', th);




const Form2 = () => {
  const router = useRouter();
  const { id } = router.query; // ดึง ID จาก URL

  // State สำหรับจัดการ user list
  const [userList, setUserList] = useState([]); // รายการ user ที่เพิ่มแล้ว
  const [usernameInput, setUsernameInput] = useState(''); // input สำหรับกรอก username
  const [searchResult, setSearchResult] = useState(null); // ผลลัพธ์การค้นหา user
  const [searchLoading, setSearchLoading] = useState(false); // สถานะการค้นหา
  const [searchError, setSearchError] = useState(''); // ข้อผิดพลาดจากการค้นหา

  const [username, setUsername] = useState('');
  const [trainingOrgs, setTrainingOrgs] = useState([]); // รายชื่อหน่วยงาน
  const [loading, setLoading] = useState(false); // สถานะการโหลดข้อมูล
  const [error, setError] = useState(null); // ข้อผิดพลาด
  const [exteagencies, setExteagencies] = useState([]);
  const [trainingOrg, setTrainingOrg] = useState(''); // ค่า id_extage
  const [organizations, setOrganizations] = useState([]); // รายการหน่วยงาน  
  const [agencies, setAgencies] = useState([]); // หน่วยงานที่จัดฝึกอบรม
  const [courses, setCourses] = useState([]); // วิชา
  const [selectedAgency, setSelectedAgency] = useState(''); // id_extage ที่เลือก
  const [filteredCourses, setFilteredCourses] = useState([]); // วิชาที่กรองตาม id_extage
  const [internalChecked, setInternalChecked] = useState(false);
  const [externalChecked, setExternalChecked] = useState(false);
  const [internalBudget, setInternalBudget] = useState(null);
  const [externalBudget, setExternalBudget] = useState(null);
  const [externalAgency, setExternalAgency] = useState('');
  const [planBudget, setPlanBudget] = useState('');
  const [projectOutput, setProjectOutput] = useState('');
  const [mainActivity, setMainActivity] = useState('');
  const [subActivity, setSubActivity] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [formLoading, setFormLoading] = useState(false); // สถานะการโหลดข้อมูลสำหรับฟอร์ม
  const [certificateFile, setCertificateFile] = useState(null);
  const [approvalDocumentFile, setApprovalDocumentFile] = useState(null);
  const [trainingProjectDocumentFile, setTrainingProjectDocumentFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessage1, setErrorMessage1] = useState("");
  const [errorMessage2, setErrorMessage2] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const [responses, setResponses] = useState({
    row1: 'มาก',
    row2: 'มาก',
    row3: 'มาก',
    row4: 'มาก',
    row5: 'มาก'
  });

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const sessionData = await res.json();
        const userStatus = sessionData.status;

        if (userStatus !== "admin" && userStatus !== "superadmin") {
          alert("คุณไม่มีสิทธิเข้าถึงหน้านี้");
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Error checking permission:", error);
      }
    };
    checkPermission();
  }, []);



  const allowedTypes = ["application/pdf", "image/jpg", "image/jpeg", "image/png"];
  const maxFileSize = 5 * 1024 * 1024; // 5MB










  const handleCheckboxChange = (type) => {
    if (type === 'internal') {
      setInternalChecked((prevChecked) => {
        const newChecked = !prevChecked;
        setFormData((prevFormData) => ({
          ...prevFormData,
          internalBudget: newChecked ? prevFormData.internalBudget : null, // ✅ เป็น null เสมอถ้า uncheck
          planBudget: newChecked ? prevFormData.planBudget : "", // ✅ เคลียร์ค่าเมื่อ uncheck
          projectOutput: newChecked ? prevFormData.projectOutput : "", // ✅ เคลียร์ค่าเมื่อ uncheck
          mainActivity: newChecked ? prevFormData.mainActivity : "", // ✅ เคลียร์ค่าเมื่อ uncheck
          subActivity: newChecked ? prevFormData.subActivity : "", // ✅ เคลียร์ค่าเมื่อ uncheck
        }));
        return newChecked;
      });
    } else if (type === 'external') {
      setExternalChecked((prevChecked) => {
        const newChecked = !prevChecked;
        setFormData((prevFormData) => ({
          ...prevFormData,
          externalBudget: newChecked ? prevFormData.externalBudget : null, // ✅ ถ้า uncheck ให้เป็น null
          externalAgency: newChecked ? prevFormData.externalAgency : "", // ✅ ถ้า uncheck รีเซ็ต agency
        }));
        return newChecked;
      });
    }
  };




  const handleAgencyInput = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, externalAgency: value }); // อัปเดตค่าหน่วยงานใน formData
  };




  useEffect(() => {
    if (selectedAgency) {
      fetchCourses(selectedAgency);
    }
  }, [selectedAgency]);





  const handleAgencyChange = (event) => {
    const selectedIdExtage = event.target.value;
    setSelectedAgency(selectedIdExtage); // บันทึก id_extage ที่เลือก
    fetchCourses(selectedIdExtage); // เรียก API เพื่ออัปเดต courses
  };


  useEffect(() => {
    if (trainingOrg) {
      fetchCourses(trainingOrg); // ดึงรายการวิชาเมื่อ trainingOrg เปลี่ยน
    }
  }, [trainingOrg]);









  const [formData, setFormData] = useState({
    trainingOrg: '',
    courseCode: '',
    courseName: '',
    trainingMethod: 'Online',
    onsiteLocation: '',
    hybridLocation: '',
    startDate: '',
    endDate: '',
    costOption: 'noCost',
    regFeeAmount: '',
    accommodationFeeAmount: '',
    transportationFeeAmount: '',
    allowanceFeeAmount: '',
    totalCost: 0,
    internalBudget: '',
    externalBudget: '',
    externalAgency: '',
    planBudget: '',
    projectOutput: '', // เพิ่มตัวแปรนี้
    mainActivity: '',
    subActivity: '',
    approvalDocumentFile: null,
    trainingProjectDocumentFile: null,
    certificateFile: null,
    trainingCourseFile: null,
    submitTime: null, // New field for submission time
    trainingBatch: '', // รุ่นที่/ครั้งที่
    trainingBatchType: 'รุ่นที่', // เพิ่มตัวแปรนี้
  });


  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      internalBudget: prev.internalBudget === "0" || prev.internalBudget === "" ? null : prev.internalBudget,
      externalBudget: prev.externalBudget === "0" || prev.externalBudget === "" ? null : prev.externalBudget,
    }));
  }, []);





  const handleDateChange = (date, name) => {
    if (!date) return; // ถ้าไม่มีค่า ไม่ต้องอัปเดต
    setFormData((prevState) => ({
      ...prevState,
      [name]: date,
    }));
  };


  const convertToBuddhistYear = (date) => {
    if (!date) return '';
    return format(date, 'dd/MM/yyyy').replace(/([0-9]{4})/, (year) => +year + 543);
  };





  const handleInputChange = (e) => {
    const { name, type, value, checked, files } = e.target;

    const inputValue =
      type === "checkbox"
        ? checked
        : type === "file"
          ? files[0]
          : value;

    setFormData((prevState) => {
      let newState = { ...prevState, [name]: inputValue };

      // ✅ ถ้าเลือก "ไม่มีค่าใช้จ่าย" ให้เคลียร์ค่าค่าใช้จ่ายทั้งหมด
      if (name === "costOption" && value === "noCost") {
        newState = {
          ...newState,
          regFeeAmount: "",
          accommodationFeeAmount: "",
          transportationFeeAmount: "",
          allowanceFeeAmount: "",
          totalCost: 0,
        };
      }

      // ✅ ถ้าเลือก "E-learning" หรือ "Online" ให้เคลียร์ค่าสถานที่จัดอบรม
      if (name === "trainingMethod" && (value === "E-learning" || value === "Online")) {
        newState.hybridLocation = "";
      }

      return newState;
    });
  };


  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setResponses((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };


  const calculateTotalCost = () => {
    const internal = parseFloat(String(formData.internalBudget || 0).replace(/,/g, '')) || 0;
    const external = parseFloat(String(formData.externalBudget || 0).replace(/,/g, '')) || 0;

    return formData.costOption === 'hasCost'
      ? internal + external
      : 0;
  };

  useEffect(() => {
    setFormData(prevState => ({
      ...prevState,
      totalCost: calculateTotalCost(),
    }));
  }, [
    formData.internalBudget,
    formData.externalBudget,
    formData.costOption,
  ]);

  // Auto-search username
  useEffect(() => {
    const searchUser = async () => {
      if (!usernameInput || usernameInput.trim() === '') {
        setSearchResult(null);
        setSearchError('');
        return;
      }

      setSearchLoading(true);
      setSearchError('');

      try {
        const response = await fetch(`/api/users?username=${encodeURIComponent(usernameInput.trim())}`);
        if (response.ok) {
          const userData = await response.json();
          setSearchResult(userData);
          setSearchError('');
        } else {
          setSearchResult(null);
          setSearchError('ไม่พบผู้ใช้');
        }
      } catch (error) {
        setSearchResult(null);
        setSearchError('เกิดข้อผิดพลาดในการค้นหา');
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchUser();
    }, 500); // debounce 500ms

    return () => clearTimeout(debounceTimer);
  }, [usernameInput]);

  // เพิ่ม user เข้ารายการ
  const handleAddUser = () => {
    if (!usernameInput || usernameInput.trim() === '') {
      alert('กรุณากรอกรหัสบัตรประชาชน');
      return;
    }

    if (!searchResult) {
      alert('กรุณาตรวจสอบ username ให้ถูกต้อง');
      return;
    }

    // ตรวจสอบว่ามี user นี้ในรายการแล้วหรือยัง
    const exists = userList.some(user => user.username === searchResult.username);
    if (exists) {
      alert('ผู้ใช้นี้ถูกเพิ่มในรายการแล้ว');
      return;
    }

    // เพิ่ม user เข้ารายการ
    const newUser = {
      username: searchResult.username,
      firstName: searchResult.first_name || '',
      lastName: searchResult.last_name || '',
    };

    setUserList([...userList, newUser]);
    setUsernameInput('');
    setSearchResult(null);
    setSearchError('');
  };

  // ลบ user ออกจากรายการ
  const handleRemoveUser = (username) => {
    setUserList(userList.filter(user => user.username !== username));
  };





  const handleSubmit = async (event) => {
    event.preventDefault();

    const formatPeriod = (days, hours, minutes) => {
      let periodParts = [];
      if (days > 0) periodParts.push(`${days} วัน`);
      if (hours > 0) periodParts.push(`${hours} ชม.`);
      if (minutes > 0) periodParts.push(`${minutes} นาที`);
      return periodParts.length > 0 ? periodParts.join(" ") : "";
    };

    const isValidPeriod = (days, hours, minutes) => {
      return days > 0 || hours > 0 || minutes > 0;
    };

    if (!formData.trainingOrg || !formData.courseName) {
      alert("กรุณากรอกหน่วยงานและวิชาฝึกอบรม");
      return;
    }

    if ((formData.trainingMethod === "Onsite" || formData.trainingMethod === "Hybrid") && !formData.hybridLocation) {
      alert("กรุณากรอกสถานที่จัดฝึกอบรม");
      return;
    }


    if (!formData.startDate || !formData.endDate) {
      alert("กรุณาระบุวันที่เข้ารับและสิ้นสุดการอบรม");
      return;
    }


    if (!isValidPeriod(formData.days, formData.hours, formData.minutes)) {
      alert("กรุณากรอกระยะเวลาในการฝึกอบรม");
      return;
    }

    if (externalChecked) {
      if (!formData.externalBudget || !formData.externalAgency) {
        alert("กรุณากรอกจำนวนเงินและหน่วยงานสำหรับงบประมาณภายนอก");
        return;
      }
    }

    if (internalChecked) {
      if (!formData.internalBudget || !formData.planBudget) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วนสำหรับงบประมาณภายใน");
        return;
      }
    }

    // ตรวจสอบว่ามี user ในรายการหรือไม่
    if (userList.length === 0) {
      alert("กรุณาเพิ่มผู้ใช้อย่างน้อย 1 คน");
      return;
    }

    // ดึงค่าที่เลือกจากฟอร์มสำหรับ "การนำความรู้ไปใช้ประโยชน์"
    const knowledgeUsage = Array.from({ length: 5 }).map((_, index) => {
      const radios = document.getElementsByName(`row${index + 1}`);
      const selected = Array.from(radios).find((radio) => radio.checked);
      return selected ? selected.value : null; // Return the value or null if not selected
    });

    const currentTime = new Date();
    const selectedCourse = courses.find(
      (course) => course.code_cou === formData.courseCode
    );
    const category = selectedCourse ? selectedCourse.category : ""; // กำหนดค่าเริ่มต้นของ category
    const trainingType = 2; // กำหนด trainingType เป็น 2 สำหรับ form2

    const uploadFile = async (file, apiEndpoint) => {
      if (!file) return null;
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) throw new Error("การอัปโหลดล้มเหลว");
      const { fileUrl } = await response.json();
      return fileUrl;
    };

    try {
      const [certificateUrl, approvalDocUrl, trainingProjectDocUrl] = await Promise.all([
        uploadFile(certificateFile, "/api/upload-certificate"),
        uploadFile(approvalDocumentFile, "/api/upload-approval"),
        uploadFile(trainingProjectDocumentFile, "/api/upload-training-project"),
      ]);


      function formatDate(date) {
        const [day, month, year] = date.split('/').map(Number);
        const jsDate = new Date(year, month - 1, day + 1); // เดือนเริ่มจาก 0 (มกราคม)
        return jsDate.toISOString().split('T')[0]; // "2025-04-02"
      }

      function formatDateTime(dateString) {
        const date = new Date(dateString);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
      }



      const res = await fetch("/api/auth/session");

      if (!res.ok) {
        // เช่น 401 Unauthorized
        alert("คุณเปิดหน้านี้ทิ้งไว้นานเกินไป กรุณาเข้าสู่ระบบแล้วกรอกแบบฟอร์มใหม่อีกครั้ง");
        window.location.href = "/signin"; // หรือหน้า index ที่ต้องการ
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        alert("คุณเปิดหน้านี้ทิ้งไว้นานเกินไป กรุณาเข้าสู่ระบบแล้วกรอกแบบฟอร์มใหม่อีกครั้ง");
        window.location.href = "/signin";
        return;
      }

      const sessionData = await res.json();
      const storedUsername = sessionData.username;

      // ดึง nickname จาก API
      let checkerName = storedUsername;
      try {
        const profileRes = await fetch(`/api/getUserProfile?username=${storedUsername}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.nickname) {
            checkerName = profileData.nickname;
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile for nickname", err);
      }

      // เตรียมข้อมูลการฝึกอบรม (เหมือนกันทุกคน)
      const trainingData = {
        trainingOrg: formData.trainingOrg,
        courseCode: formData.courseCode || "N/A",
        courseName: formData.courseName,

        trainingBatch: formData.trainingBatch,
        generation: formData.trainingBatchType || 'รุ่นที่',
        trainingType,
        checked: `ตรวจสอบแล้ว ${checkerName}`,

        period: formatPeriod(formData.days, formData.hours, formData.minutes),
        trainingMethod: formData.trainingMethod,
        hybridLocation: formData.hybridLocation,

        startDate: formatDate(formData.startDate),
        endDate: formatDate(formData.endDate),

        regFeeAmount: formData.regFeeAmount,
        accommodationFeeAmount: formData.accommodationFeeAmount,
        transportationFeeAmount: formData.transportationFeeAmount,
        allowanceFeeAmount: formData.allowanceFeeAmount,

        internalBudget: formData.internalBudget,
        externalBudget: formData.externalBudget,
        externalAgency: formData.externalAgency,
        planBudget: formData.planBudget,

        projectOutput: formData.projectOutput,
        mainActivity: formData.mainActivity,
        subActivity: formData.subActivity,
        totalCost: formData.totalCost,

        submitTime: formatDateTime(currentTime),
        knowledgeUsage,

        approvalDocument: approvalDocUrl,
        trainingProjectDocument: trainingProjectDocUrl,
        certificate_url: certificateUrl,

        note: "กบค.2",
      };


      // สร้าง array ของ usernames
      const usernames = userList.map(user => user.username);

      // เตรียมข้อมูลสำหรับส่งไปยัง API
      const data = {
        usernames: usernames,
        trainingData: trainingData,
      };

      // ส่งข้อมูลไปยัง API
      const response = await fetch("/api/submitForm2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("การบันทึกข้อมูลล้มเหลว");
      }

      const result = await response.json();
      console.log(result.message);
      alert(`ส่งข้อมูลสำเร็จสำหรับ ${usernames.length} คน`);
      window.location.href = "/";
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setUploading(false);
    }
  };





  return (

    <>
      <Header />



      <div className="bg-gradient-to-r from-navy via-blue-600 to-cyan-400 min-h-screen flex items-center justify-center py-10">
        <div className="bg-white shadow-xl rounded-lg w-full max-w-3xl p-8">

          <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-800">กรอกแบบฟอร์มรายงานผลการฝึกอบรม (กบค.2)</h1>
          {loading && <p className="text-blue-500">กำลังโหลดข้อมูล...</p>}
          {error && <p className="text-red-500">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">


            {/* ช่องกรอก ชื่อเต็มวิชา */}
            <div className="mb-6">
              {/* Label หลัก */}
              <label htmlFor="courseName" className="block text-lg text-blue-700 font-bold">
                ชื่อหลักสูตร<span className="text-red-500">*</span>
              </label>

              {/* Floating Label */}
              <div className="relative mt-2">
                <input
                  type="text"
                  id="courseName"
                  className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                  placeholder=" "
                  value={formData.courseName || ""}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                />
                <label
                  htmlFor="courseName"
                  className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                >
                  เช่น วัยใส ฉลาดรู้เน็ต
                </label>
              </div>
            </div>

            {/* ช่องกรอก รุ่นที่/ครั้งที่ */}
            <div className="mb-6">
              {/* Label หลัก */}
              <label className="block text-lg text-blue-700 font-bold">
                รุ่นที่ / ครั้งที่
              </label>

              {/* Select + Input */}
              <div className="relative mt-2 flex gap-2">
                {/* Select */}
                <select
                  className="w-32 rounded-md border border-cyan-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0"
                  value={formData.trainingBatchType || "รุ่นที่"}
                  onChange={(e) =>
                    setFormData({ ...formData, trainingBatchType: e.target.value })
                  }
                >
                  <option value="รุ่นที่">รุ่นที่</option>
                  <option value="ครั้งที่">ครั้งที่</option>
                </select>

                {/* Floating Label Input */}
                <div className="relative flex-1">
                  <input
                    type="number"
                    id="trainingBatch"
                    min="1"
                    max="127"
                    className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                    placeholder=" "
                    value={formData.trainingBatch || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || (+val >= 1 && +val <= 127)) {
                        setFormData({ ...formData, trainingBatch: val });
                      }
                    }}
                  />
                  <label
                    htmlFor="trainingBatch"
                    className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 transition-all
        peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2
        peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                  >
                    ไม่ใส่ก็ได้
                  </label>
                </div>
              </div>
            </div>

            {/* ช่องกรอก หน่วยงานที่จัดฝึกอบรม */}
            <div className="mb-6">
              {/* Label หลัก */}
              <label htmlFor="trainingOrg" className="block text-lg text-blue-700 font-bold">
                หน่วยงานที่จัดฝึกอบรม<span className="text-red-500">*</span>
              </label>

              {/* Floating Label */}
              <div className="relative mt-2">
                <input
                  type="text"
                  id="trainingOrg"
                  className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                  placeholder=" "
                  value={formData.trainingOrg || ""}
                  onChange={(e) => setFormData({ ...formData, trainingOrg: e.target.value })}
                />
                <label
                  htmlFor="trainingOrg"
                  className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                >
                  เช่น สำนักงาน ก.พ.
                </label>
              </div>
            </div>







            <div className="mb-6">
              <label className="block text-lg text-blue-700 font-bold">วิธีการอบรม<span className="text-red-500">*</span></label>
              <div className="mt-4 space-x-4">
                <label className="inline-flex items-center" title="เรียนผ่าน Zoom, Google Meet หรือแพลตฟอร์มวิดีโอคอล">
                  <input
                    type="radio"
                    name="trainingMethod"
                    value="Online"
                    checked={formData.trainingMethod === 'Online'}
                    onChange={handleInputChange}
                    className="form-radio h-5 w-5 text-cyan-600"
                  />
                  <span className="ml-2 text-blue-700">Online</span>
                </label>

                <label className="inline-flex items-center" title="เรียนแบบไปยังสถานที่จัดอบรมจริง">
                  <input
                    type="radio"
                    name="trainingMethod"
                    value="Onsite"
                    checked={formData.trainingMethod === 'Onsite'}
                    onChange={handleInputChange}
                    className="form-radio h-5 w-5 text-cyan-600"
                  />
                  <span className="ml-2 text-blue-700">Onsite</span>
                </label>

                {/* Add other radio buttons if needed */}

                {/* Text input for Onsite location */}

                <label className="inline-flex items-center" title="ผสมผสานระหว่าง Onsite และ Online">
                  <input
                    type="radio"
                    name="trainingMethod"
                    value="Hybrid"
                    checked={formData.trainingMethod === 'Hybrid'}
                    onChange={handleInputChange}
                    className="form-radio h-5 w-5 text-cyan-600"
                  />
                  <span className="ml-2 text-blue-700">Hybrid</span>
                </label>

                {/* Add other radio buttons if needed */}

                {/* Text input for Hybrid location */}
                {/* ช่องกรอก สถานที่จัดฝึกอบรม (แสดงเมื่อเลือก Hybrid หรือ Onsite) */}
                <div
                  className={`relative mt-6 ${formData.trainingMethod === "Hybrid" || formData.trainingMethod === "Onsite" ? "block" : "hidden"
                    }`}
                >
                  <input
                    type="text"
                    id="hybridLocation"
                    name="hybridLocation"
                    value={formData.hybridLocation || ""}
                    onChange={handleInputChange}
                    placeholder=" "
                    className="peer block w-full rounded-md border border-gray-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-transparent"
                  />
                  <label
                    htmlFor="hybridLocation"
                    className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 pointer-events-none"
                  >
                    สถานที่จัดฝึกอบรม*
                  </label>
                </div>


              </div></div>




            <div className="flex space-x-6 mb-6">
              <div className="w-1/2">
                <label className="block text-lg text-blue-700 font-bold">
                  วันที่เข้ารับการฝึกอบรม<span className="text-red-500">*</span>
                </label>
                <div className="relative w-full">
                  <ThaiDatePicker
                    value={formData.startDate}
                    onChange={(dateStr) => handleDateChange(dateStr, "startDate")}
                  />
                  <label
                    htmlFor="startDate"
                    className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 pointer-events-none"
                  >
                    เลือกวันที่
                  </label>
                </div>
              </div>


              <div className="w-1/2">
                <label className="block text-lg text-blue-700 font-bold">
                  วันที่สิ้นสุดการฝึกอบรม<span className="text-red-500">*</span>
                </label>
                <div className="relative w-full">
                  <ThaiDatePicker
                    value={formData.endDate}
                    onChange={(dateStr) => handleDateChange(dateStr, "endDate")}
                  />
                  <label
                    htmlFor="endDate"
                    className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 pointer-events-none"
                  >
                    เลือกวันที่
                  </label>
                </div>
              </div>
            </div>




            <div className="mb-6">
              <label className="block text-lg text-blue-700 font-bold">
                ระยะเวลาในการฝึกอบรม<span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                {/* กรอกจำนวนวัน */}
                <div className="relative w-1/3 mt-2">
                  <input
                    type="number"
                    min="0"
                    value={formData.days}
                    onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                    className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                    placeholder=" "
                  />
                  <label
                    className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                  >
                    วัน
                  </label>
                </div>

                {/* กรอกจำนวนชั่วโมง */}
                <div className="relative w-1/3 mt-2">
                  <input
                    type="number"
                    min="0"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                    placeholder=" "
                  />
                  <label
                    className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                  >
                    ชม.
                  </label>
                </div>

                {/* กรอกจำนวนนาที */}
                <div className="relative w-1/3 mt-2">
                  <input
                    type="number"
                    min="0"
                    value={formData.minutes}
                    onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                    className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                    placeholder=" "
                  />
                  <label
                    className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                  >
                    นาที
                  </label>
                </div>
              </div>
            </div>













            {/* ส่วนจัดการ user list */}
            <div className="mb-6">
              <label className="block text-lg text-blue-700 font-bold mb-4">
                เพิ่มผู้ใช้<span className="text-red-500">*</span>
              </label>

              {/* Input field สำหรับกรอก username */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUser();
                    }
                  }}
                  className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                  placeholder=" "
                />
                <label
                  className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                >
                  กรอก username
                </label>

                {/* Popup แสดงผลการค้นหา - แสดงด้านบนของ input field */}
                {searchLoading && (
                  <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-300 rounded shadow-lg p-2 text-sm text-gray-600 z-20">
                    กำลังค้นหา...
                  </div>
                )}
                {searchResult && !searchLoading && (
                  <div className="absolute bottom-full left-0 mb-1 bg-green-50 border border-green-300 rounded shadow-lg p-2 text-sm text-green-700 z-20">
                    พบ: {searchResult.first_name} {searchResult.last_name}
                  </div>
                )}
                {searchError && !searchLoading && (
                  <div className="absolute bottom-full left-0 mb-1 bg-red-50 border border-red-300 rounded shadow-lg p-2 text-sm text-red-700 z-20">
                    {searchError}
                  </div>
                )}
              </div>

              {/* ปุ่มเพิ่มผู้ใช้ */}
              <button
                type="button"
                onClick={handleAddUser}
                disabled={!searchResult || searchLoading}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 mb-4"
              >
                เพิ่มผู้ใช้
              </button>

              {/* ตารางแสดงรายการ user */}
              {userList.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-bold text-blue-700 mb-2">รายการผู้ใช้ ({userList.length} คน)</h3>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="border border-gray-300 p-2 text-left text-blue-700">ลำดับ</th>
                          <th className="border border-gray-300 p-2 text-left text-blue-700">Username</th>
                          <th className="border border-gray-300 p-2 text-left text-blue-700">ชื่อ-นามสกุล</th>
                          <th className="border border-gray-300 p-2 text-center text-blue-700">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userList.map((user, index) => (
                          <tr key={user.username} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-2">{index + 1}</td>
                            <td className="border border-gray-300 p-2">{user.username}</td>
                            <td className="border border-gray-300 p-2">{user.firstName} {user.lastName}</td>
                            <td className="border border-gray-300 p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(user.username)}
                                className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                              >
                                ลบ
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center space-x-4">
              {/* ปุ่มส่งรายงาน */}
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 bounce-hover slide-border"
              >
                <span>{uploading ? "กำลังอัปโหลด..." : "ส่งรายงาน"}</span>
              </button>

              {/* ปุ่มยกเลิก */}
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 rounded-md transition-all duration-200 slide-border-cancel bounce-hover-x"
              >
                ยกเลิก
              </button>

              {uploadedUrl && (
                <p className="mt-4 text-green-600">
                  อัปโหลดสำเร็จ! ลิงก์ไฟล์:{" "}
                  <a
                    href={uploadedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {uploadedUrl}
                  </a>
                </p>
              )}
            </div>





          </form>
        </div>

      </div>
      <style>
        {`
@keyframes bounce-once {
  0%, 100% { transform: translateY(0); }
  20% { transform: translateY(-6px); }
  40% { transform: translateY(6px); }
  60% { transform: translateY(-6px); }
  80% { transform: translateY(6px); }
}
.bounce-hover:hover {
  animation: bounce-once 0.5s ease;
}

@keyframes bounce-once-x {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}
.bounce-hover-x:hover {
  animation: bounce-once-x 0.5s ease;
}



/* ปุ่มส่งรายงาน (น้ำเงิน) */
.slide-border {
  position: relative;
  overflow: hidden;
  background-color: #1e40af;
  color: white;
  transition: background 0.3s ease;
  z-index: 0; /* ตั้ง base */
}

.slide-border::before {
  content: "";
  position: absolute;
  bottom: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, #011627, #1e40af);
  transition: bottom 0.3s ease;
  z-index: -1; /* ย้ายไปอยู่ข้างหลัง */
}

.slide-border:hover {
  background-color: #1d4ed8;
}

.slide-border:hover::before {
  bottom: 0;
}

.slide-border span {
  position: relative;
  z-index: 1; /* ให้ text อยู่เหนือเสมอ */
}

/* ปุ่มยกเลิก (แดง) */
.slide-border-cancel {
  position: relative;
  overflow: hidden;
  background-color: #b91c1c;
  color: white;
  transition: background 0.3s ease;
  z-index: 0;
}

.slide-border-cancel::before {
  content: "";
  position: absolute;
  bottom: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, #450a0a, #b91c1c);
  transition: bottom 0.3s ease;
  z-index: -1; /* บังคับให้อยู่หลัง */
}

.slide-border-cancel:hover {
  background-color: #dc2626;
}

.slide-border-cancel:hover::before {
  bottom: 0;
}

.slide-border-cancel span {
  position: relative;
  z-index: 1;
}

`}
      </style>

    </>
  );
};

export default Form2;

