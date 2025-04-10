// Appointments.jsx
import React, { useState, useEffect } from 'react';
import './Appointments.css';

const Appointments = () => {

  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    universityId: '',
    reasonForMeeting: '',
    selectedDate: '',
    selectedTimeSlot: null
  });

  const [errors, setErrors] = useState({});
  const [availableSlots, setAvailableSlots] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // DB api call here to fetch booked slots
  // For demonstration, we are using hardcoded booked slots, currently
  const [bookedSlots, setBookedSlots] = useState({
    '2025-04-07': ['08:00', '09:30', '13:45'],
    '2025-04-08': ['10:15', '11:00', '13:30'],
    '2025-04-09': ['08:30', '12:45']
  });

  // Generate all time slots from 8am to 2pm in 15-minute increments
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 14; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Stop at 2:00pm
        if (hour === 14 && minute > 0) break;
        
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return slots;
  };

  const allTimeSlots = generateTimeSlots();
  
  useEffect(() => { 
    if (formData.selectedDate) {
      const booked = bookedSlots[formData.selectedDate] || [];
      const available = {};
      
      allTimeSlots.forEach(slot => {
        available[slot] = !booked.includes(slot);
      });
      
      setAvailableSlots(available);
    }
  }, [formData.selectedDate, bookedSlots]);

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validate first name (letters only)
    if (formData.firstName && !/^[A-Za-z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name should contain only letters';
    }
    
    // Validate last name (letters only)
    if (formData.lastName && !/^[A-Za-z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name should contain only letters';
    }
    
    // Validate university ID (numbers only)
    if (formData.universityId && !/^\d+$/.test(formData.universityId)) {
      newErrors.universityId = 'University ID should contain only numbers';
    }
    
    // Validate reason (should be at least 10 characters)
    if (formData.reasonForMeeting && formData.reasonForMeeting.length < 10) {
      newErrors.reasonForMeeting = 'Please provide a more detailed reason (at least 10 characters)';
    }
    
    // Check if a date and time slot are selected
    if (!formData.selectedDate) {
      newErrors.selectedDate = 'Please select a date';
    }
    
    if (!formData.selectedTimeSlot) {
      newErrors.selectedTimeSlot = 'Please select a time slot';
    }
    
    setErrors(newErrors);
    
    // Check if all required fields are filled and valid
    const requiredFields = [
      'firstName', 
      'lastName', 
      'universityId', 
      'reasonForMeeting',
      'selectedDate',
      'selectedTimeSlot'
    ];
    
    const hasAllFields = requiredFields.every(field => !!formData[field]);
    const hasNoErrors = Object.keys(newErrors).length === 0;
    
    setIsFormValid(hasAllFields && hasNoErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (e) => {
    setFormData({
      ...formData,
      selectedDate: e.target.value,
      selectedTimeSlot: null
    });
  };

  const handleTimeSlotSelect = (timeSlot) => {
    if (availableSlots[timeSlot]) {
      setFormData({
        ...formData,
        selectedTimeSlot: timeSlot
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    // Add the selected slot to booked slots
    setBookedSlots(prev => {
      const updatedSlots = { ...prev };
      if (!updatedSlots[formData.selectedDate]) {
        updatedSlots[formData.selectedDate] = [];
      }
      updatedSlots[formData.selectedDate] = [
        ...updatedSlots[formData.selectedDate],
        formData.selectedTimeSlot
      ];
      return updatedSlots;
    });
    
    // send this to back end api
    console.log('Appointment booked:', formData);
    
    // Clear form data
    setFormData({
      firstName: '',
      lastName: '',
      universityId: '',
      reasonForMeeting: '',
      selectedDate: '',
      selectedTimeSlot: null
    });
    
    alert('Appointment booked successfully!');
  };

  const formatTimeDisplay = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="appointment-container">
      <h1 className="appointment-title">Schedule an Appointment</h1>
      
      <form className="appointment-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={errors.firstName ? 'error' : ''}
            required
          />
          {errors.firstName && <div className="error-message">{errors.firstName}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={errors.lastName ? 'error' : ''}
            required
          />
          {errors.lastName && <div className="error-message">{errors.lastName}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="universityId">University ID </label>
          <input
            type="text"
            id="universityId"
            name="universityId"
            value={formData.universityId}
            onChange={handleInputChange}
            className={errors.universityId ? 'error' : ''}
            
          />
          {errors.universityId && <div className="error-message">{errors.universityId}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="reasonForMeeting">Reason for Meeting *</label>
          <textarea
            id="reasonForMeeting"
            name="reasonForMeeting"
            value={formData.reasonForMeeting}
            onChange={handleInputChange}
            className={errors.reasonForMeeting ? 'error' : ''}
            rows="4"
            required
          ></textarea>
          {errors.reasonForMeeting && <div className="error-message">{errors.reasonForMeeting}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="selectedDate">Select a Date *</label>
          <input
            type="date"
            id="selectedDate"
            name="selectedDate"
            value={formData.selectedDate}
            onChange={handleDateChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          {errors.selectedDate && <div className="error-message">{errors.selectedDate}</div>}
        </div>
        
        {formData.selectedDate && (
          <div className="time-slot-section">
            <h3>Available Time Slots</h3>
            <div className="time-slots-container">
              {Object.entries(availableSlots).map(([slot, isAvailable]) => (
                <div
                  key={slot}
                  className={`time-slot ${!isAvailable ? 'unavailable' : ''} ${formData.selectedTimeSlot === slot ? 'selected' : ''}`}
                  onClick={() => isAvailable && handleTimeSlotSelect(slot)}
                >
                  {formatTimeDisplay(slot)}
                  {!isAvailable && <span className="booked-label">Booked</span>}
                </div>
              ))}
            </div>
            {errors.selectedTimeSlot && <div className="error-message">{errors.selectedTimeSlot}</div>}
          </div>
        )}
        
        <button
          type="submit"
          className={`submit-button ${isFormValid ? 'valid' : 'disabled'}`}
          disabled={!isFormValid}
        >
          Book Appointment
        </button>
      </form>
    </div>
  );
};

export default Appointments;
