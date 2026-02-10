// pages/demo-tour.js
import React, { useState } from 'react'
import { TourProvider, useTour } from '@reactour/tour'

const steps = [
  {
    selector: '.step-one',
    content: 'นี่คือปุ่มแรก กดเพื่อทำอะไรบางอย่าง',
  },
  {
    selector: '.step-two',
    content: 'และนี่คือปุ่มถัดไป',
  },
]

export default function DemoTourPage() {
  return (
    <TourProvider steps={steps}>
      <TourContent />
    </TourProvider>
  )
}

function TourContent() {
  const { setIsOpen } = useTour()
  const [count, setCount] = useState(0)

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">หน้า Demo Reactour</h1>

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded step-one"
        onClick={() => setCount(count + 1)}
      >
        ปุ่มแรก (นับ: {count})
      </button>

      <button
        className="ml-4 px-4 py-2 bg-green-600 text-white rounded step-two"
        onClick={() => alert('ทำบางอย่าง')}
      >
        ปุ่มสอง
      </button>

      <div className="mt-8">
        <button
          className="px-6 py-2 bg-purple-700 text-white rounded"
          onClick={() => setIsOpen(true)}
        >
          ▶️ เริ่มทัวร์
        </button>
      </div>
    </div>
  )
}
