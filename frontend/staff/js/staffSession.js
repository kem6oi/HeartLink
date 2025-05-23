// /heartmatch/frontend/staff/js/staffSession.js

const STAFF_TOKEN_KEY = 'staff_auth_token';
const STAFF_DATA_KEY = 'staff_user_data';

/**
 * Stores the staff authentication token and user data in localStorage.
 * @param {string} token - The authentication token.
 * @param {object} staffData - Data about the authenticated staff member.
 */
export function createStaffSession(token, staffData) {
    console.log('Creating staff session:', { token, staffData });
    try {
        localStorage.setItem(STAFF_TOKEN_KEY, token);
        localStorage.setItem(STAFF_DATA_KEY, JSON.stringify(staffData));
        console.log('Staff session created successfully.');
    } catch (error) {
        console.error('Error creating staff session:', error);
        // Potentially handle localStorage quota exceeded errors
    }
}

/**
 * Retrieves the staff authentication token from localStorage.
 * @returns {string|null} The token, or null if not found.
 */
export function getStaffToken() {
    try {
        return localStorage.getItem(STAFF_TOKEN_KEY);
    } catch (error) {
        console.error('Error retrieving staff token:', error);
        return null;
    }
}

/**
 * Retrieves the authenticated staff's data from localStorage.
 * @returns {object|null} The staff data, or null if not found or on error.
 */
export function getStaffData() {
    try {
        const staffDataString = localStorage.getItem(STAFF_DATA_KEY);
        return staffDataString ? JSON.parse(staffDataString) : null;
    } catch (error) {
        console.error('Error retrieving staff data:', error);
        return null;
    }
}

/**
 * Clears the staff authentication token and user data from localStorage.
 */
export function endStaffSession() {
    console.log('Ending staff session...');
    try {
        localStorage.removeItem(STAFF_TOKEN_KEY);
        localStorage.removeItem(STAFF_DATA_KEY);
        console.log('Staff session ended.');
        // Optionally, redirect to login page after ending session
        // redirectTo('/frontend/staff/pages/login.html'); 
    } catch (error) {
        console.error('Error ending staff session:', error);
    }
}

/**
 * Checks if a staff authentication token exists in localStorage.
 * @returns {boolean} True if authenticated, false otherwise.
 */
export function isStaffAuthenticated() {
    const token = getStaffToken();
    // console.log('Is staff authenticated check, token:', token); // Can be noisy
    return !!token; // Returns true if token exists and is not an empty string
}

/**
 * Redirects to the staff dashboard or a specified target URL if the staff member is already authenticated.
 * @param {string} targetUrl - The URL to redirect to if authenticated. Defaults to '../pages/dashboard.html'.
 */
export function redirectStaffIfAuthenticated(targetUrl = '../pages/dashboard.html') {
    if (isStaffAuthenticated()) {
        console.log('Staff already authenticated. Redirecting to:', targetUrl);
        // Assuming redirectTo is globally available or imported.
        // If it's part of utils.js, ensure utils.js is loaded or import it.
        // For now, using window.location as a fallback if redirectTo is not defined in this scope.
        if (typeof redirectTo === 'function') {
            redirectTo(targetUrl);
        } else {
            window.location.href = targetUrl;
        }
    }
}

/**
 * If the staff member is not authenticated, redirects them to the login page.
 * Call this on pages that require authentication.
 * @param {string} loginUrl - The URL of the login page. Defaults to 'login.html' (relative to current page).
 */
export function requireStaffAuth(loginUrl = 'login.html') {
    if (!isStaffAuthenticated()) {
        console.log('Staff not authenticated. Redirecting to login page:', loginUrl);
        if (typeof redirectTo === 'function') {
            redirectTo(loginUrl);
        } else {
            window.location.href = loginUrl;
        }
    }
}

// Example usage (typically called from other scripts, e.g., on page load for protected pages):
// document.addEventListener('DOMContentLoaded', () => {
//     // For pages that require authentication:
//     // requireStaffAuth('../pages/login.html'); // Adjust path as needed
//
//     // For the login page itself, to redirect if already logged in:
//     // redirectStaffIfAuthenticated('../pages/dashboard.html'); // Adjust path as needed
// });
