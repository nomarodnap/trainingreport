// Header.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser, faCog, faSignOutAlt, faRetweet, faTools, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from "next/router";
import { faPlus, faFileAlt, faClipboardList, faUsers } from '@fortawesome/free-solid-svg-icons';
import { faBars } from "@fortawesome/free-solid-svg-icons";


export default function Header() {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("🔵 [Header] เรียก /api/auth/session");
        const response = await axios.get("/api/auth/session", { withCredentials: true });

        console.log("🟢 [Header] session response:", response.data);

        let { username, status, is_user_mode } = response.data;

        if (username && status) {
          // ถ้าเป็น user และค่าใน DB ไม่ใช่ 1 → อัปเดตใน DB ให้เป็น 1
          if (status === 'user' && is_user_mode !== 1) {
            try {
              await axios.post(
                '/api/auth/set-user-mode',
                { is_user_mode: 1 },
                { withCredentials: true }
              );

              is_user_mode = 1; // อัปเดตใน state ให้ตรงกับ DB
            } catch (err) {
              console.error('❌ อัปเดต is_user_mode ใน DB ไม่สำเร็จ:', err);
            }
          }

          const userData = { username, status, is_user_mode };
          setUsername(username);
          setStatus(status);
          setUser(userData);
        } else {
          console.warn("⚠️ ไม่พบ username หรือ status");
        }

      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.warn("⚠️ ไม่ได้ login, redirect ไปหน้า signin");
          router.push('/signin');
        } else {
          console.error("❌ Header error:", error);
        }
      }
    };

    fetchUser();
  }, []);





  const fetchNotifications = async () => {
    try {
      // ดึง notification เดิม
      const res1 = await axios.get('/api/notifications');
      // ดึง notification support-list
      const res2 = await axios.get('/api/support-notifications');
      // ใส่ type ให้แต่ละอัน
      const noti1 = (res1.data || []).map(n => ({ ...n, _type: 'report' }));
      const noti2 = (res2.data || []).map(n => ({ ...n, _type: 'support' }));
      // รวมและเรียงตามเวลาใหม่สุด
      const all = [...noti1, ...noti2].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(all);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (user && (user.status === 'admin' || user.status === 'superadmin')) {
      fetchNotifications(); // <<< ต้องมีอันนี้
    }
  }, [user]);



  const handleToggleMode = async () => {
    try {
      await axios.post('/api/auth/toggle-mode');
      // fetch session ใหม่หลัง toggle mode
      const response = await axios.post('/api/auth/session', {}, { withCredentials: true });
      setUser(response.data);
      router.push('/');  // redirect ไปหน้า index
    } catch (err) {
      console.error('Toggle mode failed:', err);
    }
  };



  const handleLogout = async () => {
    try {
      setIsLoggingOut(true); // เริ่มแสดง overlay

      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
      router.push('/signin');
    } catch (error) {
      console.error("❌ Logout failed:", error);
      setIsLoggingOut(false); // เผื่อ error จะได้เอา overlay ออก
    }
  };





  const markAsRead = async (id, type) => {
    try {
      if (type === 'support') {
        await axios.post('/api/support-notifications', { id });
      } else {
        await axios.post(`/api/notifications/${id}/mark-as-read`);
      }
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.isRead);
      if (unread.length === 0) return;

      if (!window.confirm("คุณต้องการทำเครื่องหมายว่าอ่านแล้วทั้งหมดหรือไม่?")) return;

      // Call both APIs concurrently
      await Promise.all([
        axios.patch('/api/notifications'),        // reports
        axios.patch('/api/support-notifications') // support
      ]);

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (id, type, support_id) => {
    await markAsRead(id, type);
    if (type === 'support') {
      // ไปหน้า support-list หรือรายละเอียด support
      router.push(`/support-list?id=${support_id}`);
    } else {
      router.push(`/reports?reportId=${id}`);
    }
  };

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const toggleNotification = () => setIsNotificationOpen((prev) => !prev);




  return (
    <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white py-4 shadow-xl fixed top-0 w-full z-50">
      <div className="container mx-auto flex items-center justify-between px-6">
        <Link href="/" legacyBehavior>
          <a className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 mr-3" />
            <h1 className="text-lg font-bold">ระบบรายงานผลการเข้ารับการฝึกอบรมฯ กรมประมง</h1>
          </a>
        </Link>

        <div className="flex items-center space-x-4">
          {user && (user.status === 'admin' || user.status === 'superadmin') && (
            <div className="relative">
              <button
                onClick={toggleNotification}
                className="relative bg-white text-blue-600 font-semibold py-1 px-3 rounded-full text-sm flex items-center"
              >
                <FontAwesomeIcon icon={faBell} className="text-xl" />
                {notifications.some((n) => !n.isRead) && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-2">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </button>
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 bg-white text-gray-800 rounded shadow-md w-80 z-50">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-lg">การแจ้งเตือน</h4>
                      {notifications.some((n) => !n.isRead) && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          อ่านทั้งหมด
                        </button>
                      )}
                    </div>
                    {notifications.filter((n) => !n.isRead).length === 0 ? (
                      <p className="text-sm text-gray-500">ไม่มีการแจ้งเตือน</p>
                    ) : (
                      <>
                        <ul className="space-y-2 max-h-[32rem] overflow-y-auto">
                          {notifications.filter((n) => !n.isRead).map((notification) => (
                            <li key={notification._type + '-' + notification.id} className="p-2 rounded bg-blue-50 flex flex-col">
                              <div className="flex items-center space-x-2 mb-1">
                                {notification._type === 'support' ? (
                                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" title="Support" />
                                ) : (
                                  <FontAwesomeIcon icon={faFileAlt} className="text-blue-500" title="Report" />
                                )}
                                <span className="text-xs font-bold">
                                  {notification._type === 'support' ? 'คำร้องขอความช่วยเหลือ' : 'รายงาน/อบรม'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold">
                                  {notification._type === 'support'
                                    ? notification.message
                                    : `${notification.formCode}: ${notification.courseName || 'N/A'}`}
                                </h3>
                                {notification._type === 'support' ? null : (
                                  <>
                                    <p className="text-xs text-gray-700">{notification.full_name}</p>
                                    <p className="text-xs text-gray-700">{notification.department}</p>
                                  </>
                                )}
                              </div>
                              <button
                                onClick={() => handleNotificationClick(notification.id, notification._type, notification.support_id)}
                                className="text-blue-600 text-sm underline mt-2 self-end"
                              >
                                ดูเพิ่มเติม
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="bg-white/30 backdrop-blur-md hover:bg-white/40 text-white font-bold py-2 px-5 rounded-full text-base transition duration-200 flex items-center space-x-3 shadow-md"
              >
                <FontAwesomeIcon icon={faBars} className="text-xl" />
                <span className="tracking-wide">เมนู</span>
                <FontAwesomeIcon
                  icon={user?.is_user_mode ? faUser : faTools}
                  className="text-xl"
                />

              </button>



              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white text-gray-800 rounded shadow-md w-48">
                  <div className="px-4 py-2">
                    <h6 className="font-semibold">{user.username}</h6>
                    <p className="text-sm text-gray-500">
                      สถานะ: {user.status === 'superadmin' ? 'ผู้ดูแลสูงสุด' : user.status === 'admin' ? 'ผู้ดูแลระบบ' : user.status === 'approver' ? 'ผู้ตรวจสอบ' : user.status === 'approver2' ? 'ผู้ตรวจสอบ' : 'ผู้ใช้งาน'}
                    </p>
                  </div>

                  {['admin', 'approver', 'superadmin', 'approver2'].includes(user?.status) && (
                    <button
                      onClick={async () => {
                        try {
                          // อัปเดต hasSeenTour ให้เป็น true อัตโนมัติ
                          try {
                            await fetch('/api/user/markAsSeen', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ username }),
                            });
                          } catch (e) {
                            console.warn('อัปเดต hasSeenTour ไม่สำเร็จ (ไม่กระทบการสลับโหมด):', e);
                          }

                          await axios.post('/api/auth/toggle-mode');
                          // hard reload และเปลี่ยนไปหน้า index
                          window.location.href = '/';
                        } catch (err) {
                          console.error('สลับโหมดล้มเหลว:', err);
                        }
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-gray-100 flex items-center"
                    >
                      <FontAwesomeIcon icon={faRetweet} className="mr-2" />
                      {user?.is_user_mode ? 'สลับเป็นโหมดผู้ดูแล' : 'สลับเป็นโหมดผู้ใช้งาน'}
                    </button>


                  )}




                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    ออกจากระบบ
                  </button>
                </div>
              )}


            </div>
          ) : (
            <div className="flex space-x-2">

              {isLoggingOut && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <p className="text-lg font-semibold text-gray-800">กำลังออกจากระบบ...</p>
                    <div className="mt-4">
                      <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </header>
  );
}
