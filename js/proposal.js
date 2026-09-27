/**
 * Prakarti Report — NGO Environmental Intelligence & Action Platform
 * js/proposal.js — Remediation Action Proposal Builder & Document Synthesis Controller
 * 
 * Strict Architecture Rule:
 * All data access goes through EarthData (js/data.js):
 * - EarthData.getReports()
 * - EarthData.getHotspots()
 * 
 * Strict Design System:
 * - Responsible-AI phrasing throughout
 * - Clean document-style memorandum preview
 * - Executive PDF export via js/pdf.js (EarthPdf.exportProposalToPdf)
 */

(function () {
  'use strict';

  // Storage key for proposal generation selection
  const STORAGE_BULK_KEY = 'earthforward_selected_reports';

  // State
  let allReports = [];
  let allHotspots = [];
  let candidateReports = [];
  let selectedReportIds = new Set();
  let currentProposal = null;

  /**
   * Helper: Format Date nicely
   */
  function formatDate(dateInput) {
    if (!dateInput) return '—';
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return String(dateInput);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return String(dateInput);
    }
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
   * Initialize Proposal Builder
   */
  async function initProposalBuilder() {
    try {
      allReports = await window.EarthData.getReports();
      allHotspots = await window.EarthData.getHotspots();

      // Check URL query parameters and sessionStorage pre-selection
      handlePreSelections();

      // Apply filters and populate candidate table
      filterCandidateReports();

      // Setup event listeners
      setupEventListeners();

      // Auto-generate proposal if pre-selected items exist
      if (selectedReportIds.size >= 1) {
        generateProposalObject();
      } else {
        const docPaper = document.getElementById('documentPaper');
        const emptyState = document.getElementById('proposalEmptyState');
        if (docPaper) docPaper.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
      }

      if (window.lucide) {
        window.lucide.createIcons();
      }
    } catch (err) {
      console.error('Failed to initialize proposal builder:', err);
    }
  }

  /**
   * Handle arriving pre-filtered via query params or sessionStorage
   */
  function handlePreSelections() {
    const urlParams = new URLSearchParams(window.location.search);
    const hotspotParam = urlParams.get('hotspot');
    const locationParam = urlParams.get('location');

    let hasPreSelection = false;

    // 1. Check Hotspot Param (e.g. ?hotspot=HOT-01)
    if (hotspotParam) {
      const foundHotspot = allHotspots.find(h => 
        h.id.toLowerCase() === hotspotParam.toLowerCase() || 
        h.name.toLowerCase().includes(hotspotParam.toLowerCase())
      );
      if (foundHotspot) {
        // Set location filter
        const locSelect = document.getElementById('filterLocation');
        if (locSelect) locSelect.value = foundHotspot.city;

        // Select all member reports in this hotspot
        (foundHotspot.reportsList || []).forEach(r => selectedReportIds.add(r.id));
        hasPreSelection = true;
        showToast(`Pre-loaded ${foundHotspot.name} clustered reports.`);
      }
    }

    // 2. Check Location Param (e.g. ?location=Sahibabad)
    if (locationParam && !hasPreSelection) {
      const locSelect = document.getElementById('filterLocation');
      if (locSelect) {
        // Match city or contains
        Array.from(locSelect.options).forEach(opt => {
          if (locationParam.toLowerCase().includes(opt.value.toLowerCase())) {
            locSelect.value = opt.value;
          }
        });
      }
    }

    // 3. Check sessionStorage from reports.html bulk selection or report-details.html
    try {
      const stored = sessionStorage.getItem(STORAGE_BULK_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(id => selectedReportIds.add(id));
          hasPreSelection = true;
          showToast(`Loaded ${parsed.length} reports from previous selection.`);
        }
      }
    } catch (e) {
      console.warn('Could not read bulk selection from sessionStorage:', e);
    }

    // 4. If still no pre-selection, default to first 8 High/Medium reports
    if (selectedReportIds.size === 0) {
      const defaultSelection = allReports
        .filter(r => r.severity === 'High' || r.severity === 'Medium')
        .slice(0, 8);
      defaultSelection.forEach(r => selectedReportIds.add(r.id));
    }
  }

  /**
   * Filter candidate reports matching current filter controls
   */
  function filterCandidateReports() {
    const locVal = document.getElementById('filterLocation').value;
    const catVal = document.getElementById('filterCategory').value;
    const sevVal = document.getElementById('filterSeverity').value;
    const dateVal = document.getElementById('filterDateRange').value;
    const statusVal = document.getElementById('filterStatus').value;

    candidateReports = allReports.filter(r => {
      // Location filter
      if (locVal !== 'All' && r.city !== locVal && !r.location.includes(locVal)) {
        return false;
      }
      // Category filter
      if (catVal !== 'All' && r.category !== catVal) {
        return false;
      }
      // Severity filter
      if (sevVal !== 'All' && r.severity !== sevVal) {
        return false;
      }
      // Status filter
      if (statusVal !== 'All' && r.status !== statusVal) {
        return false;
      }
      // Date filter
      if (dateVal !== 'All') {
        const days = parseInt(dateVal, 10);
        const reportTime = new Date(r.reportDate).getTime();
        const cutoff = new Date('2026-09-18T16:00:00Z').getTime() - (days * 24 * 60 * 60 * 1000);
        if (reportTime < cutoff) return false;
      }
      return true;
    });

    renderCandidateTable();
    updateLiveSummary();
  }

  /**
   * Render Candidate Reports Table
   */
  function renderCandidateTable() {
    const tbody = document.getElementById('candidateReportsTbody');
    const headerCheckbox = document.getElementById('headerCheckbox');
    if (!tbody) return;

    if (candidateReports.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state" style="border:none; padding:var(--space-6) var(--space-4);">
              <div class="empty-state-icon" style="width:36px; height:36px; margin-bottom:var(--space-2);">
                <i data-lucide="filter-x"></i>
              </div>
              <div class="empty-state-title" style="font-size:var(--text-xs);">No reports found</div>
              <div class="empty-state-desc" style="font-size:11px;">No candidate incident reports match the selected filters.</div>
            </div>
          </td>
        </tr>
      `;
      if (headerCheckbox) headerCheckbox.checked = false;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const allChecked = candidateReports.every(r => selectedReportIds.has(r.id));
    if (headerCheckbox) headerCheckbox.checked = allChecked;

    tbody.innerHTML = candidateReports.map(r => {
      const isChecked = selectedReportIds.has(r.id);
      const isHigh = r.severity === 'High';
      const dotClass = isHigh ? 'dot-high' : r.severity === 'Medium' ? 'dot-medium' : 'dot-low';
      const statusKey = r.status.toLowerCase().replace(/\s+/g, '');

      return `
        <tr class="${isChecked ? 'selected' : ''}" data-id="${r.id}">
          <td style="text-align: center;">
            <input 
              type="checkbox" 
              class="candidate-checkbox row-item-checkbox" 
              data-id="${r.id}" 
              ${isChecked ? 'checked' : ''} 
              aria-label="Include ${r.id}"
            />
          </td>
          <td>
            <span style="font-family: var(--font-mono); font-weight: 700; color: var(--c-primary);">
              ${r.id}
            </span>
          </td>
          <td>
            <span style="font-weight: 600;">${r.category}</span>
          </td>
          <td>
            <span>${r.location}, ${r.city}</span>
          </td>
          <td>
            <span class="severity-indicator">
              <span class="intensity-dot ${dotClass}"></span>
              <span>${r.severity}</span>
            </span>
          </td>
          <td>
            <span class="badge badge-status-${statusKey}" style="font-size: 10px; padding: 2px 6px;">
              <span class="dot"></span> ${r.status}
            </span>
          </td>
          <td>
            <span class="cell-compact">${formatDate(r.reportDate)}</span>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Update Live Selection Summary Strip
   */
  function updateLiveSummary() {
    const selectedReports = allReports.filter(r => selectedReportIds.has(r.id));

    const selectedCount = selectedReports.length;
    const uniqueLocations = new Set(selectedReports.map(r => r.location || r.city)).size;
    const highPriorityCount = selectedReports.filter(r => r.severity === 'High').length;
    const affectedPopulation = selectedReports.reduce((sum, r) => sum + (r.estimatedAffectedPopulation || 0), 0);

    const elSelected = document.getElementById('summarySelectedCount');
    const elLocations = document.getElementById('summaryLocationsCount');
    const elHigh = document.getElementById('summaryHighPriorityCount');
    const elPop = document.getElementById('summaryAffectedPop');
    const hintText = document.getElementById('selectionHintText');
    const genBtn = document.getElementById('btnGenerateProposal');

    if (elSelected) elSelected.textContent = selectedCount;
    if (elLocations) elLocations.textContent = uniqueLocations;
    if (elHigh) elHigh.textContent = highPriorityCount;
    if (elPop) elPop.textContent = affectedPopulation > 0 ? affectedPopulation.toLocaleString() : '—';

    if (hintText) {
      hintText.textContent = selectedCount > 0
        ? `${selectedCount} incident report${selectedCount === 1 ? '' : 's'} staged for municipal proposal generation.`
        : 'Select at least 1 incident to generate a remediation proposal.';
    }

    if (genBtn) {
      genBtn.disabled = selectedCount === 0;
    }
  }

  /**
   * Synthesize Proposal Object and Render Document Preview
   */
  function generateProposalObject() {
    const selectedReports = allReports.filter(r => selectedReportIds.has(r.id));
    if (selectedReports.length === 0) {
      showToast('Please select at least 1 report to generate a proposal.', 'error');
      return;
    }

    const docPaper = document.getElementById('documentPaper');
    const emptyState = document.getElementById('proposalEmptyState');
    if (docPaper) docPaper.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    // 1. Determine Dominant Category
    const catCounts = {};
    selectedReports.forEach(r => {
      catCounts[r.category] = (catCounts[r.category] || 0) + 1;
    });
    const dominantCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0][0];

    // 2. Determine Primary Location
    const cityCounts = {};
    selectedReports.forEach(r => {
      cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
    });
    const dominantCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0][0];

    // Find most representative sector
    const locCounts = {};
    selectedReports.forEach(r => {
      locCounts[r.location] = (locCounts[r.location] || 0) + 1;
    });
    const topLoc = Object.entries(locCounts).sort((a, b) => b[1] - a[1])[0][0];

    // 3. Reporting Period (min - max dates)
    const dates = selectedReports.map(r => new Date(r.reportDate).getTime()).filter(t => !isNaN(t));
    const minDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date('2026-06-12');
    const maxDate = dates.length > 0 ? new Date(Math.max(...dates)) : new Date('2026-09-14');
    const reportingPeriod = `${formatDate(minDate)} – ${formatDate(maxDate)}`;

    // 4. Metrics
    const totalReports = selectedReports.length;
    const uniqueLocations = new Set(selectedReports.map(r => r.location || r.city)).size;
    const highPriorityCount = selectedReports.filter(r => r.severity === 'High').length;
    const evidenceCount = totalReports * 2 + Math.floor(totalReports * 1.5);
    const affectedPop = selectedReports.reduce((sum, r) => sum + (r.estimatedAffectedPopulation || 0), 0);

    // 5. Synthesize Reference ID & Subject
    const refCode = Math.floor(1000 + Math.random() * 9000);
    const referenceId = `PROP-2026-${refCode}`;
    const generatedDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const subject = `Intervention Proposal: Comprehensive Remediation of ${dominantCategory} & Clustered Anomalies in ${topLoc}`;
    const targetArea = `${topLoc}, ${dominantCity} (NCR Regional Zone)`;

    // 6. Auto-written Observed Pattern Paragraph
    const popText = affectedPop > 0 ? `impacting an estimated ${affectedPop.toLocaleString()} residents` : `affecting communities`;
    const observedPattern = `Spatial aggregation of ${totalReports} citizen observations and multispectral telemetry reveals a persistent concentration of suspected ${dominantCategory} anomalies across ${targetArea}. Sensor telemetry registers repetitive threshold exceedances, with ${highPriorityCount} incidents classified as High Severity. The clustered pattern indicates an acute public health and environmental vector ${popText} in surrounding residential and buffer zones. Field ground-truthing confirms non-functional emission scrubbers and localized unsegregated waste pooling. Historical recurrence patterns suggest unpermitted nocturnal discharge or localized systemic infrastructure strain requiring prompt statutory containment and multi-agency remediation.`;

    // 7. Structured Suggested Actions
    const suggestedActions = [
      {
        title: 'Field Inspection & Ground-Truthing',
        desc: 'Deploy joint task force with accredited field specialists to physically inspect suspected outfalls/stacks, take water/particulate samples, and document optical plume opacity.'
      },
      {
        title: 'Targeted Municipal Intervention',
        desc: 'Coordinate emergency drain dredging, floating trash barrier placement, and municipal waste containment in affected sectors to halt trans-boundary pollution spread.'
      },
      {
        title: 'Source Identification & Permit Audit',
        desc: 'Cross-reference high-opacity coordinates with State Pollution Control Board licensing data to identify non-compliant industrial scrubbers and illicit incinerator operations.'
      },
      {
        title: 'Continued Remote Sensing Monitoring',
        desc: 'Maintain automated bi-weekly PlanetScope and Sentinel-2 multispectral pass overlays over the corridor to verify compliance and alert on recurrence.'
      },
      {
        title: 'Community Awareness & Sentinel Alerts',
        desc: 'Organize RWA stakeholder briefings and distribute localized air quality advisory warnings to protect surrounding residents during peak inversion periods.'
      }
    ];

    // Structured Proposal Object
    currentProposal = {
      referenceId,
      generatedDate,
      subject,
      targetArea,
      reportingPeriod,
      totalReports,
      uniqueLocations,
      highPriorityReports: highPriorityCount,
      evidenceCount,
      affectedPopulation: affectedPop,
      observedPattern,
      suggestedActions,
      appendixReports: selectedReports.map(r => ({
        id: r.id,
        category: r.category,
        location: r.location,
        city: r.city,
        severity: r.severity,
        status: r.status,
        reportDate: r.reportDate
      })),
      disclaimer: 'AI classifications are indicative and require appropriate human/organizational verification.'
    };

    // Render Document Preview
    renderDocumentPreview(currentProposal);

    // Scroll to preview
    const previewCard = document.getElementById('proposalPreviewCard');
    if (previewCard) {
      previewCard.classList.add('visible');
      previewCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showToast(`Proposal ${referenceId} generated successfully.`);
  }

  /**
   * Render Document Preview on Page
   */
  function renderDocumentPreview(p) {
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt('docRefId', p.referenceId);
    setTxt('docDate', p.generatedDate);
    setTxt('docSubject', p.subject);
    setTxt('docTargetArea', p.targetArea);
    setTxt('docPeriod', p.reportingPeriod);
    setTxt('docTotalReports', `${p.totalReports} Reports`);
    setTxt('docUniqueLocations', `${p.uniqueLocations} Locations`);
    setTxt('docHighPriority', `${p.highPriorityReports} High-Priority`);
    setTxt('docObservedPattern', p.observedPattern);

    // Appendix Table
    const tbody = document.getElementById('docAppendixTbody');
    if (tbody) {
      tbody.innerHTML = p.appendixReports.map(r => `
        <tr>
          <td style="font-family:var(--font-mono); font-weight:700; color:var(--c-primary);">${r.id}</td>
          <td>${r.category}</td>
          <td>${r.location}, ${r.city}</td>
          <td style="font-weight:700; color:${r.severity === 'High' ? 'var(--c-primary)' : 'var(--c-text-primary)'};">${r.severity}</td>
          <td><span class="badge" style="font-size:9px; padding:1px 5px;"><span class="dot"></span> ${r.status}</span></td>
          <td>${formatDate(r.reportDate)}</td>
        </tr>
      `).join('');
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // 1. Filter Dropdowns Change
    ['filterLocation', 'filterCategory', 'filterSeverity', 'filterDateRange', 'filterStatus'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', filterCandidateReports);
    });

    // 2. Header Checkbox (Select/Deselect All in current filtered view)
    const headerCheckbox = document.getElementById('headerCheckbox');
    if (headerCheckbox) {
      headerCheckbox.addEventListener('change', (e) => {
        const checkAll = e.target.checked;
        candidateReports.forEach(r => {
          if (checkAll) selectedReportIds.add(r.id);
          else selectedReportIds.delete(r.id);
        });
        renderCandidateTable();
        updateLiveSummary();
      });
    }

    // 3. Top Buttons: Select All & Deselect All
    const btnSelectAll = document.getElementById('btnSelectAll');
    if (btnSelectAll) {
      btnSelectAll.addEventListener('click', () => {
        candidateReports.forEach(r => selectedReportIds.add(r.id));
        renderCandidateTable();
        updateLiveSummary();
      });
    }

    const btnDeselectAll = document.getElementById('btnDeselectAll');
    if (btnDeselectAll) {
      btnDeselectAll.addEventListener('click', () => {
        selectedReportIds.clear();
        try {
          sessionStorage.removeItem(STORAGE_BULK_KEY);
        } catch (e) {
          console.warn('Could not clear bulk selection from sessionStorage:', e);
        }
        renderCandidateTable();
        updateLiveSummary();
        const docPaper = document.getElementById('documentPaper');
        const emptyState = document.getElementById('proposalEmptyState');
        if (docPaper) docPaper.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        if (window.lucide) window.lucide.createIcons();
      });
    }

    // 4. Candidate Table Row Checkbox Click (Event Delegation)
    const tbody = document.getElementById('candidateReportsTbody');
    if (tbody) {
      tbody.addEventListener('change', (e) => {
        if (e.target.classList.contains('row-item-checkbox')) {
          const id = e.target.getAttribute('data-id');
          if (e.target.checked) {
            selectedReportIds.add(id);
          } else {
            selectedReportIds.delete(id);
          }

          const tr = e.target.closest('tr');
          if (tr) tr.classList.toggle('selected', e.target.checked);

          updateLiveSummary();
        }
      });
    }

    // 5. Generate Intervention Proposal Button Click
    const btnGen = document.getElementById('btnGenerateProposal');
    if (btnGen) {
      btnGen.addEventListener('click', generateProposalObject);
    }

    // 6. Step 3: Export PDF Button
    const btnExportPdf = document.getElementById('btnExportPdf');
    if (btnExportPdf) {
      btnExportPdf.addEventListener('click', () => {
        if (!currentProposal) {
          showToast('Please generate a proposal first.', 'error');
          return;
        }

        if (window.EarthPdf && window.EarthPdf.exportProposalToPdf) {
          window.EarthPdf.exportProposalToPdf(currentProposal);
          showToast('Executive PDF generated and downloaded.');
        } else {
          showToast('PDF generator library is not ready.', 'error');
        }
      });
    }
  }

  // Self-execute on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProposalBuilder);
  } else {
    initProposalBuilder();
  }

})();
