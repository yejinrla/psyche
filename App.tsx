import { StatusBar } from "expo-status-bar";
import React, { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Activity,
  AlertTriangle,
  Bell,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  FileText,
  GitBranch,
  HeartPulse,
  Home,
  Hospital,
  MessageSquare,
  MoreHorizontal,
  Pill,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Stethoscope,
  TrendingUp,
  X,
} from "lucide-react-native";
import Svg, { Ellipse, Path, Polyline } from "react-native-svg";

import {
  sideEffectOptions,
  symptomOptions,
  theme,
  visitOutcomeOptions,
} from "./src/constants";
import {
  usePsycheData,
  type PsycheDataActions,
} from "./src/hooks/usePsycheData";
import type {
  PsycheData,
  Rating,
  SideEffectType,
  SymptomType,
  TimelineItem,
  VisitOutcome,
} from "./src/types";
import {
  activeMedications,
  buildTimeline,
  generateVisitPrepSummary,
  latestAppointment,
  recentSymptomAverage,
  sideEffectFrequency,
  symptomFrequency,
  symptomTrendLabel,
  treatmentDays,
  treatmentStartDate,
} from "./src/utils/analytics";
import {
  daysBetween,
  daysUntil,
  formatFullDate,
  formatShortDate,
  isWithinDays,
  sortByDateAsc,
  sortByDateDesc,
  todayISO,
} from "./src/utils/date";

type IconComponent = React.ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

type TabKey = "home" | "records" | "medications" | "timeline" | "report";
type ModalKind =
  | "visit"
  | "symptom"
  | "sideEffect"
  | "question"
  | "medication"
  | "effect"
  | null;

const tabs: { key: TabKey; label: string; icon: IconComponent }[] = [
  { key: "home", label: "홈", icon: Home },
  { key: "timeline", label: "타임라인", icon: GitBranch },
  { key: "records", label: "기록", icon: Plus },
  { key: "medications", label: "약물", icon: Pill },
  { key: "report", label: "더보기", icon: MoreHorizontal },
];

const ratings: Rating[] = [1, 2, 3, 4, 5];

export default function App() {
  const actions = usePsycheData();
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [modalKind, setModalKind] = useState<ModalKind>(null);

  const timeline = useMemo(() => buildTimeline(actions.data), [actions.data]);

  const openModal = (kind: Exclude<ModalKind, null>) => setModalKind(kind);

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen data={actions.data} openModal={openModal} />;
      case "records":
        return <RecordsScreen data={actions.data} openModal={openModal} />;
      case "medications":
        return <MedicationScreen data={actions.data} openModal={openModal} />;
      case "timeline":
        return <TimelineScreen timeline={timeline} />;
      case "report":
        return (
          <ReportScreen
            data={actions.data}
            openModal={openModal}
            resetDemoData={actions.resetDemoData}
            toggleQuestion={actions.toggleQuestion}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        {activeTab !== "home" && activeTab !== "timeline" ? <AppHeader openModal={openModal} /> : null}
        <View style={styles.screen}>{renderScreen()}</View>
        <TabBar activeTab={activeTab} onChange={setActiveTab} />
      </View>
      <EntryModal
        kind={modalKind}
        actions={actions}
        onClose={() => setModalKind(null)}
      />
    </SafeAreaView>
  );
}

function AppHeader({
  openModal,
}: {
  openModal: (kind: Exclude<ModalKind, null>) => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.brandBlock}>
        <View style={styles.brandMark}>
          <Brain color={theme.teal} size={24} strokeWidth={2.4} />
        </View>
        <View>
          <Text style={styles.brandName}>Psyche</Text>
          <Text style={styles.brandCaption}>정신건강 치료 기록장</Text>
        </View>
      </View>
      <Pressable
        style={styles.headerAction}
        onPress={() => openModal("symptom")}
      >
        <Plus color={theme.surface} size={18} strokeWidth={2.5} />
        <Text style={styles.headerActionText}>기록</Text>
      </Pressable>
    </View>
  );
}

