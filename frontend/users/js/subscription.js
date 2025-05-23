// /heartmatch/frontend/users/js/subscription.js

// Import necessary functions
import { requireAuth, endSession, getUserData } from './session.js';
import {
    getElement,
    selectElement,
    selectElements,
    redirectTo,
    setText,
    showElement,
    hideElement,
    addClass,
    removeClass
} from './utils.js';

import { api } from '../../common/js/apiService.js'; // Direct import from common

// --- DOM Element Variables ---
let subscriptionPlansListElement;
let premiumMessageArea;
let currentSubscriptionElement;
let subscriptionStatusTextElement;
let userNavNameElement; // For header nav
let userNavAvatarElement; // For header nav
let logoutButtonElement; // For header nav

// --- Helper Functions ---

/**
 * Displays a message in the premium store area.
 * @param {string} message - The message text.
 * @param {'success' | 'error' | 'info'} type - The type of message for styling.
 */
function displayPremiumMessage(message, type = 'info') {
     if (!premiumMessageArea) return;

     setText(premiumMessageArea.id, message);
     // Clear previous styling classes
     removeClass(premiumMessageArea.id, 'bg-green-100 border-green-400 text-green-700');
     removeClass(premiumMessageArea.id, 'bg-red-100 border-red-400 text-red-700');
     removeClass(premiumMessageArea.id, 'bg-blue-100 border-blue-400 text-blue-700');
     removeClass(premiumMessageArea.id, 'hidden'); // Ensure it's visible


     // Add type-specific styling
     switch (type) {
         case 'success': addClass(premiumMessageArea.id, 'bg-green-100 border-green-400 text-green-700'); break;
         case 'error': addClass(premiumMessageArea.id, 'bg-red-100 border-red-400 text-red-700'); break;
         case 'info':
         default: addClass(premiumMessageArea.id, 'bg-blue-100 border-blue-400 text-blue-700'); break;
     }

     showElement(premiumMessageArea.id);
}

/**
 * Hides the premium message area.
 */
function hidePremiumMessage() {
    if (premiumMessageArea) {
        hideElement(premiumMessageArea.id);
    }
}

/**
 * Populates the user's name and avatar in the common header navigation.
 * @param {object} user - The user data object (should contain name and possibly avatarUrl).
 */
function populateNavHeader(user) {
    if (userNavNameElement && user?.name) {
        setText(userNavNameElement.id, user.name);
    }
    if (userNavAvatarElement && user?.avatarUrl) {
        userNavAvatarElement.src = user.avatarUrl;
    }
}


// --- Data Fetching ---

/**
 * Fetches available subscription plans from the backend.
 */
async function fetchSubscriptionPlans() {
    console.log('Fetching subscription plans...');
    if (subscriptionPlansListElement) subscriptionPlansListElement.innerHTML = '<div class="col-span-full text-center text-gray-500">Loading subscription plans...</div>';

    try {
        // Assuming API endpoint is GET /api/subscriptions/plans
        // Should return an array of plan objects { id, name, price, duration, features }
        const plans = await api.get('/subscriptions/plans'); // May not require authentication if plans are public

        console.log('Subscription plans fetched:', plans);

        if (plans && plans.length > 0) {
            renderSubscriptionPlans(plans);
        } else {
            if (subscriptionPlansListElement) subscriptionPlansListElement.innerHTML = '<div class="col-span-full text-center text-gray-500">No subscription plans available right now.</div>';
        }

    } catch (error) {
        console.error('Failed to fetch subscription plans:', error);
        if (subscriptionPlansListElement) subscriptionPlansListElement.innerHTML = `<div class="col-span-full text-center text-red-600">Failed to load plans. ${error.data?.message || error.message}</div>`;
        // Note: Plan fetching might fail due to network, not auth
    }
}

/**
 * Fetches the current user's subscription status.
 */
