// import React, { useState } from "react";
// import { X, Download } from "lucide-react";
//  import { Plus, Trash2 } from "lucide-react";
// export default function PrescriptionModal({ isOpen, onClose, onSave }) {
//   const [formData, setFormData] = useState({
//     patientName: "",
//     patientId: "",
//     appointmentDate: "",
//     diagnosis: "",
//     medicationName: "",
//     duration: "",
//     dosage: "",
//     frequency: "",
//     instruction: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleDownload = () => {
//     onSave?.(formData);
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center">
//       <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
//         >
//           <X size={18} />
//         </button>

//         {/* Heading */}
//         <h2 className="text-lg font-semibold mb-1">Prescription</h2>
//         <p className="text-gray-500 text-sm mb-4">Patient Information</p>

//         {/* Patient Information */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           <div>
//             <label className="block text-xs font-semibold text-gray-700 mb-1">
//               Patient Name
//             </label>
//             <input
//               type="text"
//               name="patientName"
//               value={formData.patientName}
//               onChange={handleChange}
//               className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-semibold text-gray-700 mb-1">
//               Patient ID
//             </label>
//             <input
//               type="text"
//               name="patientId"
//               value={formData.patientId}
//               onChange={handleChange}
//               className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
//             />
//           </div>
//           <div className="md:grid-cols-2">
//             <label className="block text-xs font-semibold text-gray-700 mb-1">
//               Appointment Date
//             </label>
//             <input
//               type="date"
//               name="appointmentDate"
//               value={formData.appointmentDate}
//               onChange={handleChange}
//               className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
//             />
//           </div>
//         </div>

       

// <p className="text-sm font-medium text-black mb-2 mt-4">Medicine Information</p>

// <div className="bg-gray-100 rounded-lg p-4">
//   {/* Top-right icons */}
//   <div className="flex justify-end mb-2 space-x-2">
//     <button className="text-gray-500 hover:text-black">
//       <Plus size={16} />
//     </button>
//     <button className="text-gray-500 hover:text-red-500">
//       <Trash2 size={16} />
//     </button>
//   </div>

//   {/* Grid: 2 columns on md+ */}
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    
//     {/* Medication Name - Full Width */}
//     <div className="md:col-span-2 w-1/2">
//       <label className="block text-xs font-semibold text-gray-700 mb-1">
//         Medication Name<span className="text-red-500">*</span>
//       </label>
//       <input
//         type="text"
//         name="medicationName"
//         value={formData.medicationName}
//         onChange={handleChange}
//         className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
//         placeholder="e.g., Amoxicillin"
//       />
//     </div>

//     {/* Duration */}
//     <div>
//       <label className="block text-xs font-semibold text-gray-700 mb-1">
//         Duration<span className="text-red-500">*</span>
//       </label>
//       <input
//         type="text"
//         name="duration"
//         value={formData.duration}
//         onChange={handleChange}
//         className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
//         placeholder="e.g., 7 days"
//       />
//     </div>

//     {/* Dosage */}
//     <div>
//       <label className="block text-xs font-semibold text-gray-700 mb-1">
//         Dosage<span className="text-red-500">*</span>
//       </label>
//       <input
//         type="text"
//         name="dosage"
//         value={formData.dosage}
//         onChange={handleChange}
//         className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
//         placeholder="e.g., 500 mg"
//       />
//     </div>

//     {/* Frequency */}
//     <div>
//       <label className="block text-xs font-semibold text-gray-700 mb-1">
//         Frequency
//       </label>
//       <select
//         name="frequency"
//         value={formData.frequency}
//         onChange={handleChange}
//         className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
//       >
//         <option value="">Select</option>
//         <option value="Once a day">Once a day</option>
//         <option value="Twice a day">Twice a day</option>
//         <option value="After meals">After meals</option>
//       </select>
//     </div>

//     {/* Instruction */}
//     <div>
//       <label className="block text-xs font-semibold text-gray-700 mb-1">
//         Instruction<span className="text-red-500">*</span>
//       </label>
//       <input
//         type="text"
//         name="instruction"
//         value={formData.instruction}
//         onChange={handleChange}
//         className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
//         placeholder="e.g., Take after food"
//       />
//     </div>
//   </div>
// </div>





