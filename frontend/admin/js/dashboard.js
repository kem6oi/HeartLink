// /heartmatch/frontend/admin/js/dashboard.js

// Import necessary functions
import { requireAdminAuth, endAdminSession, getAdminData } from './adminSession.js';
import {
    getElement,
    setText,
    redirectTo
    // Import other utils as needed for data fetching/rendering later
} from './utils.js'; // Use local admin utils

import { api } from '../../common/js/apiService.js'; // Use common API service

// --- DOM Element Variables ---
let adminNameElement;
let adminAvatarElement; // Optional
let adminLogoutButtonElement;
// Placeholder elements for dashboard data
let totalUsersElement;
let totalRevenueElement;
let activeSubscriptionsElement;
let matchesTodayElement;
let userGrowthChartCanvas; // For the chart


// --- Helper Functions ---

/**
 * Populates the admin's name and avatar in the sidebar.
 * @param {object} admin - The admin data object (should contain name and possibly avatarUrl).
 */
function populateAdminSidebar(admin) {
    if (adminNameElement && admin?.name) {
        setText(adminNameElement.id, admin.name);
    }
    if (adminAvatarElement && admin?.avatarUrl) {
        adminAvatarElement.src = admin.avatarUrl;
    }
    // Could also display admin role here if needed
}

/**
 * Fetches dashboard summary data from the backend.
 */
async function fetchDashboardSummary() {
    console.log('Fetching dashboard summary data...');
    // Set loading states for placeholders
    setText('total-users', '...');
    setText('total-revenue', '...');
    setText('active-subscriptions', '...');
    setText('matches-today', '...');


    try {
        // Assuming API endpoint is GET /api/admin/dashboard/summary
        // This requires admin authentication
        const summaryData = await api.get('/admin/dashboard/summary', true);

        console.log('Dashboard summary fetched:', summaryData);

        // Populate the dashboard cards with fetched data
        if (summaryData) {
            setText('total-users', summaryData.totalUsers !== undefined ? summaryData.totalUsers : 'N/A');
            // Format revenue as currency
            setText('total-revenue', summaryData.totalRevenue !== undefined ? `$${summaryData.totalRevenue.toFixed(2)}` : 'N/A');
            setText('active-subscriptions', summaryData.activeSubscriptions !== undefined ? summaryData.activeSubscriptions : 'N/A');
            setText('matches-today', summaryData.matchesToday !== undefined ? summaryData.matchesToday : 'N/A');
            // Add other summary stats as needed
        } else {
             console.warn('Dashboard summary data is empty or invalid.');
             // Display error or N/A in all fields
             setText('total-users', 'N/A');
             setText('total-revenue', 'N/A');
             setText('active-subscriptions', 'N/A');
             setText('matches-today', 'N/A');
        }

    } catch (error) {
        console.error('Failed to fetch dashboard summary:', error);
        // Handle error (e.g., display error message, redirect if 401 Unauthorized)
        if (error.status === 401) {
            endAdminSession(); // Clear invalid session
            redirectTo('/frontend/admin/pages/login.html'); // Redirect to login
        } else {
            // Display error or N/A in all fields on failure
             setText('total-users', 'Error');
             setText('total-revenue', 'Error');
             setText('active-subscriptions', 'Error');
             setText('matches-today', 'Error');
            // Optional: Display a message area on the dashboard page
            // displayDashboardMessage(`Failed to load summary data. ${error.data?.message || error.message}`, 'error');
        }
    }
}

/**
 * Fetches data for the user growth chart and renders it.
 */
async function fetchUserGrowthData() {
    console.log('Fetching user growth data...');
    // Optional: Display loading indicator for the chart area

    try {
        // Assuming API endpoint is GET /api/admin/dashboard/user-growth
        // Should return an array of data points for the chart (e.g., [{ date: 'YYYY-MM-DD', count: 5 }, ...])
        const chartData = await api.get('/admin/dashboard/user-growth', true);

        console.log('User growth data fetched:', chartData);

        if (chartData && chartData.length > 0) {
            renderUserGrowthChart(chartData);
        } else {
            console.warn('No user growth data available.');
            // Display "No data" message in the chart container
             if(userGrowthChartCanvas && userGrowthChartCanvas.parentElement) {
                 userGrowthChartCanvas.parentElement.innerHTML = '<div class="text-center text-gray-500">No user growth data available.</div>';
             }
        }

    } catch (error) {
        console.error('Failed to fetch user growth data:', error);
        // Handle error
        if (error.status === 401) {
            endAdminSession(); // Clear invalid session
            redirectTo('/frontend/admin/pages/login.html'); // Redirect to login
        } else {
             // Display error message in the chart container
             if(userGrowthChartCanvas && userGrowthChartCanvas.parentElement) {
                 userGrowthChartCanvas.parentElement.innerHTML = `<div class="text-center text-red-600">Failed to load chart data. ${error.data?.message || error.message}</div>`;
             }
        }
    }
}


