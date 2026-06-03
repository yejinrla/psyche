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
  TrendingUp,
} from "lucide-react-native";
import { MiniBarChart, SectionHeader } from "../components/SharedComponents";
import { ScreenTopHeader } from "../components/ScreenTopHeader";
import { ButterflyIcon } from "../components/ButterflyIcon";
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
import type { ModalKind, PsycheData } from "../types";
import type { PsycheDataActions } from "../hooks/usePsycheData";

type IconComponent = React.ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

function StatTile({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: IconComponent;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <View style={styles.statTile}>
      <View style={styles.statIconBox}>
        <Icon color="#4025E8" size={18} strokeWidth={2.4} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statDetail} numberOfLines={2}>
        {detail}
      </Text>
    </View>
  );
}

function FrequencyList({
  rows,
  emptyLabel,
}: {
  rows: [string, number][];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <View style={styles.panel}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  const max = Math.max(...rows.map((row) => row[1]));

  return (
    <View style={styles.panel}>
      {rows.map(([label, count], index) => (
        <View
          key={label}
          style={[styles.freqRow, index === rows.length - 1 && styles.freqRowLast]}
        >
          <Text style={styles.freqLabel}>{label}</Text>
          <View style={styles.freqTrack}>
            <View
              style={[
                styles.freqBar,
                { width: `${Math.max(8, (count / max) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.freqCount}>{count}회</Text>
        </View>
      ))}
    </View>
  );
}

export function ReportScreen({
  data,
  openModal,
  toggleQuestion,
  onOpenMedicationReminder,
  onOpenAppointmentReminder,
  onGoHome,
  onOpenNotifications,
}: {
  data: PsycheData;
  openModal: (kind: Exclude<ModalKind, null>) => void;
  toggleQuestion: PsycheDataActions["toggleQuestion"];
  onOpenMedicationReminder: () => void;
  onOpenAppointmentReminder: () => void;
  onGoHome?: () => void;
  onOpenNotifications?: () => void;
}) {
  const summary = generateVisitPrepSummary(data);
  const symptoms = sortByDateAsc(data.symptomLogs).slice(-7);
  const sideEffects = sideEffectFrequency(data, 30);
  const symptomCounts = symptomFrequency(data, 30);
  const activeMeds = activeMedications(data.medications);
  const startDate = treatmentStartDate(data);
  const days = treatmentDays(data);
  const symptomAvg = recentSymptomAverage(data);

  return (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <ScreenTopHeader
        title="마이"
        onPressBrand={onGoHome}
        onPressNotification={onOpenNotifications}
      />

      {/* 프로필 히어로 */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroIconBox}>
            <ButterflyIcon color="#4025E8" />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.heroTitle}>나의 치료 여정</Text>
            <Text style={styles.heroSub}>
              {startDate
                ? `${formatShortDate(startDate)} 시작 · ${days}일째`
                : "오늘부터 기록을 시작해 보세요"}
            </Text>
          </View>
        </View>
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{data.visits.length}</Text>
            <Text style={styles.heroStatLabel}>진료</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{activeMeds.length}</Text>
            <Text style={styles.heroStatLabel}>복용 약</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{symptomAvg.toFixed(1)}</Text>
            <Text style={styles.heroStatLabel}>증상 평균</Text>
          </View>
        </View>
      </View>

      {/* 치료 요약 */}
      <Text style={styles.sectionTitle}>치료 요약</Text>
      <View style={styles.statGrid}>
        <StatTile
          icon={Hospital}
          label="총 진료"
          value={`${data.visits.length}회`}
          detail={startDate ? `${formatShortDate(startDate)} 시작` : "기록 없음"}
        />
        <StatTile
          icon={CalendarDays}
          label="치료 기간"
          value={`${days}일`}
          detail="첫 기록 기준"
        />
        <StatTile
          icon={Pill}
          label="복용 약"
          value={`${activeMeds.length}개`}
          detail="현재 복용 중"
        />
        <StatTile
          icon={TrendingUp}
          label="증상 흐름"
          value={symptomTrendLabel(data)}
          detail={`최근 평균 ${symptomAvg.toFixed(1)}/5`}
        />
      </View>

      <SectionHeader
        title="증상 변화"
        actionLabel="효과 기록"
        onAction={() => openModal("effect")}
      />
      <View style={styles.panel}>
        <MiniBarChart
          values={symptoms.map((log) => ({
            label: formatShortDate(log.date),
            value: log.level,
          }))}
          color={theme.teal}
        />
      </View>

      <Text style={styles.sectionTitle}>부작용 빈도</Text>
      <FrequencyList
        rows={sideEffects}
        emptyLabel="최근 30일 부작용 기록이 없습니다."
      />

      <Text style={styles.sectionTitle}>증상 빈도</Text>
      <FrequencyList
        rows={symptomCounts}
        emptyLabel="최근 30일 증상 기록이 없습니다."
      />

      <Text style={styles.sectionTitle}>진료 준비 메모</Text>
      <View style={styles.panel}>
        {summary.map((item, index) => (
          <View
            key={item}
            style={[styles.summaryRow, index === summary.length - 1 && styles.summaryRowLast]}
          >
            <CheckCircle2 color="#4025E8" size={17} strokeWidth={2.4} />
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
                <CheckCircle2 color="#fff" size={16} strokeWidth={2.5} />
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

      <Text style={styles.sectionTitle}>설정</Text>
      <Pressable style={styles.settingRow} onPress={onOpenMedicationReminder}>
        <View style={styles.settingIconBox}>
          <Bell color="#4025E8" size={18} strokeWidth={2.4} />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.settingTitle}>복약 알림 설정</Text>
          <Text style={styles.settingMeta}>
            아침 · 점심 · 저녁 · 취침 전 시간대별 알림
          </Text>
        </View>
        <ChevronRight color="#A2A4AF" size={19} strokeWidth={2.4} />
      </Pressable>

      <Pressable style={styles.settingRow} onPress={onOpenAppointmentReminder}>
        <View style={styles.settingIconBox}>
          <Hospital color="#4025E8" size={18} strokeWidth={2.4} />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.settingTitle}>병원 예약 알림 설정</Text>
          <Text style={styles.settingMeta}>
            다음 진료 전날 · 당일 · 1시간 전 알림
          </Text>
        </View>
        <ChevronRight color="#A2A4AF" size={19} strokeWidth={2.4} />
      </Pressable>
    </ScrollView>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#4025E8",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 2 },
  default: {},
});

const styles = StyleSheet.create({
  screenContent: {
    padding: 20,
    paddingBottom: 28,
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  sectionTitle: {
    color: "#20212B",
    fontSize: 16,
    fontWeight: "800",
  },

  // 히어로
  heroCard: {
    backgroundColor: "#EBE8FD",
    borderRadius: 22,
    padding: 18,
    gap: 18,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  heroIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1a1a2e",
  },
  heroSub: {
    fontSize: 13,
    color: "#6B5FD0",
    marginTop: 4,
    fontWeight: "600",
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
  },
  heroStat: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#4025E8",
  },
  heroStatLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9096A2",
  },
  heroDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#EBE8FD",
  },

  // 통계 타일
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statTile: {
    width: "47%",
    flexGrow: 1,
    minHeight: 130,
    borderRadius: 18,
    backgroundColor: "#fff",
    padding: 16,
    justifyContent: "space-between",
    ...cardShadow,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EBE8FD",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    color: "#9096A2",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
  },
  statValue: {
    color: "#20212B",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2,
  },
  statDetail: {
    color: "#9096A2",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    fontWeight: "600",
  },

  // 공통 패널
  panel: {
    borderRadius: 18,
    backgroundColor: "#fff",
    padding: 16,
    ...cardShadow,
  },

  // 빈도 리스트
  freqRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 2,
  },
  freqRowLast: {
    marginBottom: 0,
  },
  freqLabel: {
    width: 64,
    color: "#20212B",
    fontSize: 13,
    fontWeight: "700",
  },
  freqTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F0EFF8",
    overflow: "hidden",
  },
  freqBar: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#4025E8",
  },
  freqCount: {
    width: 38,
    color: "#9096A2",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },
  emptyText: {
    color: "#9096A2",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
  },

  // 진료 준비 메모
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    paddingVertical: 7,
  },
  summaryRowLast: {
    paddingBottom: 0,
  },
  summaryText: {
    flex: 1,
    color: "#3C3C44",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },

  // 질문
  listStack: {
    gap: 12,
  },
  questionRow: {
    borderRadius: 18,
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    gap: 11,
    ...cardShadow,
  },
  questionCheck: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#DDD9F8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  questionCheckDone: {
    borderColor: "#4025E8",
    backgroundColor: "#4025E8",
  },
  questionText: {
    color: "#20212B",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  questionTextDone: {
    color: "#9096A2",
    textDecorationLine: "line-through",
  },
  itemMeta: {
    color: "#9096A2",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    fontWeight: "600",
  },

  // 설정
  settingRow: {
    minHeight: 68,
    borderRadius: 18,
    backgroundColor: "#fff",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...cardShadow,
  },
  settingRowDisabled: {
    opacity: 0.55,
  },
  settingIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EBE8FD",
    alignItems: "center",
    justifyContent: "center",
  },
  settingTitle: {
    color: "#20212B",
    fontSize: 14,
    fontWeight: "800",
  },
  settingMeta: {
    color: "#9096A2",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
    fontWeight: "600",
  },

});
