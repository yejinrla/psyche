import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  InfoPill,
  SectionHeader,
  TimelineEventRow,
} from "../components/SharedComponents";
import { ScreenTopHeader } from "../components/ScreenTopHeader";
import { theme } from "../constants";
import { activeMedications } from "../utils/analytics";
import { daysBetween, sortByDateDesc } from "../utils/date";
import type { ModalKind, PsycheData } from "../types";

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

export function MedicationScreen({
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
      <ScreenTopHeader title="약물" />
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

const styles = StyleSheet.create({
  screenContent: {
    padding: 20,
    paddingBottom: 28,
    gap: 16,
  },
  listStack: {
    gap: 12,
  },
  medPanel: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 16,
    gap: 12,
    ...shadow,
  },
  rowBetweenTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
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
  recordBody: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  timelinePanel: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    paddingTop: 16,
    paddingHorizontal: 16,
    ...shadow,
  },
  archivedRow: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 14,
    gap: 6,
    ...shadow,
  },
});
