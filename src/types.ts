export type TabType = 'explore' | 'timetable' | 'wayfinder' | 'directory' | 'profile';

export type RouteMode = 'fast' | 'sheltered' | 'accessible';

export type FloorLevel = 'L1' | 'L2' | 'L3' | 'Outdoor';

export interface ClassSession {
  id: string;
  code: string;
  title: string;
  startTime: string;
  endTime: string;
  tag: string;
  major: string;
  professor: {
    name: string;
    avatar: string;
  };
  building: string;
  floor: string;
  room: string;
  walkMinutes: number;
  walkMeters: number;
  urgent?: boolean;
  statusText?: string;
  day: string;
  dateNumber: number;
}

export interface Destination {
  id: string;
  name: string;
  category: 'hall' | 'library' | 'dining' | 'admin' | 'restroom' | 'transit' | 'lab';
  description: string;
  walkMinutes: number;
  openStatus: string;
  accessibility: string;
  locationLabel: string;
  imageUrl: string;
  bookmarked?: boolean;
  roomCode?: string;
  buildingId?: string;
}

export interface NavigationStep {
  id: number;
  stepNumber: number;
  title: string;
  description: string;
  distanceMeters: number;
  type: 'straight' | 'turn_right' | 'turn_left' | 'stairs' | 'elevator' | 'arrival';
  badge?: string;
  subBadge?: string;
  hasVisualPreview?: boolean;
  visualPreviewImg?: string;
  visualPreviewNote?: string;
}

export interface CampusNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'class' | 'transit' | 'emergency' | 'system';
  unread?: boolean;
}
