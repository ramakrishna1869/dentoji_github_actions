// import React, { useState } from 'react';
// import { Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';

// const CustomFieldDisplay = ({ 
//   field,  // FIXED: Changed from fields to field (singular)
//   onDelete, 
//   onUpdate,
//   loading = false,
//   section 
// }) => {
//   const [editingField, setEditingField] = useState(null);
//   const [editValue, setEditValue] = useState('');
//   const [deleteConfirm, setDeleteConfirm] = useState(null);

//   const handleEdit = (field) => {
//     setEditingField(field._id);
//     setEditValue(field.value || '');
//   };

//   const handleSaveEdit = (fieldId) => {
//     onUpdate(editValue); // FIXED: Call onUpdate with just the value
//     setEditingField(null);
//     setEditValue('');
//   };

//   const handleCancelEdit = () => {
//     setEditingField(null);
//     setEditValue('');
//   };

//   const handleDelete = (fieldId) => {
//     if (deleteConfirm === fieldId) {
//       onDelete(); // FIXED: Call onDelete without parameters
//       setDeleteConfirm(null);
//     } else {
//       setDeleteConfirm(fieldId);
//       // Auto-cancel confirmation after 3 seconds
//       setTimeout(() => {
//         setDeleteConfirm(null);
//       }, 3000);
//     }
//   };

//   // FIXED: Check if field exists, not fields
//   if (!field) {
//     return null;
//   }

//   // FIXED: Return single field display, not mapping over fields
//   return (
//     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors mb-3">
//       <div className="flex justify-between items-start">
//         <div className="flex-1">
//           <div className="flex items-center gap-2 mb-2">
//             <h4 className="font-medium text-gray-900">{field.label}</h4>
//             <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
//               custom field
//             </span>
//           </div>

//           {field.description && (
//             <p className="text-sm text-gray-600 mb-2">{field.description}</p>
//           )}

//           {/* Editable Value Field */}
//           <div>
//             <label className="block text-xs font-medium text-gray-500 mb-1">
//               Value:
//             </label>
//             {editingField === field._id ? (
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   value={editValue}
//                   onChange={(e) => setEditValue(e.target.value)}
//                   className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
//                   placeholder="Enter value..."
//                   autoFocus
//                 />
//                 <button
//                   onClick={() => handleSaveEdit(field._id)}
//                   disabled={loading}
//                   className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
//                   title="Save"
//                 >
//                   <Save className="w-4 h-4" />
//                 </button>
//                 <button
//                   onClick={handleCancelEdit}
//                   disabled={loading}
//                   className="p-1 text-gray-600 hover:text-gray-700 disabled:opacity-50"
//                   title="Cancel"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>
//             ) : (
//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-gray-700 flex-1">
//                   {field.value || (
//                     <em className="text-gray-400">No value set</em>
//                   )}
//                 </span>
//                 <button
//                   onClick={() => handleEdit(field)}
//                   disabled={loading}
//                   className="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
//                   title="Edit value"
//                 >
//                   <Edit2 className="w-4 h-4" />
//                 </button>
//               </div>
//             )}
//           </div>

//           <div className="text-xs text-gray-400 mt-2">
//             Added on {new Date(field.createdAt).toLocaleDateString()}
//           </div>
//         </div>

//         {/* Delete Button */}
//         <div className="ml-4">
//           {loading ? (
//             <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
//           ) : (
//             <button
//               onClick={() => handleDelete(field._id)}
//               className={`p-1 rounded transition-colors ${
//                 deleteConfirm === field._id
//                   ? 'text-red-700 bg-red-100 hover:bg-red-200'
//                   : 'text-red-500 hover:text-red-600 hover:bg-red-50'
//               }`}
//               title={deleteConfirm === field._id ? 'Click again to confirm delete' : 'Delete field'}
//             >
//               <Trash2 className="w-4 h-4" />
//             </button>
//           )}
//         </div>
//       </div>

//       {deleteConfirm === field._id && (
//         <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
//           Click delete again to confirm removal of this field.
//         </div>
//       )}
//     </div>
//   );
// };

// export default CustomFieldDisplay;

// import React, { useState } from 'react';
// import { Trash2, Edit2, Loader2 } from 'lucide-react';

// const CustomFieldDisplay = ({ 
//   field,  
//   onDelete, 
//   onUpdate,
//   loading = false,
//   section 
// }) => {
//   const [deleteConfirm, setDeleteConfirm] = useState(null);

//   const handleEdit = (field) => {
//     // 🔹 Optional: Implement edit navigation or popup here
//     //console.log("Edit clicked:", field);
//     onUpdate && onUpdate(field);
//   };

//   const handleDelete = (fieldId) => {
//     if (deleteConfirm === fieldId) {
//       onDelete(); 
//       setDeleteConfirm(null);
//     } else {
//       setDeleteConfirm(fieldId);
//       setTimeout(() => {
//         setDeleteConfirm(null);
//       }, 3000);
//     }
//   };

//   if (!field) {
//     return null;
//   }

//   return (
//     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors mb-3">
//       <div className="flex justify-between items-start">
//         <div className="flex-1">
//           {/* Label + Tag */}
//           <div className="flex items-center gap-2 mb-1">
//             <h4 className="font-semibold text-gray-900 text-base">{field.label}</h4>
//             <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
//               custom field
//             </span>
//           </div>

//           {/* Description below label */}
//           {field.description && (
//             <p className="text-sm text-gray-600 mb-2 ml-1">{field.description}</p>
//           )}

//           {/* Date */}
//           <div className="text-xs text-gray-400">
//             Added on {new Date(field.createdAt).toLocaleDateString()}
//           </div>
//         </div>

