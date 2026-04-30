import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <Sidebar onCollapse={() => setSidebarOpen(false)} />
      </div>
      <main className="flex-1 overflow-auto min-w-0">
        <Outlet context={{ sidebarOpen, setSidebarOpen }} />
      </main>
    </div>
  );
}
