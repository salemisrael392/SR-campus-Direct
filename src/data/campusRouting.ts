/**
 * SR University Campus Geographic Routing & Spatial POI Engine
 * Constrained exclusively to SR University Warangal Campus
 */

export interface CampusPOI {
  id: string;
  name: string;
  shortName: string;
  code: string;
  category: 'academic' | 'lab' | 'admin' | 'dining' | 'residential' | 'sports' | 'library' | 'facility';
  categoryLabel: string;
  lat: number;
  lng: number;
  description: string;
  roomDetails?: string;
  aliases: string[];
  floorLevel?: string;
  pinColor: string;
}

export const SR_CAMPUS_BOUNDS = {
  north: 18.0470,
  south: 18.0380,
  east: 79.5850,
  west: 79.5735
};

export const SR_CAMPUS_CENTER = {
  lat: 18.04185,
  lng: 79.57880
};

export const CAMPUS_POIS: CampusPOI[] = [
  {
    id: 'poi-gate1',
    name: 'Main Campus Entrance (Gate 1)',
    shortName: 'Gate 1 Entrance',
    code: 'GATE-01',
    category: 'admin',
    categoryLabel: 'Campus Gate & Security',
    lat: 18.04092,
    lng: 79.57765,
    description: 'Main campus security checkpoint, visitor registration & electric shuttle bay.',
    aliases: ['gate', 'entrance', 'security', 'shuttle', 'main gate', 'bus stop'],
    floorLevel: 'Ground Level',
    pinColor: '#dc2626'
  },
  {
    id: 'poi-admin',
    name: 'University Administrative Center',
    shortName: 'Admin Center',
    code: 'ADMIN-01',
    category: 'admin',
    categoryLabel: 'Administration & Admissions',
    lat: 18.04120,
    lng: 79.57810,
    description: 'Admissions Office, Registrar, Student Welfare & Finance Helpdesk.',
    aliases: ['admin', 'admissions', 'registrar', 'fee office', 'finance', 'dean student affairs'],
    floorLevel: 'Ground & 1st Floor',
    pinColor: '#0284c7'
  },
  {
    id: 'poi-library',
    name: 'Central Campus Library',
    shortName: 'Central Library',
    code: 'LIB-01',
    category: 'library',
    categoryLabel: 'Academic Resource',
    lat: 18.04210,
    lng: 79.57800,
    description: '3-story digital reference archive, silent reading halls & journal repository.',
    aliases: ['library', 'books', 'reading room', 'study hall', 'digital library'],
    floorLevel: 'Levels 1 - 3',
    pinColor: '#0d9488'
  },
  {
    id: 'poi-srec-main',
    name: 'SREC Main Academic Block',
    shortName: 'SREC Main Block',
    code: 'SREC-101',
    category: 'academic',
    categoryLabel: 'Academic Core',
    lat: 18.04185,
    lng: 79.57845,
    description: 'Dean Academic office, Central Lecture Theatres (LT-1 to LT-6) & Exam Branch.',
    aliases: ['srec', 'academic block', 'lecture hall', 'exam branch', 'dean office', 'civil', 'mech'],
    floorLevel: 'Ground - Level 4',
    pinColor: '#0051d5'
  },
  {
    id: 'poi-cse-block',
    name: 'SREC Computer Science & AI Block',
    shortName: 'CSE Block (Room 204)',
    code: 'Room 204',
    category: 'lab',
    categoryLabel: 'CSE & AI Department',
    lat: 18.04235,
    lng: 79.57915,
    description: 'Computer Science Department, AI Computing Labs, Room 204 & Cloud Studio.',
    roomDetails: 'Room 204 • Level 2 East Wing',
    aliases: ['cse', 'computer science', 'ai', 'room 204', 'data science', 'cs301', 'coding lab'],
    floorLevel: 'Level 2',
    pinColor: '#4f46e5'
  },
  {
    id: 'poi-srix',
    name: 'SRiX Technology Business Incubator',
    shortName: 'SRiX Incubator Hub',
    code: 'SRIX-HUB',
    category: 'lab',
    categoryLabel: 'Research & Innovation',
    lat: 18.04310,
    lng: 79.57790,
    description: 'MakerSpace, IoT Research Labs, Rapid Prototyping Center & Startup Suites.',
    aliases: ['srix', 'incubator', 'startup', 'makerspace', 'iot', 'robotics lab'],
    floorLevel: 'Ground & 1st Floor',
    pinColor: '#059669'
  },
  {
    id: 'poi-auditorium',
    name: 'SR Central Auditorium & Seminar Complex',
    shortName: 'Central Auditorium',
    code: 'AUD-01',
    category: 'academic',
    categoryLabel: 'Events & Cultural',
    lat: 18.04150,
    lng: 79.57980,
    description: '1,200-seat university convention auditorium and open-air amphitheatre.',
    aliases: ['auditorium', 'audi', 'convention hall', 'seminar', 'amphitheatre', 'events'],
    floorLevel: 'Ground Level',
    pinColor: '#7c3aed'
  },
  {
    id: 'poi-hostels',
    name: 'Student Housing Quads & Dining Complex',
    shortName: 'Student Hostels & Mess',
    code: 'HOSTEL-SQ',
    category: 'residential',
    categoryLabel: 'Residential & Dining',
    lat: 18.04020,
    lng: 79.58020,
    description: 'Student Quads Blocks A-D, Central Dining Hall & 16,000 meal kitchen.',
    aliases: ['hostel', 'mess', 'dining', 'housing', 'dorm', 'food', 'quad'],
    floorLevel: 'Ground - Level 5',
    pinColor: '#ea580c'
  },
  {
    id: 'poi-sports',
    name: 'SR Sports Stadium & Athletic Arena',
    shortName: 'Sports Stadium',
    code: 'SPORTS-01',
    category: 'sports',
    categoryLabel: 'Athletics & Recreation',
    lat: 18.04340,
    lng: 79.58120,
    description: 'Cricket stadium, outdoor basketball, tennis courts & indoor fitness pavilion.',
    aliases: ['sports', 'ground', 'cricket', 'gym', 'basketball', 'tennis', 'stadium'],
    floorLevel: 'Outdoor Arena',
    pinColor: '#16a34a'
  },
  {
    id: 'poi-mech-labs',
    name: 'Mechanical & Civil Engineering Workshops',
    shortName: 'Engineering Workshops',
    code: 'MECH-01',
    category: 'academic',
    categoryLabel: 'Workshops & Fabrication',
    lat: 18.04280,
    lng: 79.57950,
    description: 'Heavy machinery fabrication, thermal engineering & materials testing labs.',
    aliases: ['workshop', 'mechanical', 'civil labs', 'manufacturing', 'machinery'],
    floorLevel: 'Ground Level',
    pinColor: '#475569'
  },
  {
    id: 'poi-cafe',
    name: 'Campus Food Court & Cafeteria',
    shortName: 'Campus Food Court',
    code: 'CAFE-01',
    category: 'dining',
    categoryLabel: 'Dining & Refreshments',
    lat: 18.04060,
    lng: 79.57990,
    description: 'Bakery, juice bar, multi-cuisine food stalls & outdoor cafe seating.',
    aliases: ['cafe', 'cafeteria', 'canteen', 'food court', 'coffee', 'snacks'],
    floorLevel: 'Ground Level',
    pinColor: '#d97706'
  },
  {
    id: 'poi-health',
    name: 'Campus Health Center & Infirmary',
    shortName: 'Health Center / Clinic',
    code: 'HEALTH-01',
    category: 'facility',
    categoryLabel: 'Emergency & Medical',
    lat: 18.04110,
    lng: 79.57780,
    description: '24/7 First aid medical station, physician clinic & university ambulance.',
    aliases: ['health', 'medical', 'hospital', 'clinic', 'doctor', 'first aid', 'emergency', 'ambulance'],
    floorLevel: 'Ground Level',
    pinColor: '#e11d48'
  }
];

