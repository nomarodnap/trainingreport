import './styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // ใช้สำหรับ redirect
import axios from 'axios';
import Header from '../components/Header';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // หน้าปัจจุบัน
  const rowsPerPage = 20; // จำนวนแถวต่อหน้า
  const router = useRouter(); // ตัวช่วยสำหรับ redirect

  useEffect(() => {
    const storedStatus = localStorage.getItem('status');


    // ตรวจสอบสถานะผู้ใช้งาน
    if (storedStatus !== 'admin') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      router.push('/'); // redirect ไปหน้า index
    }
  }, [router]);



    useEffect(() => {
        fetchUsers();
    }, []);

const fetchUsers = async () => {
    try {
        const response = await axios.get('/api/admin/users');
        // เรียงข้อมูลตาม id จากมากไปน้อย
        const sortedUsers = response.data.users.sort((a, b) => b.id - a.id);
        setUsers(sortedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        setError('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
    }
};





const [filters, setFilters] = useState([
    { field: 'id', value: '' } // ตัวอย่างค่าเริ่มต้น
]);

const handleFilterChange = (index, key, value) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    setFilters(newFilters);
};

const addFilter = () => {
    setFilters([...filters, { field: '', value: '' }]);
};

const removeFilter = (index) => {
    if (filters.length > 1) {
        setFilters(filters.filter((_, i) => i !== index));
    }
};



const applyFilters = (users, filters) => {
    return users.filter(user => {
        return filters.every(filter => {
            if (filter.field === 'positionLevel') {
                // รวม position และ level เข้าด้วยกันเหมือนในตาราง
                const combinedValue = `${user.position || ''}${user.level || ''}`.toLowerCase();
                return combinedValue.includes(filter.value.toLowerCase());
            }
            // ค้นหาตามฟิลด์ทั่วไป
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
                <option value="id">รหัส</option>
                <option value="username">ยูเซอร์เนม</option>
                <option value="email">อีเมล</option>
                <option value="first_name">ชื่อ</option>
                <option value="last_name">นามสกุล</option>
                <option value="phone_number">เบอร์โทร</option>
                <option value="positionLevel">ตำแหน่ง</option>
                <option value="department">สำนัก/กอง/ศูนย์</option>
                <option value="group_name">กลุ่ม/ฝ่าย</option>
                <option value="status">สถานะ</option>
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
                        <th className="py-3 px-4 border-b border-gray-200">รหัส</th>
                        <th className="py-3 px-4 border-b border-gray-200">ยูเซอร์เนม</th>
                        <th className="py-3 px-4 border-b border-gray-200">อีเมล์</th>
                        <th className="py-3 px-4 border-b border-gray-200">ชื่อ-นามสกุล</th>
                        <th className="py-3 px-4 border-b border-gray-200">เบอร์โทร</th>
                        <th className="py-3 px-4 border-b border-gray-200">ตำแหน่ง</th>
                        <th className="py-3 px-4 border-b border-gray-200">สำนัก/กอง/ศูนย์</th>
                        <th className="py-3 px-4 border-b border-gray-200">กลุ่ม/ฝ่าย</th>
                       {/* <th className="py-3 px-4 border-b border-gray-200">under_department1</th> 
                    <th className="py-3 px-4 border-b border-gray-200">under_department2</th>  */}
                        <th className="py-3 px-4 border-b border-gray-200">Status</th>
                        <th className="py-3 px-4 border-b border-gray-200">Actions</th>
                    </tr>
                </thead>
<tbody>
    {currentUsers.map((user, index) => (
        <tr key={user.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-blue-100'}>
<td className="border px-4 py-2 text-center">
    {user.id ? (
        <a
            href={`/user-details/${user.id}`} // ใช้ user.id ที่ถูกต้อง
            className="text-blue-600 underline hover:text-blue-800"
        >
{user.id}


        </a>
    ) : (
        "N/A"
    )}
</td>



            <td className="border px-4 py-2 text-center">

{user.username}
</td>
            <td className="border px-4 py-2 text-center">{user.email}</td>
            <td className="border px-4 py-2 text-center">
                {user.first_name} {user.last_name}
            </td>
            <td className="border px-4 py-2 text-center">{user.phone_number}</td>
            <td className="border px-4 py-2 text-center">
                {user.position}{user.level}
            </td>
            <td className="border px-4 py-2 text-center">{user.department}</td>
            <td className="border px-4 py-2 text-center">{user.group_name}</td>
            <td className="border px-4 py-2 text-center">{user.status}</td>
            <td className="border px-4 py-2 text-center">
                {['admin', 'user', 'approver'].map((status) => (
                    <button
                        key={status}
                        onClick={() => updateStatus(user.id, status)}
                        className={`${
                            user.status === status
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        } text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg mr-2`}
                        disabled={user.status === status}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </td>
        </tr>
    ))}
</tbody>

            </table>

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className={`py-2 px-4 rounded ${
                        currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span className="text-white font-semibold">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className={`py-2 px-4 rounded ${
                        currentPage === totalPages ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>






        </div>
</>
    );
}
