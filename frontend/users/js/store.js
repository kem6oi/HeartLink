// /heartmatch/frontend/users/js/store.js

// Import necessary functions
// Note: session and utils are assumed to be available or imported where this module is used
import { getUserData } from './session.js'; // Assuming session is available
import {
    getElement,
    selectElement,
    selectElements,
    setText,
    showElement,
    hideElement,
    addClass,
    removeClass
} from './utils.js'; // Assuming utils is available

import { api } from '../../common/js/apiService.js'; // Direct import from common
import { sendVirtualGift, getCurrentCoinBalance } from './premiumFeatures.js'; // Import the function to send gift and get balance

// --- DOM Element Variables (for the modal) ---
let giftModalElement;
let giftModalCloseButton;
let giftTargetUserInfoElement;
let giftTargetUserNameElement;
let giftMessageArea;
let virtualGiftsListElement;
let selectedGiftInfoElement;
let selectedGiftImageElement;
let selectedGiftNameElement;
let selectedGiftCostElement;
let sendGiftButtonElement;
let currentCoinBalanceDisplayElement;

// --- State Variables ---
let availableVirtualGifts = []; // Store list of gifts
let selectedGift = null; // Store the currently selected gift object
let currentGiftTargetUserId = null; // Store the ID of the user receiving the gift

// --- Helper Functions ---

/**
 * Displays a message within the virtual gift modal.
 * @param {string} message - The message text.
 * @param {'success' | 'error' | 'info'} type - The type of message for styling.
 */
function displayGiftMessage(message, type = 'info') {
     if (!giftMessageArea) return;

     setText(giftMessageArea.id, message);
     // Clear previous styling classes
     removeClass(giftMessageArea.id, 'bg-green-100 border-green-400 text-green-700');
     removeClass(giftMessageArea.id, 'bg-red-100 border-red-400 text-red-700');
     removeClass(giftMessageArea.id, 'bg-blue-100 border-blue-400 text-blue-700');
      removeClass(giftMessageArea.id, 'hidden'); // Ensure it's visible


     // Add type-specific styling
     switch (type) {
         case 'success': addClass(giftMessageArea.id, 'bg-green-100 border-green-400 text-green-700'); break;
         case 'error': addClass(giftMessageArea.id, 'bg-red-100 border-red-400 text-red-700'); break;
         case 'info':
         default: addClass(giftMessageArea.id, 'bg-blue-100 border-blue-400 text-blue-700'); break;
     }

     showElement(giftMessageArea.id);
}

/**
 * Hides the virtual gift modal message area.
 */
function hideGiftMessage() {
    if (giftMessageArea) {
        hideElement(giftMessageArea.id);
    }
}

/**
 * Updates the display of the user's current coin balance.
 */
function updateCoinBalanceDisplay() {
    const balance = getCurrentCoinBalance(); // Get balance from premiumFeatures or cached state
    if (currentCoinBalanceDisplayElement) {
        setText(currentCoinBalanceDisplayElement.id, balance.toString());
    }
    // Also check if send button should be enabled/disabled based on balance
    updateSendButtonState();
}

/**
 * Updates the enabled/disabled state of the send gift button
 * based on whether a gift is selected and if the user has enough coins.
 */
function updateSendButtonState() {
    if (!sendGiftButtonElement) return;

    const requiredCost = selectedGift ? selectedGift.cost : 0;
    const currentBalance = getCurrentCoinBalance(); // Get current balance

    if (selectedGift && currentBalance >= requiredCost) {
        sendGiftButtonElement.disabled = false;
        // Optionally update button text to include cost
        setText('send-gift-cost-display', requiredCost.toString());
    } else {
        sendGiftButtonElement.disabled = true;
         setText('send-gift-cost-display', requiredCost.toString());
    }
}


// --- Data Fetching ---

/**
 * Fetches available virtual gifts from the backend.
 */
