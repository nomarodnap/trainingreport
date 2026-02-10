import './styles.css';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle, 
  faUser, 
  faPhone, 
  faFileAlt, 
  faImage, 
  faPaperPlane,
  faCheckCircle,
  faSpinner,
  faUpload,
  faArrowLeft,
  faHeadset
} from '@fortawesome/free-solid-svg-icons';

export default function Support() {
const [form, setForm] = useState({ 
  fullname: '',
  citizenId: '', 
  phone: '', 
  subject: '', 
  detail: '', 
  image: null 
});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submittedId, setSubmittedId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
    setForm((prev) => ({ ...prev, image: file }));
    // Clear error when user selects file
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
if (!form.fullname.trim()) {
  newErrors.fullname = 'กรุณากรอกชื่อ';
}

    if (!form.citizenId.trim()) {
      newErrors.citizenId = 'กรุณากรอกรหัสบัตรประชาชน';
    } else if (!/^\d{13}$/.test(form.citizenId)) {
      newErrors.citizenId = 'รหัสบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
    }
    
    if (!form.phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรติดต่อกลับ';
    } else if (!/^[0-9\-\+\(\)\s]+$/.test(form.phone)) {
      newErrors.phone = 'รูปแบบเบอร์โทรไม่ถูกต้อง';
    }
    
    if (!form.subject.trim()) {
      newErrors.subject = 'กรุณากรอกหัวข้อ';
    }
    
    if (!form.detail.trim()) {
      newErrors.detail = 'กรุณากรอกรายละเอียด';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
  
    try {
      const formData = new FormData();
formData.append("fullname", form.fullname);
      formData.append("citizenId", form.citizenId);
      formData.append("phone", form.phone);
      formData.append("subject", form.subject);
      formData.append("detail", form.detail);
      if (form.image) {
        formData.append("image", form.image);
      }
    
      const res = await fetch("/api/support", {
        method: "POST",
        body: formData,
      });
    
      if (res.ok) {
        const data = await res.json();
        setSubmitted(true);
        setSubmittedId(data.id); // เก็บ id ที่ได้จาก API
      } else {
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg text-center">
          <div className="mb-6">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ส่งคำร้องเรียบร้อย!</h1>
            <p className="text-gray-600 text-lg">ทีมงานได้รับข้อมูลของท่านแล้ว และจะดำเนินการตรวจสอบโดยเร็ว</p>
            {submittedId && (
              <div className="mt-4 text-lg font-semibold text-blue-700">
                หมายเลขคำร้องของคุณคือ <span className="bg-blue-100 px-2 py-1 rounded">#{submittedId}</span>
              </div>
            )}
          </div>
          
          
          <a 
            href="/" 
            className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>กลับไปหน้าแรก</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">แจ้งปัญหาการใช้งานระบบ</h1>
          <p className="text-gray-600 text-lg">โปรดกรอกข้อมูลด้านล่างให้ครบถ้วน และแนบรูปประกอบถ้ามี</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
    ชื่อ - นามสกุล <span className="text-red-500">*</span>
  </label>
  <input 
    name="fullname" 
    value={form.fullname} 
    onChange={handleChange} 
    required 
    placeholder="กรอกชื่อ - นามสกุล"
    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
      errors.fullname ? 'border-red-500' : 'border-gray-300'
    }`} 
  />
  {errors.fullname && (
    <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>
  )}
</div>
          {/* Citizen ID Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
              รหัสบัตรประชาชน <span className="text-red-500">*</span>
            </label>
            <input 
              name="citizenId" 
              value={form.citizenId} 
              onChange={handleChange} 
              required 
              inputMode="numeric" 
              maxLength={13} 
              placeholder="กรอกรหัสบัตรประชาชน 13 หลัก"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                errors.citizenId ? 'border-red-500' : 'border-gray-300'
              }`} 
            />
            {errors.citizenId && (
              <p className="text-red-500 text-sm mt-1">{errors.citizenId}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FontAwesomeIcon icon={faPhone} className="mr-2 text-blue-500" />
              เบอร์โทรติดต่อกลับ <span className="text-red-500">*</span>
            </label>
            <input 
              name="phone" 
              value={form.phone} 
              onChange={handleChange} 
              required 
              inputMode="tel" 
              maxLength={20} 
              placeholder="กรอกเบอร์โทรติดต่อกลับ"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`} 
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-blue-500" />
              หัวข้อ <span className="text-red-500">*</span>
            </label>
            <input 
              name="subject" 
              value={form.subject} 
              onChange={handleChange} 
              required 
              placeholder="กรอกหัวข้อปัญหา"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`} 
            />
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
            )}
          </div>

          {/* Detail Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-blue-500" />
              รายละเอียด <span className="text-red-500">*</span>
            </label>
            <textarea 
              name="detail" 
              rows={5} 
              value={form.detail} 
              onChange={handleChange} 
              required 
              placeholder="อธิบายรายละเอียดปัญหาให้ชัดเจน"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors resize-none ${
                errors.detail ? 'border-red-500' : 'border-gray-300'
              }`} 
            />
            {errors.detail && (
              <p className="text-red-500 text-sm mt-1">{errors.detail}</p>
            )}
          </div>

          {/* File Upload Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FontAwesomeIcon icon={faImage} className="mr-2 text-blue-500" />
              แนบรูป (ถ้ามี)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FontAwesomeIcon icon={faUpload} className="text-3xl text-gray-400 mb-2" />
                <p className="text-gray-600 mb-2">
                  {form.image ? form.image.name : 'คลิกเพื่อเลือกไฟล์รูปภาพ'}
                </p>
                <p className="text-sm text-gray-500">รองรับไฟล์ JPG, PNG, GIF (ขนาดไม่เกิน 5MB)</p>
              </label>
            </div>
            {form.image && (
              <div className="mt-2 flex items-center space-x-2 text-green-600">
                <FontAwesomeIcon icon={faCheckCircle} />
                <span className="text-sm">ไฟล์ถูกเลือกแล้ว: {form.image.name}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-lg transition-all duration-200 font-medium text-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                <span>กำลังส่งคำร้อง...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPaperPlane} />
                <span>ส่งคำร้อง</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}


