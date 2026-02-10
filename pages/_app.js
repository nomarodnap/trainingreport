// pages/_app.js
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react'; // ✅ ใส่ useState ตรงนี้
import { useRouter } from 'next/router';
import { UserProvider } from '../contexts/UserContext';
import Header from '../components/Header';


function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const timerRef = useRef(null);
  const [currentMode, setCurrentMode] = useState('user');


  useEffect(() => {
    const TIMEOUT = 30 * 60 * 1000; // 15 นาที

    const handleLogout = () => {
      console.log('Session expired. Logging out... (DISABLED FOR DEBUG)');
      // localStorage.clear(); // เคลียร์ข้อมูลผู้ใช้
      // router.push('/signin'); // ไปหน้า login
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleLogout, TIMEOUT);
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

    activityEvents.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer(); // เริ่มจับเวลา

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>ระบบรายงานผลการเข้ารับการฝึกอบรมฯ (แบบ กบค.1) กรมประมง</title>
        <meta name="google-site-verification" content="VksC1XJpXTE9VBjrIytOqPUL4M78mvNBv_UZT1J2AqI" />
        <meta name="description" content="ระบบรายงานผลการฝึกอบรม สำหรับหน่วยงานในสังกัดกรมประมง" />
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content="รายงานผล, การฝึกอบรม, กรมประมง, กบค.1, แบบฟอร์มราชการ" />
        <meta property="og:title" content="ระบบรายงานผลการฝึกอบรม กบค.1 - กรมประมง" />
        <meta property="og:description" content="ระบบรายงานผลการฝึกอบรม สำหรับหน่วยงานราชการในสังกัดกรมประมง" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="th_TH" />
        <meta property="og:url" content="https://trainingreport.fisheries.go.th" />
        <meta property="og:site_name" content="กรมประมง" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://trainingreport.fisheries.go.th/" />

        {/* JSON-LD for structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "GovernmentOrganization",
              name: "กรมประมง",
              url: "https://trainingreport.fisheries.go.th",
              logo: "https://trainingreport.fisheries.go.th/logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+6625620060",
                contactType: "customer support",
                areaServed: "TH",
                availableLanguage: ["Thai"]
              }
            })
          }}
        />
      </Head>
      <UserProvider>
        <Component {...pageProps}
          {...pageProps}
          currentMode={currentMode}
          setCurrentMode={setCurrentMode}
        />
      </UserProvider>
    </>
  );
}

export default MyApp;
