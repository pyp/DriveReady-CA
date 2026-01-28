document.addEventListener('DOMContentLoaded', function() {
    const readMoreButtons = document.querySelectorAll('.btn-read-more');

    readMoreButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const post = button.closest('.blog-post');
            const shortText = post.querySelector('.short-text');
            const fullText = post.querySelector('.full-text');

            if (!fullText.classList.contains('show')) {
                const fullTextHeight = fullText.scrollHeight;
                fullText.style.maxHeight = `${fullTextHeight}px`;
                fullText.classList.add('show');
                button.textContent = 'Read Less';
            } else {
                fullText.style.maxHeight = '0';
                fullText.classList.remove('show');
                button.textContent = 'Read More';
            }
        });
    });
});
