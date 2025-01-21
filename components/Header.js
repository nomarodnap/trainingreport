// Header.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from "next/router";

export default function Header() {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    const storedStatus = localStorage.getItem('status');

    if (storedUser && storedStatus) {
      setUser({ username: storedUser, status: storedStatus });
    }

    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    router.push('/signin');
  };

  const markAsRead = async (id) => {
    try {
      await axios.post(`/api/notifications/${id}/mark-as-read`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationClick = async (id) => {
    await markAsRead(id);
    router.push(`/reports?reportId=${id}`);
  };

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const toggleNotification = () => setIsNotificationOpen((prev) => !prev);

  return (
    <header className="bg-blue-600 text-white py-3 shadow-md fixed top-0 w-full z-50">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" legacyBehavior>
          <a className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 mr-3" />
            <h1 className="text-lg font-bold">ระบบจองห้องประชุมกรมประมง</h1>
          </a>
        </Link>

        <div className="flex items-center space-x-4">
          {user && user.status === 'admin' && (
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
                    <h4 className="font-semibold text-lg">รายงานเข้ามาใหม่</h4>
                    {notifications.filter((n) => !n.isRead).length === 0 ? (
                      <p className="text-sm text-gray-500">ไม่มีรายงานเข้ามาใหม่</p>
                    ) : (
                      <ul className="space-y-2">
                        {notifications.filter((n) => !n.isRead).map((notification) => (
                          <li
                            key={notification.id}
                            className="p-2 rounded bg-blue-50 flex flex-col"
                          >
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold">
                                รหัสรายงาน {notification.id}: {notification.courseCode || 'N/A'}
                              </h3>
                              <p className="text-xs text-gray-700">
                                ผู้รายงาน: {notification.full_name} | สถานะ: {notification.state}
                              </p>
                            </div>
                            <button
                              onClick={() => handleNotificationClick(notification.id)}
                              className="text-blue-600 text-sm underline mt-2 self-end"
                            >
                              ดูเพิ่มเติม
                            </button>
                          </li>
                        ))}
                      </ul>
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
                className="bg-white text-blue-600 font-semibold py-1 px-3 rounded-full text-sm flex items-center"
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                {user.username}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white text-gray-800 rounded shadow-md w-48">
                  <div className="px-4 py-2">
                    <h6 className="font-semibold">{user.username}</h6>
                    <p className="text-sm text-gray-500">
                      สถานะ: {user.status === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}
                    </p>
                  </div>
                  <Link href="/profile" legacyBehavior>
                    <a className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 flex items-center">
                      <FontAwesomeIcon icon={faCog} className="mr-2" />
                      แก้ไขข้อมูลส่วนตัว
                    </a>
                  </Link>
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
              <Link href="/signup" legacyBehavior>
                <a className="bg-white text-blue-600 font-semibold py-1 px-3 rounded-full text-sm">
                  ลงทะเบียน
                </a>
              </Link>
              <Link href="/signin" legacyBehavior>
                <a className="bg-blue-700 text-white font-semibold py-1 px-3 rounded-full text-sm">
                  เข้าใช้งาน
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
