// components/TrainingReportList.js
import './styles.css';
import React from 'react';

const TrainingReportList = ({ reports, onDelete }) => {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-blue-500 text-white">
          <th className="py-3 px-4 border border-blue-500">Username</th>
          <th className="py-3 px-4 border border-blue-500">Course Code</th>
          <th className="py-3 px-4 border border-blue-500">Training Org</th>
          <th className="py-3 px-4 border border-blue-500">Category</th>
          <th className="py-3 px-4 border border-blue-500">Method</th>
          <th className="py-3 px-4 border border-blue-500">Start Date</th>
          <th className="py-3 px-4 border border-blue-500">End Date</th>
          <th className="py-3 px-4 border border-blue-500">Total Cost</th>
          <th className="py-3 px-4 border border-blue-500">Actions</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => (
          <tr key={report.id} className="odd:bg-white even:bg-gray-50 hover:bg-blue-100">
            <td className="py-2 px-4 border">{report.username}</td>
            <td className="py-2 px-4 border">{report.courseCode}</td>
            <td className="py-2 px-4 border">{report.trainingOrg}</td>
            <td className="py-2 px-4 border">{report.category}</td>
            <td className="py-2 px-4 border">{report.trainingMethod}</td>
            <td className="py-2 px-4 border">{report.startDate}</td>
            <td className="py-2 px-4 border">{report.endDate}</td>
            <td className="py-2 px-4 border text-right">{report.totalCost}</td>
            <td className="py-2 px-4 border text-center">
              <button
                onClick={() => onDelete(report.id)}
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TrainingReportList;
