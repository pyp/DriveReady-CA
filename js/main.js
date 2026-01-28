document.addEventListener('DOMContentLoaded', () => {
  const faqMenuItems = document.querySelectorAll('.faq-menu li');
  const faqContents = document.querySelectorAll('.faq-content');

  faqContents.forEach(content => {
    content.style.transition = 'opacity 0.3s ease-in-out';
  });

  faqMenuItems.forEach(menuItem => {
    menuItem.addEventListener('click', () => {
      const selectedGroup = menuItem.dataset.group;
      faqMenuItems.forEach(item => item.classList.remove('active'));

      menuItem.classList.add('active');

      faqContents.forEach(group => {
        group.style.opacity = '0';
        group.classList.remove('active');
      });

      faqContents.forEach(group => {
        if (group.dataset.group === selectedGroup || selectedGroup === 'all') {
          group.classList.add('active');
          setTimeout(() => {
            group.style.opacity = '1';
          }, 50); 
        }
      });
    });
  });

  const faqGroupHeaders = document.querySelectorAll('.faq-group-header');

  faqGroupHeaders.forEach(groupHeader => {
    groupHeader.addEventListener('click', () => {
      const group = groupHeader.parentElement;
      const groupBody = group.querySelector('.faq-group-body');
      const icon = groupHeader.querySelector('i');

      icon.classList.toggle('fa-plus');
      icon.classList.toggle('fa-minus');

      groupBody.classList.toggle('open');

      if (groupBody.classList.contains('open')) {
        groupBody.style.maxHeight = groupBody.scrollHeight + 'px';
      } else {
        groupBody.style.maxHeight = '0';
      }
    });
  });

  const hamburgerButton = document.querySelector('.hamburger-button');
  const mobileMenu = document.querySelector('.mobile-menu');

  hamburgerButton.addEventListener('click', () => mobileMenu.classList.toggle('active'));
});
