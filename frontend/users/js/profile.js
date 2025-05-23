// /heartmatch/frontend/users/js/profile.js

// Import necessary functions
import { requireAuth, endSession, getUserData } from './session.js';
import {
    getElement,
    selectElement,
    selectElements,
    getFormData,
    redirectTo,
    setText,
    isValidEmail,
    showElement, // For message area
    hideElement, // For message area
    addClass, // For message styling
    removeClass // For message styling
} from './utils.js';

import { api } from '../../common/js/apiService.js'; // Direct import from common

// --- DOM Element Variables (will be assigned on DOMContentLoaded) ---
let profileNameElement;
let profileAgeElement;
let profileLocationElement;
let profileBioElement;
let profileInterestsElement;
let profilePhotosElement;
let userNavNameElement;
let userNavAvatarElement;
let logoutButtonElement;
let editProfileForm;
let currentPhotosPreviewElement;
let newPhotosInput;
let saveProfileButton;
let profileMessageArea; // Optional: for displaying success/error messages

// --- State Variables ---
let currentUserProfile = null; // To store the fetched user data

// --- Helper Functions ---

/**
 * Determines the current page based on the URL pathname.
 * @returns {'view' | 'edit' | 'unknown'}
 */
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('/profile.html')) {
        return 'view';
    }
    if (path.includes('/edit-profile.html')) {
        return 'edit';
    }
    return 'unknown';
}

/**
 * Displays a message to the user (e.g., success, error).
 * Requires a message area div in the HTML with id="profile-message" or "edit-profile-message".
 * @param {string} message - The message text.
 * @param {'success' | 'error' | 'info'} type - The type of message for styling.
 */
function displayMessage(message, type = 'info') {
     if (!profileMessageArea) return;

     setText(profileMessageArea.id, message);
     removeClass(profileMessageArea.id, 'bg-green-100 border-green-400 text-green-700');
     removeClass(profileMessageArea.id, 'bg-red-100 border-red-400 text-red-700');
     removeClass(profileMessageArea.id, 'bg-blue-100 border-blue-400 text-blue-700');

     switch (type) {
         case 'success':
             addClass(profileMessageArea.id, 'bg-green-100 border-green-400 text-green-700');
             break;
         case 'error':
             addClass(profileMessageArea.id, 'bg-red-100 border-red-400 text-red-700');
             break;
         case 'info':
         default:
              addClass(profileMessageArea.id, 'bg-blue-100 border-blue-400 text-blue-700');
             break;
     }

     showElement(profileMessageArea.id);
}

/**
 * Populates the user's name and avatar in the common header navigation.
 * @param {object} user - The user data object (should contain name and possibly avatarUrl).
 */
function populateNavHeader(user) {
    const nameElement = getElement('user-nav-name') || getElement('user-nav-name-edit');
    const avatarElement = getElement('user-nav-avatar') || getElement('user-nav-avatar-edit');

    if (nameElement && user?.name) {
        setText(nameElement.id, user.name);
    }
    if (avatarElement && user?.avatarUrl) {
        avatarElement.src = user.avatarUrl;
    }
}


// --- Data Fetching ---

/**
 * Fetches the logged-in user's profile data from the backend.
 */
async function fetchUserProfile() {
    console.log('Fetching user profile...');
    try {
        // Ensure isAuthenticated is checked before calling requireAuth here
        // requireAuth() is already called on page load in initializeProfilePage
        const profileData = await api.get('/users/me', true); // Requires authentication
        console.log('Profile fetched:', profileData);
        currentUserProfile = profileData;
        return profileData;
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Handle error (e.g., display error message, redirect if 401 Unauthorized)
        // The apiService already logs the error, but you might want more specific UI feedback
         if (error.status === 401) {
             endSession(); // Clear invalid session
             redirectTo('/frontend/users/pages/login.html'); // Redirect to login
         } else {
              // Display a generic error on the page
              const errorMessage = `Failed to load profile. ${error.data?.message || error.message}`;
              displayMessage(errorMessage, 'error');
               // Hide main content or show a disabled state if crucial data is missing
              // For now, rely on placeholders
         }
        return null;
    }
}

// --- Rendering/Populating Functions ---

/**
 * Populates the view profile page (`profile.html`) with user data.
 * @param {object} profile - The user profile data.
 */
