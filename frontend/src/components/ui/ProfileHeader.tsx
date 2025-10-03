import React from 'react';
import { useNavigate } from 'react-router-dom';

type ProfileHeaderProps = {
  backTo: string; // URL to navigate back
  title: string; // Main header text
  subtitle?: string; // Optional (e.g., PRN or ID)
  actions?: React.ReactNode; // Buttons like Edit, View Chart
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  backTo,
  title,
  subtitle,
  actions,
}) => {
  const navigate = useNavigate();

  return (
    <div className='mb-6'>
      {/* Back button */}
      <button
        onClick={() => navigate(backTo)}
        className='mb-4 text-blue-600 hover:underline'
      >
        ← Back
      </button>

      {/* Title + Actions */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>{title}</h1>
          {subtitle && <p className='text-gray-600'>{subtitle}</p>}
        </div>
        {actions && <div className='space-x-2'>{actions}</div>}
      </div>
    </div>
  );
};

export default ProfileHeader;
