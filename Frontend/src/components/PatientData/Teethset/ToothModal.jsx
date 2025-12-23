import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

// Dental issues definitions
const dentalIssues = {
    cavity: { label: 'Cavity', color: '#000000', subtext: 'Cavity/Decay' },
    gumDisease: { label: 'Gum disease', color: '#EF4444', subtext: 'Scaling/Polishing' },
    filling: { label: 'Filling', color: '#9CA3AF', subtext: 'Restoration/Filling' },
    missing: { label: 'Missing', color: '#3B82F6', subtext: 'Extracted' },
    rootCanal: { label: 'Root Canal', color: '#A855F7', subtext: 'RCT' },
    other: { label: 'Other', color: '#F59E0B', subtext: 'Other' }
};

const ToothModal = ({ 
    show, 
    currentTooth, 
    isAdult, 
    toothIssues, 
    notes, 
    onSave, 
    onCancel, 
    onIssueSelect, 
    getToothTypeName,
    patientId
}) => {
    const [currentNote, setCurrentNote] = useState(notes[currentTooth] || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (currentTooth) {
            setCurrentNote(notes[currentTooth] || '');
        }
        setError(null); // Clear errors when modal opens
    }, [currentTooth, notes]);

    if (!show || !currentTooth) return null;

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            onSave(currentTooth, currentNote);
            setCurrentNote('');
            
        } catch (error) {
           // console.error('Error in tooth modal save:', error);
            setError(error.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleIssueSelect = async (issueType) => {
        try {
            setSaving(true);
            setError(null);
            await onIssueSelect(issueType);
            
        } catch (error) {
          //  console.error('Error selecting issue:', error);
            setError(error.message || 'Failed to update tooth issue');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setError(null);
        onCancel();
        setCurrentNote('');
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col">
                <div className="flex justify-between items-start px-6 py-4 sticky top-0 bg-white z-20 rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Tooth {currentTooth}</h2>
                        <p className="text-gray-600">{getToothTypeName(currentTooth, isAdult)}</p>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        disabled={saving}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                            <button 
                                onClick={() => setError(null)}
                                className="text-red-600 hover:text-red-800 text-xs font-medium mt-1 cursor-pointer"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Coding</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(dentalIssues).map(([key, issue]) => {
                                const isSelected = toothIssues[currentTooth] && toothIssues[currentTooth].includes(key);
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleIssueSelect(key)}
                                        disabled={saving}
                                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                                            isSelected
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300 bg-white"
                                        } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div
                                            className="w-4 h-4 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: issue.color }}
                                        ></div>
                                        <div className="text-left">
                                            <div className="font-medium text-gray-900">{issue.label}</div>
                                            <div className="text-sm text-gray-600">{issue.subtext}</div>
                                        </div>
                                        {isSelected && <div className="ml-auto text-blue-600">✓</div>}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={() => handleIssueSelect(null)}
                                disabled={saving}
                                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                                    !toothIssues[currentTooth] || toothIssues[currentTooth].length === 0
                                        ? "border-green-500 bg-green-50"
                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                } w-full ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-300 flex-shrink-0"></div>
                                <div className="text-left">
                                    <div className="font-medium text-gray-900">Healthy</div>
                                    <div className="text-sm text-gray-600">No issues detected</div>
                                </div>
                                {(!toothIssues[currentTooth] || toothIssues[currentTooth].length === 0) && (
                                    <div className="ml-auto text-green-600">✓</div>
                                )}
                            </button>
                        </div>
                    </div>

                    {toothIssues[currentTooth] && toothIssues[currentTooth].length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Issues:</h4>
                            <div className="space-y-2">
                                {toothIssues[currentTooth].map((issueType, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: dentalIssues[issueType].color }}
                                            ></div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {dentalIssues[issueType].label}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {dentalIssues[issueType].subtext}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleIssueSelect(issueType)}
                                            disabled={saving}
                                            className={`text-red-600 hover:text-red-800 font-medium text-sm bg-white px-2 py-1 rounded border cursor-pointer ${
                                                saving ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes & Comments</h3>
                        <textarea
                            value={currentNote}
                            onChange={(e) => setCurrentNote(e.target.value)}
                            placeholder="Add any notes, observations, or treatment plans for this tooth..."
                            className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={saving}
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4 px-6 py-4 sticky bottom-0 bg-white z-20 rounded-b-2xl">
                    <button
                        onClick={handleCancel}
                        disabled={saving}
                        className={`px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer ${
                            saving ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer flex items-center space-x-2 ${
                            saving ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                        <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ToothModal;