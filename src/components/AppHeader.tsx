import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Brain, Plus } from "lucide-react-native";
import { theme } from "../constants";
import type { ModalKind } from "../types";

export function AppHeader({
  openModal,
}: {
  openModal: (kind: Exclude<ModalKind, null>) => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.brandBlock}>
        <View style={styles.brandMark}>
          <Brain color={theme.teal} size={24} strokeWidth={2.4} />
        </View>
        <View>
          <Text style={styles.brandName}>Psyche</Text>
          <Text style={styles.brandCaption}>정신건강 치료 기록장</Text>
        </View>
      </View>
      <Pressable
        style={styles.headerAction}
        onPress={() => openModal("symptom")}
      >
        <Plus color={theme.surface} size={18} strokeWidth={2.5} />
        <Text style={styles.headerActionText}>기록</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 72,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: theme.line,
    borderBottomWidth: 1,
    backgroundColor: theme.background,
  },
  brandBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.tealSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    color: theme.ink,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: 0,
  },
  brandCaption: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  headerAction: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: theme.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  headerActionText: {
    color: theme.surface,
    fontSize: 14,
    fontWeight: "800",
  },
});
