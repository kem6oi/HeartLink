// /heartmatch/frontend/users/js/utils.js

// Import shared utilities from the common directory
// NOTE: The actual import path might vary based on your build/serving setup.
// This path assumes direct module import which requires a specific setup.
// If not using modules, you might need to ensure sharedUtils.js is loaded globally first.
import * as sharedUtils from '../../common/js/sharedUtils.js';

// Re-export shared utilities
export const getElement = sharedUtils.getElement;
export const selectElement = sharedUtils.selectElement;
export const selectElements = sharedUtils.selectElements;
export const setText = sharedUtils.setText;
export const showElement = sharedUtils.showElement;
export const hideElement = sharedUtils.hideElement;
export const addClass = sharedUtils.addClass;
export const removeClass = sharedUtils.removeClass;
export const toggleClass = sharedUtils.toggleClass;
export const getFormData = sharedUtils.getFormData;
export const isValidEmail = sharedUtils.isValidEmail;
export const saveToLocalStorage = sharedUtils.saveToLocalStorage;
export const getFromLocalStorage = sharedUtils.getFromLocalStorage;
export const removeFromLocalStorage = sharedUtils.removeFromLocalStorage;
export const redirectTo = sharedUtils.redirectTo;

// Add any user-specific utilities here if needed
// export function formatUserProfileData(data) { ... }