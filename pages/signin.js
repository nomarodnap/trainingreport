import './styles.css';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { faKey, faQrcode, faExclamationTriangle, faHeadset } from "@fortawesome/free-solid-svg-icons";
import AnnouncementLayout from '@/components/AnnouncementLayout';


export default function SignIn() {
  const [credentials, setCredentials] = useState({ username: '', password: '', remember: false });
  const [error, setError] = useState(null);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);


  const [isHolding, setIsHolding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("dpis"); // new state for method selection



  const methods = [
    {
      id: "dpis",
      label: "DPIS 6 - กรมประมง",
      icon: faKey,
      logo: "/hrms-3.png",
      width: 250,
      height: 83,
    },
    {
      id: "thaid",
      label: "ThaID",
      icon: faQrcode,
      logo: "/thaid.png",
      width: 90,
      height: 90,
    },
  ];

  const selectedMethod = methods.find((m) => m.id === loginMethod);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials({
      ...credentials,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // ✅ 1. Auth จาก API ภายนอก
      const res = await fetch('/api/auth/login_dpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      console.log('🔵 API Login Response:', data); // ✅ Debug API Response

      if (res.ok) {
        const username = data.user?.per_cardno; // ใช้ ?. กัน error กรณี data.user เป็น undefined
        console.log('🟢 Username:', username);

        if (!username) {
          console.error('❌ Username ไม่ถูกต้อง');
          setError('Username ไม่ถูกต้อง');
          return;
        }

        Cookies.set('login_name', username, { expires: credentials.remember ? 365 : null });


        // ✅ 2. ดึง Status จากตาราง `users`
        const statusRes = await fetch('/api/users/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });

        const statusData = await statusRes.json();
        console.log('🟡 API User Status Response:', statusData);

        if (statusRes.ok && statusData.status) {
        } else {
          console.error('❌ Failed to fetch user status:', statusData.message || 'No status returned');
        }

        // ✅ 3. เปลี่ยนหน้าไปยัง Dashboard
        setTimeout(() => {
          router.push('/');
        }, 100);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('❌ ข้อผิดพลาดใน handleSubmit:', error);
      setError('คุณใส่เลขบัตรประชาชน หรือรหัสผ่านผิด \nหรือเครือข่ายของระบบ DPIS มีปัญหา โปรดลองเข้าใหม่ในภายหลัง');
    } finally {
      setIsLoading(false); // ✅ หยุดโหลด
    }


  };

  const THAID_CLIENT_ID = "NkR0YzJ3d0dYNzlEUWpuYThVZHBSbUlMUEJmMmJieXE";

  const authUrl = `https://imauth.bora.dopa.go.th/api/v2/oauth2/auth/?` + new URLSearchParams({
    response_type: "code",
    client_id: THAID_CLIENT_ID,
    redirect_uri: "https://trainingreport.fisheries.go.th/api/auth/login",
    scope: "openid pid",
  }).toString();



  return (
    <AnnouncementLayout>
      <>
        <Head>
          <title>ระบบรายงานผลการเข้ารับการฝึกอบรม กรมประมง</title>
          <meta name="description" content="ระบบรายงานผลการฝึกอบรม สำหรับหน่วยงานในสังกัดกรมประมง ช่วยให้เจ้าหน้าที่สามารถบันทึกและติดตามผลการพัฒนาทักษะจากการเข้ารับการฝึกอบรมได้อย่างมีประสิทธิภาพ" />
          <meta name="keywords" content="รายงานผล, การฝึกอบรม, กรมประมง, กบค.1, แบบฟอร์มราชการ, รายงานการพัฒนา, ระบบออนไลน์" />
          <meta property="og:title" content="ระบบรายงานผลการฝึกอบรม - กรมประมง" />
          <meta property="og:description" content="ระบบรายงานผลการฝึกอบรม สำหรับหน่วยงานราชการในสังกัดกรมประมง" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://trainingreport.fisheries.go.th/signin" />
          <meta property="og:site_name" content="กรมประมง" />
          <meta property="og:image" content="https://trainingreport.fisheries.go.th/logo.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="ระบบรายงานผลการฝึกอบรม - กรมประมง" />
          <meta name="twitter:description" content="ระบบรายงานผลการฝึกอบรม สำหรับหน่วยงานราชการในสังกัดกรมประมง" />
          <meta name="twitter:image" content="https://trainingreport.fisheries.go.th/logo.png" />
          <link rel="canonical" href="https://trainingreport.fisheries.go.th/signin" />
        </Head>

        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
          {/* Section for Logo and System Title */}
          <div className="flex flex-col items-center text-center mb-8">
            <img
              src="/logo.png" // โลโก้ของระบบ (ต้องอยู่ใน public folder)
              alt="กรมประมง โลโก้"
              className="h-20 w-20 mb-4" // เพิ่มขนาดโลโก้จาก 12x12 เป็น 20x20
            />
            <h1 className="text-3xl font-bold text-gray-700">
              <span className="block">
                ระบบรายงานผลการเข้ารับการฝึกอบรม กรมประมง
              </span>
            </h1>
            <p className="text-red-600 text-sm mt-2 font-semibold">
              *(บันทึกข้อมูลผลการพัฒนาฯ หลังเข้ารับฝึกอบรมเสร็จสิ้นแล้ว ภายใน 15 วันทำการ)
            </p>
          </div>



          {/* Sign In Form */}
          <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">เข้าสู่ระบบด้วย</h2>

            {/* ✅ โลโก้: แสดงเหนือปุ่มเลือก */}
            {selectedMethod && (
              <div className="flex justify-center items-center mb-4">
                <img
                  src={selectedMethod.logo}
                  alt={selectedMethod.label}
                  width={selectedMethod.width}
                  height={selectedMethod.height}
                  className="object-contain"
                />
              </div>
            )}

            {/* ✅ Custom "dropdown" แบบปุ่มเลือก */}
            <div className="mb-4 border border-gray-300 rounded-md overflow-hidden">
              {methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setLoginMethod(method.id)}
                  className={`flex items-center w-full px-4 py-2 hover:bg-gray-100 transition ${loginMethod === method.id ? "bg-blue-100" : ""
                    }`}
                >
                  <FontAwesomeIcon icon={method.icon} className="mr-3 text-blue-500 w-5" />
                  <span className="flex-grow text-left">{method.label}</span>
                  {loginMethod === method.id && (
                    <span className="text-sm text-blue-500 font-semibold">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* ✅ แบบฟอร์ม DPIS */}
            {loginMethod === "dpis" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="เลขบัตรประจำตัวประชาชน"
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                  disabled={isLoading}
                >
                  {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </button>

                {isLoading && (
                  <div className="flex justify-center mt-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                )}

                {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center">      <p className="font-semibold">***กรณีลืมรหัสผ่าน***</p>
                  <p>
                    สามารถแก้ไขรหัสผ่านได้ในระบบ<span className="font-medium"> DPIS</span> โดยเลือก
                    <br /> <span className="font-medium"> "ลืมรหัสผ่าน"</span> แล้วกรอกอีเมลกรมประมงที่ท่านใช้สมัครไว้
                    <br />
                    หากท่านลืมอีเมลกรมประมงของท่าน ให้ติดต่อที่ <br />
                    <span className="font-medium"> ศูนย์เทคโนโลยีสารสนเทศฯ</span> โทร. 029405602 ต่อ 4040
                  </p>

                </div>

              </form>

            )}

            {/* ✅ ปุ่ม ThaID */}
            {loginMethod === "thaid" && (
              <div className="mt-4 text-center">
                <a
                  href={authUrl}
                  className="inline-block bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition"
                >
                  เข้าสู่ระบบด้วย ThaID
                </a>
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center">
                  <p className="font-semibold">***โปรดทราบ***</p>
                  <p>ในการใช้งานครั้งแรกท่านจะไม่สามารถเข้าด้วย <span className="font-medium">ThaID</span> ได้ กรุณาเลือกใช้วิธีเข้าด้วย <span className="font-medium">ระบบ DPIS</span> ก่อน<br /> แล้วถึงจะสามารถเข้าด้วย <span className="font-medium">ThaID</span> ได้ในครั้งถัดไป</p>
                </div>

              </div>
            )}

            {/* ✅ แจ้งปัญหาการใช้งานระบบ */}
          </div>
          {/* Footer Section */}
          <div className="mt-6 text-center">
            <a
              href="/support"
              className="inline-flex items-center justify-center gap-3 text-base font-semibold px-6 py-3 rounded-xl
                     bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md hover:shadow-lg
                     hover:from-rose-600 hover:to-red-700 active:from-rose-700 active:to-red-800
                     transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-400"
            >
              <FontAwesomeIcon icon={faHeadset} className="text-lg" />
              แจ้งปัญหาการใช้งาน
            </a>
            <p className="text-xs text-gray-500 mt-2">  ติดต่อสอบถามเกี่ยวกับระบบรายงานผลฯ ที กลุ่มแผนและติดตามประเมินผล กบค. โทร. 025620600 หรือ ภายใน 17510 และ 17513
            </p>
          </div>

          <div className="text-gray-600 text-sm text-center mt-6 p-4 ">
          </div>

          {/* Fixed QR Layer - Bottom Right */}
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-transparent p-0 flex flex-col items-center">
              <img
                src="/openchat.jpg"
                alt="กลุ่มไลน์ openchat ระบบรายงานผลฯ กบค."
                width="180"
                height="180"
                className="w-[180px] h-[180px] object-contain"
              />
              <p className="mt-2 text-sm font-semibold text-gray-700 text-center">
                กลุ่มไลน์ openchat <br />ระบบรายงานผลฯ
              </p>
            </div>
          </div>
        </div>

      </>
    </AnnouncementLayout>

  );
}
