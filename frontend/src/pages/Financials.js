import React, { useEffect, useState } from "react";
import axios from "axios";

const Financials = () => {
    const [financials, setFinancials] = useState([]);

    useEffect(() => {
        const fetchFinancials = async () => {
            try {
                const res = await axios.get("/api/finance");
                setFinancials(res.data);
            } catch (error) {
                console.error("Error fetching financial records", error);
            }
        };

        fetchFinancials();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Financial Records</h1>
            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-xl">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="p-2">Customer</th>
                            <th className="p-2">Total Amount</th>
                            <th className="p-2">Paid Amount</th>
                            <th className="p-2">Pending Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {financials.map((record) => (
                            <tr key={record._id} className="border-b dark:border-gray-600">
                                <td className="p-2">{record.customer?.name || "N/A"}</td>
                                <td className="p-2">${record.totalAmount}</td>
                                <td className="p-2">${record.paidAmount}</td>
                                <td className="p-2 text-red-500">${record.pendingAmount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Financials;
