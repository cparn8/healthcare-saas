import React from "react";
import Dropdown from "../../../../components/ui/Dropdown";
import { Provider } from "../../services/providersApi";

interface ProvidersTableProps {
  providers: Provider[];
  loading: boolean;
  deletingId: number | null;
  onOpenProfile: (p: Provider) => void;
  onEditProvider: (p: Provider) => void;
  onOpenPasswordModal: (p: Provider) => void;
  onRequestDelete: (p: Provider) => void;
  canEdit: (p: Provider) => boolean;
  canDelete: (p: Provider) => boolean;
  canChangePassword: (p: Provider) => boolean;
}

/**
 * UI-only table component.
 * No RBAC, no modal state, no API calls.
 * All logic is delegated upward to ProvidersList.
 */
const ProvidersTable: React.FC<ProvidersTableProps> = ({
  providers,
  loading,
  deletingId,
  onOpenProfile,
  onEditProvider,
  onOpenPasswordModal,
  onRequestDelete,
  canEdit,
  canDelete,
  canChangePassword,
}) => {
  return (
    <table className="w-full">
      <thead>
        <tr className="text-left text-text-primary dark:text-text-darkPrimary">
          <th className="py-2 pr-2 pl-12">Photo</th>
          <th className="p-2">Name</th>
          <th className="p-2">Specialty</th>
          <th className="p-2">Contact</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {providers.length === 0 && !loading ? (
          <tr>
            <td colSpan={5} className="p-4 text-center text-gray-500">
              No providers found.
            </td>
          </tr>
        ) : (
          providers.map((p) => (
            <tr
              key={p.id}
              className="border-t border-border dark:border-border-dark hover:bg-surface-hover hover:dark:bg-surface-dhover align-middle"
            >
              <td className="py-2 pr-2 pl-12">
                <img
                  src={p.profile_picture || "/images/provider-placeholder.png"}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </td>

              <td className="p-2 ">
                <button type="button" onClick={() => onOpenProfile(p)}>
                  <div className="text-text-primary dark:text-text-darkPrimary hover:underline">
                    {p.first_name} {p.last_name}
                  </div>
                </button>
              </td>

              <td className="p-2 text-text-primary dark:text-text-darkPrimary">
                {p.specialty || "—"}
              </td>

              <td className="p-2">
                <div className="text-text-primary dark:text-text-darkPrimary">
                  {p.phone}
                </div>
                <br />
                <small className="text-text-muted dark:text-text-darkMuted">
                  {p.email}
                </small>
              </td>

              <td className="p-2">
                <Dropdown
                  trigger={({ toggle }) => (
                    <button
                      onClick={toggle}
                      className="px-6 text-xl text-text-muted dark:text-text-darkMuted hover:text-text-primary dark:text-text-darkPrimary"
                    >
                      ⋮
                    </button>
                  )}
                  align="right"
                >
                  {/* View */}
                  <button
                    onClick={() => onOpenProfile(p)}
                    className="block w-full text-left px-4 py-2 bg-side dark:bg-side-dark hover:bg-top dark:hover:bg-top-dark text-sm"
                  >
                    View Profile
                  </button>

                  {/* Edit */}
                  {canEdit(p) && (
                    <button
                      onClick={() => onEditProvider(p)}
                      className="block w-full text-left px-4 py-2 bg-side dark:bg-side-dark hover:bg-top dark:hover:bg-top-dark text-sm"
                    >
                      Edit Profile
                    </button>
                  )}

                  {/* Change Password */}
                  {canChangePassword(p) && (
                    <button
                      onClick={() => onOpenPasswordModal(p)}
                      className="block w-full text-left px-4 py-2 bg-side dark:bg-side-dark hover:bg-top dark:hover:bg-top-dark text-sm"
                    >
                      Change Password
                    </button>
                  )}

                  {/* Delete */}
                  {canDelete(p) && (
                    <button
                      onClick={() => onRequestDelete(p)}
                      disabled={deletingId === p.id}
                      className="block w-full text-left px-4 py-2 bg-side dark:bg-side-dark hover:bg-top dark:hover:bg-top-dark text-sm text-reddel"
                    >
                      {deletingId === p.id ? "Deleting…" : "Delete"}
                    </button>
                  )}
                </Dropdown>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default ProvidersTable;
