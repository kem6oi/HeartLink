// frontend/staff/js/userAssistance.js
import { requireStaffAuth } from './staffSession.js';
import { getElement, setText, addClass, removeClass } from './utils.js';
import { api } from '../../common/js/apiService.js'; // Import apiService

document.addEventListener('DOMContentLoaded', () => {
    // The inline script in user-lookup.html already calls requireStaffAuth correctly.
    // If called here, ensure paths are consistent or rely on the HTML's call.
    // requireStaffAuth('../pages/login.html'); 

    console.log('User assistance page script loaded.');

    const searchForm = getElement('user-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleUserSearch);
    } else {
        console.error('User search form not found!');
    }
});

async function handleUserSearch(event) {
    event.preventDefault();
    const searchTermInput = getElement('search-term-input');
    const searchTypeSelect = getElement('search-type-select');
    const searchButton = getElement('user-search-button');
    
    if (!searchTermInput || !searchTypeSelect) {
        console.error('Search term input or search type select not found!');
        return;
    }
    
    const searchTerm = searchTermInput.value.trim();
    const searchType = searchTypeSelect.value;
    
    console.log(`Attempting to search for ${searchType}: ${searchTerm}`);
    
    const resultsContainer = getElement('user-lookup-results-container');
    const detailContainer = getElement('user-detail-display');

    // Clear previous results and detail view
    if(resultsContainer) resultsContainer.innerHTML = '<p class="text-gray-500 p-4">Searching...</p>';
    if(detailContainer) detailContainer.innerHTML = '<p class="text-gray-500">Search for a user to see their details.</p>';

    if (!searchTerm) {
        if(resultsContainer) resultsContainer.innerHTML = '<p class="text-red-500 p-4">Please enter a search term.</p>';
        return;
    }

    if(searchButton) {
        searchButton.disabled = true;
        searchButton.textContent = 'Searching...';
    }

    try {
        const queryParams = { searchTerm, searchType };
        // API endpoint is /api/staff/users/search, apiService prepends /api
        // So, endpoint for api.get is '/staff/users/search'
        const responseUsers = await api.get('/staff/users/search', queryParams, true); // true for requiresAuth

        if(resultsContainer) displaySearchResults(responseUsers, resultsContainer); // Backend returns the array directly
        
    } catch (error) {
        console.error('API User Search Error:', error);
        let errorMessage = 'Failed to search users. Please try again.';
        if (error.status === 404) {
            errorMessage = error.data?.message || 'No users found matching your criteria.';
             if(resultsContainer) displaySearchResults([], resultsContainer); // Call with empty array to show "No users found" message
        } else if (error.data?.message) {
            errorMessage = error.data.message;
        }
        
        if(resultsContainer && error.status !== 404) { // Don't overwrite the "No users found" message from displaySearchResults
            resultsContainer.innerHTML = `<p class="text-red-600 p-4">${errorMessage}</p>`;
        }
    } finally {
        if(searchButton) {
            searchButton.disabled = false;
            searchButton.textContent = 'Search';
        }
    }
}

function displaySearchResults(users, container) { // Users is expected to be an array
    container.innerHTML = ''; // Clear previous results or "Searching..." message

    if (!Array.isArray(users)) {
        console.error('displaySearchResults expected an array, but received:', users);
        container.innerHTML = '<p class="text-red-600 p-4">Error displaying search results: Invalid data format.</p>';
        return;
    }

    if (users.length === 0) {
        container.innerHTML = '<p class="text-gray-600 p-4">No users found matching your criteria.</p>';
        const detailContainer = getElement('user-detail-display');
        if (detailContainer) detailContainer.innerHTML = '<p class="text-gray-500">Search for a user to see their details.</p>';
        return;
    }

    // If only one user, display details directly. Otherwise, list them.
    if (users.length === 1) {
        displayUserDetails(users[0]);
    } else {
        const ul = document.createElement('ul');
        ul.className = 'divide-y divide-gray-200 bg-white shadow rounded-lg';
        users.forEach(user => {
            const li = document.createElement('li');
            li.className = 'p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150';
            li.innerHTML = \`
                <div class="font-medium text-primary">\${user.name || 'N/A'}</div>
                <div class="text-sm text-gray-600">\${user.email || 'N/A'} - ID: \${user.id || 'N/A'}</div>
            \`;
            li.addEventListener('click', () => displayUserDetails(user));
            ul.appendChild(li);
        });
        container.appendChild(ul);
    }
}

function displayUserDetails(user) {
    // User object structure from backend: { id, name, email, regDate, status, role }
    const detailContainer = getElement('user-detail-display');
    const resultsContainer = getElement('user-lookup-results-container'); // To clear it if displaying single user from list
    
    if(resultsContainer && users.length > 1) { // Assuming `users` was the array passed to displaySearchResults
        // If we clicked from a list of multiple users, clear the list
        resultsContainer.innerHTML = ''; 
    }


    if (!user || !user.id) { // Check if user object is valid and has an id
        if(detailContainer) detailContainer.innerHTML = '<p class="text-red-500 p-4">Error: Invalid user data received.</p>';
        return;
    }
    
    if(detailContainer) {
        detailContainer.innerHTML = \`
            <h3 class="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">User Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div><p class="text-sm text-gray-500"><strong>ID:</strong></p><p class="font-medium text-gray-900">\${user.id}</p></div>
                <div><p class="text-sm text-gray-500"><strong>Name:</strong></p><p class="font-medium text-gray-900">\${user.name}</p></div>
                <div><p class="text-sm text-gray-500"><strong>Email:</strong></p><p class="font-medium text-gray-900">\${user.email}</p></div>
                <div><p class="text-sm text-gray-500"><strong>Registration Date:</strong></p><p class="font-medium text-gray-900">\${user.regDate ? new Date(user.regDate).toLocaleDateString() : 'N/A'}</p></div>
                <div>
                    <p class="text-sm text-gray-500"><strong>Status:</strong></p>
                    <p class="font-medium \${user.status === 'Active' ? 'text-green-600' : 'text-red-600'}">\${user.status}</p>
                </div>
                <div><p class="text-sm text-gray-500"><strong>Role:</strong></p><p class="font-medium text-gray-900">\${user.role}</p></div>
            </div>
            <div class="mt-6 pt-4 border-t space-x-3">
                <button class="btn-primary btn-sm btn-view-profile" data-user-id="\${user.id}">View Full Profile (Placeholder)</button>
                <button class="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded text-sm btn-view-activity" data-user-id="\${user.id}">Activity Log (Placeholder)</button>
                {/* Add more staff action buttons here as needed, e.g., Ban, Warn, View Tickets */}
            </div>
        \`;
        
        // Example: Add event listener for a future "View Full Profile" button
        const viewProfileButton = detailContainer.querySelector('.btn-view-profile');
        if (viewProfileButton) {
            viewProfileButton.addEventListener('click', () => {
                alert(\`Placeholder: Would navigate to full profile for user ID: \${user.id}\`);
                // window.location.href = \`./user-profile-detail.html?userId=\${user.id}\`; // If such a page exists
            });
        }
    }
}
