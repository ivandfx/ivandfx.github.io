console.log('Script loader.js iniciado');

window.addEventListener('popstate', () => {
  fetch(location.href)
    .then(res => res.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newContent = doc.querySelector('#content').innerHTML;
      document.querySelector('#content').innerHTML = newContent;
    });
});


document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded disparado');

  fetch('/posts/share.html')
    .then(res => {
      console.log('Respuesta fetch:', res.status);
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return res.text();
    })
    .then(html => {
      console.log('HTML recibido:', html.slice(0, 100));
      document.getElementById('share-buttons-container').innerHTML = html;
    })
    .catch(err => console.error('Error al cargar share.html:', err));
});

// load topnav
fetch('/topnav.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('topnav-container').innerHTML = html;

    // Dropdown listeners
    document.querySelectorAll('.dropdown').forEach(el => {
      const targetId = el.getAttribute('data-target');
      el.addEventListener('click', (e) => toggleDropdown(e, el, targetId));
    });

    document.addEventListener('DOMContentLoaded', () => {
      const banner = document.querySelector('.promo-banner, .msg-banner, .issue-banner');
      if (banner) {
        document.body.classList.add('has-banner');
      }
    });

    const htmlElement = document.documentElement;

    function updateModeToggleIcons(isLight) {
      document.querySelectorAll('.mode-toggle').forEach(btn => {
        btn.innerHTML = isLight
          ? '<i class="fas fa-sun"></i>'
          : '<i class="fas fa-moon"></i>';
      });
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      htmlElement.classList.add('light-mode');
      updateModeToggleIcons(true);
    } else {
      updateModeToggleIcons(false);
    }

    document.querySelectorAll('.mode-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        htmlElement.classList.toggle('light-mode');
        const isLight = htmlElement.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        updateModeToggleIcons(isLight);
      });
    });
  });

  function toggleSocialDesktop(btn) {
    const area = btn.closest('.social-area.desktop');
    const isOpen = area.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', isOpen);
    
    // Ajustar posición de los enlaces del topnav cuando se abren/cierran los iconos sociales
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      if (isOpen) {
        navLinks.classList.add('socials-open');
      } else {
        navLinks.classList.remove('socials-open');
      }
    }
  }

// toggle main nav menu
function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  const footer = document.getElementById("dynamic-footer");

  navLinks.classList.toggle("active");

  if (window.innerWidth <= 768) {
    const isOpen = navLinks.classList.contains("active");

    if (isOpen) {
      if (footer && !navLinks.contains(footer)) {
        navLinks.insertBefore(footer, navLinks.firstChild);
        footer.classList.remove("hidden-mobile");
      }
    } else {
      if (footer && document.body.contains(footer)) {
        document.body.appendChild(footer);
        footer.classList.add("hidden-mobile");
      }
    }
  }
}

// show/hide dropdowns with anims
function toggleDropdown(event, el, dropdownId) {
  event.preventDefault();
  const menu = document.getElementById(dropdownId);
  const isVisible = menu.classList.contains('show');

  // Reset all dropdowns and arrows
  document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
  document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));

  if (!isVisible) {
    if (menu.innerHTML.trim() === '') {
      menu.innerHTML = '<span style="color: white; font-size: 0.9rem;">No content ...</span>';
    }
    menu.classList.add('show');
    el.classList.add('active');
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

loadComponent("sidebar-container", "/sidebar.html");

const footerHTML = `
  <footer id="dynamic-footer" class="hidden-mobile" style="
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #00000065;
    color: #fff;
    padding: 2px 6px 3px;
    border-radius: 8px;
    backdrop-filter: blur(10px);
    border: 1px solid #ffffff1e;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    font-size: 0.9rem;
    z-index: 5;">
    <span style="line-height:0; vertical-align:middle;">©</span> 2025 IVANDFX
  </footer>`;

document.body.insertAdjacentHTML('beforeend', footerHTML);



fetch('/blog/posts.json')
  .then(res => res.json())
  .then(async urls => {
    const container = document.getElementById("post-list");

    const posts = await Promise.all(
      urls.map(async url => {
        const res = await fetch(url);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const h1 = doc.querySelector("h1");
        const dateMeta = doc.querySelector('meta[name="date"]');
        const dateStr = dateMeta ? dateMeta.content : null;

        return {
          url,
          title: h1 ? h1.textContent.trim() : "Sin título",
          dateStr
        };
      })
    );

    posts.forEach((post, index) => {
      const a = document.createElement("a");
      a.href = post.url;
      a.className = "post-link";
      a.innerHTML = `<i class="fa-solid fa-file-lines"></i> ${post.dateStr || "Sin fecha"} - ${post.title}`;
      container.appendChild(a);

      if (index < posts.length - 1) {
        const separator = document.createElement("div");
        separator.className = "posts-separator";
        container.appendChild(separator);
      }
    });

    if (posts.length > 0 && posts[0].dateStr) {
      const [dd, mm, yyyy] = posts[0].dateStr.split('-').map(Number);
      const postDate = new Date(yyyy, mm - 1, dd);
      const now = new Date();
      const diffMs = now - postDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays > 7) {
        document.querySelectorAll('.blog-alert').forEach(el => {
          el.style.setProperty('--post-notif', 'transparent');
        });
      }
    }
  });

