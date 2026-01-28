document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const warningElement = document.createElement('div');
    warningElement.className = 'warning';
    document.body.appendChild(warningElement);


    if (token) {
        fetch('https://driveready.org/api/verification?token=' + token, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.jwt) {
                localStorage.setItem('jwt', data.jwt);
                window.location.href = "/dashboard";
            } else {
                showWarning("Verification failed. Please try again later.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            showWarning("An error occurred during verification. Please try again later.");
        });
    } else {
        showWarning("Invalid verification link.");
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