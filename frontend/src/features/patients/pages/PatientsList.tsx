import { useState, useEffect } from 'react';
import {
  getPatients,
  createPatient,
} from '../../../features/patients/services/patients';
import { useNavigate } from 'react-router-dom';
import API from '../../../services/api';
import { formatDate } from '../../../utils/date';
import FormField from '../../../components/ui/FormField';
import { normalizeDRFErrors } from '../../../utils/apiErrors';
import Dropdown from '../../../components/ui/Dropdown';

const PatientsList: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();

  // 🔄 Fetch patient list (with search)
  useEffect(() => {
    getPatients(search).then(setPatients);
  }, [search]);

  /* ------------------------------------------------------
   ✅ handleAddPatient
   ------------------------------------------------------ */
  const handleAddPatient = async () => {
    try {
      const newPatient = await createPatient(formData);
      setPatients((prev) => [...prev, newPatient]);

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        email: '',
        phone: '',
        address: '',
      });
      setErrors({});
      setShowForm(false);

      // 🧠 Save patient + any pending slot to sessionStorage
      const prefillSlot = sessionStorage.getItem('prefillSlot');
      if (prefillSlot) {
        sessionStorage.setItem('pendingSlot', prefillSlot);
        sessionStorage.removeItem('prefillSlot');
      }

      sessionStorage.setItem('newPatient', JSON.stringify(newPatient));

      // 🔁 Redirect back to Schedule (triggers modal reopen)
      navigate(`/doctor/schedule?newPatientId=${newPatient.id}`);
    } catch (err: any) {
      setErrors(normalizeDRFErrors(err.response?.data));
    }
  };

  /* ------------------------------------------------------
   Delete patient (unchanged)
   ------------------------------------------------------ */
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this patient?'))
      return;

    try {
      setDeletingId(id);
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
      {/* Search + Add button */}
      <div className='flex justify-between mb-4'>
        <input
          type='text'
          placeholder='Search patients...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='border p-2 w-1/2 rounded'
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
            <FormField
              type='text'
              label='First Name'
              value={formData.first_name}
              error={errors.first_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
            />
            <FormField
              type='text'
              label='Last Name'
              value={formData.last_name}
              error={errors.last_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
            />
            <FormField
              type='date'
              label='Date of Birth'
              value={formData.date_of_birth}
              error={errors.date_of_birth}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
            />
            <FormField
              as='select'
              label='Gender'
              value={formData.gender}
              error={errors.gender}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, gender: e.target.value })
              }
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
              label='Email'
              value={formData.email}
              error={errors.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className='col-span-2'
            />
            <FormField
              type='text'
              label='Phone'
              value={formData.phone}
              error={errors.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <FormField
              type='text'
              label='Address'
              value={formData.address}
              error={errors.address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className='col-span-2'
            />
          </div>
          <div className='mt-2 flex space-x-2'>
            <button
              onClick={handleAddPatient}
              className='px-4 py-2 bg-blue-600 text-white rounded'
            >
              Save
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
                <Dropdown
                  trigger={({ toggle }) => (
                    <button
                      onClick={toggle}
                      className='px-2 text-gray-600 hover:text-black'
                    >
                      ⋮
                    </button>
                  )}
                >
                  <button
                    onClick={() =>
                      navigate(
                        `/doctor/manage-users/patients/${p.id}?edit=true`
                      )
                    }
                    className='block w-full text-left px-4 py-2 hover:bg-gray-100'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className='block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600'
                  >
                    {deletingId === p.id ? 'Deleting…' : 'Delete'}
                  </button>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientsList;