//         {/* Download Button Only */}
//         <div className="flex justify-end mt-6">
//           <button
//             onClick={handleDownload}
//             className="flex items-center gap-1 px-4 py-2 rounded border border-gray-300 text-gray-600 text-sm hover:bg-gray-100"
//           >
//             <Download size={14} />
//             Download Receipt
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { X, Download, Plus, Trash2 } from "lucide-react";

export default function PrescriptionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  patientId, 
  patientName, 
  patientData 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    appointmentDate: "",
    diagnosis: "",
    medications: []
  });

  // Current medication being added/edited
  const [currentMedication, setCurrentMedication] = useState({
    medicationName: "",
    duration: "",
    dosage: "",
    frequency: "",
    instruction: "",
  });

  const [editingIndex, setEditingIndex] = useState(-1);

  // Fetch existing medication data when modal opens
  useEffect(() => {
    const fetchMedicationData = async () => {
      if (!isOpen || !patientId) return;

      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Try to fetch existing medication data for this patient
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/medications/patient/${patientId}`,
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          const medications = data.medications || [];
          
          if (medications.length > 0) {
            // Use the most recent medication record to prefill
            const latestMedication = medications[0];
            
            setFormData({
              patientName: patientName || `${latestMedication.patientId?.firstName} ${latestMedication.patientId?.lastName}` || '',
              patientId: patientId || '',
              appointmentDate: latestMedication.appointmentDate 
                ? new Date(latestMedication.appointmentDate).toISOString().split('T')[0] 
                : new Date().toISOString().split('T')[0],
              diagnosis: latestMedication.diagnosis || '',
              medications: latestMedication.medications || []
            });
          } else {
            // No existing medication data, use basic patient info
            initializeWithPatientInfo();
          }
        } else {
          // If error (like no medications found), initialize with basic patient info
          initializeWithPatientInfo();
        }
      } catch (error) {
       // console.error('Error fetching medication data:', error);
        initializeWithPatientInfo();
      } finally {
        setLoading(false);
      }
    };

    const initializeWithPatientInfo = () => {
      setFormData({
        patientName: patientName || patientData?.name || '',
        patientId: patientId || '',
        appointmentDate: new Date().toISOString().split('T')[0],
        diagnosis: '',
        medications: []
      });
    };

    fetchMedicationData();
  }, [isOpen, patientId, patientName, patientData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentMedication({
        medicationName: "",
        duration: "",
        dosage: "",
        frequency: "",
        instruction: "",
      });
      setEditingIndex(-1);
      setError('');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMedicationChange = (e) => {
    const { name, value } = e.target;
    setCurrentMedication((prev) => ({ ...prev, [name]: value }));
  };

  const addOrUpdateMedication = () => {
    // Validate current medication
    if (!currentMedication.medicationName.trim()) {
      setError('Medication name is required');
      return;
    }
    if (!currentMedication.dosage.trim()) {
      setError('Dosage is required');
      return;
    }
    if (!currentMedication.duration.trim()) {
      setError('Duration is required');
      return;
    }
    if (!currentMedication.instruction.trim()) {
      setError('Instruction is required');
      return;
    }

    if (editingIndex >= 0) {
      // Update existing medication
      setFormData(prev => ({
        ...prev,
        medications: prev.medications.map((med, index) => 
          index === editingIndex ? { ...currentMedication } : med
        )
      }));
    } else {
      // Add new medication
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, { ...currentMedication }]
      }));
    }

    // Reset form
    setCurrentMedication({
      medicationName: "",
      duration: "",
      dosage: "",
      frequency: "",
      instruction: "",
    });
    setEditingIndex(-1);
    setError('');
  };

  const editMedication = (index) => {
    setCurrentMedication({ ...formData.medications[index] });
    setEditingIndex(index);
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
    
    // If we were editing this medication, cancel the edit
    if (editingIndex === index) {
      setCurrentMedication({
        medicationName: "",
        duration: "",
        dosage: "",
        frequency: "",
        instruction: "",
      });
      setEditingIndex(-1);
    }
  };

  const cancelEdit = () => {
    setCurrentMedication({
      medicationName: "",
      duration: "",
      dosage: "",
      frequency: "",
      instruction: "",
    });
    setEditingIndex(-1);
    setError('');
  };

  const generatePDF = async () => {
    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      let yPos = 20;
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 116, 166);
      doc.text('DentalX – Prescription', pageWidth / 2, yPos, { align: 'center' });
      
      // Line under header
      yPos += 5;
      doc.setDrawColor(40, 116, 166);
      doc.line(20, yPos, pageWidth - 20, yPos);
      
      // Patient Information
      yPos += 15;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Patient Information', 20, yPos);
      
      yPos += 10;
      doc.setFontSize(11);
      const patientInfo = [
        `Patient Name: ${formData.patientName}`,
        `Patient ID: ${formData.patientId}`,
        `Date: ${new Date(formData.appointmentDate).toLocaleDateString()}`,
        `Diagnosis: ${formData.diagnosis}`
      ];
      
      patientInfo.forEach((info) => {
        doc.text(info, 20, yPos);
        yPos += 6;
      });
      
      // Medications Section
      if (formData.medications.length > 0) {
        yPos += 10;
        doc.setFontSize(14);
        doc.text('Prescribed Medications', 20, yPos);
        yPos += 10;
        
        // Create table manually
        const tableHeaders = ['#', 'Medication', 'Dosage', 'Frequency', 'Duration', 'Instructions'];
        const colWidths = [10, 35, 25, 25, 20, 50];
        let xPos = 20;
        
        // Table header
        doc.setFontSize(10);
        doc.setFillColor(40, 116, 166);
        doc.setTextColor(255, 255, 255);
        
        // Draw header background
        doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
        
        tableHeaders.forEach((header, index) => {
          doc.text(header, xPos + 2, yPos);
          xPos += colWidths[index];
        });
        
        yPos += 8;
        
        // Table rows
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        
        formData.medications.forEach((medication, index) => {
          if (yPos > pageHeight - 30) {
            doc.addPage();
            yPos = 20;
          }
          
          xPos = 20;
          const rowData = [
            (index + 1).toString(),
            medication.medicationName,
            medication.dosage,
            medication.frequency,
            medication.duration,
            medication.instruction
          ];
          
          // Alternate row background
          if (index % 2 === 0) {
            doc.setFillColor(248, 249, 250);
            doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
          }
          
          rowData.forEach((data, colIndex) => {
            // Handle text wrapping for long content
            const text = data.length > 15 && colIndex === 5 ? 
              data.substring(0, 15) + '...' : data;
            doc.text(text, xPos + 2, yPos);
            xPos += colWidths[colIndex];
          });
          
          yPos += 8;
        });
        
        // Draw table borders
        doc.setDrawColor(200, 200, 200);
        doc.rect(20, yPos - (formData.medications.length * 8) - 13, pageWidth - 40, (formData.medications.length * 8) + 13);
        
        // Vertical lines
        xPos = 20;
        for (let i = 0; i < colWidths.length; i++) {
          xPos += colWidths[i];
          doc.line(xPos, yPos - (formData.medications.length * 8) - 13, xPos, yPos);
        }
      }
      
      // Footer
      const currentDate = new Date();
      const timestamp = currentDate.toLocaleString();
      
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      
      const footerY = pageHeight - 20;
      doc.text(`Generated on: ${timestamp}`, 20, footerY);
      doc.text('DentalX Management System', pageWidth - 20, footerY, { align: 'right' });
      
      // Generate filename
      const dateStr = currentDate.toISOString().slice(0, 16).replace(/[:-]/g, '').replace('T', '_');
      const filename = `Prescription_${formData.patientId}_${dateStr}.pdf`;
      
      // Download PDF
      doc.save(filename);
      
    } catch (error) {
     // console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const handleDownload = () => {
    if (formData.medications.length === 0) {
      setError('Please add at least one medication before downloading.');
      return;
    }
    
    if (!formData.diagnosis.trim()) {
      setError('Please enter a diagnosis before downloading.');
      return;
    }
    
    generatePDF();
    onSave?.(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Heading */}
        <h2 className="text-lg font-semibold mb-1">Prescription</h2>
        <p className="text-gray-500 text-sm mb-4">Patient Information</p>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-flex items-center">
              <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              Loading prescription data...
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Patient ID
                </label>
                <input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                  readOnly
                />
              </div>
              <div className="md:grid-cols-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                />
              </div>
            </div>

            {/* Diagnosis */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Diagnosis<span className="text-red-500">*</span>
              </label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full resize-none"
                rows={3}
                placeholder="Enter diagnosis..."
              />
            </div>

            {/* Existing Medications List */}
            {formData.medications.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-black mb-2">Added Medications</p>
                <div className="space-y-2">
                  {formData.medications.map((medication, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-800">
                            {index + 1}. {medication.medicationName}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            <span className="mr-3">Dosage: {medication.dosage}</span>
                            <span className="mr-3">Frequency: {medication.frequency}</span>
                            <span className="mr-3">Duration: {medication.duration}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Instructions: {medication.instruction}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-2">
                          <button 
                            onClick={() => editMedication(index)}
                            className="text-blue-500 hover:text-blue-700 text-xs cursor-pointer"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => removeMedication(index)}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm font-medium text-black mb-2 mt-4">
              {editingIndex >= 0 ? 'Edit Medication' : 'Add Medicine Information'}
            </p>

            <div className="bg-gray-100 rounded-lg p-4">
              {/* Top-right icons */}
              <div className="flex justify-end mb-2 space-x-2">
                <button 
                  onClick={addOrUpdateMedication}
                  className="text-green-500 hover:text-green-700 cursor-pointer"
                  title={editingIndex >= 0 ? "Update Medication" : "Add Medication"}
                >
                  <Plus size={16} />
                </button>
                {editingIndex >= 0 && (
                  <button 
                    onClick={cancelEdit}
                    className="text-gray-500 hover:text-red-500 cursor-pointer"
                    title="Cancel Edit"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Grid: 2 columns on md+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Medication Name - Full Width */}
                <div className="md:col-span-2 w-1/2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Medication Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="medicationName"
                    value={currentMedication.medicationName}
                    onChange={handleMedicationChange}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                    placeholder="e.g., Amoxicillin"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Duration<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={currentMedication.duration}
                    onChange={handleMedicationChange}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                    placeholder="e.g., 7 days"
                  />
                </div>

                {/* Dosage */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Dosage<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    value={currentMedication.dosage}
                    onChange={handleMedicationChange}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                    placeholder="e.g., 500 mg"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    name="frequency"
                    value={currentMedication.frequency}
                    onChange={handleMedicationChange}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                  >
                    <option value="">Select</option>
                    <option value="Once Daily">Once Daily</option>
                    <option value="Twice Daily">Twice Daily</option>
                    <option value="Three times Daily">Three times Daily</option>
                    <option value="As needed">As needed</option>
                    <option value="After meals">After meals</option>
                  </select>
                </div>

                {/* Instruction */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Instruction<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="instruction"
                    value={currentMedication.instruction}
                    onChange={handleMedicationChange}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                    placeholder="e.g., Take after food"
                  />
                </div>
              </div>

              {/* Add/Update Button */}
              <div className="flex justify-end mt-3">
                <button
                  onClick={addOrUpdateMedication}
                  className={`px-4 py-2 text-white text-sm rounded-md cursor-pointer ${
                    editingIndex >= 0 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {editingIndex >= 0 ? 'Update Medication' : 'Add Medication'}
                </button>
                {editingIndex >= 0 && (
                  <button
                    onClick={cancelEdit}
                    className="ml-2 px-4 py-2 text-gray-600 text-sm hover:text-gray-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Download Button Only */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-4 py-2 rounded border border-gray-300 text-gray-600 text-sm hover:bg-gray-100 cursor-pointer"
              >
                <Download size={14} />
                Download Receipt
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
