import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPatient } from '../services/patients';

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

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getPatient(parseInt(id)).then(setPatient);
    }
  }, [id]);

  if (!patient) return <p>Loading...</p>;

  return (
    <div className='p-6'>
      <button
        onClick={() => navigate(-1)}
        className='mb-4 text-blue-600 hover:underline'
      >
        ← Back to Patients
      </button>

      <div className='flex items-center space-x-6 mb-6'>
        {patient.profile_picture ? (
          <img
            src={patient.profile_picture}
            alt='profile'
            className='w-24 h-24 rounded-full'
          />
        ) : (
          <div className='w-24 h-24 rounded-full bg-gray-300' />
        )}
        <div>
          <h1 className='text-2xl font-bold'>
            {patient.first_name} {patient.last_name}
          </h1>
          <p className='text-gray-600'>PRN: {patient.prn}</p>
          <p>
            DOB: {patient.dob} | Gender: {patient.gender}
          </p>
          <p>{patient.email}</p>
          <p>{patient.phone}</p>
          <p>{patient.address}</p>
        </div>
      </div>

      {/* Link to Charts */}
      <Link
        to={`/doctor/charts/${patient.id}`}
        className='px-4 py-2 bg-blue-600 text-white rounded'
      >
        View Chart →
      </Link>
    </div>
  );
};

export default PatientProfile;
