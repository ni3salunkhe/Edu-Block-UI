import React from "react";

const RiskBadge = ({ riskLevel }) => {
    const level = (riskLevel || "LOW").toUpperCase();
    const config = {
        CRITICAL: "bg-red-600 text-white border border-red-700 font-extrabold shadow-sm animate-pulse",
        HIGH: "bg-red-100 text-red-800 border border-red-200 font-semibold",
        MEDIUM: "bg-orange-100 text-orange-800 border border-orange-200 font-medium",
        LOW: "bg-green-100 text-green-800 border border-green-200 font-normal",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs transition uppercase tracking-wider ${config[level] || config.LOW}`}>
            {level}
        </span>
    );
};

export default RiskBadge;
