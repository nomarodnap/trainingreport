import './styles.css';
import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import th from 'date-fns/locale/th';
import { format, sub } from 'date-fns'; 
import TrainingMethod from './TrainingMethod';
import axios from "axios";
import { useParams } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { useRouter } from "next/router";



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










  const handleCheckboxChange = (type) => {
    if (type === 'internal') {
      setInternalChecked(!internalChecked);
      if (internalChecked) setInternalBudget('');
    } else if (type === 'external') {
      setExternalChecked(!externalChecked);
      if (externalChecked) {
        setExternalBudget('');
        setExternalAgency('');
      }
    }
  };


const handleAgencyInput = (e) => {
  const value = e.target.value;
  setFormData({ ...formData, externalAgency: value }); // อัปเดตค่าหน่วยงานใน formData
};








  useEffect(() => {
    const fetchAgencies = async () => {
      const response = await fetch("/api/getAgencies");
      const data = await response.json();
      setAgencies(data);
    };

    fetchAgencies();
  }, []);



  const fetchCourses = async (id_extage) => {
    const response = await fetch(`/api/getCourses?id_extage=${id_extage}`);
    const data = await response.json();
    setCourses(data);
  };


useEffect(() => {
  if (selectedAgency) {
    fetchCourses(selectedAgency);
  }
}, [selectedAgency]);







  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/getOrganizations'); // คุณต้องสร้าง API สำหรับดึงหน่วยงาน
      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };



const handleAgencyChange = (event) => {
  const selectedIdExtage = event.target.value;
  setSelectedAgency(selectedIdExtage); // บันทึก id_extage ที่เลือก
  fetchCourses(selectedIdExtage); // เรียก API เพื่ออัปเดต courses
};


  useEffect(() => {
    fetchOrganizations(); // ดึงรายการหน่วยงานตอนโหลดหน้า
  }, []);

  useEffect(() => {
    if (trainingOrg) {
      fetchCourses(trainingOrg); // ดึงรายการวิชาเมื่อ trainingOrg เปลี่ยน
    }
  }, [trainingOrg]);



