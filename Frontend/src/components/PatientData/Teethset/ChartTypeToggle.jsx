import React from 'react';

const ChartTypeToggle = ({ isAdult, onToggle }) => {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-max p-2">
                <button
                    onClick={() => onToggle(true)}
                    className={`px-6 py-2 font-medium transition-colors duration-200 cursor-pointer ${
                        isAdult
                            ? "bg-blue-600 text-white rounded-lg"
                            : "bg-white text-gray-700 hover:bg-gray-100 rounded-lg"
                    }`}
                >
                    Adult
                </button>
                <button
                    onClick={() => onToggle(false)}
                    className={`px-6 py-2 font-medium transition-colors duration-200 cursor-pointer ${
                        !isAdult
                            ? "bg-blue-600 text-white rounded-lg"
                            : "bg-white text-gray-700 hover:bg-gray-100 rounded-lg"
                    }`}
                >
                    Child
                </button>
            </div>
        </div>
    );
};

export default ChartTypeToggle;