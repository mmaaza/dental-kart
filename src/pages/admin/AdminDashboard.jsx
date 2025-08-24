import React, { useEffect, useState } from 'react';
import { useLoading } from '../../contexts/LoadingContext';
import { getAllOrders } from '../../services/order.service';
import api from '../../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// Sample data - Replace with real API data
const monthlyData = [
  { name: 'Jan', revenue: 4000, profit: 2400, orders: 24 },
  { name: 'Feb', revenue: 3000, profit: 1398, orders: 22 },
  { name: 'Mar', revenue: 2000, profit: 9800, orders: 35 },
  { name: 'Apr', revenue: 2780, profit: 3908, orders: 29 },
  { name: 'May', revenue: 1890, profit: 4800, orders: 18 },
  { name: 'Jun', revenue: 2390, profit: 3800, orders: 25 }
];

const plStatement = [
  { name: 'Revenue', value: 120000, changePercent: 12.5 },
  { name: 'Cost of Goods Sold (COGS)', value: -50000, changePercent: -8.2 },
  { name: 'Gross Profit', value: 70000, changePercent: 15.3 },
  { name: 'Operating Expenses', value: -30000, changePercent: -5.1 },
  { name: 'Operating Income', value: 40000, changePercent: 18.2 },
  { name: 'Other Income', value: 5000, changePercent: 2.1 },
  { name: 'Other Expenses', value: -2000, changePercent: -1.5 },
  { name: 'Net Profit', value: 43000, changePercent: 20.4 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
  const { startLoading, stopLoading } = useLoading();
  const [activeMetric, setActiveMetric] = useState('revenue');
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0, // placeholder
    netProfit: 0, // placeholder
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      startLoading();
      try {
        // Fetch products count
        const productsRes = await api.get('/products/admin/list', { 
          params: { page: 1, limit: 1 } 
        });
        const productsCount = productsRes.data?.data?.pagination?.totalItems || 0;

        // Fetch orders count for this month
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        
        const ordersRes = await getAllOrders({ 
          page: 1, 
          limit: 1000,
          startDate: firstDayOfMonth.toISOString(),
          endDate: lastDayOfMonth.toISOString()
        });
        const ordersCount = ordersRes.data?.pagination?.total || 0;

        setStats({
          products: productsCount,
          orders: ordersCount,
          revenue: 0, // placeholder
          netProfit: 0, // placeholder
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        stopLoading();
      }
    };
    loadDashboardData();
  }, []);

  const formatCurrency = (value) => `Rs.${value.toLocaleString()}`;

  const getPerformanceStatus = (value) => {
    if (value >= 10) return { label: 'Excellent', color: 'text-green-500' };
    if (value >= 5) return { label: 'Good', color: 'text-blue-500' };
    if (value >= 0) return { label: 'Stable', color: 'text-yellow-500' };
    return { label: 'Needs Attention', color: 'text-red-500' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-admin-slate-800 to-admin-slate-700 dark:from-admin-slate-900 dark:to-admin-slate-800 p-8">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white mb-2">Financial Dashboard</h1>
          <p className="text-admin-slate-200">
            Comprehensive overview of your business performance
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-primary-500/20 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(stats.revenue)}
        />
        <MetricCard
          title="Net Profit"
          value={formatCurrency(stats.netProfit)}
        />
        <MetricCard
          title="Orders (This Month)"
          value={stats.orders.toString()}
        />
        <MetricCard
          title="Total Products"
          value={stats.products.toString()}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Profit Trends */}
        <div className="bg-white dark:bg-admin-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Revenue & Profit Trends</h2>
            <div className="flex items-center space-x-2">
              <MetricButton
                active={activeMetric === 'revenue'}
                onClick={() => setActiveMetric('revenue')}
                label="Revenue"
              />
              <MetricButton
                active={activeMetric === 'profit'}
                onClick={() => setActiveMetric('profit')}
                label="Profit"
              />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2a6f97" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2a6f97" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  stroke="#2a6f97"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Added Info Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-admin-slate-200 dark:border-admin-slate-700">
            <div>
              <p className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400">6-Month Growth</p>
              <p className="mt-2 flex items-baseline gap-x-2">
                <span className="text-lg font-semibold text-admin-slate-900 dark:text-admin-slate-100">15.8%</span>
                <span className="text-sm text-green-500">↑ 2.3%</span>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400">Highest Month</p>
              <p className="mt-2 flex items-baseline gap-x-2">
                <span className="text-lg font-semibold text-admin-slate-900 dark:text-admin-slate-100">March</span>
                <span className="text-sm text-admin-slate-500">Rs.9,800</span>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400">Projected Q2</p>
              <p className="mt-2 flex items-baseline gap-x-2">
                <span className="text-lg font-semibold text-admin-slate-900 dark:text-admin-slate-100">Rs.32,400</span>
                <span className="text-sm text-blue-500">↑ 8.4%</span>
              </p>
            </div>
          </div>
        </div>

        {/* P&L Statement */}
        <div className="bg-white dark:bg-admin-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">P&L Statement</h2>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              getPerformanceStatus(20.4).color
            }`}>
              {getPerformanceStatus(20.4).label}
            </span>
          </div>
          <div className="w-full">
            <table className="w-full divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
              <thead className="bg-admin-slate-50 dark:bg-admin-slate-800/50">
                <tr>
                  <th scope="col" className="w-[45%] px-4 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Item
                  </th>
                  <th scope="col" className="w-[30%] px-4 py-3 text-right text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="w-[25%] px-4 py-3 text-right text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-admin-slate-800 divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
                {plStatement.map((item, index) => (
                  <tr 
                    key={item.name}
                    className={`${
                      ['Gross Profit', 'Operating Income', 'Net Profit'].includes(item.name)
                        ? 'bg-admin-slate-50 dark:bg-admin-slate-700/50 font-medium'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-4 text-sm text-admin-slate-900 dark:text-admin-slate-100">
                      {item.name}
                    </td>
                    <td className={`px-4 py-4 text-sm text-right ${
                      item.value < 0 
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-admin-slate-900 dark:text-admin-slate-100'
                    }`}>
                      {formatCurrency(Math.abs(item.value))}
                      {item.value < 0 ? ' (-)' : ''}
                    </td>
                    <td className="px-4 py-4 text-sm text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.changePercent > 0
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        {item.changePercent > 0 ? '↑' : '↓'} {Math.abs(item.changePercent)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Added Summary Section */}
          <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-admin-slate-200 dark:border-admin-slate-700">
            <div>
              <h4 className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400">Key Insights</h4>
              <ul className="mt-2 space-y-2 text-sm">
                <li className="flex items-center gap-x-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-admin-slate-700 dark:text-admin-slate-300">Gross margin improved by 15.3%</span>
                </li>
                <li className="flex items-center gap-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-admin-slate-700 dark:text-admin-slate-300">Operating expenses reduced by 5.1%</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400">Recommendations</h4>
              <ul className="mt-2 space-y-2 text-sm">
                <li className="flex items-center gap-x-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span className="text-admin-slate-700 dark:text-admin-slate-300">Review other expenses allocation</span>
                </li>
                <li className="flex items-center gap-x-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span className="text-admin-slate-700 dark:text-admin-slate-300">Optimize inventory management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Order Analytics */}
        <div className="bg-white dark:bg-admin-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Order Analytics</h2>
            <div className="flex items-center space-x-2">
              <select className="text-sm border-0 bg-admin-slate-100 dark:bg-admin-slate-700 rounded-md py-1 px-3 text-admin-slate-600 dark:text-admin-slate-300">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#2a6f97" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Section */}
          <div className="mt-6 pt-6 border-t border-admin-slate-200 dark:border-admin-slate-700">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400">Total Orders</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-2xl font-semibold text-admin-slate-900 dark:text-admin-slate-100">153</p>
                  <span className="text-sm font-medium text-green-500">↑ 12%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400">Average Value</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-2xl font-semibold text-admin-slate-900 dark:text-admin-slate-100">Rs.785</p>
                  <span className="text-sm font-medium text-red-500">↓ 3%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400">Return Rate</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-2xl font-semibold text-admin-slate-900 dark:text-admin-slate-100">2.4%</p>
                  <span className="text-sm font-medium text-green-500">↑ 0.8%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400">Processing Time</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-2xl font-semibold text-admin-slate-900 dark:text-admin-slate-100">1.2d</p>
                  <span className="text-sm font-medium text-green-500">↑ 15%</span>
                </div>
              </div>
            </div>

            {/* Order Status & Payment Methods */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400 mb-4">Order Status</h4>
                <table className="w-full">
                  <tbody className="divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
                    <tr>
                      <td className="py-2 text-sm text-admin-slate-600 dark:text-admin-slate-400">Completed Orders</td>
                      <td className="py-2 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 text-right">132</td>
                      <td className="py-2 text-sm text-admin-slate-500 dark:text-admin-slate-400 text-right w-20">86%</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-sm text-admin-slate-600 dark:text-admin-slate-400">Pending Orders</td>
                      <td className="py-2 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 text-right">15</td>
                      <td className="py-2 text-sm text-admin-slate-500 dark:text-admin-slate-400 text-right">10%</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-sm text-admin-slate-600 dark:text-admin-slate-400">Cancelled Orders</td>
                      <td className="py-2 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 text-right">6</td>
                      <td className="py-2 text-sm text-admin-slate-500 dark:text-admin-slate-400 text-right">4%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400 mb-4">Payment Methods</h4>
                <table className="w-full">
                  <tbody className="divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
                    <tr>
                      <td className="py-2 text-sm text-admin-slate-600 dark:text-admin-slate-400">Credit Card</td>
                      <td className="py-2 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 text-right">69</td>
                      <td className="py-2 text-sm text-admin-slate-500 dark:text-admin-slate-400 text-right w-20">45%</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-sm text-admin-slate-600 dark:text-admin-slate-400">Cash on Delivery</td>
                      <td className="py-2 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 text-right">54</td>
                      <td className="py-2 text-sm text-admin-slate-500 dark:text-admin-slate-400 text-right">35%</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-sm text-admin-slate-600 dark:text-admin-slate-400">Bank Transfer</td>
                      <td className="py-2 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 text-right">30</td>
                      <td className="py-2 text-sm text-admin-slate-500 dark:text-admin-slate-400 text-right">20%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Distribution */}
        <div className="bg-white dark:bg-admin-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100 mb-6">Revenue Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Medical Devices', value: 45000 },
                    { name: 'Supplies', value: 30000 },
                    { name: 'Equipment', value: 25000 },
                    { name: 'Others', value: 20000 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {plStatement.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Added Category Analysis */}
          <div className="mt-6 pt-6 border-t border-admin-slate-200 dark:border-admin-slate-700">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400">Top Category</p>
                  <p className="mt-1 font-semibold text-admin-slate-900 dark:text-admin-slate-100">Medical Devices</p>
                  <p className="text-xs text-green-500">37.5% of revenue</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400">Growth Leader</p>
                  <p className="mt-1 font-semibold text-admin-slate-900 dark:text-admin-slate-100">Equipment</p>
                  <p className="text-xs text-green-500">↑ 28% YoY</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400">Focus Area</p>
                  <p className="mt-1 font-semibold text-admin-slate-900 dark:text-admin-slate-100">Supplies</p>
                  <p className="text-xs text-yellow-500">25% margin</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400 mb-2">Category Insights</h4>
                <ul className="space-y-1 text-sm text-admin-slate-700 dark:text-admin-slate-300">
                  <li className="flex items-center gap-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Medical Devices show highest profit margin
                  </li>
                  <li className="flex items-center gap-x-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Equipment sales growing steadily
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, trend, percentage, details }) => (
  <div className="bg-white dark:bg-admin-slate-800 rounded-xl p-6 shadow-sm">
    <p className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400">{title}</p>
    <div className="mt-2 flex items-baseline">
      <p className="text-2xl font-semibold text-admin-slate-900 dark:text-admin-slate-100">{value}</p>
    </div>
    <p className="mt-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">{details}</p>
  </div>
);

const MetricButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
      active
        ? 'bg-admin-slate-200 dark:bg-admin-slate-700 text-admin-slate-900 dark:text-white'
        : 'text-admin-slate-600 dark:text-admin-slate-400 hover:bg-admin-slate-100 dark:hover:bg-admin-slate-700'
    }`}
  >
    {label}
  </button>
);

export default AdminDashboard;