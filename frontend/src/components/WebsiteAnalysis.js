import { Bar } from "react-chartjs-2";

const data = {
  labels: ["Page A", "Page B", "Page C", "Page D"],
  datasets: [
    {
      label: "Visitors",
      data: [400, 600, 800, 1200],
      backgroundColor: ["blue", "purple", "orange", "red"],
    },
  ],
};

const WebsiteAnalysis = () => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Website Analysis</h2>
      <Bar data={data} />
    </div>
  );
};

export default WebsiteAnalysis;