const metaSubtitle = document.querySelector('meta[name="post-subtitle"]');
const postSubtitle = metaSubtitle ? metaSubtitle.content.trim() : '';
const shareText = postSubtitle;
const currentURL = encodeURIComponent(
  window.location.href.replace(/^http:\/\//i, 'https://')
);

function handleTwitterShare(event) {
  event.preventDefault();

  const twitterUrl = `https://x.com/intent/tweet?url=${currentURL}&text=${encodeURIComponent(shareText)}`;
  window.open(twitterUrl, '_blank');
}

function handleBlueskyShare(e) {
  e.preventDefault();

  const text = `${shareText} ${decodeURIComponent(currentURL)}`;

  navigator.clipboard.writeText(text).then(() => {
    const confirmation = document.createElement("div");
    confirmation.textContent = "✔ Enlace copiado. Abriendo Bluesky...";
    confirmation.style.position = "fixed";
    confirmation.style.background = "#222";
    confirmation.style.color = "#fff";
    confirmation.style.padding = "10px 14px";
    confirmation.style.borderRadius = "8px";
    confirmation.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
    confirmation.style.zIndex = "9999";
    confirmation.style.fontSize = "0.9rem";
    confirmation.style.opacity = "0";
    confirmation.style.transition = "opacity 0.3s ease";

    if (window.innerWidth <= 768) {
      confirmation.style.top = "20px";
      confirmation.style.left = "50%";
      confirmation.style.transform = "translateX(-50%)";
    } else {
      confirmation.style.bottom = "20px";
      confirmation.style.right = "20px";
    }

    document.body.appendChild(confirmation);
    requestAnimationFrame(() => {
      confirmation.style.opacity = "1";
    });

    setTimeout(() => {
      window.open("https://bsky.app/", "_blank");
      confirmation.style.opacity = "0";
      setTimeout(() => confirmation.remove(), 500);
    }, 2000);
  }).catch(() => {
    alert("No se pudo copiar el enlace. Hazlo manualmente.");
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('/posts/share.html')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.text();
    })
    .then(html => {
      const container = document.getElementById('share-buttons-container');
      if (container) container.innerHTML = html;

      const twitterBtn = document.getElementById('share-twitter');
      if (twitterBtn) {
        twitterBtn.addEventListener('click', handleTwitterShare);
      }

      const blueskyBtn = document.getElementById('share-bluesky');
      if (blueskyBtn) {
        blueskyBtn.addEventListener('click', handleBlueskyShare);

        fetch('/img/social/bluesky-brands.png')
          .then(res => res.text())
          .then(svgText => {
            const iconContainer = blueskyBtn.querySelector('.icon-container');
            if (iconContainer) iconContainer.innerHTML = svgText;
          });
      }
    })
    .catch(err => console.error('Error al cargar share.html:', err));
});

// ruffle
(function () {
  var ruffleScript = document.createElement("script");
  ruffleScript.src = "https://unpkg.com/@ruffle-rs/ruffle";
  ruffleScript.async = true;
  document.head.appendChild(ruffleScript);

  ruffleScript.onload = () => {
    console.log("loaded from loader.js");
  };
})();

