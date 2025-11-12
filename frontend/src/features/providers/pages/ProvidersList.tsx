import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import Skeleton from "../../../components/Skeleton";
import Dropdown from "../../../components/ui/Dropdown";

interface Provider {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialty?: string;
  profile_picture?: string;
}

const ProvidersList: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const res = await API.get("/providers/");

        // Normalize the response
        const data = res.data;
        const providerArray = Array.isArray(data) ? data : data.results || [];
        setProviders(providerArray);
      } catch (error) {
        console.error("Error fetching providers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this provider?"))
      return;
    setDeletingId(id);
    try {
      await API.delete(`/providers/${id}/`);
      setProviders((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting provider:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full mb-2" />
      </div>
    );
  }

  if (!providers.length) {
    return <p className="p-6 text-gray-600">No providers found.</p>;
  }

  return (
    <div className="p-6">
      {/* Header + Add button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Providers</h1>
        <button
          onClick={() => navigate("/doctor/manage-users/providers/new")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          + Add Provider
        </button>
      </div>

      {/* Providers Table */}
      <table className="w-full border border-gray-200 rounded-md overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Photo</th>
            <th className="p-2">Name</th>
            <th className="p-2">Specialty</th>
            <th className="p-2">Contact</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => (
            <tr key={p.id} className="border-t hover:bg-gray-50">
              <td className="p-2">
                <img
                  src={p.profile_picture || "/images/provider-placeholder.png"}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </td>
              <td
                className="p-2 text-blue-600 cursor-pointer hover:underline"
                onClick={() =>
                  navigate(`/doctor/manage-users/providers/${p.id}`)
                }
              >
                {p.first_name} {p.last_name}
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
                      className="px-2 text-gray-600 hover:text-black"
                    >
                      ⋮
                    </button>
                  )}
                >
                  <button
                    onClick={() =>
                      navigate(
                        `/doctor/manage-users/providers/${p.id}?edit=true`
                      )
                    }
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    {deletingId === p.id ? "Deleting…" : "Delete"}
                  </button>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProvidersList;
