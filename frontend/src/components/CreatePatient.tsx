import React, { useState } from 'react';
import api from '../api';

const CreatePatient: React.FC = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [response, setResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post('/api/patients/', {
      name,
      age: parseInt(age),
    });
    setResponse(res.data);
  };

  return (
    <div>
      <h2>Create Patient</h2>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='Patient name'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type='number'
          placeholder='Age'
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <button type='submit'>Create</button>
      </form>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </div>
  );
};

export default CreatePatient;
