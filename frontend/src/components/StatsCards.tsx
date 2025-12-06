import { FileText, Users, CheckCircle, Clock } from 'lucide-react';
import type { IncidentStats } from '../utils/types';

interface StatsCardsProps {
    stats: IncidentStats | null;
    isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
    const statItems = [
        {
            label: 'Total Incidents',
            value: stats?.total ?? 0,
            icon: FileText,
            color: 'from-primary-500 to-primary-600',
            bgColor: 'bg-primary-500/10',
        },
        {
            label: 'Summarized',
            value: stats?.summarized ?? 0,
            icon: CheckCircle,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-500/10',
        },
        {
            label: 'Pending Summary',
            value: stats?.unsummarized ?? 0,
            icon: Clock,
            color: 'from-yellow-500 to-yellow-600',
            bgColor: 'bg-yellow-500/10',
        },
        {
            label: 'Today',
            value: stats?.todayCount ?? 0,
            icon: Users,
            color: 'from-accent-500 to-accent-600',
            bgColor: 'bg-accent-500/10',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statItems.map((item) => (
                <div key={item.label} className="card-hover">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-surface-500 mb-1">{item.label}</p>
                            {isLoading ? (
                                <div className="h-8 w-16 skeleton" />
                            ) : (
                                <p className="text-3xl font-bold text-surface-100">
                                    {item.value.toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div className={`p-2.5 rounded-lg ${item.bgColor}`}>
                            <item.icon className={`w-5 h-5 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`} style={{ color: item.color.includes('primary') ? '#0ea5e9' : item.color.includes('green') ? '#22c55e' : item.color.includes('yellow') ? '#eab308' : '#d946ef' }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