useEffect(() => {
  const initializeData = async () => {
    try {
      const [orgResponse, agenciesResponse] = await Promise.all([
        fetch('/api/getOrganizations'),
        fetch('/api/getExteagencies'),
      ]);

      const organizations = await orgResponse.json();
      const exteagencies = await agenciesResponse.json();

      setOrganizations(organizations);
      setExteagencies(exteagencies);

      const storedUsername = localStorage.getItem('username');
      if (storedUsername) setUsername(storedUsername);
    } catch (error) {
      console.error("Failed to initialize data:", error);
    }
  };

  initializeData();
}, []);


  const handleOrgChange = async (e) => {
    const id_extage = e.target.value;
    setSelectedOrg(id_extage);

    // ดึงวิชาที่เกี่ยวข้องกับหน่วยงานที่เลือก
    try {
      const response = await fetch(`/api/getCourses?id_extage=${id_extage}`);
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };


  const [responses, setResponses] = useState({
    row1: "น้อย",
    row2: "น้อย",
    row3: "น้อย",
    row4: "น้อย",
    row5: "น้อย",
  });

  // ดึงข้อมูลจากฐานข้อมูล
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/getFormData/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();

        console.log("Fetched Data:", data); // ตรวจสอบข้อมูลที่ดึงมา
        setResponses({
          row1: data.knowledgeSelfDevelop || "น้อย",
          row2: data.knowledgeWorkImprove || "น้อย",
          row3: data.knowledgeTeamwork || "น้อย",
          row4: data.knowledgeEfficiency || "น้อย",
          row5: data.knowledgeNetworking || "น้อย",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [id]);








  const [formData, setFormData] = useState({
    trainingOrg: '',
    courseCode: '',
    trainingMethod: '',
    onsiteLocation: '',
    hybridLocation: '',
    startDate: null,
    endDate: null,
    costOption: 'hasCost',
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
    certificateFile: null,
    trainingCourseFile: null,
    confirmCheckbox: false,
    submitTime: null, // New field for submission time
  });


useEffect(() => {
  const fetchFormData = async () => {
    console.log("Fetching form data for ID:", id); // Debug ก่อนดึงข้อมูล
    try {
      const response = await fetch(`/api/getFormData/${id}`);
      const data = await response.json();
      console.log("Data received from API:", data); // Debug หลังดึงข้อมูล

      setFormData((prev) => {
        const updatedFormData = {
          ...prev,
          ...data,
          courseCode: null, // ตั้งค่า courseCode เป็น NULL ถ้าไม่มีค่า
        };
        console.log("Updated formData:", updatedFormData); // Debug ค่า formData ที่อัปเดต
        return updatedFormData;
      });
    } catch (error) {
      console.error("Error fetching form data:", error); // Debug เมื่อเกิดข้อผิดพลาด
    }
  };

  if (id) {
    fetchFormData();
  } else {
    console.log("No ID provided, skipping data fetch."); // Debug เมื่อไม่มี ID
  }
}, [id]);


  const handleChange = (row, value) => {
    setResponses((prev) => ({
      ...prev,
      [row]: value,
    }));
  };


  useEffect(() => {
    const fetchFormData = async () => {
      console.log("Fetching form data for ID:", id); // Debug ก่อนดึงข้อมูล
      try {
        const response = await fetch(`/api/getFormData/${id}`);
        const data = await response.json();
        console.log("Data received from API:", data); // Debug หลังดึงข้อมูล

        setFormData((prev) => {
          const updatedFormData = { ...prev, ...data };
          console.log("Updated formData:", updatedFormData); // Debug ค่า formData ที่อัปเดต
          return updatedFormData;
        });
      } catch (error) {
        console.error("Error fetching form data:", error); // Debug เมื่อเกิดข้อผิดพลาด
      }
    };

    if (id) {
      fetchFormData();
    } else {
      console.log("No ID provided, skipping data fetch."); // Debug เมื่อไม่มี ID
    }
  }, [id]);





  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleDateChange = (date, name) => {
    setFormData(prevState => ({ ...prevState, [name]: date }));
  };

  const convertToBuddhistYear = (date) => {
    if (!date) return '';
    return format(date, 'dd/MM/yyyy').replace(/([0-9]{4})/, (year) => +year + 543);
  };





const handleInputChange = (e) => {
  const { name, type, value, checked, files } = e.target;

  const inputValue = type === "checkbox"
    ? checked
    : type === "file"
    ? files[0]
    : value;

  setFormData((prevState) => ({
    ...prevState,
    [name]: inputValue,
  }));
};


  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setResponses((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };


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



const orgMap = {
  "01": "GDCC - สำนักงานคณะกรรมการดิจิทัลเพื่อเศรษฐกิจและสังคมแห่ง",
  "02": "TDGA - สถาบันพัฒนาบุคลากรภาครัฐด้านดิจิทัล",
  "03": "สำนักงาน ก.พ. - สำนักงานคณะกรรมการข้าราชการพลเรือน",
  "04": "สำนักงาน ก.พ.ร. - สำนักงานคณะกรรมการพัฒนาระบบราชการ",
  // เพิ่มค่าอื่น ๆ ตามที่ต้องการ
};


  
const handleSubmit = async (event) => {
  event.preventDefault();
console.log("formData:", formData);
  if (!formData.confirmCheckbox) {
    alert("กรุณายอมรับเงื่อนไขก่อนแก้ไขข้อมูล");
    return;
  }

  if (!formData.startDate || !formData.endDate) {
    alert("กรุณาระบุวันที่เริ่มต้นและสิ้นสุด");
    return;
  }

  if (!formData.trainingOrg || !formData.courseCode) {
    alert("กรุณาเลือกหน่วยงานและวิชาฝึกอบรม");
    return;
  }

  // ดึงค่าที่เลือกจากฟอร์มสำหรับ "การนำความรู้ไปใช้ประโยชน์"
  const knowledgeUsage = Array.from({ length: 5 }).map((_, index) => {
    const radios = document.getElementsByName(`row${index + 1}`);
    const selected = Array.from(radios).find((radio) => radio.checked);
    return selected ? selected.value : null; // Return the value or null if not selected
  });

  const currentTime = new Date();
  const selectedCourse = courses.find((course) => course.code_cou === formData.courseCode);
  const category = selectedCourse ? selectedCourse.category : ''; // กำหนดค่าเริ่มต้นของ category
  const data = {
    id, // เพิ่ม id จาก router.query
    username: localStorage.getItem("username") || "",
    trainingOrg: orgMap[formData.trainingOrg] || formData.trainingOrg,
    courseCode: selectedCourse
      ? `${selectedCourse.code_cou} - ${selectedCourse.name_cou}`
      : formData.courseCode,
    category: category,
    trainingMethod: formData.trainingMethod,
    onsiteLocation: formData.onsiteLocation,
    hybridLocation: formData.hybridLocation,
    startDate: formData.startDate,
    endDate: formData.endDate,
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
    approvalDocumentFile: formData.approvalDocumentFile,
    submitTime: currentTime,
    knowledgeUsage, // เพิ่มข้อมูลนี้ใน payload
  };

  try {
    const response = await fetch("/api/editForm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log(result.message);
    alert("แก้ไขข้อมูลสำเร็จ");

    window.location.href = "/direct-report";
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Error submitting form");
  }
};





  return (



<div className="bg-gradient-to-r from-navy via-blue-600 to-cyan-400 min-h-screen flex items-center justify-center py-10">
  <div className="bg-white shadow-xl rounded-lg w-full max-w-3xl p-8">
    {username ? (
      <div>
        <p className="text-blue-700 font-bold">Welcome, {username}</p>
      </div>
    ) : (
      <p className="text-red-500">No user data found.</p>
    )}
    <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-800">ระบบรายงานผลการฝึกอบรม</h1>
    {loading && <p className="text-blue-500">กำลังโหลดข้อมูล...</p>}
    {error && <p className="text-red-500">{error}</p>}

    <form onSubmit={handleSubmit} className="space-y-6">



<div className="mb-6">
  {/* Dropdown สำหรับเลือกหน่วยงานที่จัดฝึกอบรม */}
  <label
    htmlFor="trainingOrg"
    className="block text-lg text-blue-700 font-bold"
  >
    หน่วยงานที่จัดฝึกอบรม:
  </label>
<select
    id="trainingOrg"
    className="mt-2 p-3 block w-full border border-cyan-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
    onChange={(e) => {
      const selectedId = e.target.value;
      setSelectedAgency(selectedId); // เก็บค่า id_extage
	setFormData({ ...formData, trainingOrg: selectedId });
    }}
  >
    <option value="">-- กรุณาเลือก --</option>
    {agencies.map((agency) => (
      <option key={agency.id_extage} value={agency.id_extage}>
        {agency.subname_extage} - {agency.name_extage}
      </option>
    ))}
  </select>
</div>

<div className="mb-6">
  {/* Dropdown สำหรับเลือกวิชา */}
  <label htmlFor="courseCode" className="block text-lg text-blue-700 font-bold">
    วิชา:
  </label>
  <select
    id="courseCode"
    className="mt-2 p-3 block w-full border border-cyan-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
    onChange={(e) => {
      const selectedCode = e.target.value;
      setFormData({
        ...formData,
        courseCode: selectedCode, // เก็บเฉพาะ id_macou
      });
    }}
  >
    {selectedAgency === "" ? (
      // เมื่อยังไม่ได้เลือกหน่วยงานที่จัดฝึกอบรม
      <option value="">-- กรุณาเลือกหน่วยงานที่จัดฝึกอบรมก่อน --</option>
    ) : (
      // เมื่อเลือกหน่วยงานที่จัดฝึกอบรมแล้ว
      <>
        <option value="">-- กรุณาเลือก --</option>
        {courses.length > 0 ? (
          courses.map((course) => (
            <option key={course.id_macou} value={course.id_macou}>
              {course.code_cou} - {course.name_cou}
            </option>
          ))
        ) : (
          <option value="">ไม่พบวิชา</option>
        )}
      </>
    )}
  </select>
</div>



          <div className="mb-6">
            <label className="block text-lg text-blue-700 font-bold">วิธีการอบรม:</label>
            <div className="mt-4 space-x-4">
              <label className="inline-flex items-center">
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
              <label className="inline-flex items-center">
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

              <label className="inline-flex items-center">
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

              <label className="inline-flex items-center">
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
              <input
                type="text"
                name="hybridLocation"
                value={formData.hybridLocation}
                onChange={handleInputChange}
                placeholder="สถานที่จัดฝึกอบรม"
                className={`mt-4 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formData.trainingMethod === 'Hybrid' || formData.trainingMethod === 'Onsite' ? 'block' : 'hidden'
                }`}
              />

            </div></div>


        <div className="mb-6">
          <label htmlFor="startDate" className="block text-lg text-blue-700 font-bold">วันที่เริ่มฝึกอบรม:</label>
          <DatePicker
            selected={formData.startDate}
            onChange={(date) => handleDateChange(date, 'startDate')}
            locale="th"
            dateFormat="dd/MM/yyyy"
            placeholderText="เลือกวันที่"
            customInput={
              <input
                type="text"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
                value={formData.startDate ? convertToBuddhistYear(formData.startDate) : ''}
                onClick={(e) => e.preventDefault()}
              />
            }
          />
        </div>

        <div className="mb-6">
          <label htmlFor="endDate" className="block text-lg text-blue-700 font-bold">วันที่สิ้นสุดการฝึกอบรม:</label>
          <DatePicker
            selected={formData.endDate}
            onChange={(date) => handleDateChange(date, 'endDate')}
            locale="th"
            dateFormat="dd/MM/yyyy"
            placeholderText="เลือกวันที่"
            customInput={
              <input
                type="text"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
                value={formData.endDate ? convertToBuddhistYear(formData.endDate) : ''}
                onClick={(e) => e.preventDefault()}
              />
            }
          />
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
          <>
            <div className="mb-6">
              <label htmlFor="regFeeAmount" className="block text-gray-700">ค่าลงทะเบียน (บาท):</label>
              <input type="number" id="regFeeAmount" name="regFeeAmount" value={formData.regFeeAmount} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg" />
            </div>

            <div className="mb-6">
              <label htmlFor="accommodationFeeAmount" className="block text-gray-700">ค่าที่พัก (บาท):</label>
              <input type="number" id="accommodationFeeAmount" name="accommodationFeeAmount" value={formData.accommodationFeeAmount} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg" />
            </div>

            <div className="mb-6">
              <label htmlFor="transportationFeeAmount" className="block text-gray-700">ค่าเดินทาง (บาท):</label>
              <input type="number" id="transportationFeeAmount" name="transportationFeeAmount" value={formData.transportationFeeAmount} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg" />
            </div>

            <div className="mb-6">
              <label htmlFor="allowanceFeeAmount" className="block text-gray-700">ค่าเบี้ยเลี้ยง (บาท):</label>
              <input type="number" id="allowanceFeeAmount" name="allowanceFeeAmount" value={formData.allowanceFeeAmount} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg" />
            </div>

            <div className="mb-6">
              <label htmlFor="totalCost" className="block text-gray-700">ค่าใช้จ่ายรวม (บาท):</label>
              <input type="text" id="totalCost" name="totalCost" value={formData.totalCost.toLocaleString()} readOnly className="mt-1 block w-full p-2 border border-gray-300 rounded-lg bg-gray-100" />
            </div>
          </>
        )}



        <div className="mb-6">
            <label className="block text-lg text-blue-700 font-bold">งบประมาณจาก</label>
            <div className="mt-4 space-y-4">
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  checked={internalChecked} 
                  onChange={() => handleCheckboxChange('internal')} 
                  className="form-checkbox h-5 w-5 text-cyan-600" 
                />
                <span className="ml-2 text-blue-700">ภายในกรมประมง</span>
              </label>
              <input 
                type="number" 
                value={formData.internalBudget} 
                onChange={(e) => setFormData({ ...formData, internalBudget: e.target.value })}
                disabled={!internalChecked} 
                placeholder="ใส่จำนวนเงิน (บาท)" 
                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent" 
              />
            </div>
        </div>

<div className="mb-6">
  <div className="mt-4 space-y-4">
    <label className="inline-flex items-center">
      <input
        type="checkbox"
        checked={externalChecked}
        onChange={() => handleCheckboxChange('external')}
        className="form-checkbox h-5 w-5 text-cyan-600"
      />
      <span className="ml-2 text-blue-700">ภายนอกกรมประมง</span>
    </label>
    <input
      type="number"
      value={formData.externalBudget}
      onChange={(e) => setFormData({ ...formData, externalBudget: e.target.value })}
      disabled={!externalChecked}
      placeholder="ใส่จำนวนเงิน (บาท)"
      className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
    />
    {externalChecked && (
      <input
        type="text"
        value={formData.externalAgency}
        onChange={handleAgencyInput}
        placeholder="จากหน่วยงาน"
        className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
      />
    )}
  </div>
</div>

        <div className="mb-6">
            <label className="block text-lg text-blue-700 font-bold">เบิกจ่ายงบประมาณจากแผนงาน</label>
            <input 
              type="text" 
              value={formData.planBudget} 
              onChange={(e) => setFormData({ ...formData, planBudget: e.target.value })}  
              placeholder="ระบุแผนงาน" 
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent" 
            />
        </div>

        <div className="mb-6">
            <label className="block text-lg text-blue-700 font-bold">ผลผลิต/โครงการ</label>
            <input 
              type="text" 
              value={formData.projectOutput}
              onChange={(e) => setFormData({ ...formData, projectOutput: e.target.value })}  
              placeholder="ระบุผลผลิตหรือโครงการ" 
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent" 
            />
        </div>

        <div className="mb-6">
            <label className="block text-lg text-blue-700 font-bold">กิจกรรมหลัก</label>
            <input 
              type="text" 
              value={formData.mainActivity} 
              onChange={(e) => setFormData({ ...formData, mainActivity: e.target.value })}  
              placeholder="ระบุกิจกรรมหลัก" 
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent" 
            />
        </div>

        <div className="mb-6">
            <label className="block text-lg text-blue-700 font-bold">กิจกรรมย่อย</label>
            <input 
              type="text" 
              value={formData.subActivity} 
              onChange={(e) => setFormData({ ...formData, subActivity: e.target.value })}  
              placeholder="ระบุกิจกรรมย่อย" 
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent" 
            />
        </div>

    <div>
      <h2 className="mt-5 mb-3 text-lg font-bold text-blue-700">
        การนำความรู้หลังจากที่ได้เข้ารับการฝึกอบรมไปใช้ประโยชน์ (ตอบทุกข้อ)
      </h2>
      <table className="w-full border-collapse mb-5">
        <thead>
          <tr>
            <th className="border border-gray-300 p-3 text-blue-700">
              ประเภทการนำความรู้
            </th>
            <th className="border border-gray-300 p-3 text-blue-700">
              น้อย (&lt;60%)
            </th>
            <th className="border border-gray-300 p-3 text-blue-700">
              ปานกลาง (60-80%)
            </th>
            <th className="border border-gray-300 p-3 text-blue-700">
              มาก (&gt;80%)
            </th>
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
                  value="น้อย"
                  checked={responses[`row${index + 1}`] === "น้อย"}
                  onChange={() => handleChange(`row${index + 1}`, "น้อย")}
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
                  value="มาก"
                  checked={responses[`row${index + 1}`] === "มาก"}
                  onChange={() => handleChange(`row${index + 1}`, "มาก")}
                  className="form-radio h-5 w-5 text-cyan-600"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>



        <div className="mb-6">
            <label className="block text-lg text-blue-700 font-bold">เกียรติบัตร (ถ้ามี)</label>
            <input 
              type="file" 
              id="certificateFile" 
              name="certificateFile" 
              onChange={handleInputChange} 
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent" 
            />
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
            <b>ข้าพเจ้ารับรองว่าข้อมูลและเอกสารหลักฐานนี้ มีความถูกต้องสมบูรณ์และครบถ้วนทุกประการ</b>
          </label>
        </div>

        <div className="text-center">
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            แก้ไขข้อมูล
          </button>
        </div>




        </form>
      </div>

    </div>
  );
};

export default Form;

