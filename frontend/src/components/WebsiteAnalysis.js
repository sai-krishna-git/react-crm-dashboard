import { Bar } from 'react-chartjs-2';

const data = {
  labels: ['About', 'Login', 'Customers', 'Dashboard'],
  datasets: [
    {
      label: 'Visitors',
      data: [400, 600, 800, 1200],
      backgroundColor: ['blue', 'purple', 'orange', 'red'],
    },
  ],
};

const WebsiteAnalysis = () => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Website Analysis</h2>
      <div className="h-80">
        <Bar
          data={data}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
};

export default WebsiteAnalysis;
