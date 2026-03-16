export interface LatLng {
  lat: number;
  lng: number;
}

export interface MissionStop {
  id: string;
  question: string;
  questionEs: string;
  hint: string;
  location: LatLng;
  answer: string;
  directions?: string; // Professor's written directions for students
}

export interface StartingPlace {
  id: string;
  name: string;
  nameEs: string;
  emoji: string;
  location: LatLng;
}

export interface Mission {
  id: string;
  title: string;
  neighborhood: string;
  center: LatLng;
  zoom: number;
  stops: MissionStop[];
  startingPlaces: StartingPlace[];
}

export type Direction = 'left' | 'right' | 'straight' | 'back';

export interface DirectionOption {
  direction: Direction;
  labelEs: string;
  labelEn: string;
  icon: string;
}

export const DIRECTION_OPTIONS: DirectionOption[] = [
  { direction: 'left', labelEs: 'Gira a la izquierda', labelEn: 'Turn left', icon: '←' },
  { direction: 'straight', labelEs: 'Sigue recto', labelEn: 'Go straight', icon: '↑' },
  { direction: 'right', labelEs: 'Gira a la derecha', labelEn: 'Turn right', icon: '→' },
  { direction: 'back', labelEs: 'Da la vuelta', labelEn: 'Turn around', icon: '↓' },
];
