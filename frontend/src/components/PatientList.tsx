import React, { useEffect, useState } from 'react';
import api from '../api';

interface Patient {
  id: number;
  name: string;
  age: number;
}

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const res = await api.get('/api/patients/');
      setPatients(res.data);
    };
    fetchPatients();
  }, []);

  return (
    <div>
      <h2>Patients</h2>
      <ul>
        {patients.map((p) => (
          <li key={p.id}>
            {p.name} (age {p.age})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientList;
