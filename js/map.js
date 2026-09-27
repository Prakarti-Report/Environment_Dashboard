/**
 * Prakarti Report — NGO Environmental Intelligence & Action Platform
 * js/map.js — Spatial Intelligence Map & Geospatial Hotspots Controller
 * 
 * Strict Architecture Rule:
 * All data access goes through EarthData (js/data.js):
 * - EarthData.getReports()
 * - EarthData.getHotspots()
 * 
 * Strictly adheres to Ethical AI Language:
 * - "AI-detected suspected issue"
 * - Never "proves" or "confirms" without ground validation.
 */

(function () {
  'use strict';

  // Map state
  let map = null;
  let allReports = [];
  let allHotspots = [];
  let filteredReports = [];

  // Layers
  let markerClusterGroup = null;
  let hotspotsLayerGroup = null;
  let showIncidentMarkers = true;
  let showHotspotBuffers = true;

  // Filter state
  let selectedCategory = 'All';
  let selectedSeverity = 'All';
  let selectedStatus = 'All';
  let selectedCity = 'All';
  let selectedDateRange = 'All';

  // Standard Severity Palette
  const SEVERITY_PALETTE = {
    High: { stroke: '#B91C1C', fill: '#EF4444', radius: 9, opacity: 0.95 },
    Medium: { stroke: '#B45309', fill: '#F59E0B', radius: 7.5, opacity: 0.90 },
    Low: { stroke: '#1D4ED8', fill: '#3B82F6', radius: 6, opacity: 0.85 },
    Unassessed: { stroke: '#657267', fill: '#F0F7F1', radius: 7, opacity: 0.85, dashed: true }
  };

  /**
   * Smooth number counter animation
   */
  function animateCountUp(element, target, duration = 500) {
    if (!element) return;
    const current = parseInt(element.textContent.replace(/[^0-9]/g, ''), 10) || 0;
    if (current === target) return;

    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const val = Math.round(current + (target - current) * progress);
      element.textContent = val.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target.toLocaleString();
      }
    };
    requestAnimationFrame(step);
  }

  /**
   * Category classification mapping for chips
   */
  function matchesCategoryChip(category, chipKey, aiCategory) {
    if (!chipKey || chipKey === 'All') return true;
    const cat = (category || '').toLowerCase();
    const aiCat = (aiCategory || '').toLowerCase();
    const text = `${cat} ${aiCat}`;

    if (chipKey === 'Waste') {
      return text.includes('waste') || text.includes('garbage') || text.includes('dumping') || text.includes('trash') || text.includes('litter');
    }
    if (chipKey === 'Burning') {
      return text.includes('burning') || text.includes('burn') || text.includes('crop') || text.includes('fire') || text.includes('smoke');
    }
    if (chipKey === 'Air') {
      return text.includes('air') || text.includes('particulate') || text.includes('vehicle') || text.includes('smog') || text.includes('pm2') || text.includes('pm10') || text.includes('emission');
    }
    if (chipKey === 'Water') {
      return text.includes('water') || text.includes('sewage') || text.includes('drainage') || text.includes('effluent') || text.includes('river') || text.includes('drain');
    }
    if (chipKey === 'Industrial') {
      return text.includes('industrial') || text.includes('factory') || text.includes('emission') || text.includes('stack') || text.includes('boiler') || text.includes('chemical');
    }
    if (chipKey === 'Deforestation') {
      return text.includes('deforestation') || text.includes('tree') || text.includes('forest') || text.includes('logging') || text.includes('timber');
    }
    if (chipKey === 'Plastic') {
      return text.includes('plastic') || text.includes('polythene') || text.includes('bottle');
    }
    return false;
  }

  /**
   * Helper: Category micro-icon for popups
   */
  function getCategoryMiniIcon(category) {
    const cat = (category || '').toLowerCase();
    if (cat.includes('industrial')) return 'factory';
    if (cat.includes('burning')) return 'flame';
    if (cat.includes('water')) return 'droplets';
    if (cat.includes('dumping') || cat.includes('garbage')) return 'trash-2';
    if (cat.includes('air') || cat.includes('vehicle')) return 'wind';
    if (cat.includes('deforestation')) return 'tree-pine';
    return 'alert-circle';
  }

  /**
   * Inline-SVG Category Glyphs (Garbage, Burning, Water, Deforestation, Anomaly)
   */
  function getCategorySvgGlyph(category, size = 14, color = '#315C3A') {
    const cat = (category || '').toLowerCase();
    if (cat.includes('garbage') || cat.includes('dumping') || cat.includes('waste') || cat.includes('plastic')) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; display:inline-block;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
    }
    if (cat.includes('burning') || cat.includes('crop') || cat.includes('fire')) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; display:inline-block;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>`;
    }
    if (cat.includes('water') || cat.includes('sewage') || cat.includes('drainage') || cat.includes('effluent')) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; display:inline-block;"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
    }
    if (cat.includes('deforestation') || cat.includes('tree')) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; display:inline-block;"><polygon points="12 2 2 22 22 22 12 2"/><line x1="12" y1="18" x2="12" y2="22"/></svg>`;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; display:inline-block;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  }

  /**
   * Initialize Leaflet Map with CartoDB Positron Minimal Basemap
   */
  function initMapCanvas() {
    const mapContainer = document.getElementById('leafletMap');
    if (!mapContainer) return;

    // National Capital Region Centroid: [28.58, 77.38], zoom 11
    map = L.map('leafletMap', {
      center: [28.58, 77.38],
      zoom: 11,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // CartoDB Positron Minimal Basemap (Light Gray / Monochrome)
    const cartoKey = (window.EARTHFORWARD_CONFIG && window.EARTHFORWARD_CONFIG.CARTO_API_KEY) ||
                     (window.EARTH_FORWARD_CONFIG && window.EARTH_FORWARD_CONFIG.CARTO_API_KEY) ||
                     'cb1_3pyb_1_109aed2ce548c48365adc818';
    L.tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${cartoKey}`, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    // Initialize Layer Groups
    markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 42,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        const markers = cluster.getAllChildMarkers();
        let hasHigh = false;
        let hasMedium = false;
        let hasLow = false;

        markers.forEach(m => {
          const s = (m.options && m.options.severity) || 'Unassessed';
          if (s === 'High') hasHigh = true;
          else if (s === 'Medium') hasMedium = true;
          else if (s === 'Low') hasLow = true;
        });

        let clusterClass = 'marker-cluster-unassessed';
        if (hasHigh) clusterClass = 'marker-cluster-high';
        else if (hasMedium) clusterClass = 'marker-cluster-medium-sev';
        else if (hasLow) clusterClass = 'marker-cluster-low-sev';

        let size = count < 5 ? 32 : count < 10 ? 38 : 46;
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${clusterClass}`,
          iconSize: L.point(size, size)
        });
      }
    });

    hotspotsLayerGroup = L.layerGroup();

    map.addLayer(markerClusterGroup);
    map.addLayer(hotspotsLayerGroup);
  }

  /**
   * Load Data & Render Markers and Hotspot Zones
   */
  async function loadMapData() {
    try {
      allReports = await window.EarthData.getReports();
      allHotspots = await window.EarthData.getHotspots();

      updateCategoryChipCounts();
      renderHotspotBuffers();
      applyFilters();
      renderTopHotspotsOverview();

      if (window.lucide) {
        window.lucide.createIcons();
      }
    } catch (err) {
      console.error('Failed to load map data:', err);
    }
  }

  /**
   * Update Badge Counts on Category Chips
   */
  function updateCategoryChipCounts() {
    const chips = ['All', 'Waste', 'Burning', 'Air', 'Water', 'Industrial', 'Deforestation', 'Plastic'];
    chips.forEach(key => {
      const el = document.getElementById(`chipCount${key}`);
      if (!el) return;
      if (key === 'All') {
        el.textContent = allReports.length;
      } else {
        const count = allReports.filter(r => matchesCategoryChip(r.category, key, r.aiCategory)).length;
        el.textContent = count;
      }
    });
  }

  /**
   * Render Regional Hotspot Concentration Buffers
   * Green dashed perimeter and soft tinted radius indicating dense multi-report zones
   */
  function renderHotspotBuffers() {
    hotspotsLayerGroup.clearLayers();

    allHotspots.forEach(hotspot => {
      const lat = hotspot.coordinates[0];
      const lng = hotspot.coordinates[1];
      const radius = hotspot.radiusMeters || 2400;
      const risk = hotspot.riskLevel || 'Medium';
      const palette = SEVERITY_PALETTE[risk] || SEVERITY_PALETTE.Medium;

      // Soft circular density polygon styled with risk palette
      const circle = L.circle([lat, lng], {
        radius: radius,
        color: palette.stroke,
        weight: 1.5,
        dashArray: '5, 6',
        fillColor: palette.fill,
        fillOpacity: 0.15,
        interactive: true
      });

      // Hotspot popup
      const popupHtml = `
        <div class="popup-inner-card">
          <div class="popup-header">
            <span class="popup-id-badge">${hotspot.id}</span>
            <span class="badge badge-status-verified" style="font-size:10px; padding:2px 6px;">
              ${hotspot.riskLevel} Risk Cluster
            </span>
          </div>
          <h4 class="popup-title">${hotspot.name}</h4>
          <div class="popup-location-row">
            <i data-lucide="map-pin" style="width:12px; height:12px; color:var(--c-primary);"></i>
            <span>${hotspot.city} &bull; ${radius}m dispersion zone</span>
          </div>
          <p style="font-size:11px; color:var(--c-text-secondary); line-height:1.4; margin:4px 0 0 0;">
            ${hotspot.aiRiskAssessment}
          </p>
          <div class="popup-meta-grid" style="margin-top:6px;">
            <div class="popup-meta-item">
              <span class="popup-meta-label">Active Reports</span>
              <span class="popup-meta-value">${hotspot.activeReports} Incidents</span>
            </div>
            <div class="popup-meta-item">
              <span class="popup-meta-label">Intervention</span>
              <span class="popup-meta-value" style="font-size:10px;">${hotspot.interventionStatus.split(' ')[0]} Active</span>
            </div>
          </div>
          <div style="margin-top:8px; display:flex; justify-content:space-between; align-items:center;">
            <span class="popup-ai-label">
              <i data-lucide="shield" style="width:11px; height:11px;"></i>
              Hotspot Cluster
            </span>
            <a href="hotspots.html" class="btn-popup-view" style="font-size:10px; padding:3px 8px;">
              Cluster Audit &rarr;
            </a>
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml, { maxWidth: 300 });
      circle.on('popupopen', () => {
        if (window.lucide) window.lucide.createIcons();
      });

      hotspotsLayerGroup.addLayer(circle);
    });
  }

  /**
   * Apply Filter Bar Criteria Live Without Reload
   */
  function applyFilters() {
    if (!allReports || allReports.length === 0) return;

    filteredReports = allReports.filter(r => {
      // 1. Category Chip Filter
      if (!matchesCategoryChip(r.category, selectedCategory, r.aiCategory)) {
        return false;
      }

      // 2. Severity Dropdown
      if (selectedSeverity !== 'All') {
        const rSev = r.severity || 'Unassessed';
        if (rSev.toLowerCase() !== selectedSeverity.toLowerCase()) {
          return false;
        }
      }

      // 3. Status Dropdown
      if (selectedStatus !== 'All' && r.status !== selectedStatus) {
        return false;
      }

      // 4. City Dropdown
      if (selectedCity !== 'All' && r.city !== selectedCity) {
        return false;
      }

      // 5. Date Range Filter
      if (selectedDateRange !== 'All') {
        const days = parseInt(selectedDateRange, 10);
        const reportTime = new Date(r.reportDate).getTime();
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        if (reportTime < cutoff) {
          return false;
        }
      }

      return true;
    });

    // Re-plot markers
    plotReportMarkers(filteredReports);

    // Update stats strip and label
    updateStatsKPIs(filteredReports);
  }

  /**
   * Plot Reports as Circle Markers with Green Intensity
   * High: Dark Forest Green (#315C3A)
   * Medium: Medium Sage (#8FBC8F)
   * Low: Light Mint/Sage (#C5E3CA with #315C3A border)
   * Unassessed: Neutral Muted Mint/Gray with dashed border
   */
  function plotReportMarkers(reportsToPlot) {
    markerClusterGroup.clearLayers();

    reportsToPlot.forEach(r => {
      if (!r.coordinates || r.coordinates.length < 2) return;

      const sev = r.severity || 'Unassessed';
      const isHigh = sev === 'High';
      const isMedium = sev === 'Medium';
      const isLow = sev === 'Low';
      const p = SEVERITY_PALETTE[sev] || SEVERITY_PALETTE.Unassessed;

      const circleMarker = L.circleMarker([r.coordinates[0], r.coordinates[1]], {
        radius: p.radius,
        color: p.stroke,
        weight: p.dashed ? 2 : 1.5,
        fillColor: p.fill,
        fillOpacity: p.opacity,
        dashArray: p.dashed ? '3, 3' : null,
        severity: sev
      });

      // Format date
      const dateStr = r.reportDate ? new Date(r.reportDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : '—';

      const confText = (r.confidence !== null && r.confidence !== undefined)
        ? `${Math.round(r.confidence * 100)}%`
        : '—';
      const dotClass = isHigh ? 'dot-high' : isMedium ? 'dot-medium' : isLow ? 'dot-low' : 'dot-unassessed';
      const statusKey = (r.status || 'reported').toLowerCase().replace(/\s+/g, '');
      const sevLabel = r.severity || 'Unassessed';

      // Styled Custom Leaflet Popup
      const popupContent = `
        <div class="popup-inner-card">
          <div class="popup-header">
            <span class="popup-id-badge">${r.id}</span>
            <span class="badge badge-status-${statusKey}" style="font-size:10px; padding:2px 6px;">
              <span class="dot"></span> ${r.status}
            </span>
          </div>

          ${r.imageUrl ? `
            <div style="margin: 6px 0; border-radius: var(--radius-sm); overflow: hidden; max-height: 120px; background: var(--c-surface-subtle); border: 1px solid var(--c-border-light);">
              <img src="${r.imageUrl}" alt="Incident evidence photo" style="width: 100%; height: 110px; object-fit: contain; display: block;" onerror="this.parentElement.style.display='none';" />
            </div>
          ` : ''}

          <h4 class="popup-title">${r.title || 'Environmental Incident'}</h4>

          <div class="popup-location-row">
            <i data-lucide="map-pin" style="width:12px; height:12px; color:var(--c-primary);"></i>
            <span>${r.location ? `${r.location}, ${r.city || ''}` : (r.city || '—')}</span>
          </div>

          <div class="popup-meta-grid">
            <div class="popup-meta-item">
              <span class="popup-meta-label">Category</span>
              <span class="popup-meta-value" style="display:flex; align-items:center; gap:4px;">
                ${getCategorySvgGlyph(r.category, 13, 'var(--c-primary)')}
                <span>${r.category || 'Uncategorized'}</span>
              </span>
            </div>
            <div class="popup-meta-item">
              <span class="popup-meta-label">Severity</span>
              <span class="popup-meta-value">
                <span class="intensity-dot ${dotClass}" style="margin-right:2px;"></span>
                ${sevLabel}
              </span>
            </div>
            <div class="popup-meta-item">
              <span class="popup-meta-label">AI Confidence</span>
              <span class="popup-meta-value">${confText}</span>
            </div>
            <div class="popup-meta-item">
              <span class="popup-meta-label">Date Reported</span>
              <span class="popup-meta-value">${dateStr}</span>
            </div>
          </div>

          <div class="popup-footer-action">
            <span class="popup-ai-label">
              <i data-lucide="info" style="width:11px; height:11px;"></i>
              AI-detected suspected issue
            </span>
            <a href="report-details.html?id=${r.id}" class="btn-popup-view">
              <span>View Report</span>
              <i data-lucide="arrow-right" style="width:12px; height:12px;"></i>
            </a>
          </div>
        </div>
      `;

      circleMarker.bindPopup(popupContent, { maxWidth: 300 });
      circleMarker.on('popupopen', () => {
        if (window.lucide) window.lucide.createIcons();
      });

      markerClusterGroup.addLayer(circleMarker);
    });
  }

  /**
   * Update Stats KPIs and Filter Count
   */
  function updateStatsKPIs(currentFiltered) {
    const totalEl = document.getElementById('statTotalPlotted');
    const highEl = document.getElementById('statHighSeverity');
    const hotspotEl = document.getElementById('statActiveHotspots');
    const verifiedEl = document.getElementById('statVerifiedIncidents');
    const labelEl = document.getElementById('filteredReportsCount');

    const total = currentFiltered.length;
    const highCount = currentFiltered.filter(r => r.severity === 'High').length;
    const verifiedCount = currentFiltered.filter(r => r.verified || r.status === 'Verified' || r.status === 'Resolved').length;
    const hotspotCount = allHotspots.length;

    animateCountUp(totalEl, total);
    animateCountUp(highEl, highCount);
    animateCountUp(hotspotEl, hotspotCount);
    animateCountUp(verifiedEl, verifiedCount);

    if (labelEl) {
      labelEl.textContent = `Showing ${total} of ${allReports.length} reports`;
    }
  }

  /**
   * Render Top Hotspots Overview Summary
   */
  function renderTopHotspotsOverview() {
    const container = document.getElementById('topHotspotsList');
    if (!container || !allHotspots) return;

    const top4 = allHotspots.slice(0, 4);

    container.innerHTML = top4.map(h => {
      const dotClass = h.riskLevel === 'High' ? 'dot-high' : h.riskLevel === 'Low' ? 'dot-low' : 'dot-medium';
      return `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:var(--space-2) var(--space-3); background:var(--c-surface-subtle); border:1px solid var(--c-border-light); border-radius:var(--radius-md); font-size:var(--text-xs);">
          <div style="display:flex; align-items:center; gap:var(--space-2);">
            <span class="intensity-dot ${dotClass}"></span>
            <div>
              <div style="font-weight:700; color:var(--c-text-primary);">${h.name}</div>
              <div style="font-size:11px; color:var(--c-text-secondary);">${h.primaryCategory} &bull; ${h.city}</div>
            </div>
          </div>
          <button type="button" class="btn btn-outline btn-sm quick-jump-btn" data-center="${h.coordinates[0]},${h.coordinates[1]}" data-zoom="14" style="font-size:11px; padding:0.25rem 0.55rem;">
            Focus &rarr;
          </button>
        </div>
      `;
    }).join('');
  }

  /**
   * Event Listeners Setup
   */
  function setupEventListeners() {
    // 1. Category Chips Click
    const chips = document.querySelectorAll('.chip-btn');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedCategory = chip.getAttribute('data-category') || 'All';
        applyFilters();
      });
    });

    // 2. Dropdown Filters Change
    const sevSelect = document.getElementById('mapFilterSeverity');
    if (sevSelect) {
      sevSelect.addEventListener('change', (e) => {
        selectedSeverity = e.target.value;
        applyFilters();
      });
    }

    const statusSelect = document.getElementById('mapFilterStatus');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        selectedStatus = e.target.value;
        applyFilters();
      });
    }

    const citySelect = document.getElementById('mapFilterCity');
    if (citySelect) {
      citySelect.addEventListener('change', (e) => {
        selectedCity = e.target.value;
        applyFilters();
      });
    }

    const dateSelect = document.getElementById('mapFilterDate');
    if (dateSelect) {
      dateSelect.addEventListener('change', (e) => {
        selectedDateRange = e.target.value;
        applyFilters();
      });
    }

    // 3. Reset Filters Button
    const resetBtn = document.getElementById('btnResetMapFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        selectedCategory = 'All';
        selectedSeverity = 'All';
        selectedStatus = 'All';
        selectedCity = 'All';
        selectedDateRange = 'All';

        chips.forEach(c => c.classList.remove('active'));
        const allChip = document.querySelector('.chip-btn[data-category="All"]');
        if (allChip) allChip.classList.add('active');

        if (sevSelect) sevSelect.value = 'All';
        if (statusSelect) statusSelect.value = 'All';
        if (citySelect) citySelect.value = 'All';
        if (dateSelect) dateSelect.value = 'All';

        applyFilters();

        if (map) {
          map.flyTo([28.58, 77.38], 11, { duration: 1.2 });
        }
      });
    }

    // 4. Quick Jump Hotspots Buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.quick-jump-btn');
      if (!btn || !map) return;

      const centerAttr = btn.getAttribute('data-center');
      const zoomAttr = btn.getAttribute('data-zoom') || '14';

      if (centerAttr) {
        const [lat, lng] = centerAttr.split(',').map(Number);
        map.flyTo([lat, lng], parseInt(zoomAttr, 10), {
          duration: 1.4,
          easeLinearity: 0.25
        });
      }
    });

    // 5. Layer Toggles (Incidents / Hotspot Buffers)
    const toggleMarkersBtn = document.getElementById('toggleMarkersLayer');
    if (toggleMarkersBtn) {
      toggleMarkersBtn.addEventListener('click', () => {
        showIncidentMarkers = !showIncidentMarkers;
        if (showIncidentMarkers) {
          map.addLayer(markerClusterGroup);
          toggleMarkersBtn.classList.add('active');
        } else {
          map.removeLayer(markerClusterGroup);
          toggleMarkersBtn.classList.remove('active');
        }
      });
    }

    const toggleHotspotsBtn = document.getElementById('toggleHotspotsLayer');
    if (toggleHotspotsBtn) {
      toggleHotspotsBtn.addEventListener('click', () => {
        showHotspotBuffers = !showHotspotBuffers;
        if (showHotspotBuffers) {
          map.addLayer(hotspotsLayerGroup);
          toggleHotspotsBtn.classList.add('active');
        } else {
          map.removeLayer(hotspotsLayerGroup);
          toggleHotspotsBtn.classList.remove('active');
        }
      });
    }

    // 6. Realtime Live Subscription
    if (window.EarthData && typeof window.EarthData.subscribeToChanges === 'function') {
      window.EarthData.subscribeToChanges({
        tables: ['reports', 'organizations'],
        onStatus: (status) => {
          const pill = document.getElementById('livePill');
          if (pill) {
            if (status === 'SUBSCRIBED') {
              pill.classList.remove('polling');
              pill.textContent = '● Live';
            } else if (status === 'POLLING') {
              pill.classList.add('polling');
              pill.textContent = '● Live (30s)';
            }
          }
        },
        onChange: async () => {
          try {
            allReports = await window.EarthData.getReports();
            allHotspots = await window.EarthData.getHotspots();
            updateCategoryChipCounts();
            renderHotspotBuffers();
            applyFilters();
            renderTopHotspotsOverview();
          } catch (err) {
            console.warn('Live map update error:', err);
          }
        }
      });
    }
  }

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initMapCanvas();
      loadMapData();
      setupEventListeners();
    });
  } else {
    initMapCanvas();
    loadMapData();
    setupEventListeners();
  }

})();
