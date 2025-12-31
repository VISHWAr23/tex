import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { isAdmin, isWorker } = useAuth();

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/daily-work', label: 'Daily Work' },
    { path: '/admin/attendance', label: 'Attendance' },
    { path: '/admin/workers', label: 'Workers' },
    { path: '/admin/materials', label: 'Materials' },
    { path: '/admin/finance', label: 'Finance' },
    { path: '/admin/home-expenses', label: 'Home Expenses' },
    { path: '/admin/reports', label: 'Reports' },
  ];

  const workerLinks = [
    { path: '/worker/my-profile', label: 'My Profile' },
    { path: '/worker/my-work', label: 'My Work' },
    { path: '/worker/my-salary', label: 'My Salary' },
  ];

  const links = isAdmin ? adminLinks : isWorker ? workerLinks : [];

  // Hidden on small screens, visible from md up
  return (
    <aside className="hidden md:block bg-gray-800 text-white w-64 min-h-screen p-4">
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `block px-4 py-3 rounded transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
