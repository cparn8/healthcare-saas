import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getPatients, createPatient } from '../services/patients';
import API from '../../../services/api'; // global api
import { formatDate } from '../../../utils/date';

const PatientsList: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest('.relative.inline-block')) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setLoading(true);
    getPatients(search)
      .then((data) => {
        setPatients(data);
        setLoading(false);
      })
      .catch(() => {
        setGeneralError('Failed to load patients.');
        setLoading(false);
      });
  }, [search]);

  const handleAddPatient = async () => {
    setSaving(true);
    setFormErrors({});
    setGeneralError('');
    setSuccessMsg('');

    try {
      const newPatient = await createPatient(formData);
      setPatients((prev) => [...prev, newPatient]);
      setShowForm(false);
      setSuccessMsg('Patient added successfully!');
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        email: '',
        phone: '',
        address: '',
      });
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this patient?'))
      return;

    setDeletingId(id);
    try {
      await API.delete(`/patients/${id}/`);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Delete failed', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className='p-6'>
      {/* Alerts */}
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

      {/* Search + Add button */}
      <div className='flex justify-between mb-4'>
        <input
          type='text'
          placeholder='Search patients...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='border p-2 w-1/2'
        />
        <button
          onClick={() => setShowForm(!showForm)}
          className='px-4 py-2 bg-green-600 text-white rounded'
        >
          + Add Patient
        </button>
      </div>

      {/* Form (toggleable) */}
      {showForm && (
        <div className='mb-4 p-4 border rounded bg-gray-50'>
          <h3 className='font-semibold mb-2'>New Patient</h3>
          <div className='grid grid-cols-2 gap-2'>
            <input
              placeholder='First Name'
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              className={`border p-2 ${
                formErrors.first_name ? 'border-red-500' : ''
              }`}
            />
            {formErrors.first_name && (
              <p className='text-red-500 text-sm'>{formErrors.first_name}</p>
            )}

            <input
              placeholder='Last Name'
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              className={`border p-2 ${
                formErrors.last_name ? 'border-red-500' : ''
              }`}
            />
            {formErrors.last_name && (
              <p className='text-red-500 text-sm'>{formErrors.last_name}</p>
            )}

            <input
              type='date'
              name='date_of_birth'
              placeholder='DOB'
              value={formData.date_of_birth}
              onChange={(e) =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
              className={`border p-2 ${
                formErrors.date_of_birth ? 'border-red-500' : ''
              }`}
            />
            {formErrors.date_of_birth && (
              <p className='text-red-500 text-sm'>{formErrors.date_of_birth}</p>
            )}

            <select
              name='gender'
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className={`border p-2 ${
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
              placeholder='Email'
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`border p-2 col-span-2 ${
                formErrors.email ? 'border-red-500' : ''
              }`}
            />
            {formErrors.email && (
              <p className='text-red-500 text-sm'>{formErrors.email}</p>
            )}

            <input
              placeholder='Phone'
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className={`border p-2 ${
                formErrors.phone ? 'border-red-500' : ''
              }`}
            />
            {formErrors.phone && (
              <p className='text-red-500 text-sm'>{formErrors.phone}</p>
            )}

            <input
              placeholder='Address'
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className={`border p-2 col-span-2 ${
                formErrors.address ? 'border-red-500' : ''
              }`}
            />
            {formErrors.address && (
              <p className='text-red-500 text-sm'>{formErrors.address}</p>
            )}
          </div>
          <div className='mt-2 flex space-x-2'>
            <button
              onClick={handleAddPatient}
              disabled={saving}
              className={`px-4 py-2 text-white rounded ${
                saving ? 'bg-gray-400' : 'bg-blue-600'
              }`}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className='px-4 py-2 bg-gray-400 text-white rounded'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Patient Table */}
      {loading ? (
        <div className='animate-pulse space-y-4'>
          <div className='h-6 bg-gray-300 rounded w-1/3'></div>
          <div className='h-6 bg-gray-200 rounded w-2/3'></div>
          <div className='h-6 bg-gray-200 rounded w-1/2'></div>
        </div>
      ) : (
        <table className='w-full border'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='p-2'>Photo</th>
              <th className='p-2'>First Name</th>
              <th className='p-2'>Last Name</th>
              <th className='p-2'>DOB</th>
              <th className='p-2'>Contact</th>
              <th className='p-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className='border-t'>
                <td className='p-2'>
                  <img
                    src='/images/patient-placeholder.png'
                    alt='profile'
                    className='w-10 h-10 rounded-full object-cover'
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
                  <small className='text-sm text-gray-500'>PRN {p.prn}</small>
                </td>
                <td
                  className='p-2 text-blue-600 cursor-pointer'
                  onClick={() =>
                    navigate(`/doctor/manage-users/patients/${p.id}`)
                  }
                >
                  {p.last_name}
                </td>
                <td className='p-2'>
                  {formatDate(p.date_of_birth)}
                  <br />
                  <small className='text-sm text-gray-500'>{p.gender}</small>
                </td>
                <td className='p-2'>
                  {p.phone}
                  <br />
                  <small className='text-sm text-gray-500'>{p.email}</small>
                  <br />
                  <small className='text-sm text-gray-500'>{p.address}</small>
                </td>

                <td className='p-2'>
                  <div className='relative inline-block'>
                    {/* Toggle Button */}
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === p.id ? null : p.id)
                      }
                      className='px-2'
                    >
                      ⋮
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === p.id && (
                      <div className='absolute right-0 mt-2 w-28 bg-white border rounded shadow-lg z-10'>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            navigate(
                              `/doctor/manage-users/patients/${p.id}?edit=true`
                            );
                          }}
                          className='block w-full text-left px-4 py-2 hover:bg-gray-100'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            handleDelete(p.id);
                          }}
                          disabled={deletingId === p.id}
                          className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                            deletingId === p.id
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600'
                          }`}
                        >
                          {deletingId === p.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatientsList;
