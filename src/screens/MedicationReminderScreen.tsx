import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Bell, ChevronLeft, Clock, Pill, Plus, Trash2 } from "lucide-react-native";
import type { DailyMedicationInfo } from "../types";

const dayOptions = ["월", "화", "수", "목", "금", "토", "일"] as const;
const advanceOptions = ["없음", "10분 전", "30분 전", "1시간 전"] as const;
const methodOptions = ["소리", "진동", "둘 다"] as const;

function defaultReminderTime(schedule: string) {
  if (schedule.includes("점심")) return "12:30";
  if (schedule.includes("저녁")) return "19:00";
  if (schedule.includes("취침")) return "22:30";
  return "08:00";
}

export function MedicationReminderDialog({
  medication,
  onClose,
}: {
  medication: DailyMedicationInfo | null;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={medication !== null}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.root}>
          {medication ? (
            <MedicationReminderScreen medication={medication} onClose={onClose} />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function MedicationReminderScreen({
  medication,
  onClose,
}: {
  medication: DailyMedicationInfo;
  onClose: () => void;
}) {
  const initialTime = useMemo(
    () => defaultReminderTime(medication.schedule),
    [medication.schedule],
  );
  const [enabled, setEnabled] = useState(true);
  const [times, setTimes] = useState([initialTime]);
  const [selectedDays, setSelectedDays] = useState<string[]>([...dayOptions]);
  const [advance, setAdvance] = useState<(typeof advanceOptions)[number]>("10분 전");
  const [method, setMethod] = useState<(typeof methodOptions)[number]>("둘 다");

  const toggleDay = (day: string) => {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    );
  };

  const updateTime = (index: number, value: string) => {
    setTimes((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  };

  const addTime = () => {
    setTimes((current) => [...current, initialTime]);
  };

  const removeTime = (index: number) => {
    setTimes((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onClose}>
          <ChevronLeft color="#20212B" size={22} strokeWidth={2.5} />
        </Pressable>
        <Text style={styles.headerTitle}>복약 알림</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Bell color="#4025E8" size={28} strokeWidth={2.4} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.medName}>{medication.name}</Text>
            <Text style={styles.medMeta}>
              {medication.quantity} · {medication.schedule}
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ false: "#D6D5DF", true: "#C9C2FF" }}
            thumbColor={enabled ? "#4025E8" : "#FFFFFF"}
          />
        </View>

        <Text style={styles.sectionTitle}>알림 시간</Text>
        <View style={styles.panel}>
          {times.map((time, index) => (
            <View key={`${time}-${index}`} style={styles.timeRow}>
              <Clock color="#9092A0" size={18} strokeWidth={2.3} />
              <TextInput
                value={time}
                onChangeText={(value) => updateTime(index, value)}
                style={styles.timeInput}
                keyboardType="numbers-and-punctuation"
              />
              {times.length > 1 ? (
                <Pressable style={styles.iconAction} onPress={() => removeTime(index)}>
                  <Trash2 color="#9A9AA7" size={17} strokeWidth={2.2} />
                </Pressable>
              ) : null}
            </View>
          ))}
          <Pressable style={styles.addTimeButton} onPress={addTime}>
            <Plus color="#4025E8" size={17} strokeWidth={2.6} />
            <Text style={styles.addTimeText}>시간 추가</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>반복 요일</Text>
        <View style={styles.dayRow}>
          {dayOptions.map((day) => {
            const active = selectedDays.includes(day);
            return (
              <Pressable
                key={day}
                style={[styles.dayChip, active && styles.dayChipActive]}
                onPress={() => toggleDay(day)}
              >
                <Text style={[styles.dayText, active && styles.dayTextActive]}>
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>사전 알림</Text>
        <View style={styles.optionRow}>
          {advanceOptions.map((option) => {
            const active = advance === option;
            return (
              <Pressable
                key={option}
                style={[styles.optionChip, active && styles.optionChipActive]}
                onPress={() => setAdvance(option)}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
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
          <Pill color="#4025E8" size={18} strokeWidth={2.3} />
          <Text style={styles.summaryText}>
            {enabled
              ? `${selectedDays.length}일 반복 · ${times.join(", ")} 알림`
              : "복약 알림이 꺼져 있습니다."}
          </Text>
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
    minHeight: 88,
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
    gap: 4,
  },
  medName: {
    color: "#20212B",
    fontSize: 18,
    fontWeight: "800",
  },
  medMeta: {
    color: "#6B5FD0",
    fontSize: 13,
    fontWeight: "600",
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  timeRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  timeInput: {
    flex: 1,
    color: "#20212B",
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 8,
  },
  iconAction: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  addTimeButton: {
    minHeight: 40,
    borderTopWidth: 1,
    borderTopColor: "#ECEBF3",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addTimeText: {
    color: "#4025E8",
    fontSize: 13,
    fontWeight: "800",
  },
  dayRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  dayChip: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  dayChipActive: {
    backgroundColor: "#4025E8",
  },
  dayText: {
    color: "#777986",
    fontSize: 13,
    fontWeight: "700",
  },
  dayTextActive: {
    color: "#FFFFFF",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  optionChip: {
    minHeight: 34,
    borderRadius: 17,
    paddingHorizontal: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  optionChipActive: {
    backgroundColor: "#20212B",
  },
  optionText: {
    color: "#62626A",
    fontSize: 13,
    fontWeight: "700",
  },
  optionTextActive: {
    color: "#FFFFFF",
  },
  summaryCard: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  summaryText: {
    flex: 1,
    color: "#525260",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
});
