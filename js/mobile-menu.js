// Mobile Menu Toggle Script
document.addEventListener('DOMContentLoaded', function() {
  // Create menu toggle button
  const menuToggle = document.createElement('button');
  menuToggle.className = 'menu-toggle';
  menuToggle.innerHTML = '<span></span><span></span><span></span>';
  menuToggle.setAttribute('aria-label', 'Abrir menú');
  document.body.appendChild(menuToggle);

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  // Get sidebar
  const sidebar = document.querySelector('.sidebar');
  const navLinks = document.querySelectorAll('.nav a');

  // Toggle menu function
  function toggleMenu() {
    menuToggle.classList.toggle('active');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Update aria-label
    if (sidebar.classList.contains('active')) {
      menuToggle.setAttribute('aria-label', 'Cerrar menú');
    } else {
      menuToggle.setAttribute('aria-label', 'Abrir menú');
    }
  }

  // Close menu function
  function closeMenu() {
    menuToggle.classList.remove('active');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
  }

  // Event listeners
  menuToggle.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  //Cerra menu cuando hacen click (mobile)
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 1024) {
        closeMenu();
      }
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      closeMenu();
    }
  });

  // Handle window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 1024) {
      closeMenu();
    }
  });
});