//         {/* Edit + Delete Icons */}
//         <div className="flex items-center gap-3 ml-4">
//           <button
//             onClick={() => handleEdit(field._id)}
//             disabled={loading}
//             className="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
//             title="Edit field"
//           >
//             <Edit2 className="w-5 h-5" /> {/* bigger edit icon */}
//           </button>
//           {loading ? (
//             <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
//           ) : (
//             <button
//               onClick={() => handleDelete(field._id)}
//               className={`p-1 rounded transition-colors ${
//                 deleteConfirm === field._id
//                   ? 'text-red-700 bg-red-100 hover:bg-red-200'
//                   : 'text-red-500 hover:text-red-600 hover:bg-red-50'
//               }`}
//               title={deleteConfirm === field._id ? 'Click again to confirm delete' : 'Delete field'}
//             >
//               <Trash2 className="w-4 h-4" />
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Delete confirmation message */}
//       {deleteConfirm === field._id && (
//         <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
//           Click delete again to confirm removal of this field.
//         </div>
//       )}
//     </div>
//   );
// };

// export default CustomFieldDisplay;
import React, { useState } from 'react';
import { Trash2, Edit2, Loader2, Save, X, AlertCircle } from 'lucide-react';

const CustomFieldDisplay = ({
  field,
  onDelete,
  onUpdate,
  loading = false,
  section
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    label: field?.label || '',
    value: field?.value || ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle edit button click
  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    //console.log("✏️ Edit clicked for field:", field);
    setIsEditing(true);
    setEditData({
      label: field?.label || '',
      value: field?.value || ''
    });
    setEditErrors({});
  };

  // Handle input changes during edit
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (editErrors[name]) {
      setEditErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    const errors = {};
    
    if (!editData.label.trim()) {
      errors.label = 'Label is required';
    } else if (editData.label.trim().length < 2) {
      errors.label = 'Label must be at least 2 characters';
    } else if (editData.label.trim().length > 50) {
      errors.label = 'Label must be less than 50 characters';
    }
    
    if (editData.value.trim().length > 200) {
      errors.value = 'Value must be less than 200 characters';
    }
    
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateEditForm()) {
      return;
    }

    if (onUpdate && typeof onUpdate === 'function') {
      setIsUpdating(true);
      try {
        await onUpdate({
          label: editData.label.trim(),
          value: editData.value.trim()
        });
        setIsEditing(false);
        setEditErrors({});
        //console.log("✅ Field updated successfully");
      } catch (error) {
      //  console.error('❌ Error updating field:', error);
        setEditErrors({ general: 'Failed to update field. Please try again.' });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Handle cancel edit
  const handleCancelEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(false);
    setEditData({
      label: field?.label || '',
      value: field?.value || ''
    });
    setEditErrors({});
    //console.log("❌ Edit cancelled");
  };

  // Handle delete click with confirmation
  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (deleteConfirm === field._id) {
      // Second click - confirm delete
      if (onDelete && typeof onDelete === 'function') {
        //console.log("🗑️ Deleting field:", field._id);
        onDelete();
      }
      setDeleteConfirm(null);
    } else {
      // First click - show confirmation
      //console.log("⚠️ Delete confirmation requested for:", field._id);
      setDeleteConfirm(field._id);
      
      // Auto-clear confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirm(null);
      }, 3000);
    }
  };

  if (!field) {
    console.warn("⚠️ CustomFieldDisplay: No field data provided");
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          {/* Section Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
              {section} field
            </span>
            {field.createdAt && (
              <span className="text-xs text-gray-400">
                Added {new Date(field.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Edit Mode */}
          {isEditing ? (
            <div className="space-y-3">
              {/* General Error */}
              {editErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-600">{editErrors.general}</span>
                </div>
              )}

              {/* Label Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label Name *
                </label>
                <input
                  type="text"
                  name="label"
                  value={editData.label}
                  onChange={handleInputChange}
                  disabled={isUpdating}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    editErrors.label ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter field label..."
                />
                {editErrors.label && (
                  <p className="mt-1 text-xs text-red-600">{editErrors.label}</p>
                )}
              </div>

              {/* Value Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value
                </label>
                <textarea
                  name="value"
                  value={editData.value}
                  onChange={handleInputChange}
                  disabled={isUpdating}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    editErrors.value ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter field value..."
                />
                {editErrors.value && (
                  <p className="mt-1 text-xs text-red-600">{editErrors.value}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {editData.value.length}/200 characters
                </p>
              </div>

              {/* Edit Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isUpdating || !editData.label.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3" />
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 disabled:opacity-50 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Display Mode */
            <div className="space-y-3">
              {/* Label Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Label:
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50">
                  {field.label || 'No label'}
                </div>
              </div>

              {/* Value Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Value:
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 min-h-[2.5rem]">
                  {field.value || (
                    <span className="text-gray-400 italic">No value set</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Only show when not editing */}
        {!isEditing && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Edit Button */}
            <button
              type="button"
              onClick={handleEditClick}
              disabled={loading}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-300"
              title="Edit field"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Delete Button */}
            {loading ? (
              <div className="p-2 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDeleteClick}
                className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer ${
                  deleteConfirm === field._id
                    ? 'text-red-700 bg-red-100 hover:bg-red-200'
                    : 'text-red-500 hover:text-red-600 hover:bg-red-50'
                }`}
                title={deleteConfirm === field._id ? 'Click again to confirm delete' : 'Delete field'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Message */}
      {deleteConfirm === field._id && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <div className="text-sm">
              <strong className="text-red-700">Confirm Deletion</strong>
              <p className="text-red-600 mt-1">
                Are you sure you want to delete "{field.label}"? Click delete again to confirm.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFieldDisplay;