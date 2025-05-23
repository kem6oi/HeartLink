// /heartmatch/frontend/users/js/chatSocket.js

// Define your WebSocket backend URL
// Use 'ws://' for local development, 'wss://' for production (secure WebSocket)
const WS_BASE_URL = 'ws://localhost:3000'; // Replace with your actual WebSocket URL and port

let socket = null;
let messageListeners = [];
let statusListeners = [];
let currentAuthToken = null; // Store token for reconnection

/**
 * Establishes a WebSocket connection.
 * Includes token in connection request (requires backend support).
 * @param {string} token - The user's authentication token.
 */
export function connect(token) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected.');
        return;
    }

    if (socket && socket.readyState === WebSocket.CONNECTING) {
         console.log('WebSocket already connecting.');
         return;
    }

    console.log('Attempting to connect to WebSocket...');
    currentAuthToken = token; // Store token for potential reconnects

    // Append token as a query parameter (common method, requires backend parsing)
    // Or send token in the first message upon 'open' event
    const url = `${WS_BASE_URL}?token=${token}`;
    socket = new WebSocket(url);

    socket.onopen = (event) => {
        console.log('WebSocket connection opened:', event);
        notifyStatusChange('connected');
        // Optional: Send token in a specific message format after opening
        // socket.send(JSON.stringify({ type: 'auth', token: token }));
    };

    socket.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        try {
            const messageData = JSON.parse(event.data);
            // Notify all registered message listeners
            messageListeners.forEach(listener => listener(messageData));
        } catch (e) {
            console.error('Failed to parse WebSocket message:', event.data, e);
        }
    };

    socket.onerror = (event) => {
        console.error('WebSocket error:', event);
        notifyStatusChange('error');
        // Depending on the error, you might try to reconnect
    };

    socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
        notifyStatusChange('disconnected', event.code, event.reason);
        // Handle specific close codes (e.g., 1000 Normal Closure, 1006 Abnormal Closure, 1008 Policy Violation)
        // If it's an unexpected closure, try to reconnect after a delay
        if (!event.wasClean && event.code !== 1000 && currentAuthToken) {
             console.log('Attempting to reconnect WebSocket...');
            // Implement a simple backoff/retry logic if needed
             setTimeout(() => connect(currentAuthToken), 5000); // Retry after 5 seconds
        }
    };
}

/**
 * Disconnects the WebSocket connection.
 */
export function disconnect() {
    if (socket) {
        console.log('Closing WebSocket connection...');
        socket.close(1000, 'Client disconnecting'); // Use 1000 for normal closure
        socket = null;
        currentAuthToken = null; // Clear token so reconnect doesn't happen automatically
    }
}

/**
 * Sends a message through the WebSocket.
 * @param {object} message - The message object to send (will be stringified).
 */
export function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
        console.log('WebSocket message sent:', message);
    } else {
        console.warn('WebSocket not connected. Message not sent:', message);
        // Optionally queue message for sending when connected
        // Or notify the user that the message couldn't be sent
         notifyStatusChange('error', null, 'WebSocket not connected.');
    }
}

/**
 * Registers a listener function to handle incoming messages.
 * @param {function(object): void} listener - The function to call when a message is received.
 */
export function onMessage(listener) {
    if (typeof listener === 'function') {
        messageListeners.push(listener);
    }
}

/**
 * Removes a registered message listener.
 * @param {function(object): void} listener - The function to remove.
 */
export function removeMessageListener(listener) {
    messageListeners = messageListeners.filter(l => l !== listener);
}

/**
 * Registers a listener function to handle connection status changes.
 * @param {function(string, number?, string?): void} listener - The function to call with status ('connected', 'disconnected', 'error'), optional code and reason.
 */
export function onStatusChange(listener) {
    if (typeof listener === 'function') {
        statusListeners.push(listener);
    }
}

/**
 * Removes a registered status listener.
 * @param {function(string, number?, string?): void} listener - The function to remove.
 */
export function removeStatusListener(listener) {
    statusListeners = statusListeners.filter(l => l !== listener);
}

/**
 * Notifies all registered status listeners.
 * @param {string} status - The new status ('connected', 'disconnected', 'error').
 * @param {number} [code] - Optional WebSocket close code.
 * @param {string} [reason] - Optional WebSocket close reason.
 */
function notifyStatusChange(status, code = null, reason = null) {
    statusListeners.forEach(listener => listener(status, code, reason));
}

// Optional: Automatically connect when session is detected on load?
// Or rely on chat.js to explicitly call connect after auth check.
// Relying on chat.js for explicit connect is generally better control.