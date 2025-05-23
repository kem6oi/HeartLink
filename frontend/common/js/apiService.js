// /heartmatch/frontend/common/js/apiService.js

// Define the base URL for your backend API
const API_BASE_URL = 'http://localhost:3000/api'; // Replace with your actual backend URL and port

/**
 * Helper function to make API requests.
 * @param {string} endpoint - The API endpoint (e.g., '/auth/login').
 * @param {string} method - The HTTP method (GET, POST, PUT, DELETE).
 * @param {object} [data=null] - The request body data for POST, PUT.
 * @param {boolean} [requiresAuth=false] - Whether the request requires an authentication token.
 * @returns {Promise<object>} A promise that resolves with the API response data.
 * @throws {Error} Throws an error if the request fails or returns an error status.
 */
async function apiRequest(endpoint, method, data = null, requiresAuth = false) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
    };

    // Add authorization header if required and token is available
    if (requiresAuth) {
        const token = localStorage.getItem('authToken'); // Assuming token is stored here
        if (!token) {
            // Redirect to login or handle unauthenticated state
            console.error('Authentication token not found.');
            // Example: redirectTo('/frontend/users/pages/login.html'); // You might want a more robust auth flow
            throw new Error('Authentication required.');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
    };

    try {
        const response = await fetch(url, options);

        // Check for non-OK HTTP status codes
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
            const errorMessage = errorData.message || `API Error: ${response.statusText}`;
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = errorData; // Include any error details from the backend
            throw error;
        }

        // Attempt to parse JSON response, handle cases with no body (e.g., 204 No Content)
        const text = await response.text();
        return text ? JSON.parse(text) : {};

    } catch (error) {
        console.error(`API Request Failed [${method} ${url}]:`, error);
        // Re-throw the error so calling code can handle it
        throw error;
    }
}

// Export specific functions for different HTTP methods
export const api = {
    get: (endpoint, requiresAuth = false) => apiRequest(endpoint, 'GET', null, requiresAuth),
    post: (endpoint, data, requiresAuth = false) => apiRequest(endpoint, 'POST', data, requiresAuth),
    put: (endpoint, data, requiresAuth = false) => apiRequest(endpoint, 'PUT', data, requiresAuth),
    delete: (endpoint, requiresAuth = false) => apiRequest(endpoint, 'DELETE', null, requiresAuth),
    // Add patch if needed
    patch: (endpoint, data, requiresAuth = false) => apiRequest(endpoint, 'PATCH', data, requiresAuth),
};

// Example Usage (for development reference):
/*
async function login(email, password) {
    try {
        const data = await api.post('/auth/login', { email, password });
        console.log('Login successful:', data);
        // Store token, redirect etc.
    } catch (error) {
        console.error('Login failed:', error.message);
        // Show error message to user
    }
}

async function getUserProfile(userId) {
    try {
        const data = await api.get(`/users/${userId}/profile`, true); // Requires authentication
        console.log('User profile:', data);
    } catch (error) {
        console.error('Failed to get profile:', error.message);
        // Handle auth errors (e.g., redirect to login if status is 401)
    }
}
*/