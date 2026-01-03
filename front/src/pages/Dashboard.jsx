import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceAPI } from '../services/api';
import { FileText, DollarSign, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
  });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
  }, [filter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await invoiceAPI.getAll(params);
      setInvoices(response.data.data);
      calculateStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load invoices');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (invoices) => {
    const stats = {
      total: invoices.length,
      paid: invoices.filter(i => i.status === 'paid').length,
      pending: invoices.filter(i => i.status === 'sent').length,
      overdue: invoices.filter(i => i.status === 'overdue').length,
    };
    setStats(stats);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-500',
      sent: 'bg-info',
      paid: 'bg-success',
      overdue: 'bg-danger',
      cancelled: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const formatCurrency = (amount, currency = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'XAF' ? 'XAF' : 'USD',
    }).format(amount);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invoice Dashboard</h1>
        <button 
          className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
          onClick={() => navigate('/new')}
        >
          + New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex items-center gap-4">
          <FileText size={24} className="text-indigo-600" />
          <div>
            <h3 className="text-2xl font-bold text-indigo-600">{stats.total}</h3>
            <p className="text-sm text-gray-600">Total Invoices</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex items-center gap-4">
          <CheckCircle size={24} className="text-green-600" />
          <div>
            <h3 className="text-2xl font-bold text-green-600">{stats.paid}</h3>
            <p className="text-sm text-gray-600">Paid</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex items-center gap-4">
          <Clock size={24} className="text-cyan-500" />
          <div>
            <h3 className="text-2xl font-bold text-cyan-500">{stats.pending}</h3>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex items-center gap-4">
          <DollarSign size={24} className="text-red-500" />
          <div>
            <h3 className="text-2xl font-bold text-red-500">{stats.overdue}</h3>
            <p className="text-sm text-gray-600">Overdue</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-gray-300 hover:border-indigo-500 hover:text-indigo-500'}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === 'draft' ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-gray-300 hover:border-indigo-500 hover:text-indigo-500'}`}
          onClick={() => setFilter('draft')}
        >
          Draft
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === 'sent' ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-gray-300 hover:border-indigo-500 hover:text-indigo-500'}`}
          onClick={() => setFilter('sent')}
        >
          Sent
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === 'paid' ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-gray-300 hover:border-indigo-500 hover:text-indigo-500'}`}
          onClick={() => setFilter('paid')}
        >
          Paid
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === 'overdue' ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-gray-300 hover:border-indigo-500 hover:text-indigo-500'}`}
          onClick={() => setFilter('overdue')}
        >
          Overdue
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading invoices...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 font-bold">{invoice.invoice_number}</td>
                  <td className="px-6 py-4">{invoice.client_name}</td>
                  <td className="px-6 py-4">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{new Date(invoice.due_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold">{formatCurrency(invoice.total, invoice.currency)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 hover:text-white transition-all duration-200"
                      onClick={() => navigate(`/invoice/${invoice.id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;