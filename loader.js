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

loadComponent("sidebar-container", "/sidebar.html");

const footerHTML = `
<footer id="dynamic-footer" class="hidden-mobile" style="
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #00000065;
  color: #fff;
  padding: 4px 10px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  font-size: 0.9rem;
  z-index: 5;">
  © 2025 ivandfx</footer>`;

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

    posts.forEach(post => {
      const a = document.createElement("a");
      a.href = post.url;
      a.className = "post-link";
      a.innerHTML = `<i class="fa-solid fa-file-lines"></i> ${post.dateStr || "Sin fecha"} - ${post.title}`;
      container.appendChild(a);
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

const postTitleElement = document.querySelector('h1');
const postTitle = postTitleElement ? postTitleElement.textContent.trim() : '';
const shareText = `Lee este post de IVANDFX: ${postTitle}`;
const currentURL = encodeURIComponent(
  window.location.href.replace(/^http:\/\//i, 'https://')
);

function handleTwitterShare(event) {
  event.preventDefault();

  const twitterUrl = `https://twitter.com/intent/tweet?url=${currentURL}&text=${encodeURIComponent(shareText)}`;
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