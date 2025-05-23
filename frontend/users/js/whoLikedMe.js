// /heartmatch/frontend/users/js/whoLikedMe.js

// Import necessary functions
import { requireAuth, endSession, getUserData } from './session.js';
import {
    getElement,
    selectElement,
    selectElements,
    redirectTo,
    setText,
    showElement,
    hideElement,
    addClass,
    removeClass
} from './utils.js';

import { api } from '../../common/js/apiService.js'; // Direct import from common
import { initializeGiftModal, showGiftModal } from './store.js'; // Import Gift Modal functions


// --- DOM Element Variables ---
let likedMeListElement;
let likesMessageArea;
let userNavNameElement;
let userNavAvatarElement;
let logoutButtonElement;
let profileModal;
let profileModalContent;
let profileModalCloseButton;
let sendGiftFromProfileModalButton; // New button for modal


// --- Helper Functions ---
// ... (displayLikesMessage, hideLikesMessage, populateNavHeader functions remain the same) ...
/**
 * Displays a message in the liked users area.
 * @param {string} message - The message text.
 * @param {'success' | 'error' | 'info'} type - The type of message for styling.
 */
function displayLikesMessage(message, type = 'info') {
     if (!likesMessageArea) return;

     setText(likesMessageArea.id, message);
     // Clear previous styling classes
     removeClass(likesMessageArea.id, 'bg-green-100 border-green-400 text-green-700');
     removeClass(likesMessageArea.id, 'bg-red-100 border-red-400 text-red-700');
     removeClass(likesMessageArea.id, 'bg-blue-100 border-blue-400 text-blue-700');
      removeClass(likesMessageArea.id, 'hidden'); // Ensure it's visible


     // Add type-specific styling
     switch (type) {
         case 'success': addClass(likesMessageArea.id, 'bg-green-100 border-green-400 text-green-700'); break;
         case 'error': addClass(likesMessageArea.id, 'bg-red-100 border-red-400 text-red-700'); break;
         case 'info':
         default: addClass(likesMessageArea.id, 'bg-blue-100 border-blue-400 text-blue-700'); break;
     }

     showElement(likesMessageArea.id);
}

/**
 * Hides the liked users message area.
 */
function hideLikesMessage() {
    if (likesMessageArea) {
        hideElement(likesMessageArea.id);
    }
}

/**
 * Populates the user's name and avatar in the common header navigation.
 * @param {object} user - The user data object (should contain name and possibly avatarUrl).
 */
function populateNavHeader(user) {
    if (userNavNameElement && user?.name) {
        setText(userNavNameElement.id, user.name);
    }
    if (userNavAvatarElement && user?.avatarUrl) {
        userNavAvatarElement.src = user.avatarUrl;
    }
}


// --- Data Fetching ---

// ... (fetchUsersWhoLikedMe function remains the same) ...
/**
 * Fetches the list of users who liked the logged-in user.
 */
async function fetchUsersWhoLikedMe() {
    console.log('Fetching users who liked me...');
    if (likedMeListElement) likedMeListElement.innerHTML = ''; // Clear current list
    displayLikesMessage('Loading users who liked you...', 'info');

    try {
        // Assuming API endpoint is GET /api/matches/liked-me
        // This endpoint should return profiles of users who liked the current user.
        const likedUsers = await api.get('/matches/liked-me', true); // Requires authentication

        console.log('Users who liked me fetched:', likedUsers);

        hideLikesMessage(); // Hide loading message

        if (likedUsers && likedUsers.length > 0) {
            renderLikedUsers(likedUsers);
        } else {
            displayLikesMessage('No one has liked you yet. Keep browsing!', 'info');
        }

    } catch (error) {
        console.error('Failed to fetch users who liked me:', error);
        // Handle error (e.g., display error message, redirect if 401 Unauthorized)
         if (error.status === 401) {
             endSession(); // Clear invalid session
             redirectTo('/frontend/users/pages/login.html'); // Redirect to login
         } else {
              const errorMessage = `Failed to load likes. ${error.data?.message || error.message}`;
              displayLikesMessage(errorMessage, 'error');
         }
    }
}