/**
 * Renders the user growth chart using a charting library (e.g., Chart.js).
 * This requires Chart.js to be included in the HTML.
 * @param {Array<object>} data - Array of data points { date, count }.
 */
function renderUserGrowthChart(data) {
    if (!userGrowthChartCanvas) {
        console.error('User growth chart canvas not found!');
        return;
    }
     // Ensure Chart.js is loaded
     if (typeof Chart === 'undefined') {
         console.error('Chart.js is not loaded. Cannot render chart.');
          if(userGrowthChartCanvas.parentElement) {
              userGrowthChartCanvas.parentElement.innerHTML = '<div class="text-center text-red-600">Charting library (Chart.js) not loaded.</div>';
          }
         return;
     }


    const ctx = userGrowthChartCanvas.getContext('2d');

    // Prepare data for Chart.js
    const labels = data.map(item => new Date(item.date).toLocaleDateString()); // Format dates
    const userCounts = data.map(item => item.count);

    new Chart(ctx, {
        type: 'line', // Or 'bar' depending on desired visualization
        data: {
            labels: labels,
            datasets: [{
                label: 'New Users',
                data: userCounts,
                borderColor: '#FF4B91', // Primary color
                backgroundColor: 'rgba(255, 75, 145, 0.2)', // Light primary color
                fill: true,
                tension: 0.1 // Smooth line
            }]
        },
        options: {
             responsive: true,
             maintainAspectRatio: false, // Allow chart-container to control size
            scales: {
                y: {
                    beginAtZero: true,
                     suggestedMax: Math.max(...userCounts) * 1.1 // Add padding above max
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            }
        }
    });

    console.log('User growth chart rendered.');
}


// --- Event Handlers ---

/**
 * Handles the admin logout action.
 * Ends the session and redirects to the admin login page.
 */
function handleAdminLogout() {
    console.log('Attempting admin logout...');
    endAdminSession(); // Clear admin session data
    // Redirect to the admin login page
    redirectTo('/frontend/admin/pages/login.html'); // Adjust path as needed
}


// --- Initialization ---

/**
 * Initializes the admin dashboard page script.
 */
async function initializeAdminDashboardPage() {
    console.log('Initializing admin dashboard page...');

    // 1. Protect the page: Ensure the admin is authenticated
    requireAdminAuth(); // This will redirect to login if no valid session is found

    // If requireAdminAuth did *not* redirect, we know the admin is authenticated
    console.log('Admin is authenticated.');

    // 2. Get DOM elements
    adminNameElement = getElement('admin-name');
    adminAvatarElement = getElement('admin-avatar');
    adminLogoutButtonElement = getElement('admin-logout-button');

    // Dashboard data elements
    totalUsersElement = getElement('total-users');
    totalRevenueElement = getElement('total-revenue');
    activeSubscriptionsElement = getElement('active-subscriptions');
    matchesTodayElement = getElement('matches-today');
    userGrowthChartCanvas = getElement('user-growth-chart');


    // 3. Populate admin name and avatar in the sidebar
    const adminData = getAdminData();
    if (adminData) {
        populateAdminSidebar(adminData);
        console.log(`Displaying admin in sidebar: ${adminData.name}`);
    } else {
         console.warn('Admin data not available for sidebar.');
          setText('admin-name', 'Admin User'); // Fallback
    }

    // 4. Set up logout button listener
    if (adminLogoutButtonElement) {
        adminLogoutButtonElement.addEventListener('click', handleAdminLogout);
        console.log('Admin logout button listener added.');
    } else {
        console.error('Admin logout button (#admin-logout-button) not found!');
    }


    // 5. Fetch and display dashboard summary data
    fetchDashboardSummary();

    // 6. Fetch and display user growth chart data
     // NOTE: You'll need to include Chart.js library in your HTML for this to work.
     // Add `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>` in the <head>.
    fetchUserGrowthData();


    // 7. Add other initialization logic for the dashboard (e.g., recent activity list)
    // fetchRecentActivity();


    console.log('Admin dashboard initialization complete.');
}


// --- Entry Point ---

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeAdminDashboardPage);