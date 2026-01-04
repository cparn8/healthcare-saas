// frontend/src/features/settings/pages/SettingsPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentProvider } from "../../providers/hooks/useCurrentProvider";
import AppointmentTypesModal from "../components/AppointmentTypesModal";
import API from "../../../services/api";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentProvider();
  const [appointmentTypesOpen, setAppointmentTypesOpen] = useState(false);
  const [demoConfirmOpen, setDemoConfirmOpen] = useState(false);
  const [demoResetting, setDemoResetting] = useState(false);

  const handleOpenBusinessSettings = () => {
    if (!isAdmin) return;
    navigate("/doctor/settings/business");
  };

  const handleOpenAppointmentTypes = () => {
    if (!isAdmin) return;
    setAppointmentTypesOpen(true);
  };

  const handleResetDemo = async () => {
    try {
      setDemoResetting(true);
      await API.post("demo/reset/");
      setDemoConfirmOpen(false);
      // simplest deterministic refresh to reload schedule + lists
      window.location.reload();
    } catch (err) {
      console.error("Demo reset failed:", err);
      setDemoResetting(false);
      setDemoConfirmOpen(false);
      // If you have a toast util, swap this for a toast
      alert("Demo reset failed. Check server logs for details.");
    }
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

        {/* Demo Data Reset */}
        <section className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold">Demo Data</h2>
          <p className="text-sm text-text-secondary dark:text-text-darkSecondary mt-1">
            Reset the application to its original demo state.
          </p>

          {!isAdmin ? (
            <div className="mt-4 text-xs text-text-muted dark:text-text-darkMuted">
              Admin only.
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setDemoConfirmOpen(true)}
                className="mt-4 w-full px-4 py-2 rounded-lg text-sm font-medium transition bg-primary text-input-lighter hover:bg-primary-hover"
              >
                Reset Demo Data
              </button>

              <p className="text-xs text-text-muted dark:text-text-darkMuted mt-2">
                This will delete and recreate demo providers, patients,
                locations, appointments, and types.
              </p>
            </>
          )}

          {/* Local confirm modal (avoids relying on unknown ConfirmDialog props) */}
          {demoConfirmOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-lg p-5">
                <h3 className="text-lg font-semibold">Reset demo data?</h3>
                <p className="mt-2 text-sm text-text-secondary dark:text-text-darkSecondary">
                  This action will delete all appointments, patients, providers,
                  locations, and appointment types, then recreate a
                  deterministic demo dataset.
                </p>

                <div className="mt-4 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setDemoConfirmOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-border dark:border-dButton-border bg-bg dark:bg-dButton hover:border-primary-light hover:bg-primary-lighter hover:dark:bg-primary-dlight transition"
                    disabled={demoResetting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      demoResetting
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-primary text-input-lighter hover:bg-primary-hover"
                    }`}
                    disabled={demoResetting}
                  >
                    {demoResetting ? "Resetting..." : "Confirm Reset"}
                  </button>
                </div>
              </div>
            </div>
          )}
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
