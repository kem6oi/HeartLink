// /heartmatch/frontend/admin/js/subscriptionPlanManagement.js

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
let plansTableBodyElement; // Table body for plans
let addPlanButton; // Add plan button
// Pagination elements (hidden in HTML for now, but included for structure)
// let prevPageButton;
// let nextPageButton;
// let pageInfoSpan;

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
        adminAvatarElement.src = admin.avatarUrl;
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
 * Fetches subscription plans from the backend.
 */
async function fetchSubscriptionPlans() {
    console.log('Fetching subscription plans...');
    if (plansTableBodyElement) {
        plansTableBodyElement.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">Loading plans...</td></tr>`;
    }
    hidePageMessage(); // Hide any previous messages

    try {
        // Assuming API endpoint is GET /api/admin/subscriptions/plans
        // This requires admin authentication
        const response = await api.get('/admin/subscriptions/plans', true);

        console.log('Subscription plans fetched:', response);

        // Assuming response is an array of plan objects { id, name, price, duration, features }
        if (response && Array.isArray(response)) {
            renderSubscriptionPlans(response);

            if (response.length === 0) {
                 displayPageMessage('No subscription plans found.', 'info');
            }

        } else {
             console.error('Failed to fetch subscription plans: Invalid response format.', response);
              displayPageMessage('Failed to load subscription plans: Invalid data received.', 'error');
            renderSubscriptionPlans([]); // Render empty table on invalid response
        }

    } catch (error) {
        console.error('Failed to fetch subscription plans:', error);
        // Handle error (e.g., display error message, redirect if 401 Unauthorized)
        if (error.status === 401) {
            endAdminSession(); // Clear invalid session
            redirectTo('/frontend/admin/pages/login.html'); // Redirect to login
        } else {
             const errorMessage = `Failed to load subscription plans. ${error.data?.message || error.message}`;
             displayPageMessage(errorMessage, 'error');
             renderSubscriptionPlans([]); // Render empty table on error
        }
    }
}


// --- Rendering Functions ---

/**
 * Renders the list of subscription plans in the table.
 * @param {Array<object>} plans - An array of plan objects.
 */
function renderSubscriptionPlans(plans) {
    if (!plansTableBodyElement) return;

    plansTableBodyElement.innerHTML = ''; // Clear existing content

    if (plans.length === 0) {
        plansTableBodyElement.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No subscription plans to display.</td></tr>`;
        return;
    }

    plans.forEach(plan => {
         // Format features (assuming features is an array of strings)
        const featuresText = plan.features && Array.isArray(plan.features) && plan.features.length > 0
            ? plan.features.join(', ')
            : 'No features listed';
        // Format price
        const priceText = plan.price !== undefined ? `$${plan.price.toFixed(2)}` : 'N/A';
        // Format duration (e.g., "1 Month", "3 Months", "1 Year")
        const durationText = plan.duration || 'N/A'; // Assuming duration is a string like "1 Month"

        const planRowHtml = `
             <tr class="table-row-hover" data-plan-id="${plan.id}"> <!-- Use custom hover style -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${plan.id.substring(0, 8)}... <!-- Truncate ID -->
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     ${plan.name || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${priceText}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${durationText}
                </td>
                 <td class="px-6 py-4 text-sm text-gray-500 max-w-sm truncate" title="${featuresText}">
                    ${featuresText}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <!-- Action Buttons -->
                     <button class="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit Plan" data-action="edit" data-plan-id="${plan.id}">
                         <i class="fas fa-edit"></i>
                    </button>
                     <button class="text-red-600 hover:text-red-900" title="Delete Plan" data-action="delete" data-plan-id="${plan.id}">
                         <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;

        plansTableBodyElement.insertAdjacentHTML('beforeend', planRowHtml);
    });
}


// --- Action Handlers ---

/**
 * Handles the click event for action buttons in the plans table.
 * Uses event delegation on the table body.
 * @param {Event} event - The click event.
 */