/**
 * Fetches a specific user's profile data for the modal.
 * (Same as in discovery.js - consider making this shared later)
 * @param {string} userId - The ID of the user whose profile to fetch.
 * @returns {Promise<object | null>} The user profile data or null on error.
 */
async function fetchUserProfileForModal(userId) {
    console.log(`Fetching profile for user ID: ${userId}`);
     if (profileModalContent) profileModalContent.innerHTML = '<div class="text-center text-gray-500">Loading profile details...</div>';
     if(sendGiftFromProfileModalButton) hideElement(sendGiftFromProfileModalButton.id); // Hide gift button while loading


     try {
         // Assuming API endpoint is GET /api/users/:userId
        const profile = await api.get(`/users/${userId}`, true); // Requires authentication
        console.log('Profile for modal fetched:', profile);
        return profile;

     } catch (error) {
         console.error(`Failed to fetch profile for user ${userId}:`, error);
         if (profileModalContent) profileModalContent.innerHTML = `<div class="text-center text-red-600">Failed to load profile. ${error.data?.message || error.message}</div>`;
          if (error.status === 401) {
             endSession(); // Clear invalid session
             redirectTo('/frontend/users/pages/login.html'); // Redirect to login
         }
         return null;
     }
}


// --- Rendering Functions ---

/**
 * Renders the list of users who liked the current user as cards.
 * @param {Array<object>} users - An array of user profile objects.
 */
