/**
 * Quailworks - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Site initialization
  initNavigation();
  initContactForm();
});

/**
 * Initialize navigation functionality
 */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('.section');

  // Update active nav link on scroll
  if (sections.length > 0 && navLinks.length > 0) {
    window.addEventListener('scroll', () => {
      let current = '';

      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('nav__link--active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('nav__link--active');
        }
      });
    });
  }
}

/**
 * Initialize contact form functionality
 */
function initContactForm() {
  const form = document.querySelector('.contact__form');
  if (!form) return;

  const submitBtn = form.querySelector('.form__submit');
  const originalBtnText = submitBtn ? submitBtn.textContent : 'Send Message';

  form.addEventListener('submit', (e) => {
    // Prevent double submission
    if (submitBtn.disabled) {
      e.preventDefault();
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // Note: Form will submit normally to Formspree
    // This just provides visual feedback during submission
  });
}