async function handlePlanAction(event) {
    const targetButton = event.target.closest('button[data-action]');
    if (!targetButton) return; // Not an action button

    const action = targetButton.dataset.action;
    const planId = targetButton.dataset.planId;

    if (!planId) {
        console.error('Plan ID not found on action button.');
        return;
    }

    console.log(`Admin Action: ${action} on plan ID: ${planId}`);

    // Optional: Add confirmation dialogs for destructive actions
    if (action === 'delete' && !confirm(`Are you sure you want to delete plan ${planId}?`)) {
        console.log('Action cancelled by admin.');
        return; // Admin cancelled
    }

    // Disable the button during the action
    targetButton.disabled = true;

    try {
        let endpoint;
        let method;
        let body = {};

        switch (action) {
            case 'edit':
                console.log(`Editing plan ${planId}... (Functionality pending)`);
                // Implement logic to show an "Edit Plan" form/modal, populated with plan data
                alert(`Edit Plan functionality pending for ID: ${planId}`); // Placeholder
                 targetButton.disabled = false; // Re-enable immediately
                return; // Stop here

            case 'delete':
                endpoint = `/admin/subscriptions/plans/${planId}`; // DELETE /api/admin/subscriptions/plans/:planId
                method = 'DELETE';
                break;

            default:
                console.warn(`Unknown plan action: ${action}`);
                 targetButton.disabled = false; // Re-enable button for unknown action
                return; // Stop here
        }

        // Perform the API call
        const response = await api.request(endpoint, method, body, true);

        console.log(`Action "${action}" successful for plan ${planId}:`, response);
         displayPageMessage(`Plan ${planId} ${action}ed successfully.`, 'success');

        // Refresh the plans list after successful action
        fetchSubscriptionPlans();

    } catch (error) {
        console.error(`Failed to perform action "${action}" for plan ${planId}:`, error);
         const errorMessage = `Failed to ${action} plan ${planId}. ${error.data?.message || error.message}`;
         displayPageMessage(errorMessage, 'error');

         if (error.status === 401) {
             endAdminSession(); // Clear invalid session
             redirectTo('/frontend/admin/pages/login.html'); // Redirect to login
         }

    } finally {
        // Button is re-enabled when fetchSubscriptionPlans completes
        // or explicitly re-enable here if not refreshing list
        // targetButton.disabled = false;
    }
}


// --- Initialization ---

/**
 * Adds event listeners to the action buttons within the plans table.
 * Uses event delegation.
 */
function addPlanActionListeners() {
    if (!plansTableBodyElement) return;
    // Use event delegation on the parent container
    plansTableBodyElement.addEventListener('click', handlePlanAction);
    console.log('Plan action listeners added.');
}

/**
 * Initializes the Subscription Plan Management page script.
 */
async function initializeSubscriptionPlansPage() {
    console.log('Initializing Subscription Plan Management page...');

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
    plansTableBodyElement = getElement('plans-table-body');
    addPlanButton = getElement('add-plan-button');


    // 3. Populate admin name and avatar in the sidebar
    if (adminData) {
        populateAdminSidebar(adminData);
        console.log(`Displaying admin in sidebar: ${adminData.name}`);
        // Optional: Check admin role for plan management permissions
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
    addPlanActionListeners(); // Add action listeners via delegation
     if (addPlanButton) {
         addPlanButton.addEventListener('click', () => {
             console.log('"Add Plan" button clicked. (Functionality pending)');
             // Implement logic to show an "Add Plan" form/modal
             alert('Add Plan functionality pending.'); // Placeholder
         });
        console.log('"Add Plan" button listener added.');
    }


    // 6. Fetch and display the initial list of plans
    fetchSubscriptionPlans();

    // 7. Initial state for message area
     if (pageMessageArea) {
         pageMessageArea.className = `mb-6 p-3 rounded border text-center text-sm ${pageMessageArea.className}`;
         hidePageMessage(); // Ensure hidden initially
     }

    console.log('Subscription Plan Management initialization complete.');
}

// --- Entry Point ---

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeSubscriptionPlansPage);