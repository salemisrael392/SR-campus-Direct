import sruLogoPrimary from '../assets/sru_logo_primary.png';
import sruLogoSecondary from '../assets/sru_logo_secondary.png';
import sruEntranceGate from '../assets/sru_entrance_gate.jpg';
import srecBuilding from '../assets/srec.png';
import libraryBuilding from '../assets/library.png';
import srixBuilding from '../assets/srix.png';
import hostelsPhoto from '../assets/sr_hostels.webp';
import iotZonePhoto from '../assets/sr_iot_zone.png';
import sportsPhoto from '../assets/sr_sports.webp';

export const UNIVERSITY_INFO = {
  name: 'SR University',
  campus: 'Main Campus • Ananthasagar, Warangal',
  address: 'Ananthasagar, Hasanparthy, Warangal Urban, Telangana 506371, India',
  website: 'https://sru.edu.in',
  phone: '+91 870 281 8333',
  emergencyPhone: '+91 870 281 8311',
  email: 'info@sru.edu.in',
  coordinates: {
    lat: 18.041775,
    lng: 79.578781
  },
  logoUrl: sruLogoPrimary,
  secondaryLogoUrl: sruLogoSecondary,
  entranceGateUrl: sruEntranceGate,
  user: {
    name: 'Sara Alva',
    id: 'SRU-2023-8841',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiKMxVijVKA86zdoGbUUGMkSJG1eb5JbueKk5MKQ5EupcmVNnD25eaYoPl1dmJreWLqAAPBC1tr9Ia0J-AX_bsphDTS0vOkIjlkO4tD-eZGPGilxgUA51fWTRpvL9F0W2fJDtWEv4GnHfBl1dljgSrIubuvxOYEFAT865VvdRmx_rjwt17fv8dcgNrqfeBNYYpvjftKRSY-kFraXFaLVAeRTHc0GjY1astfu6Tx-Em_pMPQal1D7Mj',
    department: 'School of Computer Science & Artificial Intelligence',
    program: 'B.Tech. Computer Science & Engineering',
    term: 'Year 2 • Fall Semester 2024',
    cohort: 'Cohort 2023–2027 • Year 2',
    semester: 'Sem 3',
    email: 's.alva@sru.edu'
  }
};

