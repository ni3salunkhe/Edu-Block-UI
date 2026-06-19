import React, { useState } from "react";

const PriorityBadge = ({ basePriority, escalationPoints, finalPriority }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div 
            className="relative inline-block cursor-help"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold transition ${
                finalPriority >= 75 ? "bg-red-100 text-red-800" :
                finalPriority >= 50 ? "bg-orange-100 text-orange-800" :
                "bg-blue-100 text-blue-800"
            }`}>
                {finalPriority} {finalPriority >= 50 && "🔥"}
            </span>

            {showTooltip && (
                <div className="absolute z-50 w-48 p-3 mt-2 -left-16 text-xs text-white bg-gray-900 rounded-lg shadow-xl border border-gray-700 animate-fadeIn">
                    <div className="font-bold mb-2 border-b border-gray-700 pb-1 text-gray-200">AI Priority Details</div>
                    <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Base Priority:</span>
                        <span className="font-medium text-gray-100">{basePriority}</span>
                    </div>
                    <div className="flex justify-between mb-1 text-orange-400">
                        <span>Escalations:</span>
                        <span className="font-medium">+{escalationPoints}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-gray-700 pt-2 mt-2 text-red-400">
                        <span>Final Priority:</span>
                        <span>{finalPriority}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PriorityBadge;
