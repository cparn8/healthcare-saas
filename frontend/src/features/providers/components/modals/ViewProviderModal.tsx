// frontend/src/features/providers/components/modals/ViewProviderModal.tsx

import React from "react";
import X from "lucide-react/dist/esm/icons/x";
import { Provider } from "../../services/providersApi";

interface ViewProviderModalProps {
  open: boolean;
  provider: Provider | null;
  currentProvider: Provider | null;
  onClose: () => void;
  onEdit: (provider: Provider) => void;
  onChangePassword: (target: Provider) => void;
}

const ViewProviderModal: React.FC<ViewProviderModalProps> = ({
  open,
  provider,
  currentProvider,
  onClose,
  onEdit,
  onChangePassword,
}) => {
  if (!open || !provider) return null;

  const isAdmin =
    !!currentProvider &&
    !!(
      currentProvider.is_admin === true ||
      currentProvider.is_staff === true ||
      currentProvider.is_superuser === true
    );

  const isSelf = !!currentProvider && currentProvider.id === provider.id;
  const canEdit = isAdmin || isSelf;
  const canChangePassword = canEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-bg dark:bg-bg-dark rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg dark:border-bg-dark">
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-darkPrimary">
            Provider Info
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted dark:text-text-darkMuted hover:text-text-primary dark:text-text-darkPrimary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-2">
          <div className="flex items-center gap-6 m-auto flex-wrap">
            <div className="space-y-1 justify-center text-center">
              <img
                src={
                  provider.profile_picture || "/images/provider-placeholder.png"
                }
                alt="profile"
                className="w-20 h-20 rounded-full object-cover shadow justify-center m-auto"
              />

              <p className="text-lg font-semibold whitespace-nowrap text-text-primary dark:text-text-darkPrimary">
                {provider.first_name} {provider.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary dark:text-text-darkSecondary">
                Specialty:
              </p>
              <div className="text-base font-medium text-text-primary dark:text-text-darkPrimary pb-2 whitespace-nowrap">
                {provider.specialty && <p>{provider.specialty}</p>}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary dark:text-text-darkSecondary">
                Phone:
              </p>
              <div className="text-text-primary dark:text-text-darkPrimary pb-2 whitespace-nowrap">
                {provider.phone && <p>{provider.phone}</p>}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary dark:text-text-darkSecondary">
                Email:
              </p>
              <div className="text-text-primary dark:text-text-darkPrimary pb-2 whitespace-nowrap">
                {provider.email && <p>{provider.email}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-bg dark:border-bg-dark">
          <div className="flex gap-2">
            {canChangePassword && (
              <button
                onClick={() => onChangePassword(provider)}
                className="px-3 py-2 text-sm rounded bg-primary text-white hover:bg-primary-hover"
              >
                Change Password
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={() => {
                  onEdit(provider);
                  onClose();
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </button>
            )}

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

export default ViewProviderModal;
