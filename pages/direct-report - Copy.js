import './styles.css';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from "next/router";


export default function DirectReport() {
    const [reports, setReports] = useState([]);
    const [username, setUsername] = useState('');
    const [userDetails, setUserDetails] = useState(null); // เก็บข้อมูลผู้ใช้
       const router = useRouter();
  

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    useEffect(() => {
        if (username) {
            fetchReports();
            fetchUserDetails(); // ดึงข้อมูลผู้ใช้
        }
    }, [username]);

const fetchReports = async () => {
    try {
        const response = await axios.get('/api/reports');
        const filteredReports = response.data
            .filter((report) => report.username === username)
            .sort((a, b) => b.id - a.id); // เรียง id จากมากไปน้อย
        setReports(filteredReports);
    } catch (error) {
        console.error('Error fetching reports:', error);
    }
};

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`/api/users?username=${username}`);
            setUserDetails(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

const redirectToEditForm = (id) => {
  console.log("This function is called"); // เพิ่ม Debug ตรงนี้
  console.log("Edit button clicked with ID:", id);


  if (!id) {
    console.log("ID is not defined, cannot navigate to form.");
    return;
  }

  setTimeout(() => {
       console.warn("Redirecting to form page now...");
    router.push(`/edit?id=${id}`);
  }, 500); // รอ 500ms ก่อนเปลี่ยนหน้า
};



const calculateTotalCost = () => {
    return reports.reduce((total, report) => total + (Number(report.totalCost) || 0), 0);
};


const deleteReport = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
        try {
            await axios.delete(`/api/reports?id=${id}`);
            setReports((prevReports) => prevReports.filter((report) => report.id !== id));
            toast.success("Report deleted successfully!");
        } catch (error) {
            toast.error("Error deleting report. Please try again.");
            console.error('Error deleting report:', error);
        }
    }
};

const calculateFiscalYear = (submitTime) => {
    const date = new Date(submitTime);
    let year = date.getFullYear() + 543; // แปลงปี ค.ศ. เป็น พ.ศ.
    const month = date.getMonth(); // เดือนเริ่มจาก 0 (มกราคม)

    // ถ้าเดือนตั้งแต่ตุลาคม (9) เป็นต้นไป ให้บวกปีอีก 1
    if (month >= 9) {
        year += 1;
    }


    return year;
};


    return (
<>
    <ToastContainer />

<div className="container mx-auto p-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-lg">
    <h1 className="text-2xl font-bold mb-4 text-center">Training Reports for {username}</h1>

    {/* User Details Section */}
    {userDetails && (
<div className="mb-4 p-4 bg-white text-gray-800 rounded-lg shadow">
    <h2 className="text-lg font-semibold mb-3">User Details</h2>
    <div className="grid grid-cols-4 gap-4 text-sm">
        <div><strong>Name:</strong> {userDetails.first_name} {userDetails.last_name}</div>
        <div><strong>Phone:</strong> {userDetails.phone_number || "N/A"}</div>
        <div><strong>Position:</strong> {userDetails.position || "N/A"}</div>
        <div><strong>Level:</strong> {userDetails.level || "N/A"}</div>
        <div><strong>Department:</strong> {userDetails.department || "N/A"}</div>
        <div><strong>Group:</strong> {userDetails.group_name || "N/A"}</div>
        <div><strong>Under Dept 1:</strong> {userDetails.under_department1 || "N/A"}</div>
        <div><strong>Under Dept 2:</strong> {userDetails.under_department2 || "N/A"}</div>
    </div>
    <div className="flex justify-end mt-3">
        <button
            onClick={() => window.location.href = '/form'}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded text-sm transition duration-200"
        >
            เพิ่มแบบ กบค
        </button>
    </div>
</div>

    )}

    <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
<thead>
    <tr className="bg-blue-800 text-white">
        <th className="py-3 px-4 border-b border-gray-200">ID</th> {/* คอลัมน์ใหม่ */}
        <th className="py-3 px-4 border-b border-gray-200">Fiscal Year</th>
        <th className="py-3 px-4 border-b border-gray-200">Training Org</th>
        <th className="py-3 px-4 border-b border-gray-200">Course Code</th>
        <th className="py-3 px-4 border-b border-gray-200">Category</th>
        <th className="py-3 px-4 border-b border-gray-200">Method</th>
        <th className="py-3 px-4 border-b border-gray-200">Start Date</th>
        <th className="py-3 px-4 border-b border-gray-200">End Date</th>
        <th className="py-3 px-4 border-b border-gray-200">Total Cost</th>
        <th className="py-3 px-4 border-b border-gray-200">Certificate</th> {/* เพิ่มหัวข้อ Certificate */}
        <th className="py-3 px-4 border-b border-gray-200">Status</th>
        <th className="py-3 px-4 border-b border-gray-200">Actions</th>
    </tr>
</thead>
<tbody>
    {reports.map((report, index) => (
        <tr key={report.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-blue-100'}>
            <td className="border px-4 py-2 text-center">{report.id}</td> {/* คอลัมน์ ID */}
            <td className="border px-4 py-2 text-center">{calculateFiscalYear(report.submitTime)}</td>
            <td className="border px-4 py-2 text-center">{report.trainingOrg}</td>
            <td className="border px-4 py-2 text-center">{report.courseCode}</td>
            <td className="border px-4 py-2 text-center">{report.category}</td>
            <td className="border px-4 py-2 text-center">{report.trainingMethod}</td>
            <td className="border px-4 py-2 text-center">{formatDate(report.startDate)}</td>
            <td className="border px-4 py-2 text-center">{formatDate(report.endDate)}</td>
            <td className="border px-4 py-2 text-center">{report.totalCost}</td>
            <td className="border px-4 py-2 text-center">
                {report.certificate_url ? (
                    <a
                        href={report.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                    >
                        View
                    </a>
                ) : (
                    "N/A"
                )}
            </td> {/* แสดงลิงก์ Certificate */}
            <td className="border px-4 py-2 text-center">{report.status || "รออนุมัติ"}</td>
            <td className="border px-4 py-2 text-center">
                <button
                    onClick={() => redirectToEditForm(report.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ml-2"
                >
                    Edit
                </button>
                <button
                    onClick={() => deleteReport(report.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"
                >
                    Delete
                </button>
            </td>
        </tr>
    ))}

    <tr className="bg-gray-300">
        <td colSpan="8" className="border px-4 py-2 font-bold text-right">Total Cost:</td>
        <td className="border px-4 py-2 font-bold text-center">{calculateTotalCost()}</td>
        <td colSpan="2" className="border px-4 py-2"></td>
    </tr>

</tbody>
    </table>

        </div>
</>
    );
}
