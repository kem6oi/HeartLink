// /heartmatch/frontend/users/js/coins.js

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
import { mockCoinPackages } from './data/mockCoinPackages.js'; // Import mock data

// --- DOM Element Variables ---
let coinBalanceElement;
let coinPackagesListElement;
let coinsMessageArea;
let userNavNameElement; // For header nav
let userNavAvatarElement; // For header nav
let logoutButtonElement; // For header nav

// --- Helper Functions ---

/**
 * Displays a message in the coins page area.
 * @param {string} message - The message text.
 * @param {'success' | 'error' | 'info'} type - The type of message for styling.
 */
function displayCoinsMessage(message, type = 'info') {
     if (!coinsMessageArea) return;

     setText(coinsMessageArea.id, message);
     // Clear previous styling classes
     removeClass(coinsMessageArea.id, 'bg-green-100 border-green-400 text-green-700');
     removeClass(coinsMessageArea.id, 'bg-red-100 border-red-400 text-red-700');
     removeClass(coinsMessageArea.id, 'bg-blue-100 border-blue-400 text-blue-700');
     removeClass(coinsMessageArea.id, 'hidden'); // Ensure it's visible


     // Add type-specific styling
     switch (type) {
         case 'success': addClass(coinsMessageArea.id, 'bg-green-100 border-green-400 text-green-700'); break;
         case 'error': addClass(coinsMessageArea.id, 'bg-red-100 border-red-400 text-red-700'); break;
         case 'info':
         default: addClass(coinsMessageArea.id, 'bg-blue-100 border-blue-400 text-blue-700'); break;
     }

     showElement(coinsMessageArea.id);
}

/**
 * Hides the coins message area.
 */
