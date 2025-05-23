// /heartmatch/frontend/users/js/chat.js

// Import necessary functions
import { requireAuth, endSession, getUserData, getAuthToken } from './session.js';
import {
    getElement,
    selectElement,
    selectElements,
    redirectTo,
    setText,
    showElement,
    hideElement,
    addClass,
    removeClass,
    getFormData // Might not need this for a single input form, but good to have
} from './utils.js';

import { api } from '../../common/js/apiService.js'; // Direct import from common
import * as chatSocket from './chatSocket.js'; // Import all functions from chatSocket

// --- DOM Element Variables ---
let conversationListElement;
let chatWindowElement;
let chatHeaderNameElement;
let chatHeaderAvatarElement;
let messageListElement;
let messageInputAreaElement;
let messageFormElement;
let messageInputElement;
let chatPlaceholderElement;
let userNavNameElement; // For header nav
let userNavAvatarElement; // For header nav
let logoutButtonElement; // For header nav

// --- State Variables ---
let currentUser = null; // Store logged-in user data
let currentConversationId = null; // ID of the currently selected conversation
let conversations = []; // Array of conversation objects
let messages = {}; // Object mapping conversationId to array of messages

// --- Helper Functions ---

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

/**
 * Displays a temporary message or state in the message area (e.g., loading history, no messages).
 * Hides the message input area.
 * @param {string} message - The message to display.
 */
function displayMessageAreaPlaceholder(message) {
    if (messageListElement) {
        messageListElement.innerHTML = `
            <div class="h-full flex items-center justify-center text-gray-500">
               ${message}
            </div>
        `;
         // Ensure scrollbar is gone or handles overflow:hidden gracefully
         messageListElement.scrollTop = 0; // Reset scroll
    }
    if (messageInputAreaElement) hideElement(messageInputAreaElement.id);
}

/**
 * Hides the message area placeholder and shows the message input.
 */
function hideMessageAreaPlaceholder() {
    if (messageListElement) {
         // Check if it's the placeholder div before clearing
        const firstChild = messageListElement.firstElementChild;
        if (firstChild && firstChild.id === 'chat-placeholder' || (firstChild && firstChild.classList.contains('flex') && firstChild.classList.contains('justify-center'))) {
             messageListElement.innerHTML = '';
        }
    }
    if (messageInputAreaElement) showElement(messageInputAreaElement.id);
}


/**
 * Scrolls the message list to the bottom.
 */
function scrollToBottom() {
    if (messageListElement) {
        messageListElement.scrollTop = messageListElement.scrollHeight;
    }
}

/**
 * Renders a single message bubble.
 * @param {object} message - The message object { senderId, content, timestamp }.
 * @param {object} senderProfile - The profile of the message sender (needed for avatar).
 * @returns {string} The HTML string for the message bubble.
 */
function renderMessage(message, senderProfile) {
     // Determine if the message is from the current user
    const isCurrentUser = currentUser && message.senderId === currentUser.id;
    const avatarUrl = senderProfile?.avatarUrl || '../img/default-avatar.png'; // Fallback avatar

    // Use different styling based on sender
    if (isCurrentUser) {
        return `
            <div class="flex justify-end">
                 <div class="bg-primary text-white rounded-lg p-3 max-w-xs break-words">
                     <p class="text-sm">${message.content}</p>
                 </div>
            </div>
        `;
    } else {
        return `
            <div class="flex justify-start items-start">
                 <img src="${avatarUrl}" alt="Sender Avatar" class="w-8 h-8 rounded-full object-cover mr-3 flex-shrink-0">
                 <div class="bg-gray-200 text-dark rounded-lg p-3 max-w-xs break-words">
                     <p class="text-sm">${message.content}</p>
                 </div>
            </div>
        `;
    }
}


// --- Data Fetching ---

/**
 * Fetches the list of conversations (matches) for the logged-in user.
 */
