import React from "react";

const EvidenceTimeline = ({ doc, verification, recommendation, networkData }) => {
    const events = [];

    // 1. Document Uploaded
    if (doc && doc.issuedAt) {
        events.push({
            time: new Date(doc.issuedAt),
            title: "Document Uploaded",
            source: "Individual Vault / Institution Issuer",
            details: `File "${doc.fileName}" uploaded. SHA-256 Hash registered: ${doc.sha256Hash || "N/A"}`,
            color: "bg-blue-500",
        });
    }

    // 2. OCR Extraction
    if (verification && verification.processedAt) {
        events.push({
            time: new Date(verification.processedAt),
            title: "OCR Extraction Completed",
            source: "AI-1 Optical Intelligence",
            details: `Document layout parsed. Metadata text hash generated: ${verification.ocrTextHash || "N/A"}. Processed under engine version ${verification.verificationModelVersion || "v1"}.`,
            color: "bg-purple-500",
        });
    }

    // 3. Fraud Signals
    if (verification && verification.fraudSignals && verification.fraudSignals.length > 0) {
        verification.fraudSignals.forEach(sig => {
            events.push({
                time: sig.detectedAt ? new Date(sig.detectedAt) : new Date(verification.processedAt),
                title: `Fraud Signal Detected: ${sig.signalType}`,
                source: "AI-2 Rule & Fraud Detection Engine",
                details: `Severity: ${sig.severity}. ${sig.description}`,
                color: "bg-red-500",
            });
        });
    }

    // 4. Trust Evaluated
    if (doc && doc.issuedAt) {
        const trustTime = new Date(doc.issuedAt);
        trustTime.setSeconds(trustTime.getSeconds() + 2);
        events.push({
            time: trustTime,
            title: "Institution Trust Evaluated",
            source: "AI-3 Trust Engine",
            details: `Determined trust score and tier for issuing institution.`,
            color: "bg-emerald-500",
        });
    }

    // 5. Recommendation Generated
    if (recommendation && recommendation.generatedAt) {
        events.push({
            time: new Date(recommendation.generatedAt),
            title: `AI Recommendation Generated: ${recommendation.recommendation}`,
            source: "AI-4 Reviewer Copilot",
            details: `Generated recommendation with confidence level ${recommendation.confidence || "MEDIUM"}. Reasoning: ${recommendation.explanationSummary ? recommendation.explanationSummary.join(", ") : "N/A"}`,
            color: "bg-orange-500",
        });
    }

    // 6. Escalation Created
    if (networkData && networkData.escalations && networkData.escalations.length > 0) {
        networkData.escalations.forEach(esc => {
            events.push({
                time: esc.createdAt ? new Date(esc.createdAt) : new Date(recommendation.generatedAt || Date.now()),
                title: `Priority Escalation Created`,
                source: `AI-6 Network Graph (${esc.sourceType})`,
                details: `Added +${esc.escalationPoints} priority points. Reason: ${esc.reason}`,
                color: "bg-rose-500 animate-pulse",
            });
        });
    }

    events.sort((a, b) => a.time - b.time);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm">
            <h4 className="font-semibold text-gray-800 border-b border-gray-50 pb-3 mb-6">Unified Explainability Timeline</h4>
            
            {events.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-6">No timeline events recorded.</p>
            ) : (
                <div className="relative border-l border-gray-200 ml-4 space-y-8">
                    {events.map((evt, idx) => (
                        <div key={idx} className="relative pl-6">
                            {/* Dot */}
                            <span className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow ${evt.color}`}></span>
                            
                            <div className="text-xs">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h5 className="font-bold text-gray-800 text-sm">{evt.title}</h5>
                                    <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                        {evt.time.toLocaleString()}
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-blue-600 block mt-1 uppercase tracking-wider">
                                    Source: {evt.source}
                                </span>
                                <p className="text-gray-600 mt-1 font-medium leading-relaxed">
                                    {evt.details}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EvidenceTimeline;
