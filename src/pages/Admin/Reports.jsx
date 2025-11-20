import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const Reports = () => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Generate Reports</h2>
            <p className="text-gray-600">Reports and analytics dashboard goes here...</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
