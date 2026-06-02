import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Bell } from "lucide-react-native";
import { ButterflyIcon } from "./ButterflyIcon";

export function ScreenTopHeader({ title }: { title: string }) {
  return (
    <View>
      <View style={styles.topRow}>
        <View style={styles.brand}>
          <ButterflyIcon color="#4025E8" />
        </View>
        <View style={styles.spacer} />
        <Pressable style={styles.notificationButton}>
          <Bell color="#20212B" size={20} strokeWidth={2.6} />
        </Pressable>
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  brand: {
    width: 36,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  spacer: {
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
  title: {
    color: "#20212B",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    letterSpacing: 0,
    textAlign: "left",
    marginTop: 2,
  },
});
