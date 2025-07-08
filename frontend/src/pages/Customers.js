import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../auth';

const Customers = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(false); // New state to trigger re-fetch

  const token = getToken();
  console.log('Admin token:', token);

  // Fetch customers from the database
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchCustomers = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/customers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const customers = await response.json();
        console.log('Fetched customers:', customers);
        setData(customers);
      } catch (err) {
        console.error('Error fetching customers:', err.message);
        setError('Failed to load customers. Please try again later.');
      }
    };

    fetchCustomers();
  }, [token, navigate, refresh]); // Add `refresh` to the dependency array

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const addCustomer = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/customers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      if (response.status === 400) {
        const errorData = await response.json();
        setError(errorData.message || 'Duplicate customer detected.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to add customer');
      }

      setForm({ firstName: '', lastName: '', email: '', phone: '' });
      setRefresh(!refresh); // Toggle `refresh` to trigger re-fetch
    } catch (err) {
      console.error('Error adding customer:', err.message);
      setError('Failed to add customer. Please try again later.');
    }
  };

  const deleteCustomer = async (index, id) => {
    setError('');
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/customers/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      const updatedCustomers = [...data];
      updatedCustomers.splice(index, 1); // Remove the customer from the list
      setRefresh(!refresh);
    } catch (err) {
      console.error('Error deleting customer:', err.message);
      setError('Failed to delete customer. Please try again later.');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Customers</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add Customer Form */}
      <form
        onSubmit={addCustomer}
        className="mb-6 bg-white shadow-lg rounded-lg p-4"
      >
        <div className="grid grid-cols-4 gap-4">
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleInputChange}
            placeholder="First Name"
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleInputChange}
            placeholder="Last Name"
            className="p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleInputChange}
            placeholder="Phone"
            className="p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded transition duration-300"
        >
          Add Customer
        </button>
      </form>

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
                <th className="p-3 border">Phone</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((customer, index) => (
                <tr
                  key={customer._id}
                  className="border hover:bg-gray-100 transition"
                >
                  <td className="p-3 border">{customer.firstName}</td>
                  <td className="p-3 border">{customer.lastName}</td>
                  <td className="p-3 border">{customer.email}</td>
                  <td className="p-3 border">{customer.phone}</td>
                  <td className="p-3 border">
                    <button
                      onClick={() => deleteCustomer(index, customer._id)}
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
