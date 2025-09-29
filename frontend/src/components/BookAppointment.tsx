import React, { useState } from 'react';
import api from '../api';

const BookAppointment: React.FC = () => {
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState('');
  const [response, setResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post('/api/appointments/', {
      patient: patientId,
      date,
    });
    setResponse(res.data);
  };

  return (
    <div>
      <h2>Book Appointment</h2>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='Patient ID'
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
        <input
          type='datetime-local'
          placeholder='Date'
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button type='submit'>Book</button>
      </form>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </div>
  );
};

export default BookAppointment;