export const REAL_CAMPUS_DESTINATIONS: Destination[] = [
  {
    id: 'dest-entrance-gate',
    name: 'Main Campus Entrance (Gate 1)',
    category: 'admin',
    description: 'Official Visitor Registration, Security Kiosk & Shuttle Pick-up',
    walkMinutes: 1,
    openStatus: 'Open 24/7 Security Active',
    accessibility: 'Step-free automated vehicular & pedestrian gate',
    locationLabel: 'Highway Road • Ananthasagar Entrance',
    imageUrl: sruEntranceGate,
    bookmarked: true,
    roomCode: 'GATE-01',
    buildingId: 'main-gate'
  },
  {
    id: 'dest-srec-block',
    name: 'SREC Main Academic Block',
    category: 'hall',
    description: 'Dean Office, Civil & Mechanical Lecture Halls, Registrar & Exam Branch',
    walkMinutes: 4,
    openStatus: 'Open until 7:00 PM',
    accessibility: 'Accessible ramps & wide corridors',
    locationLabel: 'Central Spine • 4 Floors',
    imageUrl: srecBuilding,
    bookmarked: true,
    roomCode: 'SREC-101',
    buildingId: 'srec-block'
  },
  {
    id: 'dest-cs-pavilion',
    name: 'CS & AI Central Pavilion',
    category: 'lab',
    description: '2.7 Lakh sq.ft Computing Complex, 1200-cap Hackathon Pavilion & Skybridges',
    walkMinutes: 3,
    openStatus: 'Open 24/7 Access for Students',
    accessibility: 'Dual elevators & connecting skybridges',
    locationLabel: 'North Quad • Level 2',
    imageUrl: iotZonePhoto,
    bookmarked: true,
    roomCode: 'Room 204',
    buildingId: 'cs-pavilion'
  },
  {
    id: 'dest-library',
    name: 'Central University Library',
    category: 'library',
    description: 'Digital Knowledge Commons, Silent Study Rooms & Rooftop Amphitheater',
    walkMinutes: 5,
    openStatus: 'Open until 11:00 PM',
    accessibility: 'Step-free entrance with elevator',
    locationLabel: 'Academic Core • Central Quad',
    imageUrl: libraryBuilding,
    bookmarked: true,
    roomCode: 'LIB-MAIN',
    buildingId: 'central-library'
  },
  {
    id: 'dest-srix',
    name: 'SRiX Technology Business Incubator',
    category: 'lab',
    description: 'MakerSpace, IoT Research Labs, Startup Incubator & Venture Hub',
    walkMinutes: 6,
    openStatus: 'Open 24 Hours for Innovators',
    accessibility: 'Ramp and ground floor access',
    locationLabel: 'Innovation Wing • Ground & 1st Floor',
    imageUrl: srixBuilding,
    bookmarked: false,
    roomCode: 'SRIX-HUB',
    buildingId: 'srix-incubator'
  },
  {
    id: 'dest-hostels',
    name: 'Student Housing & Dining Complex',
    category: 'dining',
    description: 'Furnished Boys & Girls Quads, 16,000 Meal Dining Halls & Food Court',
    walkMinutes: 5,
    openStatus: 'Dining Open: 7:30 AM - 10:00 PM',
    accessibility: 'Accessible ground pathways & lifts',
    locationLabel: 'South Residential Quad • Blocks A-D',
    imageUrl: hostelsPhoto,
    bookmarked: false,
    roomCode: 'HOSTEL-SQ',
    buildingId: 'housing-complex'
  },
  {
    id: 'dest-sports',
    name: 'SR Sports Stadium & Arena',
    category: 'hall',
    description: 'National-Level Cricket Ground, Basketball, Tennis & Indoor Gym',
    walkMinutes: 7,
    openStatus: 'Open 6:00 AM - 9:00 PM',
    accessibility: 'Level track & field entry',
    locationLabel: 'East Campus Sports Quad',
    imageUrl: sportsPhoto,
    bookmarked: false,
    roomCode: 'SPORTS-01',
    buildingId: 'sports-complex'
  }
];

export const POPULAR_DESTINATIONS: Destination[] = REAL_CAMPUS_DESTINATIONS;

export const SCHEDULE_DAYS = [
  { day: 'MON', dateNumber: 21 },
  { day: 'TUE', dateNumber: 22 },
  { day: 'WED', dateNumber: 23 },
  { day: 'THU', dateNumber: 24, isToday: true },
  { day: 'FRI', dateNumber: 25 },
  { day: 'SAT', dateNumber: 26 }
];

