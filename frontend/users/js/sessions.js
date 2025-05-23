// /heartmatch/frontend/users/js/session.js

import { saveToLocalStorage, getFromLocalStorage, removeFromLocalStorage, redirectTo } from './utils.js'; // Use local utils which imports shared

const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData'; // Optional: store basic user data too

/**
 * Saves the authentication token and optionally user data to local storage.
 * @param {string} token - The authentication token received from the server.
 * @param {object} [userData=null] - Optional user data to store (e.g., user ID, name).
 */
export function createSession(token, userData = null) {
    saveToLocalStorage(AUTH_TOKEN_KEY, token);
    if (userData) {
        saveToLocalStorage(USER_DATA_KEY, userData);
    }
    console.log('Session created.');
}

/**
 * Retrieves the authentication token from local storage.
 * @returns {string | null} The authentication token if found, otherwise null.
 */
export function getAuthToken() {
    return getFromLocalStorage(AUTH_TOKEN_KEY);
}

/**
 * Retrieves stored user data from local storage.
 * @returns {object | null} The user data object if found, otherwise null.
 */
export function getUserData() {
    return getFromLocalStorage(USER_DATA_KEY);
}


/**
 * Checks if a user is currently authenticated (by checking for a token).
 * @returns {boolean} True if a token exists, false otherwise.
 */
export function isAuthenticated() {
    return getAuthToken() !== null;
}

/**
 * Removes the authentication token and user data from local storage, effectively ending the session.
 */
export function endSession() {
    removeFromLocalStorage(AUTH_TOKEN_KEY);
    removeFromLocalStorage(USER_DATA_KEY);
    console.log('Session ended.');
}

/**
 * Checks if the user is authenticated and redirects to the login page if not.
 * Useful for protecting routes.
 */
export function requireAuth() {
    if (!isAuthenticated()) {
        console.log('User not authenticated. Redirecting to login.');
        // Adjust path based on your index.html location or routing strategy
        redirectTo('/frontend/users/pages/login.html');
    }
}

/**
 * Checks if the user is authenticated and redirects to a dashboard/home page if they are.
 * Useful for login/register pages.
 */
export function redirectIfAuthenticated() {
    if (isAuthenticated()) {
         console.log('User already authenticated. Redirecting to dashboard.');
         // Adjust path based on your logged-in landing page
         redirectTo('/frontend/users/index.html'); // Assuming index.html is the dashboard/home
    }
}

// Add event listener to run redirectIfAuthenticated on login/register pages load
// (Optional, depends on your page structure and routing)
// window.addEventListener('load', () => {
//     const currentPage = window.location.pathname;
//     if (currentPage.includes('/login.html') || currentPage.includes('/register.html')) {
//         redirectIfAuthenticated();
//     }
// });