async function fetchCurrentSubscriptionStatus() {
    console.log('Fetching current subscription status...');
    if (currentSubscriptionElement) showElement(currentSubscriptionElement.id); // Show container
    if (subscriptionStatusTextElement) setText(subscriptionStatusTextElement.id, 'Loading status...');

    try {
         // Assuming API endpoint is GET /api/users/me/subscription or /api/subscriptions/my
         // This requires authentication
        const status = await api.get('/users/me/subscription', true); // Assuming this returns current sub info

        console.log('Current subscription status fetched:', status);

        if (status && status.active) {
            // Display active subscription details
            const expiryDate = status.endDate ? new Date(status.endDate).toLocaleDateString() : 'N/A';
             setText(subscriptionStatusTextElement.id, `You are currently subscribed to: <span class="font-semibold">${status.planName || 'Premium'}</span>. Expires on: ${expiryDate}.`);
             // Optionally hide the plan list or show upgrade options
             // if (subscriptionPlansListElement) hideElement(subscriptionPlansListElement.id); // Maybe hide the whole list
             selectElements('.btn-primary', subscriptionPlansListElement).forEach(btn => btn.textContent = 'Upgrade Plan'); // Change button text to Upgrade
        } else {
            // Display no active subscription message
             setText(subscriptionStatusTextElement.id, 'You do not have an active premium subscription.');
             // Optionally keep plan list visible for purchase
             if (currentSubscriptionElement) hideElement(currentSubscriptionElement.id); // Hide if not subscribed
        }

    } catch (error) {
        console.error('Failed to fetch subscription status:', error);
         setText(subscriptionStatusTextElement.id, `Failed to load subscription status. ${error.data?.message || error.message}`);
        // Handle error (e.g., display error message, hide status section)
        if (currentSubscriptionElement) hideElement(currentSubscriptionElement.id); // Hide on error
         if (error.status === 401) {
             endSession(); // Clear invalid session
             redirectTo('/frontend/users/pages/login.html'); // Redirect to login
         }
    }
}


// --- Rendering Functions ---

/**
 * Renders the available subscription plans.
 * @param {Array<object>} plans - An array of plan objects.
 */
function renderSubscriptionPlans(plans) {
    if (!subscriptionPlansListElement) return;

    subscriptionPlansListElement.innerHTML = ''; // Clear loading/existing content

    plans.forEach(plan => {
         // Basic feature list rendering - assumes features is an array of strings
         const featuresHtml = plan.features && plan.features.length > 0
            ? plan.features.map(feature => `<li><i class="fas fa-check-circle text-primary mr-2"></i> ${feature}</li>`).join('')
            : '';

        const planCardHtml = `
            <div class="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center border-2 border-transparent hover:border-primary transition-colors duration-200">
                <h3 class="text-2xl font-bold text-dark mb-2">${plan.name || 'Premium Plan'}</h3>
                <p class="text-primary text-4xl font-bold mb-4">$${plan.price?.toFixed(2) || '0.00'}<span class="text-lg text-gray-600">${plan.duration ? `/${plan.duration}` : ''}</span></p>
                ${plan.description ? `<p class="text-gray-700 mb-4">${plan.description}</p>` : ''}
                <p class="text-gray-700 mb-6">Includes:</p>
                <ul class="text-left text-gray-700 space-y-2 flex-grow w-full">
                    ${featuresHtml || '<li>No specific features listed.</li>'}
                </ul>
                <button class="btn-primary w-full mt-8" data-plan-id="${plan.id}">Choose Plan</button>
            </div>
        `;

        subscriptionPlansListElement.insertAdjacentHTML('beforeend', planCardHtml);
    });

    // Add event listeners to the buttons
    addPlanButtonListeners();
}


// --- Action Handlers ---

/**
 * Handles clicking a "Choose Plan" or "Upgrade Plan" button.
 * Uses event delegation.
 * @param {Event} event - The click event.
 */
