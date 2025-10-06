import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../../services/api';
import Skeleton from '../../../components/Skeleton';
import FormField from '../../../components/ui/FormField';
import ProfileHeader from '../../../components/ui/ProfileHeader';
import { normalizeDRFErrors } from '../../../utils/apiErrors';
import { validateProvider, ProviderPayload } from '../../../utils/validation';

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
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  // Enable edit mode if ?edit=true
  useEffect(() => {
    if (searchParams.get('edit') === 'true') setEditMode(true);
  }, [searchParams]);

  // Fetch provider data
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!id) return;

    const validationErrors = validateProvider(formData as ProviderPayload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await API.put(`/providers/${id}/`, formData);
      setProvider(res.data);
      setEditMode(false);
      setErrors({});
      navigate(`/doctor/manage-users/providers/${id}`);
    } catch (err: any) {
      if (err.response?.data) {
        setErrors(normalizeDRFErrors(err.response.data));
      }
    }
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordUpdate = async () => {
    setPasswordError('');
    setPasswordMessage('');

    try {
      const res = await API.post('/auth/change-password/', passwordForm);
      setPasswordMessage(res.data.detail || 'Password updated successfully!');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err: any) {
      if (err.response?.data) {
        const data = err.response.data;
        const errorText =
          typeof data === 'string'
            ? data
            : Object.values(data).flat().join(' ');
        setPasswordError(errorText);
      } else {
        setPasswordError('An unexpected error occurred.');
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
    <div className='p-6 space-y-8'>
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

          <form className='space-y-4 mb-10'>
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

          {/* 🔒 Password Change Section */}
          <div className='border-t pt-6 mt-8'>
            <h2 className='text-xl font-semibold mb-4 text-gray-700'>
              Change Password
            </h2>

            <div className='space-y-4'>
              <FormField
                type='password'
                name='current_password'
                label='Current Password'
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
              />

              <FormField
                type='password'
                name='new_password'
                label='New Password'
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
              />

              <FormField
                type='password'
                name='confirm_password'
                label='Confirm Password'
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
              />

              {passwordError && (
                <p className='text-red-500 text-sm'>{passwordError}</p>
              )}
              {passwordMessage && (
                <p className='text-green-600 text-sm'>{passwordMessage}</p>
              )}

              <button
                type='button'
                onClick={handlePasswordUpdate}
                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderProfile;
