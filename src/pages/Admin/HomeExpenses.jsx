import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const HomeExpenses = () => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Home Expenses</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Add Expense
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">Home expenses tracking goes here...</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeExpenses;