import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const MySalary = () => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <h1 className="text-3xl font-bold mb-6">My Salary</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm mb-2">Current Month</h3>
              <p className="text-2xl font-bold text-blue-600">₹15,000</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm mb-2">Last Month</h3>
              <p className="text-2xl font-bold text-green-600">₹14,500</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm mb-2">Total Earned</h3>
              <p className="text-2xl font-bold text-purple-600">₹1,80,000</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Salary History</h2>
            <p className="text-gray-600">Salary records and payment history go here...</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MySalary;
