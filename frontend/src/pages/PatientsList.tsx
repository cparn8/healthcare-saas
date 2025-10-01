import { useEffect, useState } from 'react';
import { getPatients, deletePatient } from '../services/patients';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  prn: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  profile_picture?: string;
}

const PatientsList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getPatients(search).then(setPatients);
  }, [search]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete patient?')) {
      await deletePatient(id);
      getPatients(search).then(setPatients);
    }
  };

  return (
    <div className='p-6'>
      <h1 className='text-xl font-bold mb-4'>Patients</h1>
      <input
        type='text'
        placeholder='Search by name, PRN, or DOB...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='border p-2 rounded mb-4 w-full'
      />
      <table className='w-full border-collapse'>
        <thead>
          <tr className='bg-gray-100'>
            <th className='p-2 text-left'>Photo</th>
            <th className='p-2 text-left'>Name / PRN</th>
            <th className='p-2 text-left'>Last Name</th>
            <th className='p-2 text-left'>DOB / Gender</th>
            <th className='p-2 text-left'>Contact Info</th>
            <th className='p-2 text-left'></th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id} className='border-b hover:bg-gray-50'>
              <td className='p-2'>
                <img
                  src={
                    p.profile_picture
                      ? p.profile_picture
                      : '/images/patient-placeholder.png'
                  }
                  alt='profile'
                  className='w-10 h-10 rounded-full'
                />
              </td>
              <td
                className='p-2 text-blue-600 cursor-pointer'
                onClick={() =>
                  navigate(`/doctor/manage-users/patients/${p.id}`)
                }
              >
                {p.first_name}
                <br />
                <span className='text-sm text-gray-500'>{p.prn}</span>
              </td>
              <td className='p-2'>{p.last_name}</td>
              <td className='p-2'>
                {p.dob}
                <br />
                <span className='text-sm text-gray-500'>{p.gender}</span>
              </td>
              <td className='p-2'>
                {p.address}
                <br />
                {p.phone}
                <br />
                {p.email}
              </td>
              <td className='p-2'>
                <button
                  onClick={() =>
                    navigate(`/doctor/manage-users/patients/${p.id}/edit`)
                  }
                  className='mr-2 text-blue-600'
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className='text-red-600'
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientsList;
