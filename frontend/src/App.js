import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import ChartComponent from "./components/ChartComponent"; // ✅ Importing ChartComponent
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        <div className="content">
          <h1>CRM Dashboard</h1> {/* ✅ Added heading */}
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Dashboard />
                  <ChartComponent /> {/* ✅ Only on Dashboard */}
                </>
              }
            />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/products" element={<Products />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} /> {/* ✅ Handle unknown routes */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
