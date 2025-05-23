// /heartmatch/frontend/common/js/sharedUtils.js

/**
 * Get a DOM element by its ID.
 * @param {string} id - The ID of the element.
 * @returns {HTMLElement | null} The element or null if not found.
 */
export function getElement(id) {
    return document.getElementById(id);
}

/**
 * Get a DOM element by a CSS selector.
 * @param {string} selector - The CSS selector.
 * @param {HTMLElement} [parent=document] - The parent element to search within.
 * @returns {HTMLElement | null} The element or null if not found.
 */
export function selectElement(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * Get multiple DOM elements by a CSS selector.
 * @param {string} selector - The CSS selector.
 * @param {HTMLElement} [parent=document] - The parent element to search within.
 * @returns {NodeListOf<HTMLElement>} A NodeList of elements.
 */
export function selectElements(selector, parent = document) {
    return parent.querySelectorAll(selector);
}


/**
 * Set text content for an element.
 * @param {string} id - The ID of the element.
 * @param {string} text - The text content to set.
 */
export function setText(id, text) {
    const element = getElement(id);
    if (element) {
        element.textContent = text;
    }
}

/**
 * Show an element.
 * @param {string} id - The ID of the element.
 */
export function showElement(id) {
    const element = getElement(id);
    if (element) {
        element.style.display = ''; // Reverts to default display (block, flex, etc.)
    }
}

/**
 * Hide an element.
 * @param {string} id - The ID of the element.
 */
export function hideElement(id) {
    const element = getElement(id);
    if (element) {
        element.style.display = 'none';
    }
}

/**
 * Add a class to an element.
 * @param {string} id - The ID of the element.
 * @param {string} className - The class name to add.
 */
export function addClass(id, className) {
    const element = getElement(id);
    if (element) {
        element.classList.add(className);
    }
}

/**
 * Remove a class from an element.
 * @param {string} id - The ID of the element.
 * @param {string} className - The class name to remove.
 */
export function removeClass(id, className) {
    const element = getElement(id);
    if (element) {
        element.classList.remove(className);
    }
}

/**
 * Toggle a class on an element.
 * @param {string} id - The ID of the element.
 * @param {string} className - The class name to toggle.
 */
export function toggleClass(id, className) {
    const element = getElement(id);
    if (element) {
        element.classList.toggle(className);
    }
}

/**
 * Get form data as an object.
 * @param {HTMLFormElement} form - The form element.
 * @returns {object} An object containing form data.
 */
export function getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

/**
 * Basic email format validation.
 * @param {string} email - The email string.
 * @returns {boolean} True if the email format is valid, false otherwise.
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Save data to localStorage.
 * @param {string} key - The key to save under.
 * @param {any} value - The value to save. Can be an object/array (will be stringified).
 */
export function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Error saving to localStorage:", error);
    }
}

/**
 * Get data from localStorage.
 * @param {string} key - The key to retrieve.
 * @returns {any | null} The retrieved value, parsed if JSON, or null if not found.
 */
export function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return null;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error("Error getting from localStorage:", error);
        return null;
    }
}

/**
 * Remove data from localStorage.
 * @param {string} key - The key to remove.
 */
export function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error("Error removing from localStorage:", error);
    }
}

/**
 * Redirect to another page.
 * @param {string} url - The URL to redirect to.
 */
export function redirectTo(url) {
    window.location.href = url;
}

// Add more shared utilities as needed...