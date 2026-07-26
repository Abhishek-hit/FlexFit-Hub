import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { attendanceApi } from '../../api/attendanceApi';
import { paymentApi } from '../../api/paymentApi';
import { dashboardApi } from '../../api/dashboardApi';
import Loader from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';
import './Owner.css';

const PIE_COLORS = ['#16a34a', '#d97706'];

export default function OwnerAnalyticsPage() {
  const { gymId } = useParams();
  const toast = useToast();
  const [report, setReport] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, rev, ov] = await Promise.all([
        attendanceApi.report(gymId),
        paymentApi.revenueSummary(gymId),
        dashboardApi.owner(gymId),
      ]);
      setReport(r.data.data);
      setRevenue(rev.data.data);
      setOverview(ov.data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to load analytics.'));
    } finally {
      setLoading(false);
    }
  }, [gymId, toast]);

  useEffect(() => { load(); }, [load]);

  if (loading || !report || !revenue || !overview) return <Loader />;

  const attendanceData = [
    { name: 'Today', value: report.todayCount },
    { name: 'This Week', value: report.weeklyCount },
    { name: 'This Month', value: report.monthlyCount },
    { name: 'Last Month', value: report.lastMonthCount },
  ];

  const memberData = [
    { name: 'Active', value: overview.activeMembers },
    { name: 'Expired', value: overview.expiredMembers },
  ];

  const feesData = [
    { name: 'Paid', value: revenue.paidFees },
    { name: 'Pending', value: revenue.pendingFees },
  ];

  return (
    <div>
      <div className="page-title-row">
        <div><h1>Analytics</h1><p className="subtitle">Attendance, revenue & membership trends</p></div>
      </div>

      <div className="dash-grid-2">
        <div className="card card-pad">
          <h3 style={{ marginBottom: 16 }}>Attendance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-pad">
          <h3 style={{ marginBottom: 16 }}>Fees Collected vs Pending</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={feesData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
                {feesData.map((entry, i) => <Cell key={entry.name} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Legend />
              <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card card-pad">
        <h3 style={{ marginBottom: 16 }}>Membership Status</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={memberData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" fontSize={12} />
            <YAxis type="category" dataKey="name" fontSize={12} width={80} />
            <Tooltip />
            <Bar dataKey="value" fill="#16a34a" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