// cookies
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("cookiesAccepted") !== "true") {
    const overlay = document.createElement("div");
    overlay.id = "cookie-overlay";
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(5px);
      z-index: 9998;
      pointer-events: all;
    `;

    // banner
    const cookieBanner = document.createElement("div");
    cookieBanner.id = "cookie-banner";
    cookieBanner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 95%;
      max-width: 800px;
      background: var(--sidebar-bg);
      color: var(--text-color);
      padding: 16px 20px;
      border-radius: 20px 20px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      font-size: 1rem;
      font-family: 'Gabarito', sans-serif;
      z-index: 9999;
      border: 2px solid #ffffff1e;
      border-bottom: none;
      backdrop-filter: blur(10px);
      box-shadow: 0 -4px 12px rgba(0,0,0,0.4);
    `;

const text = document.createElement("span");
text.innerHTML = `Este sitio usa cookies para mejorar tu experiencia.<br>
<a href="/cookies.html" target="_blank" style="color: var(--link-hover); font-weight: 600; text-decoration: none; cursor: pointer;"
   onmouseenter="this.style.color='#409292'" 
   onmouseleave="this.style.color='var(--link-hover)'" >
   Ver política de cookies
</a>`;


    const btnContainer = document.createElement("div");
    btnContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;

    const baseBtnStyle = `
      padding: 8px 20px;
      border: 2px solid #ffffff1e;
      border-radius: 12px;
      font-weight: 700;
      font-family: 'Gabarito', sans-serif;
      transition: background-color 0.3s ease, color 0.3s ease;
      cursor: pointer;
    `;

    const btnYes = document.createElement("button");
    btnYes.textContent = "Aceptar";
    btnYes.style.cssText = baseBtnStyle + `
      background-color: var(--link-hover);
      color: var(--bg-color);
    `;
    btnYes.onmouseenter = () => { btnYes.style.backgroundColor = "#409292"; btnYes.style.color = "var(--text-color)"; };
    btnYes.onmouseleave = () => { btnYes.style.backgroundColor = "var(--link-hover)"; btnYes.style.color = "var(--bg-color)"; };
    btnYes.onclick = () => {
      localStorage.setItem("cookiesAccepted", "true");
      cookieBanner.remove();
      overlay.remove();
    };

    const btnNo = document.createElement("button");
    btnNo.textContent = "Rechazar";
    btnNo.style.cssText = baseBtnStyle + `
      background-color: #bb5151;
      color: var(--text-color);
    `;
    btnNo.onmouseenter = () => { btnNo.style.backgroundColor = "#853838ff"; btnNo.style.color = "#fff"; };
    btnNo.onmouseleave = () => { btnNo.style.backgroundColor = "#bb5151"; btnNo.style.color = "var(--text-color)"; };
btnNo.onclick = () => {
  localStorage.setItem("cookiesAccepted", "false");
  cookieBanner.remove();
  overlay.remove();
};

    btnContainer.appendChild(btnYes);
    btnContainer.appendChild(btnNo);

    cookieBanner.appendChild(text);
    cookieBanner.appendChild(btnContainer);

    document.body.appendChild(overlay);
    document.body.appendChild(cookieBanner);
  }
});

function showLightModeMessage() {
  const overlay = document.createElement("div");
  overlay.id = "light-mode-overlay";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(5px);
    z-index: 9998;
    pointer-events: all;
  `;

  const messageBox = document.createElement("div");
  messageBox.id = "light-mode-message";
  messageBox.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 500px;
    background: linear-gradient(135deg, var(--bg-color) 0%, rgba(26, 26, 26, 0.95) 100%);
    color: var(--text-color);
    padding: 30px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    font-size: 1.1rem;
    font-family: 'Gabarito', sans-serif;
    z-index: 9999;
    border: 2px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    text-align: center;
  `;

  const icon = document.createElement("div");
  icon.innerHTML = '<i class="fas fa-sun" style="font-size: 3rem; color: var(--link-hover); margin-bottom: 10px;"></i>';
  
  const title = document.createElement("h3");
  title.textContent = "MODO CLARO";
  title.style.cssText = `
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
  `;

  const message = document.createElement("p");
  message.textContent = "No disponible en esta versión de la web temporalmente.";
  message.style.cssText = `
    margin: 0;
    line-height: 1.5;
    color: var(--text-color);
  `;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Entendido";
  closeBtn.style.cssText = `
    padding: 12px 24px;
    background: linear-gradient(135deg, var(--link-hover) 0%, #64d8d8 100%);
    color: var(--bg-color);
    border: none;
    border-radius: 12px;
    font-weight: 700;
    font-family: 'Gabarito', sans-serif;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(100, 216, 216, 0.3);
  `;

  closeBtn.onmouseenter = () => {
    closeBtn.style.background = "linear-gradient(135deg, #64d8d8 0%, #409292 100%)";
    closeBtn.style.transform = "translateY(-2px)";
    closeBtn.style.boxShadow = "0 6px 20px rgba(100, 216, 216, 0.4)";
  };
  
  closeBtn.onmouseleave = () => {
    closeBtn.style.background = "linear-gradient(135deg, var(--link-hover) 0%, #64d8d8 100%)";
    closeBtn.style.transform = "translateY(0)";
    closeBtn.style.boxShadow = "0 4px 16px rgba(100, 216, 216, 0.3)";
  };

  closeBtn.onclick = () => {
    overlay.remove();
    messageBox.remove();
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      messageBox.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  overlay.onclick = () => {
    overlay.remove();
    messageBox.remove();
    document.removeEventListener('keydown', handleEscape);
  };

  messageBox.appendChild(icon);
  messageBox.appendChild(title);
  messageBox.appendChild(message);
  messageBox.appendChild(closeBtn);

  document.body.appendChild(overlay);
  document.body.appendChild(messageBox);

  messageBox.style.opacity = "0";
  messageBox.style.transform = "translate(-50%, -50%) scale(0.9)";
  messageBox.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  
  requestAnimationFrame(() => {
    messageBox.style.opacity = "1";
    messageBox.style.transform = "translate(-50%, -50%) scale(1)";
  });
}
