// /heartmatch/frontend/common/js/apiService.js

// Define the base URL for your backend API
const API_BASE_URL = 'http://localhost:3000/api'; // Replace with your actual backend URL and port

/**
 * Helper function to make API requests.
 * @param {string} endpoint - The API endpoint (e.g., '/auth/login').
 * @param {string} method - The HTTP method (GET, POST, PUT, DELETE).
 * @param {object} [bodyData=null] - The request body data for POST, PUT, PATCH.
 * @param {object} [queryParams=null] - The query parameters for GET requests.
 * @param {boolean} [requiresAuth=false] - Whether the request requires an authentication token.
 * @returns {Promise<object>} A promise that resolves with the API response data.
 * @throws {Error} Throws an error if the request fails or returns an error status.
 */
async function apiRequest(endpoint, method, bodyData = null, queryParams = null, requiresAuth = false) {
    let url = `${API_BASE_URL}${endpoint}`;

    if (queryParams && Object.keys(queryParams).length > 0) {
        const params = new URLSearchParams(queryParams);
        url += `?${params.toString()}`;
    }

    const headers = {};

    // Set Content-Type for methods that have a body
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        headers['Content-Type'] = 'application/json';
    }

    // Add authorization header if required and token is available
    // For staff, we should ideally use a staff-specific token.
    // Let's assume for now 'authToken' is used by staff as well, or this needs adjustment.
    // The prompt implies staffToken or a generic token getter.
    // Let's try to get 'staff_auth_token' first, then fall back to 'authToken'.
    if (requiresAuth) {
        let token = localStorage.getItem('staff_auth_token'); 
        if (!token) {
            token = localStorage.getItem('authToken'); // Fallback to generic token
        }
        
        if (!token) {
            console.error('Authentication token not found for staff or generic user.');
            // Example: window.location.href = '/frontend/staff/pages/login.html'; // Or a more robust auth flow
            throw new Error('Authentication required.');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };

    if (bodyData && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(bodyData);
    }

    try {
        const response = await fetch(url, options);

        // Check for non-OK HTTP status codes
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
            const errorMessage = errorData.message || `API Error: ${response.statusText || response.status}`;
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = errorData; // Include any error details from the backend
            throw error;
        }

        // Attempt to parse JSON response, handle cases with no body (e.g., 204 No Content)
        const text = await response.text();
        try {
            return text ? JSON.parse(text) : {};
        } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError, 'Raw text:', text);
            // If parsing fails but response was OK, it might be an empty but valid response, or non-JSON
            // Depending on backend, a 204 might not have JSON, or a 200 might have non-JSON success message
            // For now, if text is empty, return empty object, otherwise throw parse error
            if (!text.trim()) return {}; 
            throw new Error('Failed to parse JSON response from server.');
        }

    } catch (error) {
        console.error(`API Request Failed [${method} ${url}]:`, error.message, error.status ? `Status: ${error.status}` : '', error.data ? `Data: ${JSON.stringify(error.data)}` : '');
        // Re-throw the error so calling code can handle it
        // Ensure the error object has a consistent structure if possible
        if (error.status && error.data) throw error; // Already a structured error from response.ok check
        throw { status: error.status || 500, data: { message: error.message || 'Network error or server unavailable' } };
    }
}

// Export specific functions for different HTTP methods
export const api = {
    get: (endpoint, queryParams = {}, requiresAuth = false) => apiRequest(endpoint, 'GET', null, queryParams, requiresAuth),
    post: (endpoint, bodyData, requiresAuth = false) => apiRequest(endpoint, 'POST', bodyData, null, requiresAuth),
    put: (endpoint, bodyData, requiresAuth = false) => apiRequest(endpoint, 'PUT', bodyData, null, requiresAuth),
    delete: (endpoint, requiresAuth = false) => apiRequest(endpoint, 'DELETE', null, null, requiresAuth),
    patch: (endpoint, bodyData, requiresAuth = false) => apiRequest(endpoint, 'PATCH', bodyData, null, requiresAuth),
};

// Example Usage (for development reference):
/*
async function loginExample(email, password) {
    try {
        const data = await api.post('/auth/login', { email, password });
        console.log('Login successful:', data);
        // Store token, redirect etc.
    } catch (error) {
        console.error('Login failed:', error.data ? error.data.message : error.message);
    }
}

async function searchUsersExample(term) {
    try {
        const users = await api.get('/staff/users/search', { searchTerm: term, searchType: 'name' }, true);
        console.log('Users found:', users);
    } catch (error) {
        console.error('Failed to search users:', error.data ? error.data.message : error.message);
    }
}
*/