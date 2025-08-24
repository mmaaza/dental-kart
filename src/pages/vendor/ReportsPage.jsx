import React, { useEffect, useState } from "react";
import vendorApi from "../../services/vendorApi";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [ordersByDay, setOrdersByDay] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await vendorApi.get("/vendors/reports");
        const data = res.data?.data || res.data;
        if (!data) throw new Error("Invalid reports response");
        setSummary(data.summary || {});
        setOrdersByDay(data.ordersByDay || []);
        setTopProducts(data.topProducts || []);
      } catch (err) {
        console.error("Failed to load reports", err);
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your orders and top products.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total", value: summary.totalOrders },
          { label: "Pending", value: summary.pending },
          { label: "Processing", value: summary.processing },
          { label: "Shipped", value: summary.shipped },
          { label: "Delivered", value: summary.delivered },
          { label: "Cancelled", value: summary.cancelled },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Orders by Day */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Orders Over Time
          </h3>
        </div>
        <div className="p-4">
          {ordersByDay.length === 0 ? (
            <p className="text-sm text-gray-500">No data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordersByDay.map((d) => (
                    <tr key={d.date}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {d.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {d.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Top Products (no prices) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Top Products (by quantity)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity Sold
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((p) => (
                <tr key={p.productId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {p.slug ? (
                      <Link
                        to={`/product/${p.slug}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {p.name}
                      </Link>
                    ) : (
                      p.name
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {p.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {p.slug ? (
                      <Link
                        to={`/product/${p.slug}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
