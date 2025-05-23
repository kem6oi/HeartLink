// /heartmatch/frontend/users/js/premiumFeatures.js

// Import necessary functions
import { getUserData } from './session.js'; // Get current user session data
import { api } from '../../common/js/apiService.js'; // API service
import { getFromLocalStorage } from './utils.js'; // Assuming coin balance might be cached

// --- Helper Functions ---

/**
 * Checks if the user has an active premium subscription.
 * NOTE: This is a client-side check based on potentially cached data or a simplified API response.
 * A robust check MUST be done on the backend for security.
 * @returns {boolean} True if user is likely premium, false otherwise.
 */
export function isPremiumUser() {
     // This is a simplified check. A real implementation would likely:
     // 1. Fetch current subscription status from backend on relevant pages.
     // 2. Store status in session/state.
     // 3. Check that status here.
     // For now, let's assume getUserData might contain a flag or we fetch it when needed.
     const userData = getUserData();
     // Assuming the user object in session includes 'isPremium' flag
     // Or you'd fetch it via api.get('/users/me/status', true) and cache it.
     return userData?.isPremium === true;
}

/**
 * Gets the user's current coin balance.
 * NOTE: This is a client-side check based on potentially cached data.
 * A robust check before spending coins MUST be done on the backend.
 * @returns {number} The coin balance, or 0 if unknown.
 */
export function getCurrentCoinBalance() {
     // This is a simplified check. A real implementation would likely:
     // 1. Fetch coin balance from backend on relevant pages (like coins.js does).
     // 2. Store balance in session/state (maybe update getUserData).
     // 3. Retrieve from that state here.
     // For now, let's just return a mock or cached value if available.
     const userData = getUserData();
     // Assuming user object in session includes 'coins' balance
     return userData?.coins || 0;

     // Alternatively, if coin balance is fetched and stored separately:
     // return getFromLocalStorage('userCoinBalance') || 0;
}

/**
 * Performs a profile boost action using premium features or coins.
 * @returns {Promise<boolean>} Promise resolves to true if boost was successful, false otherwise.
 */
export async function boostProfile() {
    console.log('Attempting to boost profile...');
     // This action might cost coins or require a premium subscription.
     // The backend logic will enforce the cost/requirement.

    try {
         // Assuming API endpoint is POST /api/premium/boost
        const response = await api.post('/premium/boost', {}, true); // Requires authentication

        console.log('Boost profile response:', response);

        if (response && response.success) {
            console.log('Profile boosted successfully!');
            // Optional: Update local coin balance if it was a coin-based boost
            // For example, if the API returns the new balance:
            // if (typeof response.newBalance === 'number') { updateLocalCoinBalance(response.newBalance); }
            return true;
        } else {
             console.warn('Profile boost failed:', response?.message);
             // Display a message to the user (e.g., "Not enough coins", "Requires Premium")
             // This would need a UI element to display messages
            alert(`Boost failed: ${response?.message || 'Unknown error'}`); // Simple alert for now
            return false;
        }

    } catch (error) {
        console.error('API request failed for boost profile:', error);
        const errorMessage = `Boost failed. ${error.data?.message || error.message}`;
         alert(errorMessage); // Simple alert
         if (error.status === 401) {
             // This action requires auth, redirect if necessary
             // endSession(); redirectTo('/frontend/users/pages/login.html');
         }
        return false;
    }
}

/**
 * Sends a virtual gift to another user using coins.
 * @param {string} targetUserId - The ID of the user to send the gift to.
 * @param {string} giftId - The ID of the virtual gift to send.
 * @returns {Promise<boolean>} Promise resolves to true if gift was successful, false otherwise.
 */
export async function sendVirtualGift(targetUserId, giftId) {
    console.log(`Attempting to send virtual gift ${giftId} to user ${targetUserId}...`);
     // This action will cost coins. The backend will enforce the cost.

     if (!targetUserId || !giftId) {
         console.error('Target user ID or Gift ID missing for sending gift.');
         alert('Cannot send gift: Missing user or gift information.');
         return false;
     }

    try {
         // Assuming API endpoint is POST /api/premium/gift
        const response = await api.post('/premium/gift', { targetUserId, giftId }, true); // Requires authentication

        console.log('Send virtual gift response:', response);

        if (response && response.success) {
            console.log('Virtual gift sent successfully!');
            // Optional: Update local coin balance if API returns it
             // if (typeof response.newBalance === 'number') { updateLocalCoinBalance(response.newBalance); }
            alert('Gift sent successfully!'); // Simple success alert
            return true;
        } else {
             console.warn('Send virtual gift failed:', response?.message);
              alert(`Send gift failed: ${response?.message || 'Unknown error'}`); // Simple alert
            return false;
        }

    } catch (error) {
        console.error('API request failed for sending virtual gift:', error);
        const errorMessage = `Send gift failed. ${error.data?.message || error.message}`;
        alert(errorMessage); // Simple alert
         if (error.status === 401) {
              // This action requires auth, redirect if necessary
             // endSession(); redirectTo('/frontend/users/pages/login.html');
         }
        return false;
    }
}

// Optional: Function to update coin balance locally (e.g., after purchase or spending)
// function updateLocalCoinBalance(newBalance) {
//     const userData = getUserData(); // Get current user data from session
//     if (userData) {
//          userData.coins = newBalance; // Update coins property
//          saveToLocalStorage('userData', userData); // Save updated user data back to session
//           // You might want to trigger a UI update event as well if balance is shown globally
//          console.log('Local coin balance updated:', newBalance);
//     } else {
//          console.warn('Cannot update local coin balance: User data not found in session.');
//     }
// }


// NOTE: This file primarily contains functions to be imported and used by other page scripts (like browse.js, profile.js).
// It does NOT have its own initialize function tied to a specific page load.