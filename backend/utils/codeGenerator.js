// Generate random alphanumeric code
export const generateVerificationCode = (length = 8) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Generate week-based code for logbook
export const generateWeekCode = (studentId, weekNumber) => {
    const timestamp = Date.now().toString(36);
    return `LOG-${studentId}-W${weekNumber}-${timestamp}`;
};