async function fetchConversations() {
    console.log('Fetching conversations...');
    if (conversationListElement) conversationListElement.innerHTML = '<div class="p-4 text-center text-gray-500">Loading conversations...</div>';

    try {
        // Assuming API endpoint is GET /api/chat/conversations
        // Should return an array of objects, each representing a conversation (e.g., { id, matchUser, lastMessage, unreadCount })
        const response = await api.get('/chat/conversations', true); // Requires authentication

        console.log('Conversations fetched:', response);
        conversations = response || []; // Store fetched conversations

        renderConversationList(conversations);

    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        // Handle error (e.g., display error message)
        if (conversationListElement) conversationListElement.innerHTML = `<div class="p-4 text-center text-red-600">Failed to load conversations. ${error.data?.message || error.message}</div>`;
         if (error.status === 401) {
             endSession(); // Clear invalid session
             redirectTo('/frontend/users/pages/login.html'); // Redirect to login
         }
    }
}

/**
 * Fetches message history for a specific conversation.
 * @param {string} conversationId - The ID of the conversation.
 */
async function fetchMessageHistory(conversationId) {
    console.log(`Fetching message history for conversation: ${conversationId}`);
     displayMessageAreaPlaceholder('Loading messages...');

    try {
        // Assuming API endpoint is GET /api/chat/messages/:conversationId
        // Should return an array of message objects { id, conversationId, senderId, content, timestamp }
        const response = await api.get(`/chat/messages/${conversationId}`, true); // Requires authentication

        console.log('Message history fetched:', response);
        messages[conversationId] = response || []; // Store messages

        renderMessages(conversationId); // Render the fetched messages
        hideMessageAreaPlaceholder(); // Hide loading message

        // Optional: Mark messages as read via API
        // api.post(`/chat/${conversationId}/read`, {}, true).catch(err => console.error('Failed to mark as read:', err));

    } catch (error) {
        console.error(`Failed to fetch message history for conversation ${conversationId}:`, error);
        displayMessageAreaPlaceholder(`Failed to load messages. ${error.data?.message || error.message}`);
         if (error.status === 401) {
             endSession(); // Clear invalid session
             redirectTo('/frontend/users/pages/login.html'); // Redirect to login
         }
    }
}


// --- Rendering Functions ---

/**
 * Renders the list of conversations in the sidebar.
 * @param {Array<object>} conversations - An array of conversation objects.
 */
