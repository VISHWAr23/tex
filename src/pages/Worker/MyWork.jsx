import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const MyWork = () => {
  const dummyTasks = [
    { id: 1, title: 'Stitch 10 shirts', status: 'In Progress', deadline: '2024-01-20' },
    { id: 2, title: 'Repair 5 pants', status: 'Completed', deadline: '2024-01-18' },
    { id: 3, title: 'Alter 3 dresses', status: 'Pending', deadline: '2024-01-22' },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <h1 className="text-3xl font-bold mb-6">My Work</h1>

          <div className="grid gap-4">
            {dummyTasks.map((task) => (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-500">Deadline: {task.deadline}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyWork;