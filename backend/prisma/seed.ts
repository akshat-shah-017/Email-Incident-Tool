import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create sample incidents for testing
    const sampleIncidents = [
        {
            subject: 'Server Outage Alert - Production Environment',
            senderName: 'System Monitoring',
            senderEmail: 'monitoring@company.com',
            receivedAt: new Date('2024-12-01T08:30:00Z'),
            summary: 'Critical server outage detected in production environment. Multiple services affected including API gateway and database cluster. Engineering team notified and investigating root cause.',
            bodyText: `URGENT: Production Server Outage Detected

Dear Team,

Our monitoring systems have detected a critical outage in the production environment. 

Affected Services:
- API Gateway (api.company.com)
- Database Cluster (db-primary, db-replica-1, db-replica-2)
- Authentication Service

Timeline:
- 08:25 AM: First alert received
- 08:27 AM: Secondary alerts triggered
- 08:30 AM: Engineering team notified

Current Status: INVESTIGATING

Please join the incident war room immediately.

Best regards,
System Monitoring`,
            summarized: true,
            fileType: 'eml',
            fileName: 'server_outage_alert.eml',
        },
        {
            subject: 'Weekly Status Report - Development Team',
            senderName: 'John Smith',
            senderEmail: 'john.smith@company.com',
            receivedAt: new Date('2024-12-02T15:45:00Z'),
            summary: 'Weekly development team status update covering sprint progress, completed features, and blockers. Team is on track for Q4 deliverables with 85% of planned features completed.',
            bodyText: `Hi Team,

Here's our weekly status update for Sprint 12.

Completed Items:
1. User authentication module - DONE
2. Dashboard redesign - DONE
3. API optimization - DONE

In Progress:
1. Report generation feature - 70% complete
2. Email notification system - 50% complete

Blockers:
- Waiting for design assets for mobile view
- Third-party API rate limiting issues

Next Week:
- Complete remaining features
- Begin QA testing
- Prepare deployment documentation

Best,
John`,
            summarized: true,
            fileType: 'msg',
            fileName: 'weekly_status_report.msg',
        },
        {
            subject: 'Customer Complaint - Order #12345',
            senderName: 'Customer Support',
            senderEmail: 'support@company.com',
            receivedAt: new Date('2024-12-03T10:15:00Z'),
            summary: 'Customer reported delayed order delivery and requesting refund. Order #12345 was expected 5 days ago. Customer is a premium member and requires priority handling.',
            bodyText: `Customer Complaint Details

Order Number: 12345
Customer: Jane Doe (Premium Member)
Issue: Delayed Delivery

Description:
Customer ordered items on November 20th with expected delivery on November 25th. As of December 3rd, the order has not been delivered. Customer is requesting a full refund and compensation.

Customer Contact:
Email: jane.doe@email.com
Phone: (555) 123-4567

Priority: HIGH (Premium Member)

Action Required:
1. Track shipment status
2. Contact shipping provider
3. Prepare refund if undeliverable
4. Offer compensation

Please handle with urgency.

Customer Support Team`,
            summarized: true,
            fileType: 'eml',
            fileName: 'customer_complaint.eml',
        },
    ];

    for (const incident of sampleIncidents) {
        await prisma.incident.create({
            data: incident,
        });
        console.log(`✅ Created incident: ${incident.subject}`);
    }

    // Create system config entries
    await prisma.systemConfig.upsert({
        where: { key: 'app_version' },
        update: { value: '1.0.0' },
        create: { key: 'app_version', value: '1.0.0' },
    });

    await prisma.systemConfig.upsert({
        where: { key: 'default_ai_provider' },
        update: { value: 'openrouter' },
        create: { key: 'default_ai_provider', value: 'openrouter' },
    });

    console.log('✅ Created system config entries');
    console.log('🎉 Database seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
