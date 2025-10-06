import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../../../components/ui/FormField';
import { normalizeDRFErrors } from '../../../utils/apiErrors';
import { validateProvider, ProviderPayload } from '../../../utils/validation';
import API from '../../../services/api';

type ProviderCreateForm = ProviderPayload & {
  password: string;
  confirm_password: string;
};

const CreateProvider: React.FC = () => {
  const [formData, setFormData] = useState<ProviderCreateForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialty: '',
    password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Single typed change handler for all inputs/selects
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Base validation (first/last/specialty/email/phone)
    const baseErrors = validateProvider(formData);
    const nextErrors: Record<string, string> = { ...baseErrors };

    // Password rules (frontend mirror; backend enforces too)
    if (!formData.password?.trim()) {
      nextErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirm_password) {
      nextErrors.confirm_password = 'Passwords do not match';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      // Send the payload expected by your ProviderSerializer
      const res = await API.post('/providers/', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        specialty: formData.specialty,
        password: formData.password,
        confirm_password: formData.confirm_password,
      });

      setErrors({});
      navigate(`/doctor/manage-users/providers/${res.data.id}`);
    } catch (err: any) {
      if (err.response?.data) {
        setErrors(normalizeDRFErrors(err.response.data));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-6 max-w-2xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Add New Provider</h1>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <FormField
          type='text'
          name='first_name'
          label='First Name'
          value={formData.first_name}
          onChange={handleChange}
          error={errors.first_name}
        />

        <FormField
          type='text'
          name='last_name'
          label='Last Name'
          value={formData.last_name}
          onChange={handleChange}
          error={errors.last_name}
        />

        <FormField
          type='email'
          name='email'
          label='Email'
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <FormField
          type='text'
          name='phone'
          label='Phone'
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />

        <FormField
          type='text'
          name='specialty'
          label='Specialty'
          value={formData.specialty}
          onChange={handleChange}
          error={errors.specialty}
        />

        {/* New password fields */}
        <FormField
          type='password'
          name='password'
          label='Password'
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <FormField
          type='password'
          name='confirm_password'
          label='Confirm Password'
          value={formData.confirm_password}
          onChange={handleChange}
          error={errors.confirm_password}
        />

        <div className='space-x-3'>
          <button
            type='submit'
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
          <button
            type='button'
            onClick={() => navigate('/doctor/manage-users/providers')}
            className='px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500'
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProvider;