function populateViewProfile(profile) {
    if (!profile) {
        console.warn('No profile data to display.');
        // Optionally hide sections or display a message
        return;
    }

    console.log('Populating view profile page...');

    // Basic Info
    setText('profile-name', profile.name || 'N/A');
    setText('profile-age', profile.age ? `, ${profile.age}` : '');
    setText('profile-location', profile.location ? `<i class="fas fa-map-marker-alt mr-1"></i> ${profile.location}` : '<i class="fas fa-map-marker-alt mr-1"></i> Location not specified'); // Allows HTML using setText

    // Avatar
    const avatarImg = getElement('profile-avatar');
    if (avatarImg && profile.avatarUrl) {
        avatarImg.src = profile.avatarUrl;
    } else if (avatarImg) {
         avatarImg.src = '../img/default-avatar-lg.png'; // Default image
    }

    // About Me
    setText('profile-bio', profile.bio || 'No bio provided yet.');

    // Interests
    const interestsContainer = getElement('profile-interests');
    if (interestsContainer) {
         interestsContainer.innerHTML = ''; // Clear loading placeholder
         if (profile.interests && profile.interests.length > 0) {
             profile.interests.forEach(interest => {
                 const span = document.createElement('span');
                 span.className = 'bg-secondary text-dark px-3 py-1 rounded-full text-sm'; // Use secondary color for tags
                 span.textContent = interest.name || interest; // Assuming interest object has a 'name' or is a string
                 interestsContainer.appendChild(span);
             });
         } else {
              const span = document.createElement('span');
              span.className = 'bg-light text-gray-700 px-3 py-1 rounded-full text-sm';
              span.textContent = 'No interests added yet.';
              interestsContainer.appendChild(span);
         }
    }

    // Photos
    const photosContainer = getElement('profile-photos');
     if (photosContainer) {
        photosContainer.innerHTML = ''; // Clear loading placeholders
        if (profile.photos && profile.photos.length > 0) {
            profile.photos.forEach(photo => {
                // Assuming photo object has a 'url' property
                const photoDiv = document.createElement('div');
                photoDiv.className = 'aspect-square rounded-md overflow-hidden';
                photoDiv.innerHTML = `<img src="${photo.url}" alt="User Photo" class="w-full h-full object-cover">`;
                photosContainer.appendChild(photoDiv);
            });
        } else {
             const placeholder = document.createElement('div');
             placeholder.className = 'bg-gray-200 aspect-square rounded-md flex items-center justify-center text-gray-500';
             placeholder.textContent = 'No photos uploaded yet.';
             photosContainer.appendChild(placeholder);
        }
    }

    // Populate header navigation if on view page
     populateNavHeader(profile);
}

/**
 * Populates the edit profile form page (`edit-profile.html`) with user data.
 * @param {object} profile - The user profile data.
 */
function populateEditProfileForm(profile) {
     if (!profile) {
        console.warn('No profile data to populate form.');
         // Optionally disable the form or display a message
        return;
    }

    console.log('Populating edit profile form...');

    // Find form elements
    const nameInput = getElement('name');
    const emailInput = getElement('email');
    const ageInput = getElement('age');
    const locationInput = getElement('location');
    const bioTextarea = getElement('bio');
    const interestsInput = getElement('interests'); // Assuming comma-separated string input

    // Populate fields
    if (nameInput) nameInput.value = profile.name || '';
    if (emailInput) emailInput.value = profile.email || ''; // Email is disabled but still populated
    if (ageInput) ageInput.value = profile.age || '';
    if (locationInput) locationInput.value = profile.location || '';
    if (bioTextarea) bioTextarea.value = profile.bio || '';

    // Interests: Assuming profile.interests is an array of objects/strings
    if (interestsInput) {
        interestsInput.value = profile.interests && profile.interests.length > 0
            ? profile.interests.map(interest => interest.name || interest).join(', ')
            : '';
    }

    // Populate current photos preview (basic display, no removal yet)
     const photosPreviewContainer = getElement('current-photos-preview');
      if (photosPreviewContainer) {
        photosPreviewContainer.innerHTML = ''; // Clear loading placeholders
        if (profile.photos && profile.photos.length > 0) {
            profile.photos.forEach(photo => {
                 // Assuming photo object has 'url' and maybe 'id' for removal
                const photoDiv = document.createElement('div');
                // Add a class for easier styling/selection if implementing removal later
                photoDiv.className = 'relative aspect-square rounded-md overflow-hidden group'; // Add group for hover effects
                 photoDiv.innerHTML = `
                    <img src="${photo.url}" alt="User Photo" class="w-full h-full object-cover">
                    <!-- Basic remove button placeholder (needs JS handler) -->
                    <button class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs" data-photo-id="${photo.id || photo.url}">
                        <i class="fas fa-times"></i>
                    </button>
                 `;
                 photosPreviewContainer.appendChild(photoDiv);
            });
            // Add event listeners to remove buttons here later if implementing deletion
        } else {
             const placeholder = document.createElement('div');
             placeholder.className = 'bg-gray-200 aspect-square rounded-md flex items-center justify-center text-gray-500';
             placeholder.textContent = 'No photos uploaded.';
             photosPreviewContainer.appendChild(placeholder);
        }
    }

    // Populate header navigation if on edit page
    populateNavHeader(profile);

    // Enable save button if it was disabled during loading
    if (saveProfileButton) {
         saveProfileButton.disabled = false;
         // removeClass(saveProfileButton.id, 'opacity-50 cursor-not-allowed'); // Example disable styling
    }
}


