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
    // ดึง storedStatus จาก localStorage
    const storedStatus = localStorage.getItem('status'); 

    // Debug: แสดงค่า storedStatus ใน console
    console.log('Stored Status:', storedStatus);

    // ตรวจสอบสถานะ
    if (storedStatus !== 'admin' && storedStatus !== 'approver') {
        console.log('User is not admin, redirecting to index page');
        router.push('/'); // Redirect หากสถานะไม่ใช่ admin
        return;
    }

    // หากสถานะเป็น admin ให้ดำเนินการดึงข้อมูลผู้ใช้
}, [router]);

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


const handleFilterChange = (index, key, value) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    setFilters(newFilters);
};

const addFilter = () => {
    setFilters([...filters, { field: "fiscalYear", value: "" }]);
};

const removeFilter = (index) => {
    if (filters.length > 1) {
        setFilters(filters.filter((_, i) => i !== index));
    }
};

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

const handleToggleTable = (tableNumber) => {
    setShowTable(tableNumber); // แสดงตารางตามหมายเลขที่เลือก
};

const calculateTotalCost = () => {
    return reports.reduce((total, report) => total + (Number(report.totalCost) || 0), 0);
};


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

<div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
    {filters.map((filter, index) => (
        <div key={index} className="flex items-center space-x-2">
            <select
                value={filter.field}
                onChange={(e) => handleFilterChange(index, "field", e.target.value)}
                className="border px-4 py-2 rounded"
            >
                <option value="fiscalYear">ปีงบประมาณ</option>
                <option value="id">รหัส</option>
                <option value="courseCode">วิชา</option>
                <option value="category">หมวด</option>
                <option value="trainingOrg">หน่วยงานที่จัด</option>
                <option value="trainingMethod">วิธีการอบรม</option>
                <option value="hybridLocation">สถานที่อบรม</option>
                <option value="category">วันที่เริ่มอบรม</option>
                <option value="category">วันที่สิ้นสุดการอบรม</option>
                <option value="state">สถานะ</option>
                <option value="regFeeAmount">ค่าลงทะเบียน</option>
                <option value="accommodationFeeAmount">ค่าที่พัก</option>
                <option value="transportationFeeAmount">ค่าเดินทาง</option>
                <option value="allowanceFeeAmount">ค่าเบี้ยเลี้ยง</option>
                <option value="totalCost">รวมค่าใช้จ่าย</option>
                <option value="internalBudget">เบิกงบจากกรมประมง</option>
                <option value="externalAgency">หน่วยงานอื่นที่สนับสนุนงบ</option>
                <option value="externalBudget">เบิกงบจากหน่วยงานอื่น</option>
                <option value="planBudget">เบิกจ่ายงบจากแผนงาน</option>
                <option value="projectOutput">ผลผลิต/โครงการ</option>
                <option value="mainActivity">กิจกรรมหลัก</option>
                <option value="subActivity">กิจกรรมย่อย</option>
                <option value="knowledgeSelfDevelop">พัฒนาตนเอง</option>
                <option value="knowledgeWorkImprove">พัฒนางาน</option>
                <option value="knowledgeTeamwork">ได้ความรู้</option>
                <option value="knowledgeEfficiency">ประสิทธิผล</option>
                <option value="knowledgeNetworking">บูรณาการ</option>
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
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-4 rounded"
    >
        เพิ่มเงื่อนไข
    </button>
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
        <th className="py-3 px-4 border-b border-gray-200">ประกาศนียบัตร</th>
        <th className="py-3 px-4 border-b border-gray-200">สถานะ</th>
      </tr>
    </thead>
    <tbody>
    {filteredReports.map((report, index) => (
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
<td 
    className={`border px-4 py-2 text-center font-semibold 
        ${
            report.state === "อนุมัติแล้ว" ? "text-green-600" :
            report.state === "ไม่อนุมัติ" ? "text-red-600" :
            "text-yellow-500"
        }
    `}
>
    {report.state || "รออนุมัติ"}
</td>
</tr>
                            ))}
                        </tbody>
                    </table>

)}

{showTable === 2 && (
    <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
        <thead>
            <tr className="bg-blue-800 text-white">
		<th className="py-3 px-4 border-b border-gray-200">ปีงบประมาณ</th>
                <th className="py-3 px-4 border-b border-gray-200">รหัส</th>
                <th className="py-3 px-4 border-b border-gray-200">วิชา</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าลงทะเบียน</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าที่พัก</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าเดินทาง</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าเบี้ยเลี้ยง</th>
                <th className="py-3 px-4 border-b border-gray-200">รวมค่าใช้จ่าย</th>
                <th className="py-3 px-4 border-b border-gray-200">เบิกงบจากกรมประมง</th>
                <th className="py-3 px-4 border-b border-gray-200">หน่วยงานอื่นที่สนับสนุนงบ</th>
                <th className="py-3 px-4 border-b border-gray-200">เบิกงบจากหน่วยงานอื่น</th>
            </tr>
        </thead>
        <tbody>
            {filteredReports.map((report) => (
                <tr key={report.id}>
		    <td className="border px-4 py-2 text-center">{calculateFiscalYear(report.submitTime)}</td>
                    <td className="border px-4 py-2 text-center">{report.id}</td>
                    <td className="border px-4 py-2 text-center">{report.courseCode}</td>
                    <td className="border px-4 py-2 text-center">{report.regFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.accommodationFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.transportationFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.allowanceFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.totalCost || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.internalBudget || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.externalAgency || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.externalBudget || "N/A"}</td></tr>
            ))}

    <tr className="bg-gray-300">
        <td colSpan="7" className="border px-4 py-2 font-bold text-right">จำนวนเงินทั้งสิ้น:</td>
        <td className="border px-4 py-2 font-bold text-center">{calculateTotalCost()}</td>
	<td></td>
	<td></td><td></td>
                                        <td>
                                </td>


    </tr>
        </tbody>
    </table>
)}

{showTable === 3 && (
    <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg mt-4">
        <thead>
            <tr className="bg-blue-800 text-white">
		<th className="py-3 px-4 border-b border-gray-200">ปีงบประมาณ</th>
                <th className="py-3 px-4 border-b border-gray-200">รหัส</th>
                <th className="py-3 px-4 border-b border-gray-200">วิชา</th>
                <th className="py-3 px-4 border-b border-gray-200">เบิกจ่ายงบจากแผนงาน</th>
                <th className="py-3 px-4 border-b border-gray-200">ผลผลิต/โครงการ</th>
                <th className="py-3 px-4 border-b border-gray-200">กิจกรรมหลัก</th>
                <th className="py-3 px-4 border-b border-gray-200">กิจกรรมย่อย</th>
                <th className="py-3 px-4 border-b border-gray-200">พัฒนาตนเอง</th>
                <th className="py-3 px-4 border-b border-gray-200">พัฒนางาน</th>
                <th className="py-3 px-4 border-b border-gray-200">ได้ความรู้</th>
                <th className="py-3 px-4 border-b border-gray-200">ประสิทธิผล</th>
                <th className="py-3 px-4 border-b border-gray-200">บูรณาการ</th>
            </tr>
        </thead>
        <tbody>
            {filteredReports.map((report) => (
                <tr key={report.id}>
		    <td className="border px-4 py-2 text-center">{calculateFiscalYear(report.submitTime)}</td>
                    <td className="border px-4 py-2 text-center">{report.id}</td>
                    <td className="border px-4 py-2 text-center">{report.courseCode}</td>
                    <td className="border px-4 py-2 text-center">{report.planBudget || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.projectOutput || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.mainActivity || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.subActivity || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.knowledgeSelfDevelop}</td>
                    <td className="border px-4 py-2 text-center">{report.knowledgeWorkImprove}</td>
                    <td className="border px-4 py-2 text-center">{report.knowledgeTeamwork}</td>
                    <td className="border px-4 py-2 text-center">{report.knowledgeEfficiency}</td>
                    <td className="border px-4 py-2 text-center">{report.knowledgeNetworking}</td>

                </tr>
            ))}
        </tbody>
    </table>
)}

<div className="flex space-x-2">
    <button onClick={() => handleToggleTable(1)} className="bg-blue-500 text-white py-1 px-3 rounded">ตาราง 1</button>
    <button onClick={() => handleToggleTable(2)} className="bg-blue-500 text-white py-1 px-3 rounded">ตาราง 2</button>
    <button onClick={() => handleToggleTable(3)} className="bg-blue-500 text-white py-1 px-3 rounded">ตาราง 3</button>
</div>


            </div>
        </>
    );
}
