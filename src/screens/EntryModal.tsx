import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { X } from "lucide-react-native";
import {
  FormFooter,
  OptionGrid,
  RatingControl,
  TextField,
  VisitTextField,
} from "../components/SharedComponents";
import {
  sideEffectOptions,
  symptomOptions,
  theme,
  visitOutcomeOptions,
} from "../constants";
import type {
  ModalKind,
  Rating,
  SideEffectType,
  SymptomType,
  VisitOutcome,
} from "../types";
import type { PsycheDataActions } from "../hooks/usePsycheData";
import { todayISO } from "../utils/date";

// ---------------------------------------------------------------------------
// VisitForm
// ---------------------------------------------------------------------------

function VisitForm({
  actions,
  onDone,
}: {
  actions: PsycheDataActions;
  onDone: () => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [hospitalName, setHospitalName] = useState("온유 정신건강의학과");
  const [doctorName, setDoctorName] = useState("");
  const [cost, setCost] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [notes, setNotes] = useState("");
  const [outcomes, setOutcomes] = useState<VisitOutcome[]>(["유지"]);

  const toggleOutcome = (outcome: VisitOutcome) => {
    setOutcomes((current) =>
      current.includes(outcome)
        ? current.filter((item) => item !== outcome)
        : [...current, outcome],
    );
  };

  const save = () => {
    actions.addVisit({
      date,
      hospitalName: hospitalName.trim() || "병원명 미입력",
      doctorName: doctorName.trim() || "담당 의사 미입력",
      cost: Number(cost.replace(/[^\d]/g, "")) || 0,
      nextAppointment: nextDate.trim()
        ? {
            date: nextDate.trim(),
            time: nextTime.trim() || "시간 미정",
          }
        : undefined,
      notes: notes.trim() || "진료 메모 없음",
      outcomes: outcomes.length ? outcomes : ["유지"],
    });
    onDone();
  };

  return (
    <View style={styles.visitFormStack}>
      <VisitTextField
        label="방문일"
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />
      <VisitTextField
        label="병원명"
        value={hospitalName}
        onChangeText={setHospitalName}
      />
      <VisitTextField
        label="담당 의사"
        value={doctorName}
        onChangeText={setDoctorName}
        placeholder="예: 김하린"
      />
      <VisitTextField
        label="진료비"
        value={cost}
        onChangeText={setCost}
        placeholder="예: 19800"
        keyboardType="number-pad"
      />
      <View style={styles.visitOptionField}>
        <Text style={styles.visitFieldLabel}>진료 결과</Text>
        <OptionGrid
          options={visitOutcomeOptions}
          selected={outcomes}
          onToggle={toggleOutcome}
        />
      </View>
      <VisitTextField
        label="다음 예약일"
        value={nextDate}
        onChangeText={setNextDate}
        placeholder="YYYY-MM-DD"
      />
      <VisitTextField
        label="예약 시간"
        value={nextTime}
        onChangeText={setNextTime}
        placeholder="예: 14:00"
      />
      <VisitTextField
        label="진료 메모"
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="상태 변화, 의사 조언, 다음 관찰 사항"
      />
      <FormFooter onSave={save} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// SymptomForm
// ---------------------------------------------------------------------------

function SymptomForm({
  actions,
  onDone,
}: {
  actions: PsycheDataActions;
  onDone: () => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [symptom, setSymptom] = useState<SymptomType>("불안");
  const [level, setLevel] = useState<Rating>(3);
  const [situation, setSituation] = useState("");
  const [memo, setMemo] = useState("");

  const save = () => {
    actions.addSymptomLog({
      date,
      symptom,
      level,
      situation: situation.trim(),
      memo: memo.trim(),
    });
    onDone();
  };

  return (
    <View style={styles.formStack}>
      <TextField
        label="기록일"
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />
      <Text style={styles.formLabel}>증상 종류</Text>
      <OptionGrid
        options={symptomOptions}
        selected={[symptom]}
        onToggle={(value) => setSymptom(value)}
        single
      />
      <Text style={styles.formLabel}>강도</Text>
      <RatingControl value={level} onChange={setLevel} />
      <TextField
        label="발생 상황"
        value={situation}
        onChangeText={setSituation}
        placeholder="예: 회의 전 불안감 증가"
      />
      <TextField
        label="메모"
        value={memo}
        onChangeText={setMemo}
        multiline
        placeholder="몸 상태, 지속 시간, 대처 방법"
      />
      <FormFooter onSave={save} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// SideEffectForm
// ---------------------------------------------------------------------------

function SideEffectForm({
  actions,
  onDone,
}: {
  actions: PsycheDataActions;
  onDone: () => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [effects, setEffects] = useState<SideEffectType[]>(["졸림"]);
  const [intensity, setIntensity] = useState<Rating>(3);
  const [memo, setMemo] = useState("");

  const toggleEffect = (effect: SideEffectType) => {
    setEffects((current) =>
      current.includes(effect)
        ? current.filter((item) => item !== effect)
        : [...current, effect],
    );
  };

  const save = () => {
    actions.addSideEffectLog({
      date,
      effects: effects.length ? effects : ["졸림"],
      intensity,
      memo: memo.trim(),
    });
    onDone();
  };

  return (
    <View style={styles.formStack}>
      <TextField
        label="기록일"
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />
      <Text style={styles.formLabel}>부작용</Text>
      <OptionGrid
        options={sideEffectOptions}
        selected={effects}
        onToggle={toggleEffect}
      />
      <Text style={styles.formLabel}>강도</Text>
      <RatingControl value={intensity} onChange={setIntensity} />
      <TextField
        label="메모"
        value={memo}
        onChangeText={setMemo}
        multiline
        placeholder="예: 오후 업무 집중이 어려움"
      />
      <FormFooter onSave={save} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// QuestionForm
// ---------------------------------------------------------------------------

function QuestionForm({
  actions,
  onDone,
}: {
  actions: PsycheDataActions;
  onDone: () => void;
}) {
  const [text, setText] = useState("");

  const save = () => {
    actions.addQuestion(text);
    onDone();
  };

  return (
    <View style={styles.formStack}>
      <TextField
        label="질문"
        value={text}
        onChangeText={setText}
        multiline
        placeholder="예: 졸림 부작용 때문에 복용 시간을 바꿔도 되는지 궁금함"
      />
      <FormFooter onSave={save} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// MedicationForm
// ---------------------------------------------------------------------------

function MedicationForm({
  actions,
  onDone,
}: {
  actions: PsycheDataActions;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("하루 1회");
  const [startDate, setStartDate] = useState(todayISO());
  const [purpose, setPurpose] = useState("");
  const [memo, setMemo] = useState("");

  const save = () => {
    actions.addMedication({
      name: name.trim() || "약 이름 미입력",
      dose: dose.trim() || "용량 미입력",
      frequency: frequency.trim() || "복용 횟수 미입력",
      startDate,
      purpose: purpose.trim(),
      memo: memo.trim(),
    });
    onDone();
  };

  return (
    <View style={styles.formStack}>
      <TextField
        label="약 이름"
        value={name}
        onChangeText={setName}
        placeholder="예: 에스시탈로프람"
      />
      <TextField
        label="용량"
        value={dose}
        onChangeText={setDose}
        placeholder="예: 10mg"
      />
      <TextField
        label="복용 횟수"
        value={frequency}
        onChangeText={setFrequency}
      />
      <TextField
        label="복용 시작일"
        value={startDate}
        onChangeText={setStartDate}
        placeholder="YYYY-MM-DD"
      />
      <TextField
        label="복용 목적"
        value={purpose}
        onChangeText={setPurpose}
        placeholder="예: 불안 증상 완화"
      />
      <TextField
        label="메모"
        value={memo}
        onChangeText={setMemo}
        multiline
        placeholder="복용 시간, 주의 사항"
      />
      <FormFooter onSave={save} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// MedicationLogForm
// ---------------------------------------------------------------------------

type TakenStatus = 'taken' | 'skipped' | 'later';
type MealTime = '아침' | '점심' | '저녁' | '취침전';

const MEAL_TIMES: { label: MealTime; time: string }[] = [
  { label: '아침', time: '08:00' },
  { label: '점심', time: '12:00' },
  { label: '저녁', time: '18:00' },
  { label: '취침전', time: '22:00' },
];

const STATUS_OPTIONS: { key: TakenStatus; icon: string; label: string; activeColor: string; activeBg: string }[] = [
  { key: 'taken', icon: '✓', label: '복용 완료', activeColor: '#1DB954', activeBg: '#E9F8EF' },
  { key: 'skipped', icon: '✕', label: '건너뜀', activeColor: '#666', activeBg: '#EEEEF0' },
  { key: 'later', icon: '⏱', label: '나중에', activeColor: '#888', activeBg: '#EEEEF0' },
];

function MedicationLogForm({
  actions,
  onDone,
  onClose,
  initialMedicationName = '',
  initialDose = '',
}: {
  actions: PsycheDataActions;
  onDone: () => void;
  onClose: () => void;
  initialMedicationName?: string;
  initialDose?: string;
}) {
  const [status, setStatus] = useState<TakenStatus>('taken');
  const [mealTime, setMealTime] = useState<MealTime>('아침');
  const [quantity, setQuantity] = useState(1);
  const [selectedEffects, setSelectedEffects] = useState<SideEffectType[]>([]);
  const [sideEffectIntensity, setSideEffectIntensity] = useState<Rating>(3);
  const [memo, setMemo] = useState('');

  const selectedTime = MEAL_TIMES.find(m => m.label === mealTime)?.time ?? '08:00';
  const hasSideEffect = selectedEffects.length > 0;

  const INTENSITY_LABELS = ['약함', '약간', '보통', '강함', '매우 강함'];

  const toggleEffect = (effect: SideEffectType) => {
    setSelectedEffects(prev =>
      prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]
    );
  };

  const save = () => {
    actions.addMedicationLog({
      date: todayISO(),
      time: selectedTime,
      medicationName: initialMedicationName || '약 이름 미입력',
      dose: `${initialDose} · ${quantity}정`,
      sideEffects: selectedEffects,
      sideEffectIntensity: hasSideEffect ? sideEffectIntensity : undefined,
      memo: memo.trim(),
    });
    onDone();
  };

  return (
    <View style={ml.container}>
      {/* 닫기 버튼 */}
      <View style={ml.topBar}>
        <Text style={ml.topBarTitle}>복약 기록</Text>
        <Pressable style={ml.closeBtn} onPress={onClose}>
          <X color="#20212B" size={18} strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* 약물 카드 */}
      <View style={ml.medCard}>
        <View style={ml.medCardIcon}>
          <Text style={ml.medCardIconText}>💊</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ml.medCardLabel}>기록할 약물</Text>
          <Text style={ml.medCardName}>
            {initialMedicationName}{'  '}
            <Text style={ml.medCardDose}>{initialDose}</Text>
          </Text>
        </View>
        <Text style={ml.medCardChevron}>›</Text>
      </View>

      {/* 복용 여부 */}
      <Text style={ml.sectionLabel}>복용하셨나요?</Text>
      <View style={ml.statusRow}>
        {STATUS_OPTIONS.map((opt) => {
          const active = status === opt.key;
          return (
            <Pressable
              key={opt.key}
              style={[ml.statusBtn, active && { backgroundColor: opt.activeBg, borderColor: opt.activeColor }]}
              onPress={() => setStatus(opt.key)}
            >
              <Text style={[ml.statusIcon, active && { color: opt.activeColor }]}>{opt.icon}</Text>
              <Text style={[ml.statusLabel, active && { color: opt.activeColor }]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* 복용 시간 */}
      <View style={ml.sectionRow}>
        <Text style={ml.sectionLabel}>언제 드셨나요?</Text>
        <Text style={ml.timeText}>{selectedTime}</Text>
      </View>
      <View style={ml.mealRow}>
        {MEAL_TIMES.map((m) => {
          const active = mealTime === m.label;
          return (
            <Pressable
              key={m.label}
              style={[ml.mealBtn, active && ml.mealBtnActive]}
              onPress={() => setMealTime(m.label)}
            >
              <Text style={[ml.mealBtnText, active && ml.mealBtnTextActive]}>{m.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* 복용량 */}
      <Text style={ml.sectionLabel}>복용량</Text>
      <View style={ml.quantityRow}>
        <Text style={ml.quantityDose}>{initialDose || '—'} · 1정</Text>
        <View style={ml.quantityControls}>
          <Pressable style={ml.qBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
            <Text style={ml.qBtnText}>−</Text>
          </Pressable>
          <Text style={ml.qNum}>{quantity}</Text>
          <Pressable style={[ml.qBtn, ml.qBtnPlus]} onPress={() => setQuantity(q => q + 1)}>
            <Text style={[ml.qBtnText, ml.qBtnPlusText]}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* 부작용 */}
      <Text style={ml.sectionLabel}>혹시 부작용이 있었나요? <Text style={ml.optional}>(선택)</Text></Text>
      <View style={ml.effectChipWrap}>
        {/* 없음 버튼 */}
        <Pressable
          style={[ml.effectChip, !hasSideEffect && ml.effectChipNone]}
          onPress={() => setSelectedEffects([])}
        >
          <Text style={[ml.effectChipText, !hasSideEffect && ml.effectChipNoneText]}>없음</Text>
        </Pressable>
        {(["졸림", "두통", "어지러움", "메스꺼움", "입마름"] as SideEffectType[]).map((effect) => {
          const active = selectedEffects.includes(effect);
          return (
            <Pressable
              key={effect}
              style={[ml.effectChip, active && ml.effectChipActive]}
              onPress={() => toggleEffect(effect)}
            >
              {active && <Text style={ml.effectChipWarning}>⚠ </Text>}
              <Text style={[ml.effectChipText, active && ml.effectChipActiveText]}>{effect}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* 강도 */}
      {hasSideEffect && (
        <>
          <View style={ml.sectionRow}>
            <Text style={ml.sectionLabel}>{selectedEffects[0]} 강도</Text>
            <Text style={ml.intensityLabel}>{INTENSITY_LABELS[sideEffectIntensity - 1]}</Text>
          </View>
          <View style={ml.intensityBarRow}>
            {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
              <Pressable
                key={n}
                style={[ml.intensityBar, n <= sideEffectIntensity && ml.intensityBarActive]}
                onPress={() => setSideEffectIntensity(n)}
              />
            ))}
          </View>
        </>
      )}

      {/* 메모 */}
      <Text style={[ml.sectionLabel, { marginTop: 6 }]}>메모 <Text style={ml.optional}>(선택)</Text></Text>
      <TextInput
        style={ml.memoInput}
        placeholder="예) 아침 식사 후 복용"
        placeholderTextColor="#C0C4CC"
        value={memo}
        onChangeText={setMemo}
        multiline
        numberOfLines={3}
      />

      {/* 저장 버튼 */}
      <Pressable style={ml.saveBtn} onPress={save}>
        <Text style={ml.saveBtnText}>복약 기록 저장</Text>
      </Pressable>
      <Text style={ml.streakText}>복약 95일 연속 기록 중이에요 🌿</Text>
    </View>
  );
}

const ml = StyleSheet.create({
  container: {
    gap: 0,
    paddingBottom: 8,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBE8FD',
    borderRadius: 16,
    padding: 14,
    marginBottom: 22,
    gap: 12,
  },
  medCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medCardIconText: {
    fontSize: 20,
  },
  medCardLabel: {
    fontSize: 11,
    color: '#7B6FBB',
    fontWeight: '600',
    marginBottom: 2,
  },
  medCardName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#20212B',
  },
  medCardDose: {
    fontWeight: '600',
    color: '#4025E8',
  },
  medCardChevron: {
    fontSize: 22,
    color: '#B0AAD8',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#20212B',
    marginBottom: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4025E8',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  statusBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F2F2F4',
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 6,
  },
  statusIcon: {
    fontSize: 18,
    color: '#AEAEC0',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#AEAEC0',
  },
  mealRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  mealBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F2F2F4',
    alignItems: 'center',
  },
  mealBtnActive: {
    backgroundColor: '#4025E8',
  },
  mealBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
  },
  mealBtnTextActive: {
    color: '#fff',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F6F5FF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 22,
  },
  quantityDose: {
    fontSize: 15,
    fontWeight: '700',
    color: '#20212B',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E8E6F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qBtnPlus: {
    backgroundColor: '#4025E8',
  },
  qBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4025E8',
    lineHeight: 22,
  },
  qBtnPlusText: {
    color: '#fff',
  },
  qNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#20212B',
    minWidth: 20,
    textAlign: 'center',
  },
  optional: {
    fontSize: 12,
    fontWeight: '400',
    color: '#AEAEC0',
  },
  memoInput: {
    backgroundColor: '#F6F5FF',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#20212B',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  saveBtn: {
    backgroundColor: '#4025E8',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  streakText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#AEAEC0',
    marginBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#20212B',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F2F2F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  effectChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  effectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F2F2F4',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  effectChipNone: {
    borderColor: '#AEAEC0',
  },
  effectChipActive: {
    backgroundColor: '#FFF4E5',
    borderColor: '#E8952A',
  },
  effectChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  effectChipNoneText: {
    color: '#555',
  },
  effectChipActiveText: {
    color: '#C97A1A',
  },
  effectChipWarning: {
    fontSize: 12,
    color: '#E8952A',
  },
  intensityLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E8952A',
  },
  intensityBarRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 22,
  },
  intensityBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EEEEF0',
  },
  intensityBarActive: {
    backgroundColor: '#E8952A',
  },
});

// ---------------------------------------------------------------------------
// EffectForm
// ---------------------------------------------------------------------------

function EffectForm({
  actions,
  onDone,
}: {
  actions: PsycheDataActions;
  onDone: () => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [anxietyRelief, setAnxietyRelief] = useState<Rating>(3);
  const [depressionRelief, setDepressionRelief] = useState<Rating>(3);
  const [sleepImprovement, setSleepImprovement] = useState<Rating>(3);
  const [focusImprovement, setFocusImprovement] = useState<Rating>(3);
  const [memo, setMemo] = useState("");

  const save = () => {
    actions.addEffectLog({
      date,
      anxietyRelief,
      depressionRelief,
      sleepImprovement,
      focusImprovement,
      memo: memo.trim(),
    });
    onDone();
  };

  return (
    <View style={styles.formStack}>
      <TextField
        label="기록일"
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />
      <Text style={styles.formLabel}>불안 감소</Text>
      <RatingControl value={anxietyRelief} onChange={setAnxietyRelief} />
      <Text style={styles.formLabel}>우울 감소</Text>
      <RatingControl value={depressionRelief} onChange={setDepressionRelief} />
      <Text style={styles.formLabel}>수면 개선</Text>
      <RatingControl value={sleepImprovement} onChange={setSleepImprovement} />
      <Text style={styles.formLabel}>집중력 향상</Text>
      <RatingControl value={focusImprovement} onChange={setFocusImprovement} />
      <TextField
        label="메모"
        value={memo}
        onChangeText={setMemo}
        multiline
        placeholder="체감 변화나 상담이 필요한 점"
      />
      <FormFooter onSave={save} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// EntryModal (exported)
// ---------------------------------------------------------------------------

export function EntryModal({
  kind,
  actions,
  onClose,
  modalContext,
}: {
  kind: ModalKind;
  actions: PsycheDataActions;
  onClose: () => void;
  modalContext?: { medicationName?: string; dose?: string };
}) {
  const title = {
    visit: "병원 방문 기록",
    symptom: "증상 기록",
    sideEffect: "부작용 기록",
    question: "의사에게 물어볼 질문",
    medication: "약 등록",
    effect: "체감 효과 기록",
    medicationLog: "복약 기록",
  }[kind ?? "symptom"];

  return (
    <Modal
      visible={kind !== null}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalKeyboard}
        >
          <View style={styles.modalSheet}>
            {kind !== "medicationLog" && (
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
                <Pressable style={styles.iconButton} onPress={onClose}>
                  <X color={theme.text} size={21} strokeWidth={2.3} />
                </Pressable>
              </View>
            )}
            <ScrollView key={kind ?? "closed"} showsVerticalScrollIndicator={false}>
              {kind === "visit" ? (
                <VisitForm actions={actions} onDone={onClose} />
              ) : null}
              {kind === "symptom" ? (
                <SymptomForm actions={actions} onDone={onClose} />
              ) : null}
              {kind === "sideEffect" ? (
                <SideEffectForm actions={actions} onDone={onClose} />
              ) : null}
              {kind === "question" ? (
                <QuestionForm actions={actions} onDone={onClose} />
              ) : null}
              {kind === "medication" ? (
                <MedicationForm actions={actions} onDone={onClose} />
              ) : null}
              {kind === "effect" ? (
                <EffectForm actions={actions} onDone={onClose} />
              ) : null}
              {kind === "medicationLog" ? (
                <MedicationLogForm
                  actions={actions}
                  onDone={onClose}
                  onClose={onClose}
                  initialMedicationName={modalContext?.medicationName}
                  initialDose={modalContext?.dose}
                />
              ) : null}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(16, 24, 32, 0.45)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalKeyboard: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
    alignSelf: "center",
    justifyContent: "flex-end",
  },
  modalSheet: {
    width: "100%",
    maxHeight: "88%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: theme.background,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 20,
  },
  modalHeader: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    color: theme.ink,
    fontSize: 20,
    fontWeight: "900",
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: theme.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  formStack: {
    gap: 13,
    paddingBottom: 22,
  },
  visitFormStack: {
    gap: 12,
    paddingBottom: 22,
  },
  visitOptionField: {
    borderRadius: 14,
    backgroundColor: "#F0F2F6",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
  visitFieldLabel: {
    color: "#9AA0AA",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  formLabel: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 7,
  },
});