// --- Event Handlers ---

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

/**
 * Handles the submission of the edit profile form.
 * @param {Event} event - The form submit event.
 */
async function handleEditProfileSubmit(event) {
    event.preventDefault(); // Prevent default form refresh

    if (!editProfileForm) return;

    // Disable button and show loading indicator if you have one
    if (saveProfileButton) {
         saveProfileButton.disabled = true;
         // addClass(saveProfileButton.id, 'opacity-50 cursor-not-allowed');
         // setText(saveProfileButton.id, 'Saving...'); // Example text change
    }

    // Clear previous messages
    if (profileMessageArea) hideElement(profileMessageArea.id);


    const formData = getFormData(editProfileForm); // Gets text inputs

    // --- Prepare data for API ---
    const updatedProfileData = {
        name: formData.name,
        age: parseInt(formData.age, 10), // Convert age to number
        location: formData.location,
        bio: formData.bio,
        // Interests: Convert comma-separated string to array
        interests: formData.interests
                    ? formData.interests.split(',').map(item => item.trim()).filter(item => item !== '')
                    : [],
        // Add other fields as needed (gender, preferences, etc.)
    };

     console.log('Submitting profile updates:', updatedProfileData);

    // --- Handle File Uploads (New Photos) ---
    // NOTE: File uploads typically require a different API structure (e.g., multipart/form-data)
    // and backend handling than JSON.
    // For simplicity in this initial JS, we'll separate file uploads or skip them for now.
    // A common pattern is to upload photos first, get their URLs, then update profile with URLs.
    // OR, send multipart form data including files and JSON data.

    const newPhotosFiles = newPhotosInput?.files;
     if (newPhotosFiles && newPhotosFiles.length > 0) {
         console.log('Handling new photo uploads...', newPhotosFiles);
         // *** File Upload Logic Placeholder ***
         // This part requires specific backend endpoints and logic.
         // You would typically create a FormData object specifically for files,
         // potentially upload them to a service (like S3) or your backend first,
         // get back URLs or IDs, and then include those in the profile update data.
         displayMessage('Photo upload logic not fully implemented yet. Profile data will be saved.', 'info');
         // For now, we'll proceed with saving text data and ignore files.
         // Remove the new-photos field from formData if needed for the JSON API call
         delete formData['new-photos[]'];
     }


    // --- Send data to API ---
    try {
        // Assuming your API endpoint for updating profile is PUT /api/users/me
        // And it accepts JSON data like updatedProfileData
        const response = await api.patch('/users/me', updatedProfileData, true); // Use PATCH for partial updates, PUT for full replacement
        console.log('Profile update successful:', response);

        displayMessage('Profile updated successfully!', 'success');

        // Update the currentUserProfile state with the latest data
        // This is important if the API response returns the updated profile
        if (response) {
             currentUserProfile = response;
             // Optionally re-populate the form/header with fresh data from the response
             // populateEditProfileForm(currentUserProfile);
             // populateNavHeader(currentUserProfile);
        }

        // Optional: Redirect back to the view profile page after a delay
        setTimeout(() => {
             redirectTo('/frontend/users/pages/profile.html');
        }, 1500); // Redirect after 1.5 seconds

    } catch (error) {
        console.error('Failed to update profile:', error);
        // Display error message from API or a generic one
        const errorMessage = `Failed to save profile. ${error.data?.message || error.message}`;
        displayMessage(errorMessage, 'error');

         if (error.status === 401) {
             endSession(); // Clear invalid session
             redirectTo('/frontend/users/pages/login.html'); // Redirect to login
         }

    } finally {
         // Re-enable button regardless of success/failure
         if (saveProfileButton) {
             saveProfileButton.disabled = false;
             // removeClass(saveProfileButton.id, 'opacity-50 cursor-not-allowed');
             // setText(saveProfileButton.id, 'Save Profile'); // Restore button text
         }
    }
}

