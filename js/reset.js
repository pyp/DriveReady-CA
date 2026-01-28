document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const warningElement = document.createElement('div');
    warningElement.className = 'warning';
    document.body.appendChild(warningElement);

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        showWarning("Invalid or missing token.");
        return;
    }

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const passwordInput = document.querySelector("#password");
        const confirmPasswordInput = document.querySelector("#confirm_password");
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
            showWarning("Passwords do not match!");
            return;
        }

        if (password && token) {
            fetch("https://driveready.org/api/reset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password, token }),
            })
            .then(async response => {
                if (response.ok) {
                    form.innerHTML = `
                        <div class="text-center">
                            <h2 style="font-weight: 500;">Password Reset Successful</h2>
                            <p class="text-sm text-secondary">Your password has been successfully reset. You can now login with your new password.</p>
                            <br> 
                            <a href="/login" class="btn btn-card">Go to Login</a>
                        </div>
                    `;
                } else {
                    const errorData = await response.json();
                    showWarning("Error: " + (errorData.error || "An error occurred while resetting the password."));
                }
            })
            .catch(error => {
                showWarning("Error: " + error.message);
            });
        } else {
            showWarning("Please enter a valid password.");
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
});
