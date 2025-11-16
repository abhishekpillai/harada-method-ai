export interface GridCell {
  id: string;
  content: string;
  type: 'center' | 'pillar' | 'task';
  pillarIndex?: number; // Which of the 8 pillars this belongs to
  taskIndex?: number; // Which task within the pillar (0-7)
  isEditable: boolean;
  isGenerated: boolean;
}

export interface Pillar {
  id: string;
  title: string;
  tasks: string[];
}

export interface HaradaGrid {
  goal: string;
  pillars: Pillar[];
  createdAt: string;
  updatedAt: string;
}

export type GenerationStatus = 'idle' | 'generating-pillars' | 'generating-tasks' | 'completed' | 'error';

export interface GenerationState {
  status: GenerationStatus;
  currentPillarIndex: number;
  currentTaskIndex: number;
  error?: string;
}

export interface APIKeyConfig {
  userKey?: string;
  useDefaultKey: boolean;
}

export const PILLAR_NAMES = [
  'Body Care',
  'Flexibility',
  'Stamina',
  'Set Clear Goals',
  'Thrive on Adversity',
  "Don't Make Waves",
  'Emotions',
  'Consideration',
  'Politeness'
];
