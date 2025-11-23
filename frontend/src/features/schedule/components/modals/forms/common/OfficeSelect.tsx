import React from "react";

interface OfficeSelectProps {
  value: string;
  onChange: (office: string) => void;
  label?: string;
}

const OfficeSelect: React.FC<OfficeSelectProps> = ({
  value,
  onChange,
  label = "Office",
}) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md p-2 text-sm bg-white 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      >
        <option value="north">North Office</option>
        <option value="south">South Office</option>
      </select>
    </div>
  );
};

export default OfficeSelect;
