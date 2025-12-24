// frontend/src/features/settings/pages/SettingsPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentProvider } from "../../providers/hooks/useCurrentProvider";
import AppointmentTypesModal from "../components/AppointmentTypesModal";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentProvider();
  const [appointmentTypesOpen, setAppointmentTypesOpen] = useState(false);

  const handleOpenBusinessSettings = () => {
    if (!isAdmin) return;
    navigate("/doctor/settings/business");
  };

  const handleOpenAppointmentTypes = () => {
    if (!isAdmin) return;
    setAppointmentTypesOpen(true);
  };

  return (
    <div className="p-6 space-y-6 bg-bg dark:bg-bg-dark text-text-primary dark:text-text-darkPrimary min-h-full">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-text-secondary dark:text-text-darkSecondary mt-1">
          Configure users, business settings, appointment types, and demo data.
        </p>
      </div>

      {/* Grid of settings cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Management */}
        <section className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-darkPrimary">
                User Management
              </h2>
              <p className="text-sm text-text-secondary dark:text-text-darkSecondary mt-1">
                Manage patients and providers.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button
              type="button"
              onClick={() => navigate("/doctor/manage-users/patients")}
              className="w-full inline-flex items-center justify-between bg-bg dark:bg-dButton px-4 py-2 rounded-lg border border-border dark:border-dButton-border hover:border-primary-light hover:bg-primary-lighter hover:dark:bg-primary-dlight text-sm font-medium text-text-primary dark:text-text-darkPrimary transition"
            >
              <span>Manage Patients</span>
              <span className="text-xs text-text-secondary dark:text-text-darkSecondary">
                View & edit
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/doctor/manage-users/providers")}
              className="w-full inline-flex items-center justify-between bg-bg dark:bg-dButton px-4 py-2 rounded-lg border border-border dark:border-dButton-border hover:border-primary-light hover:bg-primary-lighter hover:dark:bg-primary-dlight text-sm font-medium text-text-primary dark:text-text-darkPrimary transition"
            >
              <span>Manage Providers</span>
              <span className="text-xs text-text-secondary dark:text-text-darkSecondary">
                Profiles & access
              </span>
            </button>
          </div>
        </section>

        {/* Business & Locations */}
        <section className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-darkPrimary">
                Business & Locations
              </h2>
              <p className="text-sm text-text-secondary dark:text-text-darkSecondary mt-1">
                View & edit business name, locations, and office hours.
              </p>
            </div>
            {isAdmin ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-grncon-light text-text-primary border border-grncon-hover">
                Admin
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                Admin only
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenBusinessSettings}
            disabled={!isAdmin}
            className={`mt-2 inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition ${
              isAdmin
                ? "bg-primary text-input-lighter hover:bg-primary-hover"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Open Business Settings
          </button>
        </section>

        {/* Appointment Types */}
        <section className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-darkPrimary">
                Appointment Types
              </h2>
              <p className="text-sm text-text-secondary dark:text-text-darkSecondary mt-1">
                Configure appointment types, colors, and suggested durations.
              </p>
            </div>
            {isAdmin ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-grncon-light text-text-primary border border-grncon-hover">
                Admin
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                Admin only
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenAppointmentTypes}
            disabled={!isAdmin}
            className={`mt-2 inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition ${
              isAdmin
                ? "bg-primary text-input-lighter hover:bg-primary-hover"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Manage Appointment Types
          </button>
        </section>

        {/* Demo Data Reset (placeholder) */}
        <section className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold">Demo Data</h2>
          <p className="text-sm text-text-secondary dark:text-text-darkSecondary mt-1">
            Reset the application to its original demo state.
          </p>

          <button
            disabled
            className="mt-4 w-full px-4 py-2 rounded-lg border border-dashed border-border dark:border-dButton-border text-sm text-text-muted dark:text-text-darkMuted cursor-not-allowed"
          >
            Reset Demo Data (Coming Soon)
          </button>

          <p className="text-xs text-text-muted dark:text-text-darkMuted mt-2">
            This will eventually delete and recreate demo providers, patients,
            locations, appointments, and types.
          </p>
        </section>
      </div>
      {appointmentTypesOpen && (
        <AppointmentTypesModal
          open={appointmentTypesOpen}
          onClose={() => setAppointmentTypesOpen(false)}
          onSaved={() => {
            setAppointmentTypesOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default SettingsPage;