// --- Initialization ---

/**
 * Initializes the profile page script based on the current page (view or edit).
 */
async function initializeProfilePage() {
    console.log('Initializing profile page...');

    // 1. Protect the page: Ensure the user is authenticated
    // This will redirect to login if no valid session is found
    requireAuth();

    // If requireAuth did *not* redirect, we know the user is authenticated
    console.log('User is authenticated.');

    // 2. Get common elements (might exist on both pages)
    userNavNameElement = getElement('user-nav-name') || getElement('user-nav-name-edit');
    userNavAvatarElement = getElement('user-nav-avatar') || getElement('user-nav-avatar-edit');
    logoutButtonElement = getElement('logout-button') || getElement('logout-button-edit');
    // Get the message area based on which page it's likely on
    profileMessageArea = getElement('profile-message') || getElement('edit-profile-message');

    // Add logout listener (common to both profile and edit pages)
    if (logoutButtonElement) {
        logoutButtonElement.addEventListener('click', handleLogout);
        console.log('Logout button listener added (profile/edit).');
    }

    // 3. Fetch user profile data
    const profileData = await fetchUserProfile(); // Wait for data

    // If fetching failed, the error handler inside fetchUserProfile will display message/redirect
    if (!profileData) {
        console.error('Could not fetch profile data, stopping initialization.');
        return; // Stop execution if data fetching failed
    }

    // 4. Populate header navigation with fetched data
    populateNavHeader(profileData);


    // 5. Determine current page and perform page-specific initialization
    const currentPage = getCurrentPage();
    console.log(`Current page: ${currentPage}`);

    if (currentPage === 'view') {
        // Get elements specific to the view profile page
        profileNameElement = getElement('profile-name');
        profileAgeElement = getElement('profile-age');
        profileLocationElement = getElement('profile-location');
        profileBioElement = getElement('profile-bio');
        profileInterestsElement = getElement('profile-interests');
        profilePhotosElement = getElement('profile-photos');

        // Populate the view profile page with fetched data
        populateViewProfile(profileData);

    } else if (currentPage === 'edit') {
        // Get elements specific to the edit profile page
        editProfileForm = getElement('edit-profile-form');
        currentPhotosPreviewElement = getElement('current-photos-preview');
        newPhotosInput = getElement('new-photos');
        saveProfileButton = getElement('save-profile-button');


        // Populate the edit profile form with fetched data
        populateEditProfileForm(profileData);

        // Add form submit listener
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', handleEditProfileSubmit);
            console.log('Edit profile form submit listener added.');
        } else {
             console.error('Edit profile form (#edit-profile-form) not found!');
        }

         // Optional: Add remove photo listeners here if implementing photo deletion
         // const removePhotoButtons = selectElements('#current-photos-preview button');
         // removePhotoButtons.forEach(button => { ... });

    } else {
        console.warn('Unknown profile page loaded.');
        // Handle unknown page case if necessary
    }

    // Initialize message area state (hidden by default unless displayMessage is called)
     if (profileMessageArea) {
        hideElement(profileMessageArea.id);
        // Add base styling classes (optional, could be in CSS)
         profileMessageArea.className = `mt-4 p-3 rounded border text-center text-sm ${profileMessageArea.className}`;
     }
}

// --- Entry Point ---

// Wait for the DOM to be fully loaded before initializing the page script
document.addEventListener('DOMContentLoaded', initializeProfilePage);