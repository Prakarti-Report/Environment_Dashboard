/**
 * Prakarti Report — NGO Environmental Intelligence & Action Platform
 * js/reports.js — Comprehensive Reports Triage Controller
 * 
 * Strict Architecture Rule:
 * All data access goes through EarthData (js/data.js):
 * - EarthData.getReports(filters)
 * - EarthData.updateReportStatus(id, status)
 * - EarthData.assignReport(id, worker, priority, dueDate)
 * - EarthData.getFieldWorkers()
 */

(function () {
  'use strict';

  // Storage key for shared proposal generation selection
  const STORAGE_BULK_KEY = 'earthforward_selected_reports';

  // State
  let allReports = [];
  let filteredReports = [];
  let currentPage = 1;
  let pageSize = 10;
  let sortField = 'date';
  let sortAscending = false;

  // Selected Report IDs set (persisted in sessionStorage)
  let selectedReportIds = new Set();

  /**
   * Category Micro-Thumbnail SVGs (Monochrome Green Scale Only)
   */
  function getCategoryThumbnail(category) {
    const cat = category.toLowerCase();

    let iconSvg = '';
    if (cat.includes('industrial') || cat.includes('emission')) {
      // Factory / chimney stack
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="#315C3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 20h20"/>
          <path d="M6 20V8l5 4V4l7 5v11"/>
          <path d="M18 9h2"/>
        </svg>
      `;
    } else if (cat.includes('waste') && cat.includes('burning')) {
      // Fire flame & leaf
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="#315C3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/>
        </svg>
      `;
    } else if (cat.includes('crop') || cat.includes('stubble')) {
      // Agriculture field / crop
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="#315C3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2v20"/>
          <path d="M6 10c3-1 6-3 6-6"/>
          <path d="M6 16c4-1 8-3 8-6"/>
          <path d="M14 18c2-1 4-2 4-4"/>
        </svg>
      `;
    } else if (cat.includes('water')) {
      // Water wave / droplet
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="#315C3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          <path d="M4 14a8 8 0 0 0 16 0"/>
        </svg>
      `;
    } else if (cat.includes('dumping') || cat.includes('garbage')) {
      // Trash bin / waste accumulation
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="#315C3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          <line x1="10" x2="10" y1="11" y2="17"/>
          <line x1="14" x2="14" y1="11" y2="17"/>
        </svg>
      `;
    } else if (cat.includes('air')) {
      // Wind / air particulate cloud
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="#315C3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.7 7.7A7.1 7.1 0 0 0 5 10.8A4 4 0 0 0 6 18h12a5 5 0 0 0 3-9.5"/>
        </svg>
      `;
    } else if (cat.includes('sewage') || cat.includes('drainage')) {
      // Pipes / drain grid
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="#315C3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      `;
    } else if (cat.includes('vehicle')) {
      // Truck / transport exhaust
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="#315C3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="16" height="11" x="1" y="5" rx="2"/>
          <path d="M17 11h3l3 3v2h-6"/>
          <circle cx="6" cy="18" r="2"/>
          <circle cx="18" cy="18" r="2"/>
        </svg>
      `;
    } else if (cat.includes('deforestation')) {
      // Tree felling
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="#315C3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 10v12"/>
          <path d="M7 14l5-5 5 5"/>
          <path d="M9 22h6"/>
        </svg>
      `;
    } else {
      // Plastic scrap / packaging
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="#315C3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
          <path d="M4 12V4a2 2 0 0 1 2-2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4"/>
          <path d="M2 15h10"/>
        </svg>
      `;
    }

    return `
      <div class="category-thumb-wrapper" title="${category}">
        ${iconSvg}
      </div>
    `;
  }

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

   * Toast Notification Generator (Calm Green Shades)
   */
  function showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i data-lucide="check-circle" style="width:16px; height:16px; color:var(--c-primary); flex-shrink:0;"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  /**
   * Hydrate bulk selection from sessionStorage
   */
  function loadStoredSelection() {
    try {
      const stored = sessionStorage.getItem(STORAGE_BULK_KEY);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          selectedReportIds = new Set(arr);
        }
      }
    } catch (e) {
      console.warn('Could not read bulk selection from sessionStorage:', e);
    }
  }

  function saveStoredSelection() {
    try {
      sessionStorage.setItem(STORAGE_BULK_KEY, JSON.stringify(Array.from(selectedReportIds)));
    } catch (e) {
      console.warn('Could not save bulk selection to sessionStorage:', e);
    }
    updateBulkActionBar();
  }

  function updateBulkActionBar() {
    const bar = document.getElementById('bulkActionBar');
    const countEl = document.getElementById('bulkSelectedCount');
    if (!bar || !countEl) return;

    const count = selectedReportIds.size;
    if (count > 0) {
      countEl.textContent = `${count} report${count === 1 ? '' : 's'} selected`;
      bar.classList.add('active');
    } else {
      bar.classList.remove('active');
    }

    // Sync master select-all checkbox
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
      const pageReports = getPaginatedReports();
      const allPageSelected = pageReports.length > 0 && pageReports.every(r => selectedReportIds.has(r.id));
      selectAllCheckbox.checked = allPageSelected;
    }
  }

  /**
   * Filter, Sort, and Paginate Data
   */
  function applyFiltersAndSort() {
    const searchVal = document.getElementById('reportsSearchInput').value.toLowerCase().trim();
    const catVal = document.getElementById('filterCategorySelect').value;
    const sevVal = document.getElementById('filterSeveritySelect').value;
    const statVal = document.getElementById('filterStatusSelect').value;
    const dateVal = document.getElementById('filterDateSelect').value;
    const locVal = document.getElementById('filterLocationSelect').value;

    filteredReports = allReports.filter(r => {
      // Search
      if (searchVal) {
        const matches = (r.id || '').toLowerCase().includes(searchVal) ||
          (r.title || '').toLowerCase().includes(searchVal) ||
          (r.category || '').toLowerCase().includes(searchVal) ||
          (r.location || '').toLowerCase().includes(searchVal) ||
          (r.city || '').toLowerCase().includes(searchVal) ||
          (r.assignedTeamName || '').toLowerCase().includes(searchVal) ||
          (r.assignedTeamCode || '').toLowerCase().includes(searchVal);
        if (!matches) return false;
      }

      // Category
      if (catVal !== 'all' && (r.category || '').toLowerCase() !== catVal.toLowerCase()) return false;

      // Severity
      if (sevVal !== 'all') {
        const rSev = (r.severity || 'Unassessed').toLowerCase();
        if (rSev !== sevVal.toLowerCase()) return false;
      }

      // Status
      if (statVal !== 'all' && (r.status || '').toLowerCase() !== statVal.toLowerCase()) return false;

      // Date Range (starts with '2026-06', etc.)
      if (dateVal !== 'all' && !(r.reportDate || '').startsWith(dateVal)) return false;

      // Location / City
      if (locVal !== 'all' && (r.city || '').toLowerCase() !== locVal.toLowerCase()) return false;

      return true;
    });

    // Sort
    filteredReports.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = a.id.localeCompare(b.id);
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortField === 'location') {
        comparison = a.location.localeCompare(b.location);
      } else if (sortField === 'severity') {
        const rank = { High: 3, Medium: 2, Low: 1 };
        comparison = (rank[a.severity] || 0) - (rank[b.severity] || 0);
      } else if (sortField === 'confidence') {
        comparison = a.confidence - b.confidence;
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'date') {
        comparison = new Date(a.reportDate) - new Date(b.reportDate);
      }
      return sortAscending ? comparison : -comparison;
    });

    // Reset to page 1 if current page is out of bounds
    const totalPages = Math.ceil(filteredReports.length / pageSize) || 1;
    if (currentPage > totalPages) {
      currentPage = 1;
    }
  }

  function getPaginatedReports() {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredReports.slice(startIndex, startIndex + pageSize);
  }

  /**
   * Render Table Rows & Pagination
   */
  function renderTable() {
    const tbody = document.getElementById('reportsTableBody');
    const emptyState = document.getElementById('reportsEmptyState');
    const tableWrap = document.getElementById('reportsTableWrap');
    const paginationBar = document.getElementById('reportsPaginationBar');

    if (!filteredReports || filteredReports.length === 0) {
      tableWrap.style.display = 'none';
      paginationBar.style.display = 'none';
      emptyState.style.display = 'flex';
      return;
    }

    tableWrap.style.display = 'block';
    paginationBar.style.display = 'flex';
    emptyState.style.display = 'none';

    const visibleReports = getPaginatedReports();

    tbody.innerHTML = visibleReports.map(r => {
      const isSelected = selectedReportIds.has(r.id);
      const sev = r.severity || 'Unassessed';
      const dotClass = sev === 'High' ? 'dot-high'
        : sev === 'Medium' ? 'dot-medium'
        : sev === 'Low' ? 'dot-low' : 'dot-unassessed';

      const dateStr = r.reportDate ? new Date(r.reportDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : '—';

      const confText = (r.confidence !== null && r.confidence !== undefined)
        ? `${Math.round(r.confidence * 100)}%`
        : '—';

      const statusKey = (r.status || 'reported').toLowerCase().replace(/\s+/g, '');

      return `
        <tr data-report-id="${r.id}" style="${isSelected ? 'background-color:var(--c-surface-subtle);' : ''}">
          <td style="width: 38px; text-align: center;">
            <input 
              type="checkbox" 
              class="report-checkbox row-select-checkbox" 
              data-id="${r.id}" 
              ${isSelected ? 'checked' : ''} 
              aria-label="Select report ${r.id}"
            />
          </td>
          <td>
            <a href="report-details.html?id=${r.id}" class="cell-compact" style="font-weight:700;">${r.id}</a>
          </td>
          <td>
            ${getCategoryThumbnail(r.category)}
          </td>
          <td>
            <span style="font-weight:600; font-size:var(--text-xs); color:var(--c-text-primary);">${r.category || 'Uncategorized'}</span>
          </td>
          <td>
            <div style="font-weight:600; font-size:var(--text-xs); max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${r.title || ''}">
              ${r.title || 'Untitled Report'}
            </div>
            <div class="cell-compact">${r.location ? `${r.location}, ${r.city || ''}` : (r.city || '—')}</div>
          </td>
          <td>
            <div class="severity-indicator">
              <span class="intensity-dot ${dotClass}"></span>
              <span>${sev}</span>
            </div>
          </td>
          <td>
            <span class="cell-compact" style="font-weight:600;">${confText}</span>
          </td>
          <td>
            <span class="badge badge-status-${statusKey}">
              <span class="dot"></span> ${r.status}
            </span>
            ${r.isAssigned ? `
              <div style="margin-top:4px;">
                <span class="badge" style="background:var(--c-surface-subtle); color:var(--c-primary); border:1px solid rgba(49,92,58,0.25); font-size:10px; padding:2px 6px; display:inline-flex; align-items:center; gap:3px;">
                  <i data-lucide="users" style="width:10px; height:10px;"></i>
                  <span>${escapeHtml(r.assignedTeamCode || r.assignedTeamName || 'Assigned')}</span>
                </span>
              </div>
            ` : ''}
          </td>
          <td>
            <span class="cell-compact">${dateStr}</span>
          </td>
          <td>
            <div class="row-actions-group">
              <a href="report-details.html?id=${r.id}" class="btn-action-view" title="Inspect Details">
                View
              </a>

              <div class="action-menu-container">
                <button class="btn btn-outline btn-sm btn-quick-menu" data-id="${r.id}" aria-label="More actions" style="padding:0.35rem 0.5rem;">
                  <i data-lucide="more-horizontal" style="width:14px; height:14px;"></i>
                </button>
                <div class="action-menu-dropdown" id="dropdown-${r.id}">
                  <button class="action-menu-item" onclick="window.quickAssignReport('${r.id}')">
                    <i data-lucide="users" style="width:13px; height:13px; color:var(--c-accent-sage);"></i>
                    <span>Assign Team</span>
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Update Pagination UI
    const totalRecords = filteredReports.length;
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(startIndex + pageSize - 1, totalRecords);
    const totalPages = Math.ceil(totalRecords / pageSize);

    document.getElementById('paginationInfo').textContent = 
      `Showing ${startIndex}–${endIndex} of ${totalRecords} reports`;
    document.getElementById('paginationCurrentPage').textContent = 
      `Page ${currentPage} of ${totalPages}`;

    document.getElementById('btnPrevPage').disabled = currentPage === 1;
    document.getElementById('btnNextPage').disabled = currentPage === totalPages;

    // Attach Row Checkbox Events
    document.querySelectorAll('.row-select-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        if (e.target.checked) {
          selectedReportIds.add(id);
        } else {
          selectedReportIds.delete(id);
        }
        saveStoredSelection();
        renderTable();
      });
    });

    // Attach Quick Menu Popovers
    document.querySelectorAll('.btn-quick-menu').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const menu = document.getElementById(`dropdown-${id}`);
        // Close other open menus
        document.querySelectorAll('.action-menu-dropdown.active').forEach(m => {
          if (m !== menu) m.classList.remove('active');
        });
        if (menu) menu.classList.toggle('active');
      });
    });

    updateBulkActionBar();

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /**
   * Row Action: Quick Assign Modal
   */
  window.quickAssignReport = async function (id) {
    const modalBackdrop = document.getElementById('assignModalBackdrop');
    const modalTitle = document.getElementById('assignModalReportTitle');
    const teamSelect = document.getElementById('assignWorkerSelect');
    const hiddenIdInput = document.getElementById('assignReportId');
    const prioritySelect = document.getElementById('assignPrioritySelect');
    const dueDateInput = document.getElementById('assignDueDate');
    const noTeamsNotice = document.getElementById('noTeamsNotice');
    const submitBtn = document.getElementById('submitAssignModalBtn');

    if (!modalBackdrop || !teamSelect) return;

    hiddenIdInput.value = id;
    const report = allReports.find(r => r.id === id);
    const isAlreadyAssigned = !!(report && report.isAssigned);

    if (modalTitle) {
      modalTitle.textContent = isAlreadyAssigned
        ? `Reassign Team for Report ${id}`
        : `Assign Team to Report ${id}`;
    }
    if (submitBtn) {
      submitBtn.textContent = isAlreadyAssigned ? 'Reassign Team' : 'Dispatch Assignment';
    }

    // Default due date: today + 5 days
    const today = new Date();
    const minDateStr = today.toISOString().split('T')[0];
    const defaultDue = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (dueDateInput) {
      dueDateInput.min = minDateStr;
      dueDateInput.value = (report && report.dueDate) ? report.dueDate.split('T')[0] : defaultDue;
    }

    if (prioritySelect) {
      prioritySelect.value = (report && (report.assignedPriority || report.priority)) || 'Medium';
    }

    // Populate teams
    let teams = [];
    try {
      teams = await window.EarthData.getOrganizations();
    } catch (e) {
      console.warn('Failed to load organizations:', e);
    }

    if (!teams || teams.length === 0) {
      teamSelect.innerHTML = '<option value="" disabled selected>No teams registered yet.</option>';
      teamSelect.disabled = true;
      if (noTeamsNotice) noTeamsNotice.style.display = 'block';
      if (submitBtn) submitBtn.disabled = true;
    } else {
      teamSelect.disabled = false;
      if (noTeamsNotice) noTeamsNotice.style.display = 'none';
      if (submitBtn) submitBtn.disabled = false;

      const currentOrgId = report ? (report.organizationId || report.organization_id) : null;

      teamSelect.innerHTML = teams.map(t => {
        const code = t.teamCode || t.team_code || '—';
        const members = t.memberCount !== null && t.memberCount !== undefined ? t.memberCount : (t.member_count || 0);
        const isSelected = currentOrgId && (String(t.id) === String(currentOrgId));
        return `<option value="${t.id}" ${isSelected ? 'selected' : ''}>${escapeHtml(t.name)} (${escapeHtml(code)}) — ${members} members</option>`;
      }).join('');
    }

    modalBackdrop.classList.add('active');
    if (window.lucide) lucide.createIcons();
  };

  /**
   * Submit Assign Modal
   */
  async function submitAssignModal() {
    const id = document.getElementById('assignReportId').value;
    const teamSelect = document.getElementById('assignWorkerSelect');
    const teamId = teamSelect ? teamSelect.value : null;
    const priority = document.getElementById('assignPrioritySelect').value;
    const dueDate = document.getElementById('assignDueDate').value;

    if (!teamId) {
      alert('Please select a team.');
      return;
    }

    try {
      await window.EarthData.assignReportToTeam(id, teamId, priority, dueDate);
      
      let teams = [];
      try {
        teams = await window.EarthData.getOrganizations();
      } catch (e) {
        // ignore
      }
      const assignedTeam = teams.find(t => String(t.id) === String(teamId));

      const item = allReports.find(r => r.id === id);
      if (item) {
        item.organizationId = teamId;
        item.assignedTo = assignedTeam ? assignedTeam.name : teamId;
        item.isAssigned = true;
        item.assignedTeamName = assignedTeam ? assignedTeam.name : '';
        item.assignedTeamCode = assignedTeam ? (assignedTeam.teamCode || assignedTeam.team_code) : '';
        item.assignedPriority = priority;
        item.dueDate = dueDate;
      }

      document.getElementById('assignModalBackdrop').classList.remove('active');
      showToast(`Report ${id} successfully assigned to ${assignedTeam ? assignedTeam.name : 'team'}.`);
      applyFiltersAndSort();
      renderTable();
    } catch (err) {
      alert(`Error assigning report: ${err.message}`);
    }
  }

  /**
   * Sort Handler
   */
  function handleSortClick(field) {
    if (sortField === field) {
      sortAscending = !sortAscending;
    } else {
      sortField = field;
      sortAscending = true;
    }

    // Update table header UI
    document.querySelectorAll('.table th.sortable').forEach(th => {
      th.classList.remove('sorted-asc', 'sorted-desc');
      const indicator = th.querySelector('.sort-indicator');
      if (indicator) indicator.textContent = '⇅';
    });

    const activeTh = document.querySelector(`.table th[data-sort="${field}"]`);
    if (activeTh) {
      activeTh.classList.add(sortAscending ? 'sorted-asc' : 'sorted-desc');
      const indicator = activeTh.querySelector('.sort-indicator');
      if (indicator) indicator.textContent = sortAscending ? '▲' : '▼';
    }

    applyFiltersAndSort();
    renderTable();
  }

  /**
   * Reset All Filters
   */
  window.resetAllReportsFilters = function () {
    document.getElementById('reportsSearchInput').value = '';
    document.getElementById('filterCategorySelect').value = 'all';
    document.getElementById('filterSeveritySelect').value = 'all';
    document.getElementById('filterStatusSelect').value = 'all';
    document.getElementById('filterDateSelect').value = 'all';
    document.getElementById('filterLocationSelect').value = 'all';
    currentPage = 1;
    applyFiltersAndSort();
    renderTable();
  };

  /**
   * Create Proposal from Selection
   */
  window.createProposalFromSelected = function () {
    if (selectedReportIds.size === 0) return;
    const idList = Array.from(selectedReportIds).join(',');
    window.location.href = `proposal.html?reportIds=${encodeURIComponent(idList)}`;
  };

  /**
   * Clear Selection
   */
  window.clearReportsSelection = function () {
    selectedReportIds.clear();
    saveStoredSelection();
    renderTable();
  };

  let listenersAttached = false;

  window.initReportsRetry = function () {
    const tbody = document.getElementById('reportsTableBody');
    if (tbody) {
      tbody.innerHTML = `
        <tr class="skeleton-row">
          <td colspan="10" style="text-align: center; padding: var(--space-8);">
            <div class="skeleton-loading-banner">
              <span class="skeleton-loading-dot"></span>
              <span>Loading environmental intelligence...</span>
            </div>
          </td>
        </tr>
      `;
    }
    initReports();
  };

  /**
   * Initialize Reports Controller
   */
  async function initReports() {
    loadStoredSelection();

    // Fetch reports
    try {
      allReports = await window.EarthData.getReports();
    } catch (err) {
      console.error('Failed to load reports:', err);
      const tbody = document.getElementById('reportsTableBody');
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="10" style="text-align: center; padding: var(--space-8); color: var(--c-text-primary);">
              <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-3);">
                <i data-lucide="alert-circle" style="width: 28px; height: 28px; color: var(--c-accent-brick, #B91C1C);"></i>
                <div style="font-weight: 600; font-size: var(--text-sm);">
                  Could not load reports &mdash; ${escapeHtml(err.message || 'Unknown error')}
                </div>
                <button type="button" class="btn btn-primary btn-sm" onclick="window.initReportsRetry()">
                  <i data-lucide="rotate-ccw"></i>
                  <span>Retry</span>
                </button>
              </div>
            </td>
          </tr>
        `;
        if (window.lucide) lucide.createIcons();
      }
      return;
    }

    // Bind Filter Controls
    const searchInput = document.getElementById('reportsSearchInput');
    const catSelect = document.getElementById('filterCategorySelect');
    const sevSelect = document.getElementById('filterSeveritySelect');
    const statSelect = document.getElementById('filterStatusSelect');
    const dateSelect = document.getElementById('filterDateSelect');
    const locSelect = document.getElementById('filterLocationSelect');
    const pageSizeSelect = document.getElementById('pageSizeSelect');

    // Prefill filter inputs from URL search parameters if provided
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const statusParam = urlParams.get('status');
    if (searchParam && searchInput) {
      searchInput.value = searchParam;
    }
    if (statusParam && statSelect) {
      statSelect.value = statusParam;
    }

    if (!listenersAttached) {
      listenersAttached = true;

      let debounceTimer = null;
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            currentPage = 1;
            applyFiltersAndSort();
            renderTable();
          }, 150);
        });
      }

      [catSelect, sevSelect, statSelect, dateSelect, locSelect].forEach(el => {
        if (el) {
          el.addEventListener('change', () => {
            currentPage = 1;
            applyFiltersAndSort();
            renderTable();
          });
        }
      });

      if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', (e) => {
          pageSize = parseInt(e.target.value, 10) || 10;
          currentPage = 1;
          renderTable();
        });
      }

      // Bind Pagination Buttons
      document.getElementById('btnPrevPage').addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderTable();
        }
      });

      document.getElementById('btnNextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredReports.length / pageSize);
        if (currentPage < totalPages) {
          currentPage++;
          renderTable();
        }
      });

      // Bind Master Select-All Checkbox
      const selectAllCheckbox = document.getElementById('selectAllCheckbox');
      if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
          const visibleReports = getPaginatedReports();
          if (e.target.checked) {
            visibleReports.forEach(r => selectedReportIds.add(r.id));
          } else {
            visibleReports.forEach(r => selectedReportIds.delete(r.id));
          }
          saveStoredSelection();
          renderTable();
        });
      }

      // Bind Sortable Headers
      document.querySelectorAll('.table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
          const field = th.getAttribute('data-sort');
          if (field) handleSortClick(field);
        });
      });

      // Close action dropdowns on outside click
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.action-menu-container')) {
          document.querySelectorAll('.action-menu-dropdown.active').forEach(m => {
            m.classList.remove('active');
          });
        }
      });

      // Assign Modal Close buttons
      const closeAssignBtn = document.getElementById('closeAssignModalBtn');
      const cancelAssignBtn = document.getElementById('cancelAssignModalBtn');
      const submitAssignBtn = document.getElementById('submitAssignModalBtn');

      if (closeAssignBtn) {
        closeAssignBtn.addEventListener('click', () => {
          document.getElementById('assignModalBackdrop').classList.remove('active');
        });
      }
      if (cancelAssignBtn) {
        cancelAssignBtn.addEventListener('click', () => {
          document.getElementById('assignModalBackdrop').classList.remove('active');
        });
      }
      if (submitAssignBtn) {
        submitAssignBtn.addEventListener('click', submitAssignModal);
      }
    }

    // Initial Filter & Render
    applyFiltersAndSort();
    renderTable();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReports);
  } else {
    initReports();
  }
})();
