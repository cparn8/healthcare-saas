import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPatient, updatePatient } from '../services/patients';
import styles from './PatientProfile.module.css';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  prn: string;
  date_of_birth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  profile_picture?: string;
}

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getPatient(parseInt(id)).then((data) => {
        setPatient(data);
        setFormData(data);
      });
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (id) {
      const updated = await updatePatient(parseInt(id), formData);
      setPatient(updated);
      setEditMode(false);
    }
  };

  if (!patient) return <p>Loading...</p>;

  return (
    <div className='p-6'>
      <button
        onClick={() => navigate(-1)}
        className='mb-4 text-blue-600 hover:underline'
      >
        ← Back to Patients
      </button>

      {!editMode ? (
        <>
          <div className='flex items-center space-x-6 mb-6'>
            <img
              src={
                patient.profile_picture
                  ? patient.profile_picture
                  : '/images/patient-placeholder.png'
              }
              alt='profile'
              className={styles.patientphoto}
            />
            <div>
              <h1 className='text-2xl font-bold'>
                {patient.first_name} {patient.last_name}
              </h1>
              <p className='text-gray-600'>PRN: {patient.prn}</p>
              <p>
                DOB: {patient.date_of_birth} | Gender: {patient.gender}
              </p>
              <p>{patient.email}</p>
              <p>{patient.phone}</p>
              <p>{patient.address}</p>
            </div>
          </div>

          <div className='space-x-4'>
            <button
              onClick={() => setEditMode(true)}
              className='px-4 py-2 bg-yellow-500 text-white rounded'
            >
              Edit
            </button>
            <Link
              to={`/doctor/charts/${patient.id}`}
              className='px-4 py-2 bg-blue-600 text-white rounded'
            >
              View Chart →
            </Link>
          </div>
        </>
      ) : (
        <div>
          <h2 className='text-xl font-semibold mb-4'>Edit Patient Info</h2>
          <form className='space-y-4'>
            <input
              name='first_name'
              value={formData.first_name || ''}
              onChange={handleChange}
              placeholder='First Name'
              className='border p-2 w-full'
            />
            <input
              name='last_name'
              value={formData.last_name || ''}
              onChange={handleChange}
              placeholder='Last Name'
              className='border p-2 w-full'
            />
            <input
              type='date'
              name='date_of_birth'
              value={formData.date_of_birth || ''}
              onChange={handleChange}
              className='border p-2 w-full'
            />

            <select
              name='gender'
              value={formData.gender || ''}
              onChange={handleChange}
              className='border p-2 w-full'
            >
              <option value=''>Select Gender</option>
              <option value='Male'>Male</option>
              <option value='Female'>Female</option>
              <option value='Nonbinary'>Nonbinary</option>
              <option value='Other'>Other</option>
              <option value='Prefer not to say'>Prefer not to say</option>
            </select>
            <input
              name='email'
              value={formData.email || ''}
              onChange={handleChange}
              placeholder='Email'
              className='border p-2 w-full'
            />
            <input
              name='phone'
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder='Phone'
              className='border p-2 w-full'
            />
            <input
              name='address'
              value={formData.address || ''}
              onChange={handleChange}
              placeholder='Address'
              className='border p-2 w-full'
            />

            <div className='space-x-4'>
              <button
                type='button'
                onClick={handleSave}
                className='px-4 py-2 bg-green-600 text-white rounded'
              >
                Save
              </button>
              <button
                type='button'
                onClick={() => setEditMode(false)}
                className='px-4 py-2 bg-gray-400 text-white rounded'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
