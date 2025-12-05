import React, { useState } from "react";
import X from "lucide-react/dist/esm/icons/x";
import { useNavigate } from "react-router-dom";

import { createPatient } from "../../services/patients";
import PatientForm, { PatientFormData } from "../forms/PatientForm";
import { normalizeDRFErrors } from "../../../../utils/apiErrors";
import { toastSuccess, toastError } from "../../../../utils/toastUtils";

interface AddPatientModalProps {
  onClose: () => void;
  onAdded: (patient: any) => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({
  onClose,
  onAdded,
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PatientFormData>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    try {
      const newPatient = await createPatient(formData);

      toastSuccess("Patient created successfully.");
      onAdded(newPatient);

      // Preserve existing schedule prefill behavior (Option B)
      const prefillSlot = sessionStorage.getItem("prefillSlot");
      if (prefillSlot) {
        sessionStorage.setItem("pendingSlot", prefillSlot);
        sessionStorage.removeItem("prefillSlot");
      }

      sessionStorage.setItem("newPatient", JSON.stringify(newPatient));

      if (prefillSlot) {
        navigate(`/doctor/schedule?newPatientId=${newPatient.id}`);
      }

      onClose();
    } catch (err: any) {
      const drf = err?.response?.data;
      if (drf) {
        setErrors(normalizeDRFErrors(drf));
      } else {
        toastError("Failed to create patient.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 my-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Add New Patient</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <PatientForm
            initialValues={{}}
            errors={errors}
            onChange={setFormData}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded text-white transition ${
              isSaving
                ? "bg-gray-400 cursor-wait"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSaving ? "Saving…" : "Save Patient"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPatientModal;
