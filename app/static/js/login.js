/**
 * Login UI Handler
 * Manages login form interactions and UI updates
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loginButton = document.getElementById('loginButton');
    const buttonText = document.getElementById('buttonText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const authMessage = document.getElementById('authMessage');

    // Check if already authenticated
    FirebaseAuthModule.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in, redirect to main app
            const token = FirebaseAuthModule.getIdToken();
            if (token) {
                redirectToApp();
            }
        }
    });

    /**
     * Handle login form submission
     */
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Clear previous errors
        clearErrors();
        hideMessage();

        // Get form values
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validate inputs
        let hasError = false;

        if (!email) {
            showError(emailError, 'Email is required.');
            hasError = true;
        } else if (!FirebaseAuthModule.validateEmail(email)) {
            showError(emailError, 'Please enter a valid email address.');
            hasError = true;
        }

        if (!password) {
            showError(passwordError, 'Password is required.');
            hasError = true;
        } else {
            const passwordValidation = FirebaseAuthModule.validatePassword(password);
            if (!passwordValidation.valid) {
                showError(passwordError, passwordValidation.message);
                hasError = true;
            }
        }

        if (hasError) return;

        // Show loading state
        setLoadingState(true);

        try {
            // Attempt sign in
            const result = await FirebaseAuthModule.signIn(email, password);

            if (result.success) {
                // Show success message
                showMessage('Login successful! Redirecting...', 'success');

                // Add valid class to inputs
                emailInput.classList.add('valid');
                passwordInput.classList.add('valid');

                // Redirect to main app after short delay
                setTimeout(() => {
                    redirectToApp();
                }, 1500);
            } else {
                // Show error message
                showMessage(result.error, 'error');

                // Add invalid class to inputs
                emailInput.classList.add('invalid');
                passwordInput.classList.add('invalid');

                // Reset loading state
                setLoadingState(false);
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('An unexpected error occurred. Please try again.', 'error');
            setLoadingState(false);
        }
    });

    /**
     * Handle forgot password link click
     */
    forgotPasswordLink.addEventListener('click', async function(e) {
        e.preventDefault();

        const email = emailInput.value.trim();

        if (!email) {
            showMessage('Please enter your email address first.', 'info');
            emailInput.focus();
            return;
        }

        if (!FirebaseAuthModule.validateEmail(email)) {
            showMessage('Please enter a valid email address.', 'error');
            emailInput.focus();
            return;
        }

        // Confirm password reset
        const confirmed = confirm(`Send password reset email to ${email}?`);
        if (!confirmed) return;

        setLoadingState(true);

        try {
            const result = await FirebaseAuthModule.resetPassword(email);

            if (result.success) {
                showMessage(result.message, 'success');
            } else {
                showMessage(result.error, 'error');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            showMessage('Failed to send password reset email.', 'error');
        } finally {
            setLoadingState(false);
        }
    });

    /**
     * Handle input field changes for real-time validation
     */
    emailInput.addEventListener('input', function() {
        clearError(emailError);
        emailInput.classList.remove('invalid', 'valid');

        if (emailInput.value.trim()) {
            if (FirebaseAuthModule.validateEmail(emailInput.value.trim())) {
                emailInput.classList.add('valid');
            }
        }
    });

    passwordInput.addEventListener('input', function() {
        clearError(passwordError);
        passwordInput.classList.remove('invalid', 'valid');

        if (passwordInput.value) {
            const validation = FirebaseAuthModule.validatePassword(passwordInput.value);
            if (validation.valid) {
                passwordInput.classList.add('valid');
            }
        }
    });

    /**
     * Show error message for a specific field
     */
    function showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    /**
     * Clear specific error message
     */
    function clearError(errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }

    /**
     * Clear all error messages
     */
    function clearErrors() {
        clearError(emailError);
        clearError(passwordError);
        emailInput.classList.remove('invalid', 'valid');
        passwordInput.classList.remove('invalid', 'valid');
    }

    /**
     * Show authentication message
     */
    function showMessage(message, type) {
        authMessage.textContent = message;
        authMessage.className = 'auth-message ' + type;
    }

    /**
     * Hide authentication message
     */
    function hideMessage() {
        authMessage.textContent = '';
        authMessage.className = 'auth-message';
    }

    /**
     * Set loading state for the form
     */
    function setLoadingState(isLoading) {
        if (isLoading) {
            loginButton.disabled = true;
            buttonText.textContent = 'Logging in...';
            loadingSpinner.classList.remove('hidden');
            emailInput.disabled = true;
            passwordInput.disabled = true;
        } else {
            loginButton.disabled = false;
            buttonText.textContent = 'Login';
            loadingSpinner.classList.add('hidden');
            emailInput.disabled = false;
            passwordInput.disabled = false;
        }
    }

    /**
     * Redirect to main application
     */
    function redirectToApp() {
        // Get the token for WebSocket authentication
        const token = FirebaseAuthModule.getIdToken();
        const userId = sessionStorage.getItem('userId');

        if (token && userId) {
            // Store authentication info for the main app
            sessionStorage.setItem('authenticated', 'true');

            // Redirect to main app
            window.location.href = '/';
        } else {
            showMessage('Authentication failed. Please try again.', 'error');
            FirebaseAuthModule.signOut();
        }
    }

    /**
     * Handle Enter key press for better UX
     */
    emailInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !passwordInput.value) {
            e.preventDefault();
            passwordInput.focus();
        }
    });

    // Auto-focus email field on page load
    emailInput.focus();
});