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
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Customers</h2>
      <table className="w-full bg-white border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">First Name</th>
            <th className="p-2 border">Last Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Mobile</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((customer, index) => (
            <tr key={index} className="border">
              <td className="p-2 border">{customer.firstName}</td>
              <td className="p-2 border">{customer.lastName}</td>
              <td className="p-2 border">{customer.email}</td>
              <td className="p-2 border">{customer.mobile}</td>
              <td className="p-2 border">
                <button onClick={() => deleteCustomer(index)} className="bg-red-500 text-white p-1 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Customers;
