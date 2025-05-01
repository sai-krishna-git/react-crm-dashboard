import React from "react";
import "./Reports.css";

const Reports = () => {
  const downloadCSV = () => {
    window.open("http://localhost:5000/api/reports/generate-csv-all", "_blank");
  };

  const downloadPDF = () => {
    window.open("http://localhost:5000/api/reports/generate-pdf-all", "_blank");
  };

  return (
    <div className="reports-container">
      <h2>Download Combined CRM Business Reports</h2>
      <p>Generate comprehensive reports for Users, Orders, and Products in CSV or PDF format.</p>
      <div className="report-buttons">
        <button className="report-btn" onClick={downloadCSV}>
          Download Combined CSV Report
        </button>
        <button className="report-btn" onClick={downloadPDF}>
          Download Combined PDF Report
        </button>
      </div>
    </div>
  );
};

export default Reports;
