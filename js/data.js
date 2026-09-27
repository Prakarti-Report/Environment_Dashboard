const _dataScriptSrc = (typeof document !== 'undefined' && document.currentScript) ? document.currentScript.src : null;

/**
 * Prakarti Report — NGO Environmental Intelligence & Action Platform
 * js/data.js — Core Data Access & Persistence Layer
 *
 * ARCHITECTURE RULE:
 * All data access goes through async functions in js/data.js:
 * getReports, getReportById, updateReportStatus, addReportNote,
 * assignReport, getAnalytics, getHotspots, getOrganizations, getFieldWorkers, resetDemoData.
 *
 * Functions return mock data merged with localStorage overlay so swapping
 * in fetch() calls later requires no UI changes.
 */

// 1. Mock organizations array (4 NGOs)
const organizations = [
  {
    id: 'ORG-01',
    name: 'Sankalp Environmental Foundation',
    alias: 'Yamuna Ecological Restoration Collective',
    acronym: 'SEF',
    lead: 'Dr. Arundhati Bose',
    email: 'contact@sankalp-eco.org',
    phone: '+91 11 2389 4410',
    focusAreas: ['Water Pollution', 'Sewage/Drainage', 'Industrial Emission'],
    jurisdiction: ['Delhi (East & North)', 'Ghaziabad (Hindon Basin)', 'Noida (Sector 128-150)'],
    activeFieldAgents: 14,
    verifiedActionsCount: 182,
    baselineReviewed: 154,
    baselineResolved: 96,
    baselineActive: 12,
    establishedYear: 2018,
    description: 'Monitors industrial effluent outfalls, drains, and safeguards Yamuna floodplain ecology through ground-truthing and remediation advocacy.'
  },
  {
    id: 'ORG-02',
    name: 'Green Earth Initiative',
    alias: 'NCR Clean Air & Climate Alliance',
    acronym: 'GEI',
    lead: 'Devendra Kumar Rathore',
    email: 'liaison@greenearth.org',
    phone: '+91 120 456 7812',
    focusAreas: ['Waste Burning', 'Crop Burning', 'Air Pollution', 'Vehicle Pollution'],
    jurisdiction: ['Ghaziabad', 'Noida (All Sectors)', 'East Delhi', 'Greater Noida West'],
    activeFieldAgents: 22,
    verifiedActionsCount: 310,
    baselineReviewed: 218,
    baselineResolved: 142,
    baselineActive: 18,
    establishedYear: 2016,
    description: 'Rapid-deployment NGO addressing open biomass burning, seasonal crop stubble fires, and localized industrial particulate plumes.'
  },
  {
    id: 'ORG-03',
    name: 'Clean Noida Network',
    alias: 'Greater Noida Eco-Action & Habitat Trust',
    acronym: 'CNN',
    lead: 'Vikramjit Singh Sandhu',
    email: 'action@cleannoida.org.in',
    phone: '+91 120 232 9904',
    focusAreas: ['Deforestation', 'Garbage Dumping', 'Plastic Waste', 'Water Pollution'],
    jurisdiction: ['Greater Noida (Alpha, Beta, Surajpur, Ecotech)', 'Yamuna Expressway Zone'],
    activeFieldAgents: 11,
    verifiedActionsCount: 144,
    baselineReviewed: 126,
    baselineResolved: 84,
    baselineActive: 9,
    establishedYear: 2020,
    description: 'Dedicated to conserving the Surajpur Wetland sanctuary rim, curbing illegal C&D debris dumping, and restoring indigenous vegetative buffers.'
  },
  {
    id: 'ORG-04',
    name: 'Eco Action Collective',
    alias: 'Delhi Green Habitat & Waste Watch',
    acronym: 'EAC',
    lead: 'Prof. Suniti Narayan',
    email: 'alerts@ecoaction.org',
    phone: '+91 11 2618 9033',
    focusAreas: ['Garbage Dumping', 'Plastic Waste', 'Sewage/Drainage', 'Industrial Emission'],
    jurisdiction: ['Delhi (South, West, Central)', 'Ghaziabad (Border Sectors)'],
    activeFieldAgents: 19,
    verifiedActionsCount: 228,
    baselineReviewed: 178,
    baselineResolved: 112,
    baselineActive: 14,
    establishedYear: 2017,
    description: 'Audits municipal unsegregated landfill perimeters, stormwater drain blockages, and toxic leachate leakage near vulnerable urban settlements.'
  }
];

// 2. Mock fieldWorkers array (5 specialists)
const fieldWorkers = [
  { id: 'FW-01', name: 'Dr. Radhika Sen', role: 'Senior Environmental Scientist', orgId: 'ORG-01', activeAssignments: 3, zone: 'Yamuna Khadar & Okhla' },
  { id: 'FW-02', name: 'Amitav Sharma', role: 'Field Verification Lead', orgId: 'ORG-02', activeAssignments: 5, zone: 'Sahibabad & Ghaziabad North' },
  { id: 'FW-03', name: 'Pooja Verma', role: 'Hydrological Quality Specialist', orgId: 'ORG-03', activeAssignments: 2, zone: 'Surajpur & Greater Noida' },
  { id: 'FW-04', name: 'Karan Malhotra', role: 'Community Action Coordinator', orgId: 'ORG-02', activeAssignments: 4, zone: 'Noida Sec 62-63 & Indirapuram' },
  { id: 'FW-05', name: 'Meera Nair', role: 'Air Quality & Emissions Analyst', orgId: 'ORG-04', activeAssignments: 2, zone: 'Anand Vihar & Ghazipur' }
];

