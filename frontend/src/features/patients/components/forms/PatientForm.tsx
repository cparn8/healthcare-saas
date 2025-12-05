import React, { useEffect, useState } from "react";
import FormField from "../../../../components/ui/FormField";

export interface PatientFormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
}

interface PatientFormProps {
  initialValues?: Partial<PatientFormData>;
  errors?: Record<string, string>;
  onChange: (data: PatientFormData) => void;
}

const PatientForm: React.FC<PatientFormProps> = ({
  initialValues = {},
  errors = {},
  onChange,
}) => {
  const [formData, setFormData] = useState<PatientFormData>({
    first_name: initialValues.first_name ?? "",
    last_name: initialValues.last_name ?? "",
    date_of_birth: initialValues.date_of_birth ?? "",
    gender: initialValues.gender ?? "",
    email: initialValues.email ?? "",
    phone: initialValues.phone ?? "",
    address: initialValues.address ?? "",
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const update = (patch: Partial<PatientFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        label="First Name"
        type="text"
        value={formData.first_name}
        error={errors.first_name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          update({ first_name: e.target.value })
        }
      />

      <FormField
        label="Last Name"
        type="text"
        value={formData.last_name}
        error={errors.last_name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          update({ last_name: e.target.value })
        }
      />

      <FormField
        label="Date of Birth"
        type="date"
        value={formData.date_of_birth}
        error={errors.date_of_birth}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          update({ date_of_birth: e.target.value })
        }
      />

      <FormField
        as="select"
        label="Gender"
        value={formData.gender}
        error={errors.gender}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          update({ gender: e.target.value })
        }
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Nonbinary">Nonbinary</option>
        <option value="Other">Other</option>
        <option value="Prefer not to say">Prefer not to say</option>
      </FormField>

      <FormField
        label="Email"
        type="email"
        className="col-span-2"
        value={formData.email}
        error={errors.email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          update({ email: e.target.value })
        }
      />

      <FormField
        label="Phone"
        type="text"
        value={formData.phone}
        error={errors.phone}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          update({ phone: e.target.value })
        }
      />

      <FormField
        label="Address"
        type="text"
        className="col-span-2"
        value={formData.address}
        error={errors.address}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          update({ address: e.target.value })
        }
      />
    </div>
  );
};

export default PatientForm;
