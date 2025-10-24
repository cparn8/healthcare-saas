import { useState } from 'react';

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  prn: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  profile_picture?: string;
}

export function usePatientSearch() {
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  async function searchPatients(query: string) {
    setLoading(true);
    try {
      // Replace later with: const res = await API.get(`/patients/?search=${query}`)
      const fakePatients: Patient[] = [
        {
          id: 1,
          first_name: 'John',
          last_name: 'Smith',
          prn: 'A1BC234DE',
          date_of_birth: '1962-01-01',
          gender: 'Male',
          phone: '(123) 456-7890',
          email: 'js@mail.com',
          address: '123 Any Pl, Anytown, CA',
          profile_picture: '/images/patient-placeholder.png',
        },
        {
          id: 2,
          first_name: 'Jane',
          last_name: 'Doe',
          prn: 'B2CD345FG',
          date_of_birth: '1975-05-12',
          gender: 'Female',
          phone: '(987) 654-3210',
          email: 'js@mail.com',
          address: '456 Main St, Somewhere, TX',
          profile_picture: '/images/patient-placeholder.png',
        },
      ];
      const filtered = fakePatients.filter((p) =>
        `${p.first_name} ${p.last_name} ${p.prn} ${p.phone} ${p.date_of_birth}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
      setResults(filtered);
    } finally {
      setLoading(false);
    }
  }

  return { results, loading, searchPatients };
}