// Graph Nodes representing arterial campus walkways and intersections
interface NavNode {
  id: string;
  lat: number;
  lng: number;
  name: string;
  neighbors: string[]; // Connected Node IDs
}

export const CAMPUS_NAV_GRAPH: Record<string, NavNode> = {
  n_gate1: {
    id: 'n_gate1',
    lat: 18.04092,
    lng: 79.57765,
    name: 'Gate 1 Entrance Plaza',
    neighbors: ['n_admin_junc', 'n_health']
  },
  n_health: {
    id: 'n_health',
    lat: 18.04110,
    lng: 79.57780,
    name: 'Health Center Junction',
    neighbors: ['n_gate1', 'n_admin_junc']
  },
  n_admin_junc: {
    id: 'n_admin_junc',
    lat: 18.04120,
    lng: 79.57810,
    name: 'Administration Quad Walkway',
    neighbors: ['n_gate1', 'n_health', 'n_central_lawn', 'n_hostel_path']
  },
  n_central_lawn: {
    id: 'n_central_lawn',
    lat: 18.04155,
    lng: 79.57830,
    name: 'Central Lawn Spine Walkway',
    neighbors: ['n_admin_junc', 'n_srec_main', 'n_audi_junc', 'n_library']
  },
  n_library: {
    id: 'n_library',
    lat: 18.04210,
    lng: 79.57800,
    name: 'Library Plaza',
    neighbors: ['n_central_lawn', 'n_srix_path']
  },
  n_srec_main: {
    id: 'n_srec_main',
    lat: 18.04185,
    lng: 79.57845,
    name: 'SREC Main Concourse',
    neighbors: ['n_central_lawn', 'n_cse_plaza', 'n_audi_junc']
  },
  n_cse_plaza: {
    id: 'n_cse_plaza',
    lat: 18.04235,
    lng: 79.57915,
    name: 'CSE & AI Department Concourse',
    neighbors: ['n_srec_main', 'n_mech_wing', 'n_srix_path']
  },
  n_mech_wing: {
    id: 'n_mech_wing',
    lat: 18.04280,
    lng: 79.57950,
    name: 'Mechanical Workshops Crossing',
    neighbors: ['n_cse_plaza', 'n_sports_path']
  },
  n_srix_path: {
    id: 'n_srix_path',
    lat: 18.04270,
    lng: 79.57830,
    name: 'Innovation Corridor Walkway',
    neighbors: ['n_library', 'n_cse_plaza', 'n_srix_hub']
  },
  n_srix_hub: {
    id: 'n_srix_hub',
    lat: 18.04310,
    lng: 79.57790,
    name: 'SRiX Incubator Main Entrance',
    neighbors: ['n_srix_path']
  },
  n_audi_junc: {
    id: 'n_audi_junc',
    lat: 18.04150,
    lng: 79.57980,
    name: 'Central Auditorium Courtyard',
    neighbors: ['n_central_lawn', 'n_srec_main', 'n_hostel_path', 'n_sports_path']
  },
  n_hostel_path: {
    id: 'n_hostel_path',
    lat: 18.04060,
    lng: 79.57990,
    name: 'Cafeteria & Residential Avenue',
    neighbors: ['n_admin_junc', 'n_audi_junc', 'n_hostel_quad']
  },
  n_hostel_quad: {
    id: 'n_hostel_quad',
    lat: 18.04020,
    lng: 79.58020,
    name: 'Student Housing Quads',
    neighbors: ['n_hostel_path']
  },
  n_sports_path: {
    id: 'n_sports_path',
    lat: 18.04340,
    lng: 79.58120,
    name: 'Sports Stadium Gateway',
    neighbors: ['n_audi_junc', 'n_mech_wing']
  }
};

