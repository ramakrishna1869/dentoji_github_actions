//ColorLegend
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import teeth from '../../../assets/Teeth.png';

// Dental issues definitions
const dentalIssues = {
    cavity: { label: 'Cavity', color: '#000000', subtext: 'Cavity/Decay' },
    gumDisease: { label: 'Gum disease', color: '#EF4444', subtext: 'Scaling/Polishing' },
    filling: { label: 'Filling', color: '#9CA3AF', subtext: 'Restoration/Filling' },
    missing: { label: 'Missing', color: '#3B82F6', subtext: 'Extracted' },
    rootCanal: { label: 'Root Canal', color: '#A855F7', subtext: 'RCT' },
    other: { label: 'Other', color: '#F59E0B', subtext: 'Other' }
};

const ColorLegend = ({ isAddingComment, onToggleComment, onDragStart, onDragEnd }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseEnter = () => {
        setIsHovering(true);
        // Auto-enable comment mode when hovering
        if (!isAddingComment) {
            onToggleComment();
        }
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
    };

    const handleDragStart = (e) => {
        setIsDragging(true);
        // Set drag data
        e.dataTransfer.setData('text/plain', 'extra-tooth');
        e.dataTransfer.effectAllowed = 'copy';
        
        // Create a custom drag image (optional)
        const dragImage = document.createElement('div');
        dragImage.innerHTML = '🦷';
        dragImage.style.fontSize = '24px';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 12, 12);
        
        // Clean up drag image after a short delay
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);

        // Call parent handler if provided
        if (onDragStart) {
            onDragStart(e);
        }
    };

    const handleDragEnd = (e) => {
        setIsDragging(false);
        
        // Call parent handler if provided
        if (onDragEnd) {
            onDragEnd(e);
        }
    };

    const handleClick = () => {
        if (!isDragging) {
            onToggleComment();
        }
    };

    return (
        <div className="flex items-center justify-center h-full">
            <div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-50 border border-gray-200 rounded-xl p-6 min-w-[200px] flex flex-col justify-between"> 
                    <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Color Legend</h3>
                    <div className="grid grid-cols-1 gap-3 border-t border-gray-200 pt-3">
                        {Object.entries(dentalIssues).map(([key, issue]) => (
                            <div key={key} className="flex items-center space-x-3">
                                <div
                                    className="w-4 h-4 rounded-full shadow-sm"
                                    style={{ backgroundColor: issue.color }}
                                ></div>
                                <span className="text-sm font-medium text-gray-700">{issue.label}</span>
                            </div>
                        ))}
                        <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-300"></div>
                            <span className="text-sm font-medium text-gray-700">Healthy</span>
                        </div>
                    </div>
                </div>
                
                {/* Simplified text-like button with tooltip */}
                <div className="mt-6 flex justify-center border border-blue-800 rounded-lg p-2">
                    <div className="relative group ">
                        <button
                            onClick={handleClick}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            draggable={isHovering || isAddingComment}
                            className={`text-blue-800  cursor-pointer hover:text-blue-800 ${
                                isAddingComment ? 'font-medium' : 'font-normal'
                            }`}
                        >
                            <img 
                                src={teeth} 
                                className="inline-block w-10 h-10 mr-1" 
                                alt="Teeth icon"
                                draggable={false}
                            />
                            Add Extra Teeth
                        </button>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                            <div className="flex items-center space-x-2">
                                <span>🦷</span>
                                <span>Drag to add teeth!</span>
                            </div>
                            {/* Tooltip arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { dentalIssues };
export default ColorLegend;