import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';

const MyProfile = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="space-y-4">
              <div>
                <label className="text-gray-500 text-sm">Name</label>
                <p className="text-lg font-semibold">{user?.name}</p>
              </div>
              
              <div>
                <label className="text-gray-500 text-sm">Email</label>
                <p className="text-lg font-semibold">{user?.email}</p>
              </div>
              
              <div>
                <label className="text-gray-500 text-sm">Role</label>
                <p className="text-lg font-semibold capitalize">{user?.role}</p>
              </div>

              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Edit Profile
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyProfile;