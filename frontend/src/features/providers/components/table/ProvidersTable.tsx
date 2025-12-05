import React from "react";
import Dropdown from "../../../../components/ui/Dropdown";
import { Provider } from "../../services/providersApi";

interface ProvidersTableProps {
  providers: Provider[];
  loading: boolean;
  deletingId: number | null;
  onOpenProfile: (p: Provider) => void;
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
  onOpenPasswordModal,
  onRequestDelete,
  canEdit,
  canDelete,
  canChangePassword,
}) => {
  return (
    <table className="w-full">
      <thead>
        <tr className="text-left">
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
            <tr key={p.id} className="border-t hover:bg-gray-100 align-middle">
              <td className="py-2 pr-2 pl-12">
                <img
                  src={p.profile_picture || "/images/provider-placeholder.png"}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </td>

              <td className="p-2 ">
                <button type="button" onClick={() => onOpenProfile(p)}>
                  <div className="hover:underline">
                    {p.first_name} {p.last_name}
                  </div>
                </button>
              </td>

              <td className="p-2">{p.specialty || "—"}</td>

              <td className="p-2">
                {p.phone}
                <br />
                <small className="text-gray-500">{p.email}</small>
              </td>

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
                  align="right"
                >
                  {/* View */}
                  <button
                    onClick={() => onOpenProfile(p)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    View Profile
                  </button>

                  {/* Edit */}
                  {canEdit(p) && (
                    <button
                      onClick={() => onOpenProfile(p)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Edit Profile
                    </button>
                  )}

                  {/* Change Password */}
                  {canChangePassword(p) && (
                    <button
                      onClick={() => onOpenPasswordModal(p)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Change Password
                    </button>
                  )}

                  {/* Delete */}
                  {canDelete(p) && (
                    <button
                      onClick={() => onRequestDelete(p)}
                      disabled={deletingId === p.id}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
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
