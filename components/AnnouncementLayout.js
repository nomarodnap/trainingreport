'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function AnnouncementLayout({ children }) {
  const [show, setShow] = useState(true);

  return (
    <div className="relative min-h-screen">
      {children}

      {show && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShow(false)}
        >
          <div
            className="relative w-[90vw] max-w-[520px] sm:max-w-[600px] md:max-w-[680px]"
          >
            {/* ปุ่มปิด */}
            <button
              onClick={() => setShow(false)}
              className="absolute -top-4 -right-4 bg-black/70 hover:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center z-10 shadow-lg"
            >
              ✕
            </button>

            {/* กล่องรูป */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <Image
                src="/maintenance.jpg"
                alt="ประกาศแจ้งเหตุขัดข้องระบบ กบค.1"
                width={800}
                height={1200}
                priority
                className="w-full h-auto object-contain"
              />
            </div>

            {/* ปุ่มเข้าใจแล้ว */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShow(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-full shadow"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
