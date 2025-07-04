// load topnav
fetch('/topnav.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('topnav-container').innerHTML = html;

    // assign after loading topnav
    document.querySelectorAll('.dropdown').forEach(el => {
      const targetId = el.getAttribute('data-target');
      el.addEventListener('click', (e) => toggleDropdown(e, el, targetId));
    });
  });

// toggle main nav menu
function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  const footer = document.getElementById("dynamic-footer");

  navLinks.classList.toggle("active");

  // Solo en móvil
  if (window.innerWidth <= 768) {
    const isOpen = navLinks.classList.contains("active");

    if (isOpen) {
      // Insertar footer dentro del menú si no está ya ahí
      if (footer && !navLinks.contains(footer)) {
        navLinks.insertBefore(footer, navLinks.firstChild);
        footer.classList.remove("hidden-mobile"); // mostrarlo
      }
    } else {
      // Recolocar footer fuera y volver a ocultarlo
      if (footer && document.body.contains(footer)) {
        document.body.appendChild(footer);
        footer.classList.add("hidden-mobile"); // ocultarlo de nuevo
      }
    }
  }
}

// show/hide dropdowns with anims
function toggleDropdown(event, el, dropdownId) {
  event.preventDefault();
  const menu = document.getElementById(dropdownId);
  const isVisible = menu.classList.contains('show');

  document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));

  if (!isVisible) {
    if (menu.innerHTML.trim() === '') {
      menu.innerHTML = '<span style="color: white; font-size: 0.9rem;">No content ...</span>';
    }
    menu.classList.add('show');
  }
}

// close dropdowns when clicking outside
window.addEventListener('click', e => {
  if (!e.target.closest('.dropdown-wrapper')) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
  }
});

// load external sidebar
function loadComponent(id, url) {
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`Error al cargar ${url}`);
      return response.text();
    })
    .then(html => {
      document.getElementById(id).innerHTML = html;
    })
    .catch(error => console.error(error));
}

loadComponent("sidebar-container", "sidebar.html");

const footerHTML = `
<footer id="dynamic-footer" class="hidden-mobile" style="
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #8dcaca;
  color: black;
  padding: 4px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  font-size: 0.9rem;
  z-index: 9999;">
  © 2025 ivandfx
  </footer>`;

document.body.insertAdjacentHTML('beforeend', footerHTML);

// visibilidad de "desarrollo"
function checkDesarrolloVisibility() {
  const logo = document.querySelector(".logo");
  const desarrollo = document.getElementById("desarrollo");
  if (!logo || !desarrollo) return;

  const logoRect = logo.getBoundingClientRect();
  const containerRect = logo.parentElement.getBoundingClientRect();

  if (logoRect.right > containerRect.right - 120) {
    desarrollo.classList.add("hidden");
  } else {
    desarrollo.classList.remove("hidden");
  }
}

window.addEventListener('resize', checkDesarrolloVisibility);
window.addEventListener('load', checkDesarrolloVisibility);

// twitch chat toggle
function toggleChat() {
  const chat = document.querySelector('.twitch-chat');
  const player = document.querySelector('.twitch-player');
  chat.classList.toggle('hidden');
  player.classList.toggle('fullwidth', chat.classList.contains('hidden'));
}

function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.querySelector('.hamburger');
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('active');
}