function renderLikedUsers(users) {
    if (!likedMeListElement) return;

    console.log('Rendering users who liked me...');
    likedMeListElement.innerHTML = ''; // Clear existing content

    if (users.length === 0) {
         displayLikesMessage('No one has liked you yet. Keep browsing!', 'info');
        return;
    }

    users.forEach(user => {
        // Create HTML structure for a single liked user card
        const cardHtml = `
            <div class="bg-white rounded-lg shadow-md overflow-hidden relative" data-user-id="${user.id}">
                <!-- Profile Image -->
                <img src="${user.avatarUrl || '../img/placeholder-user.jpg'}" alt="${user.name}'s Profile" class="w-full h-64 object-cover">

                <!-- Card Content -->
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-dark">${user.name || 'N/A'}${user.age ? `, ${user.age}` : ''}</h3>
                    <p class="text-sm text-gray-600 mb-2"><i class="fas fa-map-marker-alt mr-1"></i> ${user.location || 'Location not specified'}</p>
                    <p class="text-gray-700 text-sm mt-2 line-clamp-3">${user.bio || 'No bio provided yet.'}</p>

                    <!-- Action Buttons -->
                    <div class="mt-4 flex justify-around items-center">
                         <button class="text-gray-500 hover:text-red-500 text-3xl transition-colors duration-200" data-action="pass" data-user-id="${user.id}">
                            <i class="fas fa-times-circle"></i>
                        </button>
                        <button class="text-gray-500 hover:text-blue-500 text-2xl transition-colors duration-200" data-action="view" data-user-id="${user.id}">
                            <i class="fas fa-info-circle"></i>
                        </button>
                         <button class="text-gray-500 hover:text-yellow-500 text-2xl transition-colors duration-200" data-action="gift" data-user-id="${user.id}" data-user-name="${user.name}">
                            <i class="fas fa-gift"></i>
                        </button>
                        <!-- "Like Back" action -->
                        <button class="text-gray-500 hover:text-primary text-lg font-bold transition-colors duration-200 px-4 py-2 border border-gray-300 rounded-md hover:border-primary hover:text-primary" data-action="like-back" data-user-id="${user.id}">
                            Like Back
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Append the card HTML to the list container
        likedMeListElement.insertAdjacentHTML('beforeend', cardHtml);
    });

    // Add event listeners to the action buttons after they are added to the DOM
    addLikedCardActionListeners();
}

/**
 * Populates the profile modal with fetched user data.
 * (Same as in discovery.js - consider making this shared later)
 * @param {object} profile - The user profile data.
 */
function populateProfileModal(profile) {
    if (!profileModalContent || !profile) return;

    profileModalContent.innerHTML = `
        <div class="text-center mb-6">
            <img src="${profile.avatarUrl || '../img/default-avatar-lg.png'}" alt="${profile.name}'s Profile" class="w-32 h-32 rounded-full object-cover mx-auto border-4 border-primary mb-4">
            <h3 class="text-2xl font-bold text-dark">${profile.name || 'N/A'}${profile.age ? `, ${profile.age}` : ''}</h3>
            <p class="text-gray-600"><i class="fas fa-map-marker-alt mr-1"></i> ${profile.location || 'Location not specified'}</p>
        </div>

        <div class="mb-6">
            <h4 class="text-lg font-semibold text-dark mb-2">About Me</h4>
            <p class="text-gray-700 leading-relaxed">${profile.bio || 'No bio provided yet.'}</p>
        </div>

        <div>
            <h4 class="text-lg font-semibold text-dark mb-2">Interests</h4>
            <div class="flex flex-wrap gap-2">
                ${profile.interests && profile.interests.length > 0
                    ? profile.interests.map(interest => `<span class="bg-secondary text-dark px-3 py-1 rounded-full text-sm">${interest.name || interest}</span>`).join('')
                    : '<span class="bg-light text-gray-700 px-3 py-1 rounded-full text-sm">No interests added yet.</span>'}
            </div>
        </div>

         ${profile.photos && profile.photos.length > 0 // Show photos section if any photos exist
             ? `
             <div class="mt-6">
                 <h4 class="text-lg font-semibold text-dark mb-2">Photos</h4>
                 <div class="grid grid-cols-2 gap-4">
                      ${profile.photos.map(photo => `<img src="${photo.url}" alt="User Photo" class="rounded-md object-cover aspect-square">`).join('')}
                 </div>
             </div>
            `
             : ''
         }
    `;

     // Set data-target-user-id on the gift button in the profile modal and show it
    if(sendGiftFromProfileModalButton && profile?.id && profile?.name) {
        sendGiftFromProfileModalButton.dataset.targetUserId = profile.id;
         sendGiftFromProfileModalButton.dataset.targetUserName = profile.name; // Store name for the gift modal
        showElement(sendGiftFromProfileModalButton.id);
    } else if (sendGiftFromProfileModalButton) {
         hideElement(sendGiftFromProfileModalButton.id); // Hide if no user ID
    }
}


// --- Action Handlers ---

/**
 * Handles the click event for action buttons on liked user cards.
 * Uses event delegation on the list container.
 * @param {Event} event - The click event.
 */
async function handleLikedCardAction(event) {
    const targetButton = event.target.closest('button[data-action]');
    if (!targetButton) return; // Not a button with a data-action

    const action = targetButton.dataset.action;
    const userId = targetButton.dataset.userId;
    const userName = targetButton.dataset.userName; // Get user name for gift modal


    if (!userId) {
        console.error('User ID not found on action button.');
        return;
    }

    console.log(`Action: ${action} on user ID: ${userId}`);

    // Optional: Add a simple visual feedback (e.g., temporarily disable button)
    // targetButton.disabled = true;

    try {
        switch (action) {
            case 'like-back':
                // This is essentially the same API call as 'like' from discovery
                // Assuming API endpoint is POST /api/matches/like
                const response = await api.post('/matches/like', { targetUserId: userId }, true);
                console.log(`Liked back user ${userId}`, response);
                removeLikedCard(userId); // Remove the card from the UI

                 // Check if it was a match
                 if (response && response.isMatch) {
                     console.log(`It's a match with ${userId}!`);
                     // Trigger match animation/modal/notification here
                     alert(`It's a match with ${response.matchName || 'someone'}! Check your chat!`); // Simple alert for now
                 }
                 // Optional: Fetch more liked users if needed
                // if (likedMeListElement.children.length < MIN_CARDS_THRESHOLD) fetchUsersWhoLikedMe();
                break;

            case 'view':
                // Fetch profile data and show modal
                showProfileModalView(userId); // Use renamed function
                break;

            case 'pass':
                 // Assuming API endpoint is POST /api/matches/pass
                await api.post('/matches/pass', { targetUserId: userId }, true);
                console.log(`Passed user ${userId}`);
                removeLikedCard(userId); // Remove the card from the UI
                break;

             case 'gift': // New action
                 // Show the virtual gift modal
                 showGiftModal(userId, { name: userName }); // Pass user ID and name
                 break;

            default:
                console.warn(`Unknown action: ${action}`);
        }
    } catch (error) {
         console.error(`Action "${action}" failed for user ${userId}:`, error);
         // Display error message (e.g., on the page or in a temporary notification)
         displayLikesMessage(`Failed to perform action (${action}). ${error.data?.message || error.message}`, 'error');

          if (error.status === 401) {
             endSession(); // Clear invalid session
             redirectTo('/frontend/users/pages/login.html'); // Redirect to login
         }

    } finally {
        // Re-enable button
        // targetButton.disabled = false;
    }
}

