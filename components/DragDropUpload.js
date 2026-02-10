import React, { useState, useRef } from 'react';

const DragDropUpload = ({ 
  label, 
  onFileSelect, 
  errorMessage, 
  fileType = "approval", 
  allowedTypes = ["application/pdf", "image/jpg", "image/jpeg", "image/png"],
  maxFileSize = 5 * 1024 * 1024 // 5MB
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    // ❌ type ไม่ถูก
    if (!allowedTypes.includes(file.type)) {
      setSelectedFile(null);
      onFileSelect(null, "รองรับเฉพาะไฟล์ PDF หรือรูปภาพ (JPG, JPEG, PNG)");
      return;
    }

    // ❌ ขนาดเกิน
    if (file.size > maxFileSize) {
      setSelectedFile(null);
      onFileSelect(null, "ไฟล์ต้องมีขนาดไม่เกิน 5MB");
      return;
    }

    // ✅ ผ่าน
    setSelectedFile(file);
    onFileSelect(file, "");
  };

  const handleClick = () => {
    // ให้สามารถคลิกเพื่อเลือกไฟล์ใหม่ได้เสมอ แม้จะติด Error อยู่
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileSelect(null, ""); // Clear error when removing logic if needed, or just clear file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <label className="block text-lg text-blue-700 font-bold mb-2">
        {label}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : errorMessage // 🔥 เพิ่มเงื่อนไข: ถ้ามี Error ให้เป็นสีแดง
            ? 'border-red-500 bg-red-50'
            : selectedFile
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInput}
          accept={allowedTypes.join(',')}
        />
        
        {/* ลำดับการแสดงผล:
            1. ถ้ามี Error -> แสดง Error UI 
            2. ถ้าเลือกไฟล์สำเร็จ -> แสดง Success UI
            3. ปกติ -> แสดง Default UI
        */}
        
        {errorMessage ? (
           // 🔥 ส่วนแสดงผลเมื่อเกิด Error (แทนข้อความด้านล่าง)
          <div className="space-y-2">
            <div className="flex items-center justify-center text-red-600">
              <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold">ไฟล์ไม่ถูกต้อง</span>
            </div>
            <div className="text-sm text-red-600">
              <p className="font-medium">{errorMessage}</p>
              <p className="text-gray-500 mt-1 underline">คลิกเพื่อเลือกไฟล์ใหม่</p>
            </div>
          </div>

        ) : selectedFile ? (
          // ✅ ส่วนแสดงผลเมื่อเลือกไฟล์สำเร็จ
          <div className="space-y-2">
            <div className="flex items-center justify-center text-green-600">
              <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">ไฟล์ถูกเลือกแล้ว</span>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">{selectedFile.name}</p>
              <p>{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
            >
              ลบไฟล์
            </button>
          </div>
        ) : (
          // ⚪️ ส่วนแสดงผลปกติ
          <div className="space-y-2">
            <div className="flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-gray-600">
              <p className="font-medium">
                {isDragOver ? 'วางไฟล์ที่นี่' : 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์'}
              </p>
              <p className="text-sm mt-1">
                รองรับไฟล์ PDF, JPG, JPEG, PNG ขนาดไม่เกิน 5MB
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* ❌ ลบส่วน errorMessage เดิมที่อยู่ตรงนี้ออกไปได้เลย */}
    </div>
  );
};

export default DragDropUpload;