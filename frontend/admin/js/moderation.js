// /heartmatch/frontend/admin/js/moderation.js

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
let moderationQueueListElement; // Container for moderation items
let refreshQueueButton; // Refresh button
// Pagination elements
let prevPageButton;
let nextPageButton;
let pageInfoSpan;

// --- State Variables ---
let currentPage = 1;
const itemsPerPage = 10; // Number of items per page
let totalPages = 1;
// No search for moderation queue initially, but could add filters later

// --- Helper Functions ---

/**
 * Populates the admin's name and avatar in the sidebar.
 * @param {object} admin - The admin data object.
 */
function populateAdminSidebar(admin) {
    if (adminNameElement && admin?.name) {
        setText(adminNameElement.id, admin.name);
    }
    if (adminAvatarElement && admin?.avatarUrl) {
        adminAvatarElement.src = admin.avatarUrl; // Assuming admin avatars exist
    }
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
 * Fetches moderation queue items from the backend with pagination.
 */
async function fetchModerationQueue() {
    console.log(`Fetching moderation queue - Page: ${currentPage}`);
    if (moderationQueueListElement) {
        moderationQueueListElement.innerHTML = `<div class="text-center text-gray-500">Loading moderation queue...</div>`;
    }
    hidePageMessage(); // Hide any previous messages

    try {
        // Assuming API endpoint is GET /api/admin/moderation/queue with pagination params
        const response = await api.get(`/admin/moderation/queue?page=${currentPage}&limit=${itemsPerPage}`, true); // Requires admin authentication

        console.log('Moderation queue fetched:', response);

        // Assuming response is { items: [...], totalItems: number, totalPages: number, currentPage: number }
        if (response && Array.isArray(response.items)) {
            totalPages = response.totalPages || 1; // Update total pages from response
            currentPage = response.currentPage || 1; // Update current page from response
            renderModerationItems(response.items);
            updatePagination();

            if (response.items.length === 0) {
                 displayPageMessage('The moderation queue is empty. Great job!', 'info');
            }

        } else {
             console.error('Failed to fetch moderation queue: Invalid response format.', response);
              displayPageMessage('Failed to load moderation queue: Invalid data received.', 'error');
            renderModerationItems([]); // Render empty list on invalid response
            totalPages = 1; currentPage = 1; updatePagination(); // Reset pagination
        }

    } catch (error) {
        console.error('Failed to fetch moderation queue:', error);
        // Handle error (e.g., display error message, redirect if 401 Unauthorized)
        if (error.status === 401) {
            endAdminSession(); // Clear invalid session
            redirectTo('/frontend/admin/pages/login.html'); // Redirect to login
        } else {
             const errorMessage = `Failed to load moderation queue. ${error.data?.message || error.message}`;
             displayPageMessage(errorMessage, 'error');
             renderModerationItems([]); // Render empty list on error
             totalPages = 1; currentPage = 1; updatePagination(); // Reset pagination
        }
    }
}


// --- Rendering Functions ---

/**
 * Renders the list of moderation items.
 * @param {Array<object>} items - An array of moderation item objects.
 */
function renderModerationItems(items) {
    if (!moderationQueueListElement) return;

    moderationQueueListElement.innerHTML = ''; // Clear existing content

    if (items.length === 0) {
        moderationQueueListElement.innerHTML = `<div class="text-center text-gray-500">No items in the moderation queue.</div>`;
        return;
    }

    items.forEach(item => {
         // Assuming item structure: { id, type, reportedUser, reportingUser, reason, content, createdAt }
         // content could be { type: 'photo', url: '...' } or { type: 'text', text: '...' } etc.
        const reportedUser = item.reportedUser || {}; // Ensure it's an object
        const reportingUser = item.reportingUser || {}; // Ensure it's an object

        let contentTypeDisplay = '';
        if (item.content?.type === 'photo' && item.content?.url) {
            contentTypeDisplay = `<img src="${item.content.url}" alt="Reported Content" class="max-w-xs max-h-40 object-contain border rounded">`;
        } else if (item.content?.type === 'text' && item.content?.text) {
            contentTypeDisplay = `<p class="text-gray-800 italic">${item.content.text}</p>`;
        } else {
             contentTypeDisplay = `<p class="text-gray-500">Content preview not available.</p>`;
        }

        const createdAt = item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'; // Use toLocaleString for more detail

        const moderationItemHtml = `
             <div class="border border-gray-200 rounded-lg p-4" data-item-id="${item.id}">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="text-lg font-semibold text-dark">Item ID: #${item.id.substring(0, 8)} (${item.type || 'Unknown'})</h3>
                        <p class="text-sm text-gray-600">Reported User: <span class="font-medium">${reportedUser.name || 'N/A'} (ID: ${reportedUser.id?.substring(0, 8) || 'N/A'})</span></p>
                         ${item.reportingUser ? `<p class="text-sm text-gray-600">Reported By: <span class="font-medium">${reportingUser.name || 'N/A'} (ID: ${reportingUser.id?.substring(0, 8) || 'N/A'})</span></p>` : ''}
                    </div>
                    <span class="text-sm text-gray-500">Submitted: ${createdAt}</span>
                </div>
                 ${item.reason ? `
                    <div>
                        <p class="text-sm font-medium text-gray-700 mb-2">Report Reason:</p>
                        <p class="text-gray-800 italic mb-3">"${item.reason}"</p>
                    </div>
                 ` : ''}

                 <div class="mb-4">
                     <p class="text-sm font-medium text-gray-700 mb-2">Content to Review:</p>
                     ${contentTypeDisplay}
                 </div>

                 <div class="flex justify-end space-x-4">
                     <button class="btn-secondary text-sm" data-action="reject" data-item-id="${item.id}">Reject</button>
                     <button class="btn-primary text-sm" data-action="approve" data-item-id="${item.id}">Approve (No Action)</button>
                      <!-- Optional: Add action buttons related to the reported user (e.g., suspend user) -->
                       <button class="btn-secondary text-sm bg-yellow-500 hover:bg-yellow-600 text-white" data-action="suspend-user" data-user-id="${reportedUser.id}">Suspend User</button>
                 </div>
             </div>
        `;

        moderationQueueListElement.insertAdjacentHTML('beforeend', moderationItemHtml);
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
}


// --- Action Handlers ---

/**
 * Handles the click event for action buttons on moderation items.
 * Uses event delegation on the list container.
 * @param {Event} event - The click event.
 */
async function handleModerationAction(event) {
    const targetButton = event.target.closest('button[data-action]');
    if (!targetButton) return; // Not an action button

    const action = targetButton.dataset.action;
    const itemId = targetButton.dataset.itemId;
     const userId = targetButton.dataset.userId; // For user-specific actions


    if (!itemId && !userId) {
        console.error('Item ID or User ID not found on action button.');
        return;
    }

    console.log(`Admin Action: ${action} on item ID: ${itemId || 'N/A'}, User ID: ${userId || 'N/A'}`);

    // Optional: Add confirmation dialogs for destructive actions
    if (action === 'suspend-user' && !confirm(`Are you sure you want to suspend user ${userId}?`)) {
        console.log('Action cancelled by user.');
        return; // User cancelled
    }

    // Disable buttons within the item during the action
     const itemElement = targetButton.closest('[data-item-id]');
     if (itemElement) {
         selectElements('button', itemElement).forEach(btn => btn.disabled = true);
     }


    try {
        let endpoint;
        let method = 'PATCH'; // Moderation actions are typically updates
        let body = {}; // Default body structure


        switch (action) {
            case 'approve':
                endpoint = `/admin/moderation/${itemId}/approve`; // PATCH /api/admin/moderation/:itemId/approve
                break;
            case 'reject':
                 endpoint = `/admin/moderation/${itemId}/reject`; // PATCH /api/admin/moderation/:itemId/reject
                break;
            case 'suspend-user':
                 if (!userId) throw new Error('User ID is required for suspend-user action.');
                 // This action might belong to user management API, but initiated from moderation
                 endpoint = `/admin/users/${userId}/suspend`; // PATCH /api/admin/users/:userId/suspend
                 // After suspending user, you might still want to 'approve' or 'reject' the original report item
                 // This flow needs clarification - for now, we just perform the suspend action.
                 // A robust system would link moderation actions to user actions.
                 // We might need a separate endpoint like `/admin/moderation/:itemId/action` with body { action: 'suspendUser', userId: ... }
                 // For simplicity, we call the user suspend endpoint.
                 // Note: This call doesn't resolve the moderation item itself. You might need a follow-up call or backend logic to handle it.
                 // Let's assume for now that suspending the user *also* resolves the report.
                break;

            default:
                console.warn(`Unknown moderation action: ${action}`);
                throw new Error(`Unknown action: ${action}`); // Throw to catch in finally block
        }

        // Perform the API call
        const response = await api.request(endpoint, method, body, true); // Use general api.request

        console.log(`Action "${action}" successful for item ${itemId || 'N/A'} / user ${userId || 'N/A'}:`, response);
         displayPageMessage(`Action "${action}" completed successfully.`, 'success');

        // Remove the item from the list after successful action (except maybe suspend-user if it doesn't resolve the item)
        if (action !== 'suspend-user') { // Assuming suspend-user doesn't automatically remove the report item
             removeItemFromList(itemId);
        } else {
             // If suspend-user should also remove the item, add removeItemFromList(itemId);
             // Or, if the item status changes (e.g., "User Suspended"), refresh the list
             fetchModerationQueue(); // Refresh the whole list for simplicity
        }


    } catch (error) {
        console.error(`Failed to perform action "${action}" for item ${itemId || 'N/A'} / user ${userId || 'N/A'}:`, error);
         const errorMessage = `Failed to perform action "${action}". ${error.data?.message || error.message}`;
         displayPageMessage(errorMessage, 'error');

         if (error.status === 401) {
             endAdminSession(); // Clear invalid session
             redirectTo('/frontend/admin/pages/login.html'); // Redirect to login
         }

    } finally {
        // Re-enable buttons - this is handled by fetchModerationQueue if it's called,
        // otherwise, we'd need to find the itemElement and re-enable buttons manually.
        // Since we refresh the list, the new list will have enabled buttons.
    }
}

/**
 * Removes a moderation item element from the DOM by item ID.
 * @param {string} itemId - The ID of the item to remove.
 */
function removeItemFromList(itemId) {
    const itemElement = selectElement(`[data-item-id="${itemId}"]`, moderationQueueListElement);
    if (itemElement) {
        itemElement.remove();
        console.log(`Removed item ${itemId} from list.`);
        // Check if the list is now empty and update message
        if (moderationQueueListElement && moderationQueueListElement.children.length === 0) {
             displayPageMessage('The moderation queue is empty. Great job!', 'info');
        }
        // Optional: Fetch more items if pagination is used and list is short
        // if (moderationQueueListElement.children.length < itemsPerPage && totalPages > currentPage) {
        //      fetchModerationQueue(); // Auto-load next page
        // }
    }
}


/**
 * Handles pagination clicks.
 * @param {Event} event - The click event.
 */
function handlePaginationClick(event) {
    const targetButton = event.target.closest('.pagination-button');
    if (!targetButton || targetButton.disabled) return;

    if (targetButton.id === 'prev-page-button' && currentPage > 1) {
        currentPage--;
        fetchModerationQueue();
    } else if (targetButton.id === 'next-page-button' && currentPage < totalPages) {
        currentPage++;
        fetchModerationQueue();
    }
}


// --- Initialization ---

/**
 * Adds event listeners to the action buttons within the moderation queue list.
 * Uses event delegation.
 */
function addModerationActionListeners() {
    if (!moderationQueueListElement) return;
    // Use event delegation on the parent container
    moderationQueueListElement.addEventListener('click', handleModerationAction);
    console.log('Moderation action listeners added.');
}

/**
 * Initializes the Moderation Queue page script.
 */
async function initializeModerationPage() {
    console.log('Initializing Moderation Queue page...');

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
    moderationQueueListElement = getElement('moderation-queue-list');
    refreshQueueButton = getElement('refresh-queue-button');
    prevPageButton = getElement('prev-page-button');
    nextPageButton = getElement('next-page-button');
    pageInfoSpan = getElement('page-info');


    // 3. Populate admin name and avatar in the sidebar
    if (adminData) {
        populateAdminSidebar(adminData);
        console.log(`Displaying admin in sidebar: ${adminData.name}`);
        // Optional: Check admin role for moderation permissions
        // if (adminData.role !== 'moderator' && adminData.role !== 'superadmin') {
        //    displayPageMessage('You do not have permission to view this page.', 'error');
        //    hideElement(moderationQueueListElement.id); // Hide content
        //    // Maybe redirect back to dashboard
        // }
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
    addModerationActionListeners(); // Add action listeners via delegation
     if (refreshQueueButton) {
         refreshQueueButton.addEventListener('click', fetchModerationQueue);
         console.log('Refresh queue button listener added.');
     }
    if (prevPageButton) prevPageButton.addEventListener('click', handlePaginationClick);
    if (nextPageButton) nextPageButton.addEventListener('click', handlePaginationClick);
     console.log('Pagination button listeners added.');


    // 6. Fetch and display the initial moderation queue
    fetchModerationQueue();

    // 7. Initial state for message area
     if (pageMessageArea) {
        // Add base styling classes (optional, could be in CSS)
         pageMessageArea.className = `mb-6 p-3 rounded border text-center text-sm ${pageMessageArea.className}`;
         hidePageMessage(); // Ensure hidden initially
     }

    console.log('Moderation Queue initialization complete.');
}

// --- Entry Point ---

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeModerationPage);