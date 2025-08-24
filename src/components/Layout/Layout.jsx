// src/components/Layout/Layout.jsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Dashboard from "../../pages/Dashboard";
import Statistics from "../../pages/Statistics";
import Doctors from "../../pages/Doctors";
import Suppliers from "../../pages/Suppliers";
import Products from "../../pages/Products";
import Medicines from "../../pages/Medicines";
import Sales from "../../pages/Sales";
// import Reports from "../../pages/Reports";
// import Analytics from "../../pages/Analytics";
import Settings from "../../pages/Settings";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
            {/* <Route path="/statistics" element={<Statistics />} /> */}
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/sales" element={<Sales />} />
            {/* <Route path="/reports" element={<Reports />} /> */}
            {/* <Route path="/analytics" element={<Analytics />} /> */}
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Layout;