// 3. 50 Realistic Citizen Reports Ingested for NGO Intelligence
const environmentalReports = [
  {
    id: 'REP-2026-001',
    title: 'Dense industrial smoke emission along Sector 63 corridor',
    category: 'Industrial Emission',
    city: 'Noida',
    location: 'Block H, Sector 63, Industrial Area',
    coordinates: [28.6254, 77.3789],
    severity: 'High',
    confidence: 0.94,
    status: 'Verified',
    verified: true,
    reportDate: '2026-06-12T08:30:00Z',
    submittedBy: 'Citizen Sentinel #4102',
    description: 'AI-detected suspected issue: heavy dark particulate plumes discharged from packaging unit after midnight. Ground verification confirmed non-functional wet scrubber.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: 'Karan Malhotra',
    priority: 'High',
    dueDate: '2026-06-18',
    notes: [
      { id: 'N-1', author: 'Karan Malhotra', timestamp: '2026-06-14T11:20:00Z', text: 'Inspected site on June 14. Plume matches sensor PM2.5 surge of 380 ug/m3. Formal notice drafted for State Pollution Control Board.' }
    ],
    aiObservations: 'Optical drone analysis detects black plume opacity exceeding Ringelmann Scale No. 3. Suspected unregistered boiler fuel.',
    estimatedAffectedPopulation: 14500
  },
  {
    id: 'REP-2026-002',
    title: 'Biomass and dried leaf open combustion in park greenbelt',
    category: 'Waste Burning',
    city: 'Greater Noida',
    location: 'Near Golf Course periphery, Sector Alpha 1',
    coordinates: [28.4815, 77.5122],
    severity: 'Medium',
    confidence: 0.88,
    status: 'Action Initiated',
    verified: true,
    reportDate: '2026-06-15T17:45:00Z',
    submittedBy: 'Citizen Sentinel #1890',
    description: 'AI-detected suspected issue: localized heat anomaly and particulate cloud consistent with municipal horticulture waste burning near residential boundary.',
    organization: 'Greater Noida Eco-Action & Habitat Trust',
    assignedTo: 'Pooja Verma',
    priority: 'Medium',
    dueDate: '2026-06-22',
    notes: [
      { id: 'N-2', author: 'Pooja Verma', timestamp: '2026-06-17T09:15:00Z', text: 'Reached maintenance supervisor. Fire doused, on-site compost mulching alternative demonstrated.' }
    ],
    aiObservations: 'Thermal satellite sensor overlay registered 65°C surface anomaly. High confidence on organic matter burning.',
    estimatedAffectedPopulation: 3200
  },
  {
    id: 'REP-2026-003',
    title: 'Untreated chemical runoff pooling near stormwater outlet',
    category: 'Water Pollution',
    city: 'Ghaziabad',
    location: 'Site 4 Industrial Area, Sahibabad',
    coordinates: [28.6758, 77.3828],
    severity: 'High',
    confidence: 0.96,
    status: 'Verified',
    verified: true,
    reportDate: '2026-06-18T10:10:00Z',
    submittedBy: 'Citizen Sentinel #3301',
    description: 'AI-detected suspected issue: discolored turquoise discharge entering secondary stormwater drain feeding Hindon canal. Chemical odor reported by residents within 800m.',
    organization: 'Yamuna Ecological Restoration Collective',
    assignedTo: 'Amitav Sharma',
    priority: 'High',
    dueDate: '2026-06-25',
    notes: [
      { id: 'N-3', author: 'Amitav Sharma', timestamp: '2026-06-19T14:40:00Z', text: 'Water samples collected. pH reads 4.2 (highly acidic), heavy metals suspected. Awaiting state lab report.' }
    ],
    aiObservations: 'Spectral analysis indicates synthetic dye residue and depleted dissolved oxygen signature.',
    estimatedAffectedPopulation: 22000
  },
  {
    id: 'REP-2026-004',
    title: 'Illegal construction debris accumulation on vacant wetland buffer',
    category: 'Garbage Dumping',
    city: 'Greater Noida',
    location: 'Surajpur Wetland Buffer Zone, Sector Ecotech III',
    coordinates: [28.5280, 77.4952],
    severity: 'High',
    confidence: 0.91,
    status: 'Under Review',
    verified: false,
    reportDate: '2026-06-21T06:20:00Z',
    submittedBy: 'Citizen Sentinel #8294',
    description: 'AI-detected suspected issue: overnight dumping of concrete slabs, brick rubble, and plastic packaging threatening seasonal wading bird habitat. Requires field verification.',
    organization: 'Greater Noida Eco-Action & Habitat Trust',
    assignedTo: 'Pooja Verma',
    priority: 'High',
    dueDate: '2026-06-28',
    notes: [],
    aiObservations: 'Elevation differential modeling shows ~140 metric tons of inert debris deposited across 400 sq meters.',
    estimatedAffectedPopulation: 1800
  },
  {
    id: 'REP-2026-005',
    title: 'High particulate smog accumulation at major interstate junction',
    category: 'Air Pollution',
    city: 'Delhi',
    location: 'Anand Vihar ISBT & Railway Crossing Interchange',
    coordinates: [28.6472, 77.3155],
    severity: 'High',
    confidence: 0.97,
    status: 'Verified',
    verified: true,
    reportDate: '2026-06-25T19:00:00Z',
    submittedBy: 'Citizen Sentinel #7011',
    description: 'Continuous particulate spike where PM10 regularly exceeds 420 ug/m3 during peak commuter hours. AI-detected suspected issue aggregates road dust re-suspension and diesel idling.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: 'Meera Nair',
    priority: 'High',
    dueDate: '2026-07-02',
    notes: [
      { id: 'N-4', author: 'Meera Nair', timestamp: '2026-06-27T16:00:00Z', text: 'Corroborated with DPCC Anand Vihar CAAQMS data. Submitting anti-smog mist cannon deployment proposal.' }
    ],
    aiObservations: 'Multi-source correlation shows particulate envelope trapped by railway overpass microclimate.',
    estimatedAffectedPopulation: 85000
  },
  {
    id: 'REP-2026-006',
    title: 'Single-use plastic scrap burning behind wholesale mandi',
    category: 'Plastic Waste',
    city: 'Ghaziabad',
    location: 'Sahibabad Vegetable Mandi Back Road',
    coordinates: [28.6675, 77.3690],
    severity: 'Medium',
    confidence: 0.85,
    status: 'Resolved',
    verified: true,
    reportDate: '2026-06-28T21:15:00Z',
    submittedBy: 'Citizen Sentinel #2099',
    description: 'AI-detected suspected issue: toxic plastic packaging film set on fire to reduce bulk waste. Smoldering dioxin odor reported by adjacent residential colony.',
    organization: 'Delhi Green Habitat & Waste Watch',
    assignedTo: 'Amitav Sharma',
    priority: 'Medium',
    dueDate: '2026-07-03',
    notes: [
      { id: 'N-5', author: 'Amitav Sharma', timestamp: '2026-06-30T10:30:00Z', text: 'Municipal sanitary inspector mobilized. Waste pile cleared; two dedicated segregation bins installed.' }
    ],
    aiObservations: 'Thermal image detected high-temperature localized flash point matching polyethylene combustion characteristics.',
    estimatedAffectedPopulation: 6700
  },
  {
    id: 'REP-2026-007',
    title: 'Rubble dumping along Yamuna floodplains embankment',
    category: 'Garbage Dumping',
    city: 'Noida',
    location: 'Embankment Road, Sector 128 / Asagarpur',
    coordinates: [28.5140, 77.3730],
    severity: 'High',
    confidence: 0.89,
    status: 'Under Review',
    verified: false,
    reportDate: '2026-07-01T14:30:00Z',
    submittedBy: 'Citizen Sentinel #5512',
    description: 'AI-detected suspected issue: systematic nighttime truck dumping of debris on active flood plain silt beds. Requires field verification and GPS geotag audit.',
    organization: 'Yamuna Ecological Restoration Collective',
    assignedTo: 'Dr. Radhika Sen',
    priority: 'High',
    dueDate: '2026-07-07',
    notes: [],
    aiObservations: 'Satellite visual comparison reveals 18% encroachment on natural soil absorption rim over 4 weeks.',
    estimatedAffectedPopulation: 9000
  },
  {
    id: 'REP-2026-008',
    title: 'Overflowing open sewer contaminating neighborhood groundwater',
    category: 'Sewage/Drainage',
    city: 'Delhi',
    location: 'Near Mangolpuri Phase 1 Trunk Line, North West Delhi',
    coordinates: [28.6942, 77.0851],
    severity: 'High',
    confidence: 0.92,
    status: 'Verified',
    verified: true,
    reportDate: '2026-07-03T11:05:00Z',
    submittedBy: 'Citizen Sentinel #4029',
    description: 'Uncovered sewer line blockage causing blackwater overflow into public street and unpaved ground. Water potability complaints in nearby borewells.',
    organization: 'Delhi Green Habitat & Waste Watch',
    assignedTo: 'Dr. Radhika Sen',
    priority: 'High',
    dueDate: '2026-07-09',
    notes: [
      { id: 'N-6', author: 'Dr. Radhika Sen', timestamp: '2026-07-05T13:10:00Z', text: 'Confirmed presence of high coliform in tap supply. Jal Board escalation filed under Urgent.' }
    ],
    aiObservations: 'Fluid spread area exceeds 650 sq meters; high pathogen exposure threat identified.',
    estimatedAffectedPopulation: 16000
  },
  {
    id: 'REP-2026-009',
    title: 'Commercial diesel delivery vans heavy idling and black exhaust',
    category: 'Vehicle Pollution',
    city: 'Ghaziabad',
    location: 'Mohan Nagar Transport Hub, GT Road',
    coordinates: [28.6792, 77.3991],
    severity: 'Medium',
    confidence: 0.78,
    status: 'AI Analyzed',
    verified: false,
    reportDate: '2026-07-05T07:45:00Z',
    submittedBy: 'Citizen Sentinel #1203',
    description: 'AI-detected suspected issue: sustained fleet idling with visible carbon blow-by across 40+ uncertified logistics vehicles during cargo unloading.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: null,
    priority: 'Medium',
    dueDate: null,
    notes: [],
    aiObservations: 'Acoustic and computer vision indicators suggest sub-standard particulate filters on commercial light trucks.',
    estimatedAffectedPopulation: 12000
  },
  {
    id: 'REP-2026-010',
    title: 'Mature roadside Neem and Peepal tree clearing for road widening',
    category: 'Deforestation',
    city: 'Greater Noida',
    location: 'Knowledge Park III Peripheral Avenue',
    coordinates: [28.4735, 77.4889],
    severity: 'Medium',
    confidence: 0.86,
    status: 'Verified',
    verified: true,
    reportDate: '2026-07-07T12:00:00Z',
    submittedBy: 'Citizen Sentinel #9921',
    description: 'AI-detected suspected issue: unpermitted felling of 14 mature shade trees without mandatory compensatory afforestation tag displayed on site.',
    organization: 'Greater Noida Eco-Action & Habitat Trust',
    assignedTo: 'Pooja Verma',
    priority: 'Medium',
    dueDate: '2026-07-14',
    notes: [
      { id: 'N-7', author: 'Pooja Verma', timestamp: '2026-07-08T15:20:00Z', text: 'Halted contractor via local forest ranger contact. 6 surviving saplings secured.' }
    ],
    aiObservations: 'Canopy density metric dropped by 34% over a 150-meter stretch in recent aerial snapshot.',
    estimatedAffectedPopulation: 4500
  },
  {
    id: 'REP-2026-011',
    title: 'Paddy straw residual burning spotted in agricultural fringe',
    category: 'Crop Burning',
    city: 'Ghaziabad',
    location: 'Loni Rural Belt, Near Tronica City Border',
    coordinates: [28.7521, 77.2878],
    severity: 'High',
    confidence: 0.95,
    status: 'Action Initiated',
    verified: true,
    reportDate: '2026-07-09T18:30:00Z',
    submittedBy: 'Citizen Sentinel #7712',
    description: 'Early season crop residue burning over 3 acres. Plume drifting south towards residential settlements in Loni and North East Delhi.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: 'Amitav Sharma',
    priority: 'High',
    dueDate: '2026-07-15',
    notes: [
      { id: 'N-8', author: 'Amitav Sharma', timestamp: '2026-07-10T10:00:00Z', text: 'Engaged village panchayat head. Happy Seeder machine subsidization awareness session arranged.' }
    ],
    aiObservations: 'VIIRS satellite thermal sensor confirmed 3 active fire pixels with brightness temp 325K.',
    estimatedAffectedPopulation: 31000
  },
  {
    id: 'REP-2026-012',
    title: 'Dormant leachate pond overflow near Ghazipur Landfill base',
    category: 'Garbage Dumping',
    city: 'Delhi',
    location: 'Ghazipur Dairy Farm Road, East Delhi',
    coordinates: [28.6261, 77.3280],
    severity: 'High',
    confidence: 0.98,
    status: 'Verified',
    verified: true,
    reportDate: '2026-07-12T09:10:00Z',
    submittedBy: 'Citizen Sentinel #6441',
    description: 'AI-detected suspected issue: monsoon accumulation overflowing landfill retention pond, carrying dark toxic leachate into roadside ditch.',
    organization: 'Delhi Green Habitat & Waste Watch',
    assignedTo: 'Meera Nair',
    priority: 'High',
    dueDate: '2026-07-18',
    notes: [
      { id: 'N-9', author: 'Meera Nair', timestamp: '2026-07-13T17:30:00Z', text: 'Sample conductivity reads >4000 uS/cm. Urgent containment barrier recommended in MCD report.' }
    ],
    aiObservations: 'Reflectance signature aligns with high ammoniacal nitrogen and heavy municipal leachate.',
    estimatedAffectedPopulation: 42000
  },
  {
    id: 'REP-2026-013',
    title: 'Plastic shredding unit venting unscrubbed micro-plastic dust',
    category: 'Plastic Waste',
    city: 'Noida',
    location: 'Sector 10 Industrial Cluster, Near G-Block',
    coordinates: [28.5910, 77.3190],
    severity: 'Medium',
    confidence: 0.81,
    status: 'Under Review',
    verified: false,
    reportDate: '2026-07-14T15:40:00Z',
    submittedBy: 'Citizen Sentinel #3190',
    description: 'AI-detected suspected issue: informal recycling facility expelling particulate plastic dust directly onto pedestrian lane without wet scrubber.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: 'Karan Malhotra',
    priority: 'Medium',
    dueDate: '2026-07-21',
    notes: [],
    aiObservations: 'Optical particle counter readings from nearby mobile node report spikes in PM2.5 fractions.',
    estimatedAffectedPopulation: 5800
  },
  {
    id: 'REP-2026-014',
    title: 'Untreated dye wastewater discharge into Hindon River tributary',
    category: 'Water Pollution',
    city: 'Ghaziabad',
    location: 'Karhera Bridge, Hindon River Basin',
    coordinates: [28.6874, 77.4120],
    severity: 'High',
    confidence: 0.96,
    status: 'Action Initiated',
    verified: true,
    reportDate: '2026-07-17T06:45:00Z',
    submittedBy: 'Citizen Sentinel #4881',
    description: 'Red-tinted chemical effluent discharge observed entering the water channel under cover of early morning fog. Strong sulfur smell detected.',
    organization: 'Yamuna Ecological Restoration Collective',
    assignedTo: 'Amitav Sharma',
    priority: 'High',
    dueDate: '2026-07-24',
    notes: [
      { id: 'N-10', author: 'Amitav Sharma', timestamp: '2026-07-18T12:15:00Z', text: 'Traced outlet to unlicensed textile sizing shed 500m upstream. UPPCB alert filed.' }
    ],
    aiObservations: 'Spectroscopic absorption spikes in azo dye wavelengths; biological life absence confirmed downstream.',
    estimatedAffectedPopulation: 28000
  },
  {
    id: 'REP-2026-015',
    title: 'Suspected illegal tyre burning in scrap yard after midnight',
    category: 'Waste Burning',
    city: 'Delhi',
    location: 'Mayapuri Industrial Area Phase II',
    coordinates: [28.6310, 77.1235],
    severity: 'High',
    confidence: 0.93,
    status: 'Verified',
    verified: true,
    reportDate: '2026-07-19T01:30:00Z',
    submittedBy: 'Citizen Sentinel #5120',
    description: 'AI-detected suspected issue: black acrid smoke column rising from metal reclamation facility. Suspected pyrolysis of old radial tyres to extract steel wire.',
    organization: 'Delhi Green Habitat & Waste Watch',
    assignedTo: 'Dr. Radhika Sen',
    priority: 'High',
    dueDate: '2026-07-26',
    notes: [
      { id: 'N-11', author: 'Dr. Radhika Sen', timestamp: '2026-07-20T10:00:00Z', text: 'Night patrol recorded carbon monoxide peak. Police PCR assisted in securing premise.' }
    ],
    aiObservations: 'Nighttime thermal drone camera recorded 550°C core combustion bed.',
    estimatedAffectedPopulation: 34000
  },
  {
    id: 'REP-2026-016',
    title: 'Dust re-suspension from uncovered metro viaduct construction site',
    category: 'Air Pollution',
    city: 'Noida',
    location: 'Sector 142 Metro Station Extension Corridor',
    coordinates: [28.4980, 77.4195],
    severity: 'Low',
    confidence: 0.72,
    status: 'Reported',
    verified: false,
    reportDate: '2026-07-21T11:20:00Z',
    submittedBy: 'Citizen Sentinel #1904',
    description: 'AI-detected suspected issue: dry excavation sand mounds left without geotextile tarpaulins or water sprinkling, causing visible brown dust haze.',
    organization: null,
    assignedTo: null,
    priority: 'Low',
    dueDate: null,
    notes: [],
    aiObservations: 'Visual wind-drift model shows particulate spread toward expressway service road.',
    estimatedAffectedPopulation: 7600
  },
  {
    id: 'REP-2026-017',
    title: 'Scrap thermocol and Styrofoam dumping along stormwater drain',
    category: 'Plastic Waste',
    city: 'Greater Noida',
    location: 'Surajpur Industrial Area, Site B',
    coordinates: [28.5350, 77.4810],
    severity: 'Medium',
    confidence: 0.84,
    status: 'Verified',
    verified: true,
    reportDate: '2026-07-24T14:10:00Z',
    submittedBy: 'Citizen Sentinel #6620',
    description: 'Massive pile of packaging foam blocks obstructing culvert passage. Severe flood risk ahead of scheduled heavy monsoon downpours.',
    organization: 'Greater Noida Eco-Action & Habitat Trust',
    assignedTo: 'Pooja Verma',
    priority: 'Medium',
    dueDate: '2026-07-30',
    notes: [
      { id: 'N-12', author: 'Pooja Verma', timestamp: '2026-07-25T11:45:00Z', text: 'GNIDA drainage squad engaged. Clearance initiated; 3 trucks of Styrofoam recovered for compacting.' }
    ],
    aiObservations: 'Drain cross-sectional blockage calculated at 48% by flood risk algorithm.',
    estimatedAffectedPopulation: 9400
  },
  {
    id: 'REP-2026-018',
    title: 'Heavy diesel delivery truck idling during night freight loading',
    category: 'Vehicle Pollution',
    city: 'Delhi',
    location: 'Sanjay Gandhi Transport Nagar, GT Karnal Road',
    coordinates: [28.7490, 77.1350],
    severity: 'Medium',
    confidence: 0.79,
    status: 'AI Analyzed',
    verified: false,
    reportDate: '2026-07-26T23:40:00Z',
    submittedBy: 'Citizen Sentinel #8411',
    description: 'AI-detected suspected issue: over 60 interstate commercial carriers idling auxiliary engines throughout 4-hour loading window in unventilated bay.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: null,
    priority: 'Medium',
    dueDate: null,
    notes: [],
    aiObservations: 'Nitrogen dioxide (NO2) hotspot recognized across 1.2 sq km logistics terminal.',
    estimatedAffectedPopulation: 18000
  },
  {
    id: 'REP-2026-019',
    title: 'Suspected unauthorized tree felling in Aravalli ridge fringe',
    category: 'Deforestation',
    city: 'Delhi',
    location: 'Asola Bhatti Wildlife Sanctuary Peripheral Border',
    coordinates: [28.4890, 77.2410],
    severity: 'High',
    confidence: 0.91,
    status: 'Verified',
    verified: true,
    reportDate: '2026-07-28T09:00:00Z',
    submittedBy: 'Citizen Sentinel #3299',
    description: 'AI-detected suspected issue: chainsaw activity and tree clearings along the eco-sensitive buffer zone. 25 native Dhau and Babool trees reportedly felled.',
    organization: 'Delhi Green Habitat & Waste Watch',
    assignedTo: 'Dr. Radhika Sen',
    priority: 'High',
    dueDate: '2026-08-03',
    notes: [
      { id: 'N-13', author: 'Dr. Radhika Sen', timestamp: '2026-07-29T16:00:00Z', text: 'Forest Department joint patrol conducted. Boundary posts re-established; criminal trespass lodged.' }
    ],
    aiObservations: 'Vegetation index (NDVI) drop of 0.28 detected within designated sanctuary buffer area.',
    estimatedAffectedPopulation: 2500
  },
  {
    id: 'REP-2026-020',
    title: 'Municipal waste overflow at unserviced transit transfer station',
    category: 'Garbage Dumping',
    city: 'Ghaziabad',
    location: 'Raj Nagar Extension, Near Morti Crossing',
    coordinates: [28.7060, 77.4390],
    severity: 'Medium',
    confidence: 0.83,
    status: 'Action Initiated',
    verified: true,
    reportDate: '2026-07-30T16:50:00Z',
    submittedBy: 'Citizen Sentinel #7109',
    description: 'Piled household garbage spilling 35 meters into primary vehicular roadway. Stray cattle ingesting thin plastic carrybags.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: 'Amitav Sharma',
    priority: 'Medium',
    dueDate: '2026-08-05',
    notes: [
      { id: 'N-14', author: 'Amitav Sharma', timestamp: '2026-08-01T14:10:00Z', text: 'Compactor truck dispatched by Nagar Nigam. Secondary bin enclosure under construction.' }
    ],
    aiObservations: 'Volumetric estimation ~85 cubic meters of mixed municipal solid waste.',
    estimatedAffectedPopulation: 14000
  },
  {
    id: 'REP-2026-021',
    title: 'Raw sewage backflow into open neighborhood park drainage',
    category: 'Sewage/Drainage',
    city: 'Noida',
    location: 'Sector 76 Central Community Park Periphery',
    coordinates: [28.5730, 77.3825],
    severity: 'Medium',
    confidence: 0.87,
    status: 'Resolved',
    verified: true,
    reportDate: '2026-08-02T10:15:00Z',
    submittedBy: 'Citizen Sentinel #2208',
    description: 'Sewage pumping station failure resulting in wastewater flooding walking tracks and grass lawns. Urgent chlorination and motor replacement needed.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: 'Karan Malhotra',
    priority: 'Medium',
    dueDate: '2026-08-06',
    notes: [
      { id: 'N-15', author: 'Karan Malhotra', timestamp: '2026-08-03T18:00:00Z', text: 'Noida Authority pump restored. Disinfection with lime powder complete.' }
    ],
    aiObservations: 'High microbial contamination risk flagged due to proximate children play equipment.',
    estimatedAffectedPopulation: 8200
  },
  {
    id: 'REP-2026-022',
    title: 'Boiler chimney emission emitting dense soot during early morning',
    category: 'Industrial Emission',
    city: 'Delhi',
    location: 'Wazirpur Industrial Area, Block C',
    coordinates: [28.6990, 77.1650],
    severity: 'High',
    confidence: 0.93,
    status: 'Verified',
    verified: true,
    reportDate: '2026-08-04T05:30:00Z',
    submittedBy: 'Citizen Sentinel #9401',
    description: 'AI-detected suspected issue: pickling and rolling mill using furnace oil or unauthorized pet-coke fuels. Dense black smoke blanket covering railway line.',
    organization: 'Delhi Green Habitat & Waste Watch',
    assignedTo: 'Dr. Radhika Sen',
    priority: 'High',
    dueDate: '2026-08-10',
    notes: [
      { id: 'N-16', author: 'Dr. Radhika Sen', timestamp: '2026-08-05T11:00:00Z', text: 'Drone footage recorded. Sent to DPCC surveillance wing.' }
    ],
    aiObservations: 'Sulfur dioxide (SO2) column concentration substantially exceeds national ambient air quality benchmarks.',
    estimatedAffectedPopulation: 38000
  },
  {
    id: 'REP-2026-023',
    title: 'Crop residue open burn on Yamuna floodplain farmland',
    category: 'Crop Burning',
    city: 'Noida',
    location: 'Yamuna Floodplain Farmlands, Near Sector 135 Bund',
    coordinates: [28.4975, 77.4080],
    severity: 'High',
    confidence: 0.90,
    status: 'Verified',
    verified: true,
    reportDate: '2026-08-06T18:00:00Z',
    submittedBy: 'Citizen Sentinel #6122',
    description: 'AI-detected suspected issue: multiple small biomass burnings along the floodplain riverbank. Smog settling over Expressway sectors.',
    organization: 'Yamuna Ecological Restoration Collective',
    assignedTo: 'Dr. Radhika Sen',
    priority: 'High',
    dueDate: '2026-08-12',
    notes: [
      { id: 'N-17', author: 'Dr. Radhika Sen', timestamp: '2026-08-07T09:30:00Z', text: 'Met farmer collectives. Demonstration of bio-decomposer capsules carried out.' }
    ],
    aiObservations: 'Thermal imagery confirmed 4 distinct burn scars totaling ~1.8 hectares.',
    estimatedAffectedPopulation: 29000
  },
  {
    id: 'REP-2026-024',
    title: 'Municipal street sweeping dust dumped directly into open drain',
    category: 'Garbage Dumping',
    city: 'Ghaziabad',
    location: 'Vaishali Sector 4, Main Market Road',
    coordinates: [28.6465, 77.3405],
    severity: 'Low',
    confidence: 0.68,
    status: 'Reported',
    verified: false,
    reportDate: '2026-08-08T08:15:00Z',
    submittedBy: 'Citizen Sentinel #1502',
    description: 'AI-detected suspected issue: sanitation sweepers brushing street grit and leaf debris directly into stormwater grating.',
    organization: null,
    assignedTo: null,
    priority: 'Low',
    dueDate: null,
    notes: [],
    aiObservations: 'Silt deposition risk high; likely to choke downstream storm interceptors.',
    estimatedAffectedPopulation: 4100
  },
  {
    id: 'REP-2026-025',
    title: 'Groundwater discoloration from suspected battery recycling effluent',
    category: 'Water Pollution',
    city: 'Greater Noida',
    location: 'Ecotech II, Light Industrial Zone',
    coordinates: [28.5640, 77.4700],
    severity: 'High',
    confidence: 0.97,
    status: 'Under Review',
    verified: false,
    reportDate: '2026-08-10T13:40:00Z',
    submittedBy: 'Citizen Sentinel #4388',
    description: 'AI-detected suspected issue: handpump water turning yellowish-gray with metallic taste. Suspected illegal lead-acid battery washing pit.',
    organization: 'Greater Noida Eco-Action & Habitat Trust',
    assignedTo: 'Pooja Verma',
    priority: 'High',
    dueDate: '2026-08-16',
    notes: [],
    aiObservations: 'Hydrological proximity model shows 4 drinking borewells within 250m radius.',
    estimatedAffectedPopulation: 5200
  },
  {
    id: 'REP-2026-026',
    title: 'Discarded multi-layer plastic packaging accumulating along drain banks',
    category: 'Plastic Waste',
    city: 'Delhi',
    location: 'Najafgarh Drain Bank, Near Kakrola Bridge',
    coordinates: [28.6095, 76.9805],
    severity: 'Medium',
    confidence: 0.82,
    status: 'AI Analyzed',
    verified: false,
    reportDate: '2026-08-12T16:20:00Z',
    submittedBy: 'Citizen Sentinel #2810',
    description: 'AI-detected suspected issue: heavy concentration of non-recyclable multi-layered metallized chip bags choking wetland embankment vegetation.',
    organization: 'Delhi Green Habitat & Waste Watch',
    assignedTo: null,
    priority: 'Medium',
    dueDate: null,
    notes: [],
    aiObservations: 'Computer vision surface coverage estimation indicates ~2200 sq meters of plastic matting.',
    estimatedAffectedPopulation: 11000
  },
  {
    id: 'REP-2026-027',
    title: 'Persistent waste burn smoldering beside railway siding',
    category: 'Waste Burning',
    city: 'Ghaziabad',
    location: 'Old Ghaziabad Railway Goods Yard, Madhopura',
    coordinates: [28.6690, 77.4320],
    severity: 'High',
    confidence: 0.92,
    status: 'Verified',
    verified: true,
    reportDate: '2026-08-14T20:30:00Z',
    submittedBy: 'Citizen Sentinel #9021',
    description: 'Piles of mixed railway cargo packing wood, tar, and plastic wrapping burning continuously for 18 hours. Smoke drifting across passenger platforms.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: 'Amitav Sharma',
    priority: 'High',
    dueDate: '2026-08-20',
    notes: [
      { id: 'N-18', author: 'Amitav Sharma', timestamp: '2026-08-15T08:00:00Z', text: 'Railway Protection Force coordinated to extinguish burn. Station director issued memo.' }
    ],
    aiObservations: 'Continuous PM2.5 elevated emission signature detected by railway air monitoring beacon.',
    estimatedAffectedPopulation: 36000
  },
  {
    id: 'REP-2026-028',
    title: 'Commercial bus terminus idling in unpaved dirt lot',
    category: 'Vehicle Pollution',
    city: 'Delhi',
    location: 'Kashmere Gate ISBT Northern Outflow',
    coordinates: [28.6670, 77.2340],
    severity: 'High',
    confidence: 0.89,
    status: 'Action Initiated',
    verified: true,
    reportDate: '2026-08-16T12:00:00Z',
    submittedBy: 'Citizen Sentinel #5011',
    description: 'Over 80 diesel coaches idling engines simultaneously in dusty, unpaved standby lot creating extreme localized aerosol concentration.',
    organization: 'Delhi Green Habitat & Waste Watch',
    assignedTo: 'Dr. Radhika Sen',
    priority: 'High',
    dueDate: '2026-08-22',
    notes: [
      { id: 'N-19', author: 'Dr. Radhika Sen', timestamp: '2026-08-17T14:30:00Z', text: 'Submitted proposal to Transport Dept for electrification of parking stands and anti-idling enforcement.' }
    ],
    aiObservations: 'Micro-scale air dispersion model flags severe occupational hazard for transit workers.',
    estimatedAffectedPopulation: 62000
  },
  {
    id: 'REP-2026-029',
    title: 'Mature Shisham tree cutting inside institutional green belt',
    category: 'Deforestation',
    city: 'Greater Noida',
    location: 'Gamma 2 Institutional Sector, Near Community Center',
    coordinates: [28.4800, 77.5035],
    severity: 'Low',
    confidence: 0.74,
    status: 'Resolved',
    verified: true,
    reportDate: '2026-08-18T10:40:00Z',
    submittedBy: 'Citizen Sentinel #3890',
    description: 'AI-detected suspected issue: trimming operations exceeded permissible limit, removing entire crown of 4 protected Indian rosewood trees.',
    organization: 'Greater Noida Eco-Action & Habitat Trust',
    assignedTo: 'Pooja Verma',
    priority: 'Low',
    dueDate: '2026-08-23',
    notes: [
      { id: 'N-20', author: 'Pooja Verma', timestamp: '2026-08-19T11:15:00Z', text: 'Contractor warned; institutional authority planted 20 indigenous saplings in compensation.' }
    ],
    aiObservations: 'Canopy loss verified via high-res street imagery delta.',
    estimatedAffectedPopulation: 2100
  },
  {
    id: 'REP-2026-030',
    title: 'Severe untreated effluent discharge into Shahdara Drain',
    category: 'Water Pollution',
    city: 'Delhi',
    location: 'Shahdara Outfall Drain, Near Chilla Regulator',
    coordinates: [28.6015, 77.3020],
    severity: 'High',
    confidence: 0.98,
    status: 'Verified',
    verified: true,
    reportDate: '2026-08-20T07:15:00Z',
    submittedBy: 'Citizen Sentinel #7420',
    description: 'Pitch black foaming sludge carrying foul hydrogen sulfide gas flowing at over 250 million liters/day directly toward confluence with Yamuna.',
    organization: 'Yamuna Ecological Restoration Collective',
    assignedTo: 'Dr. Radhika Sen',
    priority: 'High',
    dueDate: '2026-08-27',
    notes: [
      { id: 'N-21', author: 'Dr. Radhika Sen', timestamp: '2026-08-22T09:00:00Z', text: 'Dissolved oxygen at zero mg/L. Joint remediation petition submitted to Yamuna Monitoring Committee.' }
    ],
    aiObservations: 'Spectral absorption confirms raw untreated domestic sewage combined with metal plating effluents.',
    estimatedAffectedPopulation: 78000
  },
  {
    id: 'REP-2026-031',
    title: 'Illegal municipal landfill expansion onto agricultural pasture',
    category: 'Garbage Dumping',
    city: 'Ghaziabad',
    location: 'Pratap Vihar Sector 11 Peripheral Land',
    coordinates: [28.6530, 77.4280],
    severity: 'High',
    confidence: 0.91,
    status: 'Under Review',
    verified: false,
    reportDate: '2026-08-22T15:10:00Z',
    submittedBy: 'Citizen Sentinel #4711',
    description: 'AI-detected suspected issue: informal garbage dumping trucks diverting away from official dump site and tipping mixed waste into open farming meadows.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: 'Amitav Sharma',
    priority: 'High',
    dueDate: '2026-08-28',
    notes: [],
    aiObservations: 'Perimeter expansion measures +320 meters over baseline cadastral maps.',
    estimatedAffectedPopulation: 19000
  },
  {
    id: 'REP-2026-032',
    title: 'Informal cable stripping and PVC insulation open burning',
    category: 'Waste Burning',
    city: 'Delhi',
    location: 'Mandoli Industrial Estate, East Delhi',
    coordinates: [28.7085, 77.3095],
    severity: 'High',
    confidence: 0.95,
    status: 'Verified',
    verified: true,
    reportDate: '2026-08-24T22:15:00Z',
    submittedBy: 'Citizen Sentinel #6399',
    description: 'AI-detected suspected issue: open pit fires burning copper electrical wires to strip PVC casing. Highly toxic dioxin and hydrochloric acid vapor detected.',
    organization: 'Delhi Green Habitat & Waste Watch',
    assignedTo: 'Meera Nair',
    priority: 'High',
    dueDate: '2026-08-30',
    notes: [
      { id: 'N-22', author: 'Meera Nair', timestamp: '2026-08-25T11:40:00Z', text: 'Raid conducted with local police. 4 burn pits doused and sealed.' }
    ],
    aiObservations: 'Aerosol mass spectrometer indicator confirms elevated chlorine and aromatic hydrocarbon traces.',
    estimatedAffectedPopulation: 27000
  },
  {
    id: 'REP-2026-033',
    title: 'Air pollution spike from brick kilns operating outside permissible season',
    category: 'Air Pollution',
    city: 'Greater Noida',
    location: 'Dhoom Manikpur Village Belt, Near GT Road',
    coordinates: [28.5390, 77.5620],
    severity: 'High',
    confidence: 0.94,
    status: 'Verified',
    verified: true,
    reportDate: '2026-08-26T04:45:00Z',
    submittedBy: 'Citizen Sentinel #8199',
    description: '3 FCBTK brick kilns observed firing non-compliant coal without zig-zag emission technology during restricted monsoon window.',
    organization: 'Greater Noida Eco-Action & Habitat Trust',
    assignedTo: 'Pooja Verma',
    priority: 'High',
    dueDate: '2026-09-01',
    notes: [
      { id: 'N-23', author: 'Pooja Verma', timestamp: '2026-08-27T15:00:00Z', text: 'Regional Officer UPPCB notified with GPS coordinates and thermal plume recordings.' }
    ],
    aiObservations: 'Plume temperature and velocity signature confirm active kilns operating at 950°C internal firing.',
    estimatedAffectedPopulation: 33000
  },
  {
    id: 'REP-2026-034',
    title: 'Chemical drum cleaning residue poured directly into ground soil',
    category: 'Water Pollution',
    city: 'Noida',
    location: 'Sector 8 Industrial Area, Near Water Tank 3',
    coordinates: [28.5990, 77.3165],
    severity: 'High',
    confidence: 0.93,
    status: 'Action Initiated',
    verified: true,
    reportDate: '2026-08-28T11:30:00Z',
    submittedBy: 'Citizen Sentinel #3510',
    description: 'AI-detected suspected issue: solvent-washing of industrial chemical barrels in open yard; washwater percolating directly into sandy aquifer.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: 'Karan Malhotra',
    priority: 'High',
    dueDate: '2026-09-03',
    notes: [
      { id: 'N-24', author: 'Karan Malhotra', timestamp: '2026-08-29T10:20:00Z', text: 'Site manager instructed to install impermeable concrete washing apron and sump collector.' }
    ],
    aiObservations: 'Soil absorption stain detected covering 180 sq meters; solvent vapor concentration elevated.',
    estimatedAffectedPopulation: 9500
  },
  {
    id: 'REP-2026-035',
    title: 'Substandard commercial delivery auto-rickshaws emitting visible blue smoke',
    category: 'Vehicle Pollution',
    city: 'Ghaziabad',
    location: 'Kaushambi Interstate Transit Corridor',
    coordinates: [28.6455, 77.3250],
    severity: 'Low',
    confidence: 0.65,
    status: 'Reported',
    verified: false,
    reportDate: '2026-08-30T08:50:00Z',
    submittedBy: 'Citizen Sentinel #1198',
    description: 'AI-detected suspected issue: two-stroke cargo loaders mixing excessive engine oil in petrol fuel tanks.',
    organization: null,
    assignedTo: null,
    priority: 'Low',
    dueDate: null,
    notes: [],
    aiObservations: 'Optical opacity of exhaust exhaust plume exceeds 45% standard.',
    estimatedAffectedPopulation: 8900
  },
  {
    id: 'REP-2026-036',
    title: 'Plastic bottle and pouch dumping in storm drain basin',
    category: 'Plastic Waste',
    city: 'Greater Noida',
    location: 'Pari Chowk Interchange Storm Drain Intake',
    coordinates: [28.4650, 77.5110],
    severity: 'Medium',
    confidence: 0.87,
    status: 'Resolved',
    verified: true,
    reportDate: '2026-09-01T13:20:00Z',
    submittedBy: 'Citizen Sentinel #5840',
    description: 'Litter from commuter footfall and kiosks choking water passage beneath roundabout.',
    organization: 'Greater Noida Eco-Action & Habitat Trust',
    assignedTo: 'Pooja Verma',
    priority: 'Medium',
    dueDate: '2026-09-06',
    notes: [
      { id: 'N-25', author: 'Pooja Verma', timestamp: '2026-09-03T16:00:00Z', text: 'Trash traps installed on drain mouth; 420 kg of plastic retrieved and sent for recycling.' }
    ],
    aiObservations: 'Water flow reduction index marked at 62% prior to clearing intervention.',
    estimatedAffectedPopulation: 14000
  },
  {
    id: 'REP-2026-037',
    title: 'Paddy straw residual burning in suburban fringes',
    category: 'Crop Burning',
    city: 'Delhi',
    location: 'Bawana - Narela Agricultural Buffer, North Delhi',
    coordinates: [28.7980, 77.0620],
    severity: 'High',
    confidence: 0.96,
    status: 'Verified',
    verified: true,
    reportDate: '2026-09-03T17:40:00Z',
    submittedBy: 'Citizen Sentinel #7910',
    description: 'AI-detected suspected issue: intense seasonal crop stubble fires burning across multiple adjacent agricultural land parcels.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: 'Meera Nair',
    priority: 'High',
    dueDate: '2026-09-08',
    notes: [
      { id: 'N-26', author: 'Meera Nair', timestamp: '2026-09-04T12:00:00Z', text: 'Field sensors registered PM2.5 exceeding 550 ug/m3. Quick-response bio-sprayers dispatched.' }
    ],
    aiObservations: 'Thermal anomaly confirmed by MODIS satellite overpass; rapid wind transport south-eastward.',
    estimatedAffectedPopulation: 54000
  },
  {
    id: 'REP-2026-038',
    title: 'Untreated dairy slurry and manure draining into urban creek',
    category: 'Sewage/Drainage',
    city: 'Ghaziabad',
    location: 'Bhim Nagar Nallah, Near Vijay Nagar',
    coordinates: [28.6480, 77.4430],
    severity: 'Medium',
    confidence: 0.83,
    status: 'Under Review',
    verified: false,
    reportDate: '2026-09-05T09:30:00Z',
    submittedBy: 'Citizen Sentinel #3409',
    description: 'AI-detected suspected issue: informal dairy colonies flushing hundreds of kilograms of organic cattle manure into stormwater nallah without bio-digestion.',
    organization: 'Yamuna Ecological Restoration Collective',
    assignedTo: 'Amitav Sharma',
    priority: 'Medium',
    dueDate: '2026-09-11',
    notes: [],
    aiObservations: 'High biochemical oxygen demand (BOD) indicated by rapid anaerobic gas bubbling.',
    estimatedAffectedPopulation: 17500
  },
  {
    id: 'REP-2026-039',
    title: 'Suspicious chemical smell and fugitive emissions from electroplating units',
    category: 'Industrial Emission',
    city: 'Delhi',
    location: 'Anand Parbat Industrial Area, Gali 10',
    coordinates: [28.6630, 77.1710],
    severity: 'High',
    confidence: 0.91,
    status: 'Action Initiated',
    verified: true,
    reportDate: '2026-09-06T20:10:00Z',
    submittedBy: 'Citizen Sentinel #6088',
    description: 'AI-detected suspected issue: pungent acid mist escaping unhooded chroming tanks. Resident throat irritation reported widely.',
    organization: 'Delhi Green Habitat & Waste Watch',
    assignedTo: 'Dr. Radhika Sen',
    priority: 'High',
    dueDate: '2026-09-12',
    notes: [
      { id: 'N-27', author: 'Dr. Radhika Sen', timestamp: '2026-09-08T10:45:00Z', text: 'Air scrubbers found non-functional during physical check. Show-cause notice issued.' }
    ],
    aiObservations: 'Localized VOC sensor network registered 4.2x above safe occupational thresholds.',
    estimatedAffectedPopulation: 26000
  },
  {
    id: 'REP-2026-040',
    title: 'Felling of old roadside trees along expressway link construction',
    category: 'Deforestation',
    city: 'Noida',
    location: 'Sector 150 Sports City Expressway Connector',
    coordinates: [28.4490, 77.4615],
    severity: 'Medium',
    confidence: 0.79,
    status: 'Verified',
    verified: true,
    reportDate: '2026-09-08T11:15:00Z',
    submittedBy: 'Citizen Sentinel #2740',
    description: 'AI-detected suspected issue: road expansion crew removing mature eucalyptus and neem rows without barricaded tree-protection zone.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: 'Karan Malhotra',
    priority: 'Medium',
    dueDate: '2026-09-14',
    notes: [
      { id: 'N-28', author: 'Karan Malhotra', timestamp: '2026-09-09T14:30:00Z', text: 'Met engineering team. Adjusted median alignment saving 8 mature trees.' }
    ],
    aiObservations: 'Photogrammetric survey showed 22 trees marked for cutting without permission badges.',
    estimatedAffectedPopulation: 5100
  },
  {
    id: 'REP-2026-041',
    title: 'Commercial packaging cardboard and plastic burning in back alley',
    category: 'Waste Burning',
    city: 'Noida',
    location: 'Sector 18 Commercial Market, Pocket B Alley',
    coordinates: [28.5710, 77.3265],
    severity: 'Low',
    confidence: 0.76,
    status: 'Resolved',
    verified: true,
    reportDate: '2026-09-09T23:00:00Z',
    submittedBy: 'Citizen Sentinel #4509',
    description: 'Restaurant and retail back-alley sweepers burning packaging waste to clear space for morning deliveries.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: 'Karan Malhotra',
    priority: 'Low',
    dueDate: '2026-09-13',
    notes: [
      { id: 'N-29', author: 'Karan Malhotra', timestamp: '2026-09-10T11:00:00Z', text: 'Market association warned; dedicated nocturnal waste pickup vehicle assigned.' }
    ],
    aiObservations: 'Thermal hotspot signature resolved within 45 minutes of reported intervention.',
    estimatedAffectedPopulation: 3400
  },
  {
    id: 'REP-2026-042',
    title: 'Hazardous electronic waste dismantling and open chemical bathing',
    category: 'Garbage Dumping',
    city: 'Ghaziabad',
    location: 'Loni Border Scrap Hub, Prakash Nagar',
    coordinates: [28.7420, 77.2910],
    severity: 'High',
    confidence: 0.95,
    status: 'Verified',
    verified: true,
    reportDate: '2026-09-11T09:00:00Z',
    submittedBy: 'Citizen Sentinel #8831',
    description: 'AI-detected suspected issue: informal acid baths for recovering gold from computer circuit boards. Toxic cyanide fumes and ground sludge discarded into drains.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: 'Amitav Sharma',
    priority: 'High',
    dueDate: '2026-09-17',
    notes: [
      { id: 'N-30', author: 'Amitav Sharma', timestamp: '2026-09-12T13:30:00Z', text: 'Multi-agency inspection conducted. 3 illicit workshops sealed; e-waste sent to authorized recycler.' }
    ],
    aiObservations: 'Hyperspectral satellite scan identified heavy metal accumulation in roadside soils.',
    estimatedAffectedPopulation: 39000
  },
  {
    id: 'REP-2026-043',
    title: 'Dense road dust cloud from uncovered heavy quarry trucks',
    category: 'Air Pollution',
    city: 'Greater Noida',
    location: 'Ecotech III Heavy Transport Corridor',
    coordinates: [28.5620, 77.4695],
    severity: 'Medium',
    confidence: 0.81,
    status: 'AI Analyzed',
    verified: false,
    reportDate: '2026-09-12T14:45:00Z',
    submittedBy: 'Citizen Sentinel #3922',
    description: 'AI-detected suspected issue: high-speed stone grit and fly-ash carriers operating without tarpaulin canopy covers, generating severe blinding dust plumes.',
    organization: 'Greater Noida Eco-Action & Habitat Trust',
    assignedTo: null,
    priority: 'Medium',
    dueDate: null,
    notes: [],
    aiObservations: 'PM10 sensors located 400m downwind reported particulate surge of +280 ug/m3.',
    estimatedAffectedPopulation: 13000
  },
  {
    id: 'REP-2026-044',
    title: 'Turbid industrial washwater pouring into Surajpur wetland rim',
    category: 'Water Pollution',
    city: 'Greater Noida',
    location: 'Surajpur Wetland Peripheral Inflow Canal',
    coordinates: [28.5265, 77.4935],
    severity: 'High',
    confidence: 0.97,
    status: 'Verified',
    verified: true,
    reportDate: '2026-09-13T07:20:00Z',
    submittedBy: 'Citizen Sentinel #9102',
    description: 'Oily gray wastewater discharging into natural marsh feeding Sarus Crane nesting zones. Immediate containment boom required.',
    organization: 'Greater Noida Eco-Action & Habitat Trust',
    assignedTo: 'Pooja Verma',
    priority: 'High',
    dueDate: '2026-09-18',
    notes: [
      { id: 'N-31', author: 'Pooja Verma', timestamp: '2026-09-14T09:15:00Z', text: 'Installed floating oil absorbent booms at canal mouth. Forest wildlife warden briefed.' }
    ],
    aiObservations: 'High oil-grease index (OGI) and total dissolved solids (TDS) detected by optical sensor.',
    estimatedAffectedPopulation: 7100
  },
  {
    id: 'REP-2026-045',
    title: 'High-density plastic beverage containers blocking stormwater channel',
    category: 'Plastic Waste',
    city: 'Ghaziabad',
    location: 'Indirapuram Canal Road, Near Shipra Mall Culvert',
    coordinates: [28.6420, 77.3720],
    severity: 'Low',
    confidence: 0.77,
    status: 'Action Initiated',
    verified: true,
    reportDate: '2026-09-14T17:00:00Z',
    submittedBy: 'Citizen Sentinel #1624',
    description: 'AI-detected suspected issue: floating mat of PET bottles and styrofoam packaging accumulating behind bridge pilings.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: 'Amitav Sharma',
    priority: 'Low',
    dueDate: '2026-09-20',
    notes: [
      { id: 'N-32', author: 'Amitav Sharma', timestamp: '2026-09-15T15:00:00Z', text: 'Trash net mechanism deployed. 600 kg PET bottles recovered for EPR credit processing.' }
    ],
    aiObservations: 'Surface area of plastic trap calculated at 85 sq meters with 90% coverage density.',
    estimatedAffectedPopulation: 11500
  },
  {
    id: 'REP-2026-046',
    title: 'Stubble burn embers spreading to roadside brush',
    category: 'Crop Burning',
    city: 'Greater Noida',
    location: 'Dankaur Link Road Farmlands',
    coordinates: [28.3890, 77.5450],
    severity: 'High',
    confidence: 0.94,
    status: 'Under Review',
    verified: false,
    reportDate: '2026-09-15T18:30:00Z',
    submittedBy: 'Citizen Sentinel #5301',
    description: 'AI-detected suspected issue: uncontrolled agricultural field fire threatening roadside electric transmission poles and eucalyptus groves.',
    organization: 'Greater Noida Eco-Action & Habitat Trust',
    assignedTo: 'Pooja Verma',
    priority: 'High',
    dueDate: '2026-09-19',
    notes: [],
    aiObservations: 'Thermal signature indicates front movement rate of 4.5 meters/min.',
    estimatedAffectedPopulation: 8800
  },
  {
    id: 'REP-2026-047',
    title: 'Massive unsegregated municipal garbage dump along ring road bypass',
    category: 'Garbage Dumping',
    city: 'Delhi',
    location: 'Near Jahangirpuri Outer Ring Road Bypass',
    coordinates: [28.7270, 77.1715],
    severity: 'High',
    confidence: 0.92,
    status: 'Verified',
    verified: true,
    reportDate: '2026-09-16T10:00:00Z',
    submittedBy: 'Citizen Sentinel #7244',
    description: 'AI-detected suspected issue: unauthorized open-air transit dump accumulating rotten organics, plastic, and hospital waste. Severe odor within 1 km radius.',
    organization: 'Delhi Green Habitat & Waste Watch',
    assignedTo: 'Dr. Radhika Sen',
    priority: 'High',
    dueDate: '2026-09-21',
    notes: [
      { id: 'N-33', author: 'Dr. Radhika Sen', timestamp: '2026-09-17T11:20:00Z', text: 'Bio-medical bags flagged and separated for incinerator dispatch. MCD JCB deployed.' }
    ],
    aiObservations: 'Methane emission plume identified via infrared sensor overlay.',
    estimatedAffectedPopulation: 47000
  },
  {
    id: 'REP-2026-048',
    title: 'Chemical stench and venting from solvent reclamation plant',
    category: 'Industrial Emission',
    city: 'Ghaziabad',
    location: 'Kavi Nagar Industrial Area, Sector 17',
    coordinates: [28.6720, 77.4580],
    severity: 'High',
    confidence: 0.93,
    status: 'AI Analyzed',
    verified: false,
    reportDate: '2026-09-16T22:10:00Z',
    submittedBy: 'Citizen Sentinel #4298',
    description: 'AI-detected suspected issue: solvent recycling factory venting toluene and xylene fumes during late-night shift without vapor recovery unit.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: null,
    priority: 'High',
    dueDate: null,
    notes: [],
    aiObservations: 'Ambient VOC monitoring node registered peak reading of 680 ppb.',
    estimatedAffectedPopulation: 24000
  },
  {
    id: 'REP-2026-049',
    title: 'Choked storm sewer causing street inundation with stagnant black water',
    category: 'Sewage/Drainage',
    city: 'Delhi',
    location: 'Okhla Industrial Area Phase I, Main Avenue',
    coordinates: [28.5315, 77.2725],
    severity: 'Medium',
    confidence: 0.86,
    status: 'Reported',
    verified: false,
    reportDate: '2026-09-17T08:30:00Z',
    submittedBy: 'Citizen Sentinel #1938',
    description: 'AI-detected suspected issue: heavy plastic sludge and packaging waste blocking stormwater intake, producing 30cm stagnant fetid pool.',
    organization: null,
    assignedTo: null,
    priority: 'Medium',
    dueDate: null,
    notes: [],
    aiObservations: 'Vehicle traffic velocity reduction of 72% caused by street waterlogging.',
    estimatedAffectedPopulation: 19500
  },
  {
    id: 'REP-2026-050',
    title: 'Nighttime open garbage burning along expressway embankment',
    category: 'Waste Burning',
    city: 'Noida',
    location: 'Noida-Greater Noida Expressway, Near Sector 137 Underpass',
    coordinates: [28.5090, 77.4045],
    severity: 'Medium',
    confidence: 0.89,
    status: 'Verified',
    verified: true,
    reportDate: '2026-09-17T21:40:00Z',
    submittedBy: 'Citizen Sentinel #6520',
    description: 'AI-detected suspected issue: dry grass and plastic packaging debris lit along highway embankment. Acrid smoke blinding expressway drivers.',
    organization: 'NCR Clean Air & Climate Alliance',
    assignedTo: 'Karan Malhotra',
    priority: 'Medium',
    dueDate: '2026-09-22',
    notes: [
      { id: 'N-34', author: 'Karan Malhotra', timestamp: '2026-09-18T01:10:00Z', text: 'Expressway patrol fire unit put out the flames. Surveillance camera review underway.' }
    ],
    aiObservations: 'Nighttime satellite infrared sensor confirmed active thermal fire front.',
    estimatedAffectedPopulation: 31000
  }
];