async function fetchVirtualGifts() {
    console.log('Fetching virtual gifts...');
    if (virtualGiftsListElement) virtualGiftsListElement.innerHTML = '<div class="col-span-full text-center text-gray-500">Loading gifts...</div>';

    try {
        // Assuming API endpoint is GET /api/virtual-gifts
        // Should return an array of gift objects { id, name, cost, imageUrl, description }
        const gifts = await api.get('/virtual-gifts'); // May not require authentication

        console.log('Virtual gifts fetched:', gifts);
        availableVirtualGifts = gifts || []; // Store fetched gifts

        if (availableVirtualGifts.length > 0) {
            renderVirtualGifts(availableVirtualGifts);
        } else {
            if (virtualGiftsListElement) virtualGiftsListElement.innerHTML = '<div class="col-span-full text-center text-gray-500">No virtual gifts available right now.</div>';
        }

    } catch (error) {
        console.error('Failed to fetch virtual gifts:', error);
        if (virtualGiftsListElement) virtualGiftsListElement.innerHTML = `<div class="col-span-full text-center text-red-600">Failed to load gifts. ${error.data?.message || error.message}</div>`;
        // No auth check here as gift list might be public
    }
}


// --- Rendering Functions ---

/**
 * Renders the list of available virtual gifts in the modal.
 * @param {Array<object>} gifts - An array of gift objects.
 */
function renderVirtualGifts(gifts) {
    if (!virtualGiftsListElement) return;

    virtualGiftsListElement.innerHTML = ''; // Clear loading/existing content

    gifts.forEach(gift => {
         const giftItemHtml = `
             <div class="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors duration-100"
                  data-gift-id="${gift.id}"
                  data-gift-cost="${gift.cost || 0}"
                  data-gift-name="${gift.name || 'Gift'}"
                  data-gift-image="${gift.imageUrl || ''}">
                 <img src="${gift.imageUrl || '../img/default-gift.png'}" alt="${gift.name || 'Gift'}" class="w-12 h-12 object-contain mb-2">
                 <p class="text-xs font-medium text-dark text-center line-clamp-1 px-1">${gift.name || 'Gift'}</p>
                 <p class="text-xs text-gray-600 flex items-center mt-1"><i class="fas fa-coins text-yellow-500 mr-1"></i> ${gift.cost || 0}</p>
             </div>
         `;
         virtualGiftsListElement.insertAdjacentHTML('beforeend', giftItemHtml);
    });

    // Add event listeners to the gift items
    addGiftItemListeners();
}

/**
 * Updates the display area to show the currently selected gift details.
 * @param {object | null} gift - The selected gift object, or null to clear.
 */
function updateSelectedGiftDisplay(gift) {
    selectedGift = gift; // Update state

    if (!selectedGiftInfoElement || !selectedGiftImageElement || !selectedGiftNameElement || !selectedGiftCostElement) return;

    if (gift) {
        showElement(selectedGiftInfoElement.id);
        selectedGiftImageElement.src = gift.imageUrl || '../img/default-gift.png';
        setText(selectedGiftNameElement.id, gift.name || 'Selected Gift');
        setText(selectedGiftCostElement.id, `${gift.cost || 0} Coins`);
    } else {
        hideElement(selectedGiftInfoElement.id);
        selectedGiftImageElement.src = '';
        setText(selectedGiftNameElement.id, 'None');
        setText(selectedGiftCostElement.id, '0 Coins');
    }

    updateSendButtonState(); // Update button state based on selection/cost
}


// --- Action Handlers ---

/**
 * Handles clicking on a virtual gift item in the list.
 * @param {Event} event - The click event.
 */
function handleGiftItemClick(event) {
    const giftItem = event.target.closest('[data-gift-id]');
    if (!giftItem) return;

    const giftId = giftItem.dataset.giftId;
    const gift = availableVirtualGifts.find(g => g.id === giftId);

    if (!gift) {
        console.error('Clicked gift item not found in available gifts data.');
        return;
    }

    console.log('Gift selected:', gift);

    // Remove 'selected' class from previously selected item
    selectElements('[data-gift-id].border-primary', virtualGiftsListElement).forEach(item => {
        removeClass(item.dataset.giftId, 'border-primary');
    });

    // Add 'selected' class to the clicked item
    addClass(giftItem.dataset.giftId, 'border-primary');

    // Update the selected gift display
    updateSelectedGiftDisplay(gift);
}

/**
 * Handles clicking the "Send Gift" button.
 */
