'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import useSWR from 'swr';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function PortfolioChart({ address }: { address?: string }) {
  // Use a fallback for demo purposes if no address is provided
  const queryAddress = address || '0x0000000000000000000000000000000000000000';
  
  const { data, error, isLoading } = useSWR(
    `/api/portfolio/${queryAddress}`,
    fetcher,
    { 
      refreshInterval: 30000,
      fallbackData: {
        timestamps: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: [1000, 1200, 1100, 1400, 1300, 1600]
      }
    }
  );

  if (isLoading) return <div className="w-full h-full flex items-center justify-center text-zinc-500 animate-pulse">Loading chart...</div>;
  if (error) return <div className="w-full h-full flex items-center justify-center text-red-500">Failed to load chart</div>;

  const chartData = {
    labels: data.timestamps,
    datasets: [
      {
        label: 'Portfolio Value (USD)',
        data: data.values,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
        }
      }
    }
  };

  return <Line data={chartData} options={options} />;
}
