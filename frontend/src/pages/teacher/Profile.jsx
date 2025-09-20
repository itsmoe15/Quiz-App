import { useEffect, useState } from "react";
import { getUser, updateUser } from "../../services/authService";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await getUser();
      setUser(res);
      setName(res.name);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const updated = await updateUser({ name });
      setUser(updated);
      alert("Profile updated");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="p-6 max-w-md">
      <h2 className="text-xl font-bold mb-4">Profile</h2>
      <div className="mb-3">
        <label className="block mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <button
        onClick={handleUpdate}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Save
      </button>
    </div>
  );
}
نعم