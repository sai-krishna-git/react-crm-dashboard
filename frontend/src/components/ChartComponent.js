import React from 'react';
import PropTypes from 'prop-types';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// ✅ Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend);

// ✅ Default data for Pie Chart
const defaultData = {
    labels: ['Product A', 'Product B', 'Product C', 'Product D'],
    datasets: [
        {
            label: 'Sales Distribution',
            data: [300, 500, 200, 100],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'],
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 4, // Added hover effect
        },
    ],
};

// ✅ Default chart options
const defaultOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'right',
            labels: {
                font: {
                    size: 14,
                },
            },
        },
        title: {
            display: true,
            text: 'Sales Distribution',
            font: {
                size: 18,
                weight: 'bold',
            },
        },
        tooltip: {
            callbacks: {
                label: function (tooltipItem) {
                    let value = tooltipItem.raw;
                    return ` ${value} units`;
                },
            },
        },
    },
    maintainAspectRatio: false, // Allow dynamic resizing
};

const ChartComponent = ({ data = defaultData, options = defaultOptions }) => {
    return (
        <div style={{ width: '100%', height: '400px' }}> {/* Added container for better responsiveness */}
            <Pie data={data} options={options} />
        </div>
    );
};

// ✅ Prop validation
ChartComponent.propTypes = {
    data: PropTypes.object,
    options: PropTypes.object,
};

export default ChartComponent;
