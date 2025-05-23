// /heartmatch/frontend/admin/js/data/mockAdmins.js

/**
 * Mock admin data for frontend development before backend is fully integrated.
 */
export const mockAdmins = [
    {
        id: 'mock-admin-1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin1234', // Note: In a real app, never store or compare plain passwords!
        token: 'mock-admin-auth-token-1', // Mock token
        role: 'superadmin' // Example role
    },
    {
        id: 'mock-admin-2',
        name: 'Moderator Admin',
        email: 'mod@example.com',
        password: 'Mod1234',
        token: 'mock-admin-auth-token-2',
        role: 'moderator'
    },
    // Add more mock admins as needed
];