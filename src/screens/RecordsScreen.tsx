import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Activity, Bell, ChevronLeft, ChevronRight, Hospital } from "lucide-react-native";
import {
  RatingBadge,
  SegmentedControl,
} from "../components/SharedComponents";
import { ButterflyIcon } from "../components/ButterflyIcon";
import { theme } from "../constants";
import { formatFullDate, formatShortDate, sortByDateDesc } from "../utils/date";
import type { MedicationEvent, ModalKind, PsycheData, Visit } from "../types";

function VisitCostCard({ cost }: { cost: number }) {
  return (
    <>
      <View style={styles.detailSectionRow}>
        <Text style={styles.detailSectionIcon}>💳</Text>
        <Text style={styles.detailSectionTitle}>진료비</Text>
      </View>
      <View style={styles.detailCostCard}>
        <Text style={styles.detailCostLabel}>본인부담금</Text>
        <Text style={styles.detailCostAmount}>{cost.toLocaleString("ko-KR")}원</Text>
      </View>
    </>
  );
}

function VisitDetailScreen({
  visit,
  visitIndex,
  medEvents,
  onBack,
}: {
  visit: Visit;
  visitIndex: number;
  medEvents: MedicationEvent[];
  onBack: () => void;
}) {
  const d = new Date(visit.date);
  const DOW = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${DOW})`;

  const nextD = visit.nextAppointment ? new Date(visit.nextAppointment.date) : null;
  const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F3F8" }}>
      {/* 헤더 */}
      <View style={styles.detailHeader}>
        <Pressable style={styles.detailBack} onPress={onBack}>
          <ChevronLeft color="#20212B" size={22} strokeWidth={2.5} />
        </Pressable>
        <Text style={styles.detailTitle}>방문 기록</Text>
        <View style={styles.detailBadge}>
          <Text style={styles.detailBadgeText}>{visitIndex}회차</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScroll}>
        {/* 히어로 카드 */}
        <View style={styles.detailHeroCard}>
          <View style={styles.detailHeroTop}>
            {visit.outcomes.length > 0 && (
              <View style={styles.detailOutcomeChip}>
                <Text style={styles.detailOutcomeChipText}>{visit.outcomes[0]}</Text>
              </View>
            )}
            <Text style={styles.detailHeroDate}>{dateStr}</Text>
          </View>
          <View style={styles.detailHospitalRow}>
            <View style={styles.detailHospitalIcon}>
              <Hospital color="#4025E8" size={22} strokeWidth={2.2} />
            </View>
            <View>
              <Text style={styles.detailHospitalName}>{visit.hospitalName}</Text>
              <Text style={styles.detailHospitalSub}>{visit.doctorName} · {visit.nextAppointment?.time ?? "시간 미입력"}</Text>
            </View>
          </View>
        </View>

        {/* 의사 소견 */}
        {visit.notes ? (
          <>
            <View style={styles.detailSectionRow}>
              <Text style={styles.detailSectionIcon}>🗒</Text>
              <Text style={styles.detailSectionTitle}>의사 소견</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailCardText}>{visit.notes}</Text>
            </View>
          </>
        ) : null}

        {/* 이날의 처방 */}
        {medEvents.length > 0 ? (
          <>
            <View style={styles.detailSectionRow}>
              <Text style={styles.detailSectionIcon}>∞</Text>
              <Text style={styles.detailSectionTitle}>이날의 처방</Text>
            </View>
            {medEvents.map((ev) => (
              <View key={ev.id} style={[styles.detailCard, styles.detailPrescriptionCard]}>
                <View style={styles.detailPillIcon}>
                  <Text style={{ fontSize: 18 }}>💊</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.detailDrugTopRow}>
                    <Text style={styles.detailDrugName}>{ev.medicationName}</Text>
                    {ev.fromDose && ev.toDose ? (
                      <View style={styles.detailDoseChange}>
                        <Text style={styles.detailDoseFrom}>{ev.fromDose}</Text>
                        <Text style={styles.detailDoseArrow}> › </Text>
                        <Text style={styles.detailDoseTo}>{ev.toDose}</Text>
                      </View>
                    ) : ev.toDose ? (
                      <Text style={styles.detailDoseTo}>{ev.toDose}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.detailDrugSub}>{ev.frequency ?? ev.description}</Text>
                </View>
              </View>
            ))}
          </>
        ) : null}

        {/* 진료비 */}
        {visit.cost > 0 ? <VisitCostCard cost={visit.cost} /> : null}

        {/* 내 메모 */}
        <View style={styles.detailSectionRow}>
          <Text style={styles.detailSectionIcon}>♡</Text>
          <Text style={styles.detailSectionTitle}>내 메모</Text>
        </View>
        <View style={styles.detailCard}>
          <Text style={styles.detailCardText}>메모 없음</Text>
        </View>

        {/* 다음 예약 */}
        {nextD ? (
          <>
            <View style={styles.detailSectionRow}>
              <Text style={styles.detailSectionIcon}>📅</Text>
              <Text style={styles.detailSectionTitle}>다음 예약</Text>
            </View>
            <Pressable style={[styles.detailCard, styles.detailNextCard]}>
              <View style={styles.detailCalBadge}>
                <Text style={styles.detailCalMonth}>{MONTHS[nextD.getMonth()]}</Text>
                <Text style={styles.detailCalDay}>{nextD.getDate()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailNextTitle}>{visitIndex + 1}회차 진료</Text>
                <Text style={styles.detailNextSub}>{visit.nextAppointment!.time} · 경과 관찰</Text>
              </View>
              <ChevronRight color="#999" size={18} strokeWidth={2.2} />
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

export function RecordsScreen({
  data,
  openModal,
}: {
  data: PsycheData;
  openModal: (kind: Exclude<ModalKind, null>) => void;
}) {
  const [segment, setSegment] = useState<"visits" | "symptomSideEffects">(
    "visits",
  );
  const [selectedVisit, setSelectedVisit] = useState<{ visit: Visit; index: number } | null>(null);
  const visits = sortByDateDesc(data.visits);
  const symptoms = sortByDateDesc(data.symptomLogs);
  const sideEffects = sortByDateDesc(data.sideEffectLogs);
  const symptomSideEffects = [
    ...symptoms.map((log) => ({ kind: "symptom" as const, log })),
    ...sideEffects.map((log) => ({ kind: "sideEffect" as const, log })),
  ].sort((a, b) => b.log.date.localeCompare(a.log.date));

  if (selectedVisit) {
    const matchedEvents = (data.medicationEvents ?? []).filter(
      (e) => e.date === selectedVisit.visit.date
    );
    return (
      <VisitDetailScreen
        visit={selectedVisit.visit}
        visitIndex={selectedVisit.index}
        medEvents={matchedEvents}
        onBack={() => setSelectedVisit(null)}
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.recordsHeader}>
        <View style={styles.recordsTopRow}>
          <View style={styles.headerBrand}>
            <ButterflyIcon color="#4025E8" />
          </View>
          <View style={styles.headerBrandSpacer} />
          <Pressable style={styles.notificationButton}>
            <Bell color="#20212B" size={20} strokeWidth={2.6} />
          </Pressable>
        </View>
        <Text style={styles.recordsTitle}>기록</Text>
      </View>

      <SegmentedControl
        value={segment}
        options={[
          { label: "방문", value: "visits" },
          { label: "증상·부작용", value: "symptomSideEffects" },
        ]}
        onChange={setSegment}
      />

      {segment === "visits" ? (
        <View style={styles.listStack}>
          <Pressable
            style={styles.fullWidthAction}
            onPress={() => openModal("visit")}
          >
            <Hospital color={theme.surface} size={19} strokeWidth={2.3} />
            <Text style={styles.fullWidthActionText}>병원 방문 기록 추가</Text>
          </Pressable>
          {visits.map((visit, i) => (
            <Pressable
              key={visit.id}
              style={styles.recordPanel}
              onPress={() => setSelectedVisit({ visit, index: visits.length - i })}
            >
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.itemTitle}>{visit.hospitalName}</Text>
                  <Text style={styles.itemMeta}>
                    {formatFullDate(visit.date)}
                  </Text>
                </View>
                <Text style={styles.costText}>
                  {visit.cost.toLocaleString("ko-KR")}원
                </Text>
              </View>
              <Text style={styles.recordBody} numberOfLines={2}>{visit.notes}</Text>
              <View style={styles.chipRow}>
                {visit.outcomes.map((outcome) => (
                  <View key={outcome} style={styles.staticChip}>
                    <Text style={styles.staticChipText}>{outcome}</Text>
                  </View>
                ))}
              </View>
              {visit.nextAppointment ? (
                <View style={styles.appointmentLine}>
                  <Bell color={theme.blue} size={16} strokeWidth={2.2} />
                  <Text style={styles.itemMeta}>
                    다음 진료 {formatShortDate(visit.nextAppointment.date)}{" "}
                    {visit.nextAppointment.time}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      {segment === "symptomSideEffects" ? (
        <View style={styles.listStack}>
          <Pressable
            style={styles.fullWidthAction}
            onPress={() => openModal("symptom")}
          >
            <Activity color={theme.surface} size={19} strokeWidth={2.3} />
            <Text style={styles.fullWidthActionText}>증상 추가</Text>
          </Pressable>
          {symptomSideEffects.map((item) => (
            item.kind === "symptom" ? (
              <View key={`symptom-${item.log.id}`} style={styles.recordPanel}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.itemTitle}>{item.log.symptom}</Text>
                    <Text style={styles.recordTypeText}>증상</Text>
                  </View>
                  <RatingBadge rating={item.log.level} />
                </View>
                <Text style={styles.itemMeta}>{formatFullDate(item.log.date)}</Text>
                {item.log.situation ? (
                  <Text style={styles.recordBody}>상황: {item.log.situation}</Text>
                ) : null}
                {item.log.memo ? (
                  <Text style={styles.recordBody}>{item.log.memo}</Text>
                ) : null}
              </View>
            ) : (
              <View key={`sideEffect-${item.log.id}`} style={styles.recordPanel}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.itemTitle}>{item.log.effects.join(", ")}</Text>
                    <Text style={styles.recordTypeText}>부작용</Text>
                  </View>
                  <RatingBadge rating={item.log.intensity} />
                </View>
                <Text style={styles.itemMeta}>{formatFullDate(item.log.date)}</Text>
                {item.log.memo ? (
                  <Text style={styles.recordBody}>{item.log.memo}</Text>
                ) : null}
              </View>
            )
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 122,
    gap: 14,
  },
  recordsHeader: {
    paddingHorizontal: 10,
  },
  recordsTopRow: {
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
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#20212B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recordsTitle: {
    color: "#20212B",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "left",
    marginTop: 2,
  },
  listStack: {
    gap: 12,
  },
  fullWidthAction: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: theme.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fullWidthActionText: {
    color: theme.surface,
    fontSize: 14,
    fontWeight: "900",
  },
  recordPanel: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 16,
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
  recordTypeText: {
    color: theme.teal,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },
  costText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "800",
  },
  recordBody: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  staticChip: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: theme.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  staticChipText: {
    color: theme.blue,
    fontSize: 12,
    fontWeight: "800",
  },
  appointmentLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  // ── Visit Detail ──────────────────────────────
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#F4F3F8",
  },
  detailBack: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  detailTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#20212B",
  },
  detailBadge: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E1E0EE",
  },
  detailBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4025E8",
  },
  detailScroll: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    gap: 10,
  },
  detailHeroCard: {
    backgroundColor: "#EBE8FD",
    borderRadius: 20,
    padding: 18,
    gap: 14,
    marginBottom: 6,
  },
  detailHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailOutcomeChip: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detailOutcomeChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4025E8",
  },
  detailHeroDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4025E8",
  },
  detailHospitalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailHospitalIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  detailHospitalName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1a1a2e",
  },
  detailHospitalSub: {
    fontSize: 13,
    color: "#6B5FD0",
    marginTop: 2,
  },
  detailSectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 2,
  },
  detailSectionIcon: {
    fontSize: 15,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3C3C44",
  },
  detailCostCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailCostLabel: {
    fontSize: 14,
    color: "#888",
    fontWeight: "600",
  },
  detailCostAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#20212B",
  },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  detailCardText: {
    fontSize: 14,
    color: "#3C3C44",
    lineHeight: 22,
  },
  detailPrescriptionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailPillIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EBE8FD",
    alignItems: "center",
    justifyContent: "center",
  },
  detailDrugTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  detailDrugName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#20212B",
  },
  detailDrugSub: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  detailDoseChange: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailDoseFrom: {
    fontSize: 13,
    color: "#aaa",
    fontWeight: "600",
  },
  detailDoseArrow: {
    fontSize: 13,
    color: "#4025E8",
    fontWeight: "700",
  },
  detailDoseTo: {
    fontSize: 13,
    color: "#4025E8",
    fontWeight: "800",
  },
  detailNextCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  detailCalBadge: {
    width: 48,
    alignItems: "center",
  },
  detailCalMonth: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4025E8",
    letterSpacing: 0.5,
  },
  detailCalDay: {
    fontSize: 26,
    fontWeight: "900",
    color: "#20212B",
    lineHeight: 30,
  },
  detailNextTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#20212B",
  },
  detailNextSub: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
});
