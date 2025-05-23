// /heartmatch/frontend/users/js/main.js

// Import necessary functions
import { requireAuth, endSession, getUserData } from './session.js';
import { getElement, redirectTo, setText } from './utils.js'; // Using utils for DOM manipulation and redirect

// --- Page Initialization ---

/**
 * Initializes the user dashboard page.
 * This function is called when the DOM is fully loaded.
 */
function initializeDashboard() {
    console.log('Initializing user dashboard...');

    // 1. Protect the page: Ensure the user is authenticated
    requireAuth(); // This will redirect to login if no valid session is found

    // If requireAuth did *not* redirect, we know the user is authenticated
    console.log('User is authenticated.');

    // 2. Display user name in the header
    const userData = getUserData();
    if (userData && userData.name) {
        setText('user-nav-name', userData.name);
        console.log(`Displaying user: ${userData.name}`);
    } else {
        // Fallback or handle case where name is not stored in session data
        setText('user-nav-name', 'User');
        console.warn('User name not found in session data.');
    }

    // 3. Set up the logout button listener
    const logoutButton = getElement('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
        console.log('Logout button listener added.');
    } else {
        console.error('Logout button (#logout-button) not found!');
    }

    // Add initialization logic for dashboard specific features here later
    // e.g., fetch and display recent activity, suggested matches, etc.
    // fetchDashboardData();
}

// --- Event Handlers ---

/**
 * Handles the logout action.
 * Ends the session and redirects the user to the login page.
 */
function handleLogout() {
    console.log('Attempting to log out...');
    endSession(); // Clear session data
    // Redirect to the login page
    // Adjust path based on your index.html location or routing strategy
    redirectTo('/frontend/users/pages/login.html');
}


// --- Entry Point ---

// Wait for the DOM to be fully loaded before initializing the page script
document.addEventListener('DOMContentLoaded', initializeDashboard);