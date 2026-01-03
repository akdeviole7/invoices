import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Eye, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

function InvoiceList({ 
  filter = 'all', 
  limit = null, 
  onInvoiceClick = null 
}) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
  }, [filter, limit]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (limit) params.limit = limit;

      const response = await invoiceAPI.getAll(params);
      setInvoices(response.data.data);
    } catch (error) {
      toast.error('Failed to load invoices');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      await invoiceAPI.delete(id);
      toast.success('Invoice deleted successfully');
      loadInvoices();
    } catch (error) {
      toast.error('Failed to delete invoice');
      console.error(error);
    }
  };

  const handleRowClick = (invoice) => {
    if (onInvoiceClick) {
      onInvoiceClick(invoice);
    } else {
      navigate(`/invoice/${invoice.id}`);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-500',
      sent: 'bg-cyan-500',
      paid: 'bg-green-500',
      overdue: 'bg-red-500',
      cancelled: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      invoice.invoice_number.toLowerCase().includes(search) ||
      invoice.client_name.toLowerCase().includes(search) ||
      invoice.total.toString().includes(search)
    );
  });

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading invoices...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

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
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-gray-500">
                  {searchTerm ? 'No invoices match your search' : 'No invoices found'}
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr 
                  key={invoice.id} 
                  onClick={() => handleRowClick(invoice)}
                  className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  <td className="px-6 py-4 font-bold text-sm">{invoice.invoice_number}</td>
                  <td className="px-6 py-4 text-sm">{invoice.client_name}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(invoice.invoice_date)}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(invoice.due_date)}</td>
                  <td className="px-6 py-4 font-bold text-sm">{formatCurrency(invoice.total, invoice.currency)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/invoice/${invoice.id}`);
                        }}
                        className="text-indigo-600 p-2 rounded-md hover:bg-gray-100 transition-all duration-200"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit/${invoice.id}`);
                        }}
                        className="text-indigo-600 p-2 rounded-md hover:bg-gray-100 transition-all duration-200"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, invoice.id)}
                        className="text-red-500 p-2 rounded-md hover:bg-red-100 transition-all duration-200"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InvoiceList;