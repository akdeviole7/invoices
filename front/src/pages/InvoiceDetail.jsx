import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceAPI } from '../services/api';
import InvoicePreview from '../components/InvoicePreview';
import { 
  Printer, 
  Download, 
  Edit, 
  Trash2, 
  Send, 
  CheckCircle, 
  XCircle,
  ArrowLeft 
} from 'lucide-react';
import toast from 'react-hot-toast';

function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const response = await invoiceAPI.getById(id);
      setInvoice(response.data.data);
    } catch (error) {
      toast.error('Failed to load invoice');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // This would integrate with a PDF generation service
    toast.success('PDF download feature coming soon!');
    // In production, you'd call: invoiceAPI.generatePDF(id)
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdating(true);
      await invoiceAPI.update(id, { status: newStatus });
      toast.success(`Invoice status updated to ${newStatus}`);
      loadInvoice();
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      await invoiceAPI.delete(id);
      toast.success('Invoice deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete invoice');
      console.error(error);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-600">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4">Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-600">
        <h2 className="text-2xl font-bold mb-4">Invoice not found</h2>
        <button 
          onClick={() => navigate('/')} 
          className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const client = {
    name: invoice.client_name,
    email: invoice.client_email,
    address: invoice.client_address,
    city: invoice.client_city,
    state: invoice.client_state,
    country: invoice.client_country,
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 print:hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <button 
            onClick={() => navigate('/')} 
            className="text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</h1>
            <span 
              className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${getStatusColor(invoice.status)}`}
            >
              {invoice.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handlePrint} 
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg border-2 border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <Printer size={18} />
            Print
          </button>
          <button 
            onClick={handleDownloadPDF} 
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg border-2 border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <Download size={18} />
            PDF
          </button>
          <button 
            onClick={() => navigate(`/edit/${id}`)} 
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg border-2 border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <Edit size={18} />
            Edit
          </button>
          <button 
            onClick={handleDelete} 
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md mb-8 print:hidden">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          {invoice.status === 'draft' && (
            <button
              onClick={() => handleStatusChange('sent')}
              disabled={statusUpdating}
              className="bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={18} />
              Mark as Sent
            </button>
          )}
          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
            <button
              onClick={() => handleStatusChange('paid')}
              disabled={statusUpdating}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle size={18} />
              Mark as Paid
            </button>
          )}
          {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
            <button
              onClick={() => handleStatusChange('cancelled')}
              disabled={statusUpdating}
              className="bg-white text-red-500 px-6 py-3 rounded-lg font-semibold border-2 border-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              <XCircle size={18} />
              Cancel Invoice
            </button>
          )}
        </div>
      </div>

      <div className="mb-8">
        <InvoicePreview 
          invoice={invoice} 
          items={invoice.items || []} 
          client={client}
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md print:hidden">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Created</label>
            <span className="text-base text-gray-900">{new Date(invoice.created_at).toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Last Updated</label>
            <span className="text-base text-gray-900">{new Date(invoice.updated_at).toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Currency</label>
            <span className="text-base text-gray-900">{invoice.currency}</span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Tax Rate</label>
            <span className="text-base text-gray-900">{invoice.tax_rate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetail;