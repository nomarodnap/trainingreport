// components/CourseList.js
import React from 'react';

const CourseList = ({ courses }) => (
  <div>
    <h2>Course List</h2>
    <ul>
      {courses.map((course) => (
        <li key={course.code_cou}>
          {course.code_cou} - {course.name_cou} ({course.category})
        </li>
      ))}
    </ul>
  </div>
);

export default CourseList;
