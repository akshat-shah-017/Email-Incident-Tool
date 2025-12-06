import { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import type { IncidentFilters } from '../utils/types';

interface SearchFilterProps {
    filters: IncidentFilters;
    onFilterChange: (filters: IncidentFilters) => void;
    onClear: () => void;
}

export default function SearchFilter({ filters, onFilterChange, onClear }: SearchFilterProps) {
    const [localSearch, setLocalSearch] = useState(filters.search || '');
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange({ ...filters, search: localSearch || undefined });
        }, 300);
        return () => clearTimeout(timer);
    }, [localSearch]);

    // Sync local state with external filters
    useEffect(() => {
        setLocalSearch(filters.search || '');
    }, [filters.search]);

    const hasActiveFilters = !!(
        filters.search ||
        filters.senderEmail ||
        filters.subject ||
        filters.startDate ||
        filters.endDate ||
        filters.incidentId ||
        filters.priority ||
        filters.sortBy
    );

    const handleAdvancedChange = (field: keyof IncidentFilters, value: string) => {
        onFilterChange({
            ...filters,
            [field]: value || undefined,
        });
    };

    return (
        <div className="card space-y-4">
            {/* Main search bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input
                        type="text"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        placeholder="Search incidents by subject, sender, or content..."
                        className="input pl-10"
                    />
                    {localSearch && (
                        <button
                            onClick={() => setLocalSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-surface-700 text-surface-400 hover:text-surface-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Priority Filter Dropdown */}
                <select
                    value={filters.priority || ''}
                    onChange={(e) => handleAdvancedChange('priority', e.target.value)}
                    className="input w-auto min-w-[140px]"
                >
                    <option value="">All Priority</option>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                    <option value="unassigned">⚪ Unassigned</option>
                    <option value="assigned">✓ Assigned</option>
                </select>

                {/* Sort By Dropdown */}
                <select
                    value={filters.sortBy || 'date'}
                    onChange={(e) => handleAdvancedChange('sortBy', e.target.value)}
                    className="input w-auto min-w-[130px]"
                >
                    <option value="date">Sort by Date</option>
                    <option value="priority">Sort by Priority</option>
                </select>

                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`btn btn-secondary ${showAdvanced ? 'bg-primary-500/20 border-primary-500' : ''}`}
                >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">More</span>
                    {hasActiveFilters && (
                        <span className="w-2 h-2 rounded-full bg-primary-500" />
                    )}
                </button>

                {hasActiveFilters && (
                    <button onClick={onClear} className="btn btn-ghost text-red-400">
                        <X className="w-4 h-4" />
                        Clear
                    </button>
                )}
            </div>

            {/* Advanced filters */}
            {showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-surface-800 animate-slide-down">
                    {/* Incident ID */}
                    <div>
                        <label className="block text-sm font-medium text-surface-400 mb-1.5">
                            Incident ID
                        </label>
                        <input
                            type="text"
                            value={filters.incidentId || ''}
                            onChange={(e) => handleAdvancedChange('incidentId', e.target.value)}
                            placeholder="e.g., 123"
                            className="input"
                        />
                    </div>

                    {/* Sender Email */}
                    <div>
                        <label className="block text-sm font-medium text-surface-400 mb-1.5">
                            Sender Email
                        </label>
                        <input
                            type="text"
                            value={filters.senderEmail || ''}
                            onChange={(e) => handleAdvancedChange('senderEmail', e.target.value)}
                            placeholder="e.g., john@example.com"
                            className="input"
                        />
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-surface-400 mb-1.5">
                            <Calendar className="inline w-3 h-3 mr-1" />
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={filters.startDate || ''}
                            onChange={(e) => handleAdvancedChange('startDate', e.target.value)}
                            className="input"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-surface-400 mb-1.5">
                            <Calendar className="inline w-3 h-3 mr-1" />
                            End Date
                        </label>
                        <input
                            type="date"
                            value={filters.endDate || ''}
                            onChange={(e) => handleAdvancedChange('endDate', e.target.value)}
                            className="input"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
