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

// load topnav
fetch('/webft/topnav.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('topnav-container').innerHTML = html;

let lastScroll = 0;
const nav = document.querySelector(".topnav");
const banners = document.querySelectorAll(".promo-banner, .msg-banner, .issue-banner, .click-banner");

window.addEventListener("scroll", () => {
  if (window.innerWidth < 1400) {
    nav.classList.remove("scroll-up", "scroll-down", "clear");
    banners.forEach(b => b.classList.remove("scroll-up", "scroll-down"));
    return;
  }

  const currentScroll = window.scrollY;

  if (currentScroll > lastScroll && currentScroll > 200) {
    nav.classList.add("scroll-down", "clear");
    nav.classList.remove("scroll-up");
    banners.forEach(b => {
      b.classList.add("scroll-down");
      b.classList.remove("scroll-up");
    });
  } else {
    nav.classList.add("scroll-up");
    nav.classList.remove("scroll-down", "clear");
    banners.forEach(b => {
      b.classList.add("scroll-up");
      b.classList.remove("scroll-down");
    });
  }

  lastScroll = currentScroll;
});

// load footer
fetch('/webft/footer.html')
  .then(res => res.text())
  .then(html => {
    // create container
    let footerContainer = document.getElementById('footer-container');
    if (!footerContainer) {
      footerContainer = document.createElement('div');
      footerContainer.id = 'footer-container';
      document.body.appendChild(footerContainer);
    }

    footerContainer.innerHTML = html;
  })

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

    
  });

  function toggleSocialDesktop(btn) {
    const area = btn.closest('.social-area.desktop');
    const isOpen = area.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', isOpen);
    
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
const decodedURL = decodeURIComponent(currentURL);

function getUnifiedShareText() {
  return `${shareText}\n${decodedURL}`.trim();
}

function handleTwitterShare(event) {
  event.preventDefault();

  const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(getUnifiedShareText())}`;
  window.open(twitterUrl, '_blank');
}

function handleBlueskyShare(e) {
  e.preventDefault();
  const intent = `https://bsky.app/intent/compose?text=${encodeURIComponent(getUnifiedShareText())}`;
  window.open(intent, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('/blog/share.html')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.text();
    })
    .then(html => {
      const container = document.getElementById('share-buttons-container');
      if (container) container.innerHTML = html;
    })
    .catch(err => console.error('Error al cargar share.html:', err));
});

(function () {
  var ruffleScript = document.createElement("script");
  ruffleScript.src = "https://unpkg.com/@ruffle-rs/ruffle";
  ruffleScript.async = true;
  document.head.appendChild(ruffleScript);

  ruffleScript.onload = () => {
    console.log("loaded from loader.js");
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("cookiesAccepted") !== "true") {
    const overlay = document.createElement("div");
    overlay.id = "cookie-overlay";
    overlay.style.cssText = `
      position: fixed;
      z-index: 9998;
      pointer-events: all;
      backdrop-filter: blur(20px);
    `;

    const cookieBanner = document.createElement("div");
    cookieBanner.id = "cookie-banner";
    cookieBanner.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      max-width: 600px;
      background: #1a1a1a80;
      color: var(--text-color);
      padding: 16px 20px;
      border-radius: 20px 20px 20px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      font-size: 1rem;
      z-index: 9999;
      backdrop-filter: blur(20px);
      border: 2px solid #ffffff1c;
    `;

const text = document.createElement("span");
text.innerHTML = `Este sitio usa cookies para mejorar tu experiencia.<br>
<a href="/info/cookies.html" target="_blank" style="color: var(--link-hover); font-weight: 600; text-decoration: none; cursor: pointer;"
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

 
