import { useParams, useNavigate } from 'react-router-dom';

const PatientChart: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className='p-6'>
      <button
        onClick={() => navigate(-1)}
        className='mb-4 text-blue-600 hover:underline'
      >
        ← Back to Patient
      </button>

      <h1 className='text-2xl font-bold mb-4'>Patient Chart (ID: {id})</h1>

      <p>This is where the patient’s clinical chart form will go later.</p>
    </div>
  );
};

export default PatientChart;
