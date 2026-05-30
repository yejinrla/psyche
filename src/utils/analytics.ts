import type {
  Medication,
  PsycheData,
  SideEffectType,
  SymptomType,
  TimelineItem,
} from '../types';
import { daysBetween, isWithinDays, sortByDateAsc, sortByDateDesc, todayISO } from './date';

export const countBy = <T extends string>(items: T[]) =>
  items.reduce<Record<T, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);

export const average = (numbers: number[]) => {
  if (numbers.length === 0) {
    return 0;
  }

  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
};

export const activeMedications = (medications: Medication[]) =>
  medications.filter((medication) => medication.status === 'active');

export const latestAppointment = (data: PsycheData) => {
  const appointments = data.visits
    .flatMap((visit) => (visit.nextAppointment ? [visit.nextAppointment] : []))
    .sort((a, b) => a.date.localeCompare(b.date));

  return appointments.find((appointment) => {
    const today = todayISO();
    return appointment.date >= today;
  });
};

export const treatmentStartDate = (data: PsycheData) => {
  const dates = [
    ...data.visits.map((visit) => visit.date),
    ...data.medications.map((medication) => medication.startDate),
    ...data.symptomLogs.map((log) => log.date),
  ].sort();

  return dates[0];
};

export const treatmentDays = (data: PsycheData) => {
  const startDate = treatmentStartDate(data);
  return startDate ? daysBetween(startDate) : 0;
};

export const recentSymptomAverage = (data: PsycheData, days = 30) => {
  const logs = data.symptomLogs.filter((log) => isWithinDays(log.date, days));
  return average(logs.map((log) => log.level));
};

export const symptomTrendLabel = (data: PsycheData) => {
  const sorted = sortByDateAsc(data.symptomLogs);
  if (sorted.length < 2) {
    return '기록 대기';
  }

  const midpoint = Math.ceil(sorted.length / 2);
  const previous = average(sorted.slice(0, midpoint).map((log) => log.level));
  const recent = average(sorted.slice(midpoint).map((log) => log.level));

  if (recent + 0.25 < previous) {
    return '감소 추세';
  }

  if (recent - 0.25 > previous) {
    return '증가 추세';
  }

  return '유지';
};

export const sideEffectFrequency = (data: PsycheData, days = 30) => {
  const effects = data.sideEffectLogs
    .filter((log) => isWithinDays(log.date, days))
    .flatMap((log) => log.effects);

  return Object.entries(countBy(effects)).sort((a, b) => b[1] - a[1]) as [
    SideEffectType,
    number,
  ][];
};

export const symptomFrequency = (data: PsycheData, days = 30) => {
  const symptoms = data.symptomLogs
    .filter((log) => isWithinDays(log.date, days))
    .map((log) => log.symptom);

  return Object.entries(countBy(symptoms)).sort((a, b) => b[1] - a[1]) as [
    SymptomType,
    number,
  ][];
};

export const generateVisitPrepSummary = (data: PsycheData) => {
  const trend = symptomTrendLabel(data);
  const sideEffects = sideEffectFrequency(data, 30);
  const activeMeds = activeMedications(data.medications);
  const longestMed = activeMeds
    .map((medication) => ({
      name: medication.name,
      days: daysBetween(medication.startDate),
    }))
    .sort((a, b) => b.days - a.days)[0];
  const latestSymptom = sortByDateDesc(data.symptomLogs)[0];
  const openQuestions = data.questions.filter((question) => !question.resolved);

  const summary = [
    `최근 증상 강도는 ${trend}입니다.`,
    latestSymptom
      ? `최근 기록된 주요 증상은 ${latestSymptom.symptom}, 강도 ${latestSymptom.level}/5입니다.`
      : '최근 증상 기록이 아직 없습니다.',
  ];

  if (sideEffects.length > 0) {
    const [effect, count] = sideEffects[0];
    summary.push(`최근 30일 동안 ${effect} 부작용이 ${count}회 기록되었습니다.`);
  }

  if (longestMed) {
    summary.push(`${longestMed.name}은 ${longestMed.days}일째 복용 중입니다.`);
  }

  if (openQuestions.length > 0) {
    summary.push(`의사에게 물어볼 질문이 ${openQuestions.length}개 준비되어 있습니다.`);
  }

  return summary;
};

export const buildTimeline = (data: PsycheData): TimelineItem[] => {
  const visits: TimelineItem[] = data.visits.map((visit) => ({
    id: `timeline-${visit.id}`,
    date: visit.date,
    title: `${visit.hospitalName} 방문`,
    description: `${visit.outcomes.join(', ')} · ${visit.notes}`,
    type: 'visit',
    accent: '#2F6FBB',
  }));

  const medicationEvents: TimelineItem[] = data.medicationEvents.map((event) => ({
    id: `timeline-${event.id}`,
    date: event.date,
    title: event.title,
    description: event.description,
    type: 'medication',
    accent: '#1B7F79',
  }));

  const symptoms: TimelineItem[] = data.symptomLogs.map((log) => ({
    id: `timeline-${log.id}`,
    date: log.date,
    title: `${log.symptom} 증상 기록`,
    description: `강도 ${log.level}/5${log.situation ? ` · ${log.situation}` : ''}`,
    type: 'symptom',
    accent: '#D7725B',
  }));

  const sideEffects: TimelineItem[] = data.sideEffectLogs.map((log) => ({
    id: `timeline-${log.id}`,
    date: log.date,
    title: `${log.effects.join(', ')} 부작용`,
    description: `강도 ${log.intensity}/5${log.memo ? ` · ${log.memo}` : ''}`,
    type: 'sideEffect',
    accent: '#E1A82D',
  }));

  const effects: TimelineItem[] = data.effectLogs.map((log) => ({
    id: `timeline-${log.id}`,
    date: log.date,
    title: '체감 효과 기록',
    description: `불안 감소 ${log.anxietyRelief}/5 · 수면 개선 ${log.sleepImprovement}/5`,
    type: 'effect',
    accent: '#6A8F4E',
  }));

  return sortByDateDesc([...visits, ...medicationEvents, ...symptoms, ...sideEffects, ...effects]);
};
