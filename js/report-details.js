/**
 * Prakarti Report — NGO Environmental Intelligence & Action Platform
 * js/report-details.js — In-Depth Incident Dossier, Verification Audit & Dispatch Controller
 * 
 * Strict Architecture Rule:
 * All data persistence goes through EarthData (js/data.js):
 * - EarthData.getReportById(id)
 * - EarthData.updateReportStatus(id, status)
 * - EarthData.addReportNote(id, noteText, author)
 * - EarthData.assignReport(id, workerName, priority, dueDate, org)
 * - EarthData.getFieldWorkers()
 * 
 * Strictly adheres to Ethical AI Language:
 * - "AI-detected suspected issue"
 * - Never "proves" or "confirms" without ground validation.
 */

(function () {
  'use strict';

  // Storage key for proposal generation selection
  const STORAGE_BULK_KEY = 'earthforward_selected_reports';

  // State
  let currentReportId = null;
  let currentReport = null;
  let registeredTeams = [];

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
   * Helper: Category Large Evidence SVG Graphics (Monochrome Green Scale Only)
   */
  function getCategoryEvidenceGraphic(category) {
    const cat = (category || '').toLowerCase();

    if (cat.includes('industrial') || cat.includes('emission')) {
      return `
        <svg viewBox="0 0 100 100" fill="none" stroke="#315C3A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 85h80"/>
          <path d="M22 85V42l20 14V30l28 18v37"/>
          <path d="M70 44h8"/>
          <path d="M70 36h8"/>
          <path d="M30 24c-2-6 2-12 8-14 4 3 6 8 4 12" stroke-dasharray="3 3"/>
          <path d="M48 18c-3-5 1-10 6-12 3 3 5 7 3 10" stroke-dasharray="3 3"/>
          <rect x="28" y="58" width="8" height="12" fill="#DDEFE0" stroke="#315C3A"/>
          <rect x="52" y="58" width="8" height="12" fill="#DDEFE0" stroke="#315C3A"/>
        </svg>
      `;
    }
    if (cat.includes('waste') && cat.includes('burning')) {
      return `
        <svg viewBox="0 0 100 100" fill="none" stroke="#315C3A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 85h70"/>
          <path d="M38 78c-8-6-13-16-13-26 0-16 12-28 25-36 2 8 8 16 16 20 6 3 10 9 10 16 0 14-11 26-25 26-4 0-9-1-13-3"/>
          <path d="M45 76c-4-4-6-9-6-15 0-8 6-15 12-19 1 4 4 8 8 10 3 2 5 5 5 9 0 7-6 13-13 13-2 0-4-1-6-2"/>
          <circle cx="28" cy="30" r="2" fill="#315C3A"/>
          <circle cx="70" cy="36" r="1.5" fill="#315C3A"/>
        </svg>
      `;
    }
    if (cat.includes('crop') || cat.includes('stubble')) {
      return `
        <svg viewBox="0 0 100 100" fill="none" stroke="#315C3A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 85h76"/>
          <path d="M28 85V40c0-12 10-22 22-22"/>
          <path d="M28 65c10-2 18-10 18-20"/>
          <path d="M28 50c8-2 14-8 14-16"/>
          <path d="M62 85V55c0-10 8-18 18-18"/>
          <path d="M62 70c6-2 12-7 12-14"/>
          <path d="M42 30c-2-8 3-14 10-16" stroke-dasharray="2 3"/>
        </svg>
      `;
    }
    if (cat.includes('water')) {
      return `
        <svg viewBox="0 0 100 100" fill="none" stroke="#315C3A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M50 16 C32 40, 24 54, 24 68 A26 26 0 0 0 76 68 C76 54, 68 40, 50 16 Z" fill="#F0F7F1"/>
          <path d="M30 68c4 3 8 4 12 2s8-4 12-2 8 4 12 2" stroke-width="2"/>
          <path d="M34 76c3 2 7 3 10 1s7-3 10-1 7 3 10 1" stroke-width="2"/>
          <circle cx="50" cy="46" r="3" fill="#315C3A"/>
        </svg>
      `;
    }
    if (cat.includes('dumping') || cat.includes('garbage')) {
      return `
        <svg viewBox="0 0 100 100" fill="none" stroke="#315C3A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 32h60"/>
          <path d="M40 32V22a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v10"/>
          <path d="M28 32l5 50a5 5 0 0 0 5 4h24a5 5 0 0 0 5-4l5-50"/>
          <line x1="43" y1="44" x2="43" y2="72"/>
          <line x1="57" y1="44" x2="57" y2="72"/>
        </svg>
      `;
    }
    if (cat.includes('air')) {
      return `
        <svg viewBox="0 0 100 100" fill="none" stroke="#315C3A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 55c0-12 10-22 22-22 3 0 6 .6 9 1.7A26 26 0 0 1 82 46c5 3 8 8 8 14 0 9-7 16-16 16H28a16 16 0 0 1-10-21z"/>
          <path d="M26 62h48" stroke-dasharray="4 4"/>
          <path d="M32 70h32" stroke-dasharray="3 3"/>
        </svg>
      `;
    }
    if (cat.includes('sewage') || cat.includes('drainage')) {
      return `
        <svg viewBox="0 0 100 100" fill="none" stroke="#315C3A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="18" y="24" width="64" height="24" rx="4" fill="#F0F7F1"/>
          <line x1="28" y1="24" x2="28" y2="48"/>
          <line x1="42" y1="24" x2="42" y2="48"/>
          <line x1="58" y1="24" x2="58" y2="48"/>
          <line x1="72" y1="24" x2="72" y2="48"/>
          <path d="M30 58l8 24h24l8-24"/>
          <path d="M22 82h56"/>
        </svg>
      `;
    }
    if (cat.includes('vehicle')) {
      return `
        <svg viewBox="0 0 100 100" fill="none" stroke="#315C3A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="14" y="32" width="46" height="34" rx="3" fill="#F0F7F1"/>
          <path d="M60 44h18l10 12v10H60V44z"/>
          <circle cx="32" cy="68" r="9" fill="#DDEFE0"/>
          <circle cx="74" cy="68" r="9" fill="#DDEFE0"/>
          <path d="M10 48c-4-1-7-3-7-6 0-5 6-7 11-7" stroke-dasharray="2 3"/>
        </svg>
      `;
    }
    if (cat.includes('deforestation')) {
      return `
        <svg viewBox="0 0 100 100" fill="none" stroke="#315C3A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 85h76"/>
          <path d="M50 20v65"/>
          <path d="M30 45l20-18 20 18"/>
          <path d="M22 62l28-20 28 20"/>
          <path d="M66 74l14-6"/>
        </svg>
      `;
    }
    // Plastic waste / packaging default
    return `
      <svg viewBox="0 0 100 100" fill="none" stroke="#315C3A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M36 22h28l8 12v46a4 4 0 0 1-4 4H32a4 4 0 0 1-4-4V34l8-12z" fill="#F0F7F1"/>
        <path d="M42 22V16a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6"/>
        <path d="M38 42h24"/>
        <path d="M38 52h24"/>
        <path d="M38 62h16"/>
      </svg>
    `;
  }

  /**
   * Helper: Format Date nicely
   */
  function formatDate(dateStr, includeTime = true) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const opts = {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      };
      if (includeTime) {
        opts.hour = '2-digit';
        opts.minute = '2-digit';
      }
      return d.toLocaleDateString('en-US', opts);
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * Helper: Normalize Status Badge Class
   */
  function getStatusBadgeClass(status) {
    const s = (status || '').toLowerCase().replace(/\s+/g, '');
    if (s === 'reported') return 'badge-status-reported';
    if (s === 'aianalyzed' || s === 'analyzed') return 'badge-status-aianalyzed';
    if (s === 'underreview' || s === 'review') return 'badge-status-underreview';
    if (s === 'verified') return 'badge-status-verified';
    if (s === 'actioninitiated' || s === 'action') return 'badge-status-actioninitiated';
    if (s === 'resolved') return 'badge-status-resolved';
    if (s === 'rejected') return 'badge-status-rejected';
    return 'badge-status-reported';
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
   * Initialize and Load Report Details
   */
  async function initReportDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    currentReportId = urlParams.get('id');

    const loadingState = document.getElementById('detailsLoadingState');
    const errorState = document.getElementById('detailsErrorState');
    const content = document.getElementById('detailsContent');

    try {
      // 1. Fetch report from EarthData
      if (!currentReportId) {
        const allReports = await window.EarthData.getReports();
        if (allReports && allReports.length > 0) {
          currentReportId = allReports[0].id;
        }
      }

      if (currentReportId) {
        currentReport = await window.EarthData.getReportById(currentReportId);
      }

      // 2. Fetch teams for assignment dropdown
      try {
        registeredTeams = await window.EarthData.getOrganizations();
      } catch (e) {
        console.warn('Failed to load organizations:', e);
        registeredTeams = [];
      }

      // Update hotspot context link
      const btnHotspotContext = document.getElementById('btnHotspotContext');
      if (btnHotspotContext && currentReportId) {
        btnHotspotContext.href = `hotspots.html?report=${encodeURIComponent(currentReportId)}`;
        console.log('hotspot link:', btnHotspotContext.href);
      }

      if (!currentReport) {
        loadingState.style.display = 'none';
        errorState.style.display = 'flex';
        content.style.display = 'none';
        return;
      }

      // Render full UI
      renderEvidencePanel();
      renderReportInformation();
      renderWorkflowControls();
      renderAssignmentPanel();
      renderTimeline();
      renderNotes();

      // Show content
      loadingState.style.display = 'none';
      errorState.style.display = 'none';
      content.style.display = 'block';

      // Attach interaction event listeners
      setupEventListeners();

      // Refresh lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }

    } catch (err) {
      console.error('Failed to load report details:', err);
      loadingState.style.display = 'none';
      errorState.style.display = 'flex';
      content.style.display = 'none';
    }
  }

  /**
   * Render Left Column: Evidence Dossier
   */
  function renderEvidencePanel() {
    const r = currentReport;

    // Header ID pill
    const idDisplay = document.getElementById('displayReportId');
    if (idDisplay) idDisplay.textContent = r.id;

    // Real Report Image or Fallback
    const imgEl = document.getElementById('evidenceReportImg');
    const fallbackEl = document.getElementById('evidenceImgFallback');
    if (imgEl && fallbackEl) {
      if (r.imageUrl) {
        imgEl.src = r.imageUrl;
        imgEl.style.display = 'block';
        fallbackEl.style.display = 'none';
        imgEl.onerror = () => {
          imgEl.style.display = 'none';
          fallbackEl.style.display = 'flex';
        };
      } else {
        imgEl.style.display = 'none';
        fallbackEl.style.display = 'flex';
      }
    }

    // Verified badge flag
    const verifiedFlag = document.getElementById('evidenceVerifiedFlag');
    if (verifiedFlag) {
      if (r.status === 'Verified') {
        verifiedFlag.className = 'badge badge-status-verified';
        verifiedFlag.innerHTML = '<span class="dot"></span> Ground Verified';
      } else if (r.status === 'Resolved') {
        verifiedFlag.className = 'badge badge-status-resolved';
        verifiedFlag.innerHTML = '<span class="dot"></span> Remediated';
      } else if (r.status === 'Rejected') {
        verifiedFlag.className = 'badge badge-status-rejected';
        verifiedFlag.innerHTML = '<span class="dot"></span> Inconclusive';
      } else {
        verifiedFlag.className = 'badge';
        verifiedFlag.innerHTML = '<span class="dot"></span> Suspected Issue';
      }
    }

    // Meta attributes
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || '—';
    };

    setTxt('metaCategory', r.category || 'Uncategorized');
    setTxt('metaLocation', r.location || '—');
    setTxt('metaCity', r.city ? `${r.city}, NCR` : '—');

    if (r.coordinates && r.coordinates[0] && r.coordinates[1]) {
      setTxt('metaCoordinates', `${r.coordinates[0].toFixed(4)}°N, ${r.coordinates[1].toFixed(4)}°E`);
    } else {
      setTxt('metaCoordinates', '—');
    }

    setTxt('metaDate', formatDate(r.reportDate, true));

    // Confidence score with visual fill bar (null -> —)
    const confBar = document.getElementById('metaConfidenceBar');
    const confTxt = document.getElementById('metaConfidenceText');
    if (r.confidence !== null && r.confidence !== undefined) {
      const confPct = Math.round(r.confidence * 100);
      if (confBar) confBar.style.width = `${confPct}%`;
      if (confTxt) confTxt.textContent = `${confPct}%`;
    } else {
      if (confBar) confBar.style.width = '0%';
      if (confTxt) confTxt.textContent = '—';
    }

    // Severity dot & text (null -> Unassessed)
    const sevDot = document.getElementById('metaSeverityDot');
    const sevTxt = document.getElementById('metaSeverityText');
    const sev = r.severity || 'Unassessed';
    if (sevDot) {
      sevDot.className = 'intensity-dot ' + (
        sev === 'High' ? 'dot-high' :
        sev === 'Medium' ? 'dot-medium' :
        sev === 'Low' ? 'dot-low' : 'dot-unassessed'
      );
    }
    if (sevTxt) sevTxt.textContent = sev;

    // Current Audit Status Badge
    updateStatusBadgeUI(r.status, false);

    // Organization / Team
    if (r.isAssigned) {
      const codeStr = r.assignedTeamCode ? ` (${r.assignedTeamCode})` : '';
      setTxt('metaOrganization', `${r.assignedTeamName || r.assignedTo || r.organization}${codeStr}`);
    } else {
      setTxt('metaOrganization', '—');
    }
  }

  /**
   * Update Status Badge with Animation
   */
  function updateStatusBadgeUI(newStatus, animate = true) {
    const badgeEl = document.getElementById('evidenceStatusBadge');
    const txtEl = document.getElementById('evidenceStatusText');
    if (!badgeEl || !txtEl) return;

    txtEl.textContent = newStatus;
    badgeEl.className = `badge ${getStatusBadgeClass(newStatus)}`;

    if (animate) {
      badgeEl.classList.remove('badge-animate');
      // Trigger reflow for CSS animation restart
      void badgeEl.offsetWidth;
      badgeEl.classList.add('badge-animate');
    }
  }

  /**
   * Render Right Column: Report Information Details
   */
  function renderReportInformation() {
    const r = currentReport;

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || '—';
    };

    setTxt('reportTitle', r.title || 'Environmental Incident');
    setTxt('reportSubmittedBy', r.submittedBy || 'Citizen Sentinel');
    setTxt('reportHeaderDate', formatDate(r.reportDate, false));
    setTxt('reportHeaderLocation', r.location ? `${r.location}, ${r.city || ''}` : (r.city || '—'));

    // Narrative description
    setTxt('reportDescription', r.description || 'No citizen description recorded.');

    // AI Observation & Analysis card
    const aiCatEl = document.getElementById('aiMetaCategory');
    if (aiCatEl) aiCatEl.textContent = r.aiCategory || r.category || '—';

    const aiConfEl = document.getElementById('aiMetaConfidence');
    if (aiConfEl) {
      const c = r.aiConfidence !== null && r.aiConfidence !== undefined ? r.aiConfidence : r.confidence;
      aiConfEl.textContent = (c !== null && c !== undefined) ? `${Math.round(c * 100)}%` : '—';
    }

    const aiObsEl = document.getElementById('reportAiObservations');
    if (aiObsEl) {
      const text = r.aiDescription || r.aiObservations;
      aiObsEl.textContent = (text && text.trim().length > 0)
        ? text
        : 'AI analysis not available for this report yet.';
    }
  }

  const WORKFLOW_ORDER = [
    'Reported',
    'AI Analyzed',
    'Under Review',
    'Verified',
    'Action Initiated',
    'Resolved'
  ];

  /**
   * Render Workflow Stage Control Buttons
   */
  function renderWorkflowControls() {
    const container = document.getElementById('workflowButtonsContainer');
    if (!container) return;

    const currentStatus = currentReport.status;
    const stageButtons = container.querySelectorAll('.btn-stage');
    const currentIndex = WORKFLOW_ORDER.indexOf(currentStatus);

    stageButtons.forEach(btn => {
      const stage = btn.getAttribute('data-stage');
      btn.classList.remove('completed-stage', 'current-stage');

      if (stage === 'Rejected') {
        if (currentStatus === 'Rejected') {
          btn.classList.add('current-stage');
        }
        return;
      }

      if (currentStatus === 'Rejected') {
        return;
      }

      const stageIdx = WORKFLOW_ORDER.indexOf(stage);
      if (stageIdx !== -1 && currentIndex !== -1) {
        if (stageIdx < currentIndex) {
          btn.classList.add('completed-stage');
        } else if (stageIdx === currentIndex) {
          btn.classList.add('completed-stage', 'current-stage');
        }
      }
    });
  }

  /**
   * Render Team Assignment Panel
   */
  function renderAssignmentPanel() {
    const r = currentReport;

    const select = document.getElementById('assignWorkerSelect');
    const submitBtn = document.getElementById('btnSubmitAssignment');
    const prioritySelect = document.getElementById('assignPrioritySelect');
    const dateInput = document.getElementById('assignDueDateInput');

    const today = new Date();
    const minDateStr = today.toISOString().split('T')[0];
    const defaultDue = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (select) {
      if (registeredTeams && registeredTeams.length > 0) {
        select.disabled = false;
        select.innerHTML = '<option value="">Choose Team...</option>' + 
          registeredTeams.map(t => {
            const code = t.teamCode || t.team_code || '—';
            const count = t.memberCount !== null && t.memberCount !== undefined ? t.memberCount : (t.member_count || 0);
            const isSelected = (r.organizationId && String(r.organizationId) === String(t.id));
            return `
              <option value="${t.id}" ${isSelected ? 'selected' : ''}>
                ${escapeHtml(t.name)} (${escapeHtml(code)}) — ${count} members
              </option>
            `;
          }).join('');

        if (prioritySelect) {
          prioritySelect.disabled = false;
          prioritySelect.value = r.assignedPriority || r.priority || 'Medium';
        }

        if (dateInput) {
          dateInput.disabled = false;
          dateInput.min = minDateStr;
          dateInput.value = r.dueDate ? r.dueDate.split('T')[0] : defaultDue;
        }

        if (submitBtn) submitBtn.disabled = false;
      } else {
        select.disabled = true;
        select.innerHTML = '<option value="" disabled selected>No teams registered yet.</option>';
        if (prioritySelect) prioritySelect.disabled = true;
        if (dateInput) dateInput.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
      }
    }

    updateAssignmentBadgeDisplay();
  }

  function updateAssignmentBadgeDisplay() {
    const r = currentReport;
    const nameEl = document.getElementById('assignedWorkerName');
    const detailsEl = document.getElementById('assignedWorkerDetails');
    const priorityBadge = document.getElementById('assignedPriorityBadge');
    const submitBtn = document.getElementById('btnSubmitAssignment');

    if (r.isAssigned || r.assignedTo) {
      const teamName = r.assignedTeamName || r.assignedTo;
      const teamCode = r.assignedTeamCode ? `[${r.assignedTeamCode}] • ` : '';
      const priority = r.assignedPriority || r.priority || 'Medium';
      const dueStr = r.dueDate ? formatDate(r.dueDate, false) : '—';

      if (nameEl) nameEl.textContent = `Assigned to ${teamName}`;
      if (detailsEl) detailsEl.textContent = `${teamCode}Target Due Date: ${dueStr} • Priority: ${priority}`;
      if (priorityBadge) {
        priorityBadge.className = 'badge ' + (
          priority === 'High' ? 'badge-severity-high' :
          priority === 'Low' ? 'badge-severity-low' : 'badge-severity-medium'
        );
        priorityBadge.innerHTML = `<span class="dot"></span> Assigned (${priority})`;
      }
      if (submitBtn) {
        submitBtn.innerHTML = '<i data-lucide="check"></i> <span>Reassign Team</span>';
      }
    } else {
      if (nameEl) nameEl.textContent = 'Unassigned';
      if (detailsEl) detailsEl.textContent = 'Field team dispatch pending registration of teams';
      if (priorityBadge) {
        priorityBadge.className = 'badge';
        priorityBadge.innerHTML = '<span class="dot"></span> Action Pending';
      }
      if (submitBtn) {
        submitBtn.innerHTML = '<i data-lucide="check"></i> <span>Assign Team</span>';
      }
    }
    if (submitBtn && window.lucide) {
      window.lucide.createIcons({ root: submitBtn });
    }
  }

  /**
   * Render Vertical Issue Status Timeline
   * Green dots + thin connecting line built from report.statusHistory
   */
  function renderTimeline() {
    const timelineContainer = document.getElementById('verticalIssueTimeline');
    const countBadge = document.getElementById('timelineEventCount');
    if (!timelineContainer) return;

    const history = currentReport.statusHistory || [];
    if (countBadge) {
      countBadge.textContent = `${history.length} Event${history.length === 1 ? '' : 's'} Logged`;
    }

    if (history.length === 0) {
      timelineContainer.innerHTML = `
        <div style="font-size: var(--text-xs); color: var(--c-text-secondary); font-style: italic; padding: var(--space-3) 0;">
          No status transitions recorded yet.
        </div>
      `;
      return;
    }

    // Render chronological steps (latest first for intuitive timeline reading)
    const reversedHistory = [...history].reverse();

    timelineContainer.innerHTML = reversedHistory.map((item, index) => {
      const isLatest = index === 0;
      return `
        <div class="timeline-step ${isLatest ? 'latest' : ''}">
          <div class="timeline-dot" title="${item.status}"></div>
          <div class="timeline-content">
            <div class="timeline-content-header">
              <span class="timeline-status-title">
                ${item.status}
                ${isLatest ? '<span class="badge badge-status-verified" style="font-size:9px; margin-left:6px; padding:1px 6px;">Active</span>' : ''}
              </span>
              <span class="timeline-time">${formatDate(item.timestamp, true)}</span>
            </div>
            <p class="timeline-note">${item.note || 'Status milestone updated.'}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render NGO Internal Notes List
   */
  function renderNotes() {
    const listEl = document.getElementById('ngoNotesList');
    const countPill = document.getElementById('notesCountPill');
    if (!listEl) return;

    const notes = currentReport.notes || [];
    if (countPill) {
      countPill.textContent = `${notes.length} Note${notes.length === 1 ? '' : 's'}`;
    }

    if (notes.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: var(--space-6) 0; color: var(--c-text-secondary); font-size: var(--text-xs); background: var(--c-surface-subtle); border-radius: var(--radius-md); border: 1px dashed var(--c-border-light);">
          <i data-lucide="file-text" style="width: 20px; height: 20px; margin-bottom: 4px; opacity: 0.5;"></i>
          <div>No internal notes recorded for this incident yet.</div>
          <div style="font-size: 11px; margin-top: 2px;">Submit the first field observation using the form above.</div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons({ root: listEl });
      return;
    }

    listEl.innerHTML = notes.map(note => `
      <div class="note-entry">
        <div class="note-header">
          <span class="note-author">${note.author || 'Team member'}</span>
          <span class="note-timestamp">${formatDate(note.timestamp, true)}</span>
        </div>
        <p class="note-body">${note.text}</p>
      </div>
    `).join('');
  }

  /**
   * Event Listeners Setup
   */
  function setupEventListeners() {
    // 1. Workflow Stage Advancement Buttons
    const workflowButtons = document.querySelectorAll('.btn-stage');
    workflowButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const newStage = btn.getAttribute('data-stage');
        if (!newStage || newStage === currentReport.status) return;

        try {
          btn.style.opacity = '0.6';
          btn.style.pointerEvents = 'none';

          // Call API in data.js
          const updated = await window.EarthData.updateReportStatus(currentReport.id, newStage);
          currentReport = updated;

          // Reflect UI changes instantly
          updateStatusBadgeUI(newStage, true);
          renderWorkflowControls();
          renderTimeline();
          renderNotes();

          // Update verified flag in evidence panel
          const verifiedFlag = document.getElementById('evidenceVerifiedFlag');
          if (verifiedFlag) {
            if (newStage === 'Verified') {
              verifiedFlag.className = 'badge badge-status-verified';
              verifiedFlag.innerHTML = '<span class="dot"></span> Ground Verified';
            } else if (newStage === 'Resolved') {
              verifiedFlag.className = 'badge badge-status-resolved';
              verifiedFlag.innerHTML = '<span class="dot"></span> Remediated';
            } else if (newStage === 'Rejected') {
              verifiedFlag.className = 'badge badge-status-rejected';
              verifiedFlag.innerHTML = '<span class="dot"></span> Inconclusive';
            } else {
              verifiedFlag.className = 'badge';
              verifiedFlag.innerHTML = '<span class="dot"></span> Suspected Issue';
            }
          }

          showToast(`Incident status updated to "${newStage}".`);
        } catch (err) {
          console.error('Error updating status:', err);
          showToast(err.message || 'Update failed: You do not have permission to update this report. Only the report author or an authorized team member can update status.', 'error');
        } finally {
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
        }
      });
    });

    // 2. Team Assignment Form
    const assignmentForm = document.getElementById('assignmentForm');
    if (assignmentForm) {
      assignmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const teamId = document.getElementById('assignWorkerSelect').value;
        const priority = document.getElementById('assignPrioritySelect').value;
        const dueDate = document.getElementById('assignDueDateInput').value;

        if (!teamId) {
          showToast('Please select a team.', 'error');
          return;
        }

        const submitBtn = document.getElementById('btnSubmitAssignment');
        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Assigning...';
          }

          await window.EarthData.assignReportToTeam(
            currentReport.id,
            teamId,
            priority,
            dueDate
          );

          const matchedTeam = registeredTeams.find(t => String(t.id) === String(teamId));
          currentReport.organizationId = teamId;
          currentReport.assignedTo = matchedTeam ? matchedTeam.name : teamId;
          currentReport.isAssigned = true;
          currentReport.assignedTeamName = matchedTeam ? matchedTeam.name : '';
          currentReport.assignedTeamCode = matchedTeam ? (matchedTeam.teamCode || matchedTeam.team_code) : '';
          currentReport.assignedPriority = priority;
          currentReport.dueDate = dueDate;

          // Re-render UI
          renderEvidencePanel();
          updateAssignmentBadgeDisplay();
          renderWorkflowControls();
          updateStatusBadgeUI(currentReport.status, true);
          renderTimeline();
          renderNotes();

          showToast(`Assigned to ${matchedTeam ? matchedTeam.name : 'team'} — Target: ${formatDate(dueDate, false)}`);
        } catch (err) {
          console.error('Error assigning team:', err);
          showToast(err.message || 'Failed to assign team.', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            updateAssignmentBadgeDisplay();
          }
        }
      });
    }

    // 3. Add NGO Note Form
    const noteForm = document.getElementById('noteForm');
    if (noteForm) {
      noteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textarea = document.getElementById('noteTextInput');
        const text = textarea ? textarea.value.trim() : '';

        if (!text) return;

        const addBtn = document.getElementById('btnAddNote');
        try {
          if (addBtn) {
            addBtn.disabled = true;
            addBtn.innerHTML = 'Saving...';
          }

          // Persist note via EarthData.addReportNote
          const updated = await window.EarthData.addReportNote(
            currentReport.id,
            text
          );
          currentReport = updated;

          // Clear textarea & refresh list
          textarea.value = '';
          renderNotes();

          showToast('Internal note recorded and saved.');
        } catch (err) {
          console.error('Error adding note:', err);
          showToast(err.message || 'Failed to save note. Make sure you are signed in.', 'error');
        } finally {
          if (addBtn) {
            addBtn.disabled = false;
            addBtn.innerHTML = '<i data-lucide="plus"></i> <span>Add Note</span>';
            if (window.lucide) window.lucide.createIcons({ root: addBtn });
          }
        }
      });
    }

    // 4. "Draft Action Proposal" button integration
    const proposalBtn = document.getElementById('btnIncludeProposal');
    if (proposalBtn) {
      proposalBtn.addEventListener('click', (e) => {
        try {
          let selected = [];
          const stored = sessionStorage.getItem(STORAGE_BULK_KEY);
          if (stored) {
            selected = JSON.parse(stored);
          }
          if (!selected.includes(currentReport.id)) {
            selected.push(currentReport.id);
            sessionStorage.setItem(STORAGE_BULK_KEY, JSON.stringify(selected));
          }
        } catch (err) {
          console.warn('Session storage error:', err);
        }
      });
    }
  }

  // Self-execute initialization on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReportDetails);
  } else {
    initReportDetails();
  }

})();
