import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import './styles.css';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkComplete, setCheckComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsChecking(true);

        // เรียก API เพื่อตรวจสอบสถานะการ login
        const response = await axios.get('/api/auth/session', {
          withCredentials: true
        });

        const { username, status } = response.data;

        if (username && status) {
          // ถ้า login อยู่แล้ว ตั้งค่า authenticated
          console.log('🟢 ผู้ใช้ login อยู่แล้ว');
          setIsAuthenticated(true);
        } else {
          // ถ้าไม่ได้ login ตั้งค่า authenticated เป็น false
          console.log('🔴 ผู้ใช้ไม่ได้ login');
          setIsAuthenticated(false);
        }
      } catch (error) {
        // ถ้าเกิด error ให้ถือว่าไม่ได้ login
        console.log('⚠️ เกิด error ในการตรวจสอบ session ถือว่าไม่ได้ login');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        setIsChecking(false);
        setCheckComplete(true);
      }
    };

    // เรียกฟังก์ชันตรวจสอบหลังจาก component mount
    checkAuthStatus();
  }, []); // ลบ router ออกจาก dependencies เพื่อป้องกัน re-run

  // Redirect หลังจากเช็คเสร็จ
  useEffect(() => {
    if (checkComplete) {
      if (isAuthenticated) {
        console.log('Redirecting to /main');
        router.push('/main');
      } else {
        console.log('Redirecting to /signin');
        router.push('/signin');
      }
    }
  }, [checkComplete, isAuthenticated, router]);

  // ถ้ายังกำลังตรวจสอบ session แสดง loading
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-200/20 to-sky-200/20 rounded-full animate-spin-slow"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full animate-spin-slow-reverse"></div>
      </div>

      {/* Main Loading Container */}
      <div className="relative z-10 text-center">
        {/* Modern Loading Spinner */}
        <div className="relative mb-8">
          {/* Outer Glow Ring */}
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-200/30 to-sky-200/30 animate-pulse"></div>
          
          {/* Main Spinner Ring */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 border-4 border-transparent border-t-blue-500 border-r-sky-500 rounded-full animate-spin"></div>
          
          {/* Inner Spinner Ring */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-28 border-4 border-transparent border-b-cyan-500 border-l-blue-400 rounded-full animate-spin-reverse"></div>
          
          {/* Center Glow */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full animate-pulse shadow-lg shadow-blue-500/30"></div>
        </div>

        {/* Modern Loading Text */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
            ระบบรายงานผลการเข้ารับการฝึกอบรมฯ
          </h1>
          
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
          
          <p className="text-lg text-blue-700 font-medium">
            {isChecking ? 'กำลังตรวจสอบสถานะ...' : 'กำลังเปลี่ยนหน้า...'}
          </p>
        </div>

        {/* Modern Progress Bar */}
        <div className="mt-12 w-80 mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-blue-200/50 shadow-inner">
            <div className="h-full bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 rounded-full animate-progress-bar"></div>
          </div>
        </div>

        {/* Status Message */}
        <p className="text-sm text-blue-600 mt-6 animate-pulse">
          กรุณารอสักครู่...
        </p>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
    );
  }

  // แสดง loading ขณะรอ redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-200/20 to-sky-200/20 rounded-full animate-spin-slow"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full animate-spin-slow-reverse"></div>
      </div>

      {/* Main Loading Container */}
      <div className="relative z-10 text-center">
        {/* Modern Loading Spinner */}
        <div className="relative mb-8">
          {/* Outer Glow Ring */}
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-200/30 to-sky-200/30 animate-pulse"></div>

          {/* Main Spinner Ring */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 border-4 border-transparent border-t-blue-500 border-r-sky-500 rounded-full animate-spin"></div>

          {/* Inner Spinner Ring */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-28 border-4 border-transparent border-b-cyan-500 border-l-blue-400 rounded-full animate-spin-reverse"></div>

          {/* Center Glow */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full animate-pulse shadow-lg shadow-blue-500/30"></div>
        </div>

        {/* Modern Loading Text */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
            ระบบรายงานผลการเข้ารับการฝึกอบรมฯ
          </h1>

          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>

          <p className="text-lg text-blue-700 font-medium">
            กำลังเปลี่ยนหน้า...
          </p>
        </div>

        {/* Modern Progress Bar */}
        <div className="mt-12 w-80 mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-blue-200/50 shadow-inner">
            <div className="h-full bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 rounded-full animate-progress-bar"></div>
          </div>
        </div>

        {/* Status Message */}
        <p className="text-sm text-blue-600 mt-6 animate-pulse">
          กรุณารอสักครู่...
        </p>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
