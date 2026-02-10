// views/Form/FormView.js
import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import th from 'date-fns/locale/th';
import { handleFormSubmit } from '../../controllers/FormController'; 

registerLocale('th', th);

const FormView = ({ user, courses }) => {
  const [formData, setFormData] = useState({
    trainingOrg: '',
    courseCode: '',
    trainingMethod: 'E-learning',
    onsiteLocation: '',
    hybridLocation: '',
    startDate: null,
    endDate: null,
    costOption: 'noCost',
    regFeeAmount: '',
    accommodationFeeAmount: '',
    transportationFeeAmount: '',
    allowanceFeeAmount: '',
    totalCost: 0,
    approvalDocumentFile: null,
    certificateFile: null,
    trainingCourseFile: null,
    confirmCheckbox: false,
    submitTime: null,
  });

  const handleInputChange = (e) => {
    const { name, type, files, value, checked } = e.target;
    const val = type === 'file' ? files[0] : (type === 'checkbox' ? checked : value);
    setFormData(prevState => ({ ...prevState, [name]: val }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await handleFormSubmit(formData, user, courses);
    console.log(result.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form elements go here */}
    </form>
  );
};

export default FormView;
