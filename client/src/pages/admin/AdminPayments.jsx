import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Eye, Download, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { connectAdminSocket } from '../../utils/adminSocket';

const StatCard = ({ title, value, icon: Icon, color, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          {isLoading ? (
            <div className="h-8 w-20 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
          ) : (
            <h3 className="text-2xl font-bold text-light-text dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{title}</p>
        </div>
      </div>
    </motion.div>
  );
};

const InvoiceModal = ({ payment, isOpen, onClose }) => {
  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-2xl w-full"
      >
        <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-light-text dark:text-white">Invoice</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary-400 mb-2">TradeSim Invoice</h1>
            <p className="text-slate-400">Date: {new Date(payment.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 text-light-text dark:text-white">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <p className="text-slate-600 dark:text-slate-300">{payment.userId?.name || 'N/A'}</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{payment.userId?.email || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Payment Details:</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">Order ID: <span className="font-mono">{payment.orderId}</span></p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">Payment ID: <span className="font-mono">{payment.paymentId || 'N/A'}</span></p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Status: <span className={`px-2 py-0.5 rounded-full text-xs ${payment.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                  {payment.status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl p-6 mb-8">
            <h3 className="text-light-text dark:text-white font-semibold mb-4 border-b border-light-border dark:border-dark-border pb-3">Invoice Items</h3>
            <div className="flex justify-between py-3">
              <div>
                <p className="text-light-text dark:text-white">Premium Subscription</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1)} Plan</p>
              </div>
              <p className="text-light-text dark:text-white font-bold">₹{payment.amount.toFixed(2)}</p>
            </div>
            <div className="border-t border-light-border dark:border-dark-border pt-3 mt-3 flex justify-between">
              <p className="text-light-text dark:text-white font-semibold">Total</p>
              <p className="text-light-text dark:text-white font-bold text-lg">₹{payment.amount.toFixed(2)}</p>
            </div>
          </div>

          <div className="text-center text-slate-500 text-sm">
            <p>Thank you for your subscription!</p>
            <p>TradeSim - Stock Trading Simulation Platform</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AdminPayments = () => {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async (page = 1, status = '') => {
    try {
      setIsLoading(true);
      const [statsRes, paymentsRes] = await Promise.all([
        api.get('/admin/payments/stats'),
        api.get(`/admin/payments?page=${page}${status ? `&status=${status}` : ''}`)
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (paymentsRes.data.success) {
        setPayments(paymentsRes.data.payments);
        setPagination({
          currentPage: paymentsRes.data.currentPage,
          totalPages: paymentsRes.data.totalPages,
          total: paymentsRes.data.total,
        });
      }
    } catch (err) {
      toast.error('Failed to load payments data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.currentPage, statusFilter);

    const socket = connectAdminSocket();
    socket.on('statsUpdate', () => {
      fetchData(pagination.currentPage, statusFilter);
    });

    return () => { if (socket) { socket.removeAllListeners('statsUpdate'); socket.removeAllListeners('user-login'); } };
  }, [pagination.currentPage, statusFilter]);

  const handleViewInvoice = async (paymentId) => {
    try {
      const res = await api.get(`/payment/invoice/${paymentId}`);
      if (res.data.success) {
        setSelectedPayment(res.data.payment);
        setIsModalOpen(true);
      }
    } catch (err) {
      toast.error('Failed to load invoice');
      console.error(err);
    }
  };

  const handleDownloadInvoice = async (paymentId) => {
    try {
      // Create a temporary anchor element to trigger download via API
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const url = `${baseUrl}/payment/invoice/${paymentId}/download`;

      // Since this is a GET request, use a hidden form or anchor tag with token in headers
      // Approach: Use fetch to get the blob and create an object URL
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      // Create blob from response
      const blob = await response.blob();

      // Create object URL
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create temporary link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `invoice-${paymentId}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Invoice downloaded');
    } catch (err) {
      toast.error('Failed to download invoice');
      console.error(err);
    }
  };

  const handlePageChange = (newPage) => {
    fetchData(newPage, statusFilter);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    fetchData(1, e.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      case 'pending':
      case 'created':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">Payment Management</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Manage Razorpay payments and invoices</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <StatCard
          title="Successful Payments"
          value={stats?.successfulPayments || 0}
          icon={Search}
          color="bg-green-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Failed Payments"
          value={stats?.failedPayments || 0}
          icon={Search}
          color="bg-red-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Payments"
          value={stats?.pendingPayments || 0}
          icon={Search}
          color="bg-yellow-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon={Search}
          color="bg-primary-600"
          isLoading={isLoading}
        />
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="p-4 border-b border-dark-border">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-lg font-semibold text-light-text dark:text-white">Payments</h2>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-4 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-sm text-light-text dark:text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="created">Pending</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-bg dark:bg-dark-bg">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payment ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan="7">
                      <div className="h-4 w-40 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-slate-400">No payments found</div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-light-bg/50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-slate-500 dark:text-slate-400">{payment.paymentId || payment.orderId}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-light-text dark:text-white">{payment.userId?.name}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{payment.userId?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">₹{payment.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${payment.plan === 'pro' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                        {payment.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewInvoice(payment._id)}
                          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                          title="View Invoice"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(payment._id)}
                          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                          title="Download Invoice"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-dark-border flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Showing {payments.length} of {pagination.total} payments
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-lg border border-dark-border text-slate-400 hover:text-white hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-slate-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 rounded-lg border border-dark-border text-slate-400 hover:text-white hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <InvoiceModal
            payment={selectedPayment}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPayments;
