// /heartmatch/frontend/admin/js/userManagement.js

// Import necessary functions
import { requireAdminAuth, endAdminSession, getAdminData } from './adminSession.js';
import {
    getElement,
    selectElement,
    selectElements,
    setText,
    showElement,
    hideElement,
    addClass,
    removeClass,
    redirectTo
} from './utils.js'; // Use local admin utils

import { api } from '../../common/js/apiService.js'; // Use common API service

// --- DOM Element Variables ---
let adminNameElement;
let adminAvatarElement; // Optional
let adminLogoutButtonElement;
let pageMessageArea; // Message area for the page
let userTableBodyElement; // Table body for users
let userSearchInput; // Search input
let addUserButton; // Add user button
// Pagination elements
let prevPageButton;
let nextPageButton;
let pageInfoSpan;

// --- State Variables ---
let currentPage = 1;
const rowsPerPage = 10; // Number of users per page
let totalPages = 1;
let currentSearchTerm = ''; // Current search query


// --- Helper Functions ---

/**
 * Populates the admin's name and avatar in the sidebar.
 * @param {object} admin - The admin data object (should contain name and possibly avatarUrl).
 */
function populateAdminSidebar(admin) {
    if (adminNameElement && admin?.name) {
        setText(adminNameElement.id, admin.name);
    }
    if (adminAvatarElement && admin?.avatarUrl) {
        adminAvatarElement.src = admin.avatarUrl; // Assuming admin avatars exist
    }
    // Could also display admin role here if needed
}

/**
 * Displays a message on the page.
 * @param {string} message - The message text.
 * @param {'success' | 'error' | 'info'} type - The type of message for styling.
 */
function displayPageMessage(message, type = 'info') {
     if (!pageMessageArea) return;

     setText(pageMessageArea.id, message);
     // Clear previous styling classes
     removeClass(pageMessageArea.id, 'bg-green-100 border-green-400 text-green-700');
     removeClass(pageMessageArea.id, 'bg-red-100 border-red-400 text-red-700');
     removeClass(pageMessageArea.id, 'bg-blue-100 border-blue-400 text-blue-700');
      removeClass(pageMessageArea.id, 'hidden'); // Ensure it's visible


     // Add type-specific styling
     switch (type) {
         case 'success': addClass(pageMessageArea.id, 'bg-green-100 border-green-400 text-green-700'); break;
         case 'error': addClass(pageMessageArea.id, 'bg-red-100 border-red-400 text-red-700'); break;
         case 'info':
         default: addClass(pageMessageArea.id, 'bg-blue-100 border-blue-400 text-blue-700'); break;
     }

     showElement(pageMessageArea.id);
}

/**
 * Hides the page message area.
 */
function hidePageMessage() {
    if (pageMessageArea) {
        hideElement(pageMessageArea.id);
    }
}


// --- Data Fetching ---

/**
 * Fetches users from the backend with pagination and search.
 */
async function fetchUsers() {
    console.log(`Fetching users - Page: ${currentPage}, Search: "${currentSearchTerm}"`);
    if (userTableBodyElement) {
        userTableBodyElement.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">Loading users...</td></tr>`;
    }
    hidePageMessage(); // Hide any previous messages

    try {
        // Assuming API endpoint is GET /api/admin/users with pagination and search query params
        const response = await api.get(`/admin/users?page=${currentPage}&limit=${rowsPerPage}&search=${currentSearchTerm}`, true); // Requires admin authentication

        console.log('Users fetched:', response);

        // Assuming response is { users: [...], totalItems: number, totalPages: number, currentPage: number }
        if (response && Array.isArray(response.users)) {
            totalPages = response.totalPages || 1; // Update total pages from response
            currentPage = response.currentPage || 1; // Update current page from response (important if backend adjusts)

            renderUsers(response.users);
            updatePagination();

            if (response.users.length === 0 && currentSearchTerm) {
                 displayPageMessage('No users found matching your search.', 'info');
            } else if (response.users.length === 0) {
                 displayPageMessage('No users available.', 'info');
            }

        } else {
             console.error('Failed to fetch users: Invalid response format.', response);
              displayPageMessage('Failed to load users: Invalid data received.', 'error');
            renderUsers([]); // Render empty table on invalid response
            totalPages = 1; currentPage = 1; updatePagination(); // Reset pagination
        }

    } catch (error) {
        console.error('Failed to fetch users:', error);
        // Handle error (e.g., display error message, redirect if 401 Unauthorized)
        if (error.status === 401) {
            endAdminSession(); // Clear invalid session
            redirectTo('/frontend/admin/pages/login.html'); // Redirect to login
        } else {
             const errorMessage = `Failed to load users. ${error.data?.message || error.message}`;
             displayPageMessage(errorMessage, 'error');
             renderUsers([]); // Render empty table on error
             totalPages = 1; currentPage = 1; updatePagination(); // Reset pagination
        }
    }
}


// --- Rendering Functions ---

/**
 * Renders the list of users in the table.
 * @param {Array<object>} users - An array of user objects.
 */
