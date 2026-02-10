import './styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // ใช้สำหรับ redirect
import axios from 'axios';
import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from "@fortawesome/free-solid-svg-icons";


export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // หน้าปัจจุบัน
  const [rowsPerPage, setRowsPerPage] = useState(25); // จำนวนแถวต่อหน้า (ค่าเริ่มต้น)
  const router = useRouter(); // ตัวช่วยสำหรับ redirect

  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const [currentUserStatus, setCurrentUserStatus] = useState('');
  const [currentUserDepartment, setCurrentUserDepartment] = useState('');
  const [currentUserGroupName, setCurrentUserGroupName] = useState('');
  const [showNicknameInput, setShowNicknameInput] = useState({});
  const [nicknames, setNicknames] = useState({});



  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) throw new Error('Unauthorized');

        const user = await res.json();
        setCurrentUserStatus(user.status); // <-- เก็บสถานะ user ที่ล็อกอิน

        // Fetch additional user details to get department
        try {
          const userRes = await axios.get(`/api/users?username=${user.username}`);
          setCurrentUserDepartment(userRes.data.department);
          setCurrentUserGroupName(userRes.data.group_name);
        } catch (err) {
          console.error('Error fetching user details:', err);
        }

        if (user.status !== 'admin' && user.status !== 'superadmin' && user.status !== 'approver' && user.status !== 'approver2') {
          alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
          router.push('/');
        }
      } catch (error) {
        alert('กรุณาเข้าสู่ระบบก่อน');
        router.push('/');
      }
    };


    checkUserStatus();
  }, [router]);

  const saveNickname = async (userId) => {
    const nickname = nicknames[userId];

    try {
      await axios.put(`/api/users/${userId}/nickname`, { nickname }); // ✅ อย่าลืมสร้าง endpoint นี้

      setShowNicknameInput((prev) => ({ ...prev, [userId]: false }));

      // ✅ อัปเดตค่าใน users
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, nickname } : user
      );
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Failed to save nickname:", error);
      alert("ไม่สามารถบันทึกชื่อเล่นได้");
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoadingReports(true); // เริ่มแสดง overlay

    try {
      const response = await axios.get('/api/admin/users');
      // เรียงข้อมูลตาม id จากมากไปน้อย
      const sortedUsers = response.data.users.sort((a, b) => a.username - b.username);
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
    } finally {
      setIsLoadingReports(false); // ซ่อน overlay เมื่อเสร็จ
    }
  };





  const [filters, setFilters] = useState([
    { field: 'username', value: '' } // ตัวอย่างค่าเริ่มต้น
  ]);

  const handleFilterChange = (index, key, value) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const addFilter = () => {
    setFilters([...filters, { field: '', value: '' }]);
  };

  const removeFilter = (index) => {
    if (filters.length > 1) {
      setFilters(filters.filter((_, i) => i !== index));
    }
  };


  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // รีเซ็ตไปที่หน้าแรกเมื่อเปลี่ยนค่า
  };

  const applyFilters = (users, filters) => {
    return users.filter(user => {
      // เพิ่มเงื่อนไข matchesDepartment สำหรับ approver
      if (currentUserStatus === 'approver') {
        if (user.department !== currentUserDepartment) return false;
      }

      // เพิ่มเงื่อนไข matchesGroup สำหรับ approver2
      if (currentUserStatus === 'approver2') {
        if (user.group_name !== currentUserGroupName) return false;
      }

      return filters.every(filter => {
        if (filter.field === 'fullName') {
          // รวมคำนำหน้า + ชื่อ + นามสกุล โดยเว้นวรรค
          const combinedName = `${user.title || ''} ${user.first_name || ''} ${user.last_name || ''}`
            .replace(/\s+/g, ' ') // กันช่องว่างซ้ำ
            .trim()
            .toLowerCase();

          return combinedName.includes(filter.value.toLowerCase());
        }

        if (filter.field === 'positionLevel') {
          // รวมตำแหน่ง+ระดับ
          const combinedPosition = `${user.position || ''}${user.level || ''}`.toLowerCase();
          return combinedPosition.includes(filter.value.toLowerCase());
        }
        // ฟิลด์ทั่วไป
        const fieldValue = user[filter.field]?.toString().toLowerCase() || '';
        return fieldValue.includes(filter.value.toLowerCase());
      });
    });
  };


  const filteredUsers = applyFilters(users, filters);



  const updateStatus = async (id, status) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะเปลี่ยนสถานะผู้ใช้เป็น ${status}?`)) {
      try {
        await axios.post('/api/admin/update-user-status', { id, status });
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === id ? { ...user, status } : user
          )
        );
      } catch (error) {
        console.error(`Error updating user status to ${status}:`, error);
      }
    }
  };

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);



  return (
    <>

      {isLoadingReports && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-lg flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span>กำลังโหลด...</span>
          </div>
        </div>
      )}
      <Header />


      <div className="container mx-auto p-8 bg-gradient-to-r from-blue-500 to-green-600 text-white rounded-lg shadow-lg">

        <h1 className="text-3xl font-extrabold mb-6 text-center">User Manaement</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-4 p-4 bg-white text-gray-800 rounded-lg shadow">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {filters.map((filter, index) => (
              <div key={index} className="flex items-center space-x-2">
                <select
                  value={filter.field}
                  onChange={(e) => handleFilterChange(index, "field", e.target.value)}
                  className="border px-4 py-2 rounded"
                >
                  <option value="username">เลขบัตรประจำตัวประชาชน</option>
                  <option value="fullName">ชื่อ-สกุล</option>
                  {!['approver', 'approver2'].includes(currentUserStatus) && (
                    <option value="nickname">ชื่อเล่น</option>
                  )}
                  <option value="type">ประเภท</option>
                  <option value="positionLevel">ตำแหน่ง</option>
                  {!['approver', 'approver2'].includes(currentUserStatus) && (
                    <option value="department">สำนัก/กอง/ศูนย์</option>
                  )}
                  <option value="group_name">กลุ่ม/ฝ่าย</option>
                  {!['approver', 'approver2'].includes(currentUserStatus) && (
                    <option value="status">สถานะ</option>
                  )}
                </select>

                <input
                  type="text"
                  value={filter.value}
                  onChange={(e) => handleFilterChange(index, "value", e.target.value)}
                  placeholder="ค้นหา..."
                  className="border px-4 py-2 rounded flex-grow"
                />
                <button
                  onClick={() => removeFilter(index)}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <button
              onClick={addFilter}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded mt-4 md:mt-0"
            >
              เพิ่มเงื่อนไข
            </button>
          </div>

        </div>



        <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
          <thead>
            <tr className="bg-green-800 text-white">
              <th className="py-3 px-4 border-b border-gray-200">เลขบัตรประจำตัวประชาชน</th>
              <th className="py-3 px-4 border-b border-gray-200">ชื่อ-สกุล</th>
              {currentUserStatus === 'superadmin' && (
                <th className="py-3 px-4 border-b border-gray-200">ชื่อเล่น</th>
              )}
              <th className="py-3 px-4 border-b border-gray-200">ประเภท</th>
              <th className="py-3 px-4 border-b border-gray-200">ตำแหน่ง</th>
              <th className="py-3 px-4 border-b border-gray-200">สังกัด/กอง</th>
              <th className="py-3 px-4 border-b border-gray-200">กลุ่ม/ฝ่าย</th>
              {/* <th className="py-3 px-4 border-b border-gray-200">under_department1</th> 
                    <th className="py-3 px-4 border-b border-gray-200">under_department2</th>  */}
              {!['approver', 'approver2'].includes(currentUserStatus) && (
                <th className="py-3 px-4 border-b border-gray-200">สถานะ</th>
              )}
              {currentUserStatus === 'superadmin' && (
                <th className="py-3 px-4 border-b border-gray-200">Actions</th>
              )}

            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <tr key={user.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-blue-100'}>
                <td className="border px-4 py-2 text-center">
                  {user.id ? (
                    <a
                      href={`/user-details/${user.id}`} // ใช้ report.id ที่ถูกต้อง
                      className="text-blue-600 underline flex items-center justify-center gap-2"
                    >
                      {user.username}
                      <FontAwesomeIcon icon={faEye} className="text-blue-600 hover:text-blue" />

                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>

                <td className="border px-4 py-2 text-center">
                  {user.title} {user.first_name} {user.last_name}
                </td>

                {/* ✅ โชว์เฉพาะ superadmin */}
                {currentUserStatus === 'superadmin' && (
                  <td className="border px-4 py-2 text-center">
                    {/* แสดงชื่อเล่น + ปุ่มแก้ไขเหมือนโค้ดเดิม */}
                    {user.nickname && (
                      <div className="mb-2 text-green-700 font-semibold">{user.nickname}</div>
                    )}
                    {!showNicknameInput[user.id] ? (
                      <button
                        onClick={() =>
                          setShowNicknameInput((prev) => ({ ...prev, [user.id]: true }))
                        }
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                      >
                        {user.nickname ? "แก้ไขชื่อเล่น" : "ตั้งชื่อเล่น"}
                      </button>
                    ) : (
                      <div className="flex flex-col items-center">
                        <input
                          type="text"
                          value={nicknames[user.id] || ""}
                          onChange={(e) =>
                            setNicknames((prev) => ({ ...prev, [user.id]: e.target.value }))
                          }
                          className="border border-gray-300 rounded w-32 px-2 py-1"
                          placeholder="พิมพ์ชื่อเล่น"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => saveNickname(user.id)}
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                          >
                            บันทึก
                          </button>
                          <button
                            onClick={() =>
                              setShowNicknameInput((prev) => ({ ...prev, [user.id]: false }))
                            }
                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                )}

                <td className="border px-4 py-2 text-center">{user.type}</td>
                <td className="border px-4 py-2 text-center">
                  {user.position}{user.level}
                </td>
                <td className="border px-4 py-2 text-center">{user.department}</td>
                <td className="border px-4 py-2 text-center">
                  {user.group_name} {user.under_department1}
                </td>
                {!['approver', 'approver2'].includes(currentUserStatus) && (
                  <td className="border px-4 py-2 text-center">{user.status}</td>
                )}

                {/* ✅ โชว์เฉพาะ superadmin */}
                {currentUserStatus === 'superadmin' && (
                  <td className="border px-4 py-2 text-center">
                    {user.status === 'superadmin' ? (
                      <span className="text-gray-400 italic">Restricted</span>
                    ) : (
                      ['user', 'approver', 'approver2', 'admin', 'superadmin'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(user.id, status)}
                          className={`${user.status === status
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            } text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg mr-2`}
                          disabled={user.status === status}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>

        </table>

        <div className="flex justify-center items-center w-full mt-4 space-x-2">
          {/* ปุ่ม First */}
          <button
            onClick={() => setCurrentPage(1)}
            className={`py-2 px-3 rounded ${currentPage === 1
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            disabled={currentPage === 1}
          >
            « First
          </button>

          {/* ปุ่ม Previous */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`py-2 px-3 rounded ${currentPage === 1
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            disabled={currentPage === 1}
          >
            ‹ Prev
          </button>

          {/* หมายเลขหน้า */}
          {(() => {
            const pageButtons = [];
            const maxVisible = 5; // จำนวนหน้าที่จะแสดงรอบๆ
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisible - 1);

            if (end - start < maxVisible - 1) {
              start = Math.max(1, end - maxVisible + 1);
            }

            // หน้าแรกเสมอ
            if (start > 1) {
              pageButtons.push(
                <button
                  key={1}
                  onClick={() => setCurrentPage(1)}
                  className={`py-1 px-3 rounded ${currentPage === 1
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                >
                  1
                </button>
              );

              if (start > 2) {
                pageButtons.push(
                  <span key="start-ellipsis" className="text-gray-400 px-2">
                    ...
                  </span>
                );
              }
            }

            // หน้าตรงกลาง
            for (let i = start; i <= end; i++) {
              pageButtons.push(
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`py-1 px-3 rounded ${currentPage === i
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                >
                  {i}
                </button>
              );
            }

            // หน้าสุดท้ายเสมอ
            if (end < totalPages) {
              if (end < totalPages - 1) {
                pageButtons.push(
                  <span key="end-ellipsis" className="text-gray-400 px-2">
                    ...
                  </span>
                );
              }

              pageButtons.push(
                <button
                  key={totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className={`py-1 px-3 rounded ${currentPage === totalPages
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                >
                  {totalPages}
                </button>
              );
            }

            return pageButtons;
          })()}

          {/* ปุ่ม Next */}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={`py-2 px-3 rounded ${currentPage === totalPages
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            disabled={currentPage === totalPages}
          >
            Next ›
          </button>

          {/* ปุ่ม Last */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            className={`py-2 px-3 rounded ${currentPage === totalPages
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            disabled={currentPage === totalPages}
          >
            Last »
          </button>
        </div>


        <div className="mt-4 space-y-4">
          {/* Dropdown เลือกจำนวนแถวต่อหน้า */}
          <div className="flex flex-col items-start">
            <label htmlFor="rowsPerPage" className="text-white font-semibold mb-1">
              แสดงแถวต่อหน้า:
            </label>
            <select
              id="rowsPerPage"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="border rounded px-3 py-2 text-black"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={150}>150</option>
            </select>
          </div>



        </div>






      </div>
    </>
  );
}