// ============================================================================
// SUPABASE CLIENT & RUNTIME DATA ACCESS LAYER
// ============================================================================

const SUPABASE_CDN_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.48.1/dist/umd/supabase.min.js';

let _supabaseClientPromise = null;
let _supabaseClient = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return resolve();
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true' || existing.readyState === 'loaded' || existing.readyState === 'complete') {
        return resolve();
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = (e) => reject(e);
    (document.head || document.documentElement || document.body).appendChild(script);
  });
}

function loadConfigScript() {
  return new Promise((resolve) => {
    const existing = (typeof window !== 'undefined' && (window.EARTHFORWARD_CONFIG || window.EARTH_FORWARD_CONFIG));
    if (existing) {
      return resolve(existing);
    }
    if (typeof document === 'undefined') {
      return resolve(null);
    }
    let configUrl = 'js/config.js';
    try {
      if (typeof _dataScriptSrc !== 'undefined' && _dataScriptSrc) {
        configUrl = new URL('config.js', _dataScriptSrc).href;
      }
    } catch (e) {
      configUrl = 'js/config.js';
    }

    loadScript(configUrl)
      .then(() => {
        resolve((typeof window !== 'undefined' && (window.EARTHFORWARD_CONFIG || window.EARTH_FORWARD_CONFIG)) ? (window.EARTHFORWARD_CONFIG || window.EARTH_FORWARD_CONFIG) : null);
      })
      .catch(() => resolve(null));
  });
}

