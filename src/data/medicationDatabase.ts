import type { DailyMedicationInfo, Medication } from '../types';

type MedBase = Omit<DailyMedicationInfo, 'quantity' | 'schedule' | 'isActive'>;

export const MEDICATION_DB: Record<string, MedBase> = {
  '에스시탈로프람': {
    name: '에스시탈로프람', englishName: 'Escitalopram', brandName: '렉사프로',
    ingredient: '에스시탈로프람 옥살산염', category: 'SSRI 항우울제',
    dose: '10mg · 하루 1회',
    purpose: '불안, 우울 증상 완화',
    description: '세로토닌 재흡수를 억제해 불안·우울 증상을 완화하는 약이에요. 효과는 보통 2~4주 후부터 나타납니다.',
    sideEffects: [
      { emoji: '😴', name: '졸림', freq: '흔함' },
      { emoji: '💧', name: '입마름', freq: '흔함' },
      { emoji: '🤢', name: '메스꺼움', freq: '흔함' },
      { emoji: '🤕', name: '두통', freq: '가끔' },
    ],
    caution: '임의로 중단하지 마세요. 복용 중 음주는 피하고, 졸릴 수 있으니 운전 시 주의하세요.',
  },
  '프로프라놀롤': {
    name: '프로프라놀롤', englishName: 'Propranolol', brandName: '인데놀',
    ingredient: '프로프라놀롤 염산염', category: '베타차단제',
    dose: '10mg · 필요 시',
    purpose: '긴장 및 심박 상승 완화',
    description: '베타수용체를 차단해 심박수를 낮추고 신체적 불안 증상(떨림, 두근거림)을 완화하는 약이에요.',
    sideEffects: [
      { emoji: '😴', name: '피로감', freq: '흔함' },
      { emoji: '🥶', name: '손발 냉감', freq: '흔함' },
      { emoji: '💤', name: '수면장애', freq: '가끔' },
      { emoji: '😵', name: '어지러움', freq: '가끔' },
    ],
    caution: '갑자기 복용을 중단하면 심박수가 급상승할 수 있어요. 반드시 의사와 상담 후 감량하세요.',
  },
  '졸피뎀': {
    name: '졸피뎀', englishName: 'Zolpidem', brandName: '스틸녹스',
    ingredient: '졸피뎀 타르트산염', category: '수면진정제',
    dose: '5mg · 취침 전',
    purpose: '불면 완화',
    description: 'GABA 수용체에 작용해 빠르게 수면을 유도하는 약이에요. 단기 사용 목적으로 처방됩니다.',
    sideEffects: [
      { emoji: '😴', name: '주간 졸림', freq: '흔함' },
      { emoji: '😵', name: '어지러움', freq: '흔함' },
      { emoji: '💤', name: '기억력 저하', freq: '가끔' },
      { emoji: '🧠', name: '의존성', freq: '장기복용 시' },
    ],
    caution: '취침 직전 복용하고, 음주와 함께 복용하지 마세요. 의존성이 생길 수 있어 장기 복용은 피하세요.',
  },
  '아리피졸정': {
    name: '아리피졸정', englishName: 'Aripiprazole', brandName: '아빌리파이',
    ingredient: '아리피프라졸', category: '비정형 항정신병약',
    dose: '1mg · 하루 1회',
    purpose: '항정신병약',
    description: '도파민과 세로토닌 수용체에 작용해 조현병, 양극성 장애, 우울증 보조치료에 쓰이는 약이에요.',
    sideEffects: [
      { emoji: '😴', name: '졸림', freq: '흔함' },
      { emoji: '🤢', name: '메스꺼움', freq: '흔함' },
      { emoji: '🤕', name: '두통', freq: '흔함' },
      { emoji: '😰', name: '불안', freq: '가끔' },
    ],
    caution: '임의로 중단하지 마세요(서서히 감량). 효과는 보통 2~4주 후 나타나며, 복용 중 음주는 피하세요.',
  },
};

export function getMedicationInfo(medication: Medication): DailyMedicationInfo {
  const base = MEDICATION_DB[medication.name] ?? {
    name: medication.name,
    englishName: '',
    brandName: '',
    ingredient: '정보 없음',
    category: '정보 없음',
    dose: medication.dose,
    purpose: medication.purpose ?? '복용 중인 약',
    description: '약 설명 정보가 없습니다.',
    sideEffects: [],
    caution: '',
  };

  const scheduleLabel = medication.schedule?.join(' · ') ?? '';

  return {
    ...base,
    dose: medication.dose,
    quantity: '1정',
    schedule: scheduleLabel || base.dose.replace(/.*·\s*/, ''),
    isActive: medication.status === 'active',
  };
}
