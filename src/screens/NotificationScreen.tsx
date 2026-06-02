import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { activeMedications, latestAppointment } from "../utils/analytics";
import { daysUntil, formatShortDate, sortByDateDesc } from "../utils/date";
import type { PsycheData } from "../types";

type NotificationItem = {
  id: string;
  emoji: string;
  title: string;
  body: string;
  dateLabel: string;
  highlight?: boolean;
};

function buildNotifications(data: PsycheData): NotificationItem[] {
  const items: NotificationItem[] = [];

  // 다음 진료 예약 알림
  const appointment = latestAppointment(data);
  if (appointment) {
    const dday = daysUntil(appointment.date);
    items.push({
      id: `appt-${appointment.date}`,
      emoji: "🏥",
      title: "다음 진료 예약 안내",
      body: `${formatShortDate(appointment.date)} ${appointment.time} 진료가 예정되어 있어요.`,
      dateLabel: dday <= 0 ? "오늘" : `D-${dday}`,
      highlight: dday >= 0 && dday <= 3,
    });
  }

  // 복약 알림 (활성 약)
  const activeMeds = activeMedications(data.medications);
  activeMeds.forEach((med) => {
    const when = med.schedule?.length ? med.schedule.join(" · ") : med.frequency;
    items.push({
      id: `med-${med.id}`,
      emoji: "💊",
      title: `${med.name} 복약 알림`,
      body: `${when} · ${med.dose} 복용 시간이에요.`,
      dateLabel: "매일",
    });
  });

  // 최근 약물 변경 이력
  const recentEvents = sortByDateDesc(data.medicationEvents).slice(0, 5);
  recentEvents.forEach((event) => {
    items.push({
      id: `event-${event.id}`,
      emoji: "🔔",
      title: event.title,
      body: event.description,
      dateLabel: formatShortDate(event.date),
    });
  });

  return items;
}

export function NotificationDialog({
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
          <NotificationScreen data={data} onClose={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function NotificationScreen({
  data,
  onClose,
}: {
  data: PsycheData;
  onClose: () => void;
}) {
  const notifications = buildNotifications(data);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onClose}>
          <ChevronLeft color="#20212B" size={22} strokeWidth={2.5} />
        </Pressable>
        <Text style={styles.headerTitle}>알림</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyText}>아직 받은 알림이 없어요.</Text>
          </View>
        ) : (
          notifications.map((item) => (
            <View
              key={item.id}
              style={[styles.card, item.highlight && styles.cardHighlight]}
            >
              <View style={styles.iconBox}>
                <Text style={styles.iconEmoji}>{item.emoji}</Text>
              </View>
              <View style={styles.cardText}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text
                    style={[styles.cardDate, item.highlight && styles.cardDateHighlight]}
                  >
                    {item.dateLabel}
                  </Text>
                </View>
                <Text style={styles.cardBody}>{item.body}</Text>
              </View>
            </View>
          ))
        )}
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
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
  },
  cardHighlight: {
    backgroundColor: "#EBE8FD",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F0EFF8",
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 20,
  },
  cardText: {
    flex: 1,
    gap: 5,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    color: "#20212B",
    fontSize: 15,
    fontWeight: "800",
  },
  cardDate: {
    color: "#9096A2",
    fontSize: 12,
    fontWeight: "700",
  },
  cardDateHighlight: {
    color: "#4025E8",
  },
  cardBody: {
    color: "#6F7280",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 36,
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyText: {
    color: "#9096A2",
    fontSize: 14,
    fontWeight: "700",
  },
});
