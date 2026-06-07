import React, { useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Hospital,
  MapPin,
} from "lucide-react-native";
import { generateVisitPrepSummary } from "../utils/analytics";
import { daysUntil } from "../utils/date";
import type { PsycheData } from "../types";
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
  addQuestion,
  toggleQuestion,
  onClose,
}: {
  visible: boolean;
  data: PsycheData;
  appointmentDate?: string;
  appointmentTime?: string;
  hospitalName?: string;
  doctorName?: string;
  addQuestion: PsycheDataActions["addQuestion"];
  toggleQuestion: PsycheDataActions["toggleQuestion"];
  onClose: () => void;
}) {
  const [inputVisible, setInputVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleAddQuestion = () => {
    if (inputText.trim()) {
      addQuestion(inputText.trim());
    }
    setInputText("");
    setInputVisible(false);
  };

  const summary = generateVisitPrepSummary(data);
  const dday = appointmentDate ? Math.max(daysUntil(appointmentDate), 0) : null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.container}>
        {/* 상단 바 */}
        <View style={styles.topBar}>
          <View style={styles.topBarSpacer} />
          <View style={styles.topBarHandle} />
          <View style={styles.topBarSpacer}>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>
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
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>진료 준비 메모</Text>
          </View>
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
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>의사에게 물어볼 질문</Text>
            {!inputVisible && (
              <Pressable
                style={styles.addBtn}
                onPress={() => {
                  setInputVisible(true);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
              >
                <Text style={styles.addBtnText}>+ 질문 추가</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.listStack}>
            {data.questions.length === 0 && !inputVisible ? (
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

            {/* 인라인 입력 — 목록 맨 아래 */}
            {inputVisible && (
              <View style={styles.questionInputRow}>
                <TextInput
                  ref={inputRef}
                  style={styles.questionInput}
                  placeholder="궁금한 점을 입력하세요"
                  placeholderTextColor="#B0AECC"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleAddQuestion}
                  returnKeyType="done"
                  autoFocus
                />
                <Pressable style={styles.inputSaveBtn} onPress={handleAddQuestion}>
                  <Text style={styles.inputSaveBtnText}>추가</Text>
                </Pressable>
                <Pressable
                  style={styles.inputCancelBtn}
                  onPress={() => { setInputText(""); setInputVisible(false); }}
                >
                  <Text style={styles.inputCancelBtnText}>✕</Text>
                </Pressable>
              </View>
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
    backgroundColor: "rgba(16,24,32,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: "90%",
    maxWidth: 360,
    maxHeight: "85%",
    backgroundColor: "#F7F6FB",
    borderRadius: 24,
    overflow: "hidden",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  topBarSpacer: {
    flex: 1,
    alignItems: "flex-end",
  },
  topBarHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD9F8",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F0EFF8",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 14,
    color: "#9096A2",
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
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
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#20212B",
    fontSize: 15,
    fontWeight: "800",
  },
  addBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#EBE8FD",
  },
  addBtnText: {
    color: "#4025E8",
    fontSize: 12,
    fontWeight: "700",
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

  // 인라인 질문 입력
  questionInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    ...shadow,
  },
  questionInput: {
    flex: 1,
    fontSize: 14,
    color: "#20212B",
    paddingVertical: 4,
    outlineStyle: "none",
  } as any,
  inputSaveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#4025E8",
  },
  inputSaveBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  inputCancelBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F0EFF8",
    alignItems: "center",
    justifyContent: "center",
  },
  inputCancelBtnText: {
    color: "#9096A2",
    fontSize: 12,
    fontWeight: "700",
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