function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <View style={styles.tabBar}>
      {tabs.map(({ key, label, icon: Icon }) => {
        const selected = activeTab === key;
        const isCenter = key === "records";

        return (
          <Pressable
            key={key}
            style={[
              styles.tabItem,
              isCenter && styles.tabItemCenter,
              selected && !isCenter && styles.tabItemActive,
            ]}
            onPress={() => onChange(key)}
          >
            <View style={isCenter ? styles.centerTabButton : undefined}>
              <Icon
                color={
                  isCenter ? theme.surface : selected ? "#4025E8" : theme.muted
                }
                size={isCenter ? 30 : 21}
                strokeWidth={isCenter ? 2.6 : 2.3}
              />
            </View>
            <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function HomeScreen({
  data,
  openModal,
}: {
  data: PsycheData;
  openModal: (kind: Exclude<ModalKind, null>) => void;
}) {
  const activeMeds = activeMedications(data.medications);
  const appointmentVisit = useMemo(() => {
    const visitsWithAppointment = data.visits
      .flatMap((visit) =>
        visit.nextAppointment
          ? [
              {
                hospitalName: visit.hospitalName,
                appointment: visit.nextAppointment,
              },
            ]
          : [],
      )
      .sort((a, b) => a.appointment.date.localeCompare(b.appointment.date));

    return visitsWithAppointment.find(
      ({ appointment }) => appointment.date >= todayISO(),
    );
  }, [data.visits]);
  const appointment = appointmentVisit?.appointment ?? latestAppointment(data);
  const symptomValues = sortByDateAsc(data.symptomLogs)
    .slice(-5)
    .map((log) => log.level);
  const weekDays = useMemo(() => buildWeekStrip(), []);

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
          <Pressable style={styles.notificationButton}>
            <Bell color="#20212B" size={20} strokeWidth={2.6} />
          </Pressable>
        </View>
        <Text style={styles.morningTitle}>TODAY</Text>
        <View style={styles.weekStrip}>
          {weekDays.map((day) => (
            <View
              key={day.key}
              style={[styles.weekItem, day.isToday && styles.weekItemActive]}
            >
              <Text
                style={[styles.weekName, day.isToday && styles.weekNameActive]}
              >
                {day.name}
              </Text>
              <Text
                style={[
                  styles.weekNumber,
                  day.isToday && styles.weekNumberActive,
                ]}
              >
                {day.day}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <MoodCard />

      <SleepCard />

      <TimeOfDayCard />

      <Pressable
        style={styles.checkMiniCardFull}
        onPress={() => openModal("visit")}
      >
        <CalendarDays color="#4025E8" size={28} strokeWidth={2.3} />
        <Text style={styles.miniCardTitle}>다음 진료</Text>
        <Text style={styles.miniCardMeta}>
          {appointment
            ? `${toDotMonthDay(appointment.date)} · d-${Math.max(daysUntil(appointment.date), 0)}`
            : "일정 없음"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const MOOD_LEVELS = ["최악", "별로", "그냥 그래", "좋아", "최고"] as const;
const MOOD_EMOJIS = ["😔", "😕", "🌤️", "😊", "🌈"] as const;

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
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
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
    </Modal>
  );
}

function MoodCard() {
  const [step, setStep] = useState(2);
  const trackWidth = useRef(0);
  const [activeSymptom, setActiveSymptom] = useState<string | null>(null);

  const label = MOOD_LEVELS[step];
  const emoji = MOOD_EMOJIS[step];
  const value = step / (MOOD_LEVELS.length - 1);

  const snapToStep = (x: number) => {
    if (trackWidth.current <= 0) return;
    const ratio = Math.max(0, Math.min(1, x / trackWidth.current));
    setStep(Math.round(ratio * (MOOD_LEVELS.length - 1)));
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
      <Text style={styles.moodTitle}>오늘 기분이 어때요?</Text>
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
              { left: `${value * 100}%`, marginLeft: -13 },
            ]}
          />
        </View>
      </View>
      <Text style={styles.moodLabel}>{label}</Text>

      <View style={styles.moodDivider} />

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

type TimeOfDay = "아침" | "점심" | "저녁" | "취침전";

const SLEEP_QUALITY = [
  { emoji: "😣", label: "나쁨" },
  { emoji: "😐", label: "보통" },
  { emoji: "🙂", label: "좋음" },
  { emoji: "😴", label: "푹잠" },
] as const;

function SleepCard() {
  const [bedTime, setBedTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [quality, setQuality] = useState<number | null>(null);

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
      <View style={styles.sleepTimeRow}>
        <View style={styles.sleepTimeBlock}>
          <Text style={styles.sleepTimeLabel}>취침</Text>
          <TextInput
            value={bedTime}
            onChangeText={setBedTime}
            style={styles.sleepTimeInput}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={styles.sleepTimeDivider} />
        <View style={styles.sleepTimeBlock}>
          <Text style={styles.sleepTimeLabel}>기상</Text>
          <TextInput
            value={wakeTime}
            onChangeText={setWakeTime}
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
              onPress={() => setQuality(i)}
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

function TimeOfDayCard() {
  const [selected, setSelected] = useState<TimeOfDay>("아침");
  const options: TimeOfDay[] = ["아침", "점심", "저녁", "취침전"];

  const medications = [
    { name: "아리피졸정 1mg", qty: 0.5 },
    { name: "인데놀정 10mg", qty: 1 },
    { name: "메녹틸정 20mg", qty: 1 },
    { name: "자나팜정 0.25mg", qty: 0.5 },
  ];
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (med: string) =>
    setChecked((prev) => ({ ...prev, [med]: !prev[med] }));

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
          const done = !!checked[name];
          return (
            <Pressable
              key={name}
              style={[
                styles.timeOfDayMedRow,
                i < medications.length - 1 && styles.timeOfDayMedRowBorder,
              ]}
              onPress={() => toggle(name)}
            >
              <View style={[styles.medCheckCircle, done && styles.medCheckCircleDone]}>
                {done ? <Text style={styles.medCheckMark}>✓</Text> : null}
              </View>
              <Text style={[styles.timeOfDayMedText, done && styles.timeOfDayMedTextDone]}>
                {name}
              </Text>
              <Text style={[styles.timeOfDayMedQty, done && styles.timeOfDayMedTextDone]}>
                {qty}정
              </Text>
              <Pill color={done ? "#4025E8" : "#C5C3E0"} size={18} strokeWidth={2} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function StarRatingRow({ label, icon, desc }: { label: string; icon: string; desc: string }) {
  const [rating, setRating] = useState(0);

  return (
    <View style={styles.starRow}>
      <View style={styles.starRowLeft}>
        <View style={styles.starRowText}>
          <Text style={styles.starLabel}>{label}</Text>
          <Text style={styles.starDesc}>{desc}</Text>
        </View>
      </View>
      <View style={styles.starRowRight}>
        <View style={styles.starGroup}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              onPress={() => setRating(n)}
              style={[styles.ratingNumBtn, n <= rating && styles.ratingNumBtnSelected]}
            >
              <Text style={[styles.ratingNumText, n <= rating && styles.ratingNumTextSelected]}>{n}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.starScaleRow}>
          <Text style={styles.starScaleText}>없음</Text>
          <Text style={styles.starScaleText}>매우 심함</Text>
        </View>
      </View>
    </View>
  );
}

function buildWeekStrip() {
  const names = ["일", "월", "화", "수", "목", "금", "토"];
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());

  return names.map((name, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      key: `${name}-${date.toISOString()}`,
      name,
      day: String(date.getDate()).padStart(2, "0"),
      isToday: date.toDateString() === today.toDateString(),
    };
  });
}

function ButterflyIcon({ color }: { color: string }) {
  return (
    <Svg width={30} height={24} viewBox="0 0 30 24">
      <Ellipse
        cx={9.2}
        cy={8.2}
        rx={5.3}
        ry={6.2}
        fill={color}
        transform="rotate(-32 9.2 8.2)"
      />
      <Ellipse
        cx={20.8}
        cy={8.2}
        rx={5.3}
        ry={6.2}
        fill={color}
        transform="rotate(32 20.8 8.2)"
      />
      <Ellipse
        cx={9.8}
        cy={16.2}
        rx={4.1}
        ry={4.7}
        fill={color}
        opacity={0.9}
        transform="rotate(30 9.8 16.2)"
      />
      <Ellipse
        cx={20.2}
        cy={16.2}
        rx={4.1}
        ry={4.7}
        fill={color}
        opacity={0.9}
        transform="rotate(-30 20.2 16.2)"
      />
      <Path
        d="M15 7.6c1.3 1.7 1.3 6.6 0 8.4-1.3-1.8-1.3-6.7 0-8.4Z"
        fill="#20212B"
        opacity={0.88}
      />
    </Svg>
  );
}

function getMonthShort(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short" })
    .format(new Date(`${date}T00:00:00`))
    .toUpperCase();
}

function getDayNumber(date: string) {
  return String(new Date(`${date}T00:00:00`).getDate()).padStart(2, "0");
}

function toDotMonthDay(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return `${String(parsed.getMonth() + 1).padStart(2, "0")}.${String(parsed.getDate()).padStart(2, "0")}`;
}

function SymptomSparkline({
  values,
  compact,
}: {
  values: number[];
  compact?: boolean;
}) {
  const chartValues = values.length > 1 ? values : [4, 3, 3, 2, 2];
  const width = compact ? 142 : 128;
  const height = compact ? 72 : 48;
  const horizontalStep = width / Math.max(chartValues.length - 1, 1);
  const points = chartValues
    .map((value, index) => {
      const x = index * horizontalStep;
      const y = height - (value / 5) * (compact ? 46 : 38) - (compact ? 12 : 5);
      return `${x},${y}`;
    })
    .join(" ");
  const firstPoint = points.split(" ")[0];
  const fillPath = `M ${firstPoint} L ${points.split(" ").slice(1).join(" L ")} L ${width},${height} L 0,${height} Z`;

  return (
    <View style={styles.sparklineBox}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={fillPath} fill="#DFF1E6" />
        <Polyline
          points={points}
          fill="none"
          stroke="#18A45F"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

function RecordsScreen({
  data,
  openModal,
}: {
  data: PsycheData;
  openModal: (kind: Exclude<ModalKind, null>) => void;
}) {
  const [segment, setSegment] = useState<"visits" | "symptoms" | "sideEffects">(
    "visits",
  );
  const visits = sortByDateDesc(data.visits);
  const symptoms = sortByDateDesc(data.symptomLogs);
  const sideEffects = sortByDateDesc(data.sideEffectLogs);

  return (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <SectionHeader title="치료 기록" />
      <SegmentedControl
        value={segment}
        options={[
          { label: "방문", value: "visits" },
          { label: "증상", value: "symptoms" },
          { label: "부작용", value: "sideEffects" },
        ]}
        onChange={setSegment}
      />

      {segment === "visits" ? (
        <View style={styles.listStack}>
          <Pressable
            style={styles.fullWidthAction}
            onPress={() => openModal("visit")}
          >
            <Hospital color={theme.surface} size={19} strokeWidth={2.3} />
            <Text style={styles.fullWidthActionText}>병원 방문 기록 추가</Text>
          </Pressable>
          {visits.map((visit) => (
            <View key={visit.id} style={styles.recordPanel}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.itemTitle}>{visit.hospitalName}</Text>
                  <Text style={styles.itemMeta}>
                    {formatFullDate(visit.date)}
                  </Text>
                </View>
                <Text style={styles.costText}>
                  {visit.cost.toLocaleString("ko-KR")}원
                </Text>
              </View>
              <Text style={styles.recordBody}>{visit.notes}</Text>
              <View style={styles.chipRow}>
                {visit.outcomes.map((outcome) => (
                  <View key={outcome} style={styles.staticChip}>
                    <Text style={styles.staticChipText}>{outcome}</Text>
                  </View>
                ))}
              </View>
              {visit.nextAppointment ? (
                <View style={styles.appointmentLine}>
                  <Bell color={theme.blue} size={16} strokeWidth={2.2} />
                  <Text style={styles.itemMeta}>
                    다음 진료 {formatShortDate(visit.nextAppointment.date)}{" "}
                    {visit.nextAppointment.time}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {segment === "symptoms" ? (
        <View style={styles.listStack}>
          <Pressable
            style={styles.fullWidthAction}
            onPress={() => openModal("symptom")}
          >
            <Activity color={theme.surface} size={19} strokeWidth={2.3} />
            <Text style={styles.fullWidthActionText}>증상 기록 추가</Text>
          </Pressable>
          {symptoms.map((log) => (
            <View key={log.id} style={styles.recordPanel}>
              <View style={styles.rowBetween}>
                <Text style={styles.itemTitle}>{log.symptom}</Text>
                <RatingBadge rating={log.level} />
              </View>
              <Text style={styles.itemMeta}>{formatFullDate(log.date)}</Text>
              {log.situation ? (
                <Text style={styles.recordBody}>상황: {log.situation}</Text>
              ) : null}
              {log.memo ? (
                <Text style={styles.recordBody}>{log.memo}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {segment === "sideEffects" ? (
        <View style={styles.listStack}>
          <Pressable
            style={styles.fullWidthAction}
            onPress={() => openModal("sideEffect")}
          >
            <AlertTriangle color={theme.surface} size={19} strokeWidth={2.3} />
            <Text style={styles.fullWidthActionText}>부작용 기록 추가</Text>
          </Pressable>
          {sideEffects.map((log) => (
            <View key={log.id} style={styles.recordPanel}>
              <View style={styles.rowBetween}>
                <Text style={styles.itemTitle}>{log.effects.join(", ")}</Text>
                <RatingBadge rating={log.intensity} />
              </View>
              <Text style={styles.itemMeta}>{formatFullDate(log.date)}</Text>
              {log.memo ? (
                <Text style={styles.recordBody}>{log.memo}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

function MedicationScreen({
  data,
  openModal,
}: {
  data: PsycheData;
  openModal: (kind: Exclude<ModalKind, null>) => void;
}) {
  const activeMeds = activeMedications(data.medications);
  const archivedMeds = data.medications.filter(
    (medication) => medication.status === "archived",
  );
  const events = sortByDateDesc(data.medicationEvents);

  return (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <SectionHeader
        title="약물 관리"
        actionLabel="약 추가"
        onAction={() => openModal("medication")}
      />
      <View style={styles.listStack}>
        {activeMeds.map((medication) => (
          <View key={medication.id} style={styles.medPanel}>
            <View style={styles.rowBetweenTop}>
              <View style={styles.flex1}>
                <Text style={styles.itemTitle}>{medication.name}</Text>
                <Text style={styles.itemMeta}>{medication.purpose}</Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>복용 중</Text>
              </View>
            </View>
            <View style={styles.medDoseRow}>
              <InfoPill label={medication.dose} />
              <InfoPill label={medication.frequency} />
              <InfoPill label={`${daysBetween(medication.startDate)}일차`} />
            </View>
            {medication.memo ? (
              <Text style={styles.recordBody}>{medication.memo}</Text>
            ) : null}
          </View>
        ))}
      </View>

      <SectionHeader title="약물 히스토리" />
      <View style={styles.timelinePanel}>
        {events.map((event, index) => (
          <TimelineEventRow
            key={event.id}
            item={{
              id: event.id,
              date: event.date,
              title: event.title,
              description: event.description,
              type: "medication",
              accent: theme.teal,
            }}
            isLast={index === events.length - 1}
          />
        ))}
      </View>

      <SectionHeader title="과거 복용 약" />
      <View style={styles.listStack}>
        {archivedMeds.map((medication) => (
          <View key={medication.id} style={styles.archivedRow}>
            <View>
              <Text style={styles.itemTitle}>{medication.name}</Text>
              <Text style={styles.itemMeta}>
                {medication.startDate} ~ {medication.endDate ?? "미정"}
              </Text>
            </View>
            <Text style={styles.itemMeta}>{medication.memo}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const TIMELINE_FILTERS = ["진료", "개선", "약 변경", "부작용"] as const;
type TimelineFilter = typeof TIMELINE_FILTERS[number];

function TimelineScreen({ timeline }: { timeline: TimelineItem[] }) {
  const weekDays = useMemo(() => buildWeekStrip(), []);
  const [activeFilter, setActiveFilter] = useState<TimelineFilter | null>(null);

  return (
    <ScrollView
      contentContainerStyle={styles.homeContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.morningHeader, { minHeight: 0 }]}>
        <View style={styles.morningTopRow}>
          <View style={styles.headerBrand}>
            <ButterflyIcon color="#4025E8" />
          </View>
          <View style={styles.headerBrandSpacer} />
          <Pressable style={styles.notificationButton}>
            <Bell color="#20212B" size={20} strokeWidth={2.6} />
          </Pressable>
        </View>
        <Text style={[styles.morningTitle, { textAlign: "left", marginTop: 2 }]}>치료 타임라인</Text>

        <View style={styles.tlSearchBar}>
          <Search color="#9096A2" size={16} strokeWidth={2.2} />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9096A2"
            style={styles.tlSearchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tlFilterRow}
        >
          {TIMELINE_FILTERS.map((filter) => {
            const active = activeFilter === filter;
            return (
              <Pressable
                key={filter}
                style={styles.tlFilterTab}
                onPress={() => setActiveFilter(active ? null : filter)}
              >
                <Text style={[styles.tlFilterTabText, active && styles.tlFilterTabTextActive]}>
                  {filter}
                </Text>
                {active ? <View style={styles.tlFilterTabUnderline} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.timelineCardList}>
        {Object.entries(
          timeline.reduce<Record<string, TimelineItem[]>>((acc, item) => {
            (acc[item.date] = acc[item.date] ?? []).push(item);
            return acc;
          }, {})
        ).map(([date, items]) => (
          <View key={date}>
            <Text style={styles.tlDateHeader}>
              {new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "long" }).format(new Date(`${date}T00:00:00`))}
            </Text>
            <View style={styles.tlGroup}>
              {items.map((item, index) => (
                <TimelineEventRow
                  key={item.id}
                  item={item}
                  isLast={index === items.length - 1}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function ReportScreen({
  data,
  openModal,
  resetDemoData,
  toggleQuestion,
}: {
  data: PsycheData;
  openModal: (kind: Exclude<ModalKind, null>) => void;
  resetDemoData: () => void;
  toggleQuestion: PsycheDataActions["toggleQuestion"];
}) {
  const summary = generateVisitPrepSummary(data);
  const symptoms = sortByDateAsc(data.symptomLogs).slice(-7);
  const effects = sortByDateAsc(data.effectLogs).slice(-5);
  const sideEffects = sideEffectFrequency(data, 30);
  const symptomCounts = symptomFrequency(data, 30);
  const activeMeds = activeMedications(data.medications);
  const startDate = treatmentStartDate(data);

  return (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <SectionHeader
        title="치료 리포트"
        actionLabel="효과 기록"
        onAction={() => openModal("effect")}
      />
      <View style={styles.quickGrid}>
        <MetricCard
          icon={Hospital}
          label="총 진료"
          value={`${data.visits.length}회`}
          detail={
            startDate ? `${formatShortDate(startDate)} 시작` : "기록 없음"
          }
          color={theme.blue}
          softColor={theme.blueSoft}
        />
        <MetricCard
          icon={CalendarDays}
          label="치료 기간"
          value={`${treatmentDays(data)}일`}
          detail="첫 기록 기준"
          color={theme.green}
          softColor={theme.greenSoft}
        />
        <MetricCard
          icon={Pill}
          label="복용 약"
          value={`${activeMeds.length}개`}
          detail="현재 복용 중"
          color={theme.teal}
          softColor={theme.tealSoft}
        />
        <MetricCard
          icon={TrendingUp}
          label="증상 흐름"
          value={symptomTrendLabel(data)}
          detail={`최근 평균 ${recentSymptomAverage(data).toFixed(1)}/5`}
          color={theme.coral}
          softColor={theme.coralSoft}
        />
      </View>

      <SectionHeader title="증상 변화" />
      <View style={styles.chartPanel}>
        <MiniBarChart
          values={symptoms.map((log) => ({
            label: formatShortDate(log.date),
            value: log.level,
          }))}
          color={theme.coral}
        />
      </View>

      <SectionHeader title="체감 효과" />
      <View style={styles.chartPanel}>
        <MiniBarChart
          values={effects.map((log) => ({
            label: formatShortDate(log.date),
            value: Math.round(
              (log.anxietyRelief +
                log.sleepImprovement +
                log.focusImprovement) /
                3,
            ),
          }))}
          color={theme.green}
        />
      </View>

      <SectionHeader title="부작용 빈도" />
      <FrequencyPanel
        rows={sideEffects}
        emptyLabel="최근 30일 부작용 기록이 없습니다."
      />

      <SectionHeader title="증상 빈도" />
      <FrequencyPanel
        rows={symptomCounts}
        emptyLabel="최근 30일 증상 기록이 없습니다."
      />

      <SectionHeader title="진료 준비 메모" />
      <View style={styles.summaryPanel}>
        {summary.map((item) => (
          <View key={item} style={styles.summaryRow}>
            <CheckCircle2 color={theme.green} size={17} strokeWidth={2.4} />
            <Text style={styles.summaryText}>{item}</Text>
          </View>
        ))}
      </View>

      <SectionHeader
        title="의사에게 물어볼 질문"
        actionLabel="질문 추가"
        onAction={() => openModal("question")}
      />
      <View style={styles.listStack}>
        {data.questions.map((question) => (
          <Pressable
            key={question.id}
            style={styles.questionRow}
            onPress={() => toggleQuestion(question.id)}
          >
            <View
              style={[
                styles.questionCheck,
                question.resolved && styles.questionCheckDone,
              ]}
            >
              {question.resolved ? (
                <CheckCircle2
                  color={theme.surface}
                  size={16}
                  strokeWidth={2.5}
                />
              ) : null}
            </View>
            <View style={styles.flex1}>
              <Text
                style={[
                  styles.questionText,
                  question.resolved && styles.questionTextDone,
                ]}
              >
                {question.text}
              </Text>
              <Text style={styles.itemMeta}>
                {formatShortDate(question.createdAt)}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.resetButton} onPress={resetDemoData}>
        <RotateCcw color={theme.teal} size={18} strokeWidth={2.4} />
        <Text style={styles.resetText}>샘플 데이터로 되돌리기</Text>
      </Pressable>
    </ScrollView>
  );
}

function EntryModal({
  kind,
  actions,
  onClose,
}: {
  kind: ModalKind;
  actions: PsycheDataActions;
  onClose: () => void;
}) {
  const title = {
    visit: "병원 방문 기록",
    symptom: "증상 기록",
    sideEffect: "부작용 기록",
    question: "의사에게 물어볼 질문",
    medication: "약 등록",
    effect: "체감 효과 기록",
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Pressable style={styles.iconButton} onPress={onClose}>
                <X color={theme.text} size={21} strokeWidth={2.3} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
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
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

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
    <View style={styles.formStack}>
      <TextField
        label="방문일"
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />
      <TextField
        label="병원명"
        value={hospitalName}
        onChangeText={setHospitalName}
      />
      <TextField
        label="담당 의사"
        value={doctorName}
        onChangeText={setDoctorName}
        placeholder="예: 김하린"
      />
      <TextField
        label="진료비"
        value={cost}
        onChangeText={setCost}
        placeholder="예: 19800"
        keyboardType="number-pad"
      />
      <Text style={styles.formLabel}>진료 결과</Text>
      <OptionGrid
        options={visitOutcomeOptions}
        selected={outcomes}
        onToggle={toggleOutcome}
      />
      <TextField
        label="다음 예약일"
        value={nextDate}
        onChangeText={setNextDate}
        placeholder="YYYY-MM-DD"
      />
      <TextField
        label="예약 시간"
        value={nextTime}
        onChangeText={setNextTime}
        placeholder="예: 14:00"
      />
      <TextField
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

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.sectionAction} onPress={onAction}>
          <Plus color={theme.teal} size={15} strokeWidth={2.5} />
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  color,
  softColor,
}: {
  icon: IconComponent;
  label: string;
  value: string;
  detail: string;
  color: string;
  softColor: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: softColor }]}>
        <Icon color={color} size={20} strokeWidth={2.4} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDetail} numberOfLines={2}>
        {detail}
      </Text>
    </View>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onPress,
}: {
  icon: IconComponent;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <Icon color={theme.teal} size={22} strokeWidth={2.3} />
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

function RatingBadge({ rating }: { rating: Rating }) {
  return (
    <View style={styles.ratingBadge}>
      <Text style={styles.ratingBadgeText}>{rating}/5</Text>
    </View>
  );
}

function InfoPill({ label }: { label: string }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoPillText}>{label}</Text>
    </View>
  );
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmentedControl}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            style={[
              styles.segmentButton,
              selected && styles.segmentButtonActive,
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.segmentLabel,
                selected && styles.segmentLabelActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function OptionGrid<T extends string>({
  options,
  selected,
  onToggle,
  single,
}: {
  options: T[];
  selected: T[];
  onToggle: (value: T) => void;
  single?: boolean;
}) {
  return (
    <View style={styles.optionGrid}>
      {options.map((option) => {
        const isSelected = selected.includes(option);

        return (
          <Pressable
            key={option}
            style={[styles.optionChip, isSelected && styles.optionChipSelected]}
            onPress={() => onToggle(option)}
          >
            {isSelected ? (
              <CheckCircle2 color={theme.surface} size={14} strokeWidth={2.5} />
            ) : null}
            <Text
              style={[
                styles.optionChipText,
                isSelected && styles.optionChipTextSelected,
              ]}
            >
              {option}
              {single && isSelected ? "" : ""}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function RatingControl({
  value,
  onChange,
}: {
  value: Rating;
  onChange: (value: Rating) => void;
}) {
  return (
    <View style={styles.ratingControl}>
      {ratings.map((rating) => {
        const selected = rating === value;

        return (
          <Pressable
            key={rating}
            style={[styles.ratingButton, selected && styles.ratingButtonActive]}
            onPress={() => onChange(rating)}
          >
            <Text
              style={[styles.ratingText, selected && styles.ratingTextActive]}
            >
              {rating}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "number-pad";
}) {
  return (
    <View>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA5B1"
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

function FormFooter({ onSave }: { onSave: () => void }) {
  return (
    <Pressable style={styles.saveButton} onPress={onSave}>
      <Save color={theme.surface} size={18} strokeWidth={2.4} />
      <Text style={styles.saveButtonText}>저장</Text>
    </Pressable>
  );
}

const TL_EMOJI: Record<string, string> = {
  visit: "🏥",
  medication: "💊",
  symptom: "🧠",
  sideEffect: "⚠️",
  effect: "✨",
};

function TimelineEventRow({
  item,
  isLast,
}: {
  item: TimelineItem;
  isLast: boolean;
}) {
  const emoji = TL_EMOJI[item.type];

  return (
    <View style={[styles.tlFlatRow, !isLast && styles.tlFlatRowBorder]}>
      <View style={[styles.tlFlatIcon, { backgroundColor: item.accent + "28" }]}>
        {emoji
          ? <Text style={styles.tlFlatIconEmoji}>{emoji}</Text>
          : <View style={[styles.tlFlatIconDot, { backgroundColor: item.accent }]} />
        }
      </View>
      <View style={styles.tlFlatText}>
        <Text style={styles.tlFlatTitle}>{item.title}</Text>
        <Text style={styles.tlFlatDesc} numberOfLines={1}>{item.description}</Text>
      </View>
      <Text style={styles.tlFlatMore}>•••</Text>
    </View>
  );
}

function MiniBarChart({
  values,
  color,
}: {
  values: { label: string; value: number }[];
  color: string;
}) {
  if (values.length === 0) {
    return <Text style={styles.emptyText}>아직 표시할 기록이 없습니다.</Text>;
  }

  return (
    <View style={styles.chartWrap}>
      {values.map((item, index) => (
        <View key={`${item.label}-${index}`} style={styles.chartColumn}>
          <View style={styles.chartTrack}>
            <View
              style={[
                styles.chartBar,
                {
                  height: `${Math.max(12, item.value * 20)}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
          <Text style={styles.chartValue}>{item.value}</Text>
          <Text style={styles.chartLabel} numberOfLines={1}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function FrequencyPanel({
  rows,
  emptyLabel,
}: {
  rows: [string, number][];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <View style={styles.chartPanel}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  const max = Math.max(...rows.map((row) => row[1]));

  return (
    <View style={styles.chartPanel}>
      {rows.map(([label, count]) => (
        <View key={label} style={styles.frequencyRow}>
          <Text style={styles.frequencyLabel}>{label}</Text>
          <View style={styles.frequencyTrack}>
            <View
              style={[
                styles.frequencyBar,
                { width: `${Math.max(8, (count / max) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.frequencyCount}>{count}회</Text>
        </View>
      ))}
    </View>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: "#1F2933",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  android: {
    elevation: 2,
  },
  default: {},
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  appShell: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
    alignSelf: "center",
    backgroundColor: theme.background,
  },
  header: {
    minHeight: 72,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: theme.line,
    borderBottomWidth: 1,
    backgroundColor: theme.background,
  },
  brandBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.tealSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    color: theme.ink,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: 0,
  },
  brandCaption: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  headerAction: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: theme.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  headerActionText: {
    color: theme.surface,
    fontSize: 14,
    fontWeight: "800",
  },
  screen: {
    flex: 1,
  },
  screenContent: {
    padding: 20,
    paddingBottom: 28,
    gap: 16,
  },
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
  headerBrandText: {
    flex: 1,
    color: "#20212B",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    letterSpacing: 0,
    textAlign: "center",
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
  streakBlock: {
    width: 28,
    alignItems: "center",
    gap: 0,
  },
  butterflyIcon: {
    fontSize: 17,
    lineHeight: 18,
  },
  streakCount: {
    color: "#4025E8",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "800",
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
    borderWidth: 1,
    borderColor: "#D5D6DD",
    backgroundColor: "#FFFFFF",
  },
  weekName: {
    color: "#B2B3BA",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "500",
  },
  weekNameActive: {
    color: "#20212B",
    fontWeight: "700",
  },
  weekNumber: {
    color: "#B2B3BA",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "500",
  },
  weekNumberActive: {
    color: "#20212B",
    fontWeight: "700",
  },
  moodCard: {
    borderRadius: 24,
    backgroundColor: "#FAF9FD",
    borderWidth: 1,
    borderColor: "#E1E0EE",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 26,
    alignItems: "center",
  },
  moodTitle: {
    color: "#20212B",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0,
  },
  moodEmoji: {
    fontSize: 72,
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  moodTrackWrap: {
    width: "100%",
    paddingVertical: 16,
  },
  moodTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C5C3E0",
    justifyContent: "center",
  },
  moodFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#4025E8",
  },
  moodSnapDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#C5C3E0",
    top: -3,
  },
  moodSnapDotFilled: {
    backgroundColor: "#4025E8",
  },
  moodThumb: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    top: -11,
    borderWidth: 2,
    borderColor: "#4025E8",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  moodLabel: {
    color: "#4025E8",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
    textAlign: "center",
  },
  sleepCard: {
    borderRadius: 24,
    backgroundColor: "#FAF9FD",
    borderWidth: 1,
    borderColor: "#E1E0EE",
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  anxietySheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
  timeOfDayCard: {
    borderRadius: 24,
    backgroundColor: "#FAF9FD",
    borderWidth: 1,
    borderColor: "#E1E0EE",
    padding: 12,
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
  moodDivider: {
    height: 1,
    backgroundColor: "#E1E0EE",
    width: "100%",
    marginTop: 20,
    marginBottom: 16,
  },
  starRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  starRowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  starIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EEEDF8",
    alignItems: "center",
    justifyContent: "center",
  },
  starIconEmoji: {
    fontSize: 22,
  },
  starRowText: {
    flex: 1,
  },
  starLabel: {
    color: "#20212B",
    fontSize: 16,
    fontWeight: "800",
  },
  starDesc: {
    color: "#9096A2",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
    fontWeight: "500",
  },
  starRowRight: {
    width: 160,
    alignItems: "flex-end",
    gap: 4,
  },
  starGroup: {
    flexDirection: "row",
    gap: 4,
  },
  starScaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  starScaleText: {
    color: "#B0B3BE",
    fontSize: 10,
    fontWeight: "600",
  },
  starIcon: {
    fontSize: 28,
    color: "#D9D8E8",
  },
  starIconFilled: {
    color: "#F5C518",
  },
  ratingNumBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D9D8E8",
    alignItems: "center",
    justifyContent: "center",
  },
  ratingNumBtnSelected: {
    backgroundColor: "#4025E8",
    borderColor: "#4025E8",
  },
  ratingNumText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#B0B3BE",
  },
  ratingNumTextSelected: {
    color: "#FFFFFF",
  },
  checkOuterCard: {
    borderRadius: 28,
    backgroundColor: "#FAF9FD",
    padding: 12,
  },
  checkCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C8C3EA",
    backgroundColor: "#DCD9F0",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  checkCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  checkCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkFlower: {
    color: "#E34C87",
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
  },
  checkCardTitle: {
    color: "#20212B",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    letterSpacing: 0,
  },
  checkProgress: {
    color: "#7364FF",
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "700",
  },
  questionRowTop: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  checkQuestion: {
    color: "#20212B",
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "700",
  },
  scoreText: {
    color: "#3527F4",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
  },
  scoreSlash: {
    color: "#3527F4",
  },
  ratingButtonRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 8,
  },
  checkRatingButton: {
    flex: 1,
    height: 60,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C9C6E4",
    backgroundColor: "#F0EFF9",
    alignItems: "center",
    justifyContent: "center",
  },
  checkRatingButtonSelected: {
    borderColor: "#4025E8",
    backgroundColor: "#4025E8",
  },
  checkRatingText: {
    color: "#9694A6",
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "900",
  },
  checkRatingTextSelected: {
    color: theme.surface,
  },
  ratingCaptionRow: {
    minHeight: 26,
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  ratingCaption: {
    color: "#737184",
    fontSize: 13,
    fontWeight: "800",
  },
  moreSymptomText: {
    color: "#5C50FF",
    fontSize: 15,
    fontWeight: "800",
  },
  checkDivider: {
    height: 1,
    marginTop: 18,
    marginBottom: 20,
    backgroundColor: "#C9C6E2",
  },
  checkMedicationRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  checkPillBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#F5F3FC",
    alignItems: "center",
    justifyContent: "center",
  },
  pillGlyph: {
    width: 30,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4025E8",
  },
  checkMedName: {
    color: "#20212B",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  checkMedDose: {
    fontSize: 16,
    fontWeight: "900",
  },
  checkMedMeta: {
    color: "#6D6A82",
    fontSize: 15,
    lineHeight: 21,
    marginTop: 3,
    fontWeight: "700",
  },
  medCheckBox: {
    width: 42,
    height: 42,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: "#4025E8",
    alignItems: "center",
    justifyContent: "center",
  },
  medCheckBoxDone: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  emptyHomeAction: {
    minHeight: 76,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyHomeActionText: {
    color: "#4025E8",
    fontSize: 15,
    fontWeight: "900",
  },
  checkMiniCardFull: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E1E0E9",
    backgroundColor: "#FAF9FD",
    padding: 20,
  },
  checkMiniGrid: {
    flexDirection: "row",
    gap: 12,
  },
  checkMiniCard: {
    flex: 1,
    minHeight: 140,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E1E0E9",
    backgroundColor: "#FAF9FD",
    padding: 20,
  },
  miniCardTitle: {
    color: "#20212B",
    fontSize: 19,
    lineHeight: 25,
    marginTop: 16,
    fontWeight: "900",
  },
  miniCardMeta: {
    color: "#717082",
    fontSize: 16,
    lineHeight: 22,
    marginTop: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  trendMiniHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  trendMiniBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D5EBDC",
    alignItems: "center",
    justifyContent: "center",
  },
  trendMiniBadgeText: {
    color: "#306A4B",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
  },
  sparklineBox: {
    width: 128,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  heroPanel: {
    minHeight: 172,
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 20,
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    ...shadow,
  },
  heroTextBlock: {
    flex: 1,
    justifyContent: "center",
  },
  heroKicker: {
    color: theme.teal,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroTitle: {
    color: theme.ink,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: 0,
  },
  heroCopy: {
    color: theme.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    fontWeight: "600",
  },
  heroIconWrap: {
    width: 86,
    height: 86,
    alignSelf: "center",
    borderRadius: 8,
    backgroundColor: theme.tealSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "48%",
    minHeight: 142,
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 14,
    justifyContent: "space-between",
    ...shadow,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
  metricValue: {
    color: theme.ink,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 3,
    letterSpacing: 0,
  },
  metricDetail: {
    color: theme.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    fontWeight: "600",
  },
  sectionHeader: {
    marginTop: 4,
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    color: theme.ink,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0,
  },
  sectionAction: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: theme.tealSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sectionActionText: {
    color: theme.teal,
    fontSize: 12,
    fontWeight: "800",
  },
  actionGrid: {
    flexDirection: "row",
    gap: 10,
  },
  quickAction: {
    flex: 1,
    height: 78,
    borderRadius: 8,
    backgroundColor: theme.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    ...shadow,
  },
  quickActionText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "800",
  },
  summaryPanel: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 16,
    gap: 12,
    ...shadow,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  summaryTitle: {
    color: theme.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  summaryText: {
    flex: 1,
    color: theme.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  listStack: {
    gap: 12,
  },
  medicationRow: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...shadow,
  },
  medIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: theme.tealSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  flex1: {
    flex: 1,
  },
  itemTitle: {
    color: theme.ink,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
  },
  itemMeta: {
    color: theme.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    fontWeight: "600",
  },
  tabBar: {
    height: 86,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 6,
    borderTopColor: "#E3E8F0",
    borderTopWidth: 1,
    backgroundColor: theme.surface,
    flexDirection: "row",
  },
  tabItem: {
    flex: 1,
    height: 66,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  tabItemActive: {
    backgroundColor: "transparent",
  },
  tabItemCenter: {
    marginTop: -34,
    height: 88,
    justifyContent: "flex-start",
  },
  tabLabel: {
    color: "#9AA6B8",
    fontSize: 12,
    fontWeight: "800",
  },
  tabLabelActive: {
    color: "#4025E8",
  },
  centerTabButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#4025E8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4025E8",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  segmentedControl: {
    height: 46,
    borderRadius: 8,
    backgroundColor: theme.surfaceMuted,
    padding: 4,
    flexDirection: "row",
  },
  segmentButton: {
    flex: 1,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: theme.surface,
  },
  segmentLabel: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  segmentLabelActive: {
    color: theme.ink,
  },
  fullWidthAction: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: theme.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fullWidthActionText: {
    color: theme.surface,
    fontSize: 14,
    fontWeight: "900",
  },
  recordPanel: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 16,
    gap: 10,
    ...shadow,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowBetweenTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  costText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "800",
  },
  recordBody: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  staticChip: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: theme.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  staticChipText: {
    color: theme.blue,
    fontSize: 12,
    fontWeight: "800",
  },
  appointmentLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  ratingBadge: {
    minWidth: 42,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.coralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingBadgeText: {
    color: theme.coral,
    fontSize: 12,
    fontWeight: "900",
  },
  medPanel: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 16,
    gap: 12,
    ...shadow,
  },
  activeBadge: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: theme.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBadgeText: {
    color: theme.green,
    fontSize: 12,
    fontWeight: "900",
  },
  medDoseRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  infoPill: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: theme.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  infoPillText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "800",
  },
  archivedRow: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 14,
    gap: 6,
    ...shadow,
  },
  tlSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F2F2F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginTop: 12,
  },
  tlSearchInput: {
    flex: 1,
    fontSize: 14,
    color: "#20212B",
    fontWeight: "500",
  },
  tlFilterRow: {
    flexDirection: "row",
    gap: 0,
    paddingBottom: 0,
    marginTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E3E5EC",
  },
  tlFilterTab: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    alignItems: "center",
    position: "relative",
  },
  tlFilterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9096A2",
  },
  tlFilterTabTextActive: {
    color: "#20212B",
    fontWeight: "800",
  },
  tlFilterTabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 14,
    right: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#20212B",
  },
  tlDateHeader: {
    color: "#9096A2",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  tlGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EBEBF0",
    overflow: "hidden",
  },
  tlFlatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tlFlatRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F5",
  },
  tlFlatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tlFlatIconEmoji: {
    fontSize: 18,
  },
  tlFlatIconDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  tlFlatText: {
    flex: 1,
    gap: 3,
  },
  tlFlatTitle: {
    color: "#20212B",
    fontSize: 15,
    fontWeight: "700",
  },
  tlFlatDesc: {
    color: "#9096A2",
    fontSize: 13,
    fontWeight: "500",
  },
  tlFlatMore: {
    color: "#C5C3E0",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  timelineCardList: {
    gap: 0,
  },
  tlCardRow: {
    flexDirection: "row",
    gap: 12,
  },
  tlRail: {
    width: 44,
    alignItems: "center",
    paddingTop: 18,
  },
  tlCalBadge: {
    width: 44,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E3E5EC",
    backgroundColor: "#FFFFFF",
  },
  tlCalHeader: {
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tlCalMonth: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  tlCalBody: {
    alignItems: "center",
    paddingVertical: 4,
  },
  tlCalDay: {
    color: "#20212B",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 22,
  },
  tlCalWeekday: {
    color: "#9096A2",
    fontSize: 9,
    fontWeight: "700",
  },
  tlLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E3E5EC",
    marginTop: 4,
    marginBottom: 0,
  },
  tlCard: {
    flex: 1,
    paddingBottom: 14,
  },
  tlCardInner: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EBEBF0",
    padding: 14,
    gap: 12,
    alignItems: "center",
  },
  tlCardText: {
    flex: 1,
    gap: 3,
  },
  tlCardTitle: {
    color: "#20212B",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  tlCardMeta: {
    color: "#9096A2",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  tlCardDesc: {
    color: "#6D6F7A",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    marginTop: 2,
  },
  tlCardMore: {
    color: "#B0B3BE",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
    letterSpacing: 1,
  },
  tlCardThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tlCardThumbDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    opacity: 0.7,
  },
  timelinePanel: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    paddingTop: 16,
    paddingHorizontal: 16,
    ...shadow,
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: 94,
  },
  timelineRail: {
    width: 24,
    alignItems: "center",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.line,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 22,
  },
  timelineDate: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  timelineTitle: {
    color: theme.ink,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },
  timelineDescription: {
    color: theme.text,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
    fontWeight: "600",
  },
  chartPanel: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 16,
    ...shadow,
  },
  chartWrap: {
    height: 174,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  chartColumn: {
    flex: 1,
    minWidth: 34,
    height: 160,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chartTrack: {
    width: "100%",
    maxWidth: 42,
    height: 104,
    borderRadius: 8,
    backgroundColor: theme.surfaceMuted,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  chartBar: {
    width: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  chartValue: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 6,
  },
  chartLabel: {
    width: "100%",
    color: theme.muted,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 3,
  },
  emptyText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
  },
  frequencyRow: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  frequencyLabel: {
    width: 78,
    color: theme.text,
    fontSize: 13,
    fontWeight: "800",
  },
  frequencyTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.surfaceMuted,
    overflow: "hidden",
  },
  frequencyBar: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: theme.amber,
  },
  frequencyCount: {
    width: 38,
    color: theme.muted,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
  },
  questionRow: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 14,
    flexDirection: "row",
    gap: 11,
    ...shadow,
  },
  questionCheck: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.line,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  questionCheckDone: {
    borderColor: theme.teal,
    backgroundColor: theme.teal,
  },
  questionText: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  questionTextDone: {
    color: theme.muted,
    textDecorationLine: "line-through",
  },
  resetButton: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  resetText: {
    color: theme.teal,
    fontSize: 14,
    fontWeight: "900",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(16, 24, 32, 0.45)",
    justifyContent: "flex-end",
  },
  modalKeyboard: {
    width: "100%",
  },
  modalSheet: {
    maxHeight: "88%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: theme.background,
    padding: 20,
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
  formLabel: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 7,
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
    color: theme.text,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    fontWeight: "600",
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    minHeight: 36,
    paddingHorizontal: 11,
    borderRadius: 8,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  optionChipSelected: {
    backgroundColor: theme.teal,
    borderColor: theme.teal,
  },
  optionChipText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "800",
  },
  optionChipTextSelected: {
    color: theme.surface,
  },
  ratingControl: {
    height: 46,
    flexDirection: "row",
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingButtonActive: {
    backgroundColor: theme.coral,
    borderColor: theme.coral,
  },
  ratingText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "900",
  },
  ratingTextActive: {
    color: theme.surface,
  },
  saveButton: {
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: theme.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  saveButtonText: {
    color: theme.surface,
    fontSize: 15,
    fontWeight: "900",
  },
});
