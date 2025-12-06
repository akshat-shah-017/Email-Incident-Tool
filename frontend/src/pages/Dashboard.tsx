import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, List, CheckCircle, Clock } from 'lucide-react';
import { getIncidents } from '../utils/api';
import { DragDropZone, SearchFilter, IncidentTable } from '../components';
import type { IncidentFilters } from '../utils/types';

type TabType = 'all' | 'open' | 'closed';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [filters, setFilters] = useState<IncidentFilters>({});
    const [page, setPage] = useState(1);
    const limit = 20;

    // Derive status filter from active tab
    const effectiveFilters: IncidentFilters = {
        ...filters,
        status: activeTab === 'all' ? undefined : (activeTab === 'closed' ? 'complete' : 'incomplete'),
    };

    // Fetch incidents
    const incidentsQuery = useQuery({
        queryKey: ['incidents', page, limit, effectiveFilters],
        queryFn: () => getIncidents(page, limit, effectiveFilters),
    });

    const handleFilterChange = (newFilters: IncidentFilters) => {
        // Remove status from filters since it's controlled by tabs
        const { status: _, ...filtersWithoutStatus } = newFilters;
        setFilters(filtersWithoutStatus);
        setPage(1);
    };

    const handleClearFilters = () => {
        setFilters({});
        setPage(1);
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setPage(1);
    };

    const tabs = [
        { id: 'all' as TabType, label: 'All', icon: List, count: null },
        { id: 'open' as TabType, label: 'Open', icon: Clock, count: null },
        { id: 'closed' as TabType, label: 'Closed', icon: CheckCircle, count: null },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-surface-100 flex items-center gap-2">
                    <Mail className="w-6 h-6 text-surface-400" />
                    Email Incident Tool
                </h1>
                <p className="text-surface-500 text-sm">
                    Upload and manage email incidents
                </p>
            </div>

            {/* Upload Section */}
            <section>
                <DragDropZone />
            </section>

            {/* Incidents Section */}
            <section>
                <h2 className="text-lg font-medium text-surface-200 mb-4">Incidents</h2>

                {/* Tab Navigation */}
                <div
                    className="flex gap-1 p-1.5 mb-4 rounded-xl border border-surface-700/50"
                    style={{
                        background: 'linear-gradient(135deg, rgba(30, 30, 35, 0.6) 0%, rgba(20, 20, 25, 0.8) 100%)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    }}
                >
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex-1 justify-center
                                    ${isActive
                                        ? 'bg-surface-700/80 text-surface-100 shadow-md'
                                        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-400' : ''}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Search & Filters */}
                <div className="mb-4">
                    <SearchFilter
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClear={handleClearFilters}
                    />
                </div>

                {/* Incidents Table */}
                <IncidentTable
                    incidents={incidentsQuery.data?.data ?? []}
                    isLoading={incidentsQuery.isLoading}
                    pagination={incidentsQuery.data?.meta ?? null}
                    onPageChange={setPage}
                    showCompletionDate={activeTab === 'closed'}
                />
            </section>
        </div>
    );
}