async function getSupabase() {
  if (_supabaseClient) return _supabaseClient;
  if (!_supabaseClientPromise) {
    _supabaseClientPromise = (async () => {
      const cfg = await loadConfigScript();
      if (!cfg || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase credentials in js/config.js');
      }

      if (typeof window !== 'undefined' && !window.supabase) {
        await loadScript(SUPABASE_CDN_URL);
      }

      if (typeof window === 'undefined' || !window.supabase || !window.supabase.createClient) {
        throw new Error('Supabase client failed to load from CDN');
      }

      // Security requirement: The browser must strictly use ONLY the Supabase anon/publishable key.
      _supabaseClient = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      return _supabaseClient;
    })();
  }
  return _supabaseClientPromise;
}

// ----------------------------------------------------------------------------
// SUPABASE AUTH & ORGANIZATION DATA LAYER
// ----------------------------------------------------------------------------

let _currentOrganization = null;

async function getOrganizationForUser(userId, userMetadata = {}) {
  if (!userId) return null;

  try {
    const client = await getSupabase();
    // Query public.organizations where user_id = user.id
    const { data, error } = await client
      .from('organizations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      _currentOrganization = data;
      return data;
    }
  } catch (e) {
    console.warn('[EarthData] Error fetching organization for user_id:', e);
  }

  // Graceful fallback to registration user metadata (set during organization registration)
  if (userMetadata) {
    const orgName = userMetadata.organization_name || userMetadata.org_name || userMetadata.full_name || userMetadata.name;
    if (orgName) {
      _currentOrganization = {
        id: 'ORG-' + userId.substring(0, 8).toUpperCase(),
        name: orgName,
        email: userMetadata.email || '',
        lead: userMetadata.full_name || '',
        memberCount: userMetadata.member_count || userMetadata.memberCount || 1,
        account_type: userMetadata.account_type || 'organization',
        is_metadata_fallback: true
      };
      return _currentOrganization;
    }
  }

  _currentOrganization = null;
  return null;
}

