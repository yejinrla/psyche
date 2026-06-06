import React, { useMemo, useRef, useState } from "react";
import {
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Bell, Clock, Hospital, MapPin, Pill } from "lucide-react-native";
import { ButterflyIcon } from "../components/ButterflyIcon";
import { theme } from "../constants";
import { latestAppointment } from "../utils/analytics";
import { daysUntil, todayISO as todayISOUtil } from "../utils/date";
import type {
  DailyMedicationInfo,
  ModalKind,
  PsycheData,
  SymptomLog,
} from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toLocalDateISO(date: Date) {
  const localTime = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
  return new Date(localTime).toISOString().slice(0, 10);
}

function buildWeekStrip() {
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const today = new Date();
  const todayISO = todayISOUtil();

  return [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const isoDate = toLocalDateISO(date);

    return {
      key: isoDate,
      date: isoDate,
      name: dayNames[date.getDay()],
      day: String(date.getDate()).padStart(2, "0"),
      isToday: isoDate === todayISO,
    };
  });
}

function formatHomeTitle(date: string) {
  if (date === todayISOUtil()) {
    return "TODAY";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function toDotMonthDay(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return `${String(parsed.getMonth() + 1).padStart(2, "0")}.${String(parsed.getDate()).padStart(2, "0")}`;
}

type SleepDraft = {
  bedTime: string;
  wakeTime: string;
  quality: number | null;
};

const DEFAULT_SLEEP_DRAFT: SleepDraft = {
  bedTime: "23:00",
  wakeTime: "07:00",
  quality: null,
};

// ---------------------------------------------------------------------------
// SymptomSheet
// ---------------------------------------------------------------------------

const SYMPTOM_META: Record<string, { emoji: string; placeholder: string }> = {
  불안: { emoji: "🌀", placeholder: "어떤 상황에서 불안했나요?" },
  우울: { emoji: "🌧️", placeholder: "어떤 상황에서 우울했나요?" },
  강박: { emoji: "⚡", placeholder: "어떤 상황에서 강박을 느꼈나요?" },
};

function SymptomSheet({ symptom, onClose }: { symptom: string | null; onClose: () => void }) {
  const [intensity, setIntensity] = useState<number | null>(null);
  const [situation, setSituation] = useState("");
  const [memo, setMemo] = useState("");

  const handleSave = () => {
    setIntensity(null);
    setSituation("");
    setMemo("");
    onClose();
  };

  const meta = symptom ? SYMPTOM_META[symptom] : null;

  return (
    <Modal visible={!!symptom} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.symptomSheetOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.anxietySheet}>
          <View style={styles.anxietySheetHandle} />
          <View style={styles.anxietySheetHeader}>
            <Text style={styles.anxietySheetTitle}>{meta?.emoji} {symptom} 기록</Text>
            <Pressable onPress={onClose}><Text style={styles.anxietySheetClose}>✕</Text></Pressable>
          </View>

          <Text style={styles.anxietySheetSectionLabel}>{symptom} 강도</Text>
          <View style={styles.anxietyIntensityRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                style={[styles.anxietyIntensityBtn, intensity === n && styles.anxietyIntensityBtnActive]}
                onPress={() => setIntensity(n)}
              >
                <Text style={[styles.anxietyIntensityNum, intensity === n && styles.anxietyIntensityNumActive]}>{n}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.anxietyIntensityScale}>
            <Text style={styles.anxietyScaleLabel}>거의 없음</Text>
            <Text style={styles.anxietyScaleLabel}>매우 심함</Text>
          </View>

          <Text style={styles.anxietySheetSectionLabel}>상황</Text>
          <TextInput
            style={styles.anxietyInput}
            placeholder={meta?.placeholder ?? ""}
            placeholderTextColor="#aaa"
            value={situation}
            onChangeText={setSituation}
          />

          <Text style={styles.anxietySheetSectionLabel}>메모</Text>
          <TextInput
            style={[styles.anxietyInput, styles.anxietyInputMulti]}
            placeholder="추가로 기록할 내용이 있나요?"
            placeholderTextColor="#aaa"
            value={memo}
            onChangeText={setMemo}
            multiline
          />

          <Pressable style={styles.anxietySaveBtn} onPress={handleSave}>
            <Text style={styles.anxietySaveBtnText}>저장</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// MoodCard
// ---------------------------------------------------------------------------

const MOOD_LEVELS = ["최악", "별로", "그냥 그래", "좋아", "최고"] as const;
const MOOD_EMOJIS = ["😔", "😕", "🌤️", "😊", "🌈"] as const;

function MoodCard({
  isToday,
  step,
  onStepChange,
  symptomLogs,
}: {
  isToday: boolean;
  step: number;
  onStepChange: (step: number) => void;
  symptomLogs: SymptomLog[];
}) {
  const trackWidth = useRef(0);
  const [activeSymptom, setActiveSymptom] = useState<string | null>(null);

  const label = MOOD_LEVELS[step];
  const emoji = MOOD_EMOJIS[step];
  const value = step / (MOOD_LEVELS.length - 1);

  const snapToStep = (x: number) => {
    if (trackWidth.current <= 0) return;
    const ratio = Math.max(0, Math.min(1, x / trackWidth.current));
    onStepChange(Math.round(ratio * (MOOD_LEVELS.length - 1)));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => snapToStep(evt.nativeEvent.locationX),
      onPanResponderMove: (evt) => snapToStep(evt.nativeEvent.locationX),
    }),
  ).current;

  return (
    <View style={styles.moodCard}>
      <Text style={styles.moodTitle}>
        {isToday ? "오늘 기분이 어때요?" : "이날 기분이 어땠나요?"}
      </Text>
      <Text style={styles.moodEmoji}>{emoji}</Text>
      <View
        style={styles.moodTrackWrap}
        onLayout={(e) => {
          trackWidth.current = e.nativeEvent.layout.width;
        }}
        {...panResponder.panHandlers}
      >
        <View style={styles.moodTrack}>
          <View style={[styles.moodFill, { width: `${value * 100}%` }]} />
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.moodSnapDot,
                { left: `${(i / 4) * 100}%`, marginLeft: -5 },
                i <= step && styles.moodSnapDotFilled,
              ]}
            />
          ))}
          <View
            style={[
              styles.moodThumb,
              { left: `${value * 100}%`, marginLeft: -15 },
            ]}
          />
        </View>
      </View>
      <Text style={styles.moodLabel}>{label}</Text>

      <View style={styles.moodDivider} />

      <View style={styles.dayRecordBox}>
        <Text style={styles.dayRecordTitle}>이날 증상 기록</Text>
        {symptomLogs.length > 0 ? (
          symptomLogs.slice(0, 2).map((log) => (
            <Text key={log.id} style={styles.dayRecordText} numberOfLines={1}>
              {log.symptom} · 강도 {log.level}/5
              {log.memo ? ` · ${log.memo}` : ""}
            </Text>
          ))
        ) : (
          <Text style={styles.dayRecordTextMuted}>
            이 날짜에 기록된 증상이 없어요.
          </Text>
        )}
      </View>

      <View style={styles.moodAvatarRow}>
        {([
          { label: "불안", emoji: "🌀" },
          { label: "우울", emoji: "🌧️" },
          { label: "강박", emoji: "⚡" },
        ] as const).map(({ label: btnLabel, emoji }) => (
          <Pressable
            key={btnLabel}
            style={styles.moodAvatarBtn}
            onPress={() => setActiveSymptom(btnLabel)}
          >
            <View style={styles.moodAvatarCircle}>
              <Text style={styles.moodAvatarEmoji}>{emoji}</Text>
            </View>
            <Text style={styles.moodAvatarLabel}>{btnLabel}</Text>
          </Pressable>
        ))}
      </View>
      <SymptomSheet symptom={activeSymptom} onClose={() => setActiveSymptom(null)} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// SleepCard
