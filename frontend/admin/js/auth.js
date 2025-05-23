// /heartmatch/frontend/admin/js/auth.js

// Import necessary functions
import {
    getElement,
    getFormData,
    isValidEmail,
    redirectTo,
    setText, // We might need this to display error messages
    showElement, // Might need this too
    hideElement // Might need this too
} from './utils.js'; // Use local admin utils

import {
    api // Import the api service (from common)
} from '../../common/js/apiService.js'; // Direct import from common

import {
    createAdminSession,
    isAdminAuthenticated, // Not strictly needed here if redirectIfAuthenticated is used
    redirectAdminIfAuthenticated // Import function to check and redirect if already logged in
} from './adminSession.js';

import {
    mockAdmins // Import mock admin data
} from './data/mockAdmins.js';

// --- DOM Element Variables ---
let adminLoginForm;
let adminAuthMessageArea; // Optional: for displaying error/success messages

// --- Event Handlers ---

/**
 * Handles the admin login form submission.
 * @param {Event} event - The form submit event.
 */
async function handleAdminLoginSubmit(event) {
    event.preventDefault(); // Prevent default form refresh

    const formData = getFormData(adminLoginForm);
    const email = formData.email;
    const password = formData.password;
    // const rememberMe = formData['remember-me']; // Handle checkbox if needed

    console.log('Admin login attempt:', { email, password });
    if(adminAuthMessageArea) hideElement(adminAuthMessageArea.id); // Clear previous messages

    // Basic validation
    if (!email || !password) {
        console.error('Email and password are required for admin login.');
        if(adminAuthMessageArea) {
             setText(adminAuthMessageArea.id, 'Please enter both email and password.');
             addClass(adminAuthMessageArea.id, 'bg-red-100 border-red-400 text-red-700');
             showElement(adminAuthMessageArea.id);
        }
        return;
    }

    if (!isValidEmail(email)) {
         console.error('Invalid email format for admin login.');
         if(adminAuthMessageArea) {
             setText(adminAuthMessageArea.id, 'Please enter a valid email address.');
              addClass(adminAuthMessageArea.id, 'bg-red-100 border-red-400 text-red-700');
             showElement(adminAuthMessageArea.id);
         }
         return;
    }

    // Optional: Disable login button during processing
    const loginButton = getElement('login-button');
    if(loginButton) {
        loginButton.disabled = true;
        // Add loading state visual feedback if desired
    }


    // --- Authentication Logic (Initially Mock, then API) ---

    // *** MOCK AUTHENTICATION (For frontend testing before backend) ***
    const mockAdmin = mockAdmins.find(admin => admin.email === email && admin.password === password);

    if (mockAdmin) {
        console.log('Mock admin login successful!');
        // Simulate admin session creation with mock data
        createAdminSession(mockAdmin.token, { id: mockAdmin.id, name: mockAdmin.name, email: mockAdmin.email, role: mockAdmin.role });
        // Redirect to the admin dashboard page
        redirectTo('/frontend/admin/index.html'); // Adjust path as needed
    } else {
        console.error('Mock admin login failed: Invalid credentials.');
         if(adminAuthMessageArea) {
             setText(adminAuthMessageArea.id, 'Invalid email or password.');
              addClass(adminAuthMessageArea.id, 'bg-red-100 border-red-400 text-red-700');
             showElement(adminAuthMessageArea.id);
         }
         if(loginButton) loginButton.disabled = false; // Re-enable button
    }

    // *** REAL API AUTHENTICATION (Uncomment and replace mock logic when backend is ready) ***
    /*
    try {
        // Call the backend API for admin login
        // Assuming endpoint is POST /api/admin/auth/login or /api/auth/admin/login
        const response = await api.post('/auth/admin/login', { email, password });
        console.log('API admin login successful:', response);

        // Assuming the backend returns a token and potentially admin data (id, name, role)
        if (response && response.token) {
            createAdminSession(response.token, response.admin); // Store token and admin data
            redirectTo('/frontend/admin/index.html'); // Redirect on success
        } else {
             console.error('API admin login failed: No token received.');
            if(adminAuthMessageArea) {
                 setText(adminAuthMessageArea.id, 'Login failed. Please try again.'); // Generic error
                  addClass(adminAuthMessageArea.id, 'bg-red-100 border-red-400 text-red-700');
                 showElement(adminAuthMessageArea.id);
            }
            if(loginButton) loginButton.disabled = false; // Re-enable button
        }

    } catch (error) {
        console.error('API admin login request failed:', error);
        // Display error message from API or a generic one
        const errorMessage = error.data?.message || 'An error occurred during login.';
         if(adminAuthMessageArea) {
             setText(adminAuthMessageArea.id, errorMessage);
             addClass(adminAuthMessageArea.id, 'bg-red-100 border-red-400 text-red-700');
             showElement(adminAuthMessageArea.id);
         }
         if(loginButton) loginButton.disabled = false; // Re-enable button
    }
    */
}

// --- Initialization ---

/**
 * Initializes the admin login page script.
 */
function initializeAdminLoginPage() {
    console.log('Initializing admin login page...');

    // Redirect authenticated admins away from the login page
    redirectAdminIfAuthenticated();

    // Get form element
    adminLoginForm = getElement('admin-login-form');
     // Get message area element
    adminAuthMessageArea = getElement('auth-message'); // Assuming id="auth-message" from HTML

    // Add event listener if form exists on the current page
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLoginSubmit);
        console.log('Admin login form listener added.');
    } else {
        console.error('Admin login form (#admin-login-form) not found!');
    }

    // Initialize message area state (hidden by default)
    if (adminAuthMessageArea) {
        // Optional: Add base styling classes (could be in CSS)
        adminAuthMessageArea.className = `mt-4 p-3 rounded border text-center text-sm ${adminAuthMessageArea.className}`;
        hideElement(adminAuthMessageArea.id); // Ensure hidden initially
    }
}


// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeAdminLoginPage);