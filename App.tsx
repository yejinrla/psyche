import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

import { theme } from "./src/constants";
import { usePsycheData } from "./src/hooks/usePsycheData";
import type { DailyMedicationInfo, Medication, ModalKind, TabKey } from "./src/types";
import { buildTimeline } from "./src/utils/analytics";

import { BottomTabBar } from "./src/components/BottomTabBar";

import { HomeScreen } from "./src/screens/HomeScreen";
import { TimelineScreen } from "./src/screens/TimelineScreen";
import { RecordsScreen } from "./src/screens/RecordsScreen";
import { MedicationScreen } from "./src/screens/MedicationScreen";
import { ReportScreen } from "./src/screens/ReportScreen";
import { EntryModal } from "./src/screens/EntryModal";
import { MedicationInfoDialog } from "./src/screens/MedicationInfoScreen";
import { MedicationReminderDialog } from "./src/screens/MedicationReminderScreen";

export default function App() {
  const actions = usePsycheData();
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [modalKind, setModalKind] = useState<ModalKind>(null);
  const [modalContext, setModalContext] = useState<{ medicationName?: string; dose?: string; medication?: Medication } | undefined>();
  const [medicationInfo, setMedicationInfo] =
    useState<DailyMedicationInfo | null>(null);
  const [reminderMedication, setReminderMedication] =
    useState<DailyMedicationInfo | null>(null);

  const timeline = useMemo(() => buildTimeline(actions.data), [actions.data]);

  const openModal = (kind: Exclude<ModalKind, null>) => setModalKind(kind);

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            data={actions.data}
            openModal={openModal}
            onOpenMedicationInfo={setMedicationInfo}
          />
        );
      case "records":
        return <RecordsScreen data={actions.data} openModal={openModal} />;
      case "medications":
        return (
          <MedicationScreen
            data={actions.data}
            openModal={openModal}
            onEditMedication={(med) => {
              setModalContext({ medication: med });
              setModalKind("editMedication");
            }}
            onLogMedication={(med) => {
              setModalContext({ medicationName: med.name, dose: med.dose });
              setModalKind("medicationLog");
            }}
          />
        );
      case "timeline":
        return <TimelineScreen timeline={timeline} />;
      case "report":
        return (
          <ReportScreen
            data={actions.data}
            openModal={openModal}
            resetDemoData={actions.resetDemoData}
            toggleQuestion={actions.toggleQuestion}
            onOpenMedicationReminder={setReminderMedication}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <View style={styles.screen}>{renderScreen()}</View>
        <BottomTabBar activeTab={activeTab} onChange={setActiveTab} />
      </View>
      <EntryModal
        kind={modalKind}
        actions={actions}
        onClose={() => { setModalKind(null); setModalContext(undefined); }}
        modalContext={modalContext}
      />
      <MedicationInfoDialog
        medication={medicationInfo}
        onClose={() => setMedicationInfo(null)}
        onLogMedication={(med) => {
          setMedicationInfo(null);
          setModalContext({ medicationName: med.name, dose: med.dose });
          setModalKind("medicationLog");
        }}
      />
      <MedicationReminderDialog
        medication={reminderMedication}
        onClose={() => setReminderMedication(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  appShell: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
    alignSelf: "center",
    backgroundColor: theme.background,
  },
  screen: {
    flex: 1,
  },
});