async function handleSendGiftClick() {
    if (!selectedGift || !currentGiftTargetUserId) {
        console.warn('Attempted to send gift without selecting a gift or target user.');
         displayGiftMessage('Please select a gift and ensure a recipient is set.', 'info');
        return;
    }

    const giftId = selectedGift.id;
    const targetUserId = currentGiftTargetUserId;

    console.log(`Initiating send gift action: Gift ID ${giftId} to User ID ${targetUserId}`);

    // Disable button and show loading feedback
     if (sendGiftButtonElement) {
         sendGiftButtonElement.disabled = true;
         const originalButtonText = sendGiftButtonElement.textContent;
         setText(sendGiftButtonElement.id, 'Sending...'); // Example feedback
         // Store original text? Not crucial for a modal button.
     }

    hideGiftMessage(); // Clear previous messages

    // Call the premiumFeatures function to send the gift
    const success = await sendVirtualGift(targetUserId, giftId);

    if (success) {
         displayGiftMessage('Gift sent successfully!', 'success');
         // Optional: Update the user's coin balance display after successful sending
         // (premiumFeatures.js might handle the deduction and return the new balance)
         fetchCoinBalance(); // Re-fetch balance from coins.js (requires coins.js to expose this)
         // Or updateCoinBalanceDisplay(); if premiumFeatures updates the cached balance

         // Optional: Close modal after a delay on success
         setTimeout(hideGiftModal, 1500);

    } else {
        // Error message handled by sendVirtualGift (using alert for now)
        // If sendVirtualGift updates the giftMessageArea directly, no need for alert
        // If premiumFeatures.js updates the balance display, the balance will update on failure if needed
    }

    // Re-enable button
     if (sendGiftButtonElement) {
         sendGiftButtonElement.disabled = false;
         setText(sendGiftButtonElement.id, `Send Gift (${selectedGift ? selectedGift.cost : 0} Coins)`); // Restore text
     }
     // Ensure button state is correct based on remaining balance
     updateSendButtonState();
}


// --- Modal Control ---

/**
 * Shows the virtual gift modal for a specific target user.
 * @param {string} targetUserId - The ID of the user to whom the gift will be sent.
 * @param {object} [targetUserInfo] - Optional object with target user details (e.g., { name: '...', avatarUrl: '...' }) for display.
 */
export async function showGiftModal(targetUserId, targetUserInfo = {}) {
    if (!giftModalElement) {
        console.error('Virtual Gift Modal element not found!');
        return;
    }

    if (!targetUserId) {
         console.error('Cannot show gift modal without a target user ID.');
         // Display error somewhere on the triggering page
         return;
    }

    console.log(`Showing virtual gift modal for user: ${targetUserId}`);
    currentGiftTargetUserId = targetUserId; // Set the target user ID

    // Update target user info display in the modal
    if (giftTargetUserInfoElement) {
        if (targetUserInfo.name) {
            setText('gift-target-user-name', targetUserInfo.name);
             showElement(giftTargetUserInfoElement.id);
        } else {
             hideElement(giftTargetUserInfoElement.id); // Hide if no name provided
        }
        // Optional: update target user avatar if element and data exist
    }

    // Reset selected gift state and display
    updateSelectedGiftDisplay(null); // Clear selected gift
    hideGiftMessage(); // Clear any previous messages

    // Fetch available gifts if not already loaded
    if (availableVirtualGifts.length === 0) {
       await fetchVirtualGifts(); // Wait for gifts to load
    } else {
         // Gifts already loaded, just render them
         renderVirtualGifts(availableVirtualGifts);
    }

    // Fetch and display current coin balance
    fetchCoinBalance(); // This is in coins.js, need to make it accessible or duplicate logic

     // Temporarily duplicate fetchCoinBalance logic here for independence:
     // const balance = await api.get('/users/me/coins', true);
     // if (balance && typeof balance.balance === 'number') {
     //     // Cache balance or update a shared state
     //     // updateLocalCoinBalance(balance.balance); // Requires updateLocalCoinBalance
     //     updateCoinBalanceDisplay(); // Update the modal display
     // } else {
     //      setText('current-coin-balance-display', 'N/A');
     // }
     // --- End temporary duplication ---
     // Preferred: Expose fetchCoinBalance from coins.js or have a shared state for balance


    // Ensure button state is correct based on initial state (no gift selected, balance fetched)
    updateSendButtonState();


    // Show the modal
    showElement(giftModalElement.id);
    // Add a class for transition if using CSS transitions
     setTimeout(() => addClass(giftModalElement.id, 'modal-visible'), 10); // Small delay for transition
     removeClass(selectElement('.bg-white', giftModalElement).id, 'modal-enter'); // Remove initial transition class
}

