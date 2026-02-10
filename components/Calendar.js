'use client';

import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import { Thai } from 'flatpickr/dist/l10n/th.js';
import 'flatpickr/dist/themes/material_blue.css';

export default function ThaiDatePicker({ value, onChange }) {
  const inputRef = useRef(null);
  const fpRef = useRef(null);

  useEffect(() => {
    const updateCalendarBE = (inst) => {
      if (!inst || !inst.calendarContainer) return;
      const yearEl = inst.currentYearElement;
      if (yearEl) {
        yearEl.value = String(inst.currentYear + 543);
        yearEl.setAttribute('data-be', '1');
        yearEl.setAttribute('readonly', 'readonly');
      }
    };

    const instance = flatpickr(inputRef.current, {
      locale: Thai,
      // เก็บค่าใช้งานภายในเป็น ค.ศ. เพื่อความถูกต้องของการประมวลผล/บันทึก
      dateFormat: 'd/m/Y',
      altInput: true,
      altFormat: 'd/m/Y',
      defaultDate: value || null,
  minDate: '1-10-2024',

      onReady: (selectedDates, _dateStr, inst) => {
        // เมื่อพร้อม ให้แสดงผลปี พ.ศ. ในช่อง altInput
        if (inst && inst.altInput && selectedDates && selectedDates[0]) {
          const d = selectedDates[0];
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyyBE = d.getFullYear() + 543;
          inst.altInput.value = `${dd}/${mm}/${yyyyBE}`;
        }
        updateCalendarBE(inst);
      },
      onChange: (selectedDates, dateStr, inst) => {
        // แจ้งค่ากลับเป็น ค.ศ. (ตาม dateFormat) ให้ฝั่งฟอร์มนำไป parse
        onChange?.(dateStr);
        // อัปเดตการแสดงผลเป็น พ.ศ. ในช่อง altInput
        if (inst && inst.altInput && selectedDates && selectedDates[0]) {
          const d = selectedDates[0];
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyyBE = d.getFullYear() + 543;
          inst.altInput.value = `${dd}/${mm}/${yyyyBE}`;
        }
        updateCalendarBE(inst);
      },
      onValueUpdate: (selectedDates, _dateStr, inst) => {
        // ให้การอัปเดตค่าใด ๆ แสดงเป็น พ.ศ. เสมอ
        if (inst && inst.altInput && selectedDates && selectedDates[0]) {
          const d = selectedDates[0];
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyyBE = d.getFullYear() + 543;
          inst.altInput.value = `${dd}/${mm}/${yyyyBE}`;
        }
        updateCalendarBE(inst);
      },
      onOpen: (_selectedDates, _dateStr, inst) => {
        updateCalendarBE(inst);
      },
      onMonthChange: (_selectedDates, _dateStr, inst) => {
        updateCalendarBE(inst);
      },
      onYearChange: (_selectedDates, _dateStr, inst) => {
        updateCalendarBE(inst);
      },
      allowInput: false,
    });

    fpRef.current = instance;

    return () => {
      if (fpRef.current && typeof fpRef.current.destroy === 'function') {
        fpRef.current.destroy();
      }
      fpRef.current = null;
    };
  }, [value, onChange]);

  return (
    <input
      ref={inputRef}
      type="text"
      id="startDate"
      className="peer block w-full rounded-lg border border-gray-300 bg-transparent px-3 pb-3 pt-4 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-transparent"
      placeholder=" " // สำหรับ label ลอย
    />
  );
}
