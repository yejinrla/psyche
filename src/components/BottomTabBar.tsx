import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  GitBranch,
  Home,
  MoreHorizontal,
  Pill,
  Plus,
} from "lucide-react-native";
import { theme } from "../constants";
import type { TabKey } from "../types";

type IconComponent = React.ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

const tabs: { key: TabKey; label: string; icon: IconComponent }[] = [
  { key: "home", label: "홈", icon: Home },
  { key: "timeline", label: "타임라인", icon: GitBranch },
  { key: "records", label: "기록", icon: Plus },
  { key: "medications", label: "약물", icon: Pill },
  { key: "report", label: "더보기", icon: MoreHorizontal },
];

export function BottomTabBar({
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

const styles = StyleSheet.create({
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
});
