import React, { useState } from 'react';
import EmployerTrustDashboard from '../../components/employer/intelligence/EmployerTrustDashboard';
import VerificationPortfolioAnalytics from '../../components/employer/intelligence/VerificationPortfolioAnalytics';
import TrustComparisonWorkspace from '../../components/employer/intelligence/TrustComparisonWorkspace';
import EmployerDecisionSupport from '../../components/employer/intelligence/EmployerDecisionSupport';

const EmployerIntelligencePortal = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const tabs = [
        { id: 'dashboard', label: 'Trust Dashboard', icon: '📊' },
        { id: 'portfolio', label: 'Portfolio Analytics', icon: '📈' },
        { id: 'compare', label: 'Candidate Compare', icon: '⚖️' },
        { id: 'decisions', label: 'Decision Support', icon: '🧠' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <EmployerTrustDashboard />;
            case 'portfolio': return <VerificationPortfolioAnalytics />;
            case 'compare': return <TrustComparisonWorkspace />;
            case 'decisions': return <EmployerDecisionSupport />;
            default: return <EmployerTrustDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-700 font-sans p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2 translate-y-1/2"></div>
                    
                    <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Hiring Trust Intelligence</h1>
                            <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">
                                Advanced decision support system. Evaluate verified candidates, assess credential authenticity, and compare applicant trust profiles securely.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Navigation */}
                    <div className="lg:w-64 shrink-0">
                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm sticky top-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Hiring Intelligence</h3>
                            <nav className="space-y-1">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                            activeTab === tab.id 
                                            ? 'bg-indigo-600 text-gray-900 shadow-md' 
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

export default EmployerIntelligencePortal;
