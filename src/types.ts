export type Rating = 1 | 2 | 3 | 4 | 5;

export type VisitOutcome =
  | '약 추가'
  | '약 변경'
  | '증량'
  | '감량'
  | '유지'
  | '상담'
  | '검사';

export type Visit = {
  id: string;
  date: string;
  time?: string;
  hospitalName: string;
  doctorName: string;
  cost: number;
  nextAppointment?: {
    date: string;
    time: string;
  };
  notes: string;
  outcomes: VisitOutcome[];
};

export type MedicationStatus = 'active' | 'archived';

export type MealSchedule = '아침' | '점심' | '저녁' | '취침전';

export type Medication = {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  schedule?: MealSchedule[];
  startDate: string;
  endDate?: string;
  status: MedicationStatus;
  purpose?: string;
  memo?: string;
};

export type MedicationEventType =
  | 'start'
  | 'increase'
  | 'decrease'
  | 'maintain'
  | 'stop'
  | 'change';

export type MedicationEvent = {
  id: string;
  date: string;
  medicationName: string;
  title: string;
  description: string;
  type: MedicationEventType;
  fromDose?: string;
  toDose?: string;
  frequency?: string;
};

export type SymptomType =
  | '불안'
  | '우울'
  | '공황'
  | '무기력'
  | '집중력 저하'
  | '수면 문제'
  | '과민반응';

export type SymptomLog = {
  id: string;
  date: string;
  symptom: SymptomType;
  level: Rating;
  situation?: string;
  memo?: string;
};

export type SideEffectType =
  | '졸림'
  | '두통'
  | '어지러움'
  | '불면'
  | '메스꺼움'
  | '입마름'
  | '식욕 증가'
  | '식욕 감소';

export type SideEffectLog = {
  id: string;
  date: string;
  effects: SideEffectType[];
  intensity: Rating;
  memo?: string;
};

export type EffectLog = {
  id: string;
  date: string;
  anxietyRelief: Rating;
  depressionRelief: Rating;
  sleepImprovement: Rating;
  focusImprovement: Rating;
  memo?: string;
};

export type MoodLog = {
  id: string;
  date: string;
  level: number;
};

export type SleepLog = {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  quality: number | null;
};

export type DoctorQuestion = {
  id: string;
  text: string;
  createdAt: string;
  resolved: boolean;
};

export type PsycheData = {
  visits: Visit[];
  medications: Medication[];
  medicationEvents: MedicationEvent[];
  symptomLogs: SymptomLog[];
  sideEffectLogs: SideEffectLog[];
  effectLogs: EffectLog[];
  moodLogs: MoodLog[];
  sleepLogs: SleepLog[];
  questions: DoctorQuestion[];
  medicationLogs: MedicationLog[];
};

export type TimelineItemType =
  | 'visit'
  | 'medication'
  | 'symptom'
  | 'sideEffect'
  | 'effect';

export type TimelineItem = {
  id: string;
  date: string;
  title: string;
  description: string;
  type: TimelineItemType;
  accent: string;
};

export type TabKey = 'home' | 'records' | 'medications' | 'timeline' | 'report';

export type MedicationLog = {
  id: string;
  date: string;
  time: string;
  medicationName: string;
  dose: string;
  sideEffects?: SideEffectType[];
  sideEffectIntensity?: Rating;
  memo?: string;
};

export type ModalKind =
  | 'visit'
  | 'symptom'
  | 'sideEffect'
  | 'question'
  | 'medication'
  | 'editMedication'
  | 'effect'
  | 'medicationLog'
  | null;

export type DailyMedicationInfo = {
  name: string;
  englishName: string;
  brandName: string;
  ingredient: string;
  category: string;
  dose: string;
  quantity: string;
  schedule: string;
  purpose: string;
  description: string;
  sideEffects: { emoji: string; name: string; freq: string; myCount?: number }[];
  caution: string;
  isActive: boolean;
};
