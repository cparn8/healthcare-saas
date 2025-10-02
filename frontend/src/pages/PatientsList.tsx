import { useState, useEffect } from 'react';
import { getPatients, createPatient } from '../services/patients';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { formatDate } from '../utils/formatDate';

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
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getPatients(search).then(setPatients);
  }, [search]);

  const handleAddPatient = async () => {
    try {
      const newPatient = await createPatient(formData);
      setPatients((prev) => [...prev, newPatient]);
      setShowForm(false);
    } catch (err: any) {
      console.error(err.response?.data);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this patient?'))
      return;

    try {
      await API.delete(`/patients/${id}/`);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Delete failed', error);
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
          className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
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
              className='border p-2 rounded'
            />
            <input
              placeholder='Last Name'
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              className='border p-2 rounded'
            />
            <input
              type='date'
              name='date_of_birth'
              value={formData.date_of_birth}
              onChange={(e) =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
              className='border p-2 rounded'
            />
            <select
              name='gender'
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className='border p-2 rounded'
            >
              <option value=''>Select Gender</option>
              <option value='Male'>Male</option>
              <option value='Female'>Female</option>
              <option value='Nonbinary'>Nonbinary</option>
              <option value='Other'>Other</option>
              <option value='Prefer not to say'>Prefer not to say</option>
            </select>
            <input
              placeholder='Email'
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className='border p-2 rounded col-span-2'
            />
            <input
              placeholder='Phone'
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className='border p-2 rounded'
            />
            <input
              placeholder='Address'
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className='border p-2 rounded col-span-2'
            />
          </div>
          <div className='mt-2 flex space-x-2'>
            <button
              onClick={handleAddPatient}
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className='px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Patient Table */}
      <table className='w-full border rounded'>
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
              <td className='relative p-2'>
                {/* Ellipsis Menu */}
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === p.id ? null : p.id)
                  }
                  className='px-2 py-1 rounded hover:bg-gray-200'
                >
                  ⋮
                </button>
                {openMenuId === p.id && (
                  <div className='absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-md z-10'>
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
                      className='block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600'
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientsList;
