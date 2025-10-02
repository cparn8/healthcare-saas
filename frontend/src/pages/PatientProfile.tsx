import { useEffect, useState } from 'react';
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from 'react-router-dom';
import { getPatient, updatePatient } from '../services/patients';
import { formatDate } from '../utils/formatDate';

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
  const [searchParams] = useSearchParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const navigate = useNavigate();

  // Start in edit mode if URL has ?edit=true
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setEditMode(true);
    }
  }, [searchParams]);

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
      navigate(`/doctor/manage-users/patients/${id}`);
    }
  };

  if (!patient) return <p className='p-6'>Loading...</p>;

  return (
    <div className='p-6'>
      <button
        onClick={() => navigate('/doctor/manage-users/patients')}
        className='mb-4 text-blue-600 hover:underline'
      >
        ← Back to Patients
      </button>

      {/* View Mode */}
      {!editMode ? (
        <div className='bg-white shadow rounded-lg p-6'>
          <div className='flex items-center space-x-6 border-b pb-6 mb-6'>
            <img
              src={
                patient.profile_picture
                  ? patient.profile_picture
                  : '/images/patient-placeholder.png'
              }
              alt='profile'
              className='w-28 h-28 rounded-full object-cover'
            />
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>
                {patient.first_name} {patient.last_name}
              </h1>
              <p className='text-gray-600'>PRN {patient.prn}</p>
              <p className='text-gray-700'>
                DOB: {formatDate(patient.date_of_birth)} | Gender:{' '}
                {patient.gender || '—'}
              </p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 text-gray-800'>
            <div>
              <p className='font-semibold'>Email</p>
              <p>{patient.email || '—'}</p>
            </div>
            <div>
              <p className='font-semibold'>Phone</p>
              <p>{patient.phone || '—'}</p>
            </div>
            <div className='col-span-2'>
              <p className='font-semibold'>Address</p>
              <p>{patient.address || '—'}</p>
            </div>
          </div>

          <div className='mt-6 space-x-4'>
            <button
              onClick={() => setEditMode(true)}
              className='px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600'
            >
              Edit
            </button>
            <Link
              to={`/doctor/charts/${patient.id}`}
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
            >
              View Chart →
            </Link>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className='bg-white shadow rounded-lg p-6'>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>
            Edit Patient Info
          </h2>
          <form className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <input
                name='first_name'
                value={formData.first_name || ''}
                onChange={handleChange}
                placeholder='First Name'
                className='border p-2 rounded w-full'
              />
              <input
                name='last_name'
                value={formData.last_name || ''}
                onChange={handleChange}
                placeholder='Last Name'
                className='border p-2 rounded w-full'
              />
              <input
                type='date'
                name='date_of_birth'
                value={formData.date_of_birth || ''}
                onChange={handleChange}
                className='border p-2 rounded w-full'
              />
              <select
                name='gender'
                value={formData.gender || ''}
                onChange={handleChange}
                className='border p-2 rounded w-full'
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
                className='border p-2 rounded w-full col-span-2'
              />
              <input
                name='phone'
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder='Phone'
                className='border p-2 rounded w-full col-span-2'
              />
              <input
                name='address'
                value={formData.address || ''}
                onChange={handleChange}
                placeholder='Address'
                className='border p-2 rounded w-full col-span-2'
              />
            </div>

            <div className='space-x-4 mt-4'>
              <button
                type='button'
                onClick={handleSave}
                className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
              >
                Save
              </button>
              <button
                type='button'
                onClick={() => setEditMode(false)}
                className='px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500'
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
