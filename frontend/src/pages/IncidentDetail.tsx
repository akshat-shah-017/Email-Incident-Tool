import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    Mail,
    User,
    Calendar,
    FileText,
    Trash2,
    Loader2,
    CheckCircle,
    AlertCircle,
    Tag,
    ClipboardCheck
} from 'lucide-react';
import { getIncident, deleteIncident, updateIncidentPriority, updateIncidentStatus } from '../utils/api';
import { formatDateTime, formatRelativeTime, getInitials } from '../utils/helpers';

export default function IncidentDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const incidentId = parseInt(id || '0', 10);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionNotes, setCompletionNotes] = useState('');

    const incidentQuery = useQuery({
        queryKey: ['incident', incidentId],
        queryFn: () => getIncident(incidentId),
        enabled: incidentId > 0,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteIncident,
        onSuccess: () => {
            toast.success('Incident deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
            navigate('/');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete incident');
        },
    });

    const priorityMutation = useMutation({
        mutationFn: (priority: 'high' | 'medium' | 'low' | null) =>
            updateIncidentPriority(incidentId, priority),
        onSuccess: () => {
            toast.success('Priority updated');
            queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update priority');
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ status, notes }: { status: 'complete' | 'incomplete'; notes?: string }) =>
            updateIncidentStatus(incidentId, status, notes),
        onSuccess: (_, variables) => {
            toast.success(variables.status === 'complete' ? 'Incident marked as complete!' : 'Incident marked as incomplete');
            queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
            setShowCompletionModal(false);
            setCompletionNotes('');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update status');
        },
    });

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete incident #${incidentId}?`)) {
            deleteMutation.mutate(incidentId);
        }
    };

    const handlePriorityChange = (value: string) => {
        const priority = value === '' ? null : (value as 'high' | 'medium' | 'low');
        priorityMutation.mutate(priority);
    };

    const handleMarkComplete = () => {
        statusMutation.mutate({ status: 'complete', notes: completionNotes || undefined });
    };

    const handleMarkIncomplete = () => {
        if (window.confirm('Mark this incident as incomplete?')) {
            statusMutation.mutate({ status: 'incomplete' });
        }
    };

    if (incidentQuery.isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin mb-4" />
                <p className="text-surface-400">Loading incident...</p>
            </div>
        );
    }

    if (incidentQuery.isError || !incidentQuery.data) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <h2 className="text-xl font-semibold text-surface-200 mb-2">Incident Not Found</h2>
                <p className="text-surface-500 mb-4">The incident you're looking for doesn't exist.</p>
                <Link to="/" className="btn btn-primary">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const incident = incidentQuery.data;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-mono font-bold text-primary-400">
                                #{incident.id}
                            </span>
                            {incident.summarized ? (
                                <span className="badge badge-success">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Summarized
                                </span>
                            ) : (
                                <span className="badge badge-warning">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Pending
                                </span>
                            )}
                        </div>
                        <h1 className="text-xl font-semibold text-surface-100 mt-1">
                            {incident.subject}
                        </h1>
                    </div>
                </div>

                <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="btn btn-danger"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Incident
                </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Summary Card */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-primary-400" />
                            <h2 className="text-lg font-semibold text-surface-200">Summary</h2>
                        </div>
                        <div className="p-4 bg-surface-800/50 rounded-lg border border-surface-700">
                            <p className="text-surface-300 leading-relaxed whitespace-pre-wrap">
                                {incident.summary || 'No summary available'}
                            </p>
                        </div>
                        {incident.errorMessage && (
                            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <p className="text-sm text-yellow-400">
                                    <AlertCircle className="w-4 h-4 inline mr-2" />
                                    {incident.errorMessage}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Sender Info */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-primary-400" />
                            <h2 className="text-lg font-semibold text-surface-200">Sender</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium">
                                {getInitials(incident.senderName)}
                            </div>
                            <div>
                                <p className="font-medium text-surface-200">
                                    {incident.senderName || 'Unknown'}
                                </p>
                                <a
                                    href={`mailto:${incident.senderEmail}`}
                                    className="text-sm text-primary-400 hover:underline"
                                >
                                    {incident.senderEmail}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-5 h-5 text-primary-400" />
                            <h2 className="text-lg font-semibold text-surface-200">Priority</h2>
                        </div>
                        <select
                            value={incident.priority || ''}
                            onChange={(e) => handlePriorityChange(e.target.value)}
                            disabled={priorityMutation.isPending}
                            className="input w-full"
                        >
                            <option value="">⚪ Unassigned</option>
                            <option value="high">🔴 High</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="low">🟢 Low</option>
                        </select>
                        {priorityMutation.isPending && (
                            <p className="text-xs text-surface-500 mt-2 flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" /> Updating...
                            </p>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-primary-400" />
                            <h2 className="text-lg font-semibold text-surface-200">Dates</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-surface-500 mb-1">Received</p>
                                <p className="text-surface-200">{formatDateTime(incident.receivedAt)}</p>
                                <p className="text-xs text-surface-500 mt-0.5">
                                    {formatRelativeTime(incident.receivedAt)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-surface-500 mb-1">Logged</p>
                                <p className="text-surface-200">{formatDateTime(incident.loggedAt)}</p>
                                <p className="text-xs text-surface-500 mt-0.5">
                                    {formatRelativeTime(incident.loggedAt)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <ClipboardCheck className="w-5 h-5 text-primary-400" />
                            <h2 className="text-lg font-semibold text-surface-200">Status</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-surface-400">Current:</span>
                                {incident.status === 'complete' ? (
                                    <span className="badge badge-success">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Complete
                                    </span>
                                ) : (
                                    <span className="badge badge-warning">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Incomplete
                                    </span>
                                )}
                            </div>
                            {incident.status === 'complete' ? (
                                <>
                                    {incident.completedAt && (
                                        <div>
                                            <p className="text-sm text-surface-500">Completed on:</p>
                                            <p className="text-surface-300 text-sm">{formatDateTime(incident.completedAt)}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-surface-500">Notes:</p>
                                        <p className="text-surface-300 text-sm">{incident.completionNotes || 'N/A'}</p>
                                    </div>
                                    <button
                                        onClick={handleMarkIncomplete}
                                        disabled={statusMutation.isPending}
                                        className="btn btn-secondary w-full text-sm"
                                    >
                                        {statusMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            'Mark as Incomplete'
                                        )}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowCompletionModal(true)}
                                    className="btn btn-primary w-full text-sm"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Mark as Complete
                                </button>
                            )}
                        </div>
                    </div>

                    {/* File Info */}
                    {incident.fileName && (
                        <div className="card">
                            <div className="flex items-center gap-2 mb-4">
                                <Mail className="w-5 h-5 text-primary-400" />
                                <h2 className="text-lg font-semibold text-surface-200">Source File</h2>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-surface-800 rounded-lg">
                                <div className="p-2 rounded bg-primary-500/20">
                                    <FileText className="w-4 h-4 text-primary-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-surface-200">{incident.fileName}</p>
                                    <p className="text-xs text-surface-500 uppercase">{incident.fileType}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Completion Notes Modal */}
            {showCompletionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface-900 rounded-xl border border-surface-700 p-6 w-full max-w-md mx-4 shadow-2xl animate-fade-in">
                        <h3 className="text-lg font-semibold text-surface-100 mb-4">
                            Mark Incident as Complete
                        </h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-surface-400 mb-2">
                                Completion Notes (optional)
                            </label>
                            <textarea
                                value={completionNotes}
                                onChange={(e) => setCompletionNotes(e.target.value)}
                                placeholder="Add any notes about the resolution..."
                                className="input w-full h-32 resize-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCompletionModal(false);
                                    setCompletionNotes('');
                                }}
                                className="btn btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMarkComplete}
                                disabled={statusMutation.isPending}
                                className="btn btn-primary flex-1"
                            >
                                {statusMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Complete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
