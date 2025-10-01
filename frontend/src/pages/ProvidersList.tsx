import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Provider {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  specialty: string;
  phone?: string | null;
  profile_picture?: string | null;
}

const ProvidersList: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await axios.get<Provider[]>(
        `/api/providers/?search=${encodeURIComponent(search)}`
      );
      setProviders(response.data);
    } catch (error) {
      // Keep error as unknown and log
      // eslint-disable-next-line no-console
      console.error('Error fetching providers', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Providers</h1>

      <input
        type='text'
        placeholder='Search providers...'
        value={search}
        onChange={handleSearchChange}
        className='border rounded px-4 py-2 mb-4 w-full'
      />

      <table className='min-w-full bg-white border border-gray-300 shadow-md rounded'>
        <thead>
          <tr>
            <th className='px-4 py-2 border'>Picture</th>
            <th className='px-4 py-2 border'>Name</th>
            <th className='px-4 py-2 border'>Specialty</th>
            <th className='px-4 py-2 border'>Email</th>
            <th className='px-4 py-2 border'>Phone</th>
            <th className='px-4 py-2 border'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider) => (
            <tr key={provider.id}>
              <td className='px-4 py-2 border'>
                <img
                  src={provider.profile_picture || '/default-avatar.png'}
                  alt='profile'
                  className='w-10 h-10 rounded-full'
                />
              </td>
              <td className='px-4 py-2 border'>
                {provider.first_name} {provider.last_name}
              </td>
              <td className='px-4 py-2 border'>{provider.specialty}</td>
              <td className='px-4 py-2 border'>{provider.email}</td>
              <td className='px-4 py-2 border'>{provider.phone ?? ''}</td>
              <td className='px-4 py-2 border'>
                <button className='px-2 py-1 bg-blue-500 text-white rounded mr-2'>
                  Edit
                </button>
                <button className='px-2 py-1 bg-red-500 text-white rounded'>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProvidersList;
