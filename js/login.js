document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    const warningElement = document.createElement('div');
    warningElement.className = 'warning';
    document.body.appendChild(warningElement);

    if (localStorage.getItem('jwt') != null) {
        try {
            const response = fetch("https://driveready.org/api/jwt", {
                method: 'GET', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('jwt')
                }
            });
            
            if (response.error == null) { 
                window.location.href = "/dashboard"; 
                return
            } else [
                localStorage.removeItem('jwt')
            ]
        } catch (error) {
            console.error('Error validating JWT token:', error);
        }
    }


    window.onCaptchaSolved = function(token) {
        document.getElementById('hCaptchaAnswer').value = token;
    };

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const hCaptchaAnswer = document.getElementById('hCaptchaAnswer').value;

        if (!hCaptchaAnswer) {
            showWarning("Please complete the captcha!");
            return;
        }

        if (!email || !password) {
            showWarning("Email and password are required!");
            return;
        }

        const requestBody = {
            email,
            password,
            hCaptchaAnswer
        };

        try {
            const response = await fetch('https://driveready.org/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('jwt', data.jwt);
                showWarning("Login successful!");
                setTimeout(() => {
                    window.location.href = "/dashboard"; 
                }, 2000);
            } else {
                const errorData = await response.json();
                showWarning("Error: " + (errorData.error || "An error occurred during login."));
                // Refresh captcha on error
                refreshCaptcha();
            }
        } catch (error) {
            showWarning("Error: " + error.message);
            // Refresh captcha on error
            refreshCaptcha();
        }
    });

    function showWarning(message) {
        warningElement.textContent = message;
        warningElement.style.backgroundColor = 'white';
        warningElement.style.color = 'black';
        warningElement.style.opacity = 1;
        warningElement.style.visibility = 'visible';

        warningElement.classList.remove('slide');
        void warningElement.offsetWidth;
        warningElement.classList.add('slide');

        setTimeout(() => {
            warningElement.style.opacity = 0;
            warningElement.style.visibility = 'hidden';
        }, 3000);
    }

    function refreshCaptcha() {
        // Clear the captcha answer
        document.getElementById('hCaptchaAnswer').value = '';
        
        // Reset the hCaptcha widget
        if (window.hcaptcha) {
            const captchaElement = document.querySelector('[data-sitekey]');
            if (captchaElement) {
                const widgetId = captchaElement.getAttribute('data-hcaptcha-widget-id');
                if (widgetId) {
                    window.hcaptcha.reset(widgetId);
                }
            }
        }
    }
});
