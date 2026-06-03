import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { seedData } from '../data/seedData';
import type {
  DoctorQuestion,
  EffectLog,
  Medication,
  MedicationEvent,
  MedicationLog,
  MoodLog,
  PsycheData,
  SideEffectLog,
  SleepLog,
  SymptomLog,
  Visit,
} from '../types';
import { todayISO } from '../utils/date';

const STORAGE_KEY = 'psyche:v2:data';

const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeData = (data: PsycheData): PsycheData => ({
  ...seedData,
  ...data,
  medicationLogs: data.medicationLogs ?? [],
  moodLogs: data.moodLogs ?? [],
  sleepLogs: data.sleepLogs ?? [],
});

export const usePsycheData = () => {
  const [data, setData] = useState<PsycheData>(seedData);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setData(normalizeData(JSON.parse(saved) as PsycheData));
        }
      } finally {
        setIsReady(true);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, isReady]);

  const addVisit = useCallback((visit: Omit<Visit, 'id'>) => {
    setData((current) => ({
      ...current,
      visits: [{ ...visit, id: createId('visit') }, ...current.visits],
    }));
  }, []);

  const addMedication = useCallback((medication: Omit<Medication, 'id' | 'status'>) => {
    const medicationId = createId('med');
    const eventId = createId('event');

    setData((current) => ({
      ...current,
      medications: [
        {
          ...medication,
          id: medicationId,
          status: 'active',
        },
        ...current.medications,
      ],
      medicationEvents: [
        {
          id: eventId,
          date: medication.startDate,
          medicationName: medication.name,
          title: `${medication.name} 시작`,
          description: `${medication.dose}, ${medication.frequency}로 복용 시작`,
          type: 'start',
        },
        ...current.medicationEvents,
      ],
    }));
  }, []);

  const addSymptomLog = useCallback((log: Omit<SymptomLog, 'id'>) => {
    setData((current) => ({
      ...current,
      symptomLogs: [{ ...log, id: createId('symptom') }, ...current.symptomLogs],
    }));
  }, []);

  const addSideEffectLog = useCallback((log: Omit<SideEffectLog, 'id'>) => {
    setData((current) => ({
      ...current,
      sideEffectLogs: [{ ...log, id: createId('side') }, ...current.sideEffectLogs],
    }));
  }, []);

  const addEffectLog = useCallback((log: Omit<EffectLog, 'id'>) => {
    setData((current) => ({
      ...current,
      effectLogs: [{ ...log, id: createId('effect') }, ...current.effectLogs],
    }));
  }, []);

  const upsertMoodLog = useCallback((log: Omit<MoodLog, 'id'>) => {
    setData((current) => {
      const moodLogs = current.moodLogs ?? [];
      const existing = moodLogs.find((item) => item.date === log.date);

      return {
        ...current,
        moodLogs: existing
          ? moodLogs.map((item) =>
              item.date === log.date ? { ...item, ...log } : item,
            )
          : [{ ...log, id: createId('mood') }, ...moodLogs],
      };
    });
  }, []);

  const upsertSleepLog = useCallback((log: Omit<SleepLog, 'id'>) => {
    setData((current) => {
      const sleepLogs = current.sleepLogs ?? [];
      const existing = sleepLogs.find((item) => item.date === log.date);

      return {
        ...current,
        sleepLogs: existing
          ? sleepLogs.map((item) =>
              item.date === log.date ? { ...item, ...log } : item,
            )
          : [{ ...log, id: createId('sleep') }, ...sleepLogs],
      };
    });
  }, []);

  const addQuestion = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    setData((current) => ({
      ...current,
      questions: [
        {
          id: createId('question'),
          text: trimmed,
          createdAt: todayISO(),
          resolved: false,
        },
        ...current.questions,
      ],
    }));
  }, []);

  const toggleQuestion = useCallback((questionId: DoctorQuestion['id']) => {
    setData((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              resolved: !question.resolved,
            }
          : question,
      ),
    }));
  }, []);

  const updateMedication = useCallback((id: string, updates: Partial<Omit<Medication, 'id'>>) => {
    setData((current) => ({
      ...current,
      medications: current.medications.map((med) =>
        med.id === id ? { ...med, ...updates } : med
      ),
    }));
  }, []);

  const addMedicationLog = useCallback((log: Omit<MedicationLog, 'id'>) => {
    setData((current) => ({
      ...current,
      medicationLogs: [{ ...log, id: createId('medlog') }, ...(current.medicationLogs ?? [])],
    }));
  }, []);

  const addMedicationEvent = useCallback((event: Omit<MedicationEvent, 'id'>) => {
    setData((current) => ({
      ...current,
      medicationEvents: [{ ...event, id: createId('event') }, ...current.medicationEvents],
    }));
  }, []);

  const deleteMedicationEvent = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      medicationEvents: current.medicationEvents.filter((e) => e.id !== id),
    }));
  }, []);

  const updateMedicationEvent = useCallback((id: string, updates: Partial<Omit<MedicationEvent, 'id'>>) => {
    setData((current) => ({
      ...current,
      medicationEvents: current.medicationEvents.map((e) => e.id === id ? { ...e, ...updates } : e),
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    setData(seedData);
  }, []);

  return useMemo(
    () => ({
      data,
      isReady,
      addVisit,
      addMedication,
      updateMedication,
      addMedicationEvent,
      deleteMedicationEvent,
      updateMedicationEvent,
      addMedicationLog,
      addSymptomLog,
      addSideEffectLog,
      addEffectLog,
      upsertMoodLog,
      upsertSleepLog,
      addQuestion,
      toggleQuestion,
      resetDemoData,
    }),
    [
      data,
      isReady,
      addVisit,
      addMedication,
      updateMedication,
      addMedicationEvent,
      deleteMedicationEvent,
      updateMedicationEvent,
      addMedicationLog,
      addSymptomLog,
      addSideEffectLog,
      addEffectLog,
      upsertMoodLog,
      upsertSleepLog,
      addQuestion,
      toggleQuestion,
      resetDemoData,
    ],
  );
};

export type PsycheDataActions = ReturnType<typeof usePsycheData>;
