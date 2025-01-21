import { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // ดึงข้อมูลจาก API
    axios
      .get('/api/notifications')
      .then((response) => {
        setNotifications(response.data);
      })
      .catch((error) => {
        console.error('Failed to fetch notifications:', error);
      });
  }, []);

  const handleNotificationClick = async (id) => {
    try {
      await axios.patch(`/api/reports/${id}`, { isRead: true });
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">การแจ้งเตือน</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-500">ไม่มีการแจ้งเตือน</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-4 rounded-lg shadow-md ${
                notification.isRead ? 'bg-gray-100' : 'bg-blue-50'
              }`}
            >
              <h3 className="text-lg font-semibold">
                การอบรม: {notification.courseCode || 'N/A'}
              </h3>
              <p className="text-sm text-gray-700">
                ผู้แจ้ง: {notification.username} <br />
                หน่วยงานอบรม: {notification.trainingOrg || 'N/A'} <br />
                วันที่อบรม: {notification.startDate} ถึง {notification.endDate} <br />
                สถานะ: {notification.state}
              </p>
              <button
                onClick={() => handleNotificationClick(notification.id)}
                className={`mt-2 text-sm font-medium px-4 py-2 rounded ${
                  notification.isRead
                    ? 'bg-gray-300 text-gray-700 cursor-default'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                disabled={notification.isRead}
              >
                {notification.isRead ? 'อ่านแล้ว' : 'ทำเครื่องหมายว่าอ่านแล้ว'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
