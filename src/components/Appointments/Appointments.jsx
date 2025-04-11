// Appointments.jsx
// Import necessary modules and styles
import React, { useState, useEffect } from 'react';
import './Appointments.css';

const Appointments = () => {
  // State to manage form data
  const [formData, setFormData] = useState({
    reasonForMeeting: '',
    selectedDate: '',
    selectedTimeSlot: null
  });

  // State to manage form validation errors
  const [errors, setErrors] = useState({});
  // State to manage available time slots for the selected date
  const [availableSlots, setAvailableSlots] = useState({});
  // State to track if the form is valid
  const [isFormValid, setIsFormValid] = useState(false);
  // State to track all booked appointments
  const [bookedAppointments, setBookedAppointments] = useState([]);

  // DB api call here to fetch booked slots
  // For demonstration, we are using hardcoded booked slots, currently
  const [bookedSlots, setBookedSlots] = useState({
    '2025-04-07': ['08:00', '09:30', '13:45'],
    '2025-04-08': ['10:15', '11:00', '13:30'],
    '2025-04-09': ['08:30', '12:45']
  });

  // Function to generate all time slots from 8:00 AM to 2:00 PM in 15-minute increments
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 14; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 14 && minute > 0) break; // Stop at 2:00 PM
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return slots;
  };

  const allTimeSlots = generateTimeSlots();

  // Update available slots whenever the selected date changes
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

  // Validate the form whenever form data changes
  useEffect(() => {
    validateForm();
  }, [formData]);

  // Function to validate the form fields
  const validateForm = () => {
    const newErrors = {};
    // Validate reason for meeting (minimum 10 characters)
    if (formData.reasonForMeeting && formData.reasonForMeeting.length < 10) {
      newErrors.reasonForMeeting = 'Please provide a more detailed reason (at least 10 characters)';
    }
    // Ensure a date and time slot are selected
    if (!formData.selectedDate) {
      newErrors.selectedDate = 'Please select a date';
    }
    if (!formData.selectedTimeSlot) {
      newErrors.selectedTimeSlot = 'Please select a time slot';
    }
    setErrors(newErrors);

    // Check if all required fields are filled and valid
    const requiredFields = ['reasonForMeeting', 'selectedDate', 'selectedTimeSlot'];
    const hasAllFields = requiredFields.every(field => !!formData[field]);
    const hasNoErrors = Object.keys(newErrors).length === 0;
    setIsFormValid(hasAllFields && hasNoErrors);
  };

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle changes to the selected date
  const handleDateChange = (e) => {
    setFormData({
      ...formData,
      selectedDate: e.target.value,
      selectedTimeSlot: null // Reset time slot when date changes
    });
  };

  // Handle selection of a time slot
  const handleTimeSlotSelect = (timeSlot) => {
    if (availableSlots[timeSlot]) {
      setFormData({
        ...formData,
        selectedTimeSlot: timeSlot
      });
    }
  };

  // Handle form submission
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

    // Create a new appointment object to view on the side of booking form
    const newAppointment = {
      reasonForMeeting: formData.reasonForMeeting,
      date: formData.selectedDate,
      time: formData.selectedTimeSlot
    };

    // Add the new appointment to the list of booked appointments
    setBookedAppointments([...bookedAppointments, newAppointment]);

    // Log the appointment to the console (simulate API call)
    console.log('Appointment booked:', formData);

    // Clear the form data
    setFormData({
      reasonForMeeting: '',
      selectedDate: '',
      selectedTimeSlot: null
    });

    // Notify the user
    alert('Appointment booked successfully!');
  };

  // Format time strings for display (e.g., "08:00" -> "8:00 AM")
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
      <div className="appointment-content">
        <form className="appointment-form" onSubmit={handleSubmit}>
          {/* Reason for meeting input field */}
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

          {/* Date selection field */}
          <div className="form-group">
            <label htmlFor="selectedDate">Select a Date *</label>
            <input
              type="date"
              id="selectedDate"
              name="selectedDate"
              value={formData.selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]} // Disable past dates
              required
            />
            {errors.selectedDate && <div className="error-message">{errors.selectedDate}</div>}
          </div>

          {/* Time slot selection */}
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

          {/* Submit button */}
          <button
            type="submit"
            className={`submit-button ${isFormValid ? 'valid' : 'disabled'}`}
            disabled={!isFormValid}
          >
            Book Appointment
          </button>
        </form>

        {/* Display booked appointments */}
        <div className="booked-appointments">
          <h3>Booked Appointments</h3>
          {bookedAppointments.length === 0 ? (
            <p>No appointments booked yet.</p>
          ) : (
            bookedAppointments.map((appointment, index) => (
              <div key={index} className="appointment-card">
                <p><strong>Date:</strong> {appointment.date}</p>
                <p><strong>Time:</strong> {formatTimeDisplay(appointment.time)}</p>
                <p><strong>Reason:</strong> {appointment.reasonForMeeting}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
