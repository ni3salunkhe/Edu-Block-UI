import React, { useState } from 'react';
import TrustCommandCenter from '../../components/institution/intelligence/TrustCommandCenter';
import CredentialQualityAnalytics from '../../components/institution/intelligence/CredentialQualityAnalytics';
import TrustTimeline from '../../components/institution/intelligence/TrustTimeline';
import RiskIntelligenceCenter from '../../components/institution/intelligence/RiskIntelligenceCenter';
import BenchmarkingCenter from '../../components/institution/intelligence/BenchmarkingCenter';
import IssuanceIntelligence from '../../components/institution/intelligence/IssuanceIntelligence';
import ReputationInsights from '../../components/institution/intelligence/ReputationInsights';
import ImprovementRecommendations from '../../components/institution/intelligence/ImprovementRecommendations';
import TrustSimulationPanel from '../../components/institution/intelligence/TrustSimulationPanel';

const InstitutionIntelligencePortal = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Command Center', icon: '✦' },
        { id: 'quality', label: 'Quality Analytics', icon: '📊' },
        { id: 'timeline', label: 'Trust Timeline', icon: '⏱' },
        { id: 'risk', label: 'Risk Intelligence', icon: '⚠' },
        { id: 'benchmark', label: 'Benchmarking', icon: '📈' },
        { id: 'issuance', label: 'Issuance Trends', icon: '🎓' },
        { id: 'reputation', label: 'Reputation Insights', icon: '🌟' },
        { id: 'improve', label: 'Recommendations', icon: '💡' },
        { id: 'simulate', label: 'Trust Simulator', icon: '⚡' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <TrustCommandCenter />;
            case 'quality': return <CredentialQualityAnalytics />;
            case 'timeline': return <TrustTimeline />;
            case 'risk': return <RiskIntelligenceCenter />;
            case 'benchmark': return <BenchmarkingCenter />;
            case 'issuance': return <IssuanceIntelligence />;
            case 'reputation': return <ReputationInsights />;
            case 'improve': return <ImprovementRecommendations />;
            case 'simulate': return <TrustSimulationPanel />;
            default: return <TrustCommandCenter />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-700 font-sans p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2 translate-y-1/2"></div>
                    
                    <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Institution Intelligence Portal</h1>
                            <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">
                                Active trust ecosystem monitor. Understand your institution's reputation, credential quality, and actionable improvements to maintain top-tier verification standing.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Navigation */}
                    <div className="lg:w-64 shrink-0">
                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm sticky top-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Intelligence Modules</h3>
                            <nav className="space-y-1">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                            activeTab === tab.id 
                                            ? 'bg-blue-600 text-gray-900 shadow-md' 
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }`}
                                    >
                                        <span>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Active Module Panel */}
                    <div className="flex-1 min-w-0">
                        {renderContent()}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InstitutionIntelligencePortal;