async function signIn(email, password) {
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return { data: null, error: new Error('Invalid email or password.') };
  }

  try {
    const client = await getSupabase();
    const cleanEmail = email.trim().toLowerCase();

    // Authenticate exclusively via Supabase Auth
    const { data, error } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (error || !data || !data.user) {
      return {
        data: null,
        error: error || new Error('Authentication failed.')
      };
    }

    // Retrieve authenticated user
    const { data: userData } = await client.auth.getUser();
    const activeUser = userData?.user || data.user;

    // Retrieve organization linked through user_id = user.id
    const organization = await getOrganizationForUser(activeUser.id, activeUser.user_metadata);

    return {
      data: {
        session: data.session,
        user: activeUser,
        organization: organization
      },
      error: null
    };
  } catch (err) {
    console.error('[EarthData] signIn exception:', err);
    return {
      data: null,
      error: err
    };
  }
}

async function signOut() {
  try {
    const client = await getSupabase();
    _currentOrganization = null;
    const { error } = await client.auth.signOut();
    return { error: error || null };
  } catch (err) {
    console.error('[EarthData] signOut exception:', err);
    return { error: err };
  }
}

async function getSession() {
  try {
    const client = await getSupabase();
    const { data: { session }, error } = await client.auth.getSession();

    if (error || !session || !session.user) {
      _currentOrganization = null;
      return {
        session: null,
        user: null,
        organization: null,
        data: { session: null, user: null, organization: null },
        error: null
      };
    }

    let organization = _currentOrganization;
    if (!organization) {
      organization = await getOrganizationForUser(session.user.id, session.user.user_metadata);
    }

    return {
      session,
      user: session.user,
      organization,
      data: {
        session,
        user: session.user,
        organization
      },
      error: null
    };
  } catch (err) {
    console.warn('[EarthData] getSession error:', err);
    return {
      session: null,
      user: null,
      organization: null,
      data: { session: null, user: null, organization: null },
      error: err
    };
  }
}

async function requireSession() {
  const result = await getSession();
  return result.session;
}

function onAuthStateChange(callback) {
  let subscription = null;

  getSupabase().then((client) => {
    const { data } = client.auth.onAuthStateChange(async (event, session) => {
      let organization = null;
      if (session && session.user) {
        organization = await getOrganizationForUser(session.user.id, session.user.user_metadata);
      } else {
        _currentOrganization = null;
      }
      if (typeof callback === 'function') {
        callback(event, session, organization);
      }
    });
    subscription = data?.subscription;
  }).catch((err) => {
    console.warn('[EarthData] onAuthStateChange registration failed:', err);
  });

  return {
    unsubscribe() {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    }
  };
}

function getCurrentOrganization() {
  return _currentOrganization;
}

// Deprecated stubs preserved only for backwards safety (no-op, no bypass)
function getLocalSession() {
  return null;
}

function setLocalSession() {}

function clearLocalSession() {}



// ----------------------------------------------------------------------------
// IMAGE NORMALIZATION & SNIFFING
// ----------------------------------------------------------------------------

function sniffMimeType(bytes) {
  if (!bytes || bytes.length < 4) return null;
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'image/png';
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return 'image/jpeg';
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return 'image/webp';
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'image/gif';
  return null;
}

function warnIfLocalhostImageUrl(url) {
  if (!url || typeof url !== 'string') return;
  try {
    const parsed = new URL(url, 'http://dummy.base');
    const host = (parsed.hostname || '').toLowerCase();
    const port = parsed.port;
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      ['5533', '5500', '5173', '3000', '4173', '8000', '8080'].includes(port)
    ) {
      console.warn(`[EarthData] Resolved image URL references local/dev host: ${url}`);
    }
  } catch (e) {
    if (/localhost|127\.0\.0\.1|192\.168|:(5533|5500|5173|3000|4173|8000|8080)/i.test(url)) {
      console.warn(`[EarthData] Resolved image URL references local/dev host: ${url}`);
    }
  }
}

function normalizeImage(val, mimeType = null) {
  if (!val) return null;

  if (typeof val !== 'string') {
    if (val instanceof Uint8Array || Array.isArray(val)) {
      const bytes = val instanceof Uint8Array ? val : new Uint8Array(val);
      const mime = mimeType || sniffMimeType(bytes) || 'image/png';
      const blob = new Blob([bytes], { type: mime });
      return URL.createObjectURL(blob);
    }
    return null;
  }

  const str = val.trim();
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:image/')) {
    if (str.startsWith('http://') || str.startsWith('https://')) {
      warnIfLocalhostImageUrl(str);
    }
    return str;
  }

  // PostgreSQL bytea hex representation: \x89504e... or 0x89504e...
  if (str.startsWith('\\x') || str.startsWith('0x')) {
    const hex = str.slice(2);
    if (hex.length % 2 === 0) {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
      }
      const mime = mimeType || sniffMimeType(bytes) || 'image/png';
      const blob = new Blob([bytes], { type: mime });
      return URL.createObjectURL(blob);
    }
  }

  // Raw base64 string without data: header
  if (/^[A-Za-z0-9+/=]+$/.test(str) && str.length > 50) {
    const mime = mimeType || 'image/png';
    return `data:${mime};base64,${str}`;
  }

  return null;
}

// ----------------------------------------------------------------------------
// DATA MAPPERS & UTILITIES
// ----------------------------------------------------------------------------

