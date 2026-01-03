import React, { useState, useEffect } from 'react';
import { templateAPI } from '../services/api';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';

function TemplateSelector({ selectedTemplateId, onSelect }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateAPI.getAll();
      setTemplates(response.data.data);
    } catch (error) {
      toast.error('Failed to load templates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading templates...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Invoice Template</h4>
      <div className="flex flex-col gap-4">
        <div
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-4 ${!selectedTemplateId ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'}`}
          onClick={() => onSelect(null)}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            Default
          </div>
          <div className="flex-1">
            <strong className="text-gray-900">Default Template</strong>
            <small className="block text-gray-600">Standard invoice layout</small>
          </div>
          {!selectedTemplateId && (
            <Check size={20} className="text-indigo-600" />
          )}
        </div>

        {templates.map((template) => (
          <div
            key={template.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-4 ${selectedTemplateId === template.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'}`}
            onClick={() => onSelect(template.id)}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
              {template.name.charAt(0)}
            </div>
            <div className="flex-1">
              <strong className="text-gray-900">{template.name}</strong>
              <small className="block text-gray-600">{template.description || 'Custom template'}</small>
            </div>
            {selectedTemplateId === template.id && (
              <Check size={20} className="text-indigo-600" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplateSelector;