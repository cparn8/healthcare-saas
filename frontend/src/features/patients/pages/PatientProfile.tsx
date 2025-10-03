import { useEffect, useState } from 'react';
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from 'react-router-dom';
import { getPatient, updatePatient } from '../../patients/services/patients';
import { formatDate } from '../../../utils/date';
import { validatePatient, PatientPayload } from '../../../utils/validation';
import Skeleton from '../../../components/Skeleton';
import FormField from '../../../components/ui/FormField';
import { normalizeDRFErrors } from '../../../utils/apiErrors';
import ProfileHeader from '../../../components/ui/ProfileHeader';

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
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  // Start in edit mode if URL has ?edit=true
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setEditMode(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getPatient(parseInt(id))
        .then((data) => {
          setPatient(data);
          setFormData(data);
        })
        .finally(() => setLoading(false));
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
    if (!id) return;
    const validationErrors = validatePatient(formData as PatientPayload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const updated = await updatePatient(parseInt(id), formData);
      setPatient(updated);
      setEditMode(false);
      navigate(`/doctor/manage-users/patients/${id}`);
    } catch (err: any) {
      if (err.response?.data) {
        setErrors(normalizeDRFErrors(err.response.data));
      }
    }
  };

  if (loading) {
    return (
      <div className='p-6'>
        <Skeleton className='h-6 w-40 mb-4' />
        <div className='flex items-center space-x-6'>
          <Skeleton className='w-28 h-28 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-6 w-48' />
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-40' />
          </div>
        </div>
      </div>
    );
  }

  if (!patient) return <p>Not found</p>;

  return (
    <div className='p-6'>
      {!editMode ? (
        <>
          <ProfileHeader
            backTo='/doctor/manage-users/patients'
            title={`${patient.first_name} ${patient.last_name}`}
            subtitle={`PRN: ${patient.prn}`}
            actions={
              <>
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
              </>
            }
          />

          <div className='flex items-center space-x-6 mb-6'>
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
              <p>
                DOB: {formatDate(patient.date_of_birth)} | Gender:{' '}
                {patient.gender}
              </p>
              <p>{patient.email}</p>
              <p>{patient.phone}</p>
              <p>{patient.address}</p>
            </div>
          </div>
        </>
      ) : (
        <div>
          <ProfileHeader
            backTo='/doctor/manage-users/patients'
            title='Edit Patient Info'
            subtitle={patient.prn}
          />

          <form className='space-y-4'>
            <FormField
              type='text'
              name='first_name'
              label='First Name'
              value={formData.first_name || ''}
              onChange={handleChange}
              error={errors.first_name}
            />

            <FormField
              type='text'
              name='last_name'
              label='Last Name'
              value={formData.last_name || ''}
              onChange={handleChange}
              error={errors.last_name}
            />

            <FormField
              type='date'
              name='date_of_birth'
              label='Date of Birth'
              value={formData.date_of_birth || ''}
              onChange={handleChange}
              error={errors.date_of_birth}
            />

            <FormField
              as='select'
              name='gender'
              label='Gender'
              value={formData.gender || ''}
              onChange={handleChange}
              error={errors.gender}
            >
              <option value=''>Select Gender</option>
              <option value='Male'>Male</option>
              <option value='Female'>Female</option>
              <option value='Nonbinary'>Nonbinary</option>
              <option value='Other'>Other</option>
              <option value='Prefer not to say'>Prefer not to say</option>
            </FormField>

            <FormField
              type='email'
              name='email'
              label='Email'
              value={formData.email || ''}
              onChange={handleChange}
              error={errors.email}
            />

            <FormField
              type='text'
              name='phone'
              label='Phone'
              value={formData.phone || ''}
              onChange={handleChange}
              error={errors.phone}
            />

            <FormField
              type='text'
              name='address'
              label='Address'
              value={formData.address || ''}
              onChange={handleChange}
              error={errors.address}
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
