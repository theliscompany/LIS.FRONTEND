// RequestsPerAssigneeChart.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { RequestDto } from '@utils/models/models';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  data: RequestDto[];
}

const RequestsPerAssigneeChart: React.FC<Props> = ({ data }) => {
  const assigneeData = data.reduce((acc: { [key: string]: number }, curr: RequestDto) => {
    const assignee = curr.assigneeId ? `Assignee ${curr.assigneeId}` : 'Not assigned';
    acc[assignee] = (acc[assignee] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(assigneeData),
    datasets: [
      {
        label: 'Number of Requests',
        data: Object.values(assigneeData),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return <Bar data={chartData} />;
};

export default RequestsPerAssigneeChart;