// ---------------------------------------------------------------------------

type TimeOfDay = "아침" | "점심" | "저녁" | "취침전" | "수시";

const SLEEP_QUALITY = [
  { emoji: "😣", label: "나쁨" },
  { emoji: "😐", label: "보통" },
  { emoji: "🙂", label: "좋음" },
  { emoji: "😴", label: "푹잠" },
] as const;

function SleepCard({
  sleep,
  hasRecord,
  onChange,
}: {
  sleep: SleepDraft;
  hasRecord: boolean;
  onChange: (patch: Partial<SleepDraft>) => void;
}) {
  const { bedTime, wakeTime, quality } = sleep;

  const duration = (() => {
    const [bh, bm] = bedTime.split(":").map(Number);
    const [wh, wm] = wakeTime.split(":").map(Number);
    const bedMins = bh * 60 + bm;
    const wakeMins = wh * 60 + wm;
    const diff = wakeMins >= bedMins ? wakeMins - bedMins : 1440 - bedMins + wakeMins;
    return `${Math.floor(diff / 60)}시간 ${diff % 60 > 0 ? `${diff % 60}분` : ""}`.trim();
  })();

  return (
    <View style={styles.sleepCard}>
      <View style={styles.sleepCardHeader}>
        <Text style={styles.sleepCardTitle}>😴  수면 기록</Text>
        <Text style={styles.sleepDuration}>{duration}</Text>
      </View>
      <Text style={styles.sleepRecordHint}>
        {hasRecord ? "선택한 날짜의 수면 기록" : "이 날짜의 수면 기록을 입력해 주세요."}
      </Text>
      <View style={styles.sleepTimeRow}>
        <View style={styles.sleepTimeBlock}>
          <Text style={styles.sleepTimeLabel}>취침</Text>
          <TextInput
            value={bedTime}
            onChangeText={(value) => onChange({ bedTime: value })}
            style={styles.sleepTimeInput}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={styles.sleepTimeDivider} />
        <View style={styles.sleepTimeBlock}>
          <Text style={styles.sleepTimeLabel}>기상</Text>
          <TextInput
            value={wakeTime}
            onChangeText={(value) => onChange({ wakeTime: value })}
            style={styles.sleepTimeInput}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </View>

      <Text style={styles.sleepQualityTitle}>수면의 질</Text>
      <View style={styles.sleepQualityRow}>
        {SLEEP_QUALITY.map(({ emoji, label }, i) => {
          const active = quality === i;
          return (
            <Pressable
              key={label}
              style={[styles.sleepQualityBtn, active && styles.sleepQualityBtnActive]}
              onPress={() => onChange({ quality: i })}
            >
              <Text style={styles.sleepQualityEmoji}>{emoji}</Text>
              <Text style={[styles.sleepQualityLabel, active && styles.sleepQualityLabelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// TimeOfDayCard
// ---------------------------------------------------------------------------

function TimeOfDayCard({
  selectedDate,
  onOpenMedicationInfo,
}: {
  selectedDate: string;
  onOpenMedicationInfo: (medication: DailyMedicationInfo) => void;
}) {
  const [selected, setSelected] = useState<TimeOfDay>("아침");
  const options: TimeOfDay[] = ["아침", "점심", "저녁", "취침전", "수시"];

  const scheduledMeds = [
    { name: "아리피졸정 1mg", qty: 0.5 },
    { name: "인데놀정 10mg", qty: 1 },
    { name: "메녹틸정 20mg", qty: 1 },
    { name: "자나팜정 0.25mg", qty: 0.5 },
  ];
  // 수시 탭: 필요 시 복용하는 약만 표시
  const asNeededMeds = [{ name: "자나팜정 0.25mg", qty: 0.5 }];
  const medications = selected === "수시" ? asNeededMeds : scheduledMeds;
  const [checkedByDate, setCheckedByDate] = useState<Record<string, Record<string, boolean>>>({});

  const toggle = (med: string) =>
    setCheckedByDate((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] ?? {}),
        [med]: !(prev[selectedDate]?.[med] ?? false),
      },
    }));

  return (
    <View style={styles.timeOfDayCard}>
      <View style={styles.timeOfDaySegment}>
        {options.map((option) => (
          <Pressable
            key={option}
            style={[styles.timeOfDayBtn, selected === option && styles.timeOfDayBtnActive]}
            onPress={() => setSelected(option)}
          >
            <Text style={[styles.timeOfDayLabel, selected === option && styles.timeOfDayLabelActive]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.timeOfDayMedList}>
        {medications.map(({ name, qty }, i) => {
          const done = !!checkedByDate[selectedDate]?.[name];
          return (
            <View
              key={name}
              style={[
                styles.timeOfDayMedRow,
                i < medications.length - 1 && styles.timeOfDayMedRowBorder,
              ]}
            >
              <Pressable
                style={[styles.medCheckCircle, done && styles.medCheckCircleDone]}
                onPress={() => toggle(name)}
              >
                {done ? <Text style={styles.medCheckMark}>✓</Text> : null}
              </Pressable>
              <Text style={[styles.timeOfDayMedText, done && styles.timeOfDayMedTextDone]}>
                {name}
              </Text>
              <Text style={[styles.timeOfDayMedQty, done && styles.timeOfDayMedTextDone]}>
                {qty}정
              </Text>
              <Pressable
                style={styles.medInfoButton}
                onPress={() => {
                  const MED_DB: Record<string, Omit<DailyMedicationInfo, "quantity" | "schedule">> = {
                    "아리피졸정 1mg": {
                      name: "아리피졸정", englishName: "Aripiprazole", brandName: "아빌리파이",
                      ingredient: "아리피프라졸", category: "비정형 항정신병약",
                      dose: "1mg · 하루 1회", isActive: true,
                      purpose: "항정신병약",
                      description: "도파민과 세로토닌 수용체에 작용해 조현병, 양극성 장애, 우울증 보조치료에 쓰이는 약이에요.",
                      sideEffects: [
                        { emoji: "😴", name: "졸림", freq: "흔함", myCount: 5 },
                        { emoji: "🤢", name: "메스꺼움", freq: "흔함" },
                        { emoji: "🤕", name: "두통", freq: "흔함" },
                        { emoji: "😰", name: "불안", freq: "가끔" },
                      ],
                      caution: "임의로 중단하지 마세요(서서히 감량). 효과는 보통 2~4주 후 나타나며, 복용 중 음주는 피하세요.",
                    },
                    "인데놀정 10mg": {
                      name: "인데놀정", englishName: "Propranolol", brandName: "인데놀",
                      ingredient: "프로프라놀롤 염산염", category: "베타차단제",
                      dose: "10mg · 하루 1회", isActive: true,
                      purpose: "항불안 보조",
                      description: "베타수용체를 차단해 심박수를 낮추고 신체적 불안 증상(떨림, 두근거림)을 완화하는 약이에요.",
                      sideEffects: [
                        { emoji: "😴", name: "피로감", freq: "흔함", myCount: 3 },
                        { emoji: "🥶", name: "손발 냉감", freq: "흔함" },
                        { emoji: "💤", name: "수면장애", freq: "가끔" },
                        { emoji: "😵", name: "어지러움", freq: "가끔" },
                      ],
                      caution: "갑자기 복용을 중단하면 심박수가 급상승할 수 있어요. 반드시 의사와 상담 후 감량하세요.",
                    },
                    "메녹틸정 20mg": {
                      name: "메녹틸정", englishName: "Tianeptine", brandName: "메녹틸",
                      ingredient: "티아넵틴 나트륨", category: "비정형 항우울제",
                      dose: "20mg · 하루 3회", isActive: true,
                      purpose: "항우울제",
                      description: "글루타메이트 시스템에 작용해 우울증 및 불안 증상을 개선하는 약이에요.",
                      sideEffects: [
                        { emoji: "🤢", name: "메스꺼움", freq: "흔함", myCount: 2 },
                        { emoji: "😴", name: "졸림", freq: "흔함" },
                        { emoji: "💧", name: "입마름", freq: "가끔" },
                        { emoji: "🤕", name: "두통", freq: "가끔" },
                      ],
                      caution: "식사와 함께 복용하면 위장 불편이 줄어들어요. 알코올과 함께 복용하지 마세요.",
                    },
                    "자나팜정 0.25mg": {
                      name: "자나팜정", englishName: "Alprazolam", brandName: "자낙스",
                      ingredient: "알프라졸람", category: "벤조디아제핀계",
                      dose: "0.25mg · 필요 시", isActive: true,
                      purpose: "항불안제",
                      description: "GABA 수용체에 작용해 불안과 긴장을 빠르게 완화하는 약이에요.",
                      sideEffects: [
                        { emoji: "😴", name: "졸림", freq: "매우 흔함", myCount: 9 },
                        { emoji: "💤", name: "기억력 저하", freq: "흔함" },
                        { emoji: "😵", name: "어지러움", freq: "흔함" },
                        { emoji: "🧠", name: "의존성", freq: "장기복용 시" },
                      ],
                      caution: "의존성이 생길 수 있어 장기 복용은 피하세요. 운전 전 복용은 삼가고, 음주와 함께 복용하지 마세요.",
                    },
                  };
                  const base = MED_DB[name] ?? {
                    name, englishName: "", brandName: "", ingredient: "정보 없음",
                    category: "정보 없음", dose: name.replace(/.*\s/, ""),
                    isActive: true, purpose: "복용 중인 약",
                    description: "약 설명이 없습니다.", sideEffects: [], caution: "",
                  };
                  onOpenMedicationInfo({ ...base, quantity: `${qty}정`, schedule: selected });
                }}
                accessibilityRole="button"
                accessibilityLabel="약 정보 보기"
              >
                <Pill
                  color={done ? "#C5C3E0" : "#4025E8"}
                  size={18}
                  strokeWidth={2.2}
                />
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// HomeScreen (exported)
// ---------------------------------------------------------------------------

export function HomeScreen({
  data,
  openModal,
  onSaveMood,
  onSaveSleep,
  onOpenMedicationInfo,
  onOpenNotifications,
}: {
  data: PsycheData;
  openModal: (kind: Exclude<ModalKind, null>) => void;
  onSaveMood: (date: string, level: number) => void;
  onSaveSleep: (date: string, sleep: SleepDraft) => void;
  onOpenMedicationInfo: (medication: DailyMedicationInfo) => void;
  onOpenNotifications?: () => void;
}) {
  const today = todayISOUtil();
  const [selectedDate, setSelectedDate] = useState(today);
  const appointmentVisit = useMemo(() => {
    const visitsWithAppointment = data.visits
      .flatMap((visit) =>
        visit.nextAppointment
          ? [
              {
                hospitalName: visit.hospitalName,
                doctorName: visit.doctorName,
                appointment: visit.nextAppointment,
              },
            ]
          : [],
      )
      .sort((a, b) => a.appointment.date.localeCompare(b.appointment.date));

    return visitsWithAppointment.find(
      ({ appointment }) => appointment.date >= today,
    );
  }, [data.visits]);
  const appointmentHospital = appointmentVisit?.hospitalName ?? "온유 정신건강의학과";
  const appointmentDoctor = appointmentVisit?.doctorName?.trim() ?? "";
  const appointment = appointmentVisit?.appointment ?? latestAppointment(data);
  const weekDays = useMemo(() => buildWeekStrip(), []);
  const selectedMoodLog = (data.moodLogs ?? []).find(
    (log) => log.date === selectedDate,
  );
  const selectedSleepLog = (data.sleepLogs ?? []).find(
    (log) => log.date === selectedDate,
  );
  const selectedMoodStep = selectedMoodLog?.level ?? 2;
  const selectedSleep = selectedSleepLog ?? DEFAULT_SLEEP_DRAFT;
  const selectedSleepHasRecord = Boolean(selectedSleepLog);
  const selectedDateSymptomLogs = useMemo(
    () => data.symptomLogs.filter((log) => log.date === selectedDate),
    [data.symptomLogs, selectedDate],
  );
  const updateSelectedSleep = (patch: Partial<SleepDraft>) => {
    onSaveSleep(selectedDate, {
      bedTime: selectedSleep.bedTime,
      wakeTime: selectedSleep.wakeTime,
      quality: selectedSleep.quality,
      ...patch,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.homeContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.morningHeader}>
        <View style={styles.morningTopRow}>
          <View style={styles.headerBrand}>
            <ButterflyIcon color="#4025E8" />
          </View>
          <View style={styles.headerBrandSpacer} />
          <Pressable
            style={styles.notificationButton}
            onPress={onOpenNotifications}
          >
            <Bell color="#20212B" size={20} strokeWidth={2.6} />
          </Pressable>
        </View>
        <Text style={styles.morningTitle}>{formatHomeTitle(selectedDate)}</Text>
        <View style={styles.weekStrip}>
          {weekDays.map((day) => (
            <Pressable
              key={day.key}
              style={[
                styles.weekItem,
                day.date === selectedDate && styles.weekItemActive,
              ]}
              onPress={() => setSelectedDate(day.date)}
            >
              <Text
                style={[
                  styles.weekName,
                  day.date === selectedDate && styles.weekNameActive,
                ]}
              >
                {day.name}
              </Text>
              <Text
                style={[
                  styles.weekNumber,
                  day.date === selectedDate && styles.weekNumberActive,
                ]}
              >
                {day.day}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <MoodCard
        isToday={selectedDate === today}
        step={selectedMoodStep}
        onStepChange={(step) => onSaveMood(selectedDate, step)}
        symptomLogs={selectedDateSymptomLogs}
      />

      <SleepCard
        sleep={selectedSleep}
        hasRecord={selectedSleepHasRecord}
        onChange={updateSelectedSleep}
      />

      <TimeOfDayCard
        selectedDate={selectedDate}
        onOpenMedicationInfo={onOpenMedicationInfo}
      />

      <Pressable
        style={styles.nextVisitCard}
        onPress={() => openModal("visit")}
      >
        <View style={styles.nextVisitHeader}>
          <View style={styles.nextVisitTitleBlock}>
            <View style={styles.nextVisitTitleRow}>
              <Hospital color="#20212B" size={20} strokeWidth={2.4} />
              <Text style={styles.nextVisitHospital}>다음 진료 일정</Text>
            </View>
          </View>
          {appointment && (
            <View style={styles.nextVisitDdayBadge}>
              <Text style={styles.nextVisitDdayText}>
                D-{Math.max(daysUntil(appointment.date), 0)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.nextVisitInfoList}>
          <View style={styles.nextVisitInfoRow}>
            <Clock color="#9A9AA7" size={15} strokeWidth={2.4} />
            <Text style={styles.nextVisitInfoText}>
              <Text style={styles.nextVisitInfoMuted}>
                {appointment ? `${toDotMonthDay(appointment.date)} · ` : ""}
              </Text>
              <Text style={styles.nextVisitInfoStrong}>
                {appointment?.time ?? "미정"}
              </Text>
            </Text>
          </View>
          <View style={styles.nextVisitInfoRow}>
            <MapPin color="#9A9AA7" size={15} strokeWidth={2.4} />
            <Text style={styles.nextVisitInfoText}>
              {appointmentHospital}
              {appointmentDoctor ? ` · ${appointmentDoctor} 원장` : ""}
            </Text>
          </View>
        </View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  homeContent: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 122,
    gap: 14,
  },
  morningHeader: {
    minHeight: 116,
    paddingHorizontal: 10,
  },
  morningTopRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  headerBrand: {
    width: 36,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerBrandSpacer: {
    flex: 1,
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  morningTitle: {
    color: "#20212B",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    letterSpacing: 0,
    textAlign: "center",
    marginTop: 8,
  },
  weekStrip: {
    marginTop: 12,
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weekItem: {
    width: 34,
    height: 46,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  weekItemActive: {
    backgroundColor: "#4025E8",
  },
  weekName: {
    color: "#B2B3BA",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "500",
  },
  weekNameActive: {
    color: "#fff",
    fontWeight: "700",
  },
  weekNumber: {
    color: "#B2B3BA",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "500",
  },
  weekNumberActive: {
    color: "#fff",
    fontWeight: "800",
  },
  moodCard: {
    borderRadius: 24,
    backgroundColor: "#FAF9FD",
    borderWidth: 1,
    borderColor: "#E1E0EE",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
    shadowColor: "#4025E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  moodTitle: {
    color: "#20212B",
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0,
  },
  moodEmoji: {
    fontSize: 56,
    marginTop: 10,
    marginBottom: 12,
    textAlign: "center",
  },
  moodTrackWrap: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  moodTrack: {
    width: "100%",
    height: 5,
    borderRadius: 3,
    backgroundColor: "#DDD9F8",
    justifyContent: "center",
  },
  moodFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#4025E8",
  },
  moodSnapDot: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#DDD9F8",
    top: -2,
  },
  moodSnapDotFilled: {
    backgroundColor: "#4025E8",
  },
  moodThumb: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    top: -12.5,
    borderWidth: 3.5,
    borderColor: "#4025E8",
    shadowColor: "#4025E8",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  moodLabel: {
    color: "#4025E8",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
    textAlign: "center",
  },
  moodDivider: {
    height: 1,
    backgroundColor: "#E1E0EE",
    width: "100%",
    marginTop: 20,
    marginBottom: 16,
  },
  dayRecordBox: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECEAF6",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 5,
  },
  dayRecordTitle: {
    color: "#20212B",
    fontSize: 13,
    fontWeight: "800",
  },
  dayRecordText: {
    color: "#626675",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  dayRecordTextMuted: {
    color: "#9A9DAA",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  moodAvatarRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 4,
  },
  moodAvatarBtn: {
    alignItems: "center",
    gap: 8,
  },
  moodAvatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EEEDF8",
    alignItems: "center",
    justifyContent: "center",
  },
  moodAvatarEmoji: {
    fontSize: 24,
  },
  moodAvatarLabel: {
    color: "#20212B",
    fontSize: 13,
    fontWeight: "700",
  },
  sleepCard: {
    borderRadius: 24,
    backgroundColor: "#FAF9FD",
    borderWidth: 1,
    borderColor: "#E1E0EE",
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: "#4025E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  sleepCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sleepCardTitle: {
    color: "#20212B",
    fontSize: 17,
    fontWeight: "800",
  },
  sleepDuration: {
    color: "#4025E8",
    fontSize: 16,
    fontWeight: "800",
  },
  sleepRecordHint: {
    color: "#9096A2",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: -8,
    marginBottom: 14,
  },
  sleepTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sleepTimeBlock: {
    flex: 1,
    backgroundColor: "#EEEDF8",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  sleepTimeLabel: {
    color: "#9096A2",
    fontSize: 12,
    fontWeight: "700",
  },
  sleepTimeInput: {
    color: "#20212B",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  sleepTimeDivider: {
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#C5C3E0",
  },
  sleepQualityTitle: {
    color: "#9096A2",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 10,
  },
  sleepQualityRow: {
    flexDirection: "row",
    gap: 8,
  },
  sleepQualityBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E1E0EE",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    alignItems: "center",
    gap: 4,
  },
  sleepQualityBtnActive: {
    borderColor: "#4025E8",
    backgroundColor: "#EEEDF8",
  },
  sleepQualityEmoji: {
    fontSize: 22,
  },
  sleepQualityLabel: {
    color: "#9096A2",
    fontSize: 12,
    fontWeight: "700",
  },
  sleepQualityLabelActive: {
    color: "#4025E8",
    fontWeight: "800",
  },
  nextVisitCard: {
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E0EE",
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: "#4025E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  nextVisitHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  nextVisitTitleBlock: {
    flex: 1,
    gap: 7,
  },
  nextVisitTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nextVisitHospital: {
    color: "#20212B",
    fontSize: 17,
    fontWeight: "800",
  },
  nextVisitInfoList: {
    marginTop: 14,
    gap: 8,
  },
  nextVisitInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  nextVisitInfoText: {
    flex: 1,
    color: "#6F7280",
    fontSize: 13,
    fontWeight: "600",
  },
  nextVisitInfoMuted: {
    color: "#8F92A0",
    fontWeight: "600",
  },
  nextVisitInfoStrong: {
    color: "#4025E8",
    fontWeight: "800",
  },
  nextVisitDdayBadge: {
    minHeight: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: "#EEEDF8",
    alignItems: "center",
    justifyContent: "center",
  },
  nextVisitDdayText: {
    color: "#4025E8",
    fontSize: 14,
    fontWeight: "800",
  },
  timeOfDayCard: {
    borderRadius: 24,
    backgroundColor: "#FAF9FD",
    borderWidth: 1,
    borderColor: "#E1E0EE",
    padding: 12,
    shadowColor: "#4025E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  timeOfDaySegment: {
    flexDirection: "row",
    backgroundColor: "#EEEDF8",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  timeOfDayBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  timeOfDayBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  timeOfDayLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9096A2",
  },
  timeOfDayLabelActive: {
    color: "#4025E8",
    fontWeight: "800",
  },
  timeOfDayMedList: {
    marginTop: 12,
  },
  timeOfDayMedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  timeOfDayMedRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  medCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#C5C3E0",
    alignItems: "center",
    justifyContent: "center",
  },
  medCheckCircleDone: {
    backgroundColor: "#4025E8",
    borderColor: "#4025E8",
  },
  medCheckMark: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  timeOfDayMedText: {
    flex: 1,
    color: "#20212B",
    fontSize: 15,
    fontWeight: "600",
  },
  timeOfDayMedTextDone: {
    color: "#B0B3BE",
    textDecorationLine: "line-through",
  },
  timeOfDayMedQty: {
    color: "#9096A2",
    fontSize: 13,
    fontWeight: "700",
    marginRight: 4,
  },
  medInfoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(16, 24, 32, 0.45)",
    justifyContent: "flex-end",
  },
  symptomSheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(16, 24, 32, 0.45)",
  },
  anxietySheet: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  anxietySheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD",
    alignSelf: "center",
    marginBottom: 16,
  },
  anxietySheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  anxietySheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  anxietySheetClose: {
    fontSize: 18,
    color: "#999",
  },
  anxietySheetSectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    marginTop: 4,
  },
  anxietyIntensityRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  anxietyIntensityBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E1E0EE",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7FB",
  },
  anxietyIntensityBtnActive: {
    borderColor: "#4025E8",
    backgroundColor: "#EBE8FD",
  },
  anxietyIntensityNum: {
    fontSize: 16,
    fontWeight: "700",
    color: "#999",
  },
  anxietyIntensityNumActive: {
    color: "#4025E8",
  },
  anxietyIntensityScale: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  anxietyScaleLabel: {
    fontSize: 11,
    color: "#aaa",
  },
  anxietyInput: {
    borderWidth: 1,
    borderColor: "#E1E0EE",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1a1a2e",
    backgroundColor: "#F7F7FB",
    marginBottom: 14,
  },
  anxietyInputMulti: {
    height: 80,
    textAlignVertical: "top",
  },
  anxietySaveBtn: {
    backgroundColor: "#4025E8",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  anxietySaveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
