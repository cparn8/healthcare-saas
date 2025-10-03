import { Link } from 'react-router-dom';

const ManageUsers: React.FC = () => (
  <div className='p-6'>
    <h1 className='text-xl font-bold mb-4'>Manage Users</h1>
    <ul className='space-y-2'>
      <li>
        <Link to='/doctor/manage-users/patients' className='text-blue-600'>
          View Patients
        </Link>
      </li>
      <li>
        <Link to='/doctor/manage-users/providers' className='text-blue-600'>
          View Providers
        </Link>
      </li>
    </ul>
  </div>
);

export default ManageUsers;
