import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

import { theme } from "./src/constants";
import { usePsycheData } from "./src/hooks/usePsycheData";
import type { DailyMedicationInfo, Medication, ModalKind, TabKey } from "./src/types";
import { buildTimeline } from "./src/utils/analytics";
import { todayISO as getTodayISO } from "./src/utils/date";

import { BottomTabBar } from "./src/components/BottomTabBar";

import { HomeScreen } from "./src/screens/HomeScreen";
import { TimelineScreen } from "./src/screens/TimelineScreen";
import { RecordsScreen } from "./src/screens/RecordsScreen";
import { MedicationScreen } from "./src/screens/MedicationScreen";
import { ReportScreen } from "./src/screens/ReportScreen";
import { EntryModal } from "./src/screens/EntryModal";
import { MedicationInfoDialog } from "./src/screens/MedicationInfoScreen";
import { MedicationReminderDialog } from "./src/screens/MedicationReminderScreen";
import { AppointmentReminderDialog } from "./src/screens/AppointmentReminderScreen";
import { NotificationDialog } from "./src/screens/NotificationScreen";
import { NextVisitScreen } from "./src/screens/NextVisitScreen";

export default function App() {
  const actions = usePsycheData();
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [modalKind, setModalKind] = useState<ModalKind>(null);
  const [modalContext, setModalContext] = useState<{ medicationName?: string; dose?: string; medication?: Medication } | undefined>();
  const [medicationInfo, setMedicationInfo] =
    useState<DailyMedicationInfo | null>(null);
  const [reminderVisible, setReminderVisible] = useState(false);
  const [appointmentReminderVisible, setAppointmentReminderVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [nextVisitVisible, setNextVisitVisible] = useState(false);

  const goHome = () => setActiveTab("home");
  const openNotifications = () => setNotificationsVisible(true);

  const today = getTodayISO();
  const nextAppointmentVisit = useMemo(() => {
    const candidates = actions.data.visits
      .flatMap((v) =>
        v.nextAppointment
          ? [{ hospitalName: v.hospitalName, doctorName: v.doctorName, appointment: v.nextAppointment }]
          : [],
      )
      .sort((a, b) => a.appointment.date.localeCompare(b.appointment.date));
    return candidates.find(({ appointment }) => appointment.date >= today);
  }, [actions.data.visits]);

  const timeline = useMemo(() => buildTimeline(actions.data), [actions.data]);

  const openModal = (kind: Exclude<ModalKind, null>) => setModalKind(kind);

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            data={actions.data}
            openModal={openModal}
            onSaveMood={(date, level) => actions.upsertMoodLog({ date, level })}
            onSaveSleep={(date, sleep) =>
              actions.upsertSleepLog({ date, ...sleep })
            }
            onOpenMedicationInfo={setMedicationInfo}
            onOpenNotifications={openNotifications}
            onOpenNextVisit={() => setNextVisitVisible(true)}
          />
        );
      case "records":
        return (
          <RecordsScreen
            data={actions.data}
            openModal={openModal}
            onGoHome={goHome}
            onOpenNotifications={openNotifications}
          />
        );
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
            onDeleteEvent={(id) => actions.deleteMedicationEvent(id)}
            onUpdateEvent={(id, updates) => actions.updateMedicationEvent(id, updates)}
            onGoHome={goHome}
            onOpenNotifications={openNotifications}
          />
        );
      case "timeline":
        return <TimelineScreen timeline={timeline} />;
      case "report":
        return (
          <ReportScreen
            data={actions.data}
            openModal={openModal}
            onOpenMedicationReminder={() => setReminderVisible(true)}
            onOpenAppointmentReminder={() => setAppointmentReminderVisible(true)}
            onGoHome={goHome}
            onOpenNotifications={openNotifications}
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
      <NextVisitScreen
        visible={nextVisitVisible}
        data={actions.data}
        appointmentDate={nextAppointmentVisit?.appointment.date}
        appointmentTime={nextAppointmentVisit?.appointment.time}
        hospitalName={nextAppointmentVisit?.hospitalName}
        doctorName={nextAppointmentVisit?.doctorName}
        openModal={openModal}
        toggleQuestion={actions.toggleQuestion}
        onClose={() => setNextVisitVisible(false)}
      />
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
        visible={reminderVisible}
        onClose={() => setReminderVisible(false)}
      />
      <AppointmentReminderDialog
        visible={appointmentReminderVisible}
        data={actions.data}
        onClose={() => setAppointmentReminderVisible(false)}
      />
      <NotificationDialog
        visible={notificationsVisible}
        data={actions.data}
        onClose={() => setNotificationsVisible(false)}
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