export const CLASSES_BY_DAY: Record<number, ClassSession[]> = {
  24: [
    {
      id: 'cs301',
      code: 'CS301',
      title: 'CS301 • Data Structures & Algorithms',
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      tag: 'Starting in 24m',
      major: 'CSE / AI Major',
      professor: {
        name: 'Prof. Sarah Vance',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCg9wfGU5eR1Kw-nGJtphAhpyDwXxFyEQ_hpNpiOxO1ynqJP3wUXx078qzNNJjE_nONhzsx-OoXhUbW9z3ubE4gmMietqkME9DCfO2r19_B3hD4qNHSCBeK8SU443U53NM1rrKsdeRQkWTR0NQJI4zQtOJt05pMP1K4yZXuLBtbGu4ZdxO1Cw9c7IxhP1QRcLaCMprGFWz_DyfjXfI7w_vNZpwJnf-o0yQ4e_882xZIh3I5Wsbq-6BE'
      },
      building: 'CS & AI Central Pavilion',
      floor: 'Level 2',
      room: 'Room 204',
      walkMinutes: 4,
      walkMeters: 310,
      urgent: true,
      statusText: 'Room unlocked & quiet',
      day: 'THU',
      dateNumber: 24
    },
    {
      id: 'ee210',
      code: 'EE210',
      title: 'EE210 • Digital Logic & Circuits',
      startTime: '01:00 PM',
      endTime: '02:30 PM',
      tag: 'Hardware Lab',
      major: 'Hardware Lab',
      professor: {
        name: 'Dr. Aaron Miller',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3MB-ENTL3AiGpORmtA0I-RA-l4PA8UvjicNkbvwth1mv9nayUuU_SKeQtvxOI1i7IgsVG6Sl7cBLWdF69iVIz_k1Nf_Xb3fv1LnzjiXm8kVCM5lrtHVuKTJhMdAVqZ6quoZ5VRqx83alFjoG70aLeTeiOnl-AjfnGvEDVnc88zsJJ0hYJlbZ0lHKIy8jx1fD00O3Ggz9RXNe0ICkoXaxVK2UO7OmTZG8E7wYc5v-6h-duoTHhS7LT'
      },
      building: 'SREC Main Academic Block',
      floor: 'Ground Floor',
      room: 'Lab G-08',
      walkMinutes: 5,
      walkMeters: 380,
      urgent: false,
      day: 'THU',
      dateNumber: 24
    },
    {
      id: 'math204',
      code: 'MATH204',
      title: 'MATH204 • Discrete Mathematics',
      startTime: '03:15 PM',
      endTime: '04:45 PM',
      tag: 'Math Core',
      major: 'Math Core',
      professor: {
        name: 'Prof. Elena Rostova',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxQLO3YYDRDyGQVmPFp0vpU97ugTqeA6TWzBcAZXnvP6pp1_oc6KZYylz_8Z0r09qdsBBJbue-X_YjifcBsF9TIYKneyyJq0mEh3jaaleXGbESwP6BS5t_ECQCKUtQr1XsD6NhYZlIptH1NQaNYD3dYTEiVbfAF5aBbH2FOxIpgkVwTeEYMekJ2rHfaixBlOLwPbVO0f4g8_zVW8Ry4DFB73GqW_W4mdIJNntjxRqVvexTHBZtEZF-'
      },
      building: 'SREC Academic Block',
      floor: '1st Floor',
      room: 'Lecture Hall 102',
      walkMinutes: 6,
      walkMeters: 420,
      urgent: false,
      day: 'THU',
      dateNumber: 24
    }
  ],
  21: [
    {
      id: 'cs301-mon',
      code: 'CS301',
      title: 'Algorithms & Data Structures',
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      tag: 'Lecture',
      major: 'CS Major',
      professor: {
        name: 'Dr. Marcus Reed',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3MB-ENTL3AiGpORmtA0I-RA-l4PA8UvjicNkbvwth1mv9nayUuU_SKeQtvxOI1i7IgsVG6Sl7cBLWdF69iVIz_k1Nf_Xb3fv1LnzjiXm8kVCM5lrtHVuKTJhMdAVqZ6quoZ5VRqx83alFjoG70aLeTeiOnl-AjfnGvEDVnc88zsJJ0hYJlbZ0lHKIy8jx1fD00O3Ggz9RXNe0ICkoXaxVK2UO7OmTZG8E7wYc5v-6h-duoTHhS7LT'
      },
      building: 'CS Pavilion',
      floor: '2nd Floor',
      room: 'Hall E-204',
      walkMinutes: 4,
      walkMeters: 300,
      day: 'MON',
      dateNumber: 21
    },
    {
      id: 'ee210l-mon',
      code: 'EE210L',
      title: 'Digital Logic Systems Lab',
      startTime: '11:30 AM',
      endTime: '01:00 PM',
      tag: 'Lab Session',
      major: 'Hardware',
      professor: {
        name: 'Prof. S. H. Varma',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCg9wfGU5eR1Kw-nGJtphAhpyDwXxFyEQ_hpNpiOxO1ynqJP3wUXx078qzNNJjE_nONhzsx-OoXhUbW9z3ubE4gmMietqkME9DCfO2r19_B3hD4qNHSCBeK8SU443U53NM1rrKsdeRQkWTR0NQJI4zQtOJt05pMP1K4yZXuLBtbGu4ZdxO1Cw9c7IxhP1QRcLaCMprGFWz_DyfjXfI7w_vNZpwJnf-o0yQ4e_882xZIh3I5Wsbq-6BE'
      },
      building: 'SRiX MakerSpace',
      floor: 'Ground Floor',
      room: 'IoT Lab 4B',
      walkMinutes: 6,
      walkMeters: 420,
      day: 'MON',
      dateNumber: 21
    }
  ],
  22: [
    {
      id: 'cs240-tue',
      code: 'CS240',
      title: 'Database Architectures',
      startTime: '10:15 AM',
      endTime: '11:45 AM',
      tag: 'Core Major',
      major: 'CS Major',
      professor: {
        name: 'Prof. Elena Rostova',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxQLO3YYDRDyGQVmPFp0vpU97ugTqeA6TWzBcAZXnvP6pp1_oc6KZYylz_8Z0r09qdsBBJbue-X_YjifcBsF9TIYKneyyJq0mEh3jaaleXGbESwP6BS5t_ECQCKUtQr1XsD6NhYZlIptH1NQaNYD3dYTEiVbfAF5aBbH2FOxIpgkVwTeEYMekJ2rHfaixBlOLwPbVO0f4g8_zVW8Ry4DFB73GqW_W4mdIJNntjxRqVvexTHBZtEZF-'
      },
      building: 'SREC Central Block',
      floor: 'Ground Floor',
      room: 'Auditorium 1',
      walkMinutes: 5,
      walkMeters: 360,
      day: 'TUE',
      dateNumber: 22
    }
  ],
  23: [
    {
      id: 'math204-wed',
      code: 'MATH204',
      title: 'Discrete Mathematics Tutorial',
      startTime: '11:00 AM',
      endTime: '12:30 PM',
      tag: 'Tutorial',
      major: 'Math',
      professor: {
        name: 'Prof. Elena Rostova',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxQLO3YYDRDyGQVmPFp0vpU97ugTqeA6TWzBcAZXnvP6pp1_oc6KZYylz_8Z0r09qdsBBJbue-X_YjifcBsF9TIYKneyyJq0mEh3jaaleXGbESwP6BS5t_ECQCKUtQr1XsD6NhYZlIptH1NQaNYD3dYTEiVbfAF5aBbH2FOxIpgkVwTeEYMekJ2rHfaixBlOLwPbVO0f4g8_zVW8Ry4DFB73GqW_W4mdIJNntjxRqVvexTHBZtEZF-'
      },
      building: 'SREC Academic Block',
      floor: '1st Floor',
      room: 'Room 102',
      walkMinutes: 5,
      walkMeters: 350,
      day: 'WED',
      dateNumber: 23
    }
  ],
  25: [
    {
      id: 'cs390-fri',
      code: 'CS390',
      title: 'Software Engineering Workshop',
      startTime: '02:00 PM',
      endTime: '04:00 PM',
      tag: 'Capstone Prep',
      major: 'Comp Sci Major',
      professor: {
        name: 'Prof. Sarah Vance',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCg9wfGU5eR1Kw-nGJtphAhpyDwXxFyEQ_hpNpiOxO1ynqJP3wUXx078qzNNJjE_nONhzsx-OoXhUbW9z3ubE4gmMietqkME9DCfO2r19_B3hD4qNHSCBeK8SU443U53NM1rrKsdeRQkWTR0NQJI4zQtOJt05pMP1K4yZXuLBtbGu4ZdxO1Cw9c7IxhP1QRcLaCMprGFWz_DyfjXfI7w_vNZpwJnf-o0yQ4e_882xZIh3I5Wsbq-6BE'
      },
      building: 'CS Pavilion',
      floor: '3rd Floor',
      room: 'Room 312',
      walkMinutes: 5,
      walkMeters: 340,
      day: 'FRI',
      dateNumber: 25
    }
  ],
  26: [
    {
      id: 'hack-sat',
      code: 'SR-CLUB',
      title: 'Autonomous Robotics Hack Session',
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      tag: 'Club Activity',
      major: 'Robotics Club',
      professor: {
        name: 'Dr. Aaron Miller',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3MB-ENTL3AiGpORmtA0I-RA-l4PA8UvjicNkbvwth1mv9nayUuU_SKeQtvxOI1i7IgsVG6Sl7cBLWdF69iVIz_k1Nf_Xb3fv1LnzjiXm8kVCM5lrtHVuKTJhMdAVqZ6quoZ5VRqx83alFjoG70aLeTeiOnl-AjfnGvEDVnc88zsJJ0hYJlbZ0lHKIy8jx1fD00O3Ggz9RXNe0ICkoXaxVK2UO7OmTZG8E7wYc5v-6h-duoTHhS7LT'
      },
      building: 'SRiX MakerSpace',
      floor: 'Ground Floor',
      room: 'MakerSpace B-12',
      walkMinutes: 6,
      walkMeters: 400,
      day: 'SAT',
      dateNumber: 26
    }
  ]
};

