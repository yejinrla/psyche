import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Bell, Search } from "lucide-react-native";
import { ButterflyIcon } from "../components/ButterflyIcon";
import { TimelineEventRow } from "../components/SharedComponents";
import type { TimelineItem } from "../types";

const TIMELINE_FILTERS = ["진료", "증상", "복약", "부작용"] as const;
type TimelineFilter = typeof TIMELINE_FILTERS[number];

const FILTER_TYPES: Record<TimelineFilter, TimelineItem["type"][]> = {
  진료: ["visit"],
  증상: ["symptom", "effect"],
  복약: ["medication"],
  부작용: ["sideEffect"],
};

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

export function TimelineScreen({ timeline }: { timeline: TimelineItem[] }) {
  const weekDays = useMemo(() => buildWeekStrip(), []);
  const [activeFilter, setActiveFilter] = useState<TimelineFilter | null>(null);
  const visibleTimeline = useMemo(() => {
    if (!activeFilter) {
      return timeline;
    }

    const types = FILTER_TYPES[activeFilter];
    return timeline.filter((item) => types.includes(item.type));
  }, [activeFilter, timeline]);

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
        <Text style={[styles.morningTitle, { textAlign: "left", marginTop: 2 }]}>타임라인</Text>

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
                style={[styles.tlFilterChip, active && styles.tlFilterChipActive]}
                onPress={() => setActiveFilter(active ? null : filter)}
              >
                <Text style={[styles.tlFilterChipText, active && styles.tlFilterChipTextActive]}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.timelineCardList}>
        {Object.entries(
          visibleTimeline.reduce<Record<string, TimelineItem[]>>((acc, item) => {
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
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 2,
  },
  tlFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F2F2F4",
    alignItems: "center",
    justifyContent: "center",
  },
  tlFilterChipActive: {
    backgroundColor: "#20212B",
  },
  tlFilterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9096A2",
  },
  tlFilterChipTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  timelineCardList: {
    gap: 0,
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
    overflow: "hidden",
    ...cardShadow,
  },
});
