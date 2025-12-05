import React from "react";
import { Patient } from "../../hooks/usePatientsList";
import Dropdown from "../../../../components/ui/Dropdown";
import { formatDisplayDate as formatDate } from "../../../../utils/dateUtils";

interface PatientsTableProps {
  patients: Patient[];
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

const PatientsTable: React.FC<PatientsTableProps> = ({
  patients,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <table className="w-full">
      <thead>
        <tr className="text-left">
          <th className="py-2 pr-2 pl-9">Photo</th>
          <th className="p-2">Name</th>
          <th className="p-2">DOB</th>
          <th className="p-2">Gender</th>
          <th className="p-2">Contact</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>

      <tbody>
        {patients.map((p) => (
          <tr key={p.id} className="border-t hover:bg-gray-100 align-middle">
            {/* Photo */}
            <td className="py-2 pr-2 pl-9">
              <img
                src={p.profile_picture || "/images/patient-placeholder.png"}
                alt="profile"
                className="w-11 h-11 rounded-full object-cover"
              />
            </td>

            {/* Name + PRN (clickable) */}
            <td className="p-2">
              <button
                type="button"
                onClick={() => onView(p)}
                className="text-left"
              >
                <div className="hover:underline">
                  {p.first_name} {p.last_name}
                </div>
                <div className="text-xs text-gray-500">PRN {p.prn}</div>
              </button>
            </td>

            {/* DOB */}
            <td className="p-2 text-sm text-gray-800">
              {p.date_of_birth ? formatDate(p.date_of_birth) : "—"}
            </td>

            {/* Gender */}
            <td className="p-2 text-sm text-gray-800">{p.gender || "—"}</td>

            {/* Contact */}
            <td className="p-2 text-sm text-gray-800">
              {p.phone && <div>{p.phone}</div>}
              {p.email && <div className="text-gray-600">{p.email}</div>}
              {p.address && (
                <div className="text-gray-500 text-xs mt-1">{p.address}</div>
              )}
            </td>

            {/* Actions */}
            <td className="p-2">
              <Dropdown
                trigger={({ toggle }) => (
                  <button
                    onClick={toggle}
                    className="px-6 text-xl text-gray-800 hover:text-black"
                  >
                    ⋮
                  </button>
                )}
              >
                <button
                  onClick={() => onView(p)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  View
                </button>
                <button
                  onClick={() => onEdit(p)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(p)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                >
                  Delete
                </button>
              </Dropdown>
            </td>
          </tr>
        ))}

        {patients.length === 0 && (
          <tr>
            <td
              colSpan={6}
              className="p-4 text-center text-sm text-gray-500 border-t"
            >
              No patients found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default PatientsTable;
