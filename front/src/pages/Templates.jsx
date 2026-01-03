import React, { useState, useEffect } from 'react';
import { templateAPI } from '../services/api';
import { Plus, Edit, Trash2, Eye, Star } from 'lucide-react';
import toast from 'react-hot-toast';

function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    html_template: '',
    css_styles: '',
    is_default: false,
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (currentTemplate) {
        await templateAPI.update(currentTemplate.id, formData);
        toast.success('Template updated successfully');
      } else {
        await templateAPI.create(formData);
        toast.success('Template created successfully');
      }

      setShowForm(false);
      setCurrentTemplate(null);
      resetForm();
      loadTemplates();
    } catch (error) {
      toast.error('Failed to save template');
      console.error(error);
    }
  };

  const handleEdit = (template) => {
    setCurrentTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      html_template: template.html_template,
      css_styles: template.css_styles,
      is_default: template.is_default,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await templateAPI.delete(id);
      toast.success('Template deleted successfully');
      loadTemplates();
    } catch (error) {
      toast.error('Failed to delete template');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      html_template: '',
      css_styles: '',
      is_default: false,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setCurrentTemplate(null);
    resetForm();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invoice Templates</h1>
        <button 
          className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          New Template
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">{currentTemplate ? 'Edit Template' : 'Create New Template'}</h2>
              <button onClick={handleCancel} className="text-3xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md p-1 transition-all duration-200">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2 text-sm">Template Name *</label>
                <input
                  type="text"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Modern Professional"
                />
              </div>

              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2 text-sm">Description</label>
                <textarea
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors resize-vertical"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                  placeholder="Brief description of the template"
                />
              </div>

              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2 text-sm">HTML Template *</label>
                <textarea
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors resize-vertical font-mono text-sm bg-gray-50"
                  value={formData.html_template}
                  onChange={(e) => setFormData({ ...formData, html_template: e.target.value })}
                  rows="8"
                  required
                  placeholder="HTML structure using {{variables}}"
                />
                <small className="text-gray-500 text-xs">Use variables like {'{{invoice_number}}'}, {'{{client_name}}'}, etc.</small>
              </div>

              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2 text-sm">CSS Styles</label>
                <textarea
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors resize-vertical font-mono text-sm bg-gray-50"
                  value={formData.css_styles}
                  onChange={(e) => setFormData({ ...formData, css_styles: e.target.value })}
                  rows="8"
                  placeholder="Custom CSS for this template"
                />
              </div>

              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  className="w-5 h-5 cursor-pointer"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                />
                <label htmlFor="is_default" className="ml-2 font-medium text-gray-700 cursor-pointer">Set as default template</label>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t-2 border-gray-100">
                <button type="button" onClick={handleCancel} className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-200">
                  Cancel
                </button>
                <button type="submit" className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  {currentTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
              <div className="p-6 border-b-2 border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {template.name}
                  {template.is_default && (
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  )}
                </h3>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{template.description || 'No description provided'}</p>
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 text-sm">
                  Template Preview
                </div>
              </div>

              <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
                <button 
                  className="text-indigo-600 p-2 rounded-md hover:bg-gray-100 transition-all duration-200"
                  onClick={() => handleEdit(template)}
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button 
                  className="text-indigo-600 p-2 rounded-md hover:bg-gray-100 transition-all duration-200"
                  onClick={() => toast.info('Preview feature coming soon!')}
                  title="Preview"
                >
                  <Eye size={18} />
                </button>
                <button 
                  className="text-red-500 p-2 rounded-md hover:bg-red-100 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={() => handleDelete(template.id)}
                  title="Delete"
                  disabled={template.is_default}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="p-4 bg-gray-50 text-center text-gray-600 text-xs">
                Created: {new Date(template.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-500">
              <p className="text-lg">No templates found. Create your first template!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Templates;