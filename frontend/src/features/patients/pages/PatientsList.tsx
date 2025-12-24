import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePatient } from "../services/patients";
import { usePatientsList, Patient } from "../hooks/usePatientsList";
import PatientsTable from "../components/table/PatientsTable";
import AddPatientModal from "../components/modals/AddPatientModal";
import EditPatientModal from "../components/modals/EditPatientModal";
import ViewPatientModal from "../components/modals/ViewPatientModal";
import { toastError, toastSuccess } from "../../../utils/toastUtils";

const PatientsList: React.FC = () => {
  const navigate = useNavigate();
  const {
    patients,
    loading,
    error,
    search,
    setSearch,
    addLocal,
    updateLocal,
    removeLocal,
  } = usePatientsList();

  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const handleDelete = async (patient: Patient) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${patient.first_name} ${patient.last_name}?`
    );
    if (!confirmed) return;

    try {
      await deletePatient(patient.id);
      removeLocal(patient.id);
      toastSuccess("Patient deleted.");
    } catch (err) {
      console.error(err);
      toastError("Failed to delete patient.");
    }
  };

  return (
    <div className="p-6">
      {/* Back */}
      <button
        onClick={() => navigate("/doctor/settings")}
        className="mb-4 text-sm inline-flex items-center bg-primary border border-primary px-3 py-1.5 rounded-md text-text-darkPrimary hover:bg-primary-hover"
      >
        ← Back to Settings
      </button>
      {/* Header: Search + Add */}
      <h1 className="text-xl text-text-primary dark:text-text-darkPrimary font-bold mb-4">
        Patients
      </h1>
      <div className="flex justify-between items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Search patients by name or PRN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-border dark:border-input-dborder bg-input-lighter dark:bg-input-dlight p-2 w-full max-w-md rounded"
        />
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-grncon text-input-lighter rounded hover:bg-grncon-hover transition"
        >
          + Add Patient
        </button>
      </div>

      {loading && (
        <p className="text-sm text-text-muted dark:text-text-darkMuted mb-2">
          Loading patients…
        </p>
      )}
      {error && <p className="text-sm text-reddel mb-2">{error}</p>}

      {/* Table */}

      <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg shadow-sm overflow-visible">
        <PatientsTable
          patients={patients}
          onView={(p) => setViewingPatient(p)}
          onEdit={(p) => setEditingPatient(p)}
          onDelete={handleDelete}
        />
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddPatientModal
          onClose={() => setShowAddModal(false)}
          onAdded={(p) => addLocal(p)}
        />
      )}

      {viewingPatient && (
        <ViewPatientModal
          patient={viewingPatient}
          onClose={() => setViewingPatient(null)}
          onEdit={() => {
            setEditingPatient(viewingPatient);
            setViewingPatient(null);
          }}
        />
      )}

      {editingPatient && (
        <EditPatientModal
          patientId={editingPatient.id}
          onClose={() => setEditingPatient(null)}
          onUpdated={(p) => updateLocal(p)}
          onDeleted={(id) => removeLocal(id)}
        />
      )}
    </div>
  );
};

export default PatientsList;
