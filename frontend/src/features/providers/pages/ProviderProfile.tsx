import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../../services/api';
import Skeleton from '../../../components/Skeleton';
import FormField from '../../../components/ui/FormField';
import ProfileHeader from '../../../components/ui/ProfileHeader';
import { normalizeDRFErrors } from '../../../utils/apiErrors';

interface Provider {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialty?: string;
  profile_picture?: string;
}

const ProviderProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState<Partial<Provider>>({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('edit') === 'true') setEditMode(true);
  }, [searchParams]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      API.get(`/providers/${id}/`)
        .then((res) => {
          setProvider(res.data);
          setFormData(res.data);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      const res = await API.put(`/providers/${id}/`, formData);
      setProvider(res.data);
      setEditMode(false);
      navigate(`/doctor/manage-users/providers/${id}`);
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
        <Skeleton className='w-28 h-28 rounded-full mb-2' />
        <Skeleton className='h-4 w-48 mb-1' />
        <Skeleton className='h-4 w-32 mb-1' />
      </div>
    );
  }

  if (!provider) return <p>Not found</p>;

  return (
    <div className='p-6'>
      {!editMode ? (
        <>
          <ProfileHeader
            backTo='/doctor/manage-users/providers'
            title={`${provider.first_name} ${provider.last_name}`}
            subtitle={provider.specialty || 'Provider'}
            actions={
              <button
                onClick={() => setEditMode(true)}
                className='px-4 py-2 bg-yellow-500 text-white rounded'
              >
                Edit
              </button>
            }
          />

          <div className='flex items-center space-x-6'>
            <img
              src={
                provider.profile_picture || '/images/provider-placeholder.png'
              }
              alt='profile'
              className='w-28 h-28 rounded-full object-cover'
            />
            <div>
              <p>{provider.email}</p>
              <p>{provider.phone}</p>
              <p>{provider.specialty}</p>
            </div>
          </div>
        </>
      ) : (
        <div>
          <ProfileHeader
            backTo='/doctor/manage-users/providers'
            title='Edit Provider Info'
            subtitle={provider.specialty || ''}
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
              name='specialty'
              label='Specialty'
              value={formData.specialty || ''}
              onChange={handleChange}
              error={errors.specialty}
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

export default ProviderProfile;
