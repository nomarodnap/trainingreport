"use client";
import './styles.css';
import Header from '../components/Header';
import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  // กำหนดปีงบประมาณตามเดือน
  const now = new Date();
  const currentYear = now.getMonth() >= 9
    ? now.getFullYear() + 544
    : now.getFullYear() + 543;
  const [fiscalYear, setFiscalYear] = useState(currentYear);
  const [groupBy, setGroupBy] = useState("type"); // ค่าเริ่มต้น
  const [stats, setStats] = useState(null);
  const [username, setUsername] = useState('');
  const [userDetails, setUserDetails] = useState(null);

  const fetchData = async (year, group, department, group_name) => {
    try {
      let url = `/api/dashboard/summary?fiscalYear=${year}&groupBy=${group}`;
      if (department) {
        url += `&department=${encodeURIComponent(department)}`;
      }
      if (group_name) {
        url += `&group_name=${encodeURIComponent(group_name)}`;
      }
      const res = await axios.get(url);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) throw new Error('Unauthorized');

        const user = await res.json();
        setUsername(user.username);

        if (user.status !== 'admin' && user.status !== 'superadmin' && user.status !== 'approver' && user.status !== 'approver2' && user.status !== 'checker') {
          alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
          router.push('/');
        }
      } catch (err) {
        // ถ้าไม่มี session หรือเกิด error ให้ redirect ออก
        alert('กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้');
        router.push('/signin');
      }
    };

    checkStatus();
  }, [router]);

  useEffect(() => {
    if (username) {
      fetchUserDetails();
    }
  }, [username]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`/api/users?username=${username}`);
      setUserDetails(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    // ถ้าเป็น approver และ groupBy เป็น department ให้รีเซ็ตเป็น type
    if ((userDetails?.status === 'approver' || userDetails?.status === 'approver2') && groupBy === 'department') {
      setGroupBy('type');
      return;
    }
  }, [userDetails, groupBy]);

  useEffect(() => {
    // ถ้ายังไม่มี userDetails ให้รอ (เพื่อให้แน่ใจว่าเรารู้สถานะผู้ใช้ก่อน)
    if (!userDetails) {
      return;
    }

    // ถ้าเป็น approver และยังไม่มี department ให้รอ
    if (userDetails?.status === 'approver' && !userDetails?.department) {
      return;
    }

    // ถ้าเป็น approver2 และยังไม่มี group_name ให้รอ
    if (userDetails?.status === 'approver2' && !userDetails?.group_name) {
      return;
    }

    const department = userDetails?.status === 'approver' ? userDetails?.department : null;
    const group_name = userDetails?.status === 'approver2' ? userDetails?.group_name : null;
    fetchData(fiscalYear, groupBy, department, group_name);
  }, [fiscalYear, groupBy, userDetails]);

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  const COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ef4444", "#14b8a6", "#8b5cf6", "#06b6d4"];

  // Logic to group small data slices in Charts (Pie and Bar)
  const chartData = (() => {
    if (!stats?.byType) return [];
    const data = [...stats.byType]; // clone
    const totalUsers = data.reduce((acc, item) => acc + (item.total_users || 0), 0);
    if (totalUsers === 0) return data;

    const smallItems = data.filter(item => (item.total_users / totalUsers) < 0.01);

    // หากมีข้อมูลที่น้อยกว่า 1% มากกว่า 10 ข้อมูล ให้รวมเป็น "อื่นๆ"
    if (smallItems.length > 10) {
      const largeItems = data.filter(item => (item.total_users / totalUsers) >= 0.01);
      const othersUsersCount = smallItems.reduce((acc, item) => acc + (item.total_users || 0), 0);
      const othersReportsCount = smallItems.reduce((acc, item) => acc + (item.total_reports || 0), 0);

      return [
        ...largeItems,
        { groupField: "อื่นๆ", total_users: othersUsersCount, total_reports: othersReportsCount }
      ];
    }

    return data;
  })();

  return (
    <>
      <Header />
      <br />
      <br />
      <br />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        {/* Header Section with Glassmorphism */}
        <div className="mb-8 backdrop-blur-sm bg-white/70 rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row justify-between gap-6 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                📊 Training Dashboard
              </h1>
              <p className="text-slate-600 text-lg">ระบบติดตามและวิเคราะห์รายงานการฝึกอบรม</p>
            </div>

            <div className="flex flex-wrap gap-4">
              {/* เลือกปีงบ */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">ปีงบประมาณ</label>
                <select
                  className="appearance-none bg-white/80 backdrop-blur-sm border-2 border-blue-200 shadow-lg p-3 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 min-w-[120px]"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                >
                  {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* เลือก groupBy */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">แยกตาม</label>
                <select
                  className="appearance-none bg-white/80 backdrop-blur-sm border-2 border-green-200 shadow-lg p-3 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all duration-300 min-w-[140px]"
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                >
                  <option value="type">ประเภท (type)</option>
                  <option value="position">ตำแหน่ง (position)</option>
                  <option value="level">ระดับ (level)</option>
                  {userDetails?.status !== 'approver' && userDetails?.status !== 'approver2' && (
                    <option value="department">หน่วยงาน (department)</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards with Hover Effects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="group hover:scale-105 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-blue-50 to-blue-100 border-0">
            <CardContent className="p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-300 rounded-full translate-y-8 -translate-x-8 opacity-20"></div>
              <h2 className="text-lg font-semibold text-slate-700 mb-3">👥 จำนวนผู้ส่ง</h2>
              <p className="text-5xl font-extrabold text-blue-600 group-hover:text-blue-700 transition-colors duration-300">{stats.total_users}</p>
              <p className="text-sm text-slate-500 mt-2">คน</p>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-green-50 to-green-100 border-0">
            <CardContent className="p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-300 rounded-full translate-y-8 -translate-x-8 opacity-20"></div>
              <h2 className="text-lg font-semibold text-slate-700 mb-3">📋 จำนวนรายงาน</h2>
              <p className="text-5xl font-extrabold text-green-600 group-hover:text-green-700 transition-colors duration-300">{stats.total_reports}</p>
              <p className="text-sm text-slate-500 mt-2">รายงาน</p>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-purple-50 to-purple-100 border-0">
            <CardContent className="p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-300 rounded-full translate-y-8 -translate-x-8 opacity-20"></div>
              <h2 className="text-lg font-semibold text-slate-700 mb-3">📊 ค่าเฉลี่ย/คน</h2>
              <p className="text-5xl font-extrabold text-purple-600 group-hover:text-purple-700 transition-colors duration-300">{stats.avg_reports_per_user}</p>
              <p className="text-sm text-slate-500 mt-2">รายงาน/คน</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart with Enhanced Styling */}
          <Card className="hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">📌</span>
                สัดส่วน {groupBy}
              </h2>
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="total_users"
                    nameKey="groupField"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={40}
                    label={({ groupField, percent }) => `${groupField} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Enhanced Bar Chart */}
          <Card className="hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">📈</span>
                รายงานตาม {groupBy}
              </h2>
              <ResponsiveContainer width="100%" height={500}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="groupField"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="total_users"
                    fill="#22c55e"
                    name="จำนวนผู้ส่ง"
                    stackId="a"
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar
                    dataKey="total_reports"
                    fill="#3b82f6"
                    name="จำนวนรายงาน"
                    stackId="a"
                    radius={[4, 4, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Table */}
        <Card className="hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">👥</span>
              รายละเอียดแยกตาม {groupBy}
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-inner">
              <table className="w-full text-sm text-slate-700">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 font-semibold">
                  <tr>
                    <th className="px-6 py-4 text-left rounded-tl-xl">{groupBy}</th>
                    <th className="px-6 py-4 text-center">จำนวนคน</th>
                    <th className="px-6 py-4 text-center rounded-tr-xl">จำนวนรายงาน</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byType.map((row, idx) => (
                    <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                      <td className="px-6 py-4 font-medium">{row.groupField || "ไม่ระบุ"}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {row.total_users}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {row.total_reports}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Top 10 Table */}
        <Card className="hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🏆</span>
              10 อันดับผู้ส่งรายงานมากที่สุด
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-inner">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-yellow-100 to-orange-100">
                  <tr>
                    <th className="p-4 text-center rounded-tl-xl">อันดับ</th>
                    <th className="p-4 text-left">ข้อมูล</th>
                    <th className="p-4 text-center rounded-tr-xl">จำนวนรายงาน</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.rankingTop10.map((row, idx) => (
                    <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                      <td className="p-4 text-center">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${idx === 0 ? 'bg-yellow-500' :
                          idx === 1 ? 'bg-gray-400' :
                            idx === 2 ? 'bg-orange-500' : 'bg-slate-500'
                          }`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="p-4 font-medium">{row.full_name}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {row.total_reports}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
