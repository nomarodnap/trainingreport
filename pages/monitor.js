"use client";
import './styles.css';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faServer, 
  faDatabase, 
  faMicrochip, 
  faUsers, 
  faFileAlt, 
  faRotate, 
  faShieldAlt, 
  faClock, 
  faSignal, 
  faArrowLeft, 
  faCheckCircle, 
  faExclamationTriangle,
  faSearch,
  faFilter,
  faLayerGroup,
  faMemory,
  faNetworkWired,
  faBolt,
  faChartPie,
  faHardDrive,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function MonitorPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(10); // in seconds (0 = off)
  const [countdown, setCountdown] = useState(10);
  const [userSearch, setUserSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, database, diagnostics

  const countdownTimerRef = useRef(null);

  // Format bytes helper
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Format seconds to human readable uptime
  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return '-';
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days} วัน`);
    if (hours > 0) parts.push(`${hours} ชม.`);
    if (minutes > 0) parts.push(`${minutes} นาที`);
    if (parts.length === 0 || secs > 0) parts.push(`${secs} วินาที`);

    return parts.join(' ');
  };

  // Format relative time (e.g. 5 นาทีที่แล้ว)
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffSecs = Math.floor((now - date) / 1000);

    if (diffSecs < 60) return `${Math.max(1, diffSecs)} วินาทีที่แล้ว`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} วันที่แล้ว`;
  };

  // Format Thai datetime
  const formatThaiDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return d.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Fetch monitor stats
  const fetchMonitorStats = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await axios.get('/api/monitor/stats');
      setData(res.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching monitor data:', error);
      if (error.response?.status === 403) {
        alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ superadmin เท่านั้น)');
        router.push('/main');
      }
    } finally {
      setIsLoading(false);
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  };

  // 1. Auth check
  useEffect(() => {
    const verifySuperadmin = async () => {
      try {
        const res = await axios.get('/api/auth/session', { withCredentials: true });
        const user = res.data;
        if (!user || user.status !== 'superadmin') {
          alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ superadmin เท่านั้น)');
          router.push('/main');
          return;
        }
        setCurrentUser(user);
        setIsAuthorized(true);
        fetchMonitorStats();
      } catch (err) {
        alert('กรุณาเข้าสู่ระบบก่อนใช้งาน');
        router.push('/signin');
      }
    };

    verifySuperadmin();
  }, [router]);

  // 2. Auto-refresh handler
  useEffect(() => {
    if (!isAuthorized || autoRefreshInterval <= 0) {
      setCountdown(0);
      return;
    }

    setCountdown(autoRefreshInterval);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchMonitorStats();
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isAuthorized, autoRefreshInterval]);

  // Filtered recent users
  const filteredUsers = useMemo(() => {
    if (!data?.users?.recentLogins) return [];
    return data.users.recentLogins.filter((u) => {
      const matchesRole =
        selectedRoleFilter === 'ALL' ||
        (u.status || '').toLowerCase() === selectedRoleFilter.toLowerCase();
      
      const searchTarget = `${u.username || ''} ${u.first_name || ''} ${u.last_name || ''} ${u.department || ''} ${u.group_name || ''}`.toLowerCase();
      const matchesSearch = searchTarget.includes(userSearch.toLowerCase());

      return matchesRole && matchesSearch;
    });
  }, [data, selectedRoleFilter, userSearch]);

  // Color mappings for roles
  const ROLE_COLORS = {
    superadmin: '#ef4444', // Red
    admin: '#f59e0b',     // Amber
    approver: '#8b5cf6',  // Purple
    approver2: '#ec4899', // Pink
    checker: '#3b82f6',   // Blue
    user: '#10b981',      // Emerald
  };

  // Pie chart data for roles
  const roleChartData = useMemo(() => {
    if (!data?.users?.roleBreakdown) return [];
    return data.users.roleBreakdown.map((r) => ({
      name: r.role.toUpperCase(),
      value: Number(r.count),
      color: ROLE_COLORS[r.role.toLowerCase()] || '#6b7280',
    }));
  }, [data]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600 text-xl animate-pulse" />
          </div>
        </div>
        <p className="text-lg font-semibold text-slate-700">กำลังตรวจสอบสิทธิ์ Superadmin และโหลดข้อมูล...</p>
      </div>
    );
  }

  const system = data?.system || {};
  const db = data?.db || {};
  const users = data?.users || {};
  const reports = data?.reports || {};

  const memoryPercent = system.memoryUsagePercent || 0;
  const memoryColorClass =
    memoryPercent > 85 ? 'bg-red-500' : memoryPercent > 65 ? 'bg-amber-500' : 'bg-blue-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800 flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 sm:px-6 pt-28 pb-16">
        {/* Top Control Bar with Glassmorphism */}
        <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-5 sm:p-6 mb-8 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/main')}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-semibold border border-slate-200 shadow-sm hover:shadow"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>กลับสู่หน้าหลัก</span>
            </button>

            <div className="border-l border-slate-200 pl-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <FontAwesomeIcon icon={faServer} className="text-xl" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ระบบมอนิเตอร์สถานะระบบ (Superadmin)
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-medium text-emerald-700">เซิร์ฟเวอร์เปิดทำงานปกติ</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-slate-600">โฮสต์: {system.hostname || 'localhost'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Auto Refresh & Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Auto-refresh interval selector */}
            <div className="flex items-center bg-slate-100/90 rounded-xl p-1 border border-slate-200/80 text-xs sm:text-sm">
              <span className="px-2 text-slate-600 font-semibold">รีเฟรช:</span>
              {[
                { label: 'ปิด', val: 0 },
                { label: '5s', val: 5 },
                { label: '10s', val: 10 },
                { label: '30s', val: 30 },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setAutoRefreshInterval(item.val)}
                  className={`px-3 py-1 rounded-lg transition-all font-bold ${
                    autoRefreshInterval === item.val
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Countdown Badge */}
            {autoRefreshInterval > 0 && (
              <div className="px-3 py-1.5 bg-blue-100/80 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <FontAwesomeIcon icon={faClock} />
                <span>รีเฟรชใน {countdown}s</span>
              </div>
            )}

            {/* Manual Refresh Button */}
            <button
              onClick={() => fetchMonitorStats(true)}
              disabled={isRefreshing}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faRotate} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'กำลังโหลด...' : 'รีเฟรช'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/70 backdrop-blur-sm p-1.5 rounded-2xl border border-blue-100/80 shadow-md mb-8 flex space-x-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'ภาพรวมระบบ & กราฟ', icon: faMicrochip },
            { id: 'users', label: 'ผู้ใช้งานล่าสุด & บทบาท', icon: faUsers },
            { id: 'database', label: 'ฐานข้อมูล & ขนาดตาราง', icon: faDatabase },
            { id: 'diagnostics', label: 'ข้อมูลเครื่องเซิร์ฟเวอร์', icon: faNetworkWired },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-4 sm:px-6 font-bold text-sm sm:text-base rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white/60'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & KPIS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Server Uptime & CPU */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/80 border border-blue-200/70 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-300/30 rounded-full blur-2xl group-hover:bg-blue-300/40 transition-all"></div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">เซิร์ฟเวอร์ & โพรเซส</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <FontAwesomeIcon icon={faServer} />
                  </div>
                </div>
                <div className="text-2xl font-black text-blue-700 mb-2">
                  {formatUptime(system.processUptimeSeconds)}
                </div>
                <div className="text-xs text-slate-600 space-y-1 bg-white/60 rounded-xl p-2.5 border border-blue-200/40">
                  <div className="flex justify-between">
                    <span className="font-medium">Node.js:</span>
                    <span className="font-mono text-blue-700 font-bold">{system.nodeVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">CPU:</span>
                    <span className="font-semibold text-slate-800">{system.cpuCount} Cores ({system.arch})</span>
                  </div>
                </div>
              </div>

              {/* Memory (RAM) Usage */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/80 border border-indigo-200/70 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-300/30 rounded-full blur-2xl group-hover:bg-indigo-300/40 transition-all"></div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">การใช้หน่วยความจำ (RAM)</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <FontAwesomeIcon icon={faMemory} />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-2xl font-black text-indigo-700">
                    {formatBytes(system.usedMemoryBytes)}
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-200 text-indigo-800">
                    {memoryPercent}%
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all duration-500 ${memoryColorClass}`}
                    style={{ width: `${memoryPercent}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-600 flex justify-between font-medium">
                  <span>ทั้งหมด: {formatBytes(system.totalMemoryBytes)}</span>
                  <span>Node Heap: {formatBytes(system.processMemory?.heapUsed)}</span>
                </div>
              </div>

              {/* Database Status & Latency */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/80 border border-purple-200/70 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-300/30 rounded-full blur-2xl group-hover:bg-purple-300/40 transition-all"></div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-purple-950 uppercase tracking-wider">ฐานข้อมูล MySQL</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                    <FontAwesomeIcon icon={faDatabase} />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-2xl font-black text-purple-700">
                    {db.pingMs !== undefined ? `${db.pingMs} ms` : '-'}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    🟢 Online
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 bg-white/60 rounded-xl p-2.5 border border-purple-200/40">
                  <div className="flex justify-between">
                    <span className="font-medium">Host:</span>
                    <span className="font-mono text-purple-800 font-bold truncate max-w-[130px]">{db.host}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Database:</span>
                    <span className="font-bold text-slate-800">{db.name}</span>
                  </div>
                </div>
              </div>

              {/* Users Activity */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/80 border border-emerald-200/70 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-300/30 rounded-full blur-2xl group-hover:bg-emerald-300/40 transition-all"></div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">ผู้ใช้งานในระบบ</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-700 mb-2">
                  {users.totalUsers?.toLocaleString() || '0'} <span className="text-sm font-semibold text-slate-500">บัญชี</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 bg-white/60 rounded-xl p-2.5 border border-emerald-200/40 font-medium">
                  <div className="flex justify-between">
                    <span>เข้าใช้วันนี้:</span>
                    <span className="font-bold text-emerald-700">{users.activeToday} คน</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ในรอบ 1 ชั่วโมง:</span>
                    <span className="font-bold text-blue-700">{users.activePastHour} คน</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-blue-100 shadow-md text-center">
              <div className="p-3 border-r border-slate-200 last:border-none">
                <p className="text-xs font-semibold text-slate-500 mb-1">รายงาน กบค. ทั้งหมด</p>
                <p className="text-2xl font-extrabold text-blue-600">{reports.totalReports?.toLocaleString() || '0'}</p>
              </div>
              <div className="p-3 border-r border-slate-200 last:border-none">
                <p className="text-xs font-semibold text-slate-500 mb-1">รายงานที่ส่งวันนี้</p>
                <p className="text-2xl font-extrabold text-emerald-600">{reports.reportsToday?.toLocaleString() || '0'}</p>
              </div>
              <div className="p-3 border-r border-slate-200 last:border-none">
                <p className="text-xs font-semibold text-slate-500 mb-1">คำร้องขอความช่วยเหลือ (Support)</p>
                <p className="text-2xl font-extrabold text-amber-600">{data?.support?.totalRequests || '0'}</p>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">คำร้องรอดำเนินการ</p>
                <p className="text-2xl font-extrabold text-red-500">{data?.support?.pendingRequests || '0'}</p>
              </div>
            </div>

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Submission Trend Area Chart (2 cols) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-blue-100 p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                        <FontAwesomeIcon icon={faSignal} />
                      </span>
                      สถิติการส่งรายงานย้อนหลัง 14 วัน
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">แนวโน้มจำนวนรายงานที่ถูกบันทึกเข้ามาในระบบ</p>
                  </div>
                </div>

                <div className="h-[280px] w-full">
                  {reports.dailyTrend && reports.dailyTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={reports.dailyTrend}>
                        <defs>
                          <linearGradient id="trendGradientLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderColor: '#cbd5e1',
                            borderRadius: '0.75rem',
                            color: '#1e293b',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          name="จำนวนรายงาน"
                          stroke="#2563eb"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#trendGradientLight)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                      ไม่มีข้อมูลการส่งรายงานย้อนหลัง 14 วัน
                    </div>
                  )}
                </div>
              </div>

              {/* Roles Breakdown Donut Chart (1 col) */}
              <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                    <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
                      <FontAwesomeIcon icon={faShieldAlt} />
                    </span>
                    สัดส่วนผู้ใช้ตามบทบาท
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">การกระจายตัวของสถานะผู้ใช้งานในระบบ</p>
                </div>

                <div className="h-[220px] w-full relative">
                  {roleChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={roleChartData}
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {roleChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderColor: '#cbd5e1',
                            borderRadius: '0.75rem',
                            color: '#1e293b',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                      ไม่มีข้อมูลบทบาทผู้ใช้
                    </div>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-slate-800">{users.totalUsers}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">รวมผู้ใช้</span>
                  </div>
                </div>

                {/* Legend badges */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {roleChartData.map((r) => (
                    <div key={r.name} className="flex items-center text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                      <span
                        className="w-2.5 h-2.5 rounded-full mr-2 shrink-0"
                        style={{ backgroundColor: r.color }}
                      ></span>
                      <span className="truncate font-semibold">{r.name}:</span>
                      <span className="ml-auto font-black text-slate-900">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS & RECENT LOGINS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-xl">
              {/* Header & Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-100 text-amber-600">
                      <FontAwesomeIcon icon={faUsers} />
                    </span>
                    ประวัติการเข้าสู่ระบบล่าสุด (Live Logins)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    แสดงรายชื่อผู้ใช้งานที่มีการล็อกอินเข้าระบบล่าสุดตามลำดับเวลา
                  </p>
                </div>

                {/* Search & Role Filter */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[220px]">
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อ, รหัส, สังกัด..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-slate-400 text-xs" />
                  </div>

                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="ALL">ทุกบทบาท (All Roles)</option>
                    <option value="superadmin">Superadmin</option>
                    <option value="admin">Admin</option>
                    <option value="approver">Approver 1</option>
                    <option value="approver2">Approver 2</option>
                    <option value="checker">Checker</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">ผู้ใช้งาน</th>
                      <th className="py-3.5 px-4">เลขประจำตัวประชาชน (Username)</th>
                      <th className="py-3.5 px-4">สังกัด / กลุ่มฝ่าย</th>
                      <th className="py-3.5 px-4">ตำแหน่ง</th>
                      <th className="py-3.5 px-4">บทบาท</th>
                      <th className="py-3.5 px-4">เวลาเข้าสู่ระบบล่าสุด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u, idx) => {
                        const roleColor = ROLE_COLORS[(u.status || '').toLowerCase()] || '#6b7280';
                        return (
                          <tr key={u.id || u.username} className={idx % 2 === 0 ? 'bg-white hover:bg-blue-50/60' : 'bg-slate-50/70 hover:bg-blue-50/60 transition-colors'}>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                                  {(u.first_name || u.username || 'U')[0]}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800">
                                    {u.first_name ? `${u.first_name} ${u.last_name || ''}` : 'ไม่ได้ระบุชื่อ'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                              {u.username}
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-slate-800 font-semibold">{u.department || '-'}</div>
                              <div className="text-slate-500 text-[11px]">{u.group_name || ''}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-medium">
                              {u.position || '-'} {u.level || ''}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-sm uppercase tracking-wide inline-block"
                                style={{ backgroundColor: roleColor }}
                              >
                                {u.status || 'user'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-800">
                                {formatThaiDateTime(u.last_login)}
                              </div>
                              <div className="text-[11px] text-emerald-600 font-bold">
                                {formatRelativeTime(u.last_login)}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          ไม่พบข้อมูลผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATABASE HEALTH & TABLES */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-purple-100 text-purple-600">
                      <FontAwesomeIcon icon={faDatabase} />
                    </span>
                    โครงสร้างและขนาดตารางในฐานข้อมูล (MySQL Schema)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    ตรวจสอบขนาดพื้นที่จัดเก็บ (Data & Index) และจำนวนแถวของแต่ละ Table
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold">
                    ฐานข้อมูล: {db.name}
                  </span>
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                    Ping: {db.pingMs} ms
                  </span>
                </div>
              </div>

              {/* Table stats */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                  <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">ชื่อตาราง (Table Name)</th>
                      <th className="py-3.5 px-4 text-right">จำนวนแถวโดยประมาณ</th>
                      <th className="py-3.5 px-4 text-right">ขนาดข้อมูล (Data Size)</th>
                      <th className="py-3.5 px-4 text-right">ขนาดดัชนี (Index Size)</th>
                      <th className="py-3.5 px-4 text-right">ขนาดรวมทั้งหมด</th>
                      <th className="py-3.5 px-4">อัปเดตล่าสุด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {db.tables && db.tables.length > 0 ? (
                      db.tables.map((t, idx) => (
                        <tr key={t.name} className={idx % 2 === 0 ? 'bg-white hover:bg-purple-50/60' : 'bg-slate-50/70 hover:bg-purple-50/60 transition-colors'}>
                          <td className="py-3 px-4 font-mono font-bold text-slate-800 flex items-center gap-2">
                            <FontAwesomeIcon icon={faLayerGroup} className="text-purple-500 text-xs" />
                            <span>{t.name}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                            {t.rows?.toLocaleString() || '0'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-600 font-medium">
                            {t.dataSizeKB > 1024 ? `${(t.dataSizeKB / 1024).toFixed(2)} MB` : `${t.dataSizeKB} KB`}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-600 font-medium">
                            {t.indexSizeKB > 1024 ? `${(t.indexSizeKB / 1024).toFixed(2)} MB` : `${t.indexSizeKB} KB`}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-extrabold text-purple-700">
                            {t.totalSizeKB > 1024 ? `${(t.totalSizeKB / 1024).toFixed(2)} MB` : `${t.totalSizeKB} KB`}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-xs font-medium">
                            {formatThaiDateTime(t.updateTime)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          ไม่พบข้อมูลตารางในฐานข้อมูล
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM DIAGNOSTICS */}
        {activeTab === 'diagnostics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Host Details */}
            <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-100 text-blue-600">
                  <FontAwesomeIcon icon={faServer} />
                </span>
                ข้อมูลเครื่องเซิร์ฟเวอร์ & สภาพแวดล้อม
              </h3>
              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Hostname:</span>
                  <span className="font-mono font-bold text-slate-800">{system.hostname}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Platform:</span>
                  <span className="font-bold text-slate-800">{system.platform} ({system.osType})</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500 font-medium">OS Release:</span>
                  <span className="font-mono text-slate-700 font-semibold">{system.osRelease}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Architecture:</span>
                  <span className="font-bold text-slate-800">{system.arch}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500 font-medium">CPU Model:</span>
                  <span className="font-semibold text-slate-700 text-right max-w-[240px] truncate">{system.cpuModel}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500 font-medium">CPU Cores:</span>
                  <span className="font-extrabold text-emerald-600">{system.cpuCount} Cores</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500 font-medium">System Uptime:</span>
                  <span className="font-bold text-blue-700">{formatUptime(system.systemUptimeSeconds)}</span>
                </div>
              </div>
            </div>

            {/* Process & Node Memory */}
            <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                  <FontAwesomeIcon icon={faMicrochip} />
                </span>
                สถานะโพรเซส Node.js
              </h3>
              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Node.js Version:</span>
                  <span className="font-mono font-extrabold text-emerald-600">{system.nodeVersion}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Process Uptime:</span>
                  <span className="font-bold text-blue-700">{formatUptime(system.processUptimeSeconds)}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Resident Set Size (RSS):</span>
                  <span className="font-mono font-bold text-slate-800">{formatBytes(system.processMemory?.rss)}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500 font-medium">V8 Heap Total:</span>
                  <span className="font-mono font-bold text-indigo-600">{formatBytes(system.processMemory?.heapTotal)}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500 font-medium">V8 Heap Used:</span>
                  <span className="font-mono font-extrabold text-blue-600">{formatBytes(system.processMemory?.heapUsed)}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500 font-medium">External Memory:</span>
                  <span className="font-mono text-slate-600 font-medium">{formatBytes(system.processMemory?.external)}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Server Timestamp (UTC):</span>
                  <span className="font-mono text-slate-400 text-xs">{system.serverTime}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
