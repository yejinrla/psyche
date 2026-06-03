import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  Clock3,
  Hospital,
} from "lucide-react-native";
import type { PsycheData, Visit } from "../types";
import { todayISO } from "../utils/date";

const reminderOptions = ["진료 하루 전", "진료 당일 아침", "1시간 전"] as const;
const methodOptions = ["소리", "진동", "배너"] as const;

type AppointmentInfo = {
  date: string;
  time: string;
  hospitalName: string;
  doctorName: string;
};

function findNextAppointment(data: PsycheData): AppointmentInfo | null {
  const today = todayISO();
  const appointments = data.visits
    .filter((visit): visit is Visit & { nextAppointment: { date: string; time: string } } =>
      Boolean(visit.nextAppointment),
    )
    .map((visit) => ({
      date: visit.nextAppointment.date,
      time: visit.nextAppointment.time,
      hospitalName: visit.hospitalName,
      doctorName: visit.doctorName,
    }))
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  return (
    appointments.find((appointment) => appointment.date >= today) ??
    appointments[appointments.length - 1] ??
    null
  );
}

function formatAppointmentDate(date?: string) {
  if (!date) {
    return "예약 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));
}

function PurpleToggle({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={[styles.toggleTrack, value && styles.toggleTrackOn]}
      onPress={() => onValueChange(!value)}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
    </Pressable>
  );
}

export function AppointmentReminderDialog({
  visible,
  data,
  onClose,
}: {
  visible: boolean;
  data: PsycheData;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.root}>
          <AppointmentReminderScreen data={data} onClose={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function AppointmentReminderScreen({
  data,
  onClose,
}: {
  data: PsycheData;
  onClose: () => void;
}) {
  const nextAppointment = useMemo(() => findNextAppointment(data), [data]);
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [selectedReminders, setSelectedReminders] = useState<string[]>([
    "진료 하루 전",
    "진료 당일 아침",
  ]);
  const [dayOfTime, setDayOfTime] = useState("09:00");
  const [method, setMethod] = useState<(typeof methodOptions)[number]>("배너");

  const toggleReminder = (option: string) => {
    setSelectedReminders((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  };

  const summaryText = !masterEnabled
    ? "병원 예약 알림이 꺼져 있습니다."
    : nextAppointment
      ? `${formatAppointmentDate(nextAppointment.date)} ${nextAppointment.time} · ${selectedReminders.length}개 알림`
      : "등록된 다음 진료 예약이 없습니다.";

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onClose}>
          <ChevronLeft color="#20212B" size={22} strokeWidth={2.5} />
        </Pressable>
        <Text style={styles.headerTitle}>병원 예약 알림</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Hospital color="#4025E8" size={28} strokeWidth={2.4} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>진료 일정 알림</Text>
            <Text style={styles.heroMeta}>다음 진료 전 준비 시간을 알려드려요</Text>
          </View>
          <PurpleToggle
            value={masterEnabled}
            onValueChange={setMasterEnabled}
          />
        </View>

        <Text style={styles.sectionTitle}>다음 진료</Text>
        <View style={[styles.panel, !nextAppointment && styles.panelMuted]}>
          <View style={styles.infoRow}>
            <CalendarDays color="#4025E8" size={19} strokeWidth={2.4} />
            <View style={styles.flex1}>
              <Text style={styles.infoTitle}>
                {formatAppointmentDate(nextAppointment?.date)}
              </Text>
              <Text style={styles.infoMeta}>
                {nextAppointment
                  ? `${nextAppointment.time} · ${nextAppointment.hospitalName}`
                  : "병원 방문 기록에서 다음 예약일을 추가해 주세요"}
              </Text>
            </View>
          </View>
          {nextAppointment ? (
            <View style={styles.infoRow}>
              <Hospital color="#9A98A8" size={18} strokeWidth={2.3} />
              <Text style={styles.doctorText}>{nextAppointment.doctorName} 원장</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>알림 시점</Text>
        <View style={styles.optionRow}>
          {reminderOptions.map((option) => {
            const active = selectedReminders.includes(option);
            return (
              <Pressable
                key={option}
                style={[
                  styles.optionChip,
                  active && styles.optionChipActive,
                  !masterEnabled && styles.optionChipDisabled,
                ]}
                disabled={!masterEnabled}
                onPress={() => toggleReminder(option)}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>당일 알림 시간</Text>
        <View style={styles.timeCard}>
          <Clock3 color="#4025E8" size={19} strokeWidth={2.4} />
          <Text style={styles.timeLabel}>진료 당일</Text>
          <TextInput
            value={dayOfTime}
            onChangeText={setDayOfTime}
            style={styles.timeInput}
            keyboardType="numbers-and-punctuation"
            editable={masterEnabled}
            placeholder="09:00"
            placeholderTextColor="#C0C4CC"
          />
        </View>

        <Text style={styles.sectionTitle}>알림 방식</Text>
        <View style={styles.optionRow}>
          {methodOptions.map((option) => {
            const active = method === option;
            return (
              <Pressable
                key={option}
                style={[styles.optionChip, active && styles.optionChipActive]}
                onPress={() => setMethod(option)}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.summaryCard}>
          <Bell color="#4025E8" size={18} strokeWidth={2.3} />
          <Text style={styles.summaryText}>{summaryText}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#e8e9ec",
    alignItems: "center",
  },
  root: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#F4F3F8",
  },
  page: {
    flex: 1,
    backgroundColor: "#F4F3F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 24 : 52,
    paddingBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    color: "#20212B",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  heroCard: {
    minHeight: 98,
    borderRadius: 20,
    backgroundColor: "#EBE8FD",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    flex: 1,
    flexShrink: 1,
    gap: 4,
    paddingRight: 2,
  },
  heroTitle: {
    color: "#20212B",
    fontSize: 18,
    fontWeight: "800",
  },
  heroMeta: {
    color: "#6B5FD0",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#D7D5E3",
    padding: 3,
    justifyContent: "center",
  },
  toggleTrackOn: {
    backgroundColor: "#C9C2FF",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  toggleThumbOn: {
    alignSelf: "flex-end",
    backgroundColor: "#4025E8",
  },
  sectionTitle: {
    color: "#20212B",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },
  panel: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  panelMuted: {
    opacity: 0.74,
  },
  infoRow: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  infoTitle: {
    color: "#20212B",
    fontSize: 17,
    fontWeight: "800",
  },
  infoMeta: {
    color: "#777986",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
    fontWeight: "600",
  },
  doctorText: {
    color: "#777986",
    fontSize: 13,
    fontWeight: "700",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  optionChip: {
    minHeight: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  optionChipActive: {
    backgroundColor: "#4025E8",
  },
  optionChipDisabled: {
    opacity: 0.48,
  },
  optionText: {
    color: "#62626A",
    fontSize: 13,
    fontWeight: "700",
  },
  optionTextActive: {
    color: "#FFFFFF",
  },
  timeCard: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  timeLabel: {
    flex: 1,
    color: "#20212B",
    fontSize: 14,
    fontWeight: "800",
  },
  timeInput: {
    width: 72,
    color: "#20212B",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "right",
    paddingVertical: 8,
  },
  summaryCard: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summaryText: {
    flex: 1,
    color: "#525260",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
});
