// /heartmatch/frontend/staff/js/auth.js

import {
    getElement,
    getFormData,
    isValidEmail,
    redirectTo,
    setText,
    showElement,
    hideElement,
    addClass,
    removeClass
} from './utils.js'; // Use local staff utils

import { api } from '../../common/js/apiService.js'; // Import the api service

import {
    createStaffSession,
    redirectStaffIfAuthenticated
} from './staffSession.js';

// --- DOM Element Variables ---
let staffLoginForm;
let staffAuthMessageArea;
let loginButton;

// --- Event Handlers ---

/**
 * Handles the staff login form submission.
 * @param {Event} event - The form submit event.
 */
async function handleStaffLoginSubmit(event) {
    event.preventDefault(); // Prevent default form refresh

    const formData = getFormData(staffLoginForm);
    const email = formData.email;
    const password = formData.password;

    console.log('Staff login attempt with API:', { email });

    // Clear previous messages and hide the message area
    if (staffAuthMessageArea) {
        setText(staffAuthMessageArea.id, '');
        hideElement(staffAuthMessageArea.id);
        removeClass(staffAuthMessageArea.id, 'bg-red-100', 'border-red-400', 'text-red-700', 'bg-green-100', 'border-green-400', 'text-green-700');
    }

    // Basic validation
    if (!email || !password) {
        console.error('Email and password are required for staff login.');
        if (staffAuthMessageArea) {
            setText(staffAuthMessageArea.id, 'Please enter both email and password.');
            addClass(staffAuthMessageArea.id, 'bg-red-100', 'border-red-400', 'text-red-700');
            showElement(staffAuthMessageArea.id);
        }
        return;
    }

    if (!isValidEmail(email)) {
        console.error('Invalid email format for staff login.');
        if (staffAuthMessageArea) {
            setText(staffAuthMessageArea.id, 'Please enter a valid email address.');
            addClass(staffAuthMessageArea.id, 'bg-red-100', 'border-red-400', 'text-red-700');
            showElement(staffAuthMessageArea.id);
        }
        return;
    }

    // Disable login button during processing
    if (loginButton) {
        loginButton.disabled = true;
        setText(loginButton.id, 'Logging in...'); 
    }

    try {
        // Call the backend API for staff login
        // apiService.js will prepend the API_BASE_URL (e.g. http://localhost:3000/api)
        // The endpoint is '/auth/staff/login'
        const response = await api.post('/auth/staff/login', { email, password }, false); // 'false' because login itself doesn't require prior auth
        
        console.log('API staff login successful:', response);

        if (response && response.token && response.staff) {
            // createStaffSession stores token under 'staff_auth_token' and user data under 'staff_user_data'
            createStaffSession(response.token, response.staff); 
            
            // Note: apiService.js uses a generic 'authToken' for *subsequent* authenticated requests.
            // If staff-specific authenticated API calls are made later using apiService,
            // and apiService is not modified to use 'staff_auth_token', then we might need to also store
            // response.token under 'authToken'. For now, this is not done, assuming staff-specific
            // API calls might handle token retrieval specifically or apiService would be adapted.

            if (staffAuthMessageArea) {
                setText(staffAuthMessageArea.id, 'Login successful! Redirecting...');
                addClass(staffAuthMessageArea.id, 'bg-green-100', 'border-green-400', 'text-green-700');
                showElement(staffAuthMessageArea.id);
            }
            
            // Redirect to the staff dashboard (path relative to pages/login.html which is where this script is used)
            redirectTo('../index.html'); 
        } else {
            // This case should ideally be caught by apiService if response.ok is false
            // but as a fallback for unexpected successful responses with missing data:
            console.error('API staff login failed: Invalid response structure from server.', response);
            if (staffAuthMessageArea) {
                setText(staffAuthMessageArea.id, 'Login failed. Unexpected response from server.');
                addClass(staffAuthMessageArea.id, 'bg-red-100', 'border-red-400', 'text-red-700');
                showElement(staffAuthMessageArea.id);
            }
        }

    } catch (error) {
        console.error('API staff login request failed:', error);
        // error.data.message should be populated by apiService based on backend response
        const errorMessage = error.data?.message || error.message || 'An error occurred during login.';
        if (staffAuthMessageArea) {
            setText(staffAuthMessageArea.id, errorMessage);
            addClass(staffAuthMessageArea.id, 'bg-red-100', 'border-red-400', 'text-red-700');
            showElement(staffAuthMessageArea.id);
        }
    } finally {
        // Re-enable login button
        if (loginButton) {
            loginButton.disabled = false;
            setText(loginButton.id, 'Log In'); 
        }
    }
}

// --- Initialization ---

/**
 * Initializes the staff login page script.
 */
function initializeStaffLoginPage() {
    console.log('Initializing staff login page for API connection...');

    // Redirect authenticated staff away from the login page
    // Path to dashboard is relative to pages/login.html
    redirectStaffIfAuthenticated('../index.html');

    staffLoginForm = getElement('staff-login-form'); // From staff/pages/login.html
    staffAuthMessageArea = getElement('auth-message'); // From staff/pages/login.html
    loginButton = getElement('login-button'); // From staff/pages/login.html

    if (staffLoginForm) {
        staffLoginForm.addEventListener('submit', handleStaffLoginSubmit);
        console.log('Staff login form listener added.');
    } else {
        console.error('Staff login form (#staff-login-form) not found on this page!');
    }

    if (staffAuthMessageArea) {
        // Ensure it's hidden initially, classes will be added on demand
        hideElement(staffAuthMessageArea.id);
    } else {
        console.warn('Auth message area (#auth-message) not found on this page.');
    }
}

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeStaffLoginPage);
