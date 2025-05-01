import { useState } from "react";

const customers = [
  { firstName: "Larsen", lastName: "Shaw", email: "abc@test.com", mobile: "555-555-5555" },
  { firstName: "Rosseta", lastName: "Wilson", email: "test1@test.com", mobile: "555-555-5555" },
  { firstName: "Michael", lastName: "Johnson", email: "michael@test.com", mobile: "555-555-1234" },
  { firstName: "Emily", lastName: "Davis", email: "emily@test.com", mobile: "555-555-5678" },
  { firstName: "James", lastName: "Brown", email: "james@test.com", mobile: "555-555-8765" },
  { firstName: "Olivia", lastName: "Taylor", email: "olivia@test.com", mobile: "555-555-4321" },
  { firstName: "Ethan", lastName: "Martinez", email: "ethan@test.com", mobile: "555-555-6789" },
  { firstName: "Sophia", lastName: "Anderson", email: "sophia@test.com", mobile: "555-555-3456" },
  { firstName: "Liam", lastName: "White", email: "liam@test.com", mobile: "555-555-2345" },
  { firstName: "Ava", lastName: "Harris", email: "ava@test.com", mobile: "555-555-9876" }
];

const Customers = () => {
  const [data, setData] = useState(customers);

  const deleteCustomer = (index) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  return (
    <div className="p-6 ml-64">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Customers</h2>

      {data.length === 0 ? (
        <p className="text-lg text-gray-600">No customers available.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-4">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white text-left">
                <th className="p-3 border">First Name</th>
                <th className="p-3 border">Last Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Mobile</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((customer, index) => (
                <tr key={index} className="border hover:bg-gray-100 transition">
                  <td className="p-3 border">{customer.firstName}</td>
                  <td className="p-3 border">{customer.lastName}</td>
                  <td className="p-3 border">{customer.email}</td>
                  <td className="p-3 border">{customer.mobile}</td>
                  <td className="p-3 border">
                    <button
                      onClick={() => deleteCustomer(index)}
                      className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded transition duration-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Customers;
