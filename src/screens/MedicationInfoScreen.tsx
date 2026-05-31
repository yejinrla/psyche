import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ChevronLeft, Pill } from "lucide-react-native";
import type { DailyMedicationInfo } from "../types";

export function MedicationInfoDialog({
  medication,
  onClose,
  onLogMedication,
}: {
  medication: DailyMedicationInfo | null;
  onClose: () => void;
  onLogMedication?: (medication: DailyMedicationInfo) => void;
}) {
  return (
    <Modal
      visible={medication !== null}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.medPageOverlay}>
        <View style={styles.medPageRoot}>
          {medication ? (
            <MedicationInfoScreen
              medication={medication}
              onClose={onClose}
              onLogMedication={onLogMedication ? () => onLogMedication(medication) : undefined}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

export function MedicationInfoScreen({
  medication,
  onClose,
  onLogMedication,
}: {
  medication: DailyMedicationInfo;
  onClose: () => void;
  onLogMedication?: () => void;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: "#F4F3F8" }}>
      {/* 헤더 */}
      <View style={styles.medPageHeader}>
        <Pressable style={styles.medPageBack} onPress={onClose}>
          <ChevronLeft color="#20212B" size={22} strokeWidth={2.5} />
        </Pressable>
        <Text style={styles.medPageTitle}>약 설명</Text>
        <Text style={styles.medPageRight}>처방약</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.medPageScroll}>
        {/* 히어로 카드 */}
        <View style={styles.medHeroCard}>
          <View style={styles.medHeroTop}>
            <View style={styles.medHeroPillBox}>
              <Pill color="#4025E8" size={28} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.medHeroNameRow}>
                <Text style={styles.medHeroName}>{medication.name}</Text>
                {medication.isActive && (
                  <View style={styles.medHeroActiveBadge}>
                    <Text style={styles.medHeroActiveBadgeText}>복용 중</Text>
                  </View>
                )}
              </View>
              <Text style={styles.medHeroSub}>{medication.englishName} · {medication.brandName}</Text>
            </View>
          </View>
          <Text style={styles.medHeroDesc}>{medication.description}</Text>
        </View>

        {/* 기본 정보 */}
        <Text style={styles.medSectionTitle}>기본 정보</Text>
        <View style={styles.medInfoGrid2}>
          {[
            { label: "성분", value: medication.ingredient },
            { label: "분류", value: medication.category },
            { label: "용량", value: medication.dose },
            { label: "복용 시간", value: medication.schedule },
          ].map(({ label, value }) => (
            <View key={label} style={styles.medInfoTile2}>
              <Text style={styles.medInfoTileLabel2}>{label}</Text>
              <Text style={styles.medInfoTileValue2}>{value}</Text>
            </View>
          ))}
        </View>

        {/* 흔한 부작용 */}
        <Text style={styles.medSectionTitle}>흔한 부작용</Text>
        <View style={styles.medInfoGrid2}>
          {medication.sideEffects.map((se) => (
            <View key={se.name} style={styles.medSideEffectTile}>
              <Text style={styles.medSideEffectEmoji}>{se.emoji}</Text>
              <View>
                <Text style={styles.medSideEffectName}>{se.name}</Text>
                <Text style={styles.medSideEffectFreq}>
                  {se.myCount != null ? `내 기록 ${se.myCount}회` : se.freq}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 복용 시 주의사항 */}
        <Text style={styles.medSectionTitle}>복용 시 주의사항</Text>
        <View style={styles.medCautionCard}>
          <Text style={styles.medCautionIcon}>⚠️</Text>
          <Text style={styles.medCautionText}>{medication.caution}</Text>
        </View>

        {/* 면책 */}
        <View style={styles.medDisclaimerRow}>
          <Text style={styles.medDisclaimerIcon}>ℹ️</Text>
          <Text style={styles.medDisclaimerText}>일반적인 의약품 정보예요. 복용·중단은 담당 의사·약사의 지시를 따르세요.</Text>
        </View>

        {/* 하단 버튼 */}
        <View style={styles.medActionRow}>
          <Pressable style={styles.medActionFill} onPress={onLogMedication}>
            <Text style={styles.medActionFillText}>✓  복약 기록</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  medPageOverlay: {
    flex: 1,
    backgroundColor: "#e8e9ec",
    alignItems: "center",
  },
  medPageRoot: {
    flex: 1,
    backgroundColor: "#F4F3F8",
    width: "100%",
    maxWidth: 390,
  },
  medPageHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: "#F4F3F8",
  },
  medPageBack: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  medPageTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#20212B",
  },
  medPageRight: {
    width: 36,
    textAlign: "right",
    fontSize: 13,
    color: "#4025E8",
    fontWeight: "600",
  },
  medPageScroll: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    gap: 0,
  },
  medHeroCard: {
    backgroundColor: "#EBE8FD",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    gap: 12,
  },
  medHeroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  medHeroPillBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  medHeroNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  medHeroName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a2e",
  },
  medHeroActiveBadge: {
    backgroundColor: "#4025E8",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  medHeroActiveBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  medHeroSub: {
    fontSize: 13,
    color: "#6B5FD0",
    marginTop: 2,
  },
  medHeroDesc: {
    fontSize: 14,
    color: "#3C3C55",
    lineHeight: 22,
  },
  medSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#20212B",
    marginBottom: 10,
    marginTop: 4,
  },
  medInfoGrid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  medInfoTile2: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  medInfoTileLabel2: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
  },
  medInfoTileValue2: {
    fontSize: 15,
    color: "#20212B",
    fontWeight: "700",
    lineHeight: 22,
  },
  medSideEffectTile: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  medSideEffectEmoji: {
    fontSize: 28,
  },
  medSideEffectName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#20212B",
  },
  medSideEffectFreq: {
    fontSize: 12,
    color: "#4025E8",
    fontWeight: "600",
    marginTop: 2,
  },
  medCautionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 20,
  },
  medCautionIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  medCautionText: {
    flex: 1,
    fontSize: 14,
    color: "#3C3C44",
    lineHeight: 22,
  },
  medDisclaimerRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  medDisclaimerIcon: {
    fontSize: 14,
  },
  medDisclaimerText: {
    flex: 1,
    fontSize: 12,
    color: "#999",
    lineHeight: 18,
  },
  medActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  medActionOutline: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#4025E8",
    alignItems: "center",
    justifyContent: "center",
  },
  medActionOutlineText: {
    color: "#4025E8",
    fontSize: 14,
    fontWeight: "700",
  },
  medActionFill: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#4025E8",
    alignItems: "center",
    justifyContent: "center",
  },
  medActionFillText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