// Haversine formula to calculate accurate distances in meters between lat/lng
export function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Map any POI or query string to the closest Campus POI
export function findBestMatchingPOI(query: string): CampusPOI {
  const clean = query.trim().toLowerCase();
  if (!clean) return CAMPUS_POIS[0];

  // Direct exact/alias match
  for (const poi of CAMPUS_POIS) {
    if (poi.name.toLowerCase() === clean) return poi;
    if (poi.code.toLowerCase() === clean) return poi;
    if (poi.shortName.toLowerCase() === clean) return poi;
    if (poi.aliases.some(a => clean.includes(a))) return poi;
  }

  // Partial match
  for (const poi of CAMPUS_POIS) {
    if (
      poi.name.toLowerCase().includes(clean) ||
      poi.description.toLowerCase().includes(clean) ||
      (poi.roomDetails && poi.roomDetails.toLowerCase().includes(clean))
    ) {
      return poi;
    }
  }

  // Default fallback
  return CAMPUS_POIS[0];
}

// Find closest graph node for lat/lng
function getClosestNode(lat: number, lng: number): string {
  let closestId = 'n_gate1';
  let minDist = Infinity;

  for (const [id, node] of Object.entries(CAMPUS_NAV_GRAPH)) {
    const dist = getDistanceMeters(lat, lng, node.lat, node.lng);
    if (dist < minDist) {
      minDist = dist;
      closestId = id;
    }
  }

  return closestId;
}

export interface CampusRouteResult {
  originPOI: CampusPOI;
  destinationPOI: CampusPOI;
  totalDistanceMeters: number;
  estimatedMinutes: number;
  pathCoordinates: Array<{ lat: number; lng: number }>;
  steps: Array<{
    id: number;
    stepNumber: number;
    title: string;
    description: string;
    distanceMeters: number;
    type: 'straight' | 'turn_right' | 'turn_left' | 'stairs' | 'elevator' | 'arrival';
    badge?: string;
  }>;
}

