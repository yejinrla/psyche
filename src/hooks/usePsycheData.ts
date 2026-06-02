import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { seedData } from '../data/seedData';
import type {
  DoctorQuestion,
  EffectLog,
  Medication,
  MedicationEvent,
  MedicationLog,
  PsycheData,
  SideEffectLog,
  SymptomLog,
  Visit,
} from '../types';
import { todayISO } from '../utils/date';

const STORAGE_KEY = 'psyche:v2:data';

const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const usePsycheData = () => {
  const [data, setData] = useState<PsycheData>(seedData);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setData(JSON.parse(saved) as PsycheData);
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
      addMedicationLog,
      addSymptomLog,
      addSideEffectLog,
      addEffectLog,
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
      addMedicationLog,
      addSymptomLog,
      addSideEffectLog,
      addEffectLog,
      addQuestion,
      toggleQuestion,
      resetDemoData,
    ],
  );
};

export type PsycheDataActions = ReturnType<typeof usePsycheData>;