function isUuid(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function uiStatusToDbStatus(uiStatus) {
  const map = {
    'Reported': 'reported',
    'AI Analyzed': 'ai_analyzed',
    'Under Review': 'under_review',
    'Verified': 'verified',
    'Action Initiated': 'action_initiated',
    'Resolved': 'resolved',
    'Rejected': 'rejected'
  };
  return map[uiStatus] || (typeof uiStatus === 'string' ? uiStatus.toLowerCase().replace(/[\s-]+/g, '_') : 'reported');
}

function mapStatus(raw) {
  if (typeof raw !== 'string') return 'Reported';
  const norm = raw.toLowerCase().replace(/[_-]+/g, ' ').trim();
  const valid = {
    'reported': 'Reported',
    'ai analyzed': 'AI Analyzed',
    'under review': 'Under Review',
    'verified': 'Verified',
    'action initiated': 'Action Initiated',
    'resolved': 'Resolved',
    'rejected': 'Rejected'
  };
  return valid[norm] || 'Reported';
}

function mapCategory(raw) {
  if (!raw || typeof raw !== 'string') return 'Other';
  const norm = raw.trim().toLowerCase();
  if (norm === 'garbage') return 'Garbage Dumping';
  if (norm === 'burning') return 'Waste Burning';
  if (norm === 'water_pollution') return 'Water Pollution';
  if (norm === 'deforestation') return 'Deforestation';
  if (norm === 'other') return 'Other';
  return raw
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')
    .join(' ') || 'Other';
}

function mapSeverity(raw) {
  if (typeof raw === 'string') {
    const norm = raw.trim().toLowerCase();
    if (norm === 'high') return 'High';
    if (norm === 'medium') return 'Medium';
    if (norm === 'low') return 'Low';
  }
  // NO DEFAULTS: missing/null severity is strictly "Unassessed"
  return 'Unassessed';
}

function mapTitle(rawDesc, category) {
  if (typeof rawDesc === 'string') {
    const trimmed = rawDesc.trim();
    if (trimmed.length > 0 && trimmed.toLowerCase() !== 'none') {
      const match = trimmed.match(/^.*?[.!?](?:\s|$)/);
      let sentence = match ? match[0].trim() : trimmed;
      if (sentence.length > 80) {
        sentence = sentence.substring(0, 80).trim();
      }
      return sentence;
    }
  }
  return `${category} report`;
}

function mapCity(address, lat, lng) {
  if (typeof address === 'string' && address.trim().length > 0) {
    const addrLower = address.toLowerCase();
    if (addrLower.includes('greater noida')) return 'Greater Noida';
    if (addrLower.includes('delhi')) return 'Delhi';
    if (addrLower.includes('noida')) return 'Noida';
    if (addrLower.includes('ghaziabad')) return 'Ghaziabad';
  }
  const referenceCities = [
    { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Noida', lat: 28.5355, lng: 77.3910 },
    { name: 'Greater Noida', lat: 28.4744, lng: 77.5040 },
    { name: 'Ghaziabad', lat: 28.6692, lng: 77.4538 }
  ];
  let minDistance = Infinity;
  let nearestCity = null;
  for (const ref of referenceCities) {
    const d = Math.hypot(lat - ref.lat, lng - ref.lng);
    if (d < minDistance) {
      minDistance = d;
      nearestCity = ref.name;
    }
  }
  if (minDistance <= 0.6 && nearestCity) {
    return nearestCity;
  }
  return 'Other';
}

function generateDefaultTimeline(report) {
  const baseTime = new Date(report.reportDate).getTime();
  const timeline = [
    {
      status: 'Reported',
      timestamp: new Date(baseTime).toISOString(),
      note: 'Citizen observation ingested and queued for AI analysis.'
    }
  ];

  const currentStatus = report.status;
  const statusRanks = {
    'Reported': 1,
    'AI Analyzed': 2,
    'Under Review': 3,
    'Verified': 4,
    'Action Initiated': 5,
    'Resolved': 6,
    'Rejected': 3
  };

  const rank = statusRanks[currentStatus] || 1;

  if (rank >= 2 && currentStatus !== 'Reported') {
    timeline.push({
      status: 'AI Analyzed',
      timestamp: new Date(baseTime + 1800000).toISOString(),
      note: report.confidence !== null
        ? `AI analysis classified with ${Math.round(report.confidence * 100)}% detection confidence.`
        : 'AI analysis classified anomalous pattern.'
    });
  }

  if (rank >= 3 && currentStatus !== 'Reported' && currentStatus !== 'AI Analyzed') {
    timeline.push({
      status: 'Under Review',
      timestamp: new Date(baseTime + 7200000).toISOString(),
      note: 'Field verification triage initiated.'
    });
  }

  if (rank >= 4 && currentStatus !== 'Under Review' && currentStatus !== 'Rejected') {
    timeline.push({
      status: 'Verified',
      timestamp: new Date(baseTime + 86400000).toISOString(),
      note: 'Ground verification confirmed environmental observation.'
    });
  }

  if (rank >= 5) {
    timeline.push({
      status: 'Action Initiated',
      timestamp: new Date(baseTime + 172800000).toISOString(),
      note: report.assignedTo 
        ? `Remediation dispatched to ${report.assignedTo}.`
        : 'Remediation action initiated.'
    });
  }

  if (rank === 6) {
    const resTime = report.updatedAt ? new Date(report.updatedAt).toISOString() : new Date(baseTime + 259200000).toISOString();
    timeline.push({
      status: 'Resolved',
      timestamp: resTime,
      note: 'Field cleanup completed and post-intervention inspection verified.'
    });
  }

  if (currentStatus === 'Rejected') {
    timeline.push({
      status: 'Rejected',
      timestamp: report.updatedAt ? new Date(report.updatedAt).toISOString() : new Date(baseTime + 14400000).toISOString(),
      note: 'Observation flagged as inconclusive or out of jurisdiction scope.'
    });
  }

  return timeline;
}

function mapSupabaseRow(row, imageRow = null, profileMap = null, baseUrl = '', rawNotes = [], orgMap = null) {
  if (!row || typeof row !== 'object') return null;
  if (row.latitude === null || row.latitude === undefined || row.latitude === '' ||
      row.longitude === null || row.longitude === undefined || row.longitude === '') {
    return null;
  }
  const lat = Number(row.latitude);
  const lng = Number(row.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }

  const category = mapCategory(row.category);
  const title = mapTitle(row.description, category);
  const location = (typeof row.address === 'string' && row.address.trim().length > 0)
    ? row.address.trim()
    : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  const city = mapCity(row.address, lat, lng);
  const severity = mapSeverity(row.severity);
  const priority = severity;

  let confidence = null;
  if (row.ai_confidence !== null && row.ai_confidence !== undefined && row.ai_confidence !== '') {
    const num = Number(row.ai_confidence);
    if (Number.isFinite(num)) {
      confidence = num > 1 ? num / 100 : num;
    }
  }

  const status = mapStatus(row.status);
  const verified = (status === 'Verified' || status === 'Action Initiated' || status === 'Resolved');

  let reportDate = new Date().toISOString();
  if (row.created_at) {
    try {
      const d = new Date(row.created_at);
      if (!isNaN(d.getTime())) reportDate = d.toISOString();
    } catch (e) {}
  }

  let submittedBy = 'Citizen Sentinel';
  if (row.user_id) {
    const str = String(row.user_id).trim();
    if (profileMap && profileMap.has(str)) {
      const p = profileMap.get(str);
      if (p && p.full_name) submittedBy = p.full_name;
      else submittedBy = 'Citizen Sentinel #' + str.substring(0, 4).toUpperCase();
    } else {
      submittedBy = 'Citizen Sentinel #' + str.substring(0, 4).toUpperCase();
    }
  }

  let description = 'No description provided.';
  if (typeof row.description === 'string' && row.description.trim().length > 0 && row.description.trim().toLowerCase() !== 'none') {
    description = row.description.trim();
  } else if (typeof row.ai_description === 'string' && row.ai_description.trim().length > 0) {
    description = row.ai_description.trim();
  }

  const aiObservations = (typeof row.ai_description === 'string') ? row.ai_description : '';

  // Image resolving:
  let imageUrl = null;
  if (imageRow && imageRow.storage_path) {
    const path = String(imageRow.storage_path).trim();
    if (path.startsWith('http://') || path.startsWith('https://')) {
      imageUrl = path;
    } else {
      const cleanBase = baseUrl.replace(/\/+$/, '');
      imageUrl = `${cleanBase}/storage/v1/object/public/environmental-reports/${path}`;
    }
    warnIfLocalhostImageUrl(imageUrl);
  }

  // Notes resolving:
  const notes = [];
  if (Array.isArray(rawNotes)) {
    const matched = rawNotes.filter(n => String(n.report_id) === String(row.id));
    matched.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    for (const n of matched) {
      let authorName = 'Team member';
      if (n.author_id && profileMap && profileMap.has(String(n.author_id))) {
        const prof = profileMap.get(String(n.author_id));
        if (prof && prof.full_name) authorName = prof.full_name;
      }
      notes.push({
        id: String(n.id || 'N-' + Date.now()),
        author: authorName,
        timestamp: n.created_at || new Date().toISOString(),
        text: n.note || ''
      });
    }
  }

  let assignedTeamName = '';
  let assignedTeamCode = '—';
  const orgId = row.organization_id || row.assigned_organization_id;
  if (orgId && orgMap && orgMap.has(String(orgId))) {
    const org = orgMap.get(String(orgId));
    if (org) {
      assignedTeamName = org.name || '';
      assignedTeamCode = org.team_code || org.teamCode || '—';
    }
  } else if (row.organisation_name) {
    assignedTeamName = row.organisation_name;
  }
  const isAssigned = (orgId !== null && orgId !== undefined && orgId !== '') || Boolean(row.organisation_name);

  const reportObj = {
    id: String(row.id),
    title,
    category,
    city,
    location,
    coordinates: [lat, lng],
    severity,
    priority,
    confidence,
    status,
    verified,
    reportDate,
    createdAt: row.created_at || reportDate,
    updatedAt: row.updated_at || reportDate,
    submittedBy,
    description,
    organization: assignedTeamName,
    assignedTo: assignedTeamName,
    assignedWorkerId: row.assigned_worker_id || null,
    organizationId: orgId ? String(orgId) : null,
    assignedOrganizationId: orgId ? String(orgId) : null,
    isAssigned,
    assignedTeamName,
    assignedTeamCode,
    assignedPriority: row.assigned_priority || '',
    dueDate: row.due_date || '',
    assignedAt: row.assigned_at || null,
    imageUrl,
    notes,
    aiCategory: row.ai_category || null,
    aiConfidence: confidence,
    aiDescription: row.ai_description || null,
    aiObservations,
    estimatedAffectedPopulation: 0
  };

  reportObj.statusHistory = generateDefaultTimeline(reportObj);
  return reportObj;
}

// ----------------------------------------------------------------------------
// CORE EARTHDATA API METHODS (Exclusively Supabase)
// ----------------------------------------------------------------------------

async function getReports(filters = {}) {
  const client = await getSupabase();
  const cfg = await loadConfigScript();
  const baseUrl = (cfg && cfg.SUPABASE_URL) ? cfg.SUPABASE_URL.replace(/\/+$/, '') : '';

  const [repRes, imgRes, profRes, orgRes] = await Promise.all([
    client.from('reports').select('*').order('created_at', { ascending: false }),
    client.from('report_images').select('*'),
    client.from('profiles').select('*'),
    client.from('organizations').select('*')
  ]);

  if (repRes.error) {
    console.error('[EarthData] Error querying reports from Supabase:', repRes.error);
    const err = new Error('Unable to load reports. Please try again.');
    err.supabaseError = repRes.error;
    throw err;
  }

  const rawReports = repRes.data || [];
  const rawImages = imgRes.data || [];
  const rawProfiles = profRes.data || [];
  const rawOrgs = orgRes.data || [];

  const profileMap = new Map(rawProfiles.map(p => [String(p.id), p]));
  const orgMap = new Map(rawOrgs.map(o => [String(o.id), o]));
  const imageMap = new Map();
  for (const img of rawImages) {
    if (img.report_id && !imageMap.has(String(img.report_id))) {
      imageMap.set(String(img.report_id), img);
    }
  }

  let data = [];
  for (const row of rawReports) {
    const report = mapSupabaseRow(row, imageMap.get(String(row.id)), profileMap, baseUrl, [], orgMap);
    if (report) data.push(report);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    data = data.filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.city && r.city.toLowerCase().includes(q)) ||
      (r.assignedTeamName && r.assignedTeamName.toLowerCase().includes(q)) ||
      (r.assignedTeamCode && r.assignedTeamCode.toLowerCase().includes(q))
    );
  }

  if (filters.category && filters.category !== 'all') {
    data = data.filter(r => r.category.toLowerCase() === filters.category.toLowerCase());
  }

  if (filters.severity && filters.severity !== 'all') {
    data = data.filter(r => r.severity.toLowerCase() === filters.severity.toLowerCase());
  }

  if (filters.status && filters.status !== 'all') {
    data = data.filter(r => r.status.toLowerCase() === filters.status.toLowerCase());
  }

  if (filters.city && filters.city !== 'all') {
    data = data.filter(r => r.city.toLowerCase() === filters.city.toLowerCase());
  }

  if (filters.verified !== undefined && filters.verified !== 'all') {
    const isVer = filters.verified === true || filters.verified === 'true';
    data = data.filter(r => r.verified === isVer);
  }

  if (filters.dateFrom) {
    const fromTime = new Date(filters.dateFrom).getTime();
    data = data.filter(r => new Date(r.reportDate).getTime() >= fromTime);
  }

  if (filters.dateTo) {
    const toTime = new Date(filters.dateTo).getTime();
    data = data.filter(r => new Date(r.reportDate).getTime() <= toTime);
  }

  const sortBy = filters.sortBy || 'date_desc';
  data.sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.reportDate) - new Date(a.reportDate);
    if (sortBy === 'date_asc') return new Date(a.reportDate) - new Date(b.reportDate);
    if (sortBy === 'confidence_desc') return (b.confidence || 0) - (a.confidence || 0);
    if (sortBy === 'severity_desc') {
      const rank = { High: 3, Medium: 2, Low: 1, Unassessed: 0 };
      return (rank[b.severity] || 0) - (rank[a.severity] || 0);
    }
    return 0;
  });

  const result = data;
  result.totalCount = result.length;
  result.reports = result;
  return result;
}

async function getReportById(id) {
  const client = await getSupabase();
  const cfg = await loadConfigScript();
  const baseUrl = (cfg && cfg.SUPABASE_URL) ? cfg.SUPABASE_URL.replace(/\/+$/, '') : '';

  const [repRes, imgRes, notesRes, profRes, orgRes] = await Promise.all([
    client.from('reports').select('*').eq('id', id).maybeSingle(),
    client.from('report_images').select('*').eq('report_id', id),
    client.from('report_notes').select('*').eq('report_id', id).order('created_at', { ascending: false }),
    client.from('profiles').select('*'),
    client.from('organizations').select('*')
  ]);

  if (repRes.error) {
    console.error('[EarthData] Error fetching report by id:', repRes.error);
    throw new Error('Unable to load report. Please try again.');
  }
  if (!repRes.data) return null;

  const rawImages = imgRes.data || [];
  const rawNotes = notesRes.data || [];
  const rawProfiles = profRes.data || [];
  const rawOrgs = orgRes.data || [];
  const profileMap = new Map(rawProfiles.map(p => [String(p.id), p]));
  const orgMap = new Map(rawOrgs.map(o => [String(o.id), o]));

  const firstImg = rawImages.length > 0 ? rawImages[0] : null;
  return mapSupabaseRow(repRes.data, firstImg, profileMap, baseUrl, rawNotes, orgMap);
}

async function updateReportStatus(id, status) {
  const client = await getSupabase();
  const dbStatus = uiStatusToDbStatus(status);
  const updatedAt = new Date().toISOString();

  const { data, error } = await client
    .from('reports')
    .update({
      status: dbStatus,
      updated_at: updatedAt
    })
    .eq('id', id)
    .select();

  if (error || !data || data.length === 0) {
    const errorMsg = error ? (error.message || error.details || JSON.stringify(error)) : "Database permission denied. The current Supabase policy requires an authenticated database user or service key in js/config.js.";
    console.warn('[EarthData] updateReportStatus blocked by Supabase RLS:', error || '0 rows updated');
    throw new Error(errorMsg);
  }

  return await getReportById(id);
}

