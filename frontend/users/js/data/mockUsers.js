// /heartmatch/frontend/users/js/data/mockUsers.js

/**
 * Mock user data for frontend development before backend is fully integrated.
 */
export const mockUsers = [
    {
        id: 'mock-user-1',
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'Demo1234', // Note: In a real app, never store or compare plain passwords!
        token: 'mock-auth-token-demo', // Mock token
        profile: {
            bio: 'Just a demo user!',
            age: 30,
            location: 'Mock City',
            // etc.
        }
    },
    {
        id: 'mock-user-2',
        name: 'Another Mock',
        email: 'another@example.com',
        password: 'password123',
        token: 'mock-auth-token-another',
        profile: {
             bio: 'Second mock user here!',
            age: 25,
            location: 'Fake Town',
            // etc.
        }
    },
    // Add more mock users as needed
];