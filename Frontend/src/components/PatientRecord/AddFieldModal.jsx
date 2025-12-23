import React, { useState, useEffect } from 'react';
import { X, Plus, Loader2, AlertCircle } from 'lucide-react';

const AddFieldModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  section, 
  loading = false 
}) => {
  const [fieldData, setFieldData] = useState({
    label: '',
    value: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFieldData({ label: '', value: '' });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFieldData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!fieldData.label.trim()) {
      newErrors.label = 'Label name is required';
    } else if (fieldData.label.trim().length < 2) {
      newErrors.label = 'Label must be at least 2 characters';
    } else if (fieldData.label.trim().length > 50) {
      newErrors.label = 'Label must be less than 50 characters';
    }
    
    if (fieldData.value.trim().length > 200) {
      newErrors.value = 'Value must be less than 200 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    //console.log("💾 Attempting to save custom field:", { fieldData, section });
    
    if (!validateForm()) {
      //console.log("❌ Form validation failed:", errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const dataToSave = {
        label: fieldData.label.trim(),
        value: fieldData.value.trim(),
        section
      };

      //console.log("📤 Sending data to parent:", dataToSave);
      await onSave(dataToSave);
      
      //console.log("✅ Field saved successfully");
      // Reset form on successful save
      setFieldData({ label: '', value: '' });
      setErrors({});
      // Note: Modal will be closed by parent component after successful save
    } catch (error) {
     // console.error('❌ Error saving field:', error);
      setErrors({ 
        general: error.message || 'Failed to save custom field. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing while saving
    
    //console.log("🚪 Closing add field modal");
    setFieldData({ label: '', value: '' });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const getSectionDisplayName = (section) => {
    switch (section) {
      case 'patient': return 'Patient Information';
      case 'medication': return 'Medication';
      case 'treatment': return 'Treatment';
      case 'payment': return 'Payment';
      default: return section;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Custom Field</h2>
            <p className="text-sm text-gray-500 mt-1">
              Add a custom field to <span className="font-medium text-blue-600">{getSectionDisplayName(section)}</span> section
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting || loading}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-600">{errors.general}</span>
            </div>
          )}

          {/* Label Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field Label *
            </label>
            <input
              type="text"
              name="label"
              value={fieldData.label}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Emergency Contact, Insurance Details, Special Notes"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                errors.label ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isSubmitting || loading}
              autoFocus
              maxLength={50}
            />
            {errors.label && (
              <p className="mt-1 text-sm text-red-600">{errors.label}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {fieldData.label.length}/50 characters
            </p>
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field Value
            </label>
            <textarea
              name="value"
              value={fieldData.value}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter the field value (optional)"
              rows={3}
              className={`w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                errors.value ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isSubmitting || loading}
              maxLength={200}
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-600">{errors.value}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {fieldData.value.length}/200 characters • You can leave this empty and fill it later
            </p>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <div className="text-sm text-blue-700">
                <strong>Tip:</strong> Custom fields help you store additional information specific to your practice needs.
                The field label should be descriptive (e.g., "Insurance Provider" rather than just "Insurance").
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleClose}
            disabled={isSubmitting || loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || loading || !fieldData.label.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-500 border border-transparent rounded-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding Field...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Field
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFieldModal;