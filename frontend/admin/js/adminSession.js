// /heartmatch/frontend/admin/js/adminSession.js

import { saveToLocalStorage, getFromLocalStorage, removeFromLocalStorage, redirectTo } from './utils.js'; // Use local admin utils

const ADMIN_AUTH_TOKEN_KEY = 'adminAuthToken';
const ADMIN_DATA_KEY = 'adminData'; // Optional: store basic admin data too

/**
 * Saves the admin authentication token and optionally admin data to local storage.
 * @param {string} token - The authentication token received from the server.
 * @param {object} [adminData=null] - Optional admin data to store (e.g., admin ID, name, role).
 */
export function createAdminSession(token, adminData = null) {
    saveToLocalStorage(ADMIN_AUTH_TOKEN_KEY, token);
    if (adminData) {
        saveToLocalStorage(ADMIN_DATA_KEY, adminData);
    }
    console.log('Admin session created.');
}

/**
 * Retrieves the admin authentication token from local storage.
 * @returns {string | null} The authentication token if found, otherwise null.
 */
export function getAdminAuthToken() {
    return getFromLocalStorage(ADMIN_AUTH_TOKEN_KEY);
}

/**
 * Retrieves stored admin data from local storage.
 * @returns {object | null} The admin data object if found, otherwise null.
 */
export function getAdminData() {
    return getFromLocalStorage(ADMIN_DATA_KEY);
}


/**
 * Checks if an admin is currently authenticated (by checking for a token).
 * @returns {boolean} True if a token exists, false otherwise.
 */
export function isAdminAuthenticated() {
    return getAdminAuthToken() !== null;
}

/**
 * Removes the admin authentication token and data from local storage, effectively ending the session.
 */
export function endAdminSession() {
    removeFromLocalStorage(ADMIN_AUTH_TOKEN_KEY);
    removeFromLocalStorage(ADMIN_DATA_KEY);
    console.log('Admin session ended.');
}

/**
 * Checks if the admin is authenticated and redirects to the admin login page if not.
 * Useful for protecting admin routes.
 */
export function requireAdminAuth() {
    if (!isAdminAuthenticated()) {
        console.log('Admin not authenticated. Redirecting to login.');
        // Adjust path based on your admin login page location
        redirectTo('/frontend/admin/pages/login.html');
    }
}

/**
 * Checks if the admin is authenticated and redirects to the admin dashboard/home page if they are.
 * Useful for admin login page.
 */
export function redirectAdminIfAuthenticated() {
    if (isAdminAuthenticated()) {
         console.log('Admin already authenticated. Redirecting to dashboard.');
         // Adjust path based on your admin logged-in landing page
         redirectTo('/frontend/admin/index.html'); // Assuming index.html is the admin dashboard
    }
}

// Add event listener to run redirectAdminIfAuthenticated on admin login page load
// (Optional, depends on your page structure and routing)
// window.addEventListener('load', () => {
//     const currentPage = window.location.pathname;
//     if (currentPage.includes('/admin/pages/login.html')) {
//         redirectAdminIfAuthenticated();
//     }
// });