/**
 * Hides the virtual gift modal.
 */
export function hideGiftModal() {
     if (!giftModalElement) return;

     // Add a class for transition out
     addClass(selectElement('.bg-white', giftModalElement).id, 'modal-enter');
     removeClass(giftModalElement.id, 'modal-visible');

     // Hide the element after the transition
     setTimeout(() => {
        hideElement(giftModalElement.id);
        // Reset state
        selectedGift = null;
        currentGiftTargetUserId = null;
        // Clear message area
        hideGiftMessage();
        // Clear selected gift info display
        updateSelectedGiftDisplay(null);
     }, 300); // Match CSS transition duration
}


// --- Initialization ---

/**
 * Adds event listeners to the virtual gift items in the list.
 * Uses event delegation on the gifts list container.
 * This is called after rendering the gifts.
 */
function addGiftItemListeners() {
    if (!virtualGiftsListElement) return;
    // Use event delegation on the parent container
    virtualGiftsListElement.addEventListener('click', handleGiftItemClick);
    console.log('Gift item listeners added.');
}

/**
 * Initializes the virtual gift modal script.
 * This should be called on any page that might show the gift modal.
 */
export function initializeGiftModal() {
    console.log('Initializing virtual gift modal script...');

    // 1. Get DOM elements (modal specific)
    giftModalElement = getElement('virtual-gift-modal');
    if (!giftModalElement) {
        console.warn('Virtual Gift Modal element (#virtual-gift-modal) not found on this page. Skipping modal initialization.');
        return; // Stop if modal HTML is not included on this page
    }

    giftModalCloseButton = getElement('virtual-gift-modal-close');
    giftTargetUserInfoElement = getElement('gift-target-user-info');
    giftTargetUserNameElement = getElement('gift-target-user-name');
    giftMessageArea = getElement('gift-message');
    virtualGiftsListElement = getElement('virtual-gifts-list');
    selectedGiftInfoElement = getElement('selected-gift-info');
    selectedGiftImageElement = getElement('selected-gift-image');
    selectedGiftNameElement = getElement('selected-gift-name');
    selectedGiftCostElement = getElement('selected-gift-cost');
    sendGiftButtonElement = getElement('send-virtual-gift-button');
    currentCoinBalanceDisplayElement = getElement('current-coin-balance-display');


    // 2. Add modal close listeners
    if (giftModalCloseButton) {
        giftModalCloseButton.addEventListener('click', hideGiftModal);
         // Also close modal if clicking clicking outside the modal content
         giftModalElement.addEventListener('click', (event) => {
             // Check if click was directly on the backdrop and not the modal content itself
             if (event.target === giftModalElement) {
                 hideGiftModal();
             }
         });
        console.log('Virtual gift modal close listeners added.');
    }

     // 3. Add send button listener
     if (sendGiftButtonElement) {
         sendGiftButtonElement.addEventListener('click', handleSendGiftClick);
          console.log('Send gift button listener added.');
     }

    // 4. Fetch available virtual gifts (optional, could defer until modal is shown)
    // fetchVirtualGifts(); // Defer fetching until showGiftModal for faster page load

    // 5. Initial state for message area and selected gift info
     if (giftMessageArea) {
         giftMessageArea.className = `mt-4 p-3 rounded border text-center text-sm ${giftMessageArea.className}`;
         hideGiftMessage(); // Ensure hidden initially
     }
     updateSelectedGiftDisplay(null); // Ensure selected gift info is hidden initially

     console.log('Virtual gift modal initialization complete.');
}

// NOTE: This module exports functions (showGiftModal, hideGiftModal, initializeGiftModal).
// It does NOT automatically initialize itself on DOMContentLoaded because the modal HTML
// might be included on multiple pages, and each page's main script
// should call initializeGiftModal() if the modal is present on that page.
// Example usage in browse.js or profile.js:
// import { initializeGiftModal, showGiftModal } from './store.js';
// ...
// inside initialize... function:
// initializeGiftModal(); // Initialize the modal logic
// ...
// When a 'Send Gift' button/icon is clicked somewhere:
// const targetUserId = ...;
// showGiftModal(targetUserId, { name: '...', avatarUrl: '...' });