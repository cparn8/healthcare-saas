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
      <div className="bg-bg dark:bg-bg-dark rounded-lg shadow-xl w-auto mx-4 my-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg dark:border-bg-dark">
          <h2 className="text-xl font-semibold">Patient Info</h2>
          <button
            onClick={onClose}
            className="text-text-muted dark:text-text-darkMuted hover:text-text-primary dark:text-text-darkPrimary transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-2">
          <div className="flex items-center gap-6 m-auto flex-wrap">
            <div className="space-y-1 justify-center text-center">
              <img
                src={
                  patient.profile_picture || "/images/patient-placeholder.png"
                }
                alt="profile"
                className="w-20 h-20 rounded-full object-cover shadow justify-center m-auto"
              />

              <p className="text-lg font-semibold whitespace-nowrap text-text-primary dark:text-text-darkPrimary">
                {fullName}
              </p>
            </div>
            <div className="space-y-1 pr-2">
              {patient.gender && (
                <div>
                  <p className="text-sm whitespace-nowrap text-text-secondary dark:text-text-darkSecondary">
                    Gender:
                  </p>
                  <div></div>
                  <p className="text-text-primary dark:text-text-darkPrimary">
                    {patient.gender}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm whitespace-nowrap text-text-secondary dark:text-text-darkSecondary">
                  PRN:
                </p>
                <div></div>
                <p className="text-text-primary dark:text-text-darkPrimary">
                  {patient.prn}
                </p>
              </div>
            </div>

            <div className="space-y-1 pr-2">
              <div>
                <p className="text-sm font-medium whitespace-nowrap text-text-secondary dark:text-text-darkSecondary">
                  Date of Birth:
                </p>
                <p className="text-text-primary dark:text-text-darkPrimary whitespace-nowrap">
                  {patient.date_of_birth
                    ? formatDate(patient.date_of_birth)
                    : "—"}
                </p>
              </div>
              <p className="text-sm font-medium text-text-secondary dark:text-text-darkSecondary">
                Phone:
              </p>
              <div className="text-text-primary dark:text-text-darkPrimary whitespace-nowrap">
                {patient.phone && <p>{patient.phone}</p>}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-text-secondary dark:text-text-darkSecondary">
                Email:
              </p>
              <div className="text-text-primary dark:text-text-darkPrimary pb-2 whitespace-nowrap">
                {patient.email && <p>{patient.email}</p>}
              </div>

              {patient.address && (
                <div>
                  <p className="text-sm font-medium whitespace-nowrap text-text-secondary dark:text-text-darkSecondary">
                    Address:
                  </p>
                  <p className="text-text-primary dark:text-text-darkPrimary whitespace-nowrap">
                    {patient.address}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 border-t border-bg dark:border-bg-dark">
          <Link
            to={`/doctor/charts/${patient.id}`}
            className="px-4 py-2 bg-primary text-input-lighter rounded hover:bg-primary-hover transition"
          >
            View Chart →
          </Link>

          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-yellow-500 text-input-lighter rounded hover:bg-yellow-600 transition"
            >
              Edit Patient
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-side dark:bg-dButton-mbg border border-mBorder dark:border-dButton-mborder text-text-primary dark:text-text-darkPrimary hover:bg-top hover:dark:bg-dButton-mhover transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPatientModal;