/**
 * Handles the click event for the "Send Gift" button within the profile view modal.
 * @param {Event} event - The click event.
 */
function handleSendGiftFromProfileModalClick(event) {
    const targetButton = event.target.closest('#send-gift-from-profile-modal');
    if (!targetButton) return;

    const userId = targetButton.dataset.targetUserId;
    const userName = targetButton.dataset.targetUserName;

     if (userId) {
         closeProfileModalView(); // Close the profile modal first
         showGiftModal(userId, { name: userName }); // Show the gift modal
     } else {
         console.error('Target user ID missing for sending gift from profile modal.');
     }
}


/**
 * Removes a liked user card from the DOM by user ID.
 * @param {string} userId - The ID of the user whose card to remove.
 */
function removeLikedCard(userId) {
    const card = selectElement(`.bg-white.rounded-lg.shadow-md[data-user-id="${userId}"]`);
    if (card) {
        card.remove();
        console.log(`Removed card for user ${userId} from liked list.`);
        // Check if the list is now empty and display "no users" message
        if (likedMeListElement && likedMeListElement.children.length === 0) {
             displayLikesMessage('No one has liked you yet. Keep browsing!', 'info'); // Update message
        }
    }
}


// --- Profile Modal Handlers ---
// (Same as in discovery.js - consider making this shared later)

/**
 * Shows the profile modal for a given user ID.
 * Renamed to avoid confusion with the gift modal.
 * @param {string} userId - The ID of the user whose profile to display.
 */
async function showProfileModalView(userId) {
    if (!profileModal || !profileModalContent) return;

    // Show the modal backdrop and container
    showElement(profileModal.id);
     // Add class for transitions if needed (using Tailwind transition classes in HTML)
    addClass(profileModal.id, 'opacity-100'); // Example transition class
    removeClass(profileModal.id, 'opacity-0'); // Example transition class


    // Reset content while loading
    profileModalContent.innerHTML = '<div class="text-center text-gray-500">Loading profile details...</div>';
     if(sendGiftFromProfileModalButton) hideElement(sendGiftFromProfileModalButton.id); // Hide gift button while loading


    // Fetch profile data for the modal
    const profile = await fetchUserProfileForModal(userId);

    if (profile) {
        populateProfileModal(profile);
    }
    // Error message is handled by fetchUserProfileForModal
}

/**
 * Closes the profile modal.
 * Renamed to avoid confusion with the gift modal.
 */
function closeProfileModalView() {
    if (profileModal) {
        // Add class for transition out
         addClass(profileModal.id, 'opacity-0');
         removeClass(profileModal.id, 'opacity-100');

         // Hide the element after the transition
         setTimeout(() => {
            hideElement(profileModal.id);
            // Optional: Clear modal content on close
            // if (profileModalContent) profileModalContent.innerHTML = '';
             // Hide the gift button when closing
             if(sendGiftFromProfileModalButton) hideElement(sendGiftFromProfileModalButton.id);
         }, 300); // Match CSS transition duration or Tailwind config
    }
}


// --- Initialization ---