async function handleChoosePlanClick(event) {
    const targetButton = event.target.closest('button[data-plan-id]');
    if (!targetButton) return;

    const planId = targetButton.dataset.planId;
    if (!planId) {
        console.error('Plan ID not found on button.');
        return;
    }

    console.log(`Attempting to purchase plan: ${planId}`);
    // Disable button and show loading feedback
     targetButton.disabled = true;
     const originalButtonText = targetButton.textContent;
     targetButton.textContent = 'Processing...'; // Example feedback

    // Clear previous messages
    hidePremiumMessage();

    try {
        // Assuming API endpoint is POST /api/subscriptions/purchase
        // This will likely initiate a payment flow (e.g., redirect to Stripe Checkout)
        const response = await api.post('/subscriptions/purchase', { planId: planId }, true); // Requires authentication

        console.log('Purchase initiation response:', response);

        // Handle response - This depends heavily on your payment gateway integration
        if (response && response.redirectUrl) {
            // Redirect the user to the payment gateway (e.g., Stripe Checkout)
            console.log('Redirecting for payment:', response.redirectUrl);
            redirectTo(response.redirectUrl);
        } else if (response && response.success) {
            // Handle direct success (less common for subscriptions)
             displayPremiumMessage('Subscription purchased successfully!', 'success');
             // Refresh subscription status after successful purchase
             fetchCurrentSubscriptionStatus();
        } else {
            // Handle other API response structures indicating failure or needing more steps
            console.error('Unexpected purchase response:', response);
             displayPremiumMessage(response.message || 'Subscription purchase failed. Please try again.', 'error');
        }

    } catch (error) {
        console.error('Failed to purchase subscription:', error);
        const errorMessage = `Purchase failed. ${error.data?.message || error.message}`;
        displayPremiumMessage(errorMessage, 'error');

         if (error.status === 401) {
             endSession(); // Clear invalid session
             redirectTo('/frontend/users/pages/login.html'); // Redirect to login
         }

    } finally {
        // Re-enable button and restore text if not redirected
         if (!window.location.href.includes('redirectUrl') && targetButton) { // Prevent re-enabling if redirecting
             targetButton.disabled = false;
             targetButton.textContent = originalButtonText;
         }
    }
}


// --- Initialization ---

/**
 * Adds event listeners to the plan purchase buttons.
 * Uses event delegation on the plans list container.
 * This is called after rendering the plans.
 */
function addPlanButtonListeners() {
    if (!subscriptionPlansListElement) return;
    // Use event delegation on the parent container
    subscriptionPlansListElement.addEventListener('click', handleChoosePlanClick);
    console.log('Plan button listeners added.');
}

/**
 * Initializes the Premium Store page script.
 */
function initializePremiumStorePage() {
    console.log('Initializing premium store page...');

    // 1. Protect the page: Ensure the user is authenticated
    requireAuth(); // This will redirect to login if no valid session is found

    // If requireAuth did *not* redirect, we know the user is authenticated
    console.log('User is authenticated.');
    const currentUser = getUserData(); // Get logged-in user data

    // 2. Get DOM elements
    subscriptionPlansListElement = getElement('subscription-plans-list');
    premiumMessageArea = getElement('premium-message');
    currentSubscriptionElement = getElement('current-subscription');
    subscriptionStatusTextElement = getElement('subscription-status-text');
    userNavNameElement = getElement('user-nav-name-premium');
    userNavAvatarElement = getElement('user-nav-avatar-premium');
    logoutButtonElement = getElement('logout-button-premium');


    // 3. Add common listeners (Logout)
    if (logoutButtonElement) {
        logoutButtonElement.addEventListener('click', handleLogout);
        console.log('Logout button listener added (premium).');
    }

    // 4. Populate header navigation with logged-in user data
     if (currentUser) {
        populateNavHeader(currentUser);
        console.log(`Displaying user in nav: ${currentUser.name}`);
    } else {
         console.warn('User data not available for nav header.');
     }

    // 5. Fetch and display subscription plans
    fetchSubscriptionPlans();

    // 6. Fetch and display current subscription status
    fetchCurrentSubscriptionStatus();

    // 7. Initial state for message area and subscription status area
     if (premiumMessageArea) {
         premiumMessageArea.className = `mt-4 p-3 rounded border text-center text-sm ${premiumMessageArea.className}`;
         hidePremiumMessage(); // Ensure hidden initially
     }
     // Current subscription area is shown by default, its content updated while loading

     console.log('Premium store initialization complete.');
}

// --- Entry Point ---

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializePremiumStorePage);

// --- Event Handlers (Logout - Keep here for direct use if needed, though imported in initialize) ---
/**
 * Handles the logout action.
 * Ends the session and redirects the user to the login page.
 */
function handleLogout() {
    console.log('Attempting to log out...');
    endSession(); // Clear session data
    // Redirect to the login page
    redirectTo('/frontend/users/pages/login.html'); // Adjust path as needed
}