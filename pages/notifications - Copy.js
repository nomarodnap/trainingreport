// notifications.js
import { useState, useEffect } from 'react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/reports'); // เรียก API เพื่อดึงข้อมูล
        const data = await response.json();
        setNotifications(data); // สมมติว่า API คืนข้อมูลการแจ้งเตือน
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-4">การแจ้งเตือน</h1>

      {loading ? (
        <p>กำลังโหลด...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-600">ไม่มีการแจ้งเตือนใหม่</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification, index) => (
            <li key={index} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
              <h2 className="font-semibold text-lg">{notification.courseCode}</h2>
              <p className="text-gray-600">{notification.trainingOrg}</p>
              <span className="text-sm text-gray-500">
                {notification.submitTime
                  ? new Date(notification.submitTime).toLocaleString('th-TH')
                  : 'ไม่มีข้อมูลวันที่'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