/**
 * Adds event listeners to the action buttons within the liked list.
 * This is called after rendering the list.
 */
function addLikedCardActionListeners() {
    if (!likedMeListElement) return;
    // Use event delegation on the parent container
    likedMeListElement.addEventListener('click', handleLikedCardAction);
    console.log('Liked card action listeners added.');
}


/**
 * Initializes the "Who Liked Me" page script.
 */
function initializeWhoLikedMePage() {
    console.log('Initializing "Who Liked Me" page...');

    // 1. Protect the page: Ensure the user is authenticated
    requireAuth(); // This will redirect to login if no valid session is found

    // If requireAuth did *not* redirect, we know the user is authenticated
    console.log('User is authenticated.');

    // 2. Get DOM elements
    likedMeListElement = getElement('liked-me-list');
    likesMessageArea = getElement('likes-message');
    userNavNameElement = getElement('user-nav-name-likes');
    userNavAvatarElement = getElement('user-nav-avatar-likes');
    logoutButtonElement = getElement('logout-button-likes');
     // Get modal elements (same IDs as in browse.html if reusing structure)
    profileModal = getElement('profile-modal');
    profileModalContent = getElement('profile-modal-content');
    profileModalCloseButton = getElement('profile-modal-close');
    sendGiftFromProfileModalButton = getElement('send-gift-from-profile-modal'); // Get the new button


    // 3. Add common listeners (Logout, Profile Modal Close, Send Gift from Profile Modal)
    if (logoutButtonElement) {
        logoutButtonElement.addEventListener('click', handleLogout);
        console.log('Logout button listener added ("Who Liked Me").');
    }
     if (profileModalCloseButton) {
        profileModalCloseButton.addEventListener('click', closeProfileModalView);
         // Also close modal if clicking clicking outside the modal content
         if(profileModal) { // Ensure modal exists before adding click listener
             profileModal.addEventListener('click', (event) => {
                  // Check if click was directly on the backdrop and not the modal content
                 const target = event.target;
                 const modalContent = profileModal.querySelector('.bg-white.rounded-lg'); // Adjust selector if needed
                 if (target === profileModal || (modalContent && !modalContent.contains(target))) {
                     closeProfileModalView();
                 }
             });
         }
        console.log('Profile modal close listeners added ("Who Liked Me").');
    }
     if (sendGiftFromProfileModalButton) {
         sendGiftFromProfileModalButton.addEventListener('click', handleSendGiftFromProfileModalClick);
         console.log('Send gift from profile modal listener added.');
     }


    // 4. Populate header navigation with logged-in user data
     const userData = getUserData();
     if (userData) {
        populateNavHeader(userData);
        console.log(`Displaying user in nav: ${userData.name}`);
    } else {
         console.warn('User data not available for nav header.');
     }

    // 5. Fetch and display the list of users who liked the current user
    fetchUsersWhoLikedMe();

    // 6. Initial state for message area and modal
     if (likesMessageArea) {
        // Add base styling classes (optional, could be in CSS)
         likesMessageArea.className = `mt-4 p-3 rounded border text-center text-sm ${likesMessageArea.className}`;
         hideLikesMessage(); // Ensure hidden initially
     }
     // Initial state for profile modal (using Tailwind opacity transition example)
     if (profileModal) {
          hideElement(profileModal.id);
          addClass(profileModal.id, 'transition-opacity duration-300 ease-in-out');
          addClass(profileModal.id, 'opacity-0');
     }

      // *** 7. Initialize the Virtual Gift Modal ***
     // Call the initialization function from store.js
     initializeGiftModal();
     console.log('Virtual Gift Modal initialized for "Who Liked Me" page.');


}

// --- Entry Point ---

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeWhoLikedMePage);

// --- Event Handlers (Logout - Keep here for direct use if needed, though imported in initialize) ---
/**
 * Handles the logout action.
 * Ends the session and redirects the user to the login page.
 */
function handleLogout() {
    console.log('Attempting to log out...');
    endSession(); // Clear session data
    // Redirect to the login page
    redirectTo('/frontend/users/pages/login.html'); // Adjust path as needed
}