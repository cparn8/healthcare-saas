import React from "react";
import { Link } from "react-router-dom";
import X from "lucide-react/dist/esm/icons/x";
import { formatDisplayDate as formatDate } from "../../../../utils/dateUtils";

export interface ViewPatient {
  id: number;
  first_name: string;
  last_name: string;
  prn: string;
  date_of_birth: string;
  gender?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  profile_picture?: string | null;
}

interface ViewPatientModalProps {
  patient: ViewPatient;
  onClose: () => void;
  onEdit: () => void;
}

const ViewPatientModal: React.FC<ViewPatientModalProps> = ({
  patient,
  onClose,
  onEdit,
}) => {
  const fullName = `${patient.first_name} ${patient.last_name}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-auto mx-4 my-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Patient Info</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="flex items-center gap-6 m-auto flex-wrap">
            <div className="space-y-1 justify-center text-center">
              <img
                src={
                  patient.profile_picture || "/images/patient-placeholder.png"
                }
                alt="profile"
                className="w-24 h-24 rounded-full object-cover shadow justify-center m-auto"
              />

              <p className="text-lg font-semibold whitespace-nowrap">
                {fullName}
              </p>
            </div>
            <div className="space-y-1 pr-2">
              <p className="text-sm pb-2 whitespace-nowrap">
                PRN: <span className="text-gray-600">{patient.prn}</span>
              </p>
              {patient.gender && (
                <p className="text-sm pb-2 whitespace-nowrap">
                  Gender:{" "}
                  <span className="text-gray-600">{patient.gender}</span>
                </p>
              )}

              <div>
                <p className="text-sm font-medium whitespace-nowrap">
                  Date of Birth:
                </p>
                <p className="text-gray-800 whitespace-nowrap">
                  {patient.date_of_birth
                    ? formatDate(patient.date_of_birth)
                    : "—"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Contact:</p>
              <div className="text-gray-800 pb-2 whitespace-nowrap">
                {patient.phone && <p>{patient.phone}</p>}
                {patient.email && <p>{patient.email}</p>}
              </div>

              {patient.address && (
                <div>
                  <p className="text-sm font-medium whitespace-nowrap">
                    Address:
                  </p>
                  <p className="text-gray-800 whitespace-nowrap">
                    {patient.address}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 border-t bg-gray-50">
          <Link
            to={`/doctor/charts/${patient.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            View Chart →
          </Link>

          <button
            onClick={onEdit}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            Edit Patient
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPatientModal;
