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
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Hospital,
  MapPin,
} from "lucide-react-native";
import { generateVisitPrepSummary } from "../utils/analytics";
import { daysUntil } from "../utils/date";
import { SectionHeader } from "../components/SharedComponents";
import type { ModalKind, PsycheData } from "../types";
import type { PsycheDataActions } from "../hooks/usePsycheData";

const shadow = Platform.select({
  ios: {
    shadowColor: "#4025E8",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 2 },
  default: {},
});

export function NextVisitScreen({
  visible,
  data,
  appointmentDate,
  appointmentTime,
  hospitalName,
  doctorName,
  openModal,
  toggleQuestion,
  onClose,
}: {
  visible: boolean;
  data: PsycheData;
  appointmentDate?: string;
  appointmentTime?: string;
  hospitalName?: string;
  doctorName?: string;
  openModal: (kind: Exclude<ModalKind, null>) => void;
  toggleQuestion: PsycheDataActions["toggleQuestion"];
  onClose: () => void;
}) {
  const summary = generateVisitPrepSummary(data);
  const dday = appointmentDate ? Math.max(daysUntil(appointmentDate), 0) : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
      <View style={styles.container}>
        {/* 핸들 */}
        <View style={styles.handleBar} />
        {/* 헤더 */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onClose} hitSlop={8}>
            <ArrowLeft color="#20212B" size={22} strokeWidth={2.4} />
          </Pressable>
          <Text style={styles.headerTitle}>다음 진료 준비</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* 진료 일정 카드 */}
          <View style={styles.apptCard}>
            <View style={styles.apptTopRow}>
              <View style={styles.apptIconBox}>
                <Hospital color="#4025E8" size={20} strokeWidth={2.4} />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.apptHospital}>
                  {hospitalName ?? "병원 정보 없음"}
                </Text>
                {doctorName ? (
                  <Text style={styles.apptDoctor}>{doctorName} 원장</Text>
                ) : null}
              </View>
              {dday !== null && (
                <View style={styles.ddayBadge}>
                  <Text style={styles.ddayText}>D-{dday}</Text>
                </View>
              )}
            </View>

            <View style={styles.apptInfoList}>
              {appointmentDate ? (
                <View style={styles.apptInfoRow}>
                  <CalendarDays color="#9096A2" size={15} strokeWidth={2.2} />
                  <Text style={styles.apptInfoText}>{appointmentDate}</Text>
                </View>
              ) : null}
              {appointmentTime ? (
                <View style={styles.apptInfoRow}>
                  <Clock color="#9096A2" size={15} strokeWidth={2.2} />
                  <Text style={styles.apptInfoText}>{appointmentTime}</Text>
                </View>
              ) : null}
              {hospitalName ? (
                <View style={styles.apptInfoRow}>
                  <MapPin color="#9096A2" size={15} strokeWidth={2.2} />
                  <Text style={styles.apptInfoText}>{hospitalName}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* 진료 준비 메모 */}
          <Text style={styles.sectionTitle}>진료 준비 메모</Text>
          <View style={styles.panel}>
            {summary.map((item, index) => (
              <View
                key={item}
                style={[
                  styles.summaryRow,
                  index === summary.length - 1 && styles.summaryRowLast,
                ]}
              >
                <CheckCircle2 color="#4025E8" size={17} strokeWidth={2.4} />
                <Text style={styles.summaryText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* 의사에게 물어볼 질문 */}
          <SectionHeader
            title="의사에게 물어볼 질문"
            actionLabel="질문 추가"
            onAction={() => openModal("question")}
          />
          <View style={styles.listStack}>
            {data.questions.length === 0 ? (
              <View style={styles.emptyPanel}>
                <Text style={styles.emptyText}>아직 등록된 질문이 없어요</Text>
              </View>
            ) : (
              data.questions.map((question) => (
                <Pressable
                  key={question.id}
                  style={styles.questionRow}
                  onPress={() => toggleQuestion(question.id)}
                >
                  <View
                    style={[
                      styles.questionCheck,
                      question.resolved && styles.questionCheckDone,
                    ]}
                  >
                    {question.resolved ? (
                      <CheckCircle2 color="#fff" size={16} strokeWidth={2.5} />
                    ) : null}
                  </View>
                  <View style={styles.flex1}>
                    <Text
                      style={[
                        styles.questionText,
                        question.resolved && styles.questionTextDone,
                      ]}
                    >
                      {question.text}
                    </Text>
                    <Text style={styles.questionMeta}>
                      {question.createdAt}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </ScrollView>
      </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  container: {
    width: "100%",
    maxWidth: 390,
    height: "92%",
    backgroundColor: "#F7F6FB",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD9F8",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEDF8",
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#20212B",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 14,
  },
  flex1: { flex: 1 },

  // 진료 일정 카드
  apptCard: {
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 18,
    gap: 14,
    ...shadow,
  },
  apptTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  apptIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EBE8FD",
    alignItems: "center",
    justifyContent: "center",
  },
  apptHospital: {
    fontSize: 17,
    fontWeight: "800",
    color: "#20212B",
  },
  apptDoctor: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9096A2",
    marginTop: 2,
  },
  ddayBadge: {
    minHeight: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: "#EBE8FD",
    alignItems: "center",
    justifyContent: "center",
  },
  ddayText: {
    color: "#4025E8",
    fontSize: 14,
    fontWeight: "800",
  },
  apptInfoList: {
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#F0EFF8",
  },
  apptInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  apptInfoText: {
    color: "#6F7280",
    fontSize: 13,
    fontWeight: "600",
  },

  // 섹션
  sectionTitle: {
    color: "#20212B",
    fontSize: 16,
    fontWeight: "800",
  },
  panel: {
    borderRadius: 18,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...shadow,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EFF8",
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  summaryText: {
    flex: 1,
    color: "#3C3C44",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },

  // 질문
  listStack: { gap: 12 },
  emptyPanel: {
    borderRadius: 18,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    ...shadow,
  },
  emptyText: {
    color: "#9096A2",
    fontSize: 14,
    fontWeight: "600",
  },
  questionRow: {
    borderRadius: 18,
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    gap: 11,
    ...shadow,
  },
  questionCheck: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#DDD9F8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  questionCheckDone: {
    borderColor: "#4025E8",
    backgroundColor: "#4025E8",
  },
  questionText: {
    color: "#20212B",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  questionTextDone: {
    color: "#9096A2",
    textDecorationLine: "line-through",
  },
  questionMeta: {
    color: "#9096A2",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    fontWeight: "600",
  },
});