async function addReportNote(id, noteText) {
  const client = await getSupabase();
  const insertBody = {
    report_id: id,
    note: noteText
  };

  try {
    const { data: authData } = await client.auth.getSession();
    if (authData && authData.session && authData.session.user) {
      insertBody.author_id = authData.session.user.id;
    }
  } catch (e) {}

  const { data, error } = await client
    .from('report_notes')
    .insert(insertBody)
    .select();

  if (error || !data || data.length === 0) {
    const errorMsg = error ? (error.message || error.details || JSON.stringify(error)) : "Database permission denied. The current Supabase policy requires an authenticated database user or service key in js/config.js.";
    console.warn('[EarthData] addReportNote blocked by Supabase RLS:', error || '0 rows inserted');
    throw new Error(errorMsg);
  }

  return await getReportById(id);
}

async function assignReport(id, workerId, priority, dueDate, orgId) {
  const client = await getSupabase();
  const patchBody = {
    updated_at: new Date().toISOString()
  };
  if (workerId && isUuid(workerId)) {
    patchBody.assigned_worker_id = workerId;
  }
  if (orgId && isUuid(orgId)) {
    patchBody.organization_id = orgId;
  }

  const { data, error } = await client
    .from('reports')
    .update(patchBody)
    .eq('id', id)
    .select();

  if (error || !data || data.length === 0) {
    const errorMsg = error ? (error.message || error.details || JSON.stringify(error)) : "Database permission denied. The current Supabase policy requires an authenticated database user or service key in js/config.js.";
    console.warn('[EarthData] assignReport blocked by Supabase RLS:', error || '0 rows updated');
    throw new Error(errorMsg);
  }

  return await getReportById(id);
}

function isMissingColumnError(error) {
  if (!error) return false;
  if (error.code === '42703' || error.code === 'PGRST204') return true;
  const msg = (error.message || error.details || JSON.stringify(error)).toLowerCase();
  return (msg.includes('column') || msg.includes('relation')) &&
         (msg.includes('does not exist') || msg.includes('could not find') || msg.includes('not found') || msg.includes('schema cache'));
}

function showContractToast(message) {
  if (typeof document === 'undefined') return;
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
    <i data-lucide="alert-triangle" style="width:16px; height:16px; color:#b91c1c; flex-shrink:0;"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ root: toast });
  }
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

async function assignReportToTeam(reportId, teamId, priority, dueDate) {
  const client = await getSupabase();

  if (!reportId) throw new Error('Report ID is required.');
  if (!teamId) throw new Error('Please select a team.');

  // Validate team exists
  console.log('teamId type/value:', typeof teamId, teamId);
  const { data: teamData, error: teamErr } = await client
    .from('organizations')
    .select('id, name')
    .eq('id', teamId)
    .maybeSingle();

  if (teamErr) {
    console.warn('[EarthData] assignReportToTeam team lookup error:', teamErr);
    throw new Error(teamErr.message || 'Could not verify selected team.');
  }
  if (!teamData) {
    throw new Error('Selected team does not exist.');
  }

  if (!['High', 'Medium', 'Low'].includes(priority)) {
    throw new Error('Priority must be High, Medium, or Low.');
  }

  if (!dueDate) throw new Error('Target due date is required.');
  const dueDateTime = new Date(dueDate + 'T23:59:59').getTime();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (isNaN(dueDateTime) || dueDateTime < todayStart.getTime()) {
    throw new Error('Target due date cannot be in the past.');
  }

  const updateBody = {
    organization_id: teamId,
    assigned_organization_id: teamId,
    organisation_name: teamData.name,
    assigned_priority: priority,
    due_date: dueDate,
    assigned_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  let { data, error } = await client
    .from('reports')
    .update(updateBody)
    .eq('id', reportId)
    .select();

  if (error && isMissingColumnError(error)) {
    console.warn('[EarthData] reports table missing extra columns, falling back to core assignment fields:', error);
    const fallbackUpdate = {
      organization_id: teamId,
      assigned_organization_id: teamId,
      organisation_name: teamData.name,
      updated_at: new Date().toISOString()
    };
    const res = await client
      .from('reports')
      .update(fallbackUpdate)
      .eq('id', reportId)
      .select();
    data = res.data;
    error = res.error;
  }

  if (error || !data || data.length === 0) {
    console.warn('[EarthData] assignReportToTeam error:', error || '0 rows updated');
    throw new Error(error ? (error.message || error.details || 'Failed to update report.') : 'Report could not be assigned.');
  }

  return await getReportById(reportId);
}

async function getAnalytics() {
  const reports = await getReports();
  const total = reports.length;

  const statusCounts = {
    'Reported': 0,
    'AI Analyzed': 0,
    'Under Review': 0,
    'Verified': 0,
    'Action Initiated': 0,
    'Resolved': 0,
    'Rejected': 0
  };

  const severityCounts = { High: 0, Medium: 0, Low: 0, Unassessed: 0 };
  const categoryCounts = {};
  const cityCounts = {};
  let totalConfidence = 0;
  let confidenceCount = 0;
  let verifiedCount = 0;
  let resolvedCount = 0;
  let actionInitiatedCount = 0;
  let totalResolutionTimeMs = 0;
  let resolvedWithTimesCount = 0;

  reports.forEach(r => {
    if (statusCounts[r.status] !== undefined) statusCounts[r.status]++;
    if (r.verified) verifiedCount++;
    if (r.status === 'Resolved') resolvedCount++;
    if (r.status === 'Action Initiated') actionInitiatedCount++;

    if (severityCounts[r.severity] !== undefined) {
      severityCounts[r.severity]++;
    } else {
      severityCounts.Unassessed = (severityCounts.Unassessed || 0) + 1;
    }

    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;

    if (r.confidence !== null && r.confidence !== undefined) {
      totalConfidence += r.confidence;
      confidenceCount++;
    }

    if (r.status === 'Resolved' && r.createdAt && r.updatedAt) {
      const start = new Date(r.createdAt).getTime();
      const end = new Date(r.updatedAt).getTime();
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        totalResolutionTimeMs += (end - start);
        resolvedWithTimesCount++;
      }
    }
  });

  const verificationRate = total > 0 ? Math.round((verifiedCount / total) * 100) : 0;
  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;
  const actionRate = total > 0 ? Math.round(((resolvedCount + actionInitiatedCount) / total) * 100) : 0;
  const avgConfidence = confidenceCount > 0 ? (totalConfidence / confidenceCount).toFixed(2) : '—';
  const avgResolutionDays = resolvedWithTimesCount > 0
    ? (totalResolutionTimeMs / (resolvedWithTimesCount * 24 * 60 * 60 * 1000)).toFixed(1)
    : 'Not available';

  return {
    totalReports: total,
    verifiedCount,
    verificationRate,
    resolvedCount,
    resolutionRate,
    actionInitiatedCount,
    actionRate,
    underReviewCount: statusCounts['Under Review'] + statusCounts['AI Analyzed'] + statusCounts['Reported'],
    avgConfidence,
    statusCounts,
    severityCounts,
    categoryCounts,
    cityCounts,
    avgResolutionDays
  };
}

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const MIN_REPORTS_PER_HOTSPOT = 2;

