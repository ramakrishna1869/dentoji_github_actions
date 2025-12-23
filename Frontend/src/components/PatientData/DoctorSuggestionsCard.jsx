

import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';

export default function DoctorSuggestionsCard({ patientData, onUpdate, onEdit, onDelete }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState(null);
  const [formSuggestions, setFormSuggestions] = useState([
    { title: '', description: '' }
  ]);
  const [editFormData, setEditFormData] = useState({ title: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Update suggestions when patientData changes
  useEffect(() => {
    if (patientData?.doctorSuggestions) {
      setSuggestions(patientData.doctorSuggestions);
    }
  }, [patientData?.doctorSuggestions]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setFormSuggestions([{ title: '', description: '' }]);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormSuggestions([{ title: '', description: '' }]);
  };

  const handleOpenEditModal = (suggestion) => {
    setEditingSuggestion(suggestion);
    setEditFormData({
      title: suggestion.title,
      description: suggestion.description
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingSuggestion(null);
    setEditFormData({ title: '', description: '' });
  };

  const handleInputChange = (index, field, value) => {
    setFormSuggestions(prev => 
      prev.map((suggestion, i) => 
        i === index 
          ? { ...suggestion, [field]: value }
          : suggestion
      )
    );
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addNewSuggestionField = () => {
    setFormSuggestions(prev => [...prev, { title: '', description: '' }]);
  };

  const removeSuggestionField = (index) => {
    if (formSuggestions.length > 1) {
      setFormSuggestions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    // Validate inputs
    const newSuggestions = [];
    
    for (let i = 0; i < formSuggestions.length; i++) {
      const suggestion = formSuggestions[i];
      
      if (suggestion.title.trim() || suggestion.description.trim()) {
        if (suggestion.title.trim() && suggestion.description.trim()) {
          newSuggestions.push({
            id: Date.now() + Math.random() + i,
            title: suggestion.title.trim(),
            description: suggestion.description.trim(),
            createdAt: new Date()
          });
        } else {
          alert(`Please fill both title and description for Suggestion ${i + 1}`);
          return;
        }
      }
    }

    if (newSuggestions.length === 0) {
      alert('Please add at least one suggestion');
      return;
    }

    setIsLoading(true);
    try {
      if (onUpdate) {
        await onUpdate({ doctorSuggestions: newSuggestions });
      }
      handleCloseModal();
    } catch (error) {
    //  console.error('Error saving suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editFormData.title.trim() || !editFormData.description.trim()) {
      alert('Please fill both title and description');
      return;
    }

    if (!editingSuggestion || !onEdit) {
      alert('Unable to update suggestion. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      await onEdit(editingSuggestion.id, {
        title: editFormData.title.trim(),
        description: editFormData.description.trim()
      });
      handleCloseEditModal();
    } catch (error) {
     // console.error('Error updating suggestion:', error);
      alert('Failed to update suggestion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (suggestion) => {
    if (!window.confirm('Are you sure you want to delete this suggestion? This action cannot be undone.')) {
      return;
    }

    if (!onDelete) {
      alert('Delete functionality is not available. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      await onDelete(suggestion.id);
    } catch (error) {
     // console.error('Error deleting suggestion:', error);
      alert('Failed to delete suggestion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
            Doctor Suggestions
          </h3>
          <button
            onClick={handleOpenModal}
            disabled={isLoading}
            className="text-orange-500 hover:text-orange-600   px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5 cursor-pointer" />
            
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            // Empty State
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No suggestions recorded yet</p>
              <p className="text-sm text-gray-400">Click "Add New Suggestions" to add doctor suggestions</p>
            </div>
          ) : (
            // Suggestions List
            suggestions.map((suggestion, index) => (
              <div key={suggestion.id || `suggestion-${index}`} className="border-l-4 border-orange-500 pl-4 py-2 group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{suggestion.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{suggestion.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Added on {new Date(suggestion.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-4">
                    <button
                      onClick={() => handleOpenEditModal(suggestion)}
                      disabled={isLoading}
                      className="p-2 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                      title="Edit suggestion"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(suggestion)}
                      disabled={isLoading}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                      title="Delete suggestion"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add New Suggestions Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Add Doctor Suggestions</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {formSuggestions.map((suggestion, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-800">
                      Suggestion {index + 1}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {index === formSuggestions.length - 1 && (
                        <button
                          onClick={addNewSuggestionField}
                          className="flex items-center space-x-1 px-2 py-1 text-xs text-orange-600 border border-orange-300 rounded-md hover:bg-orange-50 transition-colors font-medium cursor-pointer"
                          title="Add new suggestion"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add New</span>
                        </button>
                      )}
                      {formSuggestions.length > 1 && (
                        <button
                          onClick={() => removeSuggestionField(index)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                          title="Remove this suggestion"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-300 opacity-50"></div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={suggestion.title}
                      onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                      placeholder="Enter suggestion title (e.g., Routine Cleaning)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={suggestion.description}
                      onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                      placeholder="Enter detailed description of the suggestion..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleCloseModal}
                disabled={isLoading}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition-colors font-medium cursor-pointer"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Suggestion Modal */}
      {isEditModalOpen && editingSuggestion && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-30  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Edit Doctor Suggestion</h2>
              <button
                onClick={handleCloseEditModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => handleEditInputChange('title', e.target.value)}
                    placeholder="Enter suggestion title (e.g., Routine Cleaning)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => handleEditInputChange('description', e.target.value)}
                    placeholder="Enter detailed description of the suggestion..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleCloseEditModal}
                disabled={isLoading}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={isLoading}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition-colors font-medium cursor-pointer"
              >
                {isLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
