import './styles.css';
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faList, 
  faUser, 
  faPhone, 
  faFileAlt, 
  faImage, 
  faCalendarAlt, 
  faEye, 
  faDownload,
  faSpinner,
  faExclamationCircle,
  faCheckCircle,
  faClock
} from '@fortawesome/free-solid-svg-icons';

export default function SupportList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();
const [showFixed, setShowFixed] = useState(false);


  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) throw new Error('Unauthorized');

        const user = await res.json();

        if (user.status !== 'admin' && user.status !== 'superadmin') {
          alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
          router.push('/');
          return;
        }
      } catch (err) {
        // ถ้าไม่มี session หรือเกิด error ให้ redirect ออก
        alert('กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้');
        router.push('/signin');
        return;
      }
    };

    const fetchRequests = async () => {
      try {
        const res = await fetch("/api/support");
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    fetchRequests();
  }, [router]);

  // เพิ่มเติม: รับค่า search หรือ id จาก query string แล้ว setSearchTerm
  useEffect(() => {
    if (router.query.search) {
      setSearchTerm(router.query.search);
    } else if (router.query.id) {
      setSearchTerm(`#${router.query.id}`);
    }
  }, [router.query.search, router.query.id]);

  // Filter requests based on search term and status
  const filteredRequests = requests.filter(request => {
    // ถ้า searchTerm เป็น #ตัวเลข ให้ค้นหา id
    if (/^#\d+$/.test(searchTerm.trim())) {
      const idSearch = parseInt(searchTerm.trim().slice(1), 10);
      return request.id === idSearch;
    }
    // ค้นหาตาม citizen_id, subject, detail ตามเดิม
const matchesSearch = 
  request.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  request.citizen_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  request.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  request.detail?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });
const visibleRequests = filteredRequests.filter(req => showFixed || req.is_fixed !== 1);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-blue-600 mb-4" />
          <p className="text-lg text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <Header />
      <br />
      <br />
      <br />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FontAwesomeIcon icon={faList} className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">รายการคำร้องที่ส่งเข้ามา</h1>
                  <p className="text-gray-600 mt-1">จัดการและติดตามคำร้องขอความช่วยเหลือ</p>
                </div>
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                {filteredRequests.length} รายการ
              </div>
            </div>

            {/* Search Section */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ค้นหาจากรหัสบัตรประชาชน, หัวข้อ, หรือรายละเอียด..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FontAwesomeIcon
                    icon={faEye}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ✅ ปุ่ม toggle แสดงคำร้องที่แก้ไขแล้ว */}
          <div className="flex items-center justify-end mb-4">
            <label className="flex items-center space-x-2 text-gray-700">
              <input
                type="checkbox"
                checked={showFixed}
                onChange={(e) => setShowFixed(e.target.checked)}
              />
              <span>แสดงคำร้องที่แก้ไขแล้ว</span>
            </label>
          </div>

          {/* Content Section */}
          {visibleRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูล'}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'ลองค้นหาด้วยคำอื่น' : 'คำร้องจะปรากฏที่นี่เมื่อมีผู้ส่งเข้ามา'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {visibleRequests.map((req, index) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <FontAwesomeIcon icon={faUser} className="text-blue-600 text-lg" />
                        </div>
                        <div><h3 className="text-lg font-semibold text-gray-800">{req.subject}</h3>
<p className="text-sm text-gray-500">
  ชื่อผู้แจ้ง: <span className="font-medium text-gray-700">{req.fullname || '-'}</span>
</p>
<p className="text-sm text-gray-500">ID: #{req.id}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <FontAwesomeIcon icon={faClock} />
                        <span>{formatDate(req.created_at)}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={req.is_fixed === 1}
                          onChange={async (e) => {
                            const newValue = e.target.checked;
                            try {
                              await fetch("/api/support", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: req.id, is_fixed: newValue }),
                              });
                              setRequests((prev) =>
                                prev.map((r) =>
                                  r.id === req.id ? { ...r, is_fixed: newValue ? 1 : 0 } : r
                                )
                              );
                            } catch (err) {
                              console.error("Error updating status", err);
                            }
                          }}
                        />
                        <label className="text-gray-700">แก้ไขแล้ว</label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
<div className="flex items-center space-x-3">
  <FontAwesomeIcon icon={faUser} className="text-gray-400" />
  <div>
    <p className="text-sm text-gray-500">ชื่อผู้แจ้ง</p>
    <p className="font-medium text-gray-800">{req.fullname || '-'}</p>
  </div>
</div>
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">รหัสบัตรประชาชน</p>
                          <p className="font-medium text-gray-800">{req.citizen_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                          <p className="font-medium text-gray-800">{req.phone}</p>
                        </div>
                      </div>
                    </div>

                    {req.detail && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <FontAwesomeIcon icon={faFileAlt} className="text-gray-400" />
                          <p className="text-sm font-medium text-gray-500">รายละเอียด</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 leading-relaxed">{req.detail}</p>
                        </div>
                      </div>
                    )}

                    {req.image_path && (
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <FontAwesomeIcon icon={faImage} className="text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">ไฟล์แนบ</p>
                            <p className="text-sm text-gray-600">{req.image_path}</p>
                          </div>
                        </div>
                        <a
                          href={`/uploads/${req.image_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                          <span>ดูรูป</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
