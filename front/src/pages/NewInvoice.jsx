import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceAPI, clientAPI, templateAPI } from '../services/api';
import { Plus, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import InvoicePreview from '../components/InvoicePreview';

function NewInvoice() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const [invoice, setInvoice] = useState({
    client_id: '',
    template_id: '',
    provider_name: '',
    provider_email: '',
    provider_phone: '',
    provider_address: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'XAF',
    tax_rate: 0,
    status: 'draft',
    notes: '',
    payment_method: '',
    payment_details: '',
  });

  const [items, setItems] = useState([
    { description: '', detailed_description: '', quantity: 1, unit_price: 0, amount: 0 }
  ]);

  useEffect(() => {
    loadClients();
    loadTemplates();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [items, invoice.tax_rate]);

  const loadClients = async () => {
    try {
      const response = await clientAPI.getAll();
      setClients(response.data.data);
    } catch (error) {
      toast.error('Failed to load clients');
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await templateAPI.getAll();
      setTemplates(response.data.data);
    } catch (error) {
      toast.error('Failed to load templates');
    }
  };

  const handleInvoiceChange = (field, value) => {
    setInvoice({ ...invoice, [field]: value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', detailed_description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax_amount = subtotal * (invoice.tax_rate / 100);
    const total = subtotal + tax_amount;
    
    setInvoice({
      ...invoice,
      subtotal,
      tax_amount,
      total,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!invoice.client_id) {
      toast.error('Please select a client');
      return;
    }

    if (items.some(item => !item.description || item.unit_price <= 0)) {
      toast.error('Please complete all invoice items');
      return;
    }

    try {
      const response = await invoiceAPI.create({ invoice, items });
      toast.success('Invoice created successfully!');
      navigate(`/invoice/${response.data.data.id}`);
    } catch (error) {
      toast.error('Failed to create invoice');
      console.error(error);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-200 flex items-center gap-2"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye size={18} /> {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button 
            className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            onClick={handleSubmit}
          >
            Save Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form className="bg-white p-8 rounded-xl shadow-md">
          <div className="mb-8 pb-8 border-b-2 border-gray-100">
            <h3 className="text-xl font-semibold text-indigo-600 mb-6">Invoice Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2 text-sm">Client *</label>
                <select
                  className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={invoice.client_id}
                  onChange={(e) => handleInvoiceChange('client_id', e.target.value)}
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2 text-sm">Template</label>
                <select
                  className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={invoice.template_id}
                  onChange={(e) => handleInvoiceChange('template_id', e.target.value)}
                >
                  <option value="">Default Template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2 text-sm">Invoice Date *</label>
                <input
                  type="date"
                  className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={invoice.invoice_date}
                  onChange={(e) => handleInvoiceChange('invoice_date', e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2 text-sm">Due Date *</label>
                <input
                  type="date"
                  className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={invoice.due_date}
                  onChange={(e) => handleInvoiceChange('due_date', e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2 text-sm">Currency</label>
                <select
                  className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={invoice.currency}
                  onChange={(e) => handleInvoiceChange('currency', e.target.value)}
                >
                  <option value="XAF">XAF</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2 text-sm">Status</label>
                <select
                  className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={invoice.status}
                  onChange={(e) => handleInvoiceChange('status', e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-8 pb-8 border-b-2 border-gray-100">
            <h3 className="text-xl font-semibold text-indigo-600 mb-6">Provider Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2 text-sm">Your Name *</label>
                <input
                  type="text"
                  className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={invoice.provider_name}
                  onChange={(e) => handleInvoiceChange('provider_name', e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2 text-sm">Email</label>
                <input
                  type="email"
                  className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={invoice.provider_email}
                  onChange={(e) => handleInvoiceChange('provider_email', e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2 text-sm">Phone</label>
                <input
                  type="tel"
                  className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={invoice.provider_phone}
                  onChange={(e) => handleInvoiceChange('provider_phone', e.target.value)}
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="font-semibold text-gray-700 mb-2 text-sm">Address</label>
                <textarea
                  className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors resize-vertical"
                  value={invoice.provider_address}
                  onChange={(e) => handleInvoiceChange('provider_address', e.target.value)}
                  rows="2"
                />
              </div>
            </div>
          </div>

          <div className="mb-8 pb-8 border-b-2 border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-indigo-600">Invoice Items</h3>
              <button 
                type="button" 
                className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 hover:text-white transition-all duration-200 flex items-center gap-2"
                onClick={addItem}
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-end">
                  <div className="flex flex-col md:col-span-2">
                    <label className="font-semibold text-gray-700 mb-2 text-sm">Description *</label>
                    <input
                      type="text"
                      className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-semibold text-gray-700 mb-2 text-sm">Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-semibold text-gray-700 mb-2 text-sm">Unit Price *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-semibold text-gray-700 mb-2 text-sm">Amount</label>
                    <input
                      type="number"
                      className="p-3 border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      value={item.amount}
                      disabled
                    />
                  </div>

                  <button
                    type="button"
                    className="text-red-500 p-3 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Detailed Description</label>
                  <textarea
                    className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors resize-vertical"
                    value={item.detailed_description}
                    onChange={(e) => handleItemChange(index, 'detailed_description', e.target.value)}
                    rows="2"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-indigo-600 mb-6">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2 text-sm">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={invoice.tax_rate}
                  onChange={(e) => handleInvoiceChange('tax_rate', parseFloat(e.target.value))}
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2 text-sm">Payment Method</label>
                <input
                  type="text"
                  placeholder="e.g., Mobile Money, Bank Transfer"
                  className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={invoice.payment_method}
                  onChange={(e) => handleInvoiceChange('payment_method', e.target.value)}
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="font-semibold text-gray-700 mb-2 text-sm">Payment Details</label>
                <input
                  type="text"
                  placeholder="Account number or Mobile Money details"
                  className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={invoice.payment_details}
                  onChange={(e) => handleInvoiceChange('payment_details', e.target.value)}
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="font-semibold text-gray-700 mb-2 text-sm">Notes</label>
                <textarea
                  className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors resize-vertical"
                  value={invoice.notes}
                  onChange={(e) => handleInvoiceChange('notes', e.target.value)}
                  rows="3"
                  placeholder="Additional notes or terms..."
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mt-8">
            <div className="flex justify-between py-2 text-base">
              <span>Subtotal:</span>
              <strong>{invoice.subtotal?.toFixed(2) || '0.00'} {invoice.currency}</strong>
            </div>
            <div className="flex justify-between py-2 text-base">
              <span>Tax ({invoice.tax_rate}%):</span>
              <strong>{invoice.tax_amount?.toFixed(2) || '0.00'} {invoice.currency}</strong>
            </div>
            <div className="flex justify-between py-2 text-xl font-bold text-indigo-600 border-t-2 border-indigo-600 mt-4 pt-4">
              <span>TOTAL:</span>
              <strong>{invoice.total?.toFixed(2) || '0.00'} {invoice.currency}</strong>
            </div>
          </div>
        </form>

        {showPreview && (
          <div className="bg-white p-8 rounded-xl shadow-md sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <InvoicePreview invoice={invoice} items={items} />
          </div>
        )}
      </div>
    </div>
  );
}

export default NewInvoice;