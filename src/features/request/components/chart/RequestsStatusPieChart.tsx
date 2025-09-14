// RequestsStatusPieChart.tsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { RequestDto } from '@utils/models/models';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  data: RequestDto[];
}

const RequestsStatusPieChart: React.FC<Props> = ({ data }) => {
  const statusData = data.reduce((acc: { [key: string]: number }, curr: RequestDto) => {
    const status = curr.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(statusData),
    datasets: [
      {
        label: 'Request Status',
        data: Object.values(statusData),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
      },
    ],
  };

  return <Pie data={chartData} />;
};

export default RequestsStatusPieChart;
