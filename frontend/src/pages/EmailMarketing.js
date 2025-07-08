import { useState, useEffect } from 'react';
import {
  FaEnvelope,
  FaUsers,
  FaPaperPlane,
  FaSmile,
  FaSearch,
  FaPlus,
  FaSave,
  FaTrash,
  FaEdit,
} from 'react-icons/fa';

import { getToken } from '../auth';

const EmailMarketing = () => {
  const [emails, setEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
  });
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Welcome Onboard',
      subject: 'Welcome to Our Community!',
      content:
        "Dear valued customer,\n\nWe're thrilled to welcome you to our community! Thank you for choosing our products. We're committed to providing you with excellent service and quality products.\n\nFeel free to reach out if you have any questions.\n\nWarm regards,\nThe Team",
      sentiment: { pos: 0.36, neu: 0.64, neg: 0.0, compound: 0.92 },
    },
    {
      id: 2,
      name: 'Special Discount',
      subject: 'Exclusive 20% Discount Just For You!',
      content:
        "Hello,\n\nWe're excited to offer you an exclusive 20% discount on all our products this week.\n\nAs a valued customer, you deserve the best deals.\n\nHappy shopping!\n\nBest wishes,\nThe Team",
      sentiment: { pos: 0.28, neu: 0.72, neg: 0.0, compound: 0.96 },
    },
    {
      id: 3,
      name: 'Product Launch',
      subject: 'Exciting New Products Just Arrived!',
      content:
        "Dear customer,\n\nWe're thrilled to announce our newest collection has just arrived!\n\nThese exciting new products have been carefully designed with you in mind, offering improved features and benefits.\n\nWe can't wait for you to experience them.\n\nCheers,\nThe Product Team",
      sentiment: { pos: 0.3, neu: 0.7, neg: 0.0, compound: 0.93 },
    },
  ]);

  useEffect(() => {
    // Fetch customers when component mounts
    fetchCustomers();
  }, []);

  // Fetch customers from the backend
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/customers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Add all customer emails
  const addAllCustomers = () => {
    if (customers.length === 0) {
      alert('❌ No customers found. Try refreshing the page.');
      return;
    }

    const customerEmails = customers
      .filter((customer) => customer.email)
      .map((customer) => customer.email)
      .join(', ');

    setEmails(customerEmails);
  };

  // Validate email format
  const validateEmails = (emailList) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailList.every((email) => emailRegex.test(email));
  };

  // Apply template
  const applyTemplate = (template) => {
    setSelectedTemplate(template.id);
    setSubject(template.subject);
    setMessage(template.content);
    setSentiment(template.sentiment);
  };

  // Function to analyze sentiment
  const analyzeSentiment = async () => {
    if (!message.trim()) {
      alert('❌ Please enter a message before analyzing sentiment.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5001/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });

      const result = await response.json();
      setSentiment(result);
    } catch (error) {
      console.error('❌ Sentiment Analysis Failed:', error);
      alert('❌ Failed to analyze sentiment.');
    }
  };

  // Function to send the email
  const sendEmail = async () => {
    const emailList = emails
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email !== '');

    if (emailList.length === 0 || !subject.trim() || !message.trim()) {
      alert('❌ All fields are required!');
      return;
    }

    if (!validateEmails(emailList)) {
      alert('❌ Invalid email format. Please check the recipient emails.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/email/send-marketing-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recipients: emailList, subject, message }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert(`✅ ${result.message}`);
        setEmails('');
        setSubject('');
        setMessage('');
        setSentiment(null);
        setSelectedTemplate(null);
      } else {
        alert(`❌ ${result.error || 'Failed to send email'}`);
      }
    } catch (error) {
      console.error('❌ Error sending email:', error);
      alert('❌ Network error or server is down.');
    } finally {
      setLoading(false);
    }
  };

  // Add new template
  const handleAddTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      alert('❌ All template fields are required!');
      return;
    }

    try {
      // Analyze sentiment for new template
      const response = await fetch('http://127.0.0.1:5001/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTemplate.content }),
      });

      const sentimentResult = await response.json();

      const newTemplateWithId = {
        ...newTemplate,
        id: Date.now(),
        sentiment: sentimentResult,
      };

      setTemplates([...templates, newTemplateWithId]);
      setNewTemplate({ name: '', subject: '', content: '' });
      setShowAddTemplate(false);

      // Apply the new template
      applyTemplate(newTemplateWithId);
    } catch (error) {
      console.error('❌ Template Sentiment Analysis Failed:', error);
      alert('❌ Failed to analyze template sentiment.');
    }
  };

  // Delete template
  const deleteTemplate = (id) => {
    setTemplates(templates.filter((template) => template.id !== id));
    if (selectedTemplate === id) {
      setSelectedTemplate(null);
    }
  };

  // Get sentiment badge color
  const getSentimentColor = (compound) => {
    if (compound >= 0.05) return 'bg-green-100 text-green-800';
    if (compound <= -0.05) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  // Get sentiment label
  const getSentimentLabel = (compound) => {
    if (compound >= 0.05) return 'Positive';
    if (compound <= -0.05) return 'Negative';
    return 'Neutral';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Email Marketing
      </h1>

      {/* Email Templates Section */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Email Templates
          </h2>
          <button
            onClick={() => setShowAddTemplate(!showAddTemplate)}
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-200"
          >
            <FaPlus className="mr-2" />{' '}
            {showAddTemplate ? 'Cancel' : 'New Template'}
          </button>
        </div>

        {/* Add New Template Form */}
        {showAddTemplate && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-3">Create New Template</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                  placeholder="e.g., Welcome Email"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={newTemplate.subject}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, subject: e.target.value })
                  }
                  placeholder="e.g., Welcome to Our Community!"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Content
                </label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, content: e.target.value })
                  }
                  placeholder="Write your email content here..."
                  rows="5"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleAddTemplate}
                  className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200"
                >
                  <FaSave className="mr-2" /> Save Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => applyTemplate(template)}
              className={`cursor-pointer border rounded-lg p-4 transition-all duration-200 relative hover:shadow-md ${
                selectedTemplate === template.id
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <h3 className="font-medium text-lg mb-2 text-gray-800">
                {template.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                {template.subject}
              </p>
              <p className="text-gray-500 text-xs mb-3 line-clamp-3">
                {template.content}
              </p>

              <div className="flex justify-between items-center mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                    template.sentiment.compound
                  )}`}
                >
                  {getSentimentLabel(template.sentiment.compound)} (
                  {template.sentiment.compound.toFixed(2)})
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTemplate(template.id);
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compose Email Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Compose Email
        </h2>

        {/* Recipients */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipients
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter emails separated by commas"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={addAllCustomers}
              disabled={loadingCustomers}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition duration-200 disabled:bg-gray-400"
            >
              <FaUsers className="mr-2" />
              {loadingCustomers ? 'Loading...' : 'Add All Customers'}
            </button>
          </div>
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Message */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            placeholder="Compose your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="8"
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={analyzeSentiment}
            className="flex items-center bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition duration-200"
          >
            <FaSmile className="mr-2" /> Analyze Sentiment
          </button>

          <button
            onClick={sendEmail}
            disabled={loading}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200 disabled:bg-gray-400"
          >
            <FaPaperPlane className="mr-2" />{' '}
            {loading ? 'Sending...' : 'Send Email'}
          </button>
        </div>

        {/* Sentiment Results */}
        {sentiment && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-medium mb-3 text-gray-800">
              Sentiment Analysis
            </h3>

            <div className="space-y-3">
              {/* Positive Score */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">
                    Positive
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {sentiment.pos.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${sentiment.pos * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Neutral Score */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">
                    Neutral
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {sentiment.neu.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-500 h-2 rounded-full"
                    style={{ width: `${sentiment.neu * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Negative Score */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">
                    Negative
                  </span>
                  <span className="text-sm font-medium text-red-600">
                    {sentiment.neg.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${sentiment.neg * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Overall Score */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-700 mr-2">
                    Overall Score:
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${getSentimentColor(
                      sentiment.compound
                    )}`}
                  >
                    {sentiment.compound.toFixed(2)} -{' '}
                    {getSentimentLabel(sentiment.compound)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailMarketing;
