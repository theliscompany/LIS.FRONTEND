import React from 'react';
import { Pie } from 'react-chartjs-2';
import { PriceOfferDto } from '../../../utils/models/models';

interface OffersStatusPieChartProps {
  data: PriceOfferDto[];
}

const OffersStatusPieChart: React.FC<OffersStatusPieChartProps> = ({ data }) => {
  const statuses = data.map(offer => offer.clientApproval);
  const statusCounts = statuses.reduce((acc: Record<string, number>, status: string) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
      }
    ]
  };

  return <Pie data={chartData} />;
};

export default OffersStatusPieChart;
