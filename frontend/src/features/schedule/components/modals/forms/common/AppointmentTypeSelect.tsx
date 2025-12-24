import React from "react";

interface AppointmentType {
  name: string;
  default_duration: number;
  color_code: string;
}

interface AppointmentTypeSelectProps {
  appointmentTypes: AppointmentType[];
  value: string;
  onChange: (selected: AppointmentType) => void;
}

const AppointmentTypeSelect: React.FC<AppointmentTypeSelectProps> = ({
  appointmentTypes,
  value,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Appointment Type
      </label>

      <select
        className="w-full border border-border dark:border-top-dborder bg-grid-slot dark:bg-input-dlight rounded p-2"
        value={value}
        onChange={(e) => {
          const selected = appointmentTypes.find(
            (t) => t.name === e.target.value
          );

          // Safety: only call onChange if we found the object
          if (selected) onChange(selected);
        }}
      >
        <option value="">Select type</option>
        {appointmentTypes.map((t) => (
          <option key={t.name} value={t.name}>
            {t.name} ({t.default_duration} min)
          </option>
        ))}
      </select>
    </div>
  );
};

export default AppointmentTypeSelect;
