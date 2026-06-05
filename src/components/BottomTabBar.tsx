import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  CircleUserRound,
  ClipboardList,
  GitBranch,
  Home,
  Pill,
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
  { key: "records", label: "기록", icon: ClipboardList },
  { key: "medications", label: "약물", icon: Pill },
  { key: "report", label: "마이", icon: CircleUserRound },
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

        return (
          <Pressable
            key={key}
            style={[
              styles.tabItem,
              selected && styles.tabItemActive,
            ]}
            onPress={() => onChange(key)}
          >
            <View>
              <Icon
                color={selected ? "#4025E8" : theme.muted}
                size={21}
                strokeWidth={2.3}
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
    height: 74,
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 4,
    borderTopColor: "#E3E8F0",
    borderTopWidth: 1,
    backgroundColor: theme.surface,
    flexDirection: "row",
  },
  tabItem: {
    flex: 1,
    height: 62,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: "transparent",
  },
  tabLabel: {
    color: "#9AA6B8",
    fontSize: 12,
    fontWeight: "800",
  },
  tabLabelActive: {
    color: "#4025E8",
  },
});
