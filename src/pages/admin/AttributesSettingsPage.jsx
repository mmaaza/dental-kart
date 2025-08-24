import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AttributesSettingsPage = () => {
  // Replace LoadingContext with local state
  const [isLoading, setIsLoading] = useState(false);
  const [globalAttributes, setGlobalAttributes] = useState([]);
  const [newAttribute, setNewAttribute] = useState({
    name: '',
    values: '',
    description: ''
  });

  // Fetch existing attributes from the server
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/admin/settings/attributes');
        setGlobalAttributes(response.data.data || []);
      } catch (error) {
        console.error('Error fetching attributes:', error);
        toast.error('Failed to load attributes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttributes();
  }, []);

  // Handle input changes for new attribute
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAttribute(prev => ({ ...prev, [name]: value }));
  };

  // Handle adding a new attribute
  const handleAddAttribute = async () => {
    if (!newAttribute.name.trim()) {
      toast.error('Attribute name is required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post('/admin/settings/attributes', {
        name: newAttribute.name,
        values: newAttribute.values.split(',').map(value => value.trim()).filter(Boolean),
        description: newAttribute.description
      });

      setGlobalAttributes(prev => [...prev, response.data.data]);
      setNewAttribute({ name: '', values: '', description: '' });
      toast.success('Attribute added successfully');
    } catch (error) {
      console.error('Error adding attribute:', error);
      toast.error(error.response?.data?.message || 'Failed to add attribute');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle updating an attribute
  const handleUpdateAttribute = async (id, updatedData) => {
    try {
      setIsLoading(true);
      await api.put(`/admin/settings/attributes/${id}`, updatedData);
      
      // Update state
      setGlobalAttributes(prev => 
        prev.map(attr => attr._id === id ? { ...attr, ...updatedData } : attr)
      );
      
      toast.success('Attribute updated successfully');
    } catch (error) {
      console.error('Error updating attribute:', error);
      toast.error(error.response?.data?.message || 'Failed to update attribute');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting an attribute
  const handleDeleteAttribute = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attribute? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      await api.delete(`/admin/settings/attributes/${id}`);
      
      // Update state
      setGlobalAttributes(prev => prev.filter(attr => attr._id !== id));
      
      toast.success('Attribute deleted successfully');
    } catch (error) {
      console.error('Error deleting attribute:', error);
      toast.error(error.response?.data?.message || 'Failed to delete attribute');
    } finally {
      setIsLoading(false);
    }
  };

  // Attribute editing state management
  const [editingAttributeId, setEditingAttributeId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    values: '',
    description: ''
  });

  const handleEditClick = (attribute) => {
    setEditingAttributeId(attribute._id);
    setEditFormData({
      name: attribute.name,
      values: attribute.values.join(', '),
      description: attribute.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingAttributeId(null);
    setEditFormData({ name: '', values: '', description: '' });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (id) => {
    if (!editFormData.name.trim()) {
      toast.error('Attribute name is required');
      return;
    }

    const updatedData = {
      name: editFormData.name,
      values: editFormData.values.split(',').map(value => value.trim()).filter(Boolean),
      description: editFormData.description
    };

    await handleUpdateAttribute(id, updatedData);
    setEditingAttributeId(null);
    setEditFormData({ name: '', values: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-admin-slate-900 dark:text-admin-slate-100">
          Global Product Attributes
        </h2>
        <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">
          Define attributes that can be reused across products
        </p>
      </div>

      {/* Add new attribute form */}
      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100 mb-4">
          Add New Attribute
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1">
              Attribute Name
            </label>
            <input
              type="text"
              name="name"
              value={newAttribute.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-admin-slate-300 dark:border-admin-slate-600 rounded-md shadow-sm focus:ring-admin-ucla-500 focus:border-admin-ucla-500 dark:bg-admin-slate-700 dark:text-admin-slate-100"
              placeholder="Size, Color, Material, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1">
              Attribute Values (comma-separated)
            </label>
            <input
              type="text"
              name="values"
              value={newAttribute.values}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-admin-slate-300 dark:border-admin-slate-600 rounded-md shadow-sm focus:ring-admin-ucla-500 focus:border-admin-ucla-500 dark:bg-admin-slate-700 dark:text-admin-slate-100"
              placeholder="S, M, L, XL or Red, Blue, Green"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1">
              Description (optional)
            </label>
            <textarea
              name="description"
              value={newAttribute.description}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-4 py-2 border border-admin-slate-300 dark:border-admin-slate-600 rounded-md shadow-sm focus:ring-admin-ucla-500 focus:border-admin-ucla-500 dark:bg-admin-slate-700 dark:text-admin-slate-100"
              placeholder="Describe this attribute"
            ></textarea>
          </div>
          
          <div className="pt-3">
            <button
              type="button"
              onClick={handleAddAttribute}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-admin-ucla-600 hover:bg-admin-ucla-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500"
            >
              Add Attribute
            </button>
          </div>
        </div>
      </div>

      {/* Attributes List */}
      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100 mb-4">
          Existing Attributes
        </h3>
        
        {globalAttributes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-admin-slate-500 dark:text-admin-slate-400">
              No attributes defined yet. Add your first attribute above.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {globalAttributes.map(attribute => (
              <div 
                key={attribute._id} 
                className="border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg p-4"
              >
                {editingAttributeId === attribute._id ? (
                  // Edit Form
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1">
                        Attribute Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-admin-slate-300 dark:border-admin-slate-600 rounded-md shadow-sm focus:ring-admin-ucla-500 focus:border-admin-ucla-500 dark:bg-admin-slate-700 dark:text-admin-slate-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1">
                        Attribute Values (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="values"
                        value={editFormData.values}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-admin-slate-300 dark:border-admin-slate-600 rounded-md shadow-sm focus:ring-admin-ucla-500 focus:border-admin-ucla-500 dark:bg-admin-slate-700 dark:text-admin-slate-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditFormChange}
                        rows="2"
                        className="w-full px-3 py-2 border border-admin-slate-300 dark:border-admin-slate-600 rounded-md shadow-sm focus:ring-admin-ucla-500 focus:border-admin-ucla-500 dark:bg-admin-slate-700 dark:text-admin-slate-100"
                      ></textarea>
                    </div>
                    
                    <div className="flex items-center pt-3 space-x-3">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(attribute._id)}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-admin-ucla-600 hover:bg-admin-ucla-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="inline-flex justify-center py-2 px-4 border border-admin-slate-300 dark:border-admin-slate-600 shadow-sm text-sm font-medium rounded-md text-admin-slate-700 dark:text-admin-slate-300 bg-white dark:bg-admin-slate-700 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-slate-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Attribute
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-md font-medium text-admin-slate-900 dark:text-admin-slate-100">
                          {attribute.name}
                        </h4>
                        {attribute.description && (
                          <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">
                            {attribute.description}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(attribute)}
                          className="text-admin-slate-400 hover:text-admin-slate-500 dark:text-admin-slate-500 dark:hover:text-admin-slate-400"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteAttribute(attribute._id)}
                          className="text-red-400 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">Values:</h5>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {attribute.values.map((value, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-800 dark:text-admin-slate-200"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttributesSettingsPage;