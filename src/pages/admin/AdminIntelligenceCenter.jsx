import React, { useState } from 'react';
import GlobalMetricsDashboard from '../../components/admin/intelligence/GlobalMetricsDashboard';
import CampaignDashboard from '../../components/admin/intelligence/CampaignDashboard';
import TrustDashboard from '../../components/admin/intelligence/TrustDashboard';
import DriftAnalyticsPanel from '../../components/admin/intelligence/DriftAnalyticsPanel';
import NetworkIntelligenceDashboard from '../../components/admin/intelligence/NetworkIntelligenceDashboard';
import EvidenceExplorer from '../../components/admin/intelligence/EvidenceExplorer';
import FraudSignatureDashboard from '../../components/admin/intelligence/FraudSignatureDashboard';
import RuleConfigurationPanel from '../../components/admin/intelligence/RuleConfigurationPanel';
import InvestigationAuditTimeline from '../../components/admin/intelligence/InvestigationAuditTimeline';
import EscalationManagementPanel from '../../components/admin/intelligence/EscalationManagementPanel';

const AdminIntelligenceCenter = () => {
    const [activeTab, setActiveTab] = useState('Overview');

    const tabs = [
        { id: 'Overview', label: 'Global Overview' },
        { id: 'Escalations', label: 'Escalations' },
        { id: 'Campaigns', label: 'Campaign Intelligence' },
        { id: 'Trust', label: 'Trust Intelligence' },
        { id: 'Learning', label: 'Learning Intelligence' },
        { id: 'Network', label: 'Network Intelligence' },
        { id: 'Evidence', label: 'Evidence Explorer' },
        { id: 'Signatures', label: 'Fraud Signatures' },
        { id: 'Rules', label: 'Rule Management' },
        { id: 'Audit', label: 'Investigation Audit' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'Overview': return <GlobalMetricsDashboard />;
            case 'Escalations': return <EscalationManagementPanel />;
            case 'Campaigns': return <CampaignDashboard />;
            case 'Trust': return <TrustDashboard />;
            case 'Learning': return <DriftAnalyticsPanel />;
            case 'Network': return <NetworkIntelligenceDashboard />;
            case 'Evidence': return <EvidenceExplorer />;
            case 'Signatures': return <FraudSignatureDashboard />;
            case 'Rules': return <RuleConfigurationPanel />;
            case 'Audit': return <InvestigationAuditTimeline />;
            default: return <GlobalMetricsDashboard />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 text-gray-700">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <span className="text-blue-500">⚡</span> Admin Intelligence Center
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Global Command & Control for Platform Trust, Fraud, and AI Effectiveness</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 px-6 pt-2">
                <div className="flex overflow-x-auto hide-scrollbar gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-slate-600'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminIntelligenceCenter;