function shortCentroidHash(lat, lng) {
  const rLat = Math.round(lat * 100);
  const rLng = Math.round(lng * 100);
  let hash = 0;
  const str = `${rLat},${rLng}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(4, '0').slice(0, 6);
}

function buildHotspotObject(meta, nearbyReports) {
  let riskLevel = 'Unassessed';
  if (nearbyReports.some(r => r.severity === 'High')) {
    riskLevel = 'High';
  } else if (nearbyReports.some(r => r.severity === 'Medium')) {
    riskLevel = 'Medium';
  } else if (nearbyReports.some(r => r.severity === 'Low')) {
    riskLevel = 'Low';
  }

  const catTally = {};
  nearbyReports.forEach(r => {
    catTally[r.category] = (catTally[r.category] || 0) + 1;
  });
  let primaryCategory = 'General';
  let maxCatCount = 0;
  for (const [cat, count] of Object.entries(catTally)) {
    if (count > maxCatCount) {
      maxCatCount = count;
      primaryCategory = cat;
    }
  }

  let bestAiDesc = '';
  let maxConf = -1;
  for (const r of nearbyReports) {
    if (r.aiDescription && (r.confidence || 0) > maxConf) {
      maxConf = r.confidence || 0;
      bestAiDesc = r.aiDescription;
    }
  }

  const statusTally = {};
  nearbyReports.forEach(r => {
    statusTally[r.status] = (statusTally[r.status] || 0) + 1;
  });
  const statusSummaryParts = Object.entries(statusTally).map(([st, cnt]) => `${cnt} ${st}`);
  const interventionStatus = statusSummaryParts.length > 0 ? statusSummaryParts.join(', ') : 'No action recorded';

  const dates = nearbyReports.map(r => new Date(r.reportDate).getTime()).filter(t => !isNaN(t));
  const firstReportDate = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : null;
  const latestReportDate = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null;

  const activeInterventionCount = nearbyReports.filter(r =>
    r.status === 'Under Review' ||
    r.status === 'Action Initiated' ||
    r.isAssigned ||
    (r.organizationId !== null && r.organizationId !== undefined && r.organizationId !== '')
  ).length;

  return {
    ...meta,
    riskLevel,
    primaryCategory,
    aiRiskAssessment: bestAiDesc || 'Geospatial convergence of citizen incident observations.',
    interventionStatus,
    reportCount: nearbyReports.length,
    highPriorityCount: nearbyReports.filter(r => r.severity === 'High').length,
    categoryBreakdown: catTally,
    firstReportDate,
    latestReportDate,
    activeReports: nearbyReports.filter(r => r.status !== 'Resolved').length,
    resolvedReports: nearbyReports.filter(r => r.status === 'Resolved').length,
    activeInterventionCount,
    reportsList: nearbyReports.map(r => ({
      id: r.id,
      title: r.title,
      severity: r.severity,
      status: r.status,
      category: r.category,
      location: r.location,
      reportDate: r.reportDate,
      confidence: r.confidence
    }))
  };
}

async function getHotspots() {
  const allReports = await getReports();
  // Exclude rejected reports
  const reports = allReports.filter(r => r.status !== 'Rejected' && r.coordinates && r.coordinates.length >= 2);

  const geographicZones = [
    {
      id: 'HOT-01',
      name: 'Sahibabad & Karhera Industrial Corridor',
      city: 'Ghaziabad',
      coordinates: [28.6758, 77.3828],
      radiusMeters: 2800
    },
    {
      id: 'HOT-02',
      name: 'Ghazipur Landfill & Anand Vihar Border Basin',
      city: 'Delhi',
      coordinates: [28.6360, 77.3220],
      radiusMeters: 3200
    },
    {
      id: 'HOT-03',
      name: 'Sector 62-63 Noida Commercial & Light Industrial Belt',
      city: 'Noida',
      coordinates: [28.6265, 77.3710],
      radiusMeters: 2200
    },
    {
      id: 'HOT-04',
      name: 'Surajpur Wetland & Ecotech Buffer Environs',
      city: 'Greater Noida',
      coordinates: [28.5280, 77.4945],
      radiusMeters: 2500
    },
    {
      id: 'HOT-05',
      name: 'Yamuna Khadar & Okhla Inundation Plains',
      city: 'Delhi / Noida Border',
      coordinates: [28.5300, 77.3100],
      radiusMeters: 3500
    },
    {
      id: 'HOT-06',
      name: 'Loni Industrial & Scrap Salvage Fringe',
      city: 'Ghaziabad',
      coordinates: [28.7480, 77.2890],
      radiusMeters: 2400
    },
    {
      id: 'HOT-07',
      name: 'Wazirpur & Jahangirpuri Industrial Pocket',
      city: 'Delhi',
      coordinates: [28.7130, 77.1680],
      radiusMeters: 2600
    },
    {
      id: 'HOT-08',
      name: 'Greater Noida Alpha-Pari Chowk Junction',
      city: 'Greater Noida',
      coordinates: [28.4730, 77.5115],
      radiusMeters: 2000
    }
  ];

  const assignedReportIds = new Set();
  const zoneReportMap = new Map();
  geographicZones.forEach(z => zoneReportMap.set(z.id, []));

  // Assign each report to nearest existing named zone if within its radius
  for (const r of reports) {
    let nearestZone = null;
    let minDistance = Infinity;

    for (const zone of geographicZones) {
      const dist = getDistanceMeters(zone.coordinates[0], zone.coordinates[1], r.coordinates[0], r.coordinates[1]);
      if (dist <= (zone.radiusMeters || 2500) && dist < minDistance) {
        minDistance = dist;
        nearestZone = zone;
      }
    }

    if (nearestZone) {
      zoneReportMap.get(nearestZone.id).push(r);
      assignedReportIds.add(r.id);
    }
  }

  const activeHotspots = [];

  // Build named hotspots with at least 1 report
  for (const zone of geographicZones) {
    const nearby = zoneReportMap.get(zone.id) || [];
    if (nearby.length > 0) {
      activeHotspots.push(buildHotspotObject(zone, nearby));
    }
  }

  // Cluster remaining unassigned reports with greedy radius clustering (~2.5 km)
  const unassignedReports = reports.filter(r => !assignedReportIds.has(r.id));
  const visited = new Set();

  for (let i = 0; i < unassignedReports.length; i++) {
    const seed = unassignedReports[i];
    if (visited.has(seed.id)) continue;

    const cluster = [seed];
    visited.add(seed.id);

    for (let j = i + 1; j < unassignedReports.length; j++) {
      const candidate = unassignedReports[j];
      if (visited.has(candidate.id)) continue;

      const dist = getDistanceMeters(seed.coordinates[0], seed.coordinates[1], candidate.coordinates[0], candidate.coordinates[1]);
      if (dist <= 2500) {
        visited.add(candidate.id);
        cluster.push(candidate);
      }
    }

    if (cluster.length >= MIN_REPORTS_PER_HOTSPOT) {
      const avgLat = cluster.reduce((sum, r) => sum + r.coordinates[0], 0) / cluster.length;
      const avgLng = cluster.reduce((sum, r) => sum + r.coordinates[1], 0) / cluster.length;

      let maxDist = 0;
      cluster.forEach(r => {
        const d = getDistanceMeters(avgLat, avgLng, r.coordinates[0], r.coordinates[1]);
        if (d > maxDist) maxDist = d;
      });
      const radiusMeters = Math.max(1500, Math.round(maxDist + 300));

      // City mode
      const cityCounts = {};
      cluster.forEach(r => {
        if (r.city) cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
      });
      let clusterCity = 'NCR';
      let maxCityCount = 0;
      for (const [c, cnt] of Object.entries(cityCounts)) {
        if (cnt > maxCityCount) {
          maxCityCount = cnt;
          clusterCity = c;
        }
      }

      // Top category
      const catCounts = {};
      cluster.forEach(r => {
        if (r.category) catCounts[r.category] = (catCounts[r.category] || 0) + 1;
      });
      let topCat = 'General';
      let maxCatCnt = 0;
      for (const [cat, cnt] of Object.entries(catCounts)) {
        if (cnt > maxCatCnt) {
          maxCatCnt = cnt;
          topCat = cat;
        }
      }

      // Most common location text
      const locCounts = {};
      cluster.forEach(r => {
        if (r.location) locCounts[r.location] = (locCounts[r.location] || 0) + 1;
      });
      let topLoc = clusterCity;
      let maxLocCnt = 0;
      for (const [loc, cnt] of Object.entries(locCounts)) {
        if (cnt > maxLocCnt) {
          maxLocCnt = cnt;
          topLoc = loc;
        }
      }

      const clusterId = 'HOT-' + shortCentroidHash(avgLat, avgLng);
      const clusterName = `${clusterCity} — ${topCat} cluster near ${topLoc}`;

      activeHotspots.push(buildHotspotObject({
        id: clusterId,
        name: clusterName,
        city: clusterCity,
        coordinates: [Number(avgLat.toFixed(4)), Number(avgLng.toFixed(4))],
        radiusMeters
      }, cluster));
    }
  }

  activeHotspots.sort((a, b) => b.reportCount - a.reportCount || b.highPriorityCount - a.highPriorityCount);
  return activeHotspots;
}

// ----------------------------------------------------------------------------
// LOCAL TEAM MEMBERS & METADATA STORAGE HELPERS
// ----------------------------------------------------------------------------
const STORAGE_TEAM_MEMBERS_KEY = 'earthforward_team_members_v1';
const STORAGE_TEAM_META_KEY = 'earthforward_team_metadata_v1';

function getLocalTeamMembersMap() {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_TEAM_MEMBERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalTeamMembers(orgId, memberNames) {
  if (typeof localStorage === 'undefined' || !orgId) return;
  try {
    const map = getLocalTeamMembersMap();
    map[String(orgId)] = Array.isArray(memberNames) ? memberNames : [];
    localStorage.setItem(STORAGE_TEAM_MEMBERS_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('[EarthData] Failed to save local team members:', e);
  }
}

function getLocalTeamMetaMap() {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_TEAM_META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalTeamMeta(orgId, meta) {
  if (typeof localStorage === 'undefined' || !orgId) return;
  try {
    const map = getLocalTeamMetaMap();
    map[String(orgId)] = Object.assign({}, map[String(orgId)] || {}, meta);
    localStorage.setItem(STORAGE_TEAM_META_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('[EarthData] Failed to save local team meta:', e);
  }
}

async function getOrganizations() {
  const client = await getSupabase();
  const { data, error } = await client
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[EarthData] Error fetching organizations from Supabase:', error);
    return [];
  }

  // Fetch team members from team_members table or field_workers table
  const membersByOrg = {};
  try {
    const { data: tmData, error: tmError } = await client
      .from('team_members')
      .select('*');

    if (!tmError && Array.isArray(tmData) && tmData.length > 0) {
      tmData.forEach(row => {
        const oId = String(row.organization_id || row.organizationId || '');
        if (oId) {
          if (!membersByOrg[oId]) membersByOrg[oId] = [];
          const name = row.member_name || row.memberName || row.name;
          if (name && !membersByOrg[oId].includes(name)) {
            membersByOrg[oId].push(name);
          }
        }
      });
    } else {
      // Fallback: check field_workers
      const { data: fwData, error: fwError } = await client
        .from('field_workers')
        .select('*');

      if (!fwError && Array.isArray(fwData) && fwData.length > 0) {
        fwData.forEach(row => {
          const oId = String(row.organization_id || '');
          if (oId) {
            if (!membersByOrg[oId]) membersByOrg[oId] = [];
            if (row.name && !membersByOrg[oId].includes(row.name)) {
              membersByOrg[oId].push(row.name);
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn('[EarthData] Error querying members from database:', err);
  }

  const localMembersMap = getLocalTeamMembersMap();
  const localMetaMap = getLocalTeamMetaMap();

  return (data || []).map(row => {
    const orgId = String(row.id);
    const localMeta = localMetaMap[orgId] || {};
    const orgMembers = (membersByOrg[orgId] && membersByOrg[orgId].length > 0)
      ? membersByOrg[orgId]
      : (localMembersMap[orgId] || []);

    const teamCode = row.team_code || localMeta.team_code || ('TM-' + orgId.substring(0, 6).toUpperCase());
    const email = row.email || localMeta.email || null;
    const memberCount = (orgMembers.length > 0)
      ? orgMembers.length
      : ((row.member_count !== null && row.member_count !== undefined) ? Number(row.member_count) : 0);

    return {
      ...row,
      id: orgId,
      team_code: teamCode,
      teamCode: teamCode,
      name: row.name || '—',
      email: email,
      member_count: memberCount,
      memberCount: memberCount,
      members: orgMembers,
      created_at: row.created_at || null
    };
  });
}

async function createOrganization({ name, email, memberCount, members = [] }) {
  const client = await getSupabase();

  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    throw new Error('Team name must be between 2 and 80 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(String(email).trim())) {
    throw new Error('Please enter a valid email address.');
  }

  // Normalize member names list
  let memberNames = [];
  if (Array.isArray(members)) {
    memberNames = members.map(m => String(m || '').trim()).filter(Boolean);
  }

  let count = memberNames.length > 0 ? memberNames.length : parseInt(memberCount, 10);
  if (isNaN(count) || count < 1 || count > 10000) {
    throw new Error('Member count must be a whole number between 1 and 10,000.');
  }

  // Attempt insert into organizations table
  const insertBody = {
    name: name.trim(),
    email: email.trim(),
    member_count: count
  };

  let row = null;
  const { data, error } = await client
    .from('organizations')
    .insert(insertBody)
    .select()
    .single();

  if (error) {
    if (error.code === '23505' || (error.message && error.message.includes('23505')) || (error.message && error.message.toLowerCase().includes('unique'))) {
      throw new Error('A team with this name already exists.');
    }
    // If columns like email or member_count don't exist in organizations table, retry with name only
    if (isMissingColumnError(error)) {
      console.warn('[EarthData] organizations table missing extra columns, falling back to name only:', error);
      const { data: fallbackData, error: fallbackError } = await client
        .from('organizations')
        .insert({ name: name.trim() })
        .select()
        .single();

      if (fallbackError) {
        if (fallbackError.code === '23505' || (fallbackError.message && fallbackError.message.includes('23505'))) {
          throw new Error('A team with this name already exists.');
        }
        throw new Error(fallbackError.message || 'Failed to create team.');
      }
      row = fallbackData || {};
    } else {
      console.warn('[EarthData] createOrganization failed:', error);
      throw new Error(error.message || 'Failed to create team.');
    }
  } else {
    row = data || {};
  }

  const createdId = String(row.id);
  const teamCode = row.team_code || ('TM-' + createdId.substring(0, 6).toUpperCase());

  // Insert individual member rows if provided
  if (memberNames.length > 0) {
    let insertedInDb = false;

    // 1. Try team_members table (id, organization_id, member_name)
    try {
      const tmRows = memberNames.map(mName => ({
        organization_id: createdId,
        member_name: mName
      }));
      const { error: tmErr } = await client
        .from('team_members')
        .insert(tmRows);

      if (!tmErr) {
        insertedInDb = true;
      } else {
        console.warn('[EarthData] team_members table insert failed, trying field_workers:', tmErr);
      }
    } catch (e) {
      console.warn('[EarthData] Error trying team_members insert:', e);
    }

    // 2. If team_members failed or does not exist, try field_workers table
    if (!insertedInDb) {
      try {
        const fwRows = memberNames.map(mName => ({
          organization_id: createdId,
          name: mName,
          status: 'active'
        }));
        const { error: fwErr } = await client
          .from('field_workers')
          .insert(fwRows);

        if (!fwErr) {
          insertedInDb = true;
        } else {
          console.warn('[EarthData] field_workers insert also failed:', fwErr);
        }
      } catch (e) {
        console.warn('[EarthData] Error trying field_workers insert:', e);
      }
    }

    // Always persist to local storage cache as well for maximum resilience
    saveLocalTeamMembers(createdId, memberNames);
  }

  saveLocalTeamMeta(createdId, {
    email: email.trim(),
    team_code: teamCode
  });

  return {
    ...row,
    id: createdId,
    team_code: teamCode,
    teamCode: teamCode,
    name: row.name || name.trim(),
    email: email.trim(),
    member_count: memberNames.length > 0 ? memberNames.length : count,
    memberCount: memberNames.length > 0 ? memberNames.length : count,
    members: memberNames,
    created_at: row.created_at || new Date().toISOString()
  };
}

function subscribeToChanges({ tables = ['reports', 'organizations'], onChange, onStatus, debounceMs = 500 } = {}) {
  let debounceTimer = null;
  let pollInterval = null;
  let isUnsubscribed = false;
  let activeChannel = null;

  function notifyChange() {
    if (isUnsubscribed) return;
    if (typeof onChange === 'function') {
      try {
        onChange();
      } catch (e) {
        console.error('[EarthData] Error in subscribeToChanges onChange handler:', e);
      }
    }
  }

  function triggerDebouncedChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      notifyChange();
    }, debounceMs);
  }

  function startPolling() {
    if (pollInterval || isUnsubscribed) return;
    if (typeof onStatus === 'function') onStatus('polling');
    pollInterval = setInterval(() => {
      notifyChange();
    }, 30000);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  function handleVisibilityChange() {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible' && !isUnsubscribed) {
      notifyChange();
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  getSupabase().then(client => {
    if (isUnsubscribed) return;

    try {
      const channelName = 'realtime-changes-' + Math.random().toString(36).slice(2, 9);
      let channel = client.channel(channelName);

      tables.forEach(table => {
        channel = channel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table: table },
          () => {
            triggerDebouncedChange();
          }
        );
      });

      channel.subscribe((status) => {
        if (isUnsubscribed) return;
        if (status === 'SUBSCRIBED') {
          stopPolling();
          if (typeof onStatus === 'function') onStatus('live');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.warn('[EarthData] Realtime channel status:', status, 'Falling back to 30s polling.');
          startPolling();
        }
      });

      activeChannel = channel;
    } catch (err) {
      console.warn('[EarthData] Realtime subscription error:', err, 'Falling back to 30s polling.');
      startPolling();
    }
  }).catch(err => {
    console.warn('[EarthData] Realtime client initialization error:', err);
    startPolling();
  });

  function unsubscribe() {
    isUnsubscribed = true;
    clearTimeout(debounceTimer);
    stopPolling();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    if (activeChannel) {
      try {
        getSupabase().then(client => client.removeChannel(activeChannel)).catch(() => {});
      } catch (e) {}
      activeChannel = null;
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', unsubscribe, { once: true });
  }

  return unsubscribe;
}

async function getFieldWorkers() {
  const client = await getSupabase();
  const { data, error } = await client.from('field_workers').select('*');
  if (error) {
    console.warn('[EarthData] Error fetching field_workers from Supabase:', error);
    return [];
  }
  return data || [];
}

function resetDemoData() {
  // Clearing local storage cache without affecting Supabase
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('earthforward_reports_v1');
      localStorage.removeItem('earthforward_report_overrides_v1');
    } catch (e) {}
  }
  return true;
}

// ----------------------------------------------------------------------------
// GLOBAL EXPOSURES
// ----------------------------------------------------------------------------

if (typeof window !== 'undefined') {
  window.getReports = getReports;
  window.getReportById = getReportById;
  window.updateReportStatus = updateReportStatus;
  window.addReportNote = addReportNote;
  window.assignReport = assignReport;
  window.assignReportToTeam = assignReportToTeam;
  window.getAnalytics = getAnalytics;
  window.getHotspots = getHotspots;
  window.getOrganizations = getOrganizations;
  window.createOrganization = createOrganization;
  window.subscribeToChanges = subscribeToChanges;
  window.getFieldWorkers = getFieldWorkers;
  window.resetDemoData = resetDemoData;
  window.normalizeImage = normalizeImage;

  window.EarthData = {
    getReports,
    getReportById,
    updateReportStatus,
    addReportNote,
    assignReport,
    assignReportToTeam,
    getAnalytics,
    getHotspots,
    getOrganizations,
    createOrganization,
    subscribeToChanges,
    getFieldWorkers,
    resetDemoData,
    normalizeImage,
    signIn,
    signOut,
    getSession,
    requireSession,
    onAuthStateChange,
    getCurrentOrganization,
    getOrganizationForUser,
    getLocalSession,
    setLocalSession,
    clearLocalSession
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getReports,
    getReportById,
    updateReportStatus,
    addReportNote,
    assignReport,
    assignReportToTeam,
    getAnalytics,
    getHotspots,
    getOrganizations,
    createOrganization,
    subscribeToChanges,
    getFieldWorkers,
    resetDemoData,
    normalizeImage,
    signIn,
    signOut,
    getSession,
    requireSession,
    onAuthStateChange,
    getCurrentOrganization,
    getOrganizationForUser,
    getLocalSession,
    setLocalSession,
    clearLocalSession
  };
}



