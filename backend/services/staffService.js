// backend/services/staffService.js

// Example mock data within the service or imported
const MOCK_ALL_USERS = [
    { id: 'usr001', name: 'Alice Wonderland', email: 'alice@example.com', regDate: '2023-01-15', status: 'Active', role: 'User', profile_bio: 'Curiouser and curiouser.' },
    { id: 'usr002', name: 'Bob The Builder', email: 'bob@example.com', regDate: '2023-02-20', status: 'Banned', role: 'User', profile_bio: 'Can we fix it? Yes, we can!' },
    { id: 'usr003', name: 'Charlie Brown', email: 'charlie@example.com', regDate: '2023-03-10', status: 'Active', role: 'Premium User', profile_bio: 'Good grief.' },
    { id: 'adm001', name: 'Admin User', email: 'admin@example.com', regDate: '2022-12-01', status: 'Active', role: 'Admin', profile_bio: 'Overseeing operations.' },
    { id: 'stf001', name: 'Support Staff Sam', email: 'support@example.com', regDate: '2022-11-01', status: 'Active', role: 'Staff', profile_bio: 'Here to help.' },
    { id: 'stf002', name: 'Moderator Mary', email: 'moderator@example.com', regDate: '2022-10-01', status: 'Active', role: 'Staff', profile_bio: 'Keeping things clean.' }
];

async function searchUsers(queryParams) {
    console.log('StaffService: Searching users with params:', queryParams);
    let results = [...MOCK_ALL_USERS]; // Create a copy to work with

    if (queryParams.searchTerm) {
        const term = queryParams.searchTerm.toLowerCase();
        results = results.filter(user => {
            if (queryParams.searchType === 'id') return user.id.toLowerCase().includes(term);
            if (queryParams.searchType === 'email') return user.email.toLowerCase().includes(term);
            if (queryParams.searchType === 'name') return user.name.toLowerCase().includes(term);
            // Optional: if no searchType or an unsupported one, search across a few fields
            if (!queryParams.searchType || !['id', 'email', 'name'].includes(queryParams.searchType)) {
                return user.name.toLowerCase().includes(term) || 
                       user.email.toLowerCase().includes(term) || 
                       user.id.toLowerCase().includes(term);
            }
            return false;
        });
    }

    // Simulate returning only fields appropriate for staff lookup.
    // Exclude sensitive data not needed for simple lookup and identification.
    return results.map(user => ({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        regDate: user.regDate, 
        status: user.status, 
        role: user.role 
        // Do NOT return password_hash or similarly sensitive fields
    }));
}

// Placeholder for getUserDetails - this would fetch more comprehensive details for a single user
async function getUserDetailsById(userId) {
    console.log('StaffService: Getting details for user ID:', userId);
    const user = MOCK_ALL_USERS.find(u => u.id === userId);
    if (!user) {
        return null; // Or throw an error
    }
    // Return more details than searchUsers, but still be mindful of sensitivity
    return {
        id: user.id, 
        name: user.name, 
        email: user.email, 
        regDate: user.regDate, 
        status: user.status, 
        role: user.role,
        profile_bio: user.profile_bio, // Example of an additional field
        // lastLogin: user.lastLogin, // Example
        // ipAddress: user.ipAddress, // Example (consider privacy)
    };
}


module.exports = {
    searchUsers,
    getUserDetailsById, // Export if needed for a separate detail view endpoint
};
