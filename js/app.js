/**
 * Prakarti Report — NGO Environmental Intelligence & Action Platform
 * js/app.js — Shared Application Shell & Navigation Controller
 *
 * Responsibilities:
 * - Injects shared persistent Sidebar & Topbar across application pages
 * - Active route / link detection by filename
 * - Mobile drawer & sidebar toggle behavior
 * - Global instant search across environmental reports (ID, category, location, severity)
 * - Notification dropdown & dismiss behavior
 * - Shared modal / settings handler
 */

(function () {
  'use strict';

  // Navigation Items per specifications:
  // Dashboard, Reports, Environmental Map, Analytics, Hotspots, Teams & Specialists, Proposals, Impact, Divider, Settings
  const NAV_ITEMS = [
    { label: 'Dashboard', href: 'dashboard.html', icon: 'layout-dashboard' },
    { label: 'Reports', href: 'reports.html', icon: 'file-search' },
    { label: 'Environmental Map', href: 'map.html', icon: 'map' },
    { label: 'Analytics', href: 'analytics.html', icon: 'bar-chart-3' },
    { label: 'Hotspots', href: 'hotspots.html', icon: 'map-pin' },
    { label: 'Teams & Specialists', href: 'organizations.html', icon: 'users' },
    { label: 'Proposals', href: 'proposal.html', icon: 'file-text' },
    { label: 'Impact', href: 'impact.html', icon: 'shield-check' }
  ];

  // Notification Feed (Strictly using responsible AI framing)
  const NOTIFICATIONS = [
    {
      id: 'NOTIF-1',
      title: 'AI-detected suspected issue in Greater Noida',
      meta: 'Plume reported',
      unread: true,
      link: 'reports.html'
    },
    {
      id: 'NOTIF-2',
      title: 'Tree cutting reported',
      meta: 'Field inspection pending',
      unread: true,
      link: 'reports.html'
    }
  ];

  function getCurrentFilename() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    return filename.split('?')[0];
  }

  function renderSidebar(currentFile) {
    const navLinksHtml = NAV_ITEMS.map(item => {
      const isActive = currentFile === item.href;

      return `
        <a href="${item.href}" class="nav-link ${isActive ? 'active' : ''}" data-nav="${item.label}">
          <i data-lucide="${item.icon}"></i>
          <span>${item.label}</span>
        </a>
      `;
    }).join('');

    return `
      <div class="sidebar-header">
        <a href="dashboard.html" class="brand-wrapper">
          <div class="brand-badge">PR</div>
          <div class="brand-meta">
            <span class="brand-title">PRAKARTI REPORT</span>
            <span class="brand-sub">Platform Intelligence</span>
          </div>
        </a>
        <button id="sidebarCloseBtn" class="sidebar-close-btn" aria-label="Close Navigation">
          <i data-lucide="x"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <span class="nav-label">Intelligence &amp; Action</span>
        ${navLinksHtml}
        
        <div class="nav-divider"></div>
        
        <a href="settings.html" class="nav-link ${currentFile === 'settings.html' ? 'active' : ''}">
          <i data-lucide="settings"></i>
          <span>Settings</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div>
          <strong style="color:var(--c-text-primary);">NCR Sector Ops</strong>
          <div style="font-size:11px; margin-top:2px;">Platform Officer</div>
        </div>
        <a href="index.html" id="sidebarSignOutBtn" title="Sign Out" style="color:var(--c-text-secondary); display:flex; align-items:center;">
          <i data-lucide="log-out" style="width:16px; height:16px;"></i>
        </a>
      </div>
    `;
  }

  function renderTopbar() {
    const notifItemsHtml = NOTIFICATIONS.length > 0 ? NOTIFICATIONS.map(n => `
      <a href="${n.link}" class="notification-item" style="text-decoration:none; display:block;">
        <div class="notification-title" style="display:flex; justify-content:space-between;">
          <span>${n.title}</span>
          ${n.unread ? '<span style="display:inline-block; width:6px; height:6px; background:var(--c-primary); border-radius:50%;"></span>' : ''}
        </div>
        <div class="notification-time">${n.meta}</div>
      </a>
    `).join('') : `
      <div class="empty-state" style="padding:var(--space-6) var(--space-4); border:none; margin:0;">
        <div class="empty-state-icon" style="width:36px; height:36px; margin-bottom:var(--space-2);">
          <i data-lucide="bell-off"></i>
        </div>
        <div class="empty-state-title" style="font-size:var(--text-xs);">No notifications</div>
        <div class="empty-state-desc" style="font-size:11px;">All regional environmental alerts have been reviewed.</div>
      </div>
    `;

    return `
      <div class="topbar-left">
        <button id="mobileMenuBtn" class="mobile-menu-btn" aria-label="Open Navigation">
          <i data-lucide="menu"></i>
        </button>
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="topbar-platform-title">Prakarti Report</span>
          </div>
          <span class="topbar-platform-sub">Environmental Intelligence &amp; Action</span>
        </div>
      </div>

      <div class="topbar-right">
        <!-- Global Search Input -->
        <div class="topbar-search">
          <i data-lucide="search" class="topbar-search-icon"></i>
          <input 
            type="text" 
            id="globalSearchInput" 
            class="topbar-search-input" 
            placeholder="Search reports..."
            autocomplete="off"
          />
          <div id="searchResultsDropdown" class="search-results-dropdown"></div>
        </div>

        <!-- Notifications Bell -->
        <div class="notifications-wrapper">
          <button id="notifBellBtn" class="topbar-icon-btn" aria-label="View notifications">
            <i data-lucide="bell"></i>
            <span class="unread-dot"></span>
          </button>
          <div id="notifDropdown" class="notifications-dropdown">
            <div class="notifications-header">
              <span>Incident Alerts</span>
              <span class="badge badge-severity-medium" style="font-size:10px;">${NOTIFICATIONS.filter(n => n.unread).length} Unread</span>
            </div>
            ${notifItemsHtml}
            <div style="padding:var(--space-2) var(--space-4); text-align:center; background:var(--c-surface-subtle); border-bottom-left-radius:var(--radius-lg); border-bottom-right-radius:var(--radius-lg);">
              <a href="reports.html" style="font-size:11px; font-weight:600; color:var(--c-primary);">View All Incidents &rarr;</a>
            </div>
          </div>
        </div>

        <!-- Officer Profile Chip -->
        <a href="#profile" id="profileChipBtn" class="profile-chip">
          <div class="profile-avatar">PO</div>
          <span class="profile-name" id="topbarUserName">Platform Officer</span>
        </a>
      </div>
    `;
  }

  function renderSettingsModal() {
    return `
      <div id="settingsModalBackdrop" class="modal-backdrop">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title">Platform Configuration</div>
            <button id="closeSettingsModal" class="btn btn-ghost btn-sm" aria-label="Close modal">
              <i data-lucide="x"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="ai-notice-banner" style="margin-bottom:var(--space-4);">
              <span class="ai-notice-tag">Active</span>
              <span>Data synchronized with Supabase.</span>
            </div>

            <div class="form-group">
              <label class="form-label">Active Jurisdiction</label>
              <input type="text" class="form-control" value="NCR Regional Sector (Delhi, Noida, Greater Noida, Ghaziabad)" readonly>
            </div>

            <div class="form-group">
              <label class="form-label">Responsible AI Threshold</label>
              <input type="text" class="form-control" value="0.70 Minimum Confidence for Automated Triage" readonly>
            </div>
          </div>
          <div class="modal-footer">
            <button id="dismissSettingsModal" class="btn btn-primary btn-sm">Close</button>
          </div>
        </div>
      </div>
    `;
  }

  // Bind interactions
  function initInteractions() {
    // Mobile Drawer Elements
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');

    if (mobileMenuBtn && sidebar && sidebarOverlay) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
      });

      const closeDrawer = () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
      };

      if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeDrawer);
      sidebarOverlay.addEventListener('click', closeDrawer);
    }

    // Sign Out Handler (Exclusively Supabase Auth)
    const sidebarSignOutBtn = document.getElementById('sidebarSignOutBtn');
    if (sidebarSignOutBtn) {
      sidebarSignOutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          if (window.EarthData && typeof window.EarthData.signOut === 'function') {
            await window.EarthData.signOut();
          }
        } catch (err) {
          console.warn('[EarthApp] Sign out error:', err);
        }
        window.location.href = 'index.html';
      });
    }

    // Populate user profile & organization details from Supabase session
    try {
      if (window.EarthData && typeof window.EarthData.getSession === 'function') {
        window.EarthData.getSession().then(({ user, organization }) => {
          if (!user) return;
          const orgName = organization?.name || user?.user_metadata?.organization_name || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Platform Officer');
          const officerRole = user?.user_metadata?.account_type === 'organization' ? 'Registered Organization' : 'Platform Officer';

          const nameEl = document.getElementById('topbarUserName');
          if (nameEl) {
            nameEl.textContent = orgName;
          }
          const roleEl = document.getElementById('topbarUserRole');
          if (roleEl) {
            roleEl.textContent = officerRole;
          }

          const avatarEl = document.querySelector('.profile-avatar');
          if (avatarEl && orgName) {
            const initials = orgName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
            avatarEl.textContent = initials || 'PO';
          }

          const sidebarFooterStrong = document.querySelector('.sidebar-footer strong');
          if (sidebarFooterStrong) {
            sidebarFooterStrong.textContent = orgName;
          }

          const sidebarFooterRole = document.querySelector('.sidebar-footer div');
          if (sidebarFooterRole) {
            sidebarFooterRole.textContent = officerRole;
          }
        }).catch(e => console.warn('Failed to load user session for header:', e));
      }
    } catch (e) {}

    // Listen for auth events and redirect if signed out
    if (window.EarthData && typeof window.EarthData.onAuthStateChange === 'function') {
      window.EarthData.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          window.location.href = 'index.html';
        }
      });
    }

    // Notifications Dropdown
    const notifBellBtn = document.getElementById('notifBellBtn');
    const notifDropdown = document.getElementById('notifDropdown');

    if (notifBellBtn && notifDropdown) {
      notifBellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (!notifDropdown.contains(e.target) && e.target !== notifBellBtn) {
          notifDropdown.classList.remove('active');
        }
      });
    }

    // Global Search Controller
    const searchInput = document.getElementById('globalSearchInput');
    const searchDropdown = document.getElementById('searchResultsDropdown');

    if (searchInput && searchDropdown) {
      let debounceTimer = null;

      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();

        if (query.length < 2) {
          searchDropdown.classList.remove('active');
          searchDropdown.innerHTML = '';
          return;
        }

        debounceTimer = setTimeout(async () => {
          if (window.EarthData && typeof window.EarthData.getReports === 'function') {
            try {
              const results = await window.EarthData.getReports({ search: query });
              renderSearchResults(results.slice(0, 6), query);
            } catch (err) {
              console.warn('Search query error:', err);
            }
          }
        }, 150);
      });

      // Close search on outside click
      document.addEventListener('click', (e) => {
        if (!searchDropdown.contains(e.target) && e.target !== searchInput) {
          searchDropdown.classList.remove('active');
        }
      });
    }

    function renderSearchResults(results, query) {
      if (!results || results.length === 0) {
        searchDropdown.innerHTML = `
          <div class="empty-state" style="padding:var(--space-6) var(--space-4); border:none; margin:0;">
            <div class="empty-state-icon" style="width:36px; height:36px; margin-bottom:var(--space-2);">
              <i data-lucide="search-x"></i>
            </div>
            <div class="empty-state-title" style="font-size:var(--text-xs);">No search results</div>
            <div class="empty-state-desc" style="font-size:11px;">No environmental reports match "<strong>${escapeHtml(query)}</strong>"</div>
          </div>
        `;
        searchDropdown.classList.add('active');
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      searchDropdown.innerHTML = results.map(r => `
        <a href="report-details.html?id=${r.id}" class="search-result-item">
          <div class="search-result-header">
            <span class="search-result-title">${r.id} • ${r.category}</span>
            <span class="badge badge-severity-${r.severity.toLowerCase()}">${r.severity}</span>
          </div>
          <div class="search-result-meta">${r.title}</div>
          <div class="cell-compact" style="font-size:10px;">${r.location}, ${r.city}</div>
        </a>
      `).join('');

      searchDropdown.classList.add('active');
    }

    // Settings Modal
    const profileChipBtn = document.getElementById('profileChipBtn');
    const settingsModalBackdrop = document.getElementById('settingsModalBackdrop');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    const dismissSettingsModal = document.getElementById('dismissSettingsModal');

    function openSettings(e) {
      if (e) e.preventDefault();
      if (settingsModalBackdrop) settingsModalBackdrop.classList.add('active');
    }

    function closeSettings() {
      if (settingsModalBackdrop) settingsModalBackdrop.classList.remove('active');
    }

    if (profileChipBtn) profileChipBtn.addEventListener('click', openSettings);
    if (closeSettingsModal) closeSettingsModal.addEventListener('click', closeSettings);
    if (dismissSettingsModal) dismissSettingsModal.addEventListener('click', closeSettings);

    // Re-instantiate icons
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Shell Injection Entry Point
  async function initAppShell() {
    const currentFile = getCurrentFilename();

    // Do not inject shell on index.html (the login screen)
    if (currentFile === 'index.html' || document.body.classList.contains('login-page')) {
      return;
    }

    // Auth Guard: Every page except index.html requires an authenticated Supabase session
    try {
      let authSession = null;
      if (window.EarthData && typeof window.EarthData.getSession === 'function') {
        const res = await window.EarthData.getSession();
        authSession = res?.session;
      }
      if (!authSession) {
        window.location.href = 'index.html';
        return;
      }
    } catch (err) {
      console.warn('[EarthApp] Auth guard check failed, redirecting to index.html:', err);
      window.location.href = 'index.html';
      return;
    }

    const appShell = document.getElementById('app-shell') || document.querySelector('.app-shell');
    if (!appShell) return;

    // 1. Inject or update Sidebar
    let sidebar = appShell.querySelector('.sidebar');
    let overlay = appShell.querySelector('.sidebar-overlay');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      appShell.insertBefore(overlay, appShell.firstChild);
    }

    if (!sidebar) {
      sidebar = document.createElement('aside');
      sidebar.className = 'sidebar';
      appShell.insertBefore(sidebar, overlay.nextSibling);
    }
    sidebar.innerHTML = renderSidebar(currentFile);

    // 2. Inject or update Topbar
    const mainContent = appShell.querySelector('.main-content');
    if (mainContent) {
      let topbar = mainContent.querySelector('.topbar');
      if (!topbar) {
        topbar = document.createElement('header');
        topbar.className = 'topbar';
        mainContent.insertBefore(topbar, mainContent.firstChild);
      }
      topbar.innerHTML = renderTopbar();
    }

    // 3. Inject Settings Modal if missing
    if (!document.getElementById('settingsModalBackdrop')) {
      const modalWrapper = document.createElement('div');
      modalWrapper.innerHTML = renderSettingsModal();
      document.body.appendChild(modalWrapper.firstElementChild);
    }

    initInteractions();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppShell);
  } else {
    initAppShell();
  }

  // Expose namespace for debugging or custom programmatic trigger
  window.EarthApp = {
    initAppShell,
    getCurrentFilename
  };
})();

