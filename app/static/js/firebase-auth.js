/**
 * Firebase Authentication Module
 * Handles Firebase initialization and authentication operations
 */

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDN8QXO_Aw57r-xHzT_mzCV8JVCwLBiNcM",
    authDomain: "dsk-agentspace-trial.firebaseapp.com",
    projectId: "dsk-agentspace-trial",
    storageBucket: "dsk-agentspace-trial.firebasestorage.app",
    messagingSenderId: "886325466422",
    appId: "1:886325466422:web:e8abcab15947dd62b98f97"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Auth module object
const FirebaseAuthModule = {
    /**
     * Sign in with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User credential object
     */
    signIn: async function(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Get ID token
            const idToken = await user.getIdToken();

            // Store token and user info
            sessionStorage.setItem('authToken', idToken);
            sessionStorage.setItem('userEmail', user.email);
            sessionStorage.setItem('userId', user.uid);

            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    idToken: idToken
                }
            };
        } catch (error) {
            console.error('Sign in error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    },

    /**
     * Sign out current user
     * @returns {Promise<Object>} Result object
     */
    signOut: async function() {
        try {
            await auth.signOut();

            // Clear stored tokens and user info
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('userEmail');
            sessionStorage.removeItem('userId');

            return {
                success: true,
                message: 'Successfully signed out'
            };
        } catch (error) {
            console.error('Sign out error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    },

    /**
     * Send password reset email
     * @param {string} email - User email
     * @returns {Promise<Object>} Result object
     */
    resetPassword: async function(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            return {
                success: true,
                message: 'Password reset email sent. Please check your inbox.'
            };
        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    },

    /**
     * Get current authenticated user
     * @returns {Object|null} Current user object or null
     */
    getCurrentUser: function() {
        const user = auth.currentUser;
        if (user) {
            return {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified
            };
        }
        return null;
    },

    /**
     * Get stored ID token
     * @returns {string|null} ID token or null
     */
    getIdToken: function() {
        return sessionStorage.getItem('authToken');
    },

    /**
     * Verify if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated: function() {
        const token = this.getIdToken();
        const user = auth.currentUser;
        return !!(token && user);
    },

    /**
     * Set up auth state listener
     * @param {Function} callback - Callback function for auth state changes
     */
    onAuthStateChanged: function(callback) {
        return auth.onAuthStateChanged(callback);
    },

    /**
     * Refresh ID token
     * @returns {Promise<string|null>} New ID token or null
     */
    refreshToken: async function() {
        try {
            const user = auth.currentUser;
            if (user) {
                const idToken = await user.getIdToken(true);
                sessionStorage.setItem('authToken', idToken);
                return idToken;
            }
            return null;
        } catch (error) {
            console.error('Token refresh error:', error);
            return null;
        }
    },

    /**
     * Get user-friendly error message
     * @param {string} errorCode - Firebase error code
     * @returns {string} User-friendly error message
     */
    getErrorMessage: function(errorCode) {
        const errorMessages = {
            'auth/invalid-email': 'Invalid email address format.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'Email is already registered.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/operation-not-allowed': 'This operation is not allowed.',
            'auth/invalid-credential': 'Invalid email or password.',
            'auth/invalid-login-credentials': 'Invalid email or password.'
        };

        return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Validation result
     */
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} Validation result with message
     */
    validatePassword: function(password) {
        if (password.length < 6) {
            return {
                valid: false,
                message: 'Password must be at least 6 characters long.'
            };
        }
        return {
            valid: true,
            message: 'Password is valid.'
        };
    }
};

// Export for use in other scripts
window.FirebaseAuthModule = FirebaseAuthModule;