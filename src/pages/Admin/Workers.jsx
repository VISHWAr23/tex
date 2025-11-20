import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const Workers = () => {
  const dummyWorkers = [
    { id: 1, name: 'John Doe', role: 'Tailor', status: 'Active' },
    { id: 2, name: 'Jane Smith', role: 'Designer', status: 'Active' },
    { id: 3, name: 'Mike Johnson', role: 'Cutter', status: 'On Leave' },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Workers Management</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Add Worker
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dummyWorkers.map((worker) => (
                  <tr key={worker.id}>
                    <td className="px-6 py-4">{worker.id}</td>
                    <td className="px-6 py-4">{worker.name}</td>
                    <td className="px-6 py-4">{worker.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        worker.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {worker.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:underline mr-3">Edit</button>
                      <button className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Workers;
