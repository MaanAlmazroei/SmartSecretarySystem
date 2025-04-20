import React, { useState, useEffect } from "react";
import "./Appointments.css";

const Appointments = () => {
  const [formData, setFormData] = useState({
    reasonForMeeting: "",
    selectedDate: "",
    selectedTimeSlot: null,
  });

  const [errors, setErrors] = useState({});
  const [availableSlots, setAvailableSlots] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [bookedAppointments, setBookedAppointments] = useState([]);

  const [bookedSlots, setBookedSlots] = useState({
    "2025-04-07": ["08:00", "09:30", "13:45"],
    "2025-04-08": ["10:15", "11:00", "13:30"],
    "2025-04-09": ["08:30", "12:45"],
  });

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 14; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 14 && minute > 0) break;
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
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
      allTimeSlots.forEach((slot) => {
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
    if (formData.reasonForMeeting && formData.reasonForMeeting.length < 10) {
      newErrors.reasonForMeeting =
        "Please provide a more detailed reason (at least 10 characters)";
    }
    if (!formData.selectedDate) {
      newErrors.selectedDate = "Please select a date";
    }
    if (!formData.selectedTimeSlot) {
      newErrors.selectedTimeSlot = "Please select a time slot";
    }
    setErrors(newErrors);

    const requiredFields = [
      "reasonForMeeting",
      "selectedDate",
      "selectedTimeSlot",
    ];
    const hasAllFields = requiredFields.every((field) => !!formData[field]);
    const hasNoErrors = Object.keys(newErrors).length === 0;
    setIsFormValid(hasAllFields && hasNoErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (e) => {
    setFormData({
      ...formData,
      selectedDate: e.target.value,
      selectedTimeSlot: null,
    });
  };

  const handleTimeSlotSelect = (timeSlot) => {
    if (availableSlots[timeSlot]) {
      setFormData({
        ...formData,
        selectedTimeSlot: timeSlot,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setBookedSlots((prev) => {
      const updatedSlots = { ...prev };
      if (!updatedSlots[formData.selectedDate]) {
        updatedSlots[formData.selectedDate] = [];
      }
      updatedSlots[formData.selectedDate] = [
        ...updatedSlots[formData.selectedDate],
        formData.selectedTimeSlot,
      ];
      return updatedSlots;
    });

    const newAppointment = {
      reasonForMeeting: formData.reasonForMeeting,
      date: formData.selectedDate,
      time: formData.selectedTimeSlot,
    };

    setBookedAppointments([...bookedAppointments, newAppointment]);

    console.log("Appointment booked:", formData);

    setFormData({
      reasonForMeeting: "",
      selectedDate: "",
      selectedTimeSlot: null,
    });

    alert("Appointment booked successfully!");
  };

  const formatTimeDisplay = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <>
      <div className="appointment-container">
        <h1 className="appointment-title">Schedule an Appointment</h1>
        <div className="appointment-content">
          <form className="appointment-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reasonForMeeting">Reason for Meeting *</label>
              <textarea
                id="reasonForMeeting"
                name="reasonForMeeting"
                value={formData.reasonForMeeting}
                onChange={handleInputChange}
                className={errors.reasonForMeeting ? "error" : ""}
                rows="4"
                required
              ></textarea>
              {errors.reasonForMeeting && (
                <div className="error-message">{errors.reasonForMeeting}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="selectedDate">Select a Date *</label>
              <input
                type="date"
                id="selectedDate"
                name="selectedDate"
                value={formData.selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
              {errors.selectedDate && (
                <div className="error-message">{errors.selectedDate}</div>
              )}
            </div>

            {formData.selectedDate && (
              <div className="time-slot-section">
                <h3>Available Time Slots</h3>
                <div className="time-slots-container">
                  {Object.entries(availableSlots).map(([slot, isAvailable]) => (
                    <div
                      key={slot}
                      className={`time-slot ${
                        !isAvailable ? "unavailable" : ""
                      } ${
                        formData.selectedTimeSlot === slot ? "selected" : ""
                      }`}
                      onClick={() => isAvailable && handleTimeSlotSelect(slot)}
                    >
                      {formatTimeDisplay(slot)}
                      {!isAvailable && (
                        <span className="booked-label">Booked</span>
                      )}
                    </div>
                  ))}
                </div>
                {errors.selectedTimeSlot && (
                  <div className="error-message">{errors.selectedTimeSlot}</div>
                )}
              </div>
            )}

            <button
              type="submit"
              className={`submit-button ${isFormValid ? "valid" : "disabled"}`}
              disabled={!isFormValid}
            >
              Book Appointment
            </button>
          </form>

          <div className="booked-appointments">
            <h3>Booked Appointments</h3>
            {bookedAppointments.length === 0 ? (
              <p>No appointments booked yet.</p>
            ) : (
              bookedAppointments.map((appointment, index) => (
                <div key={index} className="appointment-card">
                  <p>
                    <strong>Date:</strong> {appointment.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {formatTimeDisplay(appointment.time)}
                  </p>
                  <p>
                    <strong>Reason:</strong> {appointment.reasonForMeeting}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Appointments;
