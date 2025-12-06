import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Trash2,
    Mail,
    CheckCircle,
    AlertCircle,
    Loader2,
    X,
    Calendar,
    FileText
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Incident, PaginationMeta } from '../utils/types';
import { deleteIncident } from '../utils/api';
import { formatDateTime, truncateText, getInitials } from '../utils/helpers';

interface IncidentTableProps {
    incidents: Incident[];
    isLoading: boolean;
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    showCompletionDate?: boolean;
}

export default function IncidentTable({
    incidents,
    isLoading,
    pagination,
    onPageChange,
    showCompletionDate = false,
}: IncidentTableProps) {
    const queryClient = useQueryClient();
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    const deleteMutation = useMutation({
        mutationFn: deleteIncident,
        onSuccess: (_, id) => {
            toast.success(`Incident #${id} deleted`);
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
            queryClient.invalidateQueries({ queryKey: ['incident-stats'] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete incident');
        },
    });

    const handleDelete = (id: number) => {
        if (window.confirm(`Are you sure you want to delete incident #${id}?`)) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="card flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin mb-4" />
                <p className="text-surface-400">Loading incidents...</p>
            </div>
        );
    }

    if (incidents.length === 0) {
        return (
            <div className="card flex flex-col items-center justify-center py-16">
                <div className="p-4 rounded-full bg-surface-800 mb-4">
                    <Mail className="w-8 h-8 text-surface-500" />
                </div>
                <h3 className="text-lg font-medium text-surface-300 mb-2">No incidents found</h3>
                <p className="text-surface-500 text-sm text-center max-w-md">
                    Upload an email file to create your first incident, or adjust your search filters.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="w-20">#</th>
                            <th>Sender</th>
                            <th className="min-w-[200px]">Subject</th>
                            <th className="min-w-[300px]">Summary</th>
                            <th className="w-28">Priority</th>
                            <th className="w-40">Received</th>
                            {showCompletionDate && <th className="w-40">Completed</th>}
                            <th className="w-24">Status</th>
                            <th className="w-28 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.map((incident) => (
                            <tr key={incident.id} className="group">
                                {/* Incident # */}
                                <td>
                                    <span className="font-mono text-primary-400 font-medium">
                                        #{incident.id}
                                    </span>
                                </td>

                                {/* Sender */}
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-medium">
                                            {getInitials(incident.senderName)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-surface-200 truncate">
                                                {incident.senderName || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-surface-500 truncate">
                                                {incident.senderEmail}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Subject */}
                                <td>
                                    <p className="text-surface-200 font-medium truncate max-w-[250px]" title={incident.subject}>
                                        {incident.subject}
                                    </p>
                                </td>

                                {/* Summary */}
                                <td>
                                    <p className="text-surface-400 text-sm line-clamp-2" title={incident.summary || undefined}>
                                        {truncateText(incident.summary || 'No summary available', 150)}
                                    </p>
                                </td>

                                {/* Priority */}
                                <td>
                                    {incident.priority === 'high' ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                            🔴 High
                                        </span>
                                    ) : incident.priority === 'medium' ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                            🟡 Medium
                                        </span>
                                    ) : incident.priority === 'low' ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                            🟢 Low
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-surface-700 text-surface-400 border border-surface-600">
                                            ⚪ None
                                        </span>
                                    )}
                                </td>

                                {/* Received Date */}
                                <td>
                                    <p className="text-surface-400 text-sm whitespace-nowrap">
                                        {formatDateTime(incident.receivedAt)}
                                    </p>
                                </td>

                                {/* Completed Date (conditional) */}
                                {showCompletionDate && (
                                    <td>
                                        <p className="text-surface-400 text-sm whitespace-nowrap">
                                            {incident.completedAt ? formatDateTime(incident.completedAt) : '—'}
                                        </p>
                                    </td>
                                )}

                                {/* Status */}
                                <td>
                                    {incident.status === 'complete' ? (
                                        <button
                                            onClick={() => setSelectedIncident(incident)}
                                            className="badge badge-success cursor-pointer hover:scale-105 transition-transform"
                                        >
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Complete
                                        </button>
                                    ) : (
                                        <span className="badge badge-warning">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            Incomplete
                                        </span>
                                    )}
                                </td>

                                {/* Actions */}
                                <td>
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            to={`/incidents/${incident.id}`}
                                            className="p-2 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-primary-400 transition-colors"
                                            title="View details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(incident.id)}
                                            disabled={deleteMutation.isPending}
                                            className="p-2 rounded-lg hover:bg-red-500/20 text-surface-400 hover:text-red-400 transition-colors disabled:opacity-50"
                                            title="Delete incident"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-surface-500">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} incidents
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={!pagination.hasPrevPage}
                            className="btn btn-secondary btn-sm disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        <span className="px-3 text-sm text-surface-400">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={!pagination.hasNextPage}
                            className="btn btn-secondary btn-sm disabled:opacity-50"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Completion Details Popup */}
            {selectedIncident && selectedIncident.status === 'complete' && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    onClick={() => setSelectedIncident(null)}
                >
                    <div
                        className="relative bg-surface-900/80 backdrop-blur-xl rounded-2xl border border-surface-600/50 p-6 w-full max-w-md mx-4 shadow-2xl
                                   transform transition-all duration-300 ease-out
                                   animate-[scale-in_0.2s_ease-out]"
                        style={{
                            animation: 'scale-in 0.2s ease-out',
                            background: 'linear-gradient(135deg, rgba(30, 30, 35, 0.9) 0%, rgba(20, 20, 25, 0.95) 100%)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedIncident(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg bg-surface-800/50 hover:bg-surface-700 text-surface-400 hover:text-surface-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 rounded-xl bg-green-500/20 border border-green-500/30">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-surface-100">Completion Details</h3>
                                <p className="text-sm text-surface-500">Incident #{selectedIncident.id}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-4">
                            {/* Completed Date */}
                            <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
                                <div className="flex items-center gap-2 text-surface-400 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm font-medium">Completed On</span>
                                </div>
                                <p className="text-surface-200 font-medium">
                                    {selectedIncident.completedAt ? formatDateTime(selectedIncident.completedAt) : 'N/A'}
                                </p>
                            </div>

                            {/* Completion Notes */}
                            <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
                                <div className="flex items-center gap-2 text-surface-400 mb-2">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-sm font-medium">Completion Notes</span>
                                </div>
                                <p className="text-surface-300 whitespace-pre-wrap">
                                    {selectedIncident.completionNotes || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-5 pt-4 border-t border-surface-700/50">
                            <button
                                onClick={() => setSelectedIncident(null)}
                                className="btn btn-primary w-full"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