export const TURN_BY_TURN_STEPS: NavigationStep[] = [
  {
    id: 1,
    stepNumber: 1,
    title: 'Head North past Campus Entrance Gate 1',
    description: 'Walk across the tree-lined central avenue towards SREC Academic Quad.',
    distanceMeters: 120,
    type: 'straight',
    badge: 'Step 1 • Ongoing'
  },
  {
    id: 2,
    stepNumber: 2,
    title: 'Enter CS & AI Central Pavilion',
    description: 'Proceed through the glass skybridge entrance into the computing atrium.',
    distanceMeters: 60,
    type: 'turn_right',
    badge: 'Step 2',
    subBadge: 'North Pavilion Entrance'
  },
  {
    id: 3,
    stepNumber: 3,
    title: 'Ascend Staircase B or Central Elevator',
    description: 'Located behind the Pavilion Innovation Lounge. Ascend to Level 2.',
    distanceMeters: 35,
    type: 'stairs',
    badge: 'Step 3 • Indoor Floor Change',
    subBadge: 'To Level 2 • Elevator Accessible'
  },
  {
    id: 4,
    stepNumber: 4,
    title: 'Corridor to Room 204',
    description: 'Turn left along the Data Structures wing. Room 204 is on the right-hand side adjacent to AI Research Lab.',
    distanceMeters: 30,
    type: 'arrival',
    badge: 'Step 4 • Arrival',
    hasVisualPreview: true,
    visualPreviewImg: sruEntranceGate,
    visualPreviewNote: 'Room 204 • CS & AI Pavilion Level 2.'
  }
];

export const INITIAL_NOTIFICATIONS: CampusNotification[] = [
  {
    id: 'notif-1',
    title: 'Data Structures Starting in 24m',
    description: 'CS & AI Central Pavilion Room 204 is unlocked. Estimated walk time: 4 minutes from Main Gate.',
    timestamp: '9:36 AM',
    type: 'class',
    unread: true
  },
  {
    id: 'notif-2',
    title: 'Campus Shuttle Blue Line 3 Min Away',
    description: 'Main Entrance Gate 1 incoming electric transit bus on time.',
    timestamp: '9:25 AM',
    type: 'transit',
    unread: true
  },
  {
    id: 'notif-3',
    title: 'SREC Central Skybridge Open',
    description: 'Step-free corridor active. Elevators inspected and certified.',
    timestamp: '8:45 AM',
    type: 'system',
    unread: false
  }
];
