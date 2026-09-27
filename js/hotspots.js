/**
 * Prakarti Report — NGO Environmental Intelligence & Action Platform
 * js/hotspots.js — Environmental Hotspot Clusters & Density Analysis Controller
 * 
 * Strict Architecture Rule:
 * All data access goes through EarthData (js/data.js):
 * - EarthData.getHotspots()
 * - EarthData.getReports()
 * 
 * Strict Design System:
 * - Green density indicator strictly uses green scale (light → medium → dark green, NEVER red).
 * - Adheres to Responsible-AI terminology ("AI-detected suspected recurring issue").
 */

(function () {
  'use strict';

  // Storage key for proposal generation handoff
  const STORAGE_BULK_KEY = 'earthforward_selected_reports';

  // State
  let allHotspots = [];
  let filteredHotspots = [];
  let selectedHotspot = null;

  // Filter state
  let searchQuery = '';
  let selectedCity = 'All';
  let selectedRisk = 'All';
  let sortCriterion = 'density_desc';

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Helper: Format Date nicely
   */
  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * Compute Density Level (1 to 5) strictly on Green Scale
   */
  function getDensityLevel(reportCount) {
    if (reportCount >= 9) return 5; // Darkest Forest Green
    if (reportCount >= 7) return 4; // Primary Forest Green
    if (reportCount >= 5) return 3; // Medium Forest Green
    if (reportCount >= 4) return 2; // Accent Sage
    return 1; // Light Mint/Sage
  }

  function getDensityDescription(level) {
    if (level === 5) return 'Critical Concentration (Level 5)';
    if (level === 4) return 'High Density Cluster (Level 4)';
    if (level === 3) return 'Moderate Density (Level 3)';
    if (level === 2) return 'Emerging Cluster (Level 2)';
    return 'Localized Cluster (Level 1)';
  }

  /**
   * Toast notification feedback
   */
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle-2' : 'info'}" style="width:16px; height:16px; color:var(--c-primary); flex-shrink:0;"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    if (window.lucide) {
      window.lucide.createIcons({ root: toast });
    }

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  /**
   * Populate City/Location filter options dynamically from loaded hotspots
   */
  function populateFilterDropdowns() {
    const cityFilter = document.getElementById('hotspotsCityFilter');
    if (!cityFilter) return;

    const uniqueCities = Array.from(new Set(allHotspots.map(h => h.city).filter(Boolean))).sort();
    if (uniqueCities.length > 0) {
      cityFilter.innerHTML = '<option value="All">All Locations</option>' +
        uniqueCities.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    }
  }

  /**
   * Initialize Hotspots Dashboard
   */
  async function initHotspots() {
    try {
      allHotspots = await window.EarthData.getHotspots();
      filteredHotspots = [...allHotspots];

      populateFilterDropdowns();
      updateTopKPIs();
      applyFiltersAndSort();
      setupEventListeners();

      // Deep-link handler: ?report=<reportId>
      const urlParams = new URLSearchParams(window.location.search);
      const reportIdParam = urlParams.get('report');
      if (reportIdParam) {
        const target = allHotspots.find(h =>
          (h.reportIds && h.reportIds.includes(reportIdParam)) ||
          (h.reportsList && h.reportsList.some(r => r.id === reportIdParam))
        );
        if (target) {
          openHotspotDetail(target);
        } else {
          showToast('This report is not part of a hotspot yet.', 'info');
        }
      }

      if (window.lucide) {
        window.lucide.createIcons();
      }
    } catch (err) {
      console.error('Failed to initialize hotspots:', err);
    }
  }

  /**
   * Update Top KPI Summary Strip
   */
  function updateTopKPIs() {
    const statHotspotCount = document.getElementById('statHotspotCount');
    const statClusteredReports = document.getElementById('statClusteredReports');
    const statHighPriorityHotspots = document.getElementById('statHighPriorityHotspots');
    const statActiveInterventions = document.getElementById('statActiveInterventions');

    if (!allHotspots) return;

    const totalClusters = allHotspots.length;
    const totalClustered = allHotspots.reduce((acc, h) => acc + (h.reportCount || 0), 0);
    const highPriorityClusters = allHotspots.filter(h => h.riskLevel === 'High' || (h.highPriorityCount && h.highPriorityCount >= 4)).length;
    const activeInterventions = allHotspots.filter(h => 
      (h.activeInterventionCount && h.activeInterventionCount > 0) ||
      (h.interventionStatus && h.interventionStatus.toLowerCase().includes('active'))
    ).length;

    if (statHotspotCount) statHotspotCount.textContent = totalClusters;
    if (statClusteredReports) statClusteredReports.textContent = totalClustered;
    if (statHighPriorityHotspots) statHighPriorityHotspots.textContent = highPriorityClusters;
    if (statActiveInterventions) statActiveInterventions.textContent = activeInterventions;
  }

  /**
   * Filter and Sort Hotspots
   */
  function applyFiltersAndSort() {
    filteredHotspots = allHotspots.filter(h => {
      // 1. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = (h.name || '').toLowerCase().includes(q);
        const matchCity = (h.city || '').toLowerCase().includes(q);
        const matchCategory = (h.primaryCategory || '').toLowerCase().includes(q);
        const matchRisk = (h.aiRiskAssessment || '').toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchCategory && !matchRisk) {
          return false;
        }
      }

      // 2. City Filter
      if (selectedCity !== 'All' && h.city !== selectedCity) {
        return false;
      }

      // 3. Risk Level Filter
      if (selectedRisk !== 'All' && h.riskLevel !== selectedRisk) {
        return false;
      }

      return true;
    });

    // Sort Hotspots
    filteredHotspots.sort((a, b) => {
      if (sortCriterion === 'density_desc') {
        return (b.reportCount || 0) - (a.reportCount || 0);
      }
      if (sortCriterion === 'priority_desc') {
        return (b.highPriorityCount || 0) - (a.highPriorityCount || 0);
      }
      if (sortCriterion === 'radius_desc') {
        return (b.radiusMeters || 0) - (a.radiusMeters || 0);
      }
      if (sortCriterion === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });

    // Render Grid
    renderHotspotsGrid();

    // Update count badge
    const badge = document.getElementById('hotspotsCountBadge');
    if (badge) {
      badge.textContent = `Showing ${filteredHotspots.length} of ${allHotspots.length} hotspots`;
    }
  }

  /**
   * Render Hotspots Cards List View
   */
  function renderHotspotsGrid() {
    const grid = document.getElementById('hotspotsGrid');
    const emptyState = document.getElementById('hotspotsEmptyState');
    if (!grid) return;

    if (filteredHotspots.length === 0) {
      grid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    grid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = filteredHotspots.map((h, index) => {
      const rankNum = index + 1;
      const densityLevel = getDensityLevel(h.reportCount);
      const densityDesc = getDensityDescription(densityLevel);

      // Top 2-3 Categories with counts
      const catEntries = Object.entries(h.categoryBreakdown || {}).sort((a, b) => b[1] - a[1]);
      const topCategoriesHtml = catEntries.slice(0, 3).map(([cat, count]) => `
        <span class="hotspot-cat-tag">
          <span>${cat}</span>
          <span class="count">${count}</span>
        </span>
      `).join('');

      return `
        <article class="hotspot-card" data-hotspot-id="${h.id}" tabindex="0" role="button" aria-label="Inspect ${h.name}">
          
          <div class="hotspot-card-top">
            <div style="display:flex; align-items:center; gap:var(--space-2);">
              <span class="hotspot-rank-pill">#${rankNum} Density</span>
              <span class="badge ${h.riskLevel === 'High' ? 'badge-status-verified' : ''}" style="font-size:10px; padding:2px 6px;">
                <span class="dot"></span> ${h.riskLevel} Risk
              </span>
            </div>
            <span style="font-size:11px; font-weight:700; color:var(--c-text-secondary); font-family:var(--font-mono);">
              ${h.id}
            </span>
          </div>

          <div>
            <h3 class="hotspot-card-title">${h.name}</h3>
            <div class="hotspot-location-sub">
              <i data-lucide="map-pin" style="width:12px; height:12px; color:var(--c-primary);"></i>
              <span>${h.city} &bull; ${h.radiusMeters.toLocaleString()}m buffer perimeter</span>
            </div>
          </div>

          <!-- Small Green Density Indicator (1-5 Green scale, strictly NOT red) -->
          <div class="density-scale-container">
            <div class="density-scale-header">
              <span class="density-label">
                <i data-lucide="activity" style="width:12px; height:12px; color:var(--c-primary);"></i>
                Incident Concentration
              </span>
              <span class="density-val-badge">${h.reportCount} Reports</span>
            </div>
            <div class="density-meter-track" title="${densityDesc}">
              <div class="density-meter-step ${densityLevel >= 1 ? 'active-1' : ''}"></div>
              <div class="density-meter-step ${densityLevel >= 2 ? 'active-2' : ''}"></div>
              <div class="density-meter-step ${densityLevel >= 3 ? 'active-3' : ''}"></div>
              <div class="density-meter-step ${densityLevel >= 4 ? 'active-4' : ''}"></div>
              <div class="density-meter-step ${densityLevel >= 5 ? 'active-5' : ''}"></div>
            </div>
          </div>

          <!-- Metrics Row -->
          <div class="hotspot-metrics-row">
            <div class="metric-column">
              <span class="metric-label">High Priority</span>
              <span class="metric-val" style="color:var(--c-primary);">
                <span class="intensity-dot dot-high" style="margin-right:2px;"></span>
                ${h.highPriorityCount} Issues
              </span>
            </div>
            <div class="metric-column" style="text-align:center;">
              <span class="metric-label">Active vs Cleared</span>
              <span class="metric-val">${h.activeReports || 0} / ${h.resolvedReports || 0}</span>
            </div>
            <div class="metric-column" style="text-align:right;">
              <span class="metric-label">Observation Period</span>
              <span class="metric-val" style="font-size:11px; font-weight:600;">
                ${formatDate(h.firstReportDate)} &ndash; ${formatDate(h.latestReportDate)}
              </span>
            </div>
          </div>

          <!-- Top Categories Breakdown Tags -->
          <div>
            <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--c-text-secondary); margin-bottom:4px;">
              Primary Converging Categories:
            </div>
            <div class="hotspot-categories-wrap">
              ${topCategoriesHtml}
            </div>
          </div>

          <div class="hotspot-card-footer">
            <span style="font-size:11px; color:var(--c-text-secondary);">
              <span class="intensity-dot dot-medium" style="margin-right:3px;"></span>
              ${h.interventionStatus}
            </span>
            <span class="inspect-link">
              <span>Inspect Dossier</span>
              <i data-lucide="arrow-right" style="width:13px; height:13px;"></i>
            </span>
          </div>

        </article>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons({ root: grid });
    }
  }

  /**
   * Open Hotspot Detail View (Slide-In Drawer)
   */
  function openHotspotDetail(hotspot) {
    selectedHotspot = hotspot;

    const drawer = document.getElementById('hotspotDrawer');
    const backdrop = document.getElementById('hotspotDrawerBackdrop');
    if (!drawer || !backdrop) return;

    const densityLevel = getDensityLevel(hotspot.reportCount);

    // Populate Drawer Header
    const rankPill = document.getElementById('drawerRankPill');
    const riskBadge = document.getElementById('drawerRiskBadge');
    const title = document.getElementById('drawerHotspotTitle');
    const location = document.getElementById('drawerHotspotLocation');

    const index = filteredHotspots.findIndex(h => h.id === hotspot.id);
    if (rankPill) rankPill.textContent = `#${index !== -1 ? index + 1 : 1} Density`;
    if (riskBadge) {
      riskBadge.className = `badge ${hotspot.riskLevel === 'High' ? 'badge-status-verified' : ''}`;
      riskBadge.textContent = `${hotspot.riskLevel} Risk`;
    }
    if (title) title.textContent = hotspot.name;
    if (location) {
      location.textContent = `${hotspot.city} • Coords: [${hotspot.coordinates[0].toFixed(4)}, ${hotspot.coordinates[1].toFixed(4)}] • ${hotspot.radiusMeters.toLocaleString()}m Radius`;
    }

    // AI Risk Assessment
    const aiAssessment = document.getElementById('drawerAiAssessment');
    if (aiAssessment) {
      aiAssessment.textContent = hotspot.aiRiskAssessment;
    }

    // Metric Values
    const reportCount = document.getElementById('drawerReportCount');
    const highPriorityCount = document.getElementById('drawerHighPriorityCount');
    const dateRange = document.getElementById('drawerDateRange');

    if (reportCount) reportCount.textContent = `${hotspot.reportCount} Incidents`;
    if (highPriorityCount) highPriorityCount.textContent = `${hotspot.highPriorityCount} High Severity`;
    if (dateRange) {
      dateRange.textContent = `${formatDate(hotspot.firstReportDate)} to ${formatDate(hotspot.latestReportDate)}`;
    }

    // Category Breakdown with visual progress bars
    const catBarsContainer = document.getElementById('drawerCategoryBars');
    if (catBarsContainer) {
      const entries = Object.entries(hotspot.categoryBreakdown || {}).sort((a, b) => b[1] - a[1]);
      const total = hotspot.reportCount || 1;

      catBarsContainer.innerHTML = entries.map(([cat, count]) => {
        const pct = Math.round((count / total) * 100);
        return `
          <div class="category-bar-item">
            <div class="category-bar-meta">
              <span style="color:var(--c-text-primary); font-weight:600;">${cat}</span>
              <span style="color:var(--c-primary); font-family:var(--font-mono);">${count} (${pct}%)</span>
            </div>
            <div class="category-bar-track">
              <div class="category-bar-fill" style="width:${pct}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Member Reports List
    const reportsListContainer = document.getElementById('drawerMemberReports');
    if (reportsListContainer) {
      const reports = hotspot.reportsList || [];
      reportsListContainer.innerHTML = reports.map(r => {
        const isHigh = r.severity === 'High';
        const dotClass = isHigh ? 'dot-high' : r.severity === 'Medium' ? 'dot-medium' : 'dot-low';
        const statusKey = r.status.toLowerCase().replace(/\s+/g, '');

        return `
          <div class="member-report-item">
            <div style="display:flex; flex-direction:column; gap:2px; flex:1; min-width:0;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-family:var(--font-mono); font-weight:700; color:var(--c-primary); font-size:11px;">
                  ${r.id}
                </span>
                <span class="intensity-dot ${dotClass}" title="${r.severity}"></span>
                <span class="badge badge-status-${statusKey}" style="font-size:9px; padding:1px 5px;">
                  ${r.status}
                </span>
              </div>
              <div style="font-weight:600; color:var(--c-text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:11px;" title="${r.title}">
                ${r.title}
              </div>
              <div style="font-size:10px; color:var(--c-text-secondary);">
                ${r.category} &bull; ${formatDate(r.reportDate)}
              </div>
            </div>
            <a href="report-details.html?id=${r.id}" class="btn-action-view" style="font-size:10px; padding:3px 8px; flex-shrink:0;">
              View &rarr;
            </a>
          </div>
        `;
      }).join('');
    }

    // Open Drawer
    drawer.classList.add('active');
    backdrop.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.setAttribute('aria-hidden', 'false');

    if (window.lucide) {
      window.lucide.createIcons({ root: drawer });
    }
  }

  /**
   * Close Hotspot Detail Drawer
   */
  function closeHotspotDetail() {
    const drawer = document.getElementById('hotspotDrawer');
    const backdrop = document.getElementById('hotspotDrawerBackdrop');
    if (drawer) {
      drawer.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
    }
    if (backdrop) {
      backdrop.classList.remove('active');
      backdrop.setAttribute('aria-hidden', 'true');
    }
    selectedHotspot = null;
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // 1. Search Input
    const searchInput = document.getElementById('hotspotsSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        applyFiltersAndSort();
      });
    }

    // 2. City Filter
    const cityFilter = document.getElementById('hotspotsCityFilter');
    if (cityFilter) {
      cityFilter.addEventListener('change', (e) => {
        selectedCity = e.target.value;
        applyFiltersAndSort();
      });
    }

    // 3. Risk Level Filter
    const riskFilter = document.getElementById('hotspotsRiskFilter');
    if (riskFilter) {
      riskFilter.addEventListener('change', (e) => {
        selectedRisk = e.target.value;
        applyFiltersAndSort();
      });
    }

    // 4. Sort Dropdown
    const sortSelect = document.getElementById('hotspotsSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        sortCriterion = e.target.value;
        applyFiltersAndSort();
      });
    }

    // 5. Reset Filters Button
    const resetBtn = document.getElementById('btnResetHotspotsFilters');
    const emptyResetBtn = document.getElementById('btnEmptyReset');

    const resetAction = () => {
      searchQuery = '';
      selectedCity = 'All';
      selectedRisk = 'All';
      sortCriterion = 'density_desc';

      if (searchInput) searchInput.value = '';
      if (cityFilter) cityFilter.value = 'All';
      if (riskFilter) riskFilter.value = 'All';
      if (sortSelect) sortSelect.value = 'density_desc';

      applyFiltersAndSort();
    };

    if (resetBtn) resetBtn.addEventListener('click', resetAction);
    if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAction);

    // 6. Hotspot Card Click to Open Drawer
    const grid = document.getElementById('hotspotsGrid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const card = e.target.closest('.hotspot-card');
        if (!card) return;
        const hotspotId = card.getAttribute('data-hotspot-id');
        const found = allHotspots.find(h => h.id === hotspotId);
        if (found) {
          openHotspotDetail(found);
        }
      });

      // Keyboard navigation (Enter / Space)
      grid.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const card = e.target.closest('.hotspot-card');
          if (card) {
            e.preventDefault();
            const hotspotId = card.getAttribute('data-hotspot-id');
            const found = allHotspots.find(h => h.id === hotspotId);
            if (found) openHotspotDetail(found);
          }
        }
      });
    }

    // 7. Drawer Close Events
    const closeBtn = document.getElementById('btnDrawerClose');
    const backdrop = document.getElementById('hotspotDrawerBackdrop');

    if (closeBtn) closeBtn.addEventListener('click', closeHotspotDetail);
    if (backdrop) backdrop.addEventListener('click', closeHotspotDetail);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeHotspotDetail();
    });

    // 8. Drawer Action 1: "View Reports" Button
    const viewReportsBtn = document.getElementById('btnDrawerViewReports');
    if (viewReportsBtn) {
      viewReportsBtn.addEventListener('click', () => {
        if (!selectedHotspot) return;
        // Search by corridor or city in triage matrix
        const locationQuery = selectedHotspot.city || selectedHotspot.name.split(' ')[0];
        window.location.href = `reports.html?search=${encodeURIComponent(locationQuery)}`;
      });
    }

    // 9. Drawer Action 2: "Generate Proposal" Button
    const generateProposalBtn = document.getElementById('btnDrawerGenerateProposal');
    if (generateProposalBtn) {
      generateProposalBtn.addEventListener('click', () => {
        if (!selectedHotspot) return;
        try {
          // Pre-populate sessionStorage with all member reports in this hotspot
          const memberIds = (selectedHotspot.reportsList || []).map(r => r.id);
          sessionStorage.setItem(STORAGE_BULK_KEY, JSON.stringify(memberIds));

          showToast(`Prepared ${memberIds.length} reports for ${selectedHotspot.name} proposal.`);
          setTimeout(() => {
            window.location.href = `proposal.html?hotspot=${encodeURIComponent(selectedHotspot.id)}`;
          }, 400);
        } catch (err) {
          window.location.href = `proposal.html?hotspot=${encodeURIComponent(selectedHotspot.id)}`;
        }
      });
    }
  }

  // Self-execute initialization on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHotspots);
  } else {
    initHotspots();
  }

})();
