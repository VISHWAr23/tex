import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Workers</h3>
              <p className="text-3xl font-bold text-blue-600">24</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Active Projects</h3>
              <p className="text-3xl font-bold text-green-600">12</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Monthly Revenue</h3>
              <p className="text-3xl font-bold text-purple-600">₹45,000</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Pending Orders</h3>
              <p className="text-3xl font-bold text-orange-600">8</p>
            </div>
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <p className="text-gray-600">Dashboard content goes here...</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;