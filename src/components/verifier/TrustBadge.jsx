import React from "react";

const TrustBadge = ({ trustTier, trustScore }) => {
    const tier = (trustTier || "MEDIUM").toUpperCase().replace("_", " ");
    const score = trustScore !== undefined && trustScore !== null ? trustScore : 50;

    const getColor = (s) => {
        if (s >= 80) return "bg-green-100 text-green-800 border border-green-200";
        if (s >= 65) return "bg-emerald-50 text-emerald-700 border border-emerald-100";
        if (s >= 50) return "bg-yellow-100 text-yellow-800 border border-yellow-200";
        if (s >= 35) return "bg-orange-100 text-orange-800 border border-orange-200";
        return "bg-red-100 text-red-800 border border-red-200 font-semibold";
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase ${getColor(score)}`}>
            {tier} ({score})
        </span>
    );
};

export default TrustBadge;
