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
import { useSession } from "next-auth/react";
import DragDropUpload from '../components/DragDropUpload';


import Header from '../components/Header';
import ThaiDatePicker from '../components/Calendar';


registerLocale('th', th);




const Form = () => {
  const router = useRouter();
  const { id } = router.query; // ดึง ID จาก URL


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
  const [internalChecked, setInternalChecked] = useState(true);
  const [externalChecked, setExternalChecked] = useState(true);
  const [internalBudget, setInternalBudget] = useState('');
  const [externalBudget, setExternalBudget] = useState('');
  const [externalAgency, setExternalAgency] = useState('');
  const [planBudget, setPlanBudget] = useState('');
  const [projectOutput, setProjectOutput] = useState('');
  const [mainActivity, setMainActivity] = useState('');
  const [subActivity, setSubActivity] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [formLoading, setFormLoading] = useState(false); // สถานะการโหลดข้อมูลสำหรับฟอร์ม
  const [approvalDocumentFile, setApprovalDocumentFile] = useState(null);
  const [trainingProjectDocumentFile, setTrainingProjectDocumentFile] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessage1, setErrorMessage1] = useState("");
  const [errorMessage2, setErrorMessage2] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [responses, setResponses] = useState({
    row1: 'น้อย',
    row2: 'น้อย',
    row3: 'น้อย',
    row4: 'น้อย',
    row5: 'น้อย'
  });


  useEffect(() => {
    const fetchFormData = async () => {
      console.log("Fetching form data for ID:", id); // Debug ก่อนดึงข้อมูล

      try {
        const response = await fetch(`/api/getFormData/${id}`);
        const data = await response.json();
        console.log("Data received from API:", data); // Debug หลังดึงข้อมูล

        // 🔹 ตรวจสอบ username ว่าตรงกับ localStorage หรือไม่
        const res = await fetch("/api/auth/session");
        const sessionData = await res.json();
        const storedUsername = sessionData.username;
        const userStatus = sessionData.status;

        console.log("Stored Username:", storedUsername); // Debug username
        console.log("User Status from localStorage:", userStatus); // Debug userStatus
        console.log("Data Checked Value:", data.checked); // Debug data.checked

        if (data.username !== storedUsername) {
          alert("คุณไม่มีสิทธิเข้าถึงข้อมูลนี้");
          window.location.href = "/"; // Redirect ไปหน้า index
          return;
        }

        // 🔹 ตรวจสอบสิทธิ์หาก checked = "ตรวจสอบแล้ว"
        if (data.checked.includes("ตรวจสอบแล้ว")) {
          alert("คุณไม่มีสิทธิเข้าถึงข้อมูลนี้ เนื่องจากได้รับการตรวจสอบแล้ว");
          window.location.href = "/"; // Redirect ไปหน้า index
          return;
        }

        // 🔹 แปลงค่า period เป็น days, hours, minutes
        const periodMatch = data.period?.match(/(?:(\d+)\s*วัน)?\s*(?:(\d+)\s*ชม\.)?\s*(?:(\d+)\s*นาที)?/);
        const days = periodMatch && periodMatch[1] ? parseInt(periodMatch[1], 10) : 0;
        const hours = periodMatch && periodMatch[2] ? parseInt(periodMatch[2], 10) : 0;
        const minutes = periodMatch && periodMatch[3] ? parseInt(periodMatch[3], 10) : 0;


        // 🔹 อัปเดตค่า formData
        setFormData((prev) => {
          const updatedFormData = {
            ...prev,
            ...data,
            courseCode: data.courseCode === "N/A" ? "" : data.courseCode, // ✅ แปลง "N/A" เป็น ""
            days,
            hours,
            minutes,
            telephone: data.telephone || '', // ดึงเบอร์โทรที่เคยกรอกไว้
          };
          console.log("Updated formData:", updatedFormData); // Debug ค่า formData ที่อัปเดต
          return updatedFormData;
        });

        // 🔹 อัปเดต responses
        setResponses({
          row1: data.knowledgeSelfDevelop || "น้อย",
          row2: data.knowledgeWorkImprove || "น้อย",
          row3: data.knowledgeTeamwork || "น้อย",
          row4: data.knowledgeEfficiency || "น้อย",
          row5: data.knowledgeNetworking || "น้อย",
        });

      } catch (error) {
        console.error("Error fetching form data:", error); // Debug เมื่อเกิดข้อผิดพลาด
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        window.location.href = "/"; // Redirect ไปหน้า index เมื่อเกิดข้อผิดพลาด
      }
    };

    if (id) {
      fetchFormData();
    } else {
      console.log("No ID provided, skipping data fetch."); // Debug เมื่อไม่มี ID
    }
  }, [id]);




  const allowedTypes = ["application/pdf", "image/jpg", "image/jpeg", "image/png"];
  const maxFileSize = 5 * 1024 * 1024; // 5MB


  const handleFileUpload = (event, setFile) => {
    const file = event.target.files[0];

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage("กรุณาอัพโหลดไฟล์ที่เป็นรูปภาพ (JPG, JPEG, PNG) หรือ PDF เท่านั้น");
        setFile(null);
        return;
      }
      if (file.size > maxFileSize) {
        setErrorMessage("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
        setFile(null);
        return;
      }

      setFile(file);
      setErrorMessage(""); // เคลียร์ข้อความแจ้งเตือนเมื่อไฟล์ถูกต้อง
    }
  };

  const handleFileUpload1 = (event, setFile) => {
    const file = event.target.files[0];

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage1("กรุณาอัพโหลดไฟล์ที่เป็นรูปภาพ (JPG, JPEG, PNG) หรือ PDF เท่านั้น");
        setFile(null);
        return;
      }
      if (file.size > maxFileSize) {
        setErrorMessage1("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
        setFile(null);
        return;
      }

      setFile(file);
      setErrorMessage1(""); // เคลียร์ข้อความแจ้งเตือนเมื่อไฟล์ถูกต้อง
    }
  };

  const handleFileUpload2 = (event, setFile) => {
    const file = event.target.files[0];

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage2("กรุณาอัพโหลดไฟล์ที่เป็นรูปภาพ (JPG, JPEG, PNG) หรือ PDF เท่านั้น");
        setFile(null);
        return;
      }
      if (file.size > maxFileSize) {
        setErrorMessage2("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
        setFile(null);
        return;
      }

      setFile(file);
      setErrorMessage2(""); // เคลียร์ข้อความแจ้งเตือนเมื่อไฟล์ถูกต้อง
    }
  };











  const [formData, setFormData] = useState({
    trainingOrg: '',
    courseCode: '',
    courseName: '',
    trainingMethod: 'E-learning',
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
    projectOutput: '',
    mainActivity: '',
    subActivity: '',
    approvalDocumentFile: null,
    trainingProjectDocumentFile: null,
    certificateFile: null,
    trainingCourseFile: null,
    confirmCheckbox: false,
    editTime: null, // New field for submission time
    whoEdit: null,
    telephone: '', // เพิ่มตัวแปรเบอร์โทร
  });



  const handleChange = (row, value) => {
    setResponses((prev) => ({
      ...prev,
      [row]: value,
    }));
  };


  const handleDateChange = (value, field) => {
    // แปลง dd/mm/yyyy เป็น Date object
    const [day, month, year] = value.split('/');
    const dateObj = new Date(`${year}-${month}-${day}`); // yyyy-mm-dd (JS เข้าใจ)

    setFormData((prev) => ({ ...prev, [field]: dateObj }));
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

    // อัปเดตค่าของ formData
    setFormData((prevFormData) => {
      const updatedFormData = { ...prevFormData, [name]: value };

      // ตรวจสอบค่า regFeeAmount, accommodationFeeAmount, transportationFeeAmount, allowanceFeeAmount และปรับ costOption
      if (
        parseFloat(updatedFormData.regFeeAmount) > 0 ||
        parseFloat(updatedFormData.accommodationFeeAmount) > 0 ||
        parseFloat(updatedFormData.transportationFeeAmount) > 0 ||
        parseFloat(updatedFormData.allowanceFeeAmount) > 0
      ) {
        updatedFormData.costOption = 'hasCost';
      } else {
        updatedFormData.costOption = 'noCost';
      }

      return updatedFormData;
    });
  };


  // ตรวจสอบค่า totalCost และตั้งค่าตั้นเมื่อเปลี่ยนค่าโดยตรง
  useEffect(() => {
    setFormData((prevFormData) => {
      const hasCost =
        parseFloat(prevFormData.regFeeAmount) > 0 ||
        parseFloat(prevFormData.accommodationFeeAmount) > 0 ||
        parseFloat(prevFormData.transportationFeeAmount) > 0 ||
        parseFloat(prevFormData.allowanceFeeAmount) > 0;

      return {
        ...prevFormData,
        costOption: hasCost ? 'hasCost' : 'noCost',
      };
    });
  }, [
    formData.regFeeAmount,
    formData.accommodationFeeAmount,
    formData.transportationFeeAmount,
    formData.allowanceFeeAmount,
  ]);




  const calculateTotalCost = () => {
    const regFee = parseFloat(formData.regFeeAmount.replace(/,/g, '')) || 0;
    const accommodationFee = parseFloat(formData.accommodationFeeAmount.replace(/,/g, '')) || 0;
    const transportationFee = parseFloat(formData.transportationFeeAmount.replace(/,/g, '')) || 0;
    const allowanceFee = parseFloat(formData.allowanceFeeAmount.replace(/,/g, '')) || 0;

    return formData.costOption === 'hasCost'
      ? regFee + accommodationFee + transportationFee + allowanceFee
      : 0;
  };

  useEffect(() => {
    setFormData(prevState => ({
      ...prevState,
      totalCost: calculateTotalCost(),
    }));
  }, [
    formData.regFeeAmount,
    formData.accommodationFeeAmount,
    formData.transportationFeeAmount,
    formData.allowanceFeeAmount,
    formData.costOption,
  ]);




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
      alert("กรุณาระบุวันที่เริ่มต้นและสิ้นสุด");
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



    // ตรวจสอบเงื่อนไขต่าง ๆ
    if (!formData.confirmCheckbox) {
      alert("กรุณายอมรับเงื่อนไขก่อนส่งข้อมูล");
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



      // เตรียมข้อมูลสำหรับส่งไปยังฐานข้อมูล
      function toMysqlDate(dateString) {
        return new Date(dateString).toISOString().split('T')[0]; // --> "2025-04-02"
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
      const sessionData = await res.json();
      const storedUsername = sessionData.username;

      const data = {


        username: storedUsername || "",
        trainingOrg: formData.trainingOrg, // เอาค่าที่ผู้ใช้กรอก
        courseCode: formData.courseCode || "N/A", // เอาค่าที่ผู้ใช้กรอก
        courseName: formData.courseName, // ต้องเพิ่ม field นี้ด้วย
        period: formatPeriod(formData.days, formData.hours, formData.minutes), // 🆕 แปลงค่า period
        category: category,
        trainingMethod: formData.trainingMethod,
        onsiteLocation: formData.onsiteLocation,
        hybridLocation: formData.hybridLocation,
        startDate: toMysqlDate(formData.startDate),
        endDate: toMysqlDate(formData.endDate),
        costOption: formData.costOption,
        regFeeAmount: formData.regFeeAmount,
        accommodationFeeAmount: formData.accommodationFeeAmount,
        transportationFeeAmount: formData.transportationFeeAmount,
        allowanceFeeAmount: formData.allowanceFeeAmount,
        totalCost: formData.totalCost,
        internalBudget: formData.internalBudget,
        externalBudget: formData.externalBudget,
        externalAgency: formData.externalAgency,
        planBudget: formData.planBudget,
        projectOutput: formData.projectOutput,
        mainActivity: formData.mainActivity,
        subActivity: formData.subActivity,
        editTime: formatDateTime(currentTime),
        whoEdit: storedUsername || "",
        knowledgeUsage,
        approvalDocument: approvalDocUrl,
        trainingProjectDocument: trainingProjectDocUrl,
        certificate_url: certificateUrl,
        telephone: formData.telephone, // ส่งเบอร์โทรศัพท์กลับ
      };



      // ส่งข้อมูลไปยัง API
      const response = await fetch("/api/editForm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...data }), // รวม id เข้ากับข้อมูลใน data
      });


      if (!response.ok) {
        throw new Error("การบันทึกข้อมูลล้มเหลว");
      }

      const result = await response.json();
      console.log(result.message);
      alert("แก้ไขมูลสำเร็จ");
      window.location.href = "/";
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (field) => {
    if (!window.confirm("คุณต้องการลบเอกสารนี้ใช่หรือไม่?")) return;

    try {
      const response = await fetch("/api/deleteDocument", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, field }),
      });

      if (!response.ok) throw new Error("ลบเอกสารไม่สำเร็จ");

      // Update local state
      setFormData((prev) => {
        const newState = { ...prev };
        if (field === 'approval_document') newState.approval_document = null;
        if (field === 'training_project_document') newState.training_project_document = null;
        if (field === 'certificate_url') newState.certificate_url = null;
        return newState;
      });

      alert("ลบเอกสารเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("เกิดข้อผิดพลาดในการลบเอกสาร");
    }
  };





  // ฟังก์ชันตรวจสอบค่า budget เพื่อกำหนดค่าเริ่มต้น
  useEffect(() => {
    setInternalChecked(formData.internalBudget > 0);
    setExternalChecked(formData.externalBudget > 0);
  }, [formData.internalBudget, formData.externalBudget]);

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





  return (

    <>
      <Header />



      <div className="bg-gradient-to-r from-navy via-blue-600 to-cyan-400 min-h-screen flex items-center justify-center py-10">
        <div className="bg-white shadow-xl rounded-lg w-full max-w-3xl p-8">

          <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-800">กรอกแบบฟอร์มรายงานผลการฝึกอบรม</h1>
          {loading && <p className="text-blue-500">กำลังโหลดข้อมูล...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {formData.formCode && (
            <div className="text-right mb-4">
              <span className="font-bold text-gray-700">รหัสรายงาน: </span>
              <span className="text-blue-600 font-semibold">{formData.formCode}</span>
            </div>
          )}

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

            {/* ช่องกรอก หน่วยงานที่จัดฝึกอบรม */}
            <div className="mb-6">
              {/* Label หลัก */}
              <label htmlFor="trainingOrg" className="block text-lg text-blue-700 font-bold">
                หน่วยงานภายนอกที่จัดฝึกอบรม<span className="text-red-500">*</span>
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
                <label className="inline-flex items-center" title="เรียนผ่านระบบ E-learning แบบมีแพลตฟอร์ม">
                  <input
                    type="radio"
                    name="trainingMethod"
                    value="E-learning"
                    checked={formData.trainingMethod === 'E-learning'}
                    onChange={handleInputChange}
                    className="form-radio h-5 w-5 text-cyan-600"
                  />
                  <span className="ml-2 text-blue-700">E-learning</span>
                </label>
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





            <div className="mb-6">
              <label className="block text-lg text-blue-700 font-bold">ค่าใช้จ่ายในการฝึกอบรม</label>
              <div className="mt-4 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="costOption"
                    value="noCost"
                    checked={formData.costOption === 'noCost'}
                    onChange={handleInputChange}
                    className="form-radio h-5 w-5 text-cyan-600"
                  />
                  <span className="ml-2 text-blue-700">ไม่มีค่าใช้จ่าย</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="costOption"
                    value="hasCost"
                    checked={formData.costOption === 'hasCost'}
                    onChange={handleInputChange}
                    className="form-radio h-5 w-5 text-cyan-600"
                  />
                  <span className="ml-2 text-blue-700">มีค่าใช้จ่าย</span>
                </label>
              </div>
            </div>
            {formData.costOption === 'hasCost' && (
              <>{/* ค่าลงทะเบียน */}
                <div className="relative mb-6">
                  <input
                    type="number"
                    id="regFeeAmount"
                    name="regFeeAmount"
                    value={formData.regFeeAmount}
                    onChange={handleInputChange}
                    min="0"
                    className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                    placeholder=" "
                  />
                  <label
                    htmlFor="regFeeAmount"
                    className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                  >
                    ค่าลงทะเบียน (บาท)
                  </label>
                </div>

                {/* ค่าที่พัก */}
                <div className="relative mb-6">
                  <input
                    type="number"
                    id="accommodationFeeAmount"
                    name="accommodationFeeAmount"
                    value={formData.accommodationFeeAmount}
                    onChange={handleInputChange}
                    min="0"
                    className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                    placeholder=" "
                  />
                  <label
                    htmlFor="accommodationFeeAmount"
                    className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                  >
                    ค่าที่พัก (บาท)
                  </label>
                </div>

                {/* ค่าเดินทาง */}
                <div className="relative mb-6">
                  <input
                    type="number"
                    id="transportationFeeAmount"
                    name="transportationFeeAmount"
                    value={formData.transportationFeeAmount}
                    onChange={handleInputChange}
                    min="0"
                    className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                    placeholder=" "
                  />
                  <label
                    htmlFor="transportationFeeAmount"
                    className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                  >
                    ค่าเดินทาง (บาท)
                  </label>
                </div>

                {/* ค่าเบี้ยเลี้ยง */}
                <div className="relative mb-6">
                  <input
                    type="number"
                    id="allowanceFeeAmount"
                    name="allowanceFeeAmount"
                    value={formData.allowanceFeeAmount}
                    onChange={handleInputChange}
                    min="0"
                    className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                    placeholder=" "
                  />
                  <label
                    htmlFor="allowanceFeeAmount"
                    className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                  >
                    ค่าเบี้ยเลี้ยง (บาท)
                  </label>
                </div>

                {/* ค่าใช้จ่ายรวม (อ่านอย่างเดียว) */}
                <div className="relative mb-6">
                  <input
                    type="text"
                    id="totalCost"
                    name="totalCost"
                    value={formData.totalCost.toLocaleString()}
                    readOnly
                    className="peer block w-full rounded-md border border-gray-300 bg-gray-100 px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-gray-400 focus:ring-0 placeholder-transparent"
                    placeholder=" "
                  />
                  <label
                    htmlFor="totalCost"
                    className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-gray-100 px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-gray-600"
                  >
                    ค่าใช้จ่ายรวม (บาท)
                  </label>
                </div>


                {/* งบประมาณจาก */}<div className="mb-6">
                  <label className="block text-lg text-blue-700 font-bold">งบประมาณจาก</label>


                  <div className="mt-4 space-y-4">
                    {/* ✅ Checkbox สำหรับเลือกภายในกรมประมง */}
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={internalChecked}
                        onChange={() => handleCheckboxChange('internal')}
                        className="form-checkbox h-5 w-5 text-cyan-600"
                      />
                      <span className="ml-2 text-blue-700">ภายในกรมประมง</span>
                    </label>

                    {internalChecked && (
                      <>{/* งบประมาณภายในกรมประมง */}
                        <div className="relative mb-6">
                          <input
                            type="number"
                            value={formData.internalBudget ?? ''}
                            onChange={(e) => setFormData({ ...formData, internalBudget: e.target.value })}
                            min="0"
                            className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                            placeholder=" "
                          />
                          <label
                            className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                          >
                            ระบุจำนวนเงินที่ใช้ (บาท)*
                          </label>
                        </div>

                        {/* เบิกจ่ายงบประมาณจากแผนงาน */}
                        <div className="relative mb-6">
                          <input
                            type="text"
                            value={formData.planBudget}
                            onChange={(e) => setFormData({ ...formData, planBudget: e.target.value })}
                            className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                            placeholder=" "
                          />
                          <label
                            className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                          >
                            ระบุแผนงาน/โครงการ*
                          </label>
                        </div>


                      </>
                    )}
                  </div>

                  <div className="mt-4 space-y-4">
                    {/* ✅ Checkbox สำหรับเลือกภายนอกกรมประมง */}
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={externalChecked}
                        onChange={() => handleCheckboxChange('external')}
                        className="form-checkbox h-5 w-5 text-cyan-600"
                      />
                      <span className="ml-2 text-blue-700">ภายนอกกรมประมง</span>
                    </label>

                    {externalChecked && (
                      <>
                        {/* Input งบประมาณ */}
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.externalBudget ?? ''}
                            onChange={(e) => setFormData({ ...formData, externalBudget: e.target.value })}
                            min="0"
                            className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                            placeholder=" "
                          />
                          <label
                            className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                          >
                            ระบุจำนวนเงินที่ใช้ (บาท)*
                          </label>
                        </div>

                        {/* Input หน่วยงาน */}
                        <div className="relative mt-4">
                          <input
                            type="text"
                            value={formData.externalAgency}
                            onChange={(e) => setFormData({ ...formData, externalAgency: e.target.value })}
                            className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                            placeholder=" "
                          />
                          <label
                            className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                          >
                            จากหน่วยงาน*
                          </label>
                        </div>
                      </>
                    )}
                  </div>


                </div>
              </>
            )}


            <h2 className="mt-5 mb-3 text-lg font-bold text-blue-700">การนำความรู้หลังจากที่ได้เข้ารับการฝึกอบรมไปใช้ประโยชน์<span className="text-red-500">*</span></h2>        <table className="w-full border-collapse mb-5">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-3 text-blue-700">ประเภทการนำความรู้</th>

                  <th className="border border-gray-300 p-3 text-blue-700">มาก (&gt;80%)</th>
                  <th className="border border-gray-300 p-3 text-blue-700">ปานกลาง (60-80%)</th>

                  <th className="border border-gray-300 p-3 text-blue-700">น้อย (&lt;60%)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "พัฒนาตนเอง/นำมาเป็นแนวทางในการปฏิบัติงาน",
                  "พัฒนา/แก้ไขปัญหา/ปรับปรุง/เปลี่ยนแปลงงานที่ปฏิบัติให้ดียิ่งขึ้น",
                  "แลกเปลี่ยนมุมมองระหว่างทีมงาน/ถ่ายทอดความรู้",
                  "เกิดการเปลี่ยนแปลงในด้านประสิทธิภาพและประสิทธิผลของงาน",
                  "สร้างเครือข่ายและบูรณาการทำงานร่วมกันภายในองค์กร",
                ].map((detail, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-3 text-blue-700">
                      {index + 1}. {detail}
                    </td>
                    <td className="border border-gray-300 text-center">
                      <input
                        type="radio"
                        name={`row${index + 1}`}
                        value="มาก"
                        checked={responses[`row${index + 1}`] === "มาก"}
                        onChange={() => handleChange(`row${index + 1}`, "มาก")}
                        className="form-radio h-5 w-5 text-cyan-600"
                      />
                    </td>
                    <td className="border border-gray-300 text-center">
                      <input
                        type="radio"
                        name={`row${index + 1}`}
                        value="ปานกลาง"
                        checked={responses[`row${index + 1}`] === "ปานกลาง"}
                        onChange={() => handleChange(`row${index + 1}`, "ปานกลาง")}
                        className="form-radio h-5 w-5 text-cyan-600"
                      />
                    </td>

                    <td className="border border-gray-300 text-center">
                      <input
                        type="radio"
                        name={`row${index + 1}`}
                        value="น้อย"
                        checked={responses[`row${index + 1}`] === "น้อย"}
                        onChange={() => handleChange(`row${index + 1}`, "น้อย")}
                        className="form-radio h-5 w-5 text-cyan-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>


            <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded text-gray-800 text-sm">
              <p>
                กรุณาแนบเอกสาร PDF หรือรูปภาพ (JPG, JPEG, PNG) ขนาดไม่เกิน <b>5MB</b>  </p><p> หากมีหลายหน้า ให้รวมเป็นไฟล์ PDF
                  และหากต้องการความช่วยเหลือในการแปลงไฟล์
                <a href="/pdf-guide.html" target="_blank" className="text-blue-600 underline ml-1">ศึกษาที่นี่</a>
              </p>
              <p className="mt-1 text-sm text-gray-700">
                หมายเหตุ: ชื่อไฟล์หรือที่อยู่ไฟล์ (path) ต้องไม่ยาวเกินไป หากชื่อไฟล์ยาวมาก
                ระบบอาจไม่สามารถอัปโหลดได้ แนะนำให้ตั้งชื่อไฟล์สั้น กระชับ และเป็นภาษาอังกฤษ
              </p>


              {/* === เอกสารอนุมัติตัวบุคคล === */}
              <div className="mb-6">
                <label className="block text-lg text-blue-700 font-bold">
                  เอกสารอนุมัติตัวบุคคล
                </label>

                {formData.approval_document && (
                  <div className="mt-2 flex items-center gap-4">
                    <p className="text-blue-600">
                      <a
                        href={formData.approval_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        ตรวจสอบเอกสารที่อัปโหลด
                      </a>
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument('approval_document')}
                      className="text-red-500 hover:text-red-700 underline text-sm"
                    >
                      ลบเอกสาร
                    </button>
                  </div>
                )}

                <DragDropUpload
                  label=""
                  fileType="approval"
                  errorMessage={errorMessage}
                  onFileSelect={(file, error) => {
                    if (error) {
                      setApprovalDocumentFile(null);
                      setErrorMessage(error);
                      return;
                    }

                    if (!file) {
                      setApprovalDocumentFile(null);
                      setErrorMessage("");
                      return;
                    }

                    setApprovalDocumentFile(file);
                    setErrorMessage("");
                  }}
                />
              </div>

              {/* === เอกสารโครงการฝึกอบรม === */}
              <div className="mb-6">
                <label className="block text-lg text-blue-700 font-bold">
                  เอกสารโครงการฝึกอบรม (กรณีเป็น E-Learning ไม่ต้องแนบ)
                </label>

                {formData.training_project_document && (
                  <div className="mt-2 flex items-center gap-4">
                    <p className="text-blue-600">
                      <a
                        href={formData.training_project_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        ตรวจสอบเอกสารที่อัปโหลด
                      </a>
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument('training_project_document')}
                      className="text-red-500 hover:text-red-700 underline text-sm"
                    >
                      ลบเอกสาร
                    </button>
                  </div>
                )}

                <DragDropUpload
                  label=""
                  fileType="training-project"
                  errorMessage={errorMessage1}
                  onFileSelect={(file, error) => {
                    if (error) {
                      setTrainingProjectDocumentFile(null);
                      setErrorMessage1(error);
                      return;
                    }

                    if (!file) {
                      setTrainingProjectDocumentFile(null);
                      setErrorMessage1("");
                      return;
                    }

                    setTrainingProjectDocumentFile(file);
                    setErrorMessage1("");
                  }}
                />
              </div>

              {/* === ประกาศนียบัตร (ถ้ามี) === */}
              <div className="mb-6">
                <label className="block text-lg text-blue-700 font-bold">
                  ประกาศนียบัตร (ถ้ามี)
                </label>

                {formData.certificate_url && (
                  <div className="mt-2 flex items-center gap-4">
                    <p className="text-blue-600">
                      <a
                        href={formData.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        ตรวจสอบประกาศนียบัตรที่อัปโหลด
                      </a>
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument('certificate_url')}
                      className="text-red-500 hover:text-red-700 underline text-sm"
                    >
                      ลบเอกสาร
                    </button>
                  </div>
                )}

                <DragDropUpload
                  label=""
                  fileType="certificate"
                  errorMessage={errorMessage2}
                  onFileSelect={(file, error) => {
                    if (error) {
                      setCertificateFile(null);
                      setErrorMessage2(error);
                      return;
                    }

                    if (!file) {
                      setCertificateFile(null);
                      setErrorMessage2("");
                      return;
                    }

                    setCertificateFile(file);
                    setErrorMessage2("");
                  }}
                />
              </div>
            </div>


            {/* ช่องกรอกเบอร์โทรศัพท์ */}
            <div className="mb-6">
              <label htmlFor="telephone" className="block text-lg text-blue-700 font-bold">
                เบอร์โทรศัพท์ที่ติดต่อกลับได้<span className="text-red-500">*</span>
              </label>
              <div className="relative mt-2">
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="peer block w-full rounded-md border border-cyan-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-cyan-500 focus:ring-0 placeholder-transparent"
                  placeholder=" "
                />
                <label
                  htmlFor="telephone"
                  className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-400 font-normal transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-cyan-500 pointer-events-none"
                >
                  เช่น 081-234-5678
                </label>
              </div>
            </div>



            <div className="mb-5">
              <label htmlFor="confirmCheckbox" className="flex items-center">
                <input
                  type="checkbox"
                  id="confirmCheckbox"
                  name="confirmCheckbox"
                  checked={formData.confirmCheckbox}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <b>ข้าพเจ้ารับรองว่าข้อมูลและเอกสารหลักฐานนี้ มีความถูกต้องสมบูรณ์และครบถ้วนทุกประการ<span className="text-red-500">*</span></b>
              </label>
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

export default Form;

