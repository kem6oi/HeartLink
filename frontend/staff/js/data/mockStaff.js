// /heartmatch/frontend/staff/js/data/mockStaff.js

export const mockStaff = [
    {
        id: 'staff001',
        name: 'Support Staff One',
        email: 'staff1@example.com',
        password: 'password123', // Plain text for mock, use hashed in real app
        role: 'support_level_1',
        permissions: ['view_tickets', 'reply_to_tickets', 'escalate_tickets'],
        token: 'mock-staff-token-staff001-ts123xyz' // Example mock token
    },
    {
        id: 'staff002',
        name: 'Moderator Mike',
        email: 'moderator@example.com',
        password: 'securepassword456',
        role: 'content_moderator',
        permissions: ['review_profiles', 'approve_photos', 'issue_warnings', 'view_reports'],
        token: 'mock-staff-token-staff002-mod456abc'
    },
    {
        id: 'staff003',
        name: 'Lead Support Laura',
        email: 'lead.support@example.com',
        password: 'leadpassword789',
        role: 'support_lead',
        permissions: ['view_all_tickets', 'assign_tickets', 'manage_support_staff', 'view_reports'],
        token: 'mock-staff-token-staff003-lead789def'
    }
];

// You might also want to export a function to find a staff member by email,
// though this can also be done directly in the auth.js logic.
// export function findStaffByEmail(email) {
//     return mockStaff.find(staff => staff.email === email);
// }
