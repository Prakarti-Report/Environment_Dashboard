/**
 * Prakarti Report — NGO Environmental Intelligence & Action Platform
 * js/pdf.js — Professional PDF Generation Engine via jsPDF
 * 
 * Strict Styling & Branding:
 * - White background
 * - Dark-green headings ([49, 92, 58] / #315C3A)
 * - Light-green section dividers ([197, 227, 202] / #C5E3CA)
 * - Prakarti Report branding header
 * - Generation date and reference ID
 * - Selected report IDs appendix
 * - Mandatory verification disclaimer
 */

(function () {
  'use strict';

  /**
   * Export Structured Proposal to PDF using jsPDF
   */
  function exportProposalToPdf(proposal) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert('PDF generation engine is initializing. Please retry in a moment.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 16;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;

    // Color definitions
    const COLOR_PRIMARY = [49, 92, 58];       // #315C3A
    const COLOR_TEXT = [23, 35, 26];          // #17231A
    const COLOR_MUTED = [101, 114, 103];      // #657267
    const COLOR_BORDER = [197, 227, 202];     // #C5E3CA
    const COLOR_BG_LIGHT = [240, 247, 241];   // #F0F7F1
    const COLOR_WHITE = [255, 255, 255];

    /**
     * Helper to check page break
     */
    function checkPageBreak(requiredHeight = 20) {
      if (yPos + requiredHeight > pageHeight - 16) {
        doc.addPage();
        yPos = margin + 6;
        renderHeaderBranding(true);
      }
    }

    /**
     * Render Branding Header
     */
    function renderHeaderBranding(isSubsequentPage = false) {
      // Top accent bar
      doc.setFillColor(...COLOR_PRIMARY);
      doc.rect(margin, yPos, contentWidth, 1.5, 'F');
      yPos += 5;

      // Brand Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text('PRAKARTI REPORT', margin, yPos);

      // Meta Ref on Right
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text(proposal.referenceId || 'PROP-2026-0814', pageWidth - margin, yPos, { align: 'right' });

      yPos += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLOR_MUTED);
      doc.text('Environmental Intelligence & Action Platform • Official Brief', margin, yPos);
      doc.text(proposal.generatedDate || 'September 18, 2026', pageWidth - margin, yPos, { align: 'right' });

      yPos += 4;
      // Divider
      doc.setDrawColor(...COLOR_BORDER);
      doc.setLineWidth(0.4);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;
    }

    // ==========================================
    // PAGE 1: TITLE & MEMORANDUM GRID
    // ==========================================
    renderHeaderBranding(false);

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLOR_PRIMARY);
    doc.text('REMEDIATION ACTION PROPOSAL & INTERVENTION MEMORANDUM', margin, yPos);
    yPos += 6;

    // Routing Box (Light background with green border)
    doc.setFillColor(...COLOR_BG_LIGHT);
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, yPos, contentWidth, 34, 2, 2, 'FD');

    let memoY = yPos + 5;
    const memoLeft = margin + 4;
    const memoValLeft = margin + 38;

    const renderMemoField = (label, value, isHighlight = false) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(label, memoLeft, memoY);

      doc.setFont('helvetica', isHighlight ? 'bold' : 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...(isHighlight ? COLOR_PRIMARY : COLOR_TEXT));
      const valLines = doc.splitTextToSize(value, contentWidth - 42);
      doc.text(valLines, memoValLeft, memoY);
      memoY += (valLines.length * 3.6) + 1.2;
    };

    renderMemoField('TO:', 'Municipal Environmental Commission & District Task Force');
    renderMemoField('FROM:', 'Prakarti Report Intelligence & Ground-Truthing Desk');
    renderMemoField('SUBJECT:', proposal.subject || 'Intervention Proposal for Environmental Remediation', true);
    renderMemoField('TARGET AREA:', proposal.targetArea || 'NCR Corridor');
    renderMemoField('REPORTING PERIOD:', proposal.reportingPeriod || 'June 2026 – September 2026');

    yPos += 38;

    // Metrics Strip
    doc.setFillColor(248, 251, 248);
    doc.setDrawColor(...COLOR_BORDER);
    doc.roundedRect(margin, yPos, contentWidth, 12, 1.5, 1.5, 'FD');

    const colWidth = contentWidth / 4;
    const renderMetricPill = (idx, label, val) => {
      const cx = margin + (idx * colWidth) + (colWidth / 2);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(label, cx, yPos + 4, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text(String(val), cx, yPos + 9, { align: 'center' });
    };

    renderMetricPill(0, 'TOTAL REPORTS', proposal.totalReports || 0);
    renderMetricPill(1, 'UNIQUE LOCATIONS', proposal.uniqueLocations || 0);
    renderMetricPill(2, 'HIGH PRIORITY', proposal.highPriorityReports || 0);
    renderMetricPill(3, 'EVIDENCE COUNT', proposal.evidenceCount || 0);

    yPos += 18;

    // Section 1: Observed Pattern & Spatial Telemetry Analysis
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_PRIMARY);
    doc.text('1. OBSERVED INCIDENT PATTERN & SPATIAL CONVERGENCE', margin, yPos);
    yPos += 2;
    doc.setDrawColor(...COLOR_PRIMARY);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, margin + 45, yPos);
    yPos += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_TEXT);
    const patternLines = doc.splitTextToSize(proposal.observedPattern || '', contentWidth);
    doc.text(patternLines, margin, yPos, { lineHeightFactor: 1.4 });
    yPos += (patternLines.length * 4.2) + 6;

    // Section 2: Proposed Immediate Intervention Actions
    checkPageBreak(45);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_PRIMARY);
    doc.text('2. PROPOSED IMMEDIATE INTERVENTION ACTIONS', margin, yPos);
    yPos += 2;
    doc.setDrawColor(...COLOR_PRIMARY);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, margin + 45, yPos);
    yPos += 5;

    const actions = proposal.suggestedActions || [
      { title: 'Field Inspection & Ground-Truthing', desc: 'Deploy joint task force with accredited field specialists to physically inspect suspected outfalls/stacks and calibrate sensors.' },
      { title: 'Targeted Municipal Intervention', desc: 'Issue formal remediation request to municipal corporation for drain dredging and waste containment.' },
      { title: 'Source Identification & Permit Audit', desc: 'Cross-reference high-opacity plume coordinates with State Pollution Control Board licensing data.' },
      { title: 'Continued Remote Sensing Monitoring', desc: 'Maintain automated bi-weekly PlanetScope and Sentinel-2 multispectral pass overlays over the corridor.' },
      { title: 'Community Awareness & Sentinel Alerts', desc: 'Coordinate with resident welfare associations (RWAs) for community air quality alerts.' }
    ];

    actions.forEach((act, i) => {
      checkPageBreak(14);
      // Circle number
      doc.setFillColor(...COLOR_PRIMARY);
      doc.circle(margin + 2.5, yPos - 0.5, 2.2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...COLOR_WHITE);
      doc.text(String(i + 1), margin + 2.5, yPos + 0.3, { align: 'center' });

      // Title & description
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text(act.title, margin + 7, yPos);
      yPos += 3.8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLOR_TEXT);
      const descLines = doc.splitTextToSize(act.desc, contentWidth - 7);
      doc.text(descLines, margin + 7, yPos, { lineHeightFactor: 1.3 });
      yPos += (descLines.length * 3.6) + 3;
    });

    // Section 3: Appendix of Selected Reports
    checkPageBreak(40);
    yPos += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_PRIMARY);
    doc.text('3. APPENDIX: CLUSTERED EVIDENCE & INCIDENT DOSSIER', margin, yPos);
    yPos += 2;
    doc.setDrawColor(...COLOR_PRIMARY);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, margin + 45, yPos);
    yPos += 5;

    // Table Header
    doc.setFillColor(...COLOR_BG_LIGHT);
    doc.rect(margin, yPos, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_PRIMARY);

    doc.text('Report ID', margin + 2, yPos + 4.2);
    doc.text('Category', margin + 28, yPos + 4.2);
    doc.text('Location', margin + 72, yPos + 4.2);
    doc.text('Severity', margin + 128, yPos + 4.2);
    doc.text('Status', margin + 148, yPos + 4.2);

    yPos += 6;

    const reportsList = proposal.appendixReports || [];
    reportsList.forEach((r, idx) => {
      checkPageBreak(7);
      if (idx % 2 === 1) {
        doc.setFillColor(250, 252, 250);
        doc.rect(margin, yPos, contentWidth, 5.5, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...COLOR_TEXT);

      doc.text(r.id, margin + 2, yPos + 3.8);
      doc.text(r.category.substring(0, 22), margin + 28, yPos + 3.8);
      doc.text((r.location || r.city).substring(0, 32), margin + 72, yPos + 3.8);

      // Severity highlight
      if (r.severity === 'High') {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLOR_PRIMARY);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLOR_MUTED);
      }
      doc.text(r.severity, margin + 128, yPos + 3.8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLOR_TEXT);
      doc.text(r.status, margin + 148, yPos + 3.8);

      yPos += 5.5;
    });

    // Mandatory Disclaimer Box
    checkPageBreak(25);
    yPos += 6;
    doc.setFillColor(...COLOR_BG_LIGHT);
    doc.setDrawColor(...COLOR_BORDER);
    doc.roundedRect(margin, yPos, contentWidth, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_PRIMARY);
    doc.text('MANDATORY VERIFICATION DISCLAIMER', margin + 3, yPos + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_MUTED);
    const discLines = doc.splitTextToSize(
      'AI classifications are indicative and require appropriate human/organizational verification. Sensor telemetry anomalies flag candidate violations to guide field ground-truthing prior to authoritative or statutory enforcement action.',
      contentWidth - 6
    );
    doc.text(discLines, margin + 3, yPos + 8);

    // Number all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(`Page ${i} of ${totalPages} • Confidential Environmental Intelligence Brief`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    // Download PDF
    const filename = `Prakarti_Report_Intervention_Proposal_${proposal.referenceId || '2026'}.pdf`;
    doc.save(filename);
  }

  // Expose globally
  window.EarthPdf = {
    exportProposalToPdf
  };

})();