function renderUsers(users) {
    if (!userTableBodyElement) return;

    userTableBodyElement.innerHTML = ''; // Clear existing content

    if (users.length === 0) {
        userTableBodyElement.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No users to display.</td></tr>`;
        return;
    }

    users.forEach(user => {
        // Determine user status display (e.g., Active, Suspended, Deleted)
        let statusText = 'Unknown';
        let statusClass = 'text-gray-500'; // Default color
        if (user.status === 'active') {
            statusText = 'Active';
            statusClass = 'text-green-600';
        } else if (user.status === 'suspended') {
            statusText = 'Suspended';
            statusClass = 'text-yellow-600';
        } else if (user.status === 'deleted') {
            statusText = 'Deleted';
            statusClass = 'text-red-600';
        }
        // Format registration date
        const registrationDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';

        const userRowHtml = `
             <tr class="table-row-hover" data-user-id="${user.id}"> <!-- Use custom hover style -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${user.id.substring(0, 8)}... <!-- Truncate ID for display -->
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     ${user.name || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${user.email || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${statusClass}">
                    ${statusText}
                </td>
                 <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${registrationDate}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <!-- Action Buttons -->
                     <button class="text-indigo-600 hover:text-indigo-900 mr-3" title="View Details" data-action="view" data-user-id="${user.id}">
                         <i class="fas fa-eye"></i>
                    </button>
                    <button class="text-yellow-600 hover:text-yellow-900 mr-3" title="${user.status === 'active' ? 'Suspend User' : 'Activate User'}" data-action="${user.status === 'active' ? 'suspend' : 'activate'}" data-user-id="${user.id}">
                         <i class="fas fa-user-${user.status === 'active' ? 'slash' : 'check'}"></i>
                    </button>
                     <button class="text-red-600 hover:text-red-900" title="Delete User" data-action="delete" data-user-id="${user.id}">
                         <i class="fas fa-trash"></i>
                    </button>
                    <!-- Add Edit, Reset Password, etc. buttons -->
                </td>
            </tr>
        `;

        userTableBodyElement.insertAdjacentHTML('beforeend', userRowHtml);
    });
}

/**
 * Updates the state of the pagination buttons and info text.
 */
function updatePagination() {
    if (!prevPageButton || !nextPageButton || !pageInfoSpan) return;

    prevPageButton.disabled = currentPage <= 1;
    nextPageButton.disabled = currentPage >= totalPages;
    setText(pageInfoSpan.id, `Page ${currentPage} of ${totalPages}`);

    // Add custom button styles from admin/css (if using @apply)
    // These are already applied via the class names 'pagination-button btn-secondary'
    // but ensure hover/disabled states work as expected with Tailwind/CSS
}


// --- Action Handlers ---

/**
 * Handles the click event for action buttons in the user table.
 * Uses event delegation on the table body.
 * @param {Event} event - The click event.
 */
async function handleUserAction(event) {
    const targetButton = event.target.closest('button[data-action]');
    if (!targetButton) return; // Not an action button

    const action = targetButton.dataset.action;
    const userId = targetButton.dataset.userId;

    if (!userId) {
        console.error('User ID not found on action button.');
        return;
    }

    console.log(`Admin Action: ${action} on user ID: ${userId}`);

    // Optional: Add confirmation dialogs for destructive actions
    if ((action === 'delete' || action === 'suspend') && !confirm(`Are you sure you want to ${action} user ${userId}?`)) {
        console.log('Action cancelled by user.');
        return; // User cancelled
    }

    // Disable the button during the action
    targetButton.disabled = true;

    try {
        let endpoint;
        let method = 'PUT'; // Most updates are PUT or PATCH
        let body = { userId: userId }; // Default body structure

        switch (action) {
            case 'view':
                // Redirect or open modal to view user details
                 console.log(`Redirecting to view user details for ${userId}...`);
                 // Example: redirectTo(`/frontend/admin/pages/user-details.html?userId=${userId}`); // Needs a user details page
                 // For now, just log or show a temporary message
                 alert(`Viewing details for user ID: ${userId}\n(Details page/modal not implemented yet)`);
                 targetButton.disabled = false; // Re-enable immediately as no async action happened
                return; // Stop here as it's not an API call action

            case 'suspend':
                endpoint = `/admin/users/${userId}/suspend`; method = 'PATCH'; body = {}; // PATCH /api/admin/users/:userId/suspend
                break;
            case 'activate':
                endpoint = `/admin/users/${userId}/activate`; method = 'PATCH'; body = {}; // PATCH /api/admin/users/:userId/activate
                break;
            case 'delete':
                endpoint = `/admin/users/${userId}`; method = 'DELETE'; body = {}; // DELETE /api/admin/users/:userId
                break;
            // Add cases for 'edit', 'reset-password', etc.

            default:
                console.warn(`Unknown user action: ${action}`);
                 targetButton.disabled = false; // Re-enable button for unknown action
                return; // Stop here
        }

        // Perform the API call
        const response = await api.request(endpoint, method, body, true); // Use general api.request for flexibility in method/body structure

        console.log(`Action "${action}" successful for user ${userId}:`, response);
         displayPageMessage(`User ${userId} ${action}ed successfully.`, 'success');

        // Refresh the user list after successful action
        // We can reload the current page's data
        fetchUsers();

    } catch (error) {
        console.error(`Failed to perform action "${action}" for user ${userId}:`, error);
         const errorMessage = `Failed to ${action} user ${userId}. ${error.data?.message || error.message}`;
         displayPageMessage(errorMessage, 'error');

         if (error.status === 401) {
             endAdminSession(); // Clear invalid session
             redirectTo('/frontend/admin/pages/login.html'); // Redirect to login
         }

    } finally {
        // Button is re-enabled when fetchUsers completes, or explicitly re-enable here if not refreshing list
        // targetButton.disabled = false;
    }
}

/**
 * Handles the search input change (e.g., debounce search).
 */
function handleSearchInput(event) {
     // Implement debounce for search input to avoid excessive API calls
     // A simple debounce using setTimeout:
     clearTimeout(handleSearchInput.debounceTimer);
     handleSearchInput.debounceTimer = setTimeout(() => {
         const newSearchTerm = event.target.value.trim();
         if (newSearchTerm !== currentSearchTerm) {
             currentSearchTerm = newSearchTerm;
             currentPage = 1; // Reset to first page on new search
             fetchUsers(); // Fetch users with the new search term
         }
     }, 300); // Wait 300ms after typing stops
}
handleSearchInput.debounceTimer = null; // Initialize debounce timer

/**
 * Handles pagination clicks.
 * @param {Event} event - The click event.
 */
function handlePaginationClick(event) {
    const targetButton = event.target.closest('.pagination-button');
    if (!targetButton || targetButton.disabled) return;

    if (targetButton.id === 'prev-page-button' && currentPage > 1) {
        currentPage--;
        fetchUsers();
    } else if (targetButton.id === 'next-page-button' && currentPage < totalPages) {
        currentPage++;
        fetchUsers();
    }
}


// --- Initialization ---

/**
 * Initializes the User Management page script.
 */
async function initializeUserManagementPage() {
    console.log('Initializing User Management page...');

    // 1. Protect the page: Ensure the admin is authenticated
    requireAdminAuth(); // This will redirect to login if no valid session is found

    // If requireAdminAuth did *not* redirect, we know the admin is authenticated
    console.log('Admin is authenticated.');
    const adminData = getAdminData(); // Get logged-in admin data

    // 2. Get DOM elements
    adminNameElement = getElement('admin-name');
    adminAvatarElement = getElement('admin-avatar');
    adminLogoutButtonElement = getElement('admin-logout-button');
    pageMessageArea = getElement('page-message');
    userTableBodyElement = getElement('user-table-body');
    userSearchInput = getElement('user-search');
    addUserButton = getElement('add-user-button');
    prevPageButton = getElement('prev-page-button');
    nextPageButton = getElement('next-page-button');
    pageInfoSpan = getElement('page-info');


    // 3. Populate admin name and avatar in the sidebar
    if (adminData) {
        populateAdminSidebar(adminData);
        console.log(`Displaying admin in sidebar: ${adminData.name}`);
        // Optional: Check admin role here to show/hide certain management sections or buttons
        // if (adminData.role !== 'superadmin') { hideElement('admins-sidebar-link'); }
    } else {
         console.warn('Admin data not available for sidebar.');
          setText('admin-name', 'Admin User'); // Fallback
    }

    // 4. Set up common listeners (Logout)
    if (adminLogoutButtonElement) {
        adminLogoutButtonElement.addEventListener('click', handleAdminLogout);
        console.log('Admin logout button listener added.');
    }

    // 5. Set up page-specific listeners
    if (userTableBodyElement) {
         userTableBodyElement.addEventListener('click', handleUserAction); // Event delegation for action buttons
        console.log('User table action listener added.');
    }
    if (userSearchInput) {
         userSearchInput.addEventListener('input', handleSearchInput); // Listen for typing
        console.log('User search input listener added.');
    }
    if (addUserButton) {
         addUserButton.addEventListener('click', () => {
             console.log('"Add User" button clicked. (Functionality pending)');
             // Implement logic to show an "Add User" form/modal
             alert('Add User functionality pending.'); // Placeholder
         });
        console.log('"Add User" button listener added.');
    }
    if (prevPageButton) prevPageButton.addEventListener('click', handlePaginationClick);
    if (nextPageButton) nextPageButton.addEventListener('click', handlePaginationClick);
    console.log('Pagination button listeners added.');


    // 6. Fetch and display the initial list of users
    fetchUsers();

    // 7. Initial state for message area
     if (pageMessageArea) {
        // Add base styling classes (optional, could be in CSS)
         pageMessageArea.className = `mb-6 p-3 rounded border text-center text-sm ${pageMessageArea.className}`;
         hidePageMessage(); // Ensure hidden initially
     }

    console.log('User Management initialization complete.');
}

// --- Entry Point ---

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeUserManagementPage);