import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faMapMarkerAlt, faBook, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from 'react';
import axios from 'axios';

const Footer = () => {
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await axios.get("/api/auth/session", { withCredentials: true });
        if (response.data && response.data.status) {
          setStatus(response.data.status);
        }
      } catch (error) {
        console.error("Error fetching user status:", error);
      }
    };

    fetchUserStatus();
  }, []);

  return (
<footer className="bg-blue-900 text-white py-6 mt-10">
      <div className="container mx-auto px-6 text-center">
        <p className="text-lg font-semibold">หากมีข้อสงสัย กรุณาติดต่อ</p>
        <div className="mt-4 space-y-2 text-sm">
          <p>
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-cyan-400" />
            กลุ่มแผนและติดตามประเมินผล
          </p>
          <p>
            <FontAwesomeIcon icon={faPhone} className="mr-2 text-cyan-400" />
            คุณอุมาพร ทวีจันทร์: 0 2562 0600-15 ต่อ 17510
          </p>
          <p>
            <FontAwesomeIcon icon={faPhone} className="mr-2 text-cyan-400" />
            คุณณิชารัศม์ บุญพรหม: ต่อ 17513
          </p>
          <p>
            <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-cyan-400" />
            Email: <a href="mailto:hrdplan7@gmail.com" className="underline hover:text-cyan-400">hrdplan7@gmail.com</a>
          </p>
          <p>
            <FontAwesomeIcon icon={faBook} className="mr-2 text-cyan-400" />
            คู่มือ: <a data-tour="help-section" href="/pdf-guide.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-400">เปิดคู่มือการใช้งาน</a>
          </p>
          {status === 'approver' && (
            <p>
              <FontAwesomeIcon icon={faBook} className="mr-2 text-cyan-400" />
              คู่มือ(สำหรับผู้ตรวจสอบ): <a data-tour="help-section" href="/pdf-guide-approver.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-400">เปิดคู่มือการใช้งาน</a>
            </p>
          )}
          <p>
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-cyan-400" />
            แจ้งปัญหา: <a href="/support" className="underline hover:text-cyan-400">แจ้งปัญหาการใช้งาน</a>
          </p>
        </div>
        <div className="border-t border-gray-400 mt-6 pt-2 text-sm opacity-80">
          © {new Date().getFullYear()} กรมประมง. สงวนลิขสิทธิ์.
        </div>
      </div>
    </footer>

  );
};

export default Footer;