function renderConversationList(conversations) {
    if (!conversationListElement) return;

    conversationListElement.innerHTML = ''; // Clear existing content

    if (conversations.length === 0) {
        conversationListElement.innerHTML = '<div class="p-4 text-center text-gray-500">No matches yet. Go find someone!</div>';
        return;
    }

    conversations.forEach(conversation => {
         // Assuming conversation object includes a 'matchUser' object with profile details
        const matchUser = conversation.matchUser;
        if (!matchUser) {
            console.warn('Conversation item missing match user data:', conversation);
            return; // Skip rendering if match user data is missing
        }
        const lastMessage = conversation.lastMessage?.content || 'No messages yet.';
        const unreadCount = conversation.unreadCount || 0; // Assuming backend provides this
        const timestamp = conversation.lastMessage?.timestamp ? new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''; // Basic time format

        const conversationItemHtml = `
            <div class="flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${currentConversationId === conversation.id ? 'bg-gray-100' : ''}"
                 data-conversation-id="${conversation.id}"
                 data-match-user-id="${matchUser.id}">
                 <div class="relative">
                     <img src="${matchUser.avatarUrl || '../img/default-avatar.png'}" alt="${matchUser.name}'s Avatar" class="w-12 h-12 rounded-full object-cover mr-3">
                     ${unreadCount > 0 ? `<span class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">${unreadCount}</span>` : ''}
                 </div>
                 <div class="flex-grow overflow-hidden">
                     <h3 class="text-sm font-medium text-dark line-clamp-1">${matchUser.name || 'N/A'}</h3>
                     <p class="text-xs text-gray-500 line-clamp-1">${lastMessage}</p>
                 </div>
                 <span class="text-xs text-gray-400 ml-2">${timestamp}</span>
            </div>
        `;

        conversationListElement.insertAdjacentHTML('beforeend', conversationItemHtml);
    });

    // Add event listeners to conversation items after rendering
    addConversationItemListeners();
}

/**
 * Renders the messages for the currently selected conversation.
 * @param {string} conversationId - The ID of the conversation whose messages to render.
 */
function renderMessages(conversationId) {
    if (!messageListElement || !messages[conversationId]) return;

    messageListElement.innerHTML = ''; // Clear existing messages

    const conversation = conversations.find(c => c.id === conversationId);
    const matchUser = conversation?.matchUser; // Get match user profile for rendering

    if (!matchUser) {
        console.error('Match user data not found for rendering messages.');
        displayMessageAreaPlaceholder('Error loading chat details.');
        return;
    }

    messages[conversationId].forEach(message => {
        // Find the sender profile - it's either the current user or the match user
        const senderProfile = message.senderId === currentUser?.id ? currentUser : matchUser;
        messageListElement.insertAdjacentHTML('beforeend', renderMessage(message, senderProfile));
    });

    // Scroll to the latest message
    scrollToBottom();
}


// --- Event Handlers ---

/**
 * Handles clicking on a conversation item in the sidebar.
 * @param {Event} event - The click event.
 */
function handleConversationClick(event) {
    const conversationItem = event.target.closest('[data-conversation-id]');
    if (!conversationItem) return;

    const conversationId = conversationItem.dataset.conversationId;
    const matchUserId = conversationItem.dataset.matchUserId;

    if (!conversationId || !matchUserId) {
        console.error('Conversation or Match User ID missing from clicked item.');
        return;
    }

    console.log(`Conversation clicked: ${conversationId}, Match User: ${matchUserId}`);

    // Do nothing if the same conversation is clicked
    if (currentConversationId === conversationId) {
        return;
    }

    // Update active state in the UI
    if (conversationListElement) {
        selectElements('[data-conversation-id]', conversationListElement).forEach(item => {
            removeClass(item.dataset.conversationId, 'bg-gray-100'); // Remove from previous active
        });
        addClass(conversationId, 'bg-gray-100'); // Add to current active
    }


    currentConversationId = conversationId; // Update state

    // Update chat header with the match user's details
    const matchUser = conversations.find(c => c.id === conversationId)?.matchUser;
    if (chatHeaderNameElement && matchUser?.name) {
        setText(chatHeaderNameElement.id, matchUser.name);
    }
     if (chatHeaderAvatarElement && matchUser?.avatarUrl) {
        chatHeaderAvatarElement.src = matchUser.avatarUrl;
    } else if (chatHeaderAvatarElement) {
         chatHeaderAvatarElement.src = '../img/default-avatar.png'; // Default avatar
     }

    // Hide the initial placeholder
    if (chatPlaceholderElement) hideElement(chatPlaceholderElement.id);

    // Fetch and render messages for this conversation
    // Check if messages are already cached
    if (messages[conversationId]) {
        console.log('Loading messages from cache.');
        renderMessages(conversationId);
        hideMessageAreaPlaceholder();
    } else {
        // Fetch from API if not cached
        fetchMessageHistory(conversationId);
    }

     // *** WebSocket Logic ***
     // Notify the WebSocket service that we've changed conversation/room
     // This assumes your WebSocket server supports joining/leaving rooms
     chatSocket.sendMessage({ type: 'joinRoom', conversationId: conversationId });
}

/**
 * Handles the submission of the message form.
 * @param {Event} event - The form submit event.
 */
function handleMessageSubmit(event) {
    event.preventDefault(); // Prevent default form refresh

    if (!messageInputElement || !currentConversationId || !currentUser) {
        console.warn('Cannot send message: Input, conversation or user missing.');
         // Display an error message if needed
        return;
    }

    const messageContent = messageInputElement.value.trim();

    if (!messageContent) {
        console.log('Message is empty, not sending.');
        return;
    }

    console.log(`Sending message to conversation ${currentConversationId}: "${messageContent}"`);

    // Construct message object - align this with your backend WebSocket message format
    const messageToSend = {
        type: 'chatMessage', // Or whatever type indicates a new message
        conversationId: currentConversationId,
        content: messageContent,
        // senderId will likely be added by the backend based on auth token
        // timestamp might be added by backend for accuracy
    };

    // Send message via WebSocket
    chatSocket.sendMessage(messageToSend);

    // Clear the input field
    messageInputElement.value = '';

     // Optional: Temporarily add message to UI optimistically before receiving confirmation from WS
     // This makes the chat feel faster, but needs logic to handle send failures.
     // For now, we'll wait for the message to come back via WebSocket.
}

/**
 * Handles incoming messages from the WebSocket.
 * This function is registered with chatSocket.onMessage.
 * @param {object} messageData - The parsed message object received from the server.
 */
function handleIncomingWebSocketMessage(messageData) {
    console.log('Handling incoming WS message:', messageData);

    // Check the message type and relevant data
    if (messageData.type === 'chatMessage' && messageData.conversationId === currentConversationId) {
        // This is a new message for the current conversation
        console.log('Rendering new message.');

        // Assuming messageData has { type: 'chatMessage', conversationId, senderId, content, timestamp }
        // Find the sender profile (either current user or the match)
        const conversation = conversations.find(c => c.id === currentConversationId);
        const matchUser = conversation?.matchUser;
         const senderProfile = messageData.senderId === currentUser?.id ? currentUser : matchUser;

        if (!senderProfile) {
            console.error('Sender profile not found for incoming message.');
            return;
        }

        // Append the new message to the message list
        if (messageListElement) {
             // Remove placeholder if it exists
             hideMessageAreaPlaceholder(); // Handles removing placeholder div

            messageListElement.insertAdjacentHTML('beforeend', renderMessage(messageData, senderProfile));
            scrollToBottom(); // Scroll to show the latest message
        }

         // Optional: Update the last message snippet in the conversation list (UI only)
         // This requires finding the conversation item by conversationId
         const conversationItem = selectElement(`[data-conversation-id="${currentConversationId}"]`);
         if (conversationItem) {
              const lastMessageSnippet = selectElement('p.text-xs', conversationItem);
              if (lastMessageSnippet) {
                   setText(lastMessageSnippet.id, messageData.content.substring(0, 50) + (messageData.content.length > 50 ? '...' : ''));
                   // Optional: Update timestamp as well
              }
              // Also remove the unread badge if the message came from the other user
              if (messageData.senderId !== currentUser?.id) {
                  const unreadBadge = selectElement('.bg-red-600', conversationItem);
                   if (unreadBadge) unreadBadge.remove();
                   // And reset unread count in the conversations array
                   const convIndex = conversations.findIndex(c => c.id === currentConversationId);
                    if (convIndex !== -1) conversations[convIndex].unreadCount = 0;
              }
         }

         // Optional: Play a notification sound if message is from the other user
         // if (messageData.senderId !== currentUser?.id) { playNotificationSound(); }


    } else if (messageData.type === 'newMatch' || messageData.type === 'newMessageNotification') {
        // Handle notifications like a new match or a message in another conversation
        console.log('Received new match or message notification.');
        // You might want to refresh the conversation list or show a notification badge
        // For simplicity, let's re-fetch conversations to update the list
        fetchConversations(); // This will refresh the sidebar list including the new conversation/message
    }
     // Handle other WebSocket message types as needed (e.g., typing indicators, read receipts)
     // else if (messageData.type === 'typing' && messageData.conversationId === currentConversationId && messageData.senderId !== currentUser?.id) { ... display typing indicator ... }

}

/**
 * Handles WebSocket status changes.
 * This function is registered with chatSocket.onStatusChange.
 * @param {string} status - The new status ('connected', 'disconnected', 'error').
 * @param {number} [code] - Optional WebSocket close code.
 * @param {string} [reason] - Optional WebSocket close reason.
 */
function handleWebSocketStatusChange(status, code, reason) {
    console.log('WebSocket status changed:', status, code, reason);
    // Update UI based on status (e.g., show connection status, disable input if disconnected)
    // Example:
    // const statusIndicator = getElement('websocket-status');
    // if (statusIndicator) {
    //     statusIndicator.textContent = `Status: ${status}`;
    //     // Apply classes for color (green for connected, red for disconnected/error)
    // }

     if (status === 'disconnected' || status === 'error') {
        // Optionally disable the message input if connection is lost
        if (messageInputElement) messageInputElement.disabled = true;
         if (sendButtonElement) sendButtonElement.disabled = true;
     } else if (status === 'connected') {
         // Re-enable input if it was disabled
         if (messageInputElement) messageInputElement.disabled = false;
         if (sendButtonElement) sendButtonElement.disabled = false;

         // If we were in a conversation, try to rejoin the room after reconnect
         if (currentConversationId) {
              chatSocket.sendMessage({ type: 'joinRoom', conversationId: currentConversationId });
         }
     }
}


// --- Initialization ---

/**
 * Adds event listeners to the conversation items in the sidebar.
 * Uses event delegation on the conversation list container.
 * This is called after rendering the conversation list.
 */
function addConversationItemListeners() {
    if (!conversationListElement) return;
    // Use event delegation on the parent container
    conversationListElement.addEventListener('click', handleConversationClick);
    console.log('Conversation item listeners added.');
}

/**
 * Initializes the chat page script.
 */
async function initializeChatPage() {
    console.log('Initializing chat page...');

    // 1. Protect the page: Ensure the user is authenticated
    requireAuth(); // This will redirect to login if no valid session is found

    // If requireAuth did *not* redirect, we know the user is authenticated
    console.log('User is authenticated.');
    currentUser = getUserData(); // Get logged-in user data for rendering messages

    // 2. Get DOM elements
    conversationListElement = getElement('conversation-list');
    chatWindowElement = getElement('chat-window');
    chatHeaderNameElement = getElement('chat-header-name');
    chatHeaderAvatarElement = getElement('chat-header-avatar');
    messageListElement = getElement('message-list');
    messageInputAreaElement = getElement('message-input-area');
    messageFormElement = getElement('message-form');
    messageInputElement = getElement('message-input');
    chatPlaceholderElement = getElement('chat-placeholder'); // Initial placeholder
    userNavNameElement = getElement('user-nav-name-chat');
    userNavAvatarElement = getElement('user-nav-avatar-chat');
    logoutButtonElement = getElement('logout-button-chat');
     // Assuming send button has id="send-button" from HTML
    // let sendButtonElement = getElement('send-button'); // Need to get this if disabling

    // 3. Add common listeners (Logout)
    if (logoutButtonElement) {
        logoutButtonElement.addEventListener('click', handleLogout);
        console.log('Logout button listener added (chat).');
    }

    // 4. Add message form submit listener
    if (messageFormElement) {
        messageFormElement.addEventListener('submit', handleMessageSubmit);
        console.log('Message form submit listener added.');
    }

    // 5. Populate header navigation with logged-in user data
     if (currentUser) {
        populateNavHeader(currentUser);
        console.log(`Displaying user in nav: ${currentUser.name}`);
    } else {
         console.warn('User data not available for nav header.');
     }

    // 6. Fetch the initial list of conversations
    fetchConversations();

    // 7. Initialize message area state (show placeholder)
    displayMessageAreaPlaceholder('Select a conversation to start chatting.');
     // Initial state for message input area
     if (messageInputAreaElement) hideElement(messageInputAreaElement.id);


    // *** 8. WebSocket Initialization ***
    // Connect to the WebSocket server
    const authToken = getAuthToken();
    if (authToken) {
        chatSocket.connect(authToken);
        // Register listeners for incoming messages and status changes
        chatSocket.onMessage(handleIncomingWebSocketMessage);
        chatSocket.onStatusChange(handleWebSocketStatusChange);
        console.log('WebSocket connection initiated and listeners registered.');
    } else {
        console.error('No auth token found for WebSocket connection.');
        // Handle this case - requireAuth should have redirected already, but double-check
         displayMessageAreaPlaceholder('Authentication token missing. Please log in again.');
    }

    // Add cleanup on page unload (important for websockets)
     window.addEventListener('beforeunload', chatSocket.disconnect);
}

// --- Entry Point ---

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeChatPage);

// --- Event Handlers (Logout - Keep here for direct use if needed, though imported in initialize) ---
/**
 * Handles the logout action.
 * Ends the session and redirects the user to the login page.
 */
function handleLogout() {
    console.log('Attempting to log out...');
    chatSocket.disconnect(); // Disconnect WebSocket on logout
    endSession(); // Clear session data
    // Redirect to the login page
    redirectTo('/frontend/users/pages/login.html'); // Adjust path as needed
}