// Dijkstra shortest path on campus walkway graph
export function computeCampusWalkingRoute(
  originQuery: string,
  destQuery: string,
  isAccessible: boolean = false
): CampusRouteResult {
  const originPOI = findBestMatchingPOI(originQuery);
  let destinationPOI = findBestMatchingPOI(destQuery);

  // If origin and destination resolve to the same POI, pick another reasonable destination
  if (originPOI.id === destinationPOI.id) {
    destinationPOI = originPOI.id === 'poi-cse-block' ? CAMPUS_POIS[0] : CAMPUS_POIS[4];
  }

  const startNodeId = getClosestNode(originPOI.lat, originPOI.lng);
  const endNodeId = getClosestNode(destinationPOI.lat, destinationPOI.lng);

  // Dijkstra
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const id of Object.keys(CAMPUS_NAV_GRAPH)) {
    distances[id] = Infinity;
    previous[id] = null;
    unvisited.add(id);
  }
  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    let current: string | null = null;
    let minD = Infinity;

    for (const id of unvisited) {
      if (distances[id] < minD) {
        minD = distances[id];
        current = id;
      }
    }

    if (!current || minD === Infinity || current === endNodeId) {
      break;
    }

    unvisited.delete(current);
    const currNode = CAMPUS_NAV_GRAPH[current];

    for (const neighborId of currNode.neighbors) {
      if (!unvisited.has(neighborId)) continue;
      const neighborNode = CAMPUS_NAV_GRAPH[neighborId];
      const edgeWeight = getDistanceMeters(currNode.lat, currNode.lng, neighborNode.lat, neighborNode.lng);
      const alt = distances[current] + edgeWeight;
      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = current;
      }
    }
  }

  // Reconstruct path
  const nodePath: string[] = [];
  let curr: string | null = endNodeId;
  while (curr) {
    nodePath.unshift(curr);
    curr = previous[curr];
  }

  // Fallback if disconnected
  if (nodePath.length <= 1) {
    nodePath.length = 0;
    nodePath.push(startNodeId, endNodeId);
  }

  // Build coordinate polyline with actual origin and destination POIs at the ends
  const pathCoordinates: Array<{ lat: number; lng: number }> = [];
  pathCoordinates.push({ lat: originPOI.lat, lng: originPOI.lng });
  for (const nId of nodePath) {
    const n = CAMPUS_NAV_GRAPH[nId];
    if (n) {
      pathCoordinates.push({ lat: n.lat, lng: n.lng });
    }
  }
  pathCoordinates.push({ lat: destinationPOI.lat, lng: destinationPOI.lng });

  // Calculate total meters
  let totalDistanceMeters = 0;
  for (let i = 0; i < pathCoordinates.length - 1; i++) {
    totalDistanceMeters += getDistanceMeters(
      pathCoordinates[i].lat,
      pathCoordinates[i].lng,
      pathCoordinates[i+1].lat,
      pathCoordinates[i+1].lng
    );
  }

  // Walking speed approx 75 meters / min
  const estimatedMinutes = Math.max(1, Math.ceil(totalDistanceMeters / 75));

  // Generate contextual turn-by-turn guidance
  const steps: CampusRouteResult['steps'] = [];
  let stepIndex = 1;

  steps.push({
    id: stepIndex,
    stepNumber: stepIndex++,
    title: `Start from ${originPOI.shortName}`,
    description: `Head towards the connected campus walkway pathway.`,
    distanceMeters: Math.round(totalDistanceMeters * 0.25),
    type: 'straight',
    badge: 'Step 1 • Departure'
  });

  if (nodePath.length > 2) {
    const midNode = CAMPUS_NAV_GRAPH[nodePath[Math.floor(nodePath.length / 2)]];
    steps.push({
      id: stepIndex,
      stepNumber: stepIndex++,
      title: `Follow path past ${midNode?.name || 'Academic Lawn'}`,
      description: isAccessible
        ? 'Continue along step-free paved corridor with wheelchair ramps.'
        : 'Follow central arterial walkway towards destination.',
      distanceMeters: Math.round(totalDistanceMeters * 0.5),
      type: 'turn_right',
      badge: isAccessible ? 'Accessible Route' : 'Main Path'
    });
  }

  if (destinationPOI.floorLevel && destinationPOI.floorLevel.includes('Level 2')) {
    steps.push({
      id: stepIndex,
      stepNumber: stepIndex++,
      title: isAccessible ? 'Take Concourse Elevator to Level 2' : 'Ascend Stairwell B to Level 2',
      description: isAccessible
        ? 'Central glass elevator available on the right of the entrance lobby.'
        : 'Wide stairs lead directly to the Department corridor on Level 2.',
      distanceMeters: 35,
      type: isAccessible ? 'elevator' : 'stairs',
      badge: 'Indoor Floor Change'
    });
  }

  steps.push({
    id: stepIndex,
    stepNumber: stepIndex++,
    title: `Arrive at ${destinationPOI.name}`,
    description: destinationPOI.roomDetails
      ? `${destinationPOI.roomDetails}. You have reached your destination.`
      : `Main entrance of ${destinationPOI.shortName}.`,
    distanceMeters: Math.round(totalDistanceMeters * 0.25),
    type: 'arrival',
    badge: 'Arrival'
  });

  return {
    originPOI,
    destinationPOI,
    totalDistanceMeters,
    estimatedMinutes,
    pathCoordinates,
    steps
  };
}
