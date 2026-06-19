const fs = require('fs');
const path = require('path');

const directories = [
    'src/pages/admin',
    'src/components/admin/intelligence',
    'src/pages/institution',
    'src/components/institution/intelligence',
    'src/pages/employer',
    'src/components/employer/intelligence'
];

const fileNamesToProcess = [
    'AdminIntelligenceCenter.jsx',
    'CampaignDashboard.jsx',
    'DriftAnalyticsPanel.jsx',
    'EvidenceExplorer.jsx',
    'FraudSignatureDashboard.jsx',
    'GlobalMetricsDashboard.jsx',
    'InvestigationAuditTimeline.jsx',
    'NetworkIntelligenceDashboard.jsx',
    'RuleConfigurationPanel.jsx',
    'TrustDashboard.jsx',
    'InstitutionIntelligencePortal.jsx',
    'BenchmarkingCenter.jsx',
    'CredentialQualityAnalytics.jsx',
    'ImprovementRecommendations.jsx',
    'IssuanceIntelligence.jsx',
    'ReputationInsights.jsx',
    'RiskIntelligenceCenter.jsx',
    'TrustCommandCenter.jsx',
    'TrustSimulationPanel.jsx',
    'TrustTimeline.jsx',
    'EmployerIntelligencePortal.jsx',
    'EmployerTrustDashboard.jsx',
    'VerificationPortfolioAnalytics.jsx',
    'TrustComparisonWorkspace.jsx',
    'EmployerDecisionSupport.jsx',
    'CandidateTrustIntelligence.jsx',
    'CredentialIntelligence.jsx',
    'InstitutionReputationCard.jsx',
    'HiringRiskCenter.jsx'
];

const replacements = [
    [/bg-slate-900\/50/g, 'bg-gray-50'],
    [/bg-slate-900\/30/g, 'bg-gray-50'],
    [/bg-slate-900/g, 'bg-gray-50'],
    [/bg-slate-800/g, 'bg-white'],
    [/border-slate-700\/50/g, 'border-gray-200'],
    [/border-slate-700/g, 'border-gray-200'],
    [/border-slate-800/g, 'border-gray-100'],
    [/text-slate-300/g, 'text-gray-700'],
    [/text-slate-200/g, 'text-gray-700'],
    [/text-white/g, 'text-gray-900'],
    [/text-slate-400/g, 'text-gray-500'],
    [/text-slate-500/g, 'text-gray-400'],
    [/bg-slate-700\/20/g, 'bg-gray-100'],
    [/bg-slate-700\/50/g, 'bg-gray-100'],
    [/bg-slate-700/g, 'bg-gray-100'],
    [/hover:bg-slate-700\/20/g, 'hover:bg-gray-50'],
    [/hover:bg-slate-700/g, 'hover:bg-gray-100'],
    [/hover:bg-slate-600/g, 'hover:bg-gray-200'],
    [/bg-slate-800\/50/g, 'bg-white'],
    [/divide-slate-700\/50/g, 'divide-gray-100'],
    [/divide-slate-700/g, 'divide-gray-200'],
    [/divide-slate-800/g, 'divide-gray-100'],
    [/bg-indigo-900\/20/g, 'bg-indigo-50'],
    [/border-indigo-500\/20/g, 'border-indigo-100'],
    [/bg-red-900\/50/g, 'bg-red-50'],
    [/border-red-800/g, 'border-red-200'],
    [/bg-orange-900\/50/g, 'bg-orange-50'],
    [/border-orange-800/g, 'border-orange-200'],
    [/bg-emerald-900\/50/g, 'bg-emerald-50'],
    [/border-emerald-800/g, 'border-emerald-200'],
    [/bg-blue-900\/50/g, 'bg-blue-50'],
    [/border-blue-800/g, 'border-blue-200'],
    [/bg-emerald-900\/10/g, 'bg-emerald-50'],
    [/border-emerald-900\/50/g, 'border-emerald-200'],
    [/bg-red-900\/10/g, 'bg-red-50'],
    [/border-red-900\/50/g, 'border-red-200'],
    [/bg-orange-900\/10/g, 'bg-orange-50'],
    [/border-orange-900\/50/g, 'border-orange-200'],
    [/text-emerald-400/g, 'text-emerald-600'],
    [/text-emerald-300/g, 'text-emerald-600'],
    [/text-indigo-400/g, 'text-indigo-600'],
    [/text-indigo-300/g, 'text-indigo-600'],
    [/text-red-400/g, 'text-red-600'],
    [/text-red-300/g, 'text-red-600'],
    [/text-orange-400/g, 'text-orange-600'],
    [/text-orange-300/g, 'text-orange-600'],
    [/text-blue-400/g, 'text-blue-600'],
    [/text-blue-300/g, 'text-blue-600'],
    [/bg-slate-950/g, 'bg-white'],
    [/bg-gray-900/g, 'bg-white'],
    [/from-slate-900/g, 'from-gray-50'],
    [/to-slate-800/g, 'to-white']
];

directories.forEach(dir => {
    const fullDir = path.join(__dirname, dir);
    if (!fs.existsSync(fullDir)) return;
    const files = fs.readdirSync(fullDir);
    files.forEach(file => {
        if (fileNamesToProcess.includes(file)) {
            const filePath = path.join(fullDir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            let orig = content;
            replacements.forEach(([pattern, repl]) => {
                content = content.replace(pattern, repl);
            });
            if (content !== orig) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Updated: ' + filePath);
            }
        }
    });
});
console.log('Theme conversion complete.');
