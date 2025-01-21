import '../styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../components/Header';

export default function UserDetails() {
    const [userDetails, setUserDetails] = useState(null);
    const [reports, setReports] = useState([]);
    const [filters, setFilters] = useState([{ field: 'fiscalYear', value: '' }]);
    const [showTable, setShowTable] = useState(1);
    const router = useRouter();
    const { id } = router.query;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/users/${id}?includeReports=true`);
                setUserDetails(response.data);
                setReports(response.data.trainingReports || []); // ถ้ามี trainingReports ให้เก็บไว้ใน state
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('ไม่สามารถโหลดข้อมูลได้');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    // ฟังก์ชันช่วยคำนวณปีงบประมาณ
    const calculateFiscalYear = (dateString) => {
        const date = new Date(dateString);
        let year = date.getFullYear() + 543;
        if (date.getMonth() >= 9) year += 1;
        return year;
    };


    const filteredReports = reports.filter((report) =>
        filters.every((filter) => {
            if (!filter.value) return true;
            if (filter.field === "fiscalYear") {
                const fiscalYear = calculateFiscalYear(report.submitTime);
                return fiscalYear.toString().includes(filter.value);
            }
            const fieldValue = report[filter.field]?.toString().toLowerCase();
            return fieldValue?.includes(filter.value.toLowerCase());
        })
    );



    if (loading) {
        return (
            <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
                <p>กำลังโหลดข้อมูล...</p>
            </div>
        );
    }


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <>
            <Header />
            <ToastContainer />
<div className="container mx-auto p-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-lg">
  <h1 className="text-2xl font-bold mb-4 text-center">Training Reports for {userDetails.username}</h1>

                {userDetails ? (
<div className="mb-4 p-4 bg-white text-gray-800 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-3">
                            ข้อมูลผู้ใช้: {userDetails.username}
                        </h2>    <div className="grid grid-cols-4 gap-4 text-sm">
        <div><strong>ชื่อ-นามสกุล:</strong> {userDetails.first_name} {userDetails.last_name}</div>
        <div><strong>เบอร์โทรศัพท์:</strong> {userDetails.phone_number || "N/A"}</div>
        <div><strong>ตำแหน่ง:</strong> {userDetails.position || "N/A"}</div>
        <div><strong>ระดับ:</strong> {userDetails.level || "N/A"}</div>
        <div><strong>สำนัก/กอง/ศูนย์:</strong> {userDetails.department || "N/A"}</div>
        <div><strong>กลุ่ม/ฝ่าย:</strong> {userDetails.group_name || "N/A"}</div>
        <div><strong>หน่วยงานภายใต้กอง 1:</strong> {userDetails.under_department1 || "N/A"}</div>
        <div><strong>หน่วยงานภายใต้กอง 2:</strong> {userDetails.under_department2 || "N/A"}</div>
    </div>
  </div>
                ) : (
                    <p>ไม่พบข้อมูลผู้ใช้</p>
                )}
                {showTable === 1 && (  <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
    <thead className="bg-blue-800 text-white">
      <tr>
        <th className="py-3 px-4 border-b border-gray-200">ปีงบประมาณ</th>
        <th className="py-3 px-4 border-b border-gray-200">รหัส</th>
        <th className="py-3 px-4 border-b border-gray-200">วิชา</th>
        <th className="py-3 px-4 border-b border-gray-200">หมวด</th>
        <th className="py-3 px-4 border-b border-gray-200">หน่วยงานที่จัด</th>
        <th className="py-3 px-4 border-b border-gray-200">วิธีการอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">สถานที่อบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">วันที่เริ่มอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">วันที่สิ้นสุดการอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">เกียรติบัตร</th> {/* เพิ่มหัวข้อ Certificate */}
        <th className="py-3 px-4 border-b border-gray-200">สถานะ</th>
      </tr>
    </thead>
    <tbody>
    {reports.map((report, index) => (
        <tr key={report.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-blue-100'}>
            <td className="border px-4 py-2 text-center">{calculateFiscalYear(report.submitTime)}</td>
            <td className="border px-4 py-2 text-center">{report.id}</td>
            <td className="border px-4 py-2 text-center">{report.courseCode}</td>
            <td className="border px-4 py-2 text-center">{report.category}</td>
            <td className="border px-4 py-2 text-center">{report.trainingOrg}</td>
            <td className="border px-4 py-2 text-center">{report.trainingMethod}</td>
            <td className="border px-4 py-2 text-center">{report.hybridLocation || "N/A"}</td>
            <td className="border px-4 py-2 text-center">{formatDate(report.startDate)}</td>
            <td className="border px-4 py-2 text-center">{formatDate(report.endDate)}</td>
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
</tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
