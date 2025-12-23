import React from 'react';
import { Trash2, Edit } from 'lucide-react';
import { dentalIssues } from './ColorLegend';

// Function to convert tooth numbers to quadrant-position format
const getQuadrantLabel = (toothNumber, isChild = false) => {
    if (isChild) {
        // Child teeth mapping (A-T to quadrant-position)
       const childMapping = {
            'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E',
            'F': 'F', 'G': 'G', 'H': 'H', 'I': 'I', 'J': 'J',
            'K': 'K', 'L': 'L', 'M': 'M', 'N': 'N', 'O': 'O',
            'P': 'P', 'Q': 'Q', 'R': 'R', 'S': 'S', 'T': 'T'
        };
        return childMapping[toothNumber] || toothNumber;
    } else {
        // Adult teeth mapping (11-18, 21-28, 31-38, 41-48 to quadrant-position)
        const adultMapping = {
            // Quadrant 1 (Upper Right) - 1-8 to 1-1
            '18': '1-8', '17': '1-7', '16': '1-6', '15': '1-5', '14': '1-4', '13': '1-3', '12': '1-2', '11': '1-1',
            // Quadrant 2 (Upper Left) - 2-1 to 2-8
            '21': '2-1', '22': '2-2', '23': '2-3', '24': '2-4', '25': '2-5', '26': '2-6', '27': '2-7', '28': '2-8',
            // Quadrant 3 (Lower Left) - 3-1 to 3-8
            '31': '3-1', '32': '3-2', '33': '3-3', '34': '3-4', '35': '3-5', '36': '3-6', '37': '3-7', '38': '3-8',
            // Quadrant 4 (Lower Right) - 4-1 to 4-8
            '41': '4-1', '42': '4-2', '43': '4-3', '44': '4-4', '45': '4-5', '46': '4-6', '47': '4-7', '48': '4-8'
        };
        return adultMapping[toothNumber] || toothNumber;
    }
};

// Helper function to determine if tooth ID represents a child tooth
const isChildTooth = (toothId) => {
    return /^[A-T]$/.test(toothId);
};

const IssuesSummary = ({ toothIssues, onRemoveIssue, onEditTooth }) => {
    const getTotalIssuesCount = () => {
        return Object.values(toothIssues).reduce((total, issues) => total + issues.length, 0);
    };

    if (Object.keys(toothIssues).length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Identified Issues</h3>
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {getTotalIssuesCount()} issue{getTotalIssuesCount() > 1 ? 's' : ''} on {Object.keys(toothIssues).length} tooth{Object.keys(toothIssues).length > 1 ? 's' : ''}
                </span>
            </div>
            <div className="flex flex-wrap gap-3">
                {Object.entries(toothIssues).map(([toothId, issues]) => {
                    const quadrantLabel = getQuadrantLabel(toothId, isChildTooth(toothId));
                    
                    return (
                        <div key={toothId} className="bg-white border border-red-200 p-4 rounded-lg shadow-sm">
                            <div className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                <span>Tooth {quadrantLabel}</span>
                                {/* <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    ({toothId})
                                </span> */}
                            </div>
                            <div className="space-y-2">
                                {issues.map((issueType, index) => (
                                    <div key={index} className="flex items-center justify-between space-x-2 bg-gray-50 px-3 py-2 rounded">
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: dentalIssues[issueType].color }}
                                            ></div>
                                            <span className="text-sm text-gray-700">{dentalIssues[issueType].label}</span>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => onRemoveIssue(toothId, issueType)}
                                                className="text-red-500 hover:text-red-700 font-bold text-sm cursor-pointer"
                                                title="Remove issue"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onEditTooth(toothId)}
                                                className="text-green-600 hover:text-green-800 font-medium text-sm cursor-pointer"
                                                title="Edit tooth"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default IssuesSummary;