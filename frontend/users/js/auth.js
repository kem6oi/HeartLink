// /heartmatch/frontend/users/js/auth.js

// Import necessary functions from local utils and session management
import {
    getElement,
    getFormData,
    isValidEmail,
    redirectTo,
    setText, // We might need this to display error messages
    showElement, // Might need this too
    hideElement // Might need this too
} from './utils.js'; // Use local utils which imports shared

import {
    api // Import the api service
} from '../../common/js/apiService.js'; // Direct import from common

import {
    createSession,
    isAuthenticated,
    redirectIfAuthenticated // Import function to check and redirect if already logged in
} from './session.js';

import {
    mockUsers // Import mock user data
} from './data/mockUsers.js';

// --- DOM Element Variables ---
let loginForm;
let registerForm;
// Add variables for error/success message areas if you add them to the HTML later
// let authMessage;

// --- Event Handlers ---

/**
 * Handles the login form submission.
 * @param {Event} event - The form submit event.
 */
async function handleLoginSubmit(event) {
    event.preventDefault(); // Prevent default form refresh

    const formData = getFormData(loginForm);
    const email = formData.email;
    const password = formData.password;
    const rememberMe = formData['remember-me']; // Handle checkbox name

    console.log('Login attempt:', { email, password, rememberMe });
    // setText('auth-message', ''); // Clear previous messages (if message area exists)
    // hideElement('auth-message');

    // Basic validation
    if (!email || !password) {
        console.error('Email and password are required.');
        // setText('auth-message', 'Please enter both email and password.'); // Display error
        // showElement('auth-message');
        return;
    }

    if (!isValidEmail(email)) {
         console.error('Invalid email format.');
         // setText('auth-message', 'Please enter a valid email address.'); // Display error
         // showElement('auth-message');
         return;
    }

    // --- Authentication Logic (Initially Mock, then API) ---

    // *** MOCK AUTHENTICATION (For frontend testing before backend) ***
    const mockUser = mockUsers.find(user => user.email === email && user.password === password);

    if (mockUser) {
        console.log('Mock login successful!');
        // Simulate session creation with mock data
        createSession(mockUser.token, { id: mockUser.id, name: mockUser.name, email: mockUser.email });
        // Redirect to the main user dashboard/index page
        redirectTo('/frontend/users/index.html'); // Adjust path as needed
    } else {
        console.error('Mock login failed: Invalid credentials.');
        // setText('auth-message', 'Invalid email or password.'); // Display error
        // showElement('auth-message');
    }

    // *** REAL API AUTHENTICATION (Uncomment and replace mock logic when backend is ready) ***
    /*
    try {
        // Call the backend API for login
        const response = await api.post('/auth/login', { email, password });
        console.log('API login successful:', response);

        // Assuming the backend returns a token and potentially user data
        if (response && response.token) {
            createSession(response.token, response.user); // Store token and user data
            redirectTo('/frontend/users/index.html'); // Redirect on success
        } else {
             console.error('API login failed: No token received.');
            // setText('auth-message', 'Login failed. Please try again.'); // Generic error
            // showElement('auth-message');
        }

    } catch (error) {
        console.error('API login request failed:', error.message);
        // Display error message from API or a generic one
        // setText('auth-message', error.data?.message || 'An error occurred during login.');
        // showElement('auth-message');
    }
    */
}

/**
 * Handles the registration form submission.
 * @param {Event} event - The form submit event.
 */
async function handleRegisterSubmit(event) {
    event.preventDefault(); // Prevent default form refresh

    const formData = getFormData(registerForm);
    const name = formData.name;
    const email = formData.email;
    const password = formData.password;
    const confirmPassword = formData['confirm-password'];

    console.log('Registration attempt:', { name, email, password, confirmPassword });
    // setText('auth-message', ''); // Clear previous messages
    // hideElement('auth-message');

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
        console.error('All fields are required.');
        // setText('auth-message', 'All fields are required.');
        // showElement('auth-message');
        return;
    }

     if (!isValidEmail(email)) {
         console.error('Invalid email format.');
         // setText('auth-message', 'Please enter a valid email address.');
         // showElement('auth-message');
         return;
    }

    if (password !== confirmPassword) {
        console.error('Passwords do not match.');
        // setText('auth-message', 'Passwords do not match.');
        // showElement('auth-message');
        return;
    }

    // Basic password strength check (example)
    if (password.length < 8) {
         console.error('Password must be at least 8 characters long.');
         // setText('auth-message', 'Password must be at least 8 characters long.');
         // showElement('auth-message');
         return;
    }


    // --- Registration Logic (Initially Mock, then API) ---

    // *** MOCK REGISTRATION (For frontend testing before backend) ***
    // Check if email already exists in mock data
    const existingMockUser = mockUsers.find(user => user.email === email);

    if (existingMockUser) {
        console.error('Mock registration failed: Email already exists.');
        // setText('auth-message', 'This email is already registered.');
        // showElement('auth-message');
    } else {
        console.log('Mock registration successful!');
        // In a real app, a new user would be added to the database.
        // For mock, we just simulate success. We could optionally
        // simulate adding to the mockUsers array, but it won't persist.
        // A common pattern is to redirect to the login page after successful registration.
        alert('Registration successful! Please log in.'); // Simple alert for mock
        redirectTo('/frontend/users/pages/login.html'); // Redirect to login page
    }

    // *** REAL API REGISTRATION (Uncomment and replace mock logic when backend is ready) ***
    /*
    try {
        // Call the backend API for registration
        const response = await api.post('/auth/register', { name, email, password });
        console.log('API registration successful:', response);

        // Assuming success just returns confirmation or the new user object
        alert('Registration successful! Please log in.'); // Or display a message on the login page
        redirectTo('/frontend/users/pages/login.html'); // Redirect to login page after success

    } catch (error) {
        console.error('API registration request failed:', error.message);
        // Display error message from API (e.g., email already exists) or a generic one
        // setText('auth-message', error.data?.message || 'An error occurred during registration.');
        // showElement('auth-message');
    }
    */
}

// --- Initialization ---

/**
 * Initializes the authentication page script.
 */
function initializeAuthPage() {
    // Redirect authenticated users away from login/register pages
    redirectIfAuthenticated();

    // Get form elements
    loginForm = getElement('login-form');
    registerForm = getElement('register-form');
    // authMessage = getElement('auth-message'); // Get message area if added

    // Add event listeners if forms exist on the current page
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
        console.log('Login form listener added.');
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
         console.log('Register form listener added.');
    }

     // Hide message area initially if it exists
    // if (authMessage) {
    //     hideElement('auth-message');
    //     authMessage.className = 'mt-4 p-3 rounded'; // Basic styling classes
    // }
}


// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeAuthPage);