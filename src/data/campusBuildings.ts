/**
 * SR University Campus Buildings & Architectural Footprints
 */

import srecBuilding from '../assets/srec.png';
import csePhoto from '../assets/sr_computer_lab.png';
import srixBuilding from '../assets/srix.png';
import libraryBuilding from '../assets/library.png';
import hostelsPhoto from '../assets/sr_hostels.webp';
import sportsPhoto from '../assets/sr_sports.webp';
import gatePhoto from '../assets/sru_entrance_gate.jpg';
import gardenPhoto from '../assets/sr_garden.png';

export interface CampusBuildingFloor {
  floorNumber: number;
  label: string;
  name: string;
  highlights: string[];
}

export interface CampusBuilding {
  id: string;
  name: string;
  shortName: string;
  code: string;
  category: 'academic' | 'research' | 'residential' | 'athletics' | 'admin' | 'dining';
  categoryLabel: string;
  center: { lat: number; lng: number };
  footprint: Array<{ lat: number; lng: number }>;
  strokeColor: string;
  fillColor: string;
  photoUrl: string;
  floorsCount: number;
  floors: CampusBuildingFloor[];
  keyDepartments: string[];
  facilities: string[];
  description: string;
  architecturalStyle: string;
  totalAreaSqFt: string;
  yearBuilt: string;
}

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: 'bldg-srec-main',
    name: 'SREC Main Academic Block',
    shortName: 'SREC Main Block',
    code: 'SREC-MAIN',
    category: 'academic',
    categoryLabel: 'Academic Core',
    center: { lat: 18.04185, lng: 79.57855 },
    footprint: [
      { lat: 18.04165, lng: 79.57835 },
      { lat: 18.04205, lng: 79.57835 },
      { lat: 18.04205, lng: 79.57875 },
      { lat: 18.04165, lng: 79.57875 }
    ],
    strokeColor: '#0051d5',
    fillColor: '#3b82f6',
    photoUrl: srecBuilding,
    floorsCount: 4,
    floors: [
      { floorNumber: 0, label: 'Ground Floor', name: 'Dean Office & Exam Branch', highlights: ['Exam Cell G-02', 'Registrar G-06', 'Central Concourse'] },
      { floorNumber: 1, label: 'Level 1', name: 'Civil Engineering Wing', highlights: ['Lecture Halls LT-1 & LT-2', 'Structural Lab', 'Faculty Lounge'] },
      { floorNumber: 2, label: 'Level 2', name: 'Mechanical Engineering Wing', highlights: ['CAD/CAM Lab 202', 'Lecture Theatres LT-3 & LT-4'] },
      { floorNumber: 3, label: 'Level 3', name: 'Humanities & Sciences Wing', highlights: ['Physics Lab', 'Chemistry Research', 'Seminar Hall 301'] }
    ],
    keyDepartments: ['School of Engineering', 'Civil Engineering', 'Mechanical Engineering', 'Examinations Division'],
    facilities: ['Dual Elevators', 'Wheelchair Ramps', 'Filtered Water Stations', 'Restrooms Every Floor', 'Emergency Stairwells'],
    description: 'The historic flagship academic core of SR University, featuring four expansive floors of tiered lecture theatres, high-ceiling laboratory halls, and the university deanery.',
    architecturalStyle: 'Modernist Quadrangle with Central Light-Well Courtyard',
    totalAreaSqFt: '145,000 sq.ft',
    yearBuilt: '2002 (Modernized 2023)'
  },
  {
    id: 'bldg-cse',
    name: 'SREC Computer Science & AI Block',
    shortName: 'CSE & AI Block',
    code: 'CSE-BLOCK',
    category: 'academic',
    categoryLabel: 'Computing & AI',
    center: { lat: 18.04240, lng: 79.57915 },
    footprint: [
      { lat: 18.04220, lng: 79.57895 },
      { lat: 18.04260, lng: 79.57895 },
      { lat: 18.04260, lng: 79.57935 },
      { lat: 18.04220, lng: 79.57935 }
    ],
    strokeColor: '#4f46e5',
    fillColor: '#6366f1',
    photoUrl: csePhoto,
    floorsCount: 4,
    floors: [
      { floorNumber: 0, label: 'Ground Floor', name: 'Data Center & Network Hub', highlights: ['High-Performance Computing Cluster', 'Network Operations Center'] },
      { floorNumber: 1, label: 'Level 1', name: 'Software Development Studios', highlights: ['Lab 101 (Open Source Studio)', 'Algorithms Lab 105'] },
      { floorNumber: 2, label: 'Level 2', name: 'AI & Data Science Suites', highlights: ['Room 204 (Data Structures)', 'Deep Learning Research Lab', 'Robotics Hub'] },
      { floorNumber: 3, label: 'Level 3', name: 'Cloud Computing & Cyber Defense', highlights: ['Cybersecurity Range', 'Room 312 (Software Eng)', 'Project Demo Hall'] }
    ],
    keyDepartments: ['Computer Science & Engineering', 'Artificial Intelligence & Machine Learning', 'Data Science'],
    facilities: ['High-Speed Fiber Gigabit Wi-Fi', 'Dual Glass Elevators', '24/7 Smart Card Access', 'Ramp Entrance', 'Server Backup'],
    description: 'State-of-the-art computational pavilion equipped with multi-GPU artificial intelligence clusters, collaborative software team rooms, and smart glass lecture studios.',
    architecturalStyle: 'High-Tech Glazed Curtain Wall & Aerodynamic Sunshade Louvers',
    totalAreaSqFt: '95,000 sq.ft',
    yearBuilt: '2019'
  },
  {
    id: 'bldg-srix',
    name: 'SRiX Technology Business Incubator',
    shortName: 'SRiX Incubator & MakerSpace',
    code: 'SRIX-HUB',
    category: 'research',
    categoryLabel: 'Research & Startups',
    center: { lat: 18.04310, lng: 79.57790 },
    footprint: [
      { lat: 18.04290, lng: 79.57770 },
      { lat: 18.04330, lng: 79.57770 },
      { lat: 18.04330, lng: 79.57810 },
      { lat: 18.04290, lng: 79.57810 }
    ],
    strokeColor: '#059669',
    fillColor: '#10b981',
    photoUrl: srixBuilding,
    floorsCount: 3,
    floors: [
      { floorNumber: 0, label: 'Ground Floor', name: 'MakerSpace & Rapid Prototyping', highlights: ['3D Printing Studio', 'Laser Cutting Bay', 'PCB Milling Machine'] },
      { floorNumber: 1, label: 'Level 1', name: 'Incubated Startup Suites', highlights: ['Founder Workspaces A1-A12', 'Venture Capital Boardroom'] },
      { floorNumber: 2, label: 'Level 2', name: 'IoT & CleanTech Research Lab', highlights: ['Embedded Sensors Testbed', 'Smart Agriculture Simulator'] }
    ],
    keyDepartments: ['Technology Business Incubation (DST Supported)', 'Venture Studio', 'Center for IoT & Robotics'],
    facilities: ['CNC Prototyping Workshop', 'Pitch Amphitheatre', 'Co-Working Lounges', 'Coffee Kiosk', 'High Bay Crane'],
    description: 'Supported by the Department of Science and Technology, Government of India, SRiX is one of the premier university incubators in the state, nurturing 60+ deep-tech startups.',
    architecturalStyle: 'Industrial Loft Architecture with Exposed Steel Trusses',
    totalAreaSqFt: '65,000 sq.ft',
    yearBuilt: '2018'
  },
  {
    id: 'bldg-library',
    name: 'Central Campus Library',
    shortName: 'Central Library',
    code: 'LIB-CENTRAL',
    category: 'academic',
    categoryLabel: 'Academic Resource',
    center: { lat: 18.04210, lng: 79.57800 },
    footprint: [
      { lat: 18.04195, lng: 79.57785 },
      { lat: 18.04225, lng: 79.57785 },
      { lat: 18.04225, lng: 79.57815 },
      { lat: 18.04195, lng: 79.57815 }
    ],
    strokeColor: '#0d9488',
    fillColor: '#14b8a6',
    photoUrl: libraryBuilding,
    floorsCount: 3,
    floors: [
      { floorNumber: 0, label: 'Ground Floor', name: 'Circulation & Book Bank', highlights: ['Check-out Desk', 'Reference Stacks', 'New Arrival Gallery'] },
      { floorNumber: 1, label: 'Level 1', name: 'Digital Knowledge Center', highlights: ['80 Computer Terminals', 'IEEE/ACM Digital Archive', 'Audio-Visual Pods'] },
      { floorNumber: 2, label: 'Level 2', name: 'Silent Scholar Quads', highlights: ['Individual Study Cubicles', 'Doctoral Reading Lounge', 'Rare Periodicals'] }
    ],
    keyDepartments: ['University Library System', 'Digital Repository Division'],
    facilities: ['RFID Automated Book Drop', 'Silent Air Conditioning', 'Acoustic Study Pods', 'Elevator', 'Braille Resource Center'],
    description: 'A serene 3-level sanctuary with over 100,000 volumes, international academic journals, and round-the-clock digital access for research scholars.',
    architecturalStyle: 'Brutalist Concrete Frame with Clerestory Natural Daylight Windows',
    totalAreaSqFt: '50,000 sq.ft',
    yearBuilt: '2005 (Renovated 2022)'
  },
  {
    id: 'bldg-auditorium',
    name: 'SR Central Auditorium & Convention Complex',
    shortName: 'Central Auditorium',
    code: 'AUD-COMPLEX',
    category: 'academic',
    categoryLabel: 'Events & Cultural',
    center: { lat: 18.04150, lng: 79.57980 },
    footprint: [
      { lat: 18.04130, lng: 79.57960 },
      { lat: 18.04170, lng: 79.57960 },
      { lat: 18.04170, lng: 79.58000 },
      { lat: 18.04130, lng: 79.58000 }
    ],
    strokeColor: '#7c3aed',
    fillColor: '#8b5cf6',
    photoUrl: gardenPhoto,
    floorsCount: 2,
    floors: [
      { floorNumber: 0, label: 'Ground Level', name: 'Main Tier & Stage', highlights: ['1,200 Plush Seats', 'Acoustics Stage', 'Green Rooms A & B'] },
      { floorNumber: 1, label: 'Balcony', name: 'Mezzanine & Tech Booth', highlights: ['300 Balcony Seats', 'Sound & Lighting Control Booth'] }
    ],
    keyDepartments: ['Cultural Affairs', 'University Convocation Committee'],
    facilities: ['Dolby Surround Sound', 'Hydraulic Stage Ramps', 'VIP Lounge', 'Dedicated Foyer & Lobby', 'Four Double-Door Exits'],
    description: 'The campus center for grand ceremonies, international conferences, TEDx talks, and cultural festivals with 1,200 seating capacity.',
    architecturalStyle: 'Curved Acoustic Shell with Granite Promenade',
    totalAreaSqFt: '40,000 sq.ft',
    yearBuilt: '2015'
  },
  {
    id: 'bldg-hostels',
    name: 'Student Housing Quads & Dining Complex',
    shortName: 'Student Hostels & Dining',
    code: 'HOSTEL-BLOCKS',
    category: 'residential',
    categoryLabel: 'Residential & Dining',
    center: { lat: 18.04020, lng: 79.58020 },
    footprint: [
      { lat: 18.03995, lng: 79.57990 },
      { lat: 18.04045, lng: 79.57990 },
      { lat: 18.04045, lng: 79.58050 },
      { lat: 18.03995, lng: 79.58050 }
    ],
    strokeColor: '#ea580c',
    fillColor: '#f97316',
    photoUrl: hostelsPhoto,
    floorsCount: 5,
    floors: [
      { floorNumber: 0, label: 'Ground Floor', name: 'Dining Halls & Student Mess', highlights: ['Central Dining Room (1,600 meals)', 'Mess Office', 'Laundry Room'] },
      { floorNumber: 1, label: 'Level 1', name: 'Common Lounges & Quads A-B', highlights: ['Recreation Room', 'Table Tennis Zone', 'TV Lounge'] },
      { floorNumber: 2, label: 'Levels 2-4', name: 'Student Residential Rooms', highlights: ['Single & Double Occupancy Rooms', 'Warden Desks', 'Wi-Fi Zones'] }
    ],
    keyDepartments: ['Hostel Administration', 'Student Welfare & Dining Services'],
    facilities: ['24/7 RO Purified Water', 'Solar Water Heaters', 'Security Checkpoints', 'Indoor Gym', 'Emergency Clinic Room'],
    description: 'Secure, modern residential quads providing on-campus accommodations for over 2,500 students with hygienic multi-cuisine dining options.',
    architecturalStyle: 'Connected U-Shape Blocks Around Shaded Courtyards',
    totalAreaSqFt: '220,000 sq.ft',
    yearBuilt: '2012 (Expanded 2021)'
  },
  {
    id: 'bldg-sports',
    name: 'SR Sports Stadium & Athletic Arena',
    shortName: 'Sports Arena',
    code: 'SPORTS-ARENA',
    category: 'athletics',
    categoryLabel: 'Athletics & Sports',
    center: { lat: 18.04340, lng: 79.58120 },
    footprint: [
      { lat: 18.04310, lng: 79.58080 },
      { lat: 18.04370, lng: 79.58080 },
      { lat: 18.04370, lng: 79.58160 },
      { lat: 18.04310, lng: 79.58160 }
    ],
    strokeColor: '#16a34a',
    fillColor: '#22c55e',
    photoUrl: sportsPhoto,
    floorsCount: 1,
    floors: [
      { floorNumber: 0, label: 'Ground Level', name: 'Stadium & Courts', highlights: ['Full Turf Cricket Ground', 'Floodlit Basketball Courts', 'Indoor Badminton Pavilion', 'Fitness Center'] }
    ],
    keyDepartments: ['Department of Physical Education & Athletics'],
    facilities: ['Stadium Floodlights', 'Jogging Track', 'Locker Rooms & Showers', 'First Aid Station', 'Grandstand Seating'],
    description: 'Comprehensive sporting complex hosting inter-university cricket matches, athletics championships, and daily student recreation.',
    architecturalStyle: 'Outdoor Turf Oval with Cantilevered Spectator Canopy',
    totalAreaSqFt: '180,000 sq.ft',
    yearBuilt: '2016'
  },
  {
    id: 'bldg-admin',
    name: 'University Administrative Center',
    shortName: 'Administrative Center',
    code: 'ADMIN-HQ',
    category: 'admin',
    categoryLabel: 'University Administration',
    center: { lat: 18.04120, lng: 79.57810 },
    footprint: [
      { lat: 18.04110, lng: 79.57795 },
      { lat: 18.04130, lng: 79.57795 },
      { lat: 18.04130, lng: 79.57825 },
      { lat: 18.04110, lng: 79.57825 }
    ],
    strokeColor: '#0284c7',
    fillColor: '#38bdf8',
    photoUrl: gatePhoto,
    floorsCount: 2,
    floors: [
      { floorNumber: 0, label: 'Ground Floor', name: 'Admissions & Student One-Stop', highlights: ['Admissions Counselling', 'Fee Counters', 'Information Desk'] },
      { floorNumber: 1, label: 'Level 1', name: 'Vice Chancellor & Boardroom', highlights: ['Vice Chancellor Secretariat', 'Boardroom', 'International Relations'] }
    ],
    keyDepartments: ['Office of the Vice Chancellor', 'Admissions Directorate', 'Finance & Accounts'],
    facilities: ['Visitor Lounge', 'Accessible Ramps', 'Conference Facilities', 'Dedicated Visitor Parking'],
    description: 'The administrative heart of SR University overseeing academic governance, international student admissions, and university leadership.',
    architecturalStyle: 'Neoclassical Portico with Glass Frontage',
    totalAreaSqFt: '35,000 sq.ft',
    yearBuilt: '2008'
  },
  {
    id: 'bldg-workshops',
    name: 'Mechanical & Civil Engineering Workshops',
    shortName: 'Engineering Workshops',
    code: 'WORKSHOPS-01',
    category: 'academic',
    categoryLabel: 'Fabrication & Labs',
    center: { lat: 18.04280, lng: 79.57950 },
    footprint: [
      { lat: 18.04265, lng: 79.57935 },
      { lat: 18.04295, lng: 79.57935 },
      { lat: 18.04295, lng: 79.57965 },
      { lat: 18.04265, lng: 79.57965 }
    ],
    strokeColor: '#475569',
    fillColor: '#64748b',
    photoUrl: srecBuilding,
    floorsCount: 1,
    floors: [
      { floorNumber: 0, label: 'Ground Level', name: 'Heavy Machinery & Foundries', highlights: ['Lathe & Milling Shop', 'Welding Bay', 'Fluid Mechanics Testing', 'Concrete Strength Lab'] }
    ],
    keyDepartments: ['Mechanical Engineering Workshops', 'Civil Materials Testing'],
    facilities: ['Overhead Gantry Crane', 'Exhaust Ventilation', 'Safety Stations & Eyewash', 'Heavy Vehicle Access'],
    description: 'Practical engineering workshops where undergraduate and postgraduate students engage in hands-on metal fabrication, fluid dynamics, and materials testing.',
    architecturalStyle: 'High-Bay Industrial Engineering Shed',
    totalAreaSqFt: '45,000 sq.ft',
    yearBuilt: '2004'
  },
  {
    id: 'bldg-cafe',
    name: 'Campus Food Court & Cafeteria',
    shortName: 'Campus Food Court',
    code: 'CAFE-COURT',
    category: 'dining',
    categoryLabel: 'Dining & Refreshments',
    center: { lat: 18.04060, lng: 79.57990 },
    footprint: [
      { lat: 18.04048, lng: 79.57975 },
      { lat: 18.04072, lng: 79.57975 },
      { lat: 18.04072, lng: 79.58005 },
      { lat: 18.04048, lng: 79.58005 }
    ],
    strokeColor: '#d97706',
    fillColor: '#f59e0b',
    photoUrl: gardenPhoto,
    floorsCount: 1,
    floors: [
      { floorNumber: 0, label: 'Ground Level', name: 'Food Stalls & Al-Fresco Seating', highlights: ['Juice & Smoothie Bar', 'Bakery & Espresso', 'South & North Indian Counters', 'Outdoor Canopy Seating'] }
    ],
    keyDepartments: ['Campus Auxiliary Services'],
    facilities: ['Cashless Digital Payments', 'Outdoor Shaded Umbrella Tables', 'Hand Wash Stations', 'Wi-Fi Hotspot'],
    description: 'Vibrant social gathering zone offering fresh meals, beverages, coffee, and casual outdoor spaces for students and faculty.',
    architecturalStyle: 'Open-Air Pavilion with Tensile Canopy Roof',
    totalAreaSqFt: '25,000 sq.ft',
    yearBuilt: '2020'
  }
];
