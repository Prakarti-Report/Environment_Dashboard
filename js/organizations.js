/**
 * Prakarti Report — NGO Environmental Intelligence & Action Platform
 * js/organizations.js — Accredited Regional Teams & Field Directory Controller
 * 
 * Strict Architecture Rule:
 * All data access goes through EarthData (js/data.js):
 * - EarthData.getOrganizations()
 * - EarthData.getReports()
 * - EarthData.createOrganization()
 */

(function () {
  'use strict';

  // Storage key for proposal generation selection
  const STORAGE_BULK_KEY = 'earthforward_selected_reports';

  // State
  let organizationsList = [];
  let allReports = [];

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getInitials(name) {
    if (!name || typeof name !== 'string') return 'TM';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return '—';
    }
  }

  function showToast(message, type = 'success') {
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
      <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-triangle'}" style="width:16px; height:16px; color:${type === 'success' ? 'var(--c-primary)' : '#b91c1c'}; flex-shrink:0;"></i>
      <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: toast });
    }

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  function animateCountUp(element, target, duration = 800) {
    if (!element) return;
    const start = 0;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (target - start) * ease);

      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }

  async function initOrganizations() {
    try {
      organizationsList = await window.EarthData.getOrganizations();
      allReports = await window.EarthData.getReports();

      renderNetworkOverviewStats();
      renderOrganizationsCards();
      setupModalListeners();

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    } catch (err) {
      console.error('Failed to initialize organizations module:', err);
    }
  }

  function renderNetworkOverviewStats() {
    const netCountEl = document.getElementById('netOrgCount');
    const netReviewedEl = document.getElementById('netTotalReviewed');
    const netResolvedEl = document.getElementById('netTotalResolved');
    const netAgentsEl = document.getElementById('netTotalAgents');

    if (!organizationsList || organizationsList.length === 0) {
      if (netCountEl) netCountEl.textContent = '0';
      if (netReviewedEl) netReviewedEl.textContent = '0';
      if (netResolvedEl) netResolvedEl.textContent = '0';
      if (netAgentsEl) netAgentsEl.textContent = '0';
      return;
    }

    if (netCountEl) animateCountUp(netCountEl, organizationsList.length);

    let cumulativeReviewed = 0;
    let cumulativeResolved = 0;
    let cumulativeAgents = 0;

    organizationsList.forEach(org => {
      const matched = allReports.filter(r => r.organizationId === org.id);
      cumulativeReviewed += matched.length;
      cumulativeResolved += matched.filter(r => r.status === 'Resolved').length;
      if (org.member_count !== null && org.member_count !== undefined) {
        cumulativeAgents += Number(org.member_count);
      }
    });

    if (netReviewedEl) animateCountUp(netReviewedEl, cumulativeReviewed);
    if (netResolvedEl) animateCountUp(netResolvedEl, cumulativeResolved);
    if (netAgentsEl) animateCountUp(netAgentsEl, cumulativeAgents);
  }

  function renderOrganizationsCards() {
    const container = document.getElementById('organizationsContainer');
    if (!container) return;

    if (!organizationsList || organizationsList.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <i data-lucide="users"></i>
          </div>
          <div class="empty-state-title">No teams registered yet.</div>
          <div class="empty-state-desc">Registered teams and field specialists will appear here once onboarded.</div>
          <button type="button" class="btn btn-primary btn-sm btn-create-team-trigger" style="margin-top: var(--space-4);">
            <i data-lucide="plus"></i>
            <span>+ Create Team</span>
          </button>
        </div>
      `;
      const triggerBtn = container.querySelector('.btn-create-team-trigger');
      if (triggerBtn) {
        triggerBtn.addEventListener('click', openCreateTeamModal);
      }
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = organizationsList.map(org => {
      const matchedReports = allReports.filter(r => r.organizationId === org.id);

      const liveReviewedCount = matchedReports.length;
      const liveResolvedCount = matchedReports.filter(r => r.status === 'Resolved').length;
      const liveActiveAssignments = matchedReports.filter(r =>
        r.status !== 'Resolved' && r.status !== 'Rejected'
      ).length;

      const resolutionRateText = liveReviewedCount > 0
        ? `${Math.round((liveResolvedCount / liveReviewedCount) * 100)}% verified resolution rate`
        : '—';

      const teamCodeText = (org.team_code && org.team_code !== '—') ? org.team_code : (org.teamCode || '—');
      const memberCountText = (org.member_count !== null && org.member_count !== undefined)
        ? `${Number(org.member_count).toLocaleString()} members`
        : '—';
      const specialistsLineText = (org.member_count !== null && org.member_count !== undefined)
        ? `${Number(org.member_count).toLocaleString()} field specialists deployed`
        : '—';

      const initials = getInitials(org.name);
      const emailHtml = org.email
        ? `<a href="mailto:${escapeHtml(org.email)}" class="org-email-link"><i data-lucide="mail" style="width:12px; height:12px;"></i><span>${escapeHtml(org.email)}</span></a>`
        : `<span style="color:var(--c-text-secondary); font-style:italic;">No email registered</span>`;

      const searchTarget = teamCodeText !== '—' ? teamCodeText : org.name;

      return `
        <article class="org-card" data-org-id="${org.id}">
          
          <div class="org-card-header">
            <div class="org-title-group">
              <div class="org-acronym-badge">${initials}</div>
              <div>
                <div style="display:flex; align-items:center; gap:var(--space-2); margin-bottom:2px; flex-wrap:wrap;">
                  <span class="org-team-code-badge">${escapeHtml(teamCodeText)}</span>
                  <h3 class="org-name" style="display:inline;">${escapeHtml(org.name)}</h3>
                </div>
                <div class="org-subtitle">
                  <span>${emailHtml}</span>
                  <span>&bull;</span>
                  <span>${memberCountText}</span>
                  <span>&bull;</span>
                  <span>Created ${formatDate(org.created_at)}</span>
                </div>
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:var(--space-2);">
              <span class="badge badge-status-verified" style="font-size:11px; padding:3px 8px;">
                <span class="dot"></span> Accredited Partner Team
              </span>
            </div>
          </div>

          <!-- The Three Core Computed Metrics -->
          <div class="org-metrics-row">
            <div class="org-metric-item">
              <span class="org-metric-label">Reports Reviewed</span>
              <span class="org-metric-number highlight">${liveReviewedCount.toLocaleString()}</span>
              <span class="org-metric-meta">${liveReviewedCount} live ingested in current audit</span>
            </div>

            <div class="org-metric-item">
              <span class="org-metric-label">Issues Resolved</span>
              <span class="org-metric-number">${liveResolvedCount.toLocaleString()}</span>
              <span class="org-metric-meta">${resolutionRateText}</span>
            </div>

            <div class="org-metric-item">
              <span class="org-metric-label">Active Assignments</span>
              <span class="org-metric-number" style="color:var(--c-primary);">${liveActiveAssignments}</span>
              <span class="org-metric-meta">${specialistsLineText}</span>
            </div>
          </div>

          <!-- Team Members Roster -->
          ${(() => {
            const membersList = Array.isArray(org.members) ? org.members : [];
            if (membersList.length > 0) {
              return `
                <div class="org-members-section">
                  <div class="org-members-header">
                    <span>Field Specialists Roster (${membersList.length})</span>
                  </div>
                  <div class="org-members-chips">
                    ${membersList.map(m => `
                      <span class="org-member-chip">
                        <i data-lucide="user"></i>
                        <span>${escapeHtml(m)}</span>
                      </span>
                    `).join('')}
                  </div>
                </div>
              `;
            } else {
              return `
                <div class="org-members-section">
                  <div class="org-members-header">
                    <span>Field Specialists Roster (0)</span>
                  </div>
                  <span style="font-size:11px; color:var(--c-text-secondary); font-style:italic;">No member names recorded yet.</span>
                </div>
              `;
            }
          })()}

          <!-- Actions Footer Row -->
          <div class="org-tags-section">
            <div></div>

            <div class="org-actions-bar">
              <a href="reports.html?search=${encodeURIComponent(searchTarget)}" class="btn btn-outline btn-sm">
                <i data-lucide="table"></i>
                <span>View Assigned Reports &rarr;</span>
              </a>
              <button type="button" class="btn btn-primary btn-sm btn-draft-org-proposal" data-org-id="${org.id}">
                <i data-lucide="file-plus"></i>
                <span>Draft Regional Proposal</span>
              </button>
            </div>
          </div>

        </article>
      `;
    }).join('');

    attachCardActionListeners();
  }

  function attachCardActionListeners() {
    const proposalButtons = document.querySelectorAll('.btn-draft-org-proposal');
    proposalButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const orgId = btn.getAttribute('data-org-id');
        const org = organizationsList.find(o => o.id === orgId);
        if (!org) return;

        const matched = allReports.filter(r => r.organizationId === org.id);

        if (matched.length > 0) {
          try {
            const memberIds = matched.map(r => r.id);
            sessionStorage.setItem(STORAGE_BULK_KEY, JSON.stringify(memberIds));
          } catch (err) {
            console.warn('Could not stage organization reports to sessionStorage:', err);
          }
        }

        window.location.href = `proposal.html?location=Noida`;
      });
    });
  }

  function renderMemberInputs(count = 3, existingNames = []) {
    const container = document.getElementById('memberInputsList');
    if (!container) return;

    const currentInputs = container.querySelectorAll('.member-input-field');
    const currentValues = (existingNames && existingNames.length > 0)
      ? existingNames
      : Array.from(currentInputs).map(inp => inp.value);

    container.innerHTML = '';
    const safeCount = Math.max(1, Math.min(count, 100));

    for (let i = 0; i < safeCount; i++) {
      const row = document.createElement('div');
      row.className = 'member-input-row';
      const defaultExample = i === 0 ? 'Aarav Sharma' : (i === 1 ? 'Priya Patel' : (i === 2 ? 'Rohan Gupta' : 'Specialist Name'));
      row.innerHTML = `
        <span class="member-input-num">${i + 1}.</span>
        <input type="text" class="member-input-field" placeholder="e.g. ${defaultExample}" value="${escapeHtml(currentValues[i] || '')}" maxlength="60" required />
        ${safeCount > 1 ? `
          <button type="button" class="btn-remove-member-row" data-index="${i}" title="Remove member" aria-label="Remove member">
            <i data-lucide="trash-2" style="width:13px; height:13px;"></i>
          </button>
        ` : ''}
      `;
      container.appendChild(row);
    }

    const removeButtons = container.querySelectorAll('.btn-remove-member-row');
    removeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const inputs = Array.from(container.querySelectorAll('.member-input-field'));
        const updated = inputs.map(inp => inp.value);
        updated.splice(idx, 1);
        const membersInput = document.getElementById('teamMembersInput');
        if (membersInput) membersInput.value = updated.length;
        renderMemberInputs(updated.length, updated);
      });
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: container });
    }
  }

  function openCreateTeamModal() {
    const backdrop = document.getElementById('createTeamModalBackdrop');
    if (!backdrop) return;
    resetCreateTeamForm();
    backdrop.classList.add('active');
    backdrop.setAttribute('aria-hidden', 'false');
    const nameInput = document.getElementById('teamNameInput');
    if (nameInput) setTimeout(() => nameInput.focus(), 100);
  }

  function closeCreateTeamModal() {
    const backdrop = document.getElementById('createTeamModalBackdrop');
    if (!backdrop) return;
    backdrop.classList.remove('active');
    backdrop.setAttribute('aria-hidden', 'true');
    resetCreateTeamForm();
  }

  function resetCreateTeamForm() {
    const form = document.getElementById('createTeamForm');
    if (form) form.reset();
    ['teamNameError', 'teamEmailError', 'teamMembersError'].forEach(id => {
      const errEl = document.getElementById(id);
      if (errEl) {
        errEl.textContent = '';
        errEl.style.display = 'none';
      }
    });
    const membersInput = document.getElementById('teamMembersInput');
    if (membersInput) membersInput.value = 3;
    renderMemberInputs(3);

    const submitBtn = document.getElementById('submitCreateTeamBtn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Team';
    }
  }

  function setupModalListeners() {
    const openBtn = document.getElementById('btnOpenCreateTeamModal');
    const closeBtn = document.getElementById('closeCreateTeamModalBtn');
    const cancelBtn = document.getElementById('cancelCreateTeamModalBtn');
    const backdrop = document.getElementById('createTeamModalBackdrop');
    const form = document.getElementById('createTeamForm');
    const membersInput = document.getElementById('teamMembersInput');
    const addMemberBtn = document.getElementById('btnAddMemberInput');

    if (openBtn) openBtn.addEventListener('click', openCreateTeamModal);
    if (closeBtn) closeBtn.addEventListener('click', closeCreateTeamModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeCreateTeamModal);

    if (membersInput) {
      membersInput.addEventListener('input', () => {
        let val = parseInt(membersInput.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 100) val = 100;
        renderMemberInputs(val);
      });
    }

    if (addMemberBtn) {
      addMemberBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let val = parseInt(membersInput ? membersInput.value : '1', 10) || 1;
        val++;
        if (membersInput) membersInput.value = val;
        renderMemberInputs(val);
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeCreateTeamModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop && backdrop.classList.contains('active')) {
        closeCreateTeamModal();
      }
    });

    if (form) {
      form.addEventListener('submit', handleCreateTeamSubmit);
    }

    // Initialize initial member inputs
    renderMemberInputs(3);
  }

  async function handleCreateTeamSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById('teamNameInput');
    const emailInput = document.getElementById('teamEmailInput');
    const membersInput = document.getElementById('teamMembersInput');

    const nameError = document.getElementById('teamNameError');
    const emailError = document.getElementById('teamEmailError');
    const membersError = document.getElementById('teamMembersError');
    const submitBtn = document.getElementById('submitCreateTeamBtn');

    // Reset errors
    [nameError, emailError, membersError].forEach(el => {
      if (el) { el.textContent = ''; el.style.display = 'none'; }
    });

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const memberCount = membersInput ? membersInput.value.trim() : '';

    let hasError = false;

    // Validate name: 2–80 chars, unique (case-insensitive)
    if (!name || name.length < 2 || name.length > 80) {
      if (nameError) {
        nameError.textContent = 'Team name must be between 2 and 80 characters.';
        nameError.style.display = 'block';
      }
      hasError = true;
    } else {
      const lower = name.toLowerCase();
      const duplicate = organizationsList.some(o => (o.name || '').toLowerCase() === lower);
      if (duplicate) {
        if (nameError) {
          nameError.textContent = 'A team with this name already exists.';
          nameError.style.display = 'block';
        }
        hasError = true;
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      if (emailError) {
        emailError.textContent = 'Please enter a valid email address.';
        emailError.style.display = 'block';
      }
      hasError = true;
    }

    // Collect individual member names
    const memberFields = document.querySelectorAll('#memberInputsList .member-input-field');
    const memberNames = Array.from(memberFields).map(inp => inp.value.trim()).filter(Boolean);

    if (memberNames.length === 0) {
      if (membersError) {
        membersError.textContent = 'Please enter at least one team member name.';
        membersError.style.display = 'block';
      }
      hasError = true;
    } else if (memberNames.some(m => m.length < 2)) {
      if (membersError) {
        membersError.textContent = 'Each member name must be at least 2 characters long.';
        membersError.style.display = 'block';
      }
      hasError = true;
    }

    if (hasError) return;

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating…';
      }

      const created = await window.EarthData.createOrganization({
        name,
        email,
        memberCount: memberNames.length,
        members: memberNames
      });

      closeCreateTeamModal();
      const code = created.team_code || created.teamCode || 'TEAM';
      showToast(`Team created — ID ${code} with ${memberNames.length} members`);

      // Re-fetch and re-render without page reload
      organizationsList = await window.EarthData.getOrganizations();
      allReports = await window.EarthData.getReports();

      renderNetworkOverviewStats();
      renderOrganizationsCards();

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    } catch (err) {
      console.warn('Failed to create team:', err);
      const msg = err.message || 'Failed to create team.';
      if (msg.includes('already exists')) {
        if (nameError) {
          nameError.textContent = msg;
          nameError.style.display = 'block';
        }
      } else {
        showToast(msg, 'error');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Team';
      }
    }
  }

  // Self-execute on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrganizations);
  } else {
    initOrganizations();
  }

})();
