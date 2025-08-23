// src/components/Layout/Layout.jsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Dashboard from "../../pages/Dashboard";
import Doctors from "../../pages/Doctors";
import Medicines from "../../pages/Medicines";
// import Sales from "../../pages/Sales";
// import Settings from "../../pages/Settings";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/medicines" element={<Medicines />} />
            {/* <Route path="/sales" element={<Sales />} />
            <Route path="/settings" element={<Settings />} /> */}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Layout;
