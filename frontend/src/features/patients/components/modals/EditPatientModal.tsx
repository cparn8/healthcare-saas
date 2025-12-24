import React, { useEffect, useState } from "react";
import X from "lucide-react/dist/esm/icons/x";
import Trash from "lucide-react/dist/esm/icons/trash";

import PatientForm, { PatientFormData } from "../forms/PatientForm";
import {
  getPatient,
  updatePatient,
  deletePatient,
} from "../../services/patients";
import { normalizeDRFErrors } from "../../../../utils/apiErrors";
import { toastSuccess, toastError } from "../../../../utils/toastUtils";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";

interface EditPatientModalProps {
  patientId: number;
  onClose: () => void;
  onUpdated: (patient: any) => void;
  onDeleted: (id: number) => void;
}

const EditPatientModal: React.FC<EditPatientModalProps> = ({
  patientId,
  onClose,
  onUpdated,
  onDeleted,
}) => {
  const [formData, setFormData] = useState<PatientFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const patient = await getPatient(patientId);
        if (!active) return;
        setFormData({
          first_name: patient.first_name ?? "",
          last_name: patient.last_name ?? "",
          date_of_birth: patient.date_of_birth ?? "",
          gender: patient.gender ?? "",
          email: patient.email ?? "",
          phone: patient.phone ?? "",
          address: patient.address ?? "",
        });
      } catch (err) {
        console.error("Failed to load patient", err);
        toastError("Failed to load patient.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [patientId]);

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    setErrors({});

    try {
      const updated = await updatePatient(patientId, formData);
      toastSuccess("Patient updated successfully.");
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      const drf = err?.response?.data;
      if (drf) {
        setErrors(normalizeDRFErrors(drf));
      } else {
        toastError("Failed to update patient.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    setIsDeleting(true);
    try {
      await deletePatient(patientId);
      toastSuccess("Patient deleted.");
      onDeleted(patientId);
      onClose();
    } catch (err) {
      console.error(err);
      toastError("Failed to delete patient.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="bg-bg dark:bg-bg-dark rounded-lg shadow-xl px-6 py-4">
          <p className="text-text-primary dark:text-text-darkPrimary">
            Loading patient…
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center overflow-y-auto">
        <div className="bg-bg dark:bg-bg-dark rounded-lg shadow-xl w-full max-w-lg mx-4 my-10">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-bg dark:border-bg-dark">
            <h2 className="text-lg font-semibold">Edit Patient</h2>
            <button
              onClick={onClose}
              className="text-text-muted dark:text-text-darkMuted hover:text-text-primary dark:text-text-darkPrimary"
            >
              <X size={22} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <PatientForm
              initialValues={formData}
              errors={errors}
              onChange={setFormData}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-bg dark:border-bg-dark">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isDeleting}
              className={`flex items-center gap-2 px-4 py-2 rounded text-input-lighter transition ${
                isDeleting
                  ? "bg-top dark:bg-top-dark cursor-wait"
                  : "bg-reddel hover:bg-reddel-dark"
              }`}
            >
              <Trash size={16} />
              {isDeleting ? "Deleting…" : "Delete"}
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 rounded text-input-lighter transition ${
                isSaving
                  ? "bg-top dark:bg-top-dark cursor-wait"
                  : "bg-grncon hover:bg-grncon-hover"
              }`}
            >
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Delete Patient"
        message="Are you sure you want to delete this patient?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};

export default EditPatientModal;