function hideCoinsMessage() {
    if (coinsMessageArea) {
        hideElement(coinsMessageArea.id);
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
 * Fetches the logged-in user's current coin balance.
 */
async function fetchCoinBalance() {
    console.log('Fetching coin balance...');
    if (coinBalanceElement) setText(coinBalanceElement.id, 'Loading...');

    try {
         // Assuming API endpoint is GET /api/users/me/coins
         // Or the user profile endpoint already includes coin balance
        const response = await api.get('/users/me/coins', true); // Requires authentication

        console.log('Coin balance fetched:', response);

        if (response && typeof response.balance === 'number') {
            setText(coinBalanceElement.id, response.balance.toString());
        } else {
             setText(coinBalanceElement.id, 'Error');
            displayCoinsMessage('Failed to retrieve coin balance.', 'error');
        }

    } catch (error) {
        console.error('Failed to fetch coin balance:', error);
         setText(coinBalanceElement.id, 'Error');
         displayCoinsMessage(`Failed to load coin balance. ${error.data?.message || error.message}`, 'error');
         if (error.status === 401) {
             endSession(); // Clear invalid session
             redirectTo('/frontend/users/pages/login.html'); // Redirect to login
         }
    }
}

/**
 * Fetches available coin packages from the backend.
 */
async function fetchCoinPackages() {
    console.log('Fetching coin packages...');
     if (coinPackagesListElement) coinPackagesListElement.innerHTML = '<div class="col-span-full text-center text-gray-500">Loading coin packages...</div>';

    try {
        // Assuming API endpoint is GET /api/coins/packages
        // Should return an array of package objects { id, name, coins, price, bonus, description }
        // *** Using mock data for now ***
        // const packages = await api.get('/coins/packages'); // May not require authentication

        const packages = mockCoinPackages; // Use mock data for now
        console.log('Coin packages fetched (mock):', packages);


        if (packages && packages.length > 0) {
            renderCoinPackages(packages);
        } else {
             if (coinPackagesListElement) coinPackagesListElement.innerHTML = '<div class="col-span-full text-center text-gray-500">No coin packages available right now.</div>';
        }

    } catch (error) {
        console.error('Failed to fetch coin packages:', error);
         if (coinPackagesListElement) coinPackagesListElement.innerHTML = `<div class="col-span-full text-center text-red-600">Failed to load coin packages. ${error.data?.message || error.message}</div>`;
         // No auth check here as package list might be public
    }
}


// --- Rendering Functions ---

/**
 * Renders the available coin packages.
 * @param {Array<object>} packages - An array of package objects.
 */
function renderCoinPackages(packages) {
    if (!coinPackagesListElement) return;

    coinPackagesListElement.innerHTML = ''; // Clear loading/existing content

    packages.forEach(pkg => {
         const packageCardHtml = `
             <div class="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center border-2 border-transparent hover:border-primary transition-colors duration-200">
                <i class="fas fa-coins text-primary text-4xl mb-3"></i>
                <h3 class="text-2xl font-bold text-dark mb-1">${pkg.name || 'Coin Package'}</h3>
                <p class="text-xl text-gray-600 mb-4">$${pkg.price?.toFixed(2) || '0.00'}</p>
                <p class="text-gray-700 text-sm mb-4">Get <span class="font-semibold">${pkg.coins}</span> coins ${pkg.bonus > 0 ? `+ <span class="font-semibold text-green-600">${pkg.bonus} bonus!</span>` : ''}</p>
                 ${pkg.description ? `<p class="text-gray-700 text-sm mb-4">${pkg.description}</p>` : ''}
                <button class="btn-primary w-full mt-auto" data-package-id="${pkg.id}">Buy Now</button>
            </div>
         `; // mt-auto pushes button to the bottom

        coinPackagesListElement.insertAdjacentHTML('beforeend', packageCardHtml);
    });

    // Add event listeners to the buttons
    addPackageButtonListeners();
}


// --- Action Handlers ---

/**
 * Handles clicking a "Buy Now" button for a coin package.
 * Uses event delegation.
 * @param {Event} event - The click event.
 */
async function handleBuyPackageClick(event) {
    const targetButton = event.target.closest('button[data-package-id]');
    if (!targetButton) return;

    const packageId = targetButton.dataset.packageId;
    if (!packageId) {
        console.error('Package ID not found on button.');
        return;
    }

    console.log(`Attempting to purchase coin package: ${packageId}`);
    // Disable button and show loading feedback
     targetButton.disabled = true;
     const originalButtonText = targetButton.textContent;
     targetButton.textContent = 'Processing...'; // Example feedback

    // Clear previous messages
    hideCoinsMessage();

    try {
        // Assuming API endpoint is POST /api/coins/purchase
        // This will likely initiate a payment flow (e.g., redirect to Stripe Checkout)
        const response = await api.post('/coins/purchase', { packageId: packageId }, true); // Requires authentication

        console.log('Coin purchase initiation response:', response);

        // Handle response - This depends heavily on your payment gateway integration
        if (response && response.redirectUrl) {
            // Redirect the user to the payment gateway (e.g., Stripe Checkout)
            console.log('Redirecting for payment:', response.redirectUrl);
            redirectTo(response.redirectUrl);
        } else if (response && response.success) {
            // Handle direct success (less common for payments)
             displayCoinsMessage('Coin package purchased successfully! Your balance will update shortly.', 'success');
             // Refresh coin balance after successful purchase (API might take a moment to update)
             setTimeout(fetchCoinBalance, 2000); // Fetch balance after 2 seconds
        } else {
            // Handle other API response structures indicating failure or needing more steps
            console.error('Unexpected purchase response:', response);
             displayCoinsMessage(response.message || 'Coin purchase failed. Please try again.', 'error');
        }

    } catch (error) {
        console.error('Failed to purchase coin package:', error);
        const errorMessage = `Purchase failed. ${error.data?.message || error.message}`;
        displayCoinsMessage(errorMessage, 'error');

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
 * Adds event listeners to the coin package purchase buttons.
 * Uses event delegation on the packages list container.
 * This is called after rendering the packages.
 */
function addPackageButtonListeners() {
    if (!coinPackagesListElement) return;
    // Use event delegation on the parent container
    coinPackagesListElement.addEventListener('click', handleBuyPackageClick);
    console.log('Coin package button listeners added.');
}


/**
 * Initializes the Coins page script.
 */
function initializeCoinsPage() {
    console.log('Initializing coins page...');

    // 1. Protect the page: Ensure the user is authenticated
    requireAuth(); // This will redirect to login if no valid session is found

    // If requireAuth did *not* redirect, we know the user is authenticated
    console.log('User is authenticated.');
    const currentUser = getUserData(); // Get logged-in user data

    // 2. Get DOM elements
    coinBalanceElement = getElement('coin-balance');
    coinPackagesListElement = getElement('coin-packages-list');
    coinsMessageArea = getElement('coins-message');
    userNavNameElement = getElement('user-nav-name-coins');
    userNavAvatarElement = getElement('user-nav-avatar-coins');
    logoutButtonElement = getElement('logout-button-coins');


    // 3. Add common listeners (Logout)
    if (logoutButtonElement) {
        logoutButtonElement.addEventListener('click', handleLogout);
        console.log('Logout button listener added (coins).');
    }

    // 4. Populate header navigation with logged-in user data
     if (currentUser) {
        populateNavHeader(currentUser);
        console.log(`Displaying user in nav: ${currentUser.name}`);
    } else {
         console.warn('User data not available for nav header.');
     }


    // 5. Fetch and display current coin balance
    fetchCoinBalance();

    // 6. Fetch and display coin packages
    fetchCoinPackages();


    // 7. Initial state for message area
     if (coinsMessageArea) {
         coinsMessageArea.className = `mt-4 p-3 rounded border text-center text-sm ${coinsMessageArea.className}`;
         hideCoinsMessage(); // Ensure hidden initially
     }

     console.log('Coins page initialization complete.');
}

// --- Entry Point ---

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeCoinsPage);

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