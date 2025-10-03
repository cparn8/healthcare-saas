import { useEffect, useState } from 'react';
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from 'react-router-dom';
import { getPatient, updatePatient } from '../services/patients';
import { formatDate } from '../../../utils/date';

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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  // Start in edit mode if URL has ?edit=true
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setEditMode(true);
    }
  }, [searchParams]);

  // Fetch patient
  useEffect(() => {
    if (id) {
      getPatient(parseInt(id))
        .then((data) => {
          setPatient(data);
          setFormData(data);
          setLoading(false);
        })
        .catch(() => {
          setGeneralError('Failed to load patient.');
          setLoading(false);
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
    setFormErrors({ ...formErrors, [e.target.name]: '' }); // clear inline error
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setFormErrors({});
    setGeneralError('');
    setSuccessMsg('');

    try {
      const updated = await updatePatient(parseInt(id), formData);
      setPatient(updated);
      setEditMode(false);
      setSuccessMsg('Patient updated successfully!');
      navigate(`/doctor/manage-users/patients/${id}`);
    } catch (err: any) {
      if (err.response?.status === 400 && err.response.data) {
        const backendErrors: Record<string, string> = {};
        for (const key in err.response.data) {
          backendErrors[key] = err.response.data[key][0];
        }
        setFormErrors(backendErrors);
      } else {
        setGeneralError('Something went wrong. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='p-6 animate-pulse'>
        <div className='h-6 bg-gray-300 rounded w-1/3 mb-4'></div>
        <div className='h-40 w-40 bg-gray-300 rounded-full mb-6'></div>
        <div className='h-4 bg-gray-200 rounded w-1/2 mb-2'></div>
        <div className='h-4 bg-gray-200 rounded w-2/3 mb-2'></div>
        <div className='h-4 bg-gray-200 rounded w-1/3 mb-2'></div>
      </div>
    );
  }

  if (!patient) return <p>No patient found.</p>;

  return (
    <div className='p-6'>
      <button
        onClick={() => navigate('/doctor/manage-users/patients')}
        className='mb-4 text-blue-600 hover:underline'
      >
        ← Back to Patients
      </button>

      {generalError && (
        <div className='bg-red-100 text-red-700 p-2 rounded mb-2'>
          {generalError}
        </div>
      )}
      {successMsg && (
        <div className='bg-green-100 text-green-700 p-2 rounded mb-2'>
          {successMsg}
        </div>
      )}

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
              className='w-32 h-32 rounded-full object-cover'
            />
            <div>
              <h1 className='text-2xl font-bold'>
                {patient.first_name} {patient.last_name}
              </h1>
              <p className='text-gray-600'>PRN: {patient.prn}</p>
              <p>
                DOB: {formatDate(patient.date_of_birth)} | Gender:{' '}
                {patient.gender}
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
              className={`border p-2 w-full ${
                formErrors.first_name ? 'border-red-500' : ''
              }`}
            />
            {formErrors.first_name && (
              <p className='text-red-500 text-sm'>{formErrors.first_name}</p>
            )}

            <input
              name='last_name'
              value={formData.last_name || ''}
              onChange={handleChange}
              placeholder='Last Name'
              className={`border p-2 w-full ${
                formErrors.last_name ? 'border-red-500' : ''
              }`}
            />
            {formErrors.last_name && (
              <p className='text-red-500 text-sm'>{formErrors.last_name}</p>
            )}

            <input
              type='date'
              name='date_of_birth'
              value={formData.date_of_birth || ''}
              onChange={handleChange}
              className={`border p-2 w-full ${
                formErrors.date_of_birth ? 'border-red-500' : ''
              }`}
            />
            {formErrors.date_of_birth && (
              <p className='text-red-500 text-sm'>{formErrors.date_of_birth}</p>
            )}

            <select
              name='gender'
              value={formData.gender || ''}
              onChange={handleChange}
              className={`border p-2 w-full ${
                formErrors.gender ? 'border-red-500' : ''
              }`}
            >
              <option value=''>Select Gender</option>
              <option value='Male'>Male</option>
              <option value='Female'>Female</option>
              <option value='Nonbinary'>Nonbinary</option>
              <option value='Other'>Other</option>
              <option value='Prefer not to say'>Prefer not to say</option>
            </select>
            {formErrors.gender && (
              <p className='text-red-500 text-sm'>{formErrors.gender}</p>
            )}

            <input
              name='email'
              value={formData.email || ''}
              onChange={handleChange}
              placeholder='Email'
              className={`border p-2 w-full ${
                formErrors.email ? 'border-red-500' : ''
              }`}
            />
            {formErrors.email && (
              <p className='text-red-500 text-sm'>{formErrors.email}</p>
            )}

            <input
              name='phone'
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder='Phone'
              className={`border p-2 w-full ${
                formErrors.phone ? 'border-red-500' : ''
              }`}
            />
            {formErrors.phone && (
              <p className='text-red-500 text-sm'>{formErrors.phone}</p>
            )}

            <input
              name='address'
              value={formData.address || ''}
              onChange={handleChange}
              placeholder='Address'
              className={`border p-2 w-full ${
                formErrors.address ? 'border-red-500' : ''
              }`}
            />
            {formErrors.address && (
              <p className='text-red-500 text-sm'>{formErrors.address}</p>
            )}

            <div className='space-x-4'>
              <button
                type='button'
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded text-white ${
                  saving ? 'bg-gray-400' : 'bg-green-600'
                }`}
              >
                {saving ? 'Saving…' : 'Save'}
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
