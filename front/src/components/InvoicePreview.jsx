import React from 'react';

function InvoicePreview({ invoice, items, client }) {
  const formatCurrency = (amount, currency = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'XAF' ? 'XAF' : 'USD',
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden print:border-none print:shadow-none">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8">
        <h1 className="text-3xl font-bold">INVOICE</h1>
        <p className="text-lg">Professional Services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 border-b-2 border-gray-100">
        <div>
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">From (Provider)</h3>
          <p className="text-sm leading-relaxed">
            <strong>{invoice.provider_name || 'Your Name'}</strong><br />
            {invoice.provider_address || 'Your Address'}<br />
            {invoice.provider_email && `${invoice.provider_email}`}<br />
            {invoice.provider_phone && `${invoice.provider_phone}`}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">Bill To (Client)</h3>
          <p className="text-sm leading-relaxed">
            <strong>{client?.name || 'Client Name'}</strong><br />
            {client?.address || 'Client Address'}<br />
            {client?.city && `${client.city}, ${client.state}`}<br />
            {client?.country || ''}<br />
            {client?.email && `${client.email}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50">
        <div className="text-center">
          <label className="block text-xs text-gray-600 uppercase tracking-wide mb-1">Invoice Number</label>
          <strong className="text-sm">{invoice.invoice_number || 'AUTO-GENERATED'}</strong>
        </div>
        <div className="text-center">
          <label className="block text-xs text-gray-600 uppercase tracking-wide mb-1">Invoice Date</label>
          <strong className="text-sm">{formatDate(invoice.invoice_date)}</strong>
        </div>
        <div className="text-center">
          <label className="block text-xs text-gray-600 uppercase tracking-wide mb-1">Due Date</label>
          <strong className="text-sm">{formatDate(invoice.due_date)}</strong>
        </div>
      </div>

      <div className="p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Services Provided</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-2 text-xs font-semibold uppercase tracking-wider">Description</th>
              <th className="text-center py-2 text-xs font-semibold uppercase tracking-wider">Quantity</th>
              <th className="text-right py-2 text-xs font-semibold uppercase tracking-wider">Unit Price</th>
              <th className="text-right py-2 text-xs font-semibold uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index}>
                <td className="py-4">
                  <strong className="block text-sm">{item.description || 'Service Description'}</strong>
                  {item.detailed_description && (
                    <div className="text-xs text-gray-600 mt-1">{item.detailed_description}</div>
                  )}
                </td>
                <td className="py-4 text-center text-sm">{item.quantity}</td>
                <td className="py-4 text-right text-sm">{formatCurrency(item.unit_price, invoice.currency)}</td>
                <td className="py-4 text-right text-sm">{formatCurrency(item.amount, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-gray-50">
        <div className="flex justify-between py-2 text-sm">
          <span>Subtotal:</span>
          <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
        </div>
        <div className="flex justify-between py-2 text-sm">
          <span>Tax ({invoice.tax_rate}%):</span>
          <span>{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
        </div>
        <div className="flex justify-between py-4 mt-4 border-t-2 border-indigo-600 text-xl font-bold text-indigo-600">
          <span>TOTAL DUE:</span>
          <span>{formatCurrency(invoice.total, invoice.currency)}</span>
        </div>
      </div>

      {(invoice.payment_method || invoice.payment_details) && (
        <div className="bg-gray-900 text-white p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
          {invoice.payment_method && (
            <p className="text-sm"><strong>Method:</strong> {invoice.payment_method}</p>
          )}
          {invoice.payment_details && (
            <p className="text-sm"><strong>Details:</strong> {invoice.payment_details}</p>
          )}
          <p className="mt-4 text-sm opacity-80">Thank you for your business!</p>
        </div>
      )}

      {invoice.notes && (
        <div className="p-8 border-t border-gray-200">
          <h4 className="text-base font-semibold text-indigo-600 mb-2">Notes:</h4>
          <p className="text-sm leading-relaxed">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}

export default InvoicePreview;