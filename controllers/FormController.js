// controllers/FormController.js
export const handleFormSubmit = async (formData, user, courses) => {
  const currentTime = new Date();
  const selectedCourse = courses.find(course => course.code_cou === formData.courseCode);
  const category = selectedCourse ? selectedCourse.category : '';

  const data = {
    user: JSON.stringify(user),
    trainingOrg: formData.trainingOrg,
    courseCode: selectedCourse ? `${selectedCourse.code_cou} - ${selectedCourse.name_cou}` : formData.courseCode,
    category: category,
    trainingMethod: formData.trainingMethod,
    onsiteLocation: formData.onsiteLocation,
    hybridLocation: formData.hybridLocation,
    startDate: formData.startDate,
    endDate: formData.endDate,
    totalCost: formData.totalCost,
    submitTime: currentTime,
  };

  const response = await fetch('/api/submitForm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return await response.json();
};
