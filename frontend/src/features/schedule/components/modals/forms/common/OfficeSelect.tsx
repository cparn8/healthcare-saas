import React from "react";

interface OfficeSelectProps {
  value: string;
  onChange: (office: string) => void;
  label?: string;
}

const OfficeSelect: React.FC<OfficeSelectProps> = ({
  value,
  onChange,
  label = "Facility",
}) => {
  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="north">North Office</option>
        <option value="south">South Office</option>
      </select>
    </div>
  );
};

export default OfficeSelect;
