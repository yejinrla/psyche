import React, { useState } from "react";
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
import { Bell, ChevronLeft, Pill } from "lucide-react-native";

const dayOptions = ["월", "화", "수", "목", "금", "토", "일"] as const;
const advanceOptions = ["없음", "10분 전", "30분 전", "1시간 전"] as const;
const methodOptions = ["소리", "진동", "둘 다"] as const;

type MealSlot = {
  key: string;
  label: string;
  emoji: string;
  defaultTime: string;
};

const MEAL_SLOTS: MealSlot[] = [
  { key: "morning", label: "아침", emoji: "🌅", defaultTime: "08:00" },
  { key: "lunch", label: "점심", emoji: "☀️", defaultTime: "12:30" },
  { key: "dinner", label: "저녁", emoji: "🌆", defaultTime: "19:00" },
  { key: "bedtime", label: "취침 전", emoji: "🌙", defaultTime: "22:30" },
];

type SlotState = { enabled: boolean; time: string };

export function MedicationReminderDialog({
  visible,
  onClose,
}: {
  visible: boolean;
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
          <MedicationReminderScreen onClose={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function MedicationReminderScreen({ onClose }: { onClose: () => void }) {
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [slots, setSlots] = useState<Record<string, SlotState>>(() =>
    Object.fromEntries(
      MEAL_SLOTS.map((slot) => [
        slot.key,
        { enabled: slot.key === "morning", time: slot.defaultTime },
      ]),
    ),
  );
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

  const toggleSlot = (key: string) => {
    setSlots((current) => ({
      ...current,
      [key]: { ...current[key], enabled: !current[key].enabled },
    }));
  };

  const updateSlotTime = (key: string, value: string) => {
    setSlots((current) => ({
      ...current,
      [key]: { ...current[key], time: value },
    }));
  };

  const activeSlots = MEAL_SLOTS.filter((slot) => slots[slot.key].enabled);
  const summaryText = !masterEnabled
    ? "복약 알림이 꺼져 있습니다."
    : activeSlots.length === 0
      ? "켜진 알림 시간대가 없습니다."
      : `${selectedDays.length}일 반복 · ${activeSlots
          .map((slot) => `${slot.label} ${slots[slot.key].time}`)
          .join(", ")}`;

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
            <Text style={styles.heroTitle}>복약 알림</Text>
            <Text style={styles.heroMeta}>시간대별로 약 먹을 시간을 알려드려요</Text>
          </View>
          <Switch
            value={masterEnabled}
            onValueChange={setMasterEnabled}
            trackColor={{ false: "#D6D5DF", true: "#C9C2FF" }}
            thumbColor={masterEnabled ? "#4025E8" : "#FFFFFF"}
          />
        </View>

        <Text style={styles.sectionTitle}>알림 시간대</Text>
        <View style={styles.panel}>
          {MEAL_SLOTS.map((slot, index) => {
            const state = slots[slot.key];
            const disabled = !masterEnabled;
            return (
              <View
                key={slot.key}
                style={[
                  styles.slotRow,
                  index === MEAL_SLOTS.length - 1 && styles.slotRowLast,
                  disabled && styles.slotRowDisabled,
                ]}
              >
                <Text style={styles.slotEmoji}>{slot.emoji}</Text>
                <Text style={styles.slotLabel} numberOfLines={1}>{slot.label}</Text>
                <TextInput
                  value={state.time}
                  onChangeText={(value) => updateSlotTime(slot.key, value)}
                  style={[styles.slotTimeInput, !state.enabled && styles.slotTimeMuted]}
                  keyboardType="numbers-and-punctuation"
                  editable={!disabled && state.enabled}
                  placeholder="00:00"
                  placeholderTextColor="#C0C4CC"
                />
                <Switch
                  value={state.enabled}
                  onValueChange={() => toggleSlot(slot.key)}
                  disabled={disabled}
                  trackColor={{ false: "#E1E0EA", true: "#C9C2FF" }}
                  thumbColor={state.enabled ? "#4025E8" : "#FFFFFF"}
                />
              </View>
            );
          })}
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
  heroTitle: {
    color: "#20212B",
    fontSize: 18,
    fontWeight: "800",
  },
  heroMeta: {
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
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  slotRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F5",
  },
  slotRowLast: {
    borderBottomWidth: 0,
  },
  slotRowDisabled: {
    opacity: 0.5,
  },
  slotEmoji: {
    fontSize: 20,
  },
  slotLabel: {
    flex: 1,
    color: "#20212B",
    fontSize: 15,
    fontWeight: "700",
  },
  slotTimeInput: {
    width: 72,
    color: "#20212B",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "right",
    paddingVertical: 8,
    paddingRight: 4,
  },
  slotTimeMuted: {
    color: "#C0C4CC",
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
