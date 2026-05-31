import type { SideEffectType, SymptomType, VisitOutcome } from './types';

export const symptomOptions: SymptomType[] = [
  '불안',
  '우울',
  '공황',
  '무기력',
  '집중력 저하',
  '수면 문제',
  '과민반응',
];

export const sideEffectOptions: SideEffectType[] = [
  '졸림',
  '두통',
  '어지러움',
  '불면',
  '메스꺼움',
  '입마름',
  '식욕 증가',
  '식욕 감소',
];

export const visitOutcomeOptions: VisitOutcome[] = [
  '약 추가',
  '약 변경',
  '증량',
  '감량',
  '유지',
  '상담',
  '검사',
];

export const theme = {
  background: '#e8e9ec',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F0F7',
  text: '#1F2933',
  muted: '#68747F',
  line: '#DFDDEC',
  teal: '#4025E8',
  tealSoft: '#EEEDF8',
  blue: '#2F6FBB',
  blueSoft: '#DDEBFA',
  coral: '#D7725B',
  coralSoft: '#F8E3DD',
  amber: '#E1A82D',
  amberSoft: '#F7E9C4',
  green: '#6A8F4E',
  greenSoft: '#E5EFD8',
  ink: '#101820',
};
