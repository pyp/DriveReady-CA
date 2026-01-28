document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('form');
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

    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const firstName = document.getElementById('first_name').value.trim();
        const lastName = document.getElementById('last_name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirm_password').value.trim();
        const termsAccepted = document.getElementById('terms').checked;
        const hCaptchaAnswer = document.getElementById('hCaptchaAnswer').value;

        if (!hCaptchaAnswer) {
            showWarning("Please complete the captcha!");
            return;
        }

        if (password !== confirmPassword) {
            showWarning("Passwords do not match!");
            return;
        }

        if (!termsAccepted) {
            showWarning("You must accept the terms of service!");
            return;
        }

        const requestBody = {
            firstName,
            lastName,
            email,
            password,
            hCaptchaAnswer
        };

        try {
            const response = await fetch('https://driveready.org/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                registerForm.innerHTML = `
                    <div class="text-center">
                        <p class="text-sm text-secondary">A confirmation email has been sent to your email address. Please check your email to complete the registration process.</p>
                        <button id="resendButton" class="btn btn-card">Resend Email</button>
                    </div>
                `;

                const resendButton = document.querySelector("#resendButton");
                resendButton.addEventListener("click", async function(event) {
                    event.preventDefault();
                    await resendEmail({email});
                });
            } else {
                const errorData = await response.json();
                showWarning("Error: " + (errorData.error || "An error occurred during registration."));
            }
        } catch (error) {
            console.error("Error:", error);
            showWarning("Error: " + error.message);
        }
    });

    async function resendEmail(requestBody) {
        try {
            const response = await fetch('https://driveready.org/api/resend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                showWarning("Confirmation email resent successfully!");
            } else {
                const errorData = await response.json();
                showWarning("Error: " + (errorData.error || "An error occurred while resending the email."));
            }
        } catch (error) {
            console.error("Error:", error);
            showWarning("Error: " + error.message);
        }
    }

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
});
