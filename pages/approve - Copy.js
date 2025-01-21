// pages/approve.js
import './styles.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ApprovePage() {
    const [reports, setReports] = useState([]);
    const [showTable, setShowTable] = useState(1);


const handleToggleTable = (tableNumber) => {
    setShowTable(tableNumber); // แสดงตารางตามหมายเลขที่เลือก
};

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await axios.get('/api/reports');
            setReports(response.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };

 const updateCondition = async (id, condition) => {
    console.log("Updating condition for report ID:", id, "to", condition);  // เพิ่ม log ที่นี่
    try {
        await axios.post('/api/approve', { id, condition });
        console.log("Successfully updated condition");  // เพิ่ม log เพื่อยืนยันว่าเรียก axios ได้สำเร็จ
        setReports((prevReports) => 
            prevReports.map((report) => 
                report.id === id ? { ...report, condition } : report
            )
        );
    } catch (error) {
        console.error(`Error updating condition to ${condition}:`, error);  // เพิ่ม log error
    }
};


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const calculateFiscalYear = (dateString) => {
        const date = new Date(dateString);
        let year = date.getFullYear() + 543;
        if (date.getMonth() >= 9) year += 1;
        return year;
    };

const calculateTotalCost = () => {
    return reports.reduce((total, report) => total + (Number(report.totalCost) || 0), 0);
};


    return (
        <div className="container mx-auto p-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-extrabold mb-6 text-center">Approval Dashboard</h1>
                {showTable === 1 && (  <table className="min-w-full bg-white text-gray-800 rounded-lg shadow-lg">
    <thead className="bg-blue-800 text-white">
      <tr>
        <th className="py-3 px-4 border-b border-gray-200">ปีงบประมาณ</th>
        <th className="py-3 px-4 border-b border-gray-200">รหัส</th>
    <th className="py-3 px-4 border-b border-gray-200">ชื่อ-นามสกุล</th> {/* เพิ่มคอลัมน์นี้ */}
        <th className="py-3 px-4 border-b border-gray-200">วิชา</th>
        <th className="py-3 px-4 border-b border-gray-200">หมวด</th>
        <th className="py-3 px-4 border-b border-gray-200">หน่วยงานที่จัด</th>
        <th className="py-3 px-4 border-b border-gray-200">วิธีการอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">สถานที่อบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">วันที่เริ่มอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">วันที่สิ้นสุดการอบรม</th>
        <th className="py-3 px-4 border-b border-gray-200">เกียรติบัตร</th>
        <th className="py-3 px-4 border-b border-gray-200">สถานะ</th>
        <th className="py-3 px-4 border-b border-gray-200">ดำเนินการ</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report, index) => (
        <tr key={report.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-blue-100'}>
            <td className="border px-4 py-2 text-center">{calculateFiscalYear(report.submitTime)}</td>
            <td className="border px-4 py-2 text-center">{report.id}</td>
      <td className="border px-4 py-2 text-center">{`${report.first_name} ${report.last_name}`}</td> {/* เพิ่มข้อมูลชื่อ-นามสกุล */}
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
            </td> 

<td 
    className={`border px-4 py-2 text-center font-semibold 
        ${
            report.condition === "อนุมัติแล้ว" ? "text-green-600" :
            report.condition === "ไม่อนุมัติ" ? "text-red-600" :
            "text-yellow-500"
        }
    `}
>
    {report.condition || "รออนุมัติ"}
</td>


                            <td className="border px-4 py-2 text-center">
                                <button
                                    onClick={() => updateCondition(report.id, 'อนุมัติแล้ว')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg mr-2"
                                >
                                    อนุมัติ
                                </button>
                                <button
                                    onClick={() => updateCondition(report.id, 'ไม่อนุมัติ')}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    ไม่อนุมัติ
                                </button>
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
    <th className="py-3 px-4 border-b border-gray-200">ชื่อ-นามสกุล</th> {/* เพิ่มคอลัมน์นี้ */}
                <th className="py-3 px-4 border-b border-gray-200">วิชา</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าลงทะเบียน</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าที่พัก</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าเดินทาง</th>
                <th className="py-3 px-4 border-b border-gray-200">ค่าเบี้ยเลี้ยง</th>
                <th className="py-3 px-4 border-b border-gray-200">รวมค่าใช้จ่าย</th>
                <th className="py-3 px-4 border-b border-gray-200">เบิกงบจากกรมประมง</th>
                <th className="py-3 px-4 border-b border-gray-200">หน่วยงานอื่นที่สนับสนุนงบ</th>
                <th className="py-3 px-4 border-b border-gray-200">เบิกงบจากหน่วยงานอื่น</th>
        <th className="py-3 px-4 border-b border-gray-200">สถานะ</th>
        <th className="py-3 px-4 border-b border-gray-200">ดำเนินการ</th>
            </tr>
        </thead>
        <tbody>
            {reports.map((report) => (
                <tr key={report.id}>
		    <td className="border px-4 py-2 text-center">{calculateFiscalYear(report.submitTime)}</td>
                    <td className="border px-4 py-2 text-center">{report.id}</td>
      <td className="border px-4 py-2 text-center">{`${report.first_name} ${report.last_name}`}</td> {/* เพิ่มข้อมูลชื่อ-นามสกุล */}
                    <td className="border px-4 py-2 text-center">{report.courseCode}</td>
                    <td className="border px-4 py-2 text-center">{report.regFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.accommodationFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.transportationFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.allowanceFeeAmount || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.totalCost || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.internalBudget || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.externalAgency || "N/A"}</td>
                    <td className="border px-4 py-2 text-center">{report.externalBudget || "N/A"}</td>
<td 
    className={`border px-4 py-2 text-center font-semibold 
        ${
            report.condition === "อนุมัติแล้ว" ? "text-green-600" :
            report.condition === "ไม่อนุมัติ" ? "text-red-600" :
            "text-yellow-500"
        }
    `}
>
    {report.condition || "รออนุมัติ"}
</td>

                            <td className="border px-4 py-2 text-center">
                                <button
                                    onClick={() => updateCondition(report.id, 'อนุมัติแล้ว')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg mr-2"
                                >
                                    อนุมัติ
                                </button>
                                <button
                                    onClick={() => updateCondition(report.id, 'ไม่อนุมัติ')}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    ไม่อนุมัติ
                                </button>
                            </td>
</tr>
            ))}

    <tr className="bg-gray-300">
        <td colSpan="8" className="border px-4 py-2 font-bold text-right">จำนวนเงินทั้งสิ้น:</td>
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
    <th className="py-3 px-4 border-b border-gray-200">ชื่อ-นามสกุล</th> {/* เพิ่มคอลัมน์นี้ */}
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
        <th className="py-3 px-4 border-b border-gray-200">สถานะ</th>
        <th className="py-3 px-4 border-b border-gray-200">ดำเนินการ</th>
            </tr>
        </thead>
        <tbody>
            {reports.map((report) => (
                <tr key={report.id}>
		    <td className="border px-4 py-2 text-center">{calculateFiscalYear(report.submitTime)}</td>
                    <td className="border px-4 py-2 text-center">{report.id}</td>
      <td className="border px-4 py-2 text-center">{`${report.first_name} ${report.last_name}`}</td> {/* เพิ่มข้อมูลชื่อ-นามสกุล */}
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
<td 
    className={`border px-4 py-2 text-center font-semibold 
        ${
            report.condition === "อนุมัติแล้ว" ? "text-green-600" :
            report.condition === "ไม่อนุมัติ" ? "text-red-600" :
            "text-yellow-500"
        }
    `}
>
    {report.condition || "รออนุมัติ"}
</td>

                            <td className="border px-4 py-2 text-center">
                                <button
                                    onClick={() => updateCondition(report.id, 'อนุมัติแล้ว')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg mr-2"
                                >
                                    อนุมัติ
                                </button>
                                <button
                                    onClick={() => updateCondition(report.id, 'ไม่อนุมัติ')}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-full transition duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    ไม่อนุมัติ
                                </button>
                            </td>

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
    );
}
