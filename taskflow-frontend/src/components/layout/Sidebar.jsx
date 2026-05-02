import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        <span className="text-2xl font-bold">TaskFlow</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <Link to="/" className="block px-4 py-2 rounded hover:bg-gray-700">Dashboard</Link>
        <Link to="/projects" className="block px-4 py-2 rounded hover:bg-gray-700">Projects</Link>
        <Link to="/tasks" className="block px-4 py-2 rounded hover:bg-gray-700">Tasks</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
