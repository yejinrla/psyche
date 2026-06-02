import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Hospital,
  Pill,
  RotateCcw,
  TrendingUp,
} from "lucide-react-native";
import {
  FrequencyPanel,
  MetricCard,
  MiniBarChart,
  SectionHeader,
} from "../components/SharedComponents";
import { ScreenTopHeader } from "../components/ScreenTopHeader";
import { theme } from "../constants";
import {
  activeMedications,
  generateVisitPrepSummary,
  recentSymptomAverage,
  sideEffectFrequency,
  symptomFrequency,
  symptomTrendLabel,
  treatmentDays,
  treatmentStartDate,
} from "../utils/analytics";
import { formatShortDate, sortByDateAsc } from "../utils/date";
import type { DailyMedicationInfo, ModalKind, PsycheData } from "../types";
import type { PsycheDataActions } from "../hooks/usePsycheData";

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

export function ReportScreen({
  data,
  openModal,
  resetDemoData,
  toggleQuestion,
  onOpenMedicationReminder,
}: {
  data: PsycheData;
  openModal: (kind: Exclude<ModalKind, null>) => void;
  resetDemoData: () => void;
  toggleQuestion: PsycheDataActions["toggleQuestion"];
  onOpenMedicationReminder: (medication: DailyMedicationInfo) => void;
}) {
  const summary = generateVisitPrepSummary(data);
  const symptoms = sortByDateAsc(data.symptomLogs).slice(-7);
  const effects = sortByDateAsc(data.effectLogs).slice(-5);
  const sideEffects = sideEffectFrequency(data, 30);
  const symptomCounts = symptomFrequency(data, 30);
  const activeMeds = activeMedications(data.medications);
  const startDate = treatmentStartDate(data);
  const reminderMedication = activeMeds[0]
    ? {
        name: activeMeds[0].name,
        englishName: "",
        brandName: "",
        ingredient: activeMeds[0].purpose ?? "성분 정보 미입력",
        category: "복약 알림",
        dose: activeMeds[0].dose,
        quantity: activeMeds[0].frequency,
        schedule: activeMeds[0].frequency,
        purpose: activeMeds[0].purpose ?? "현재 복용 중인 약",
        description: activeMeds[0].memo ?? "",
        sideEffects: [],
        caution: "",
        isActive: true,
      }
    : null;

  return (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <ScreenTopHeader title="마이" />
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

      <SectionHeader title="설정" />
      <Pressable
        style={[
          styles.settingRow,
          !reminderMedication && styles.settingRowDisabled,
        ]}
        onPress={() => {
          if (reminderMedication) {
            onOpenMedicationReminder(reminderMedication);
          }
        }}
        disabled={!reminderMedication}
      >
        <View style={styles.settingIconBox}>
          <Bell color="#4025E8" size={18} strokeWidth={2.4} />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.settingTitle}>복약 알림 설정</Text>
          <Text style={styles.settingMeta}>
            {reminderMedication
              ? `${reminderMedication.name} · ${reminderMedication.schedule}`
              : "현재 복용 중인 약이 없습니다"}
          </Text>
        </View>
        <ChevronRight color="#A2A4AF" size={19} strokeWidth={2.4} />
      </Pressable>

      <Pressable style={styles.resetButton} onPress={resetDemoData}>
        <RotateCcw color={theme.teal} size={18} strokeWidth={2.4} />
        <Text style={styles.resetText}>샘플 데이터로 되돌리기</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    padding: 20,
    paddingBottom: 28,
    gap: 16,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chartPanel: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 16,
    ...shadow,
  },
  summaryPanel: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 16,
    gap: 12,
    ...shadow,
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
  flex1: {
    flex: 1,
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
  itemMeta: {
    color: theme.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    fontWeight: "600",
  },
  settingRow: {
    minHeight: 68,
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...shadow,
  },
  settingRowDisabled: {
    opacity: 0.55,
  },
  settingIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: theme.tealSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  settingTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "800",
  },
  settingMeta: {
    color: theme.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
    fontWeight: "600",
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
});
