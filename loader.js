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

function setFavicon(url) {
  let link = document.querySelector("link[rel='icon'], link[rel='shortcut icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
}

function updateFaviconByTheme() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (isDark) {
    setFavicon("/public/img/favicon/favicon-white.png");
  } else {
    setFavicon("/public/img/favicon/favicon-dark.png");
  }
}

updateFaviconByTheme();

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateFaviconByTheme);

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
    let footerContainer = document.getElementById('footer-container');
    if (!footerContainer) {
      footerContainer = document.createElement('div');
      footerContainer.id = 'footer-container';
      document.body.appendChild(footerContainer);
    }
    footerContainer.innerHTML = html;

    enableStickyFxPlayer();
  });

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
      background: #1a1a1a;
      color: var(--text-color);
      padding: 16px 20px;
      border-radius: 20px 20px 20px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      font-size: 1rem;
      z-index: 9999;
      border: 2px solid #ffffff1c;
    `;

const text = document.createElement("span");
text.innerHTML = `Este sitio usa cookies para mejorar tu experiencia.<br>
<a href="/info/cookies.html" target="_blank" style="color: var(--link-hover); font-weight: 300; text-decoration: none; cursor: pointer;"
   onmouseenter="this.style.color='#54a7c0ff'" 
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
      font-weight: 300;
      font-family: 'Gabarito', sans-serif;
      transition: background-color 0.3s ease, color 0.3s ease;
      cursor: pointer;
    `;

    const btnYes = document.createElement("button");
    btnYes.textContent = "Aceptar";
    btnYes.style.cssText = baseBtnStyle + `
      background-color: #2587a5;
      color: var(--text-color);
    `;
    btnYes.onmouseenter = () => { btnYes.style.backgroundColor = "#144c5e"; btnYes.style.color = "var(--text-color)"; };
    btnYes.onmouseleave = () => { btnYes.style.backgroundColor = "#2587a5"; btnYes.style.color = "var(--text-color)"; };
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
    btnNo.onmouseenter = () => { btnNo.style.backgroundColor = "#6e2727ff"; btnNo.style.color = "#fff"; };
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

(function initTabsRobust() {
  try {
    if (window.__ivandfxTabsInit) return;

    const mainRoot = () => document.querySelector('main') || document.body;
    let observer = null;
    let poll = null;

    function findAndInit() {
      try {
        const root = mainRoot();
        if (!root) return false;

        const tabs = Array.from(root.querySelectorAll('[data-tab]'));
        const contents = Array.from(root.querySelectorAll('.tab-content'));

        if (!tabs.length || !contents.length) return false;

        window.__ivandfxTabsInit = true;

        function activateTab(tabId, save = true) {
          tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
          contents.forEach(c => c.classList.toggle('active', c.id === tabId));

          if (save) localStorage.setItem('activeTab', tabId);
        }

        const saved = localStorage.getItem('activeTab') || (tabs[0] && tabs[0].dataset.tab);
        if (saved) activateTab(saved, false);

        tabs.forEach(t => {
          if (t.__ivandfxTabHandler) t.removeEventListener('click', t.__ivandfxTabHandler);
          const handler = () => activateTab(t.dataset.tab, true);
          t.addEventListener('click', handler);
          t.__ivandfxTabHandler = handler;
        });

        if (observer) { observer.disconnect(); observer = null; }
        if (poll) { clearInterval(poll); poll = null; }

        return true;
      } catch {
        return false;
      }
    }

    if (findAndInit()) return;

    const rootNode = mainRoot();
    if (rootNode) {
      observer = new MutationObserver(() => {
        if (findAndInit() && observer) {
          observer.disconnect();
          observer = null;
        }
      });
      observer.observe(rootNode, { childList: true, subtree: true });
    }

    poll = setInterval(() => {
      if (findAndInit()) {
        clearInterval(poll);
        poll = null;
      }
    }, 250);

    setTimeout(() => {
      if (!window.__ivandfxTabsInit) {
        if (observer) { observer.disconnect(); observer = null; }
        if (poll) { clearInterval(poll); poll = null; }
      }
    }, 10000);
  } catch {}
})();

function enableStickyFxPlayer(playerSelector = '.fx-player', wrapperSelector = '.fx-player-wrapper', footerSelector = '#footer-container') {
  const fxPlayer = document.querySelector(playerSelector);
  const wrapper = document.querySelector(wrapperSelector);
  const footer = document.querySelector(footerSelector);

  if (!fxPlayer || !wrapper) return;

  const placeholder = document.createElement('div');
  placeholder.style.height = `${fxPlayer.offsetHeight}px`;
  placeholder.style.display = 'none';
  wrapper.parentNode.insertBefore(placeholder, wrapper.nextSibling);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        fxPlayer.classList.add('fixed');
        placeholder.style.display = 'block';
        adjustPlayerPosition();
        window.addEventListener('scroll', adjustPlayerPosition);
        window.addEventListener('resize', adjustPlayerPosition);
      } else {
        fxPlayer.classList.remove('fixed');
        placeholder.style.display = 'none';
        fxPlayer.style.bottom = ''; // reset
        window.removeEventListener('scroll', adjustPlayerPosition);
        window.removeEventListener('resize', adjustPlayerPosition);
      }
    });
  }, { threshold: 0 });

  observer.observe(wrapper);

function adjustPlayerPosition() {
  if (!footer || !fxPlayer.classList.contains('fixed')) return;

  const footerRect = footer.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  const overlap = viewportHeight - footerRect.top;

  if (overlap > 0) {
    fxPlayer.style.bottom = `${overlap}px`;
  } else {
    fxPlayer.style.bottom = '0px';
  }
}
}

document.addEventListener('DOMContentLoaded', () => {
  enableStickyFxPlayer();
});

function startSnow(tilt = 0.5) {
    const count = 30;
    const flakes = [];
    const w = window.innerWidth;
    const h = window.innerHeight;

    const wrapper = document.createElement("div");
    wrapper.style.pointerEvents = "none";
    wrapper.style.position = "fixed";
    wrapper.style.top = "0"; //remember to change this value to 0 for snow (and 1 when it ends). For Ctrl+F: Navidad :)
    wrapper.style.left = "0";
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";
    wrapper.style.overflow = "hidden";
    wrapper.style.zIndex = "-1";
    document.body.appendChild(wrapper);

    for (let i = 0; i < count; i++) {
        const f = document.createElement("div");
        f.textContent = "❄";
        f.style.position = "absolute";
        f.style.fontSize = (Math.random() * 10 + 8) + "px";
        f.style.opacity = Math.random();
        f.x = Math.random() * w;
        f.y = Math.random() * h;
        f.speed = Math.random() * 0.7 + 0.5;
        wrapper.appendChild(f);
        flakes.push(f);
    }

    function animate() {
        for (const f of flakes) {
            f.y += f.speed;
            f.x += tilt;
            if (f.y > h) f.y = -10;
            if (f.x > w) f.x = 0;
            f.style.transform = `translate(${f.x}px, ${f.y}px)`;
        }
        requestAnimationFrame(animate);
    }

    animate();
}

document.addEventListener('DOMContentLoaded', () => {
    startSnow();
});