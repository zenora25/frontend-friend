import nodemailer from 'nodemailer';

// Mock transporter for MVP - in production, use real SMTP credentials
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
        user: process.env.SMTP_USER || 'mock_user',
        pass: process.env.SMTP_PASS || 'mock_pass',
    },
});

// Mock email sender (logs to console in development)
export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            // Real email in production
            await transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@interntrack.edu.ng',
                to,
                subject,
                text,
                html,
            });
            console.log(`Email sent to ${to}: ${subject}`);
        } else {
            // Mock email in development
            console.log('\n' + '='.repeat(50));
            console.log(`📧 MOCK EMAIL NOTIFICATION`);
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body: ${text || html?.substring(0, 100)}...`);
            console.log('='.repeat(50) + '\n');
        }
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

// Email templates
export const emailTemplates = {
    logbookSubmitted: (studentName, supervisorName) => ({
        subject: 'New Logbook Submission - InternTrack',
        text: `Dear ${supervisorName},\n\nStudent ${studentName} has submitted a weekly logbook for your review.\n\nPlease login to InternTrack to review and provide feedback.\n\nBest regards,\nInternTrack System`,
        html: `<p>Dear ${supervisorName},</p><p>Student <strong>${studentName}</strong> has submitted a weekly logbook for your review.</p><p>Please login to InternTrack to review and provide feedback.</p><br><p>Best regards,<br>InternTrack System</p>`
    }),

    supervisorComment: (studentName) => ({
        subject: 'Supervisor Comment on Your Logbook - InternTrack',
        text: `Dear ${studentName},\n\nYour supervisor has provided feedback on your logbook submission.\n\nPlease login to InternTrack to view the comments and take necessary action.\n\nBest regards,\nInternTrack System`,
        html: `<p>Dear ${studentName},</p><p>Your supervisor has provided feedback on your logbook submission.</p><p>Please login to InternTrack to view the comments and take necessary action.</p><br><p>Best regards,<br>InternTrack System</p>`
    }),

    defenseScheduled: (studentName, date) => ({
        subject: 'SIWES Defense Scheduled - InternTrack',
        text: `Dear ${studentName},\n\nYour SIWES defense has been scheduled for ${date}.\n\nPlease prepare accordingly and ensure all logbooks are completed and approved.\n\nBest regards,\nInternTrack System`,
        html: `<p>Dear ${studentName},</p><p>Your SIWES defense has been scheduled for <strong>${date}</strong>.</p><p>Please prepare accordingly and ensure all logbooks are completed and approved.</p><br><p>Best regards,<br>InternTrack System</p>`
    }),

    verificationCode: (email, code) => ({
        subject: 'Your InternTrack Verification Code',
        text: `Use this code to register on InternTrack: ${code}\n\nThis code will expire in 24 hours.\n\nDo not share this code with anyone.`,
        html: `<p>Use this code to register on InternTrack:</p><h2>${code}</h2><p>This code will expire in 24 hours.</p><p><strong>Do not share this code with anyone.</strong></p>`
    })
};