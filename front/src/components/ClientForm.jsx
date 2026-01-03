import React, { useState } from 'react';
import { clientAPI } from '../services/api';
import toast from 'react-hot-toast';

function ClientForm({ onSuccess, onCancel, initialData = null }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Client name is required');
      return;
    }

    try {
      setSubmitting(true);
      
      if (initialData?.id) {
        await clientAPI.update(initialData.id, formData);
        toast.success('Client updated successfully');
      } else {
        await clientAPI.create(formData);
        toast.success('Client created successfully');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to save client');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md">
      <h3 className="text-xl font-semibold text-indigo-600 mb-6">{initialData ? 'Edit Client' : 'New Client'}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-2 text-sm">Client Name *</label>
          <input
            type="text"
            className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            placeholder="Company or Person Name"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-2 text-sm">Email</label>
          <input
            type="email"
            className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="client@example.com"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-2 text-sm">Phone</label>
          <input
            type="tel"
            className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+237 XXX XXX XXX"
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold text-gray-700 mb-2 text-sm">Address</label>
          <textarea
            className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors resize-vertical"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows="2"
            placeholder="Street address"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-2 text-sm">City</label>
          <input
            type="text"
            className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="City"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-2 text-sm">State/Region</label>
          <input
            type="text"
            className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="State or Region"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-2 text-sm">Country</label>
          <input
            type="text"
            className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder="Country"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-2 text-sm">Postal Code</label>
          <input
            type="text"
            className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
            value={formData.postal_code}
            onChange={(e) => handleChange('postal_code', e.target.value)}
            placeholder="Postal Code"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-100">
        {onCancel && (
          <button type="button" onClick={onCancel} className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-200">
            Cancel
          </button>
        )}
        <button type="submit" disabled={submitting} className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50">
          {submitting ? 'Saving...' : initialData ? 'Update Client' : 'Create Client'}
        </button>
      </div>
    </form>
  );
}

export default ClientForm;