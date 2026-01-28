document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const warningElement = document.createElement('div');
    warningElement.className = 'warning';
    document.body.appendChild(warningElement);

    window.onCaptchaSolved = function(token) {
        document.getElementById('hCaptchaAnswer').value = token;
    };

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const emailInput = document.querySelector("#email");
        const email = emailInput.value;
        const hCaptchaAnswer = document.getElementById('hCaptchaAnswer').value;

        if (!hCaptchaAnswer) {
            showWarning("Please complete the captcha!");
            return;
        }

        if (email) {
            fetch("https://driveready.org/api/forgot", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, hCaptchaAnswer }),
            })
            .then(async response => {
                if (response.ok) {
                    form.innerHTML = `
                        <div class="text-center">
                            <p class="text-sm text-secondary">A password reset link has been sent to your email address.</p>
                            <button id="resendButton" class="btn btn-card">Resend</button>
                        </div>
                    `;

                    const resendButton = document.querySelector("#resendButton");
                    resendButton.addEventListener("click", function(event) {
                        event.preventDefault();
                        window.location.href = "/forgot"; 
                    });
                } else {
                    const errorData = await response.json();
                    showWarning("Error: " + (errorData.error || "An error occurred while sending the reset link."));
                }
            })
            .catch(error => {
                showWarning("Error: " + error.message);
            });
        } else {
            showWarning("Please enter a valid email address.");
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
