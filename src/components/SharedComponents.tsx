import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Plus, Save } from "lucide-react-native";
import Svg, { Path, Polyline } from "react-native-svg";
import { theme } from "../constants";
import type { Rating, TimelineItem } from "../types";

type IconComponent = React.ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

const ratings: Rating[] = [1, 2, 3, 4, 5];

export const shadow = Platform.select({
  ios: {
    shadowColor: "#1F2933",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  android: {
    elevation: 2,
  },
  default: {},
});

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.sectionAction} onPress={onAction}>
          <Plus color={theme.teal} size={15} strokeWidth={2.5} />
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  color,
  softColor,
}: {
  icon: IconComponent;
  label: string;
  value: string;
  detail: string;
  color: string;
  softColor: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: softColor }]}>
        <Icon color={color} size={20} strokeWidth={2.4} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDetail} numberOfLines={2}>
        {detail}
      </Text>
    </View>
  );
}

export function QuickAction({
  icon: Icon,
  label,
  onPress,
}: {
  icon: IconComponent;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <Icon color={theme.teal} size={22} strokeWidth={2.3} />
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

export function RatingBadge({ rating }: { rating: Rating }) {
  return (
    <View style={styles.ratingBadge}>
      <Text style={styles.ratingBadgeText}>{rating}/5</Text>
    </View>
  );
}

export function InfoPill({ label }: { label: string }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoPillText}>{label}</Text>
    </View>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmentedControl}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            style={[
              styles.segmentButton,
              selected && styles.segmentButtonActive,
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.segmentLabel,
                selected && styles.segmentLabelActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function OptionGrid<T extends string>({
  options,
  selected,
  onToggle,
  single,
}: {
  options: T[];
  selected: T[];
  onToggle: (value: T) => void;
  single?: boolean;
}) {
  return (
    <View style={styles.optionGrid}>
      {options.map((option) => {
        const isSelected = selected.includes(option);

        return (
          <Pressable
            key={option}
            style={[styles.optionChip, isSelected && styles.optionChipSelected]}
            onPress={() => onToggle(option)}
          >
            <Text
              style={[
                styles.optionChipText,
                isSelected && styles.optionChipTextSelected,
              ]}
            >
              {option}
              {single && isSelected ? "" : ""}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function RatingControl({
  value,
  onChange,
}: {
  value: Rating;
  onChange: (value: Rating) => void;
}) {
  return (
    <View style={styles.ratingControl}>
      {ratings.map((rating) => {
        const selected = rating === value;

        return (
          <Pressable
            key={rating}
            style={[styles.ratingButton, selected && styles.ratingButtonActive]}
            onPress={() => onChange(rating)}
          >
            <Text
              style={[styles.ratingText, selected && styles.ratingTextActive]}
            >
              {rating}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "number-pad";
}) {
  return (
    <View>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA5B1"
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

export function VisitTextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "number-pad";
}) {
  return (
    <View style={[styles.visitInputBox, multiline && styles.visitInputBoxTall]}>
      <Text style={styles.visitFieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#C2C6CE"
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.visitInput, multiline && styles.visitMultilineInput]}
      />
    </View>
  );
}

export function FormFooter({ onSave }: { onSave: () => void }) {
  return (
    <Pressable style={styles.saveButton} onPress={onSave}>
      <Save color={theme.surface} size={18} strokeWidth={2.4} />
      <Text style={styles.saveButtonText}>저장</Text>
    </Pressable>
  );
}

const TL_EMOJI: Record<string, string> = {
  visit: "🏥",
  medication: "💊",
  symptom: "🧠",
  sideEffect: "⚠️",
  effect: "✨",
};

export function TimelineEventRow({
  item,
  isLast,
}: {
  item: TimelineItem;
  isLast: boolean;
}) {
  const emoji = TL_EMOJI[item.type];

  return (
    <View style={[styles.tlFlatRow, !isLast && styles.tlFlatRowBorder]}>
      <View style={[styles.tlFlatIcon, { backgroundColor: item.accent + "28" }]}>
        {emoji
          ? <Text style={styles.tlFlatIconEmoji}>{emoji}</Text>
          : <View style={[styles.tlFlatIconDot, { backgroundColor: item.accent }]} />
        }
      </View>
      <View style={styles.tlFlatText}>
        <Text style={styles.tlFlatTitle}>{item.title}</Text>
        <Text style={styles.tlFlatDesc} numberOfLines={1}>{item.description}</Text>
      </View>
      <Text style={styles.tlFlatMore}>•••</Text>
    </View>
  );
}

export function MiniBarChart({
  values,
  color,
}: {
  values: { label: string; value: number }[];
  color: string;
}) {
  if (values.length === 0) {
    return <Text style={styles.emptyText}>아직 표시할 기록이 없습니다.</Text>;
  }

  return (
    <View style={styles.chartWrap}>
      {values.map((item, index) => (
        <View key={`${item.label}-${index}`} style={styles.chartColumn}>
          <View style={styles.chartTrack}>
            <View
              style={[
                styles.chartBar,
                {
                  height: `${Math.max(12, item.value * 20)}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
          <Text style={styles.chartValue}>{item.value}</Text>
          <Text style={styles.chartLabel} numberOfLines={1}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function FrequencyPanel({
  rows,
  emptyLabel,
}: {
  rows: [string, number][];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <View style={styles.chartPanel}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  const max = Math.max(...rows.map((row) => row[1]));

  return (
    <View style={styles.chartPanel}>
      {rows.map(([label, count]) => (
        <View key={label} style={styles.frequencyRow}>
          <Text style={styles.frequencyLabel}>{label}</Text>
          <View style={styles.frequencyTrack}>
            <View
              style={[
                styles.frequencyBar,
                { width: `${Math.max(8, (count / max) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.frequencyCount}>{count}회</Text>
        </View>
      ))}
    </View>
  );
}

export function SymptomSparkline({
  values,
  compact,
}: {
  values: number[];
  compact?: boolean;
}) {
  const chartValues = values.length > 1 ? values : [4, 3, 3, 2, 2];
  const width = compact ? 142 : 128;
  const height = compact ? 72 : 48;
  const horizontalStep = width / Math.max(chartValues.length - 1, 1);
  const points = chartValues
    .map((value, index) => {
      const x = index * horizontalStep;
      const y = height - (value / 5) * (compact ? 46 : 38) - (compact ? 12 : 5);
      return `${x},${y}`;
    })
    .join(" ");
  const firstPoint = points.split(" ")[0];
  const fillPath = `M ${firstPoint} L ${points.split(" ").slice(1).join(" L ")} L ${width},${height} L 0,${height} Z`;

  return (
    <View style={styles.sparklineBox}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={fillPath} fill="#DFF1E6" />
        <Polyline
          points={points}
          fill="none"
          stroke="#18A45F"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function StarRatingRow({ label, icon, desc }: { label: string; icon: string; desc: string }) {
  const [rating, setRating] = useState(0);

  return (
    <View style={styles.starRow}>
      <View style={styles.starRowLeft}>
        <View style={styles.starRowText}>
          <Text style={styles.starLabel}>{label}</Text>
          <Text style={styles.starDesc}>{desc}</Text>
        </View>
      </View>
      <View style={styles.starRowRight}>
        <View style={styles.starGroup}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              onPress={() => setRating(n)}
              style={[styles.ratingNumBtn, n <= rating && styles.ratingNumBtnSelected]}
            >
              <Text style={[styles.ratingNumText, n <= rating && styles.ratingNumTextSelected]}>{n}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.starScaleRow}>
          <Text style={styles.starScaleText}>없음</Text>
          <Text style={styles.starScaleText}>매우 심함</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 4,
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    color: theme.ink,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0,
  },
  sectionAction: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: theme.tealSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sectionActionText: {
    color: theme.teal,
    fontSize: 12,
    fontWeight: "800",
  },
  metricCard: {
    width: "48%",
    minHeight: 142,
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 14,
    justifyContent: "space-between",
    ...shadow,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
  metricValue: {
    color: theme.ink,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 3,
    letterSpacing: 0,
  },
  metricDetail: {
    color: theme.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    fontWeight: "600",
  },
  quickAction: {
    flex: 1,
    height: 78,
    borderRadius: 8,
    backgroundColor: theme.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    ...shadow,
  },
  quickActionText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "800",
  },
  ratingBadge: {
    minWidth: 42,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.coralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingBadgeText: {
    color: theme.coral,
    fontSize: 12,
    fontWeight: "900",
  },
  infoPill: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: theme.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  infoPillText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "800",
  },
  segmentedControl: {
    height: 46,
    borderRadius: 8,
    backgroundColor: theme.surfaceMuted,
    padding: 4,
    flexDirection: "row",
  },
  segmentButton: {
    flex: 1,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: theme.surface,
  },
  segmentLabel: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  segmentLabelActive: {
    color: theme.ink,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  optionChip: {
    minHeight: 28,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#20212B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  optionChipSelected: {
    backgroundColor: "#20212B",
    borderColor: "#20212B",
  },
  optionChipText: {
    color: "#20212B",
    fontSize: 12,
    fontWeight: "500",
  },
  optionChipTextSelected: {
    color: theme.surface,
    fontWeight: "600",
  },
  ratingControl: {
    height: 46,
    flexDirection: "row",
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingButtonActive: {
    backgroundColor: theme.coral,
    borderColor: theme.coral,
  },
  ratingText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "900",
  },
  ratingTextActive: {
    color: theme.surface,
  },
  formLabel: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 7,
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
    color: theme.text,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    fontWeight: "600",
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  visitInputBox: {
    minHeight: 64,
    borderRadius: 14,
    backgroundColor: "#F0F2F6",
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 10,
    justifyContent: "center",
  },
  visitInputBoxTall: {
    minHeight: 108,
    justifyContent: "flex-start",
  },
  visitFieldLabel: {
    color: "#9AA0AA",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  visitInput: {
    minHeight: 28,
    color: "#20212B",
    padding: 0,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
  },
  visitMultilineInput: {
    minHeight: 68,
    textAlignVertical: "top",
  },
  saveButton: {
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: theme.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  saveButtonText: {
    color: theme.surface,
    fontSize: 15,
    fontWeight: "900",
  },
  tlFlatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tlFlatRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F5",
  },
  tlFlatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tlFlatIconEmoji: {
    fontSize: 18,
  },
  tlFlatIconDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  tlFlatText: {
    flex: 1,
    gap: 3,
  },
  tlFlatTitle: {
    color: "#20212B",
    fontSize: 15,
    fontWeight: "700",
  },
  tlFlatDesc: {
    color: "#9096A2",
    fontSize: 13,
    fontWeight: "500",
  },
  tlFlatMore: {
    color: "#C5C3E0",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  chartPanel: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    padding: 16,
    ...shadow,
  },
  chartWrap: {
    height: 174,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  chartColumn: {
    flex: 1,
    minWidth: 34,
    height: 160,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chartTrack: {
    width: "100%",
    maxWidth: 42,
    height: 104,
    borderRadius: 8,
    backgroundColor: theme.surfaceMuted,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  chartBar: {
    width: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  chartValue: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 6,
  },
  chartLabel: {
    width: "100%",
    color: theme.muted,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 3,
  },
  emptyText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
  },
  frequencyRow: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  frequencyLabel: {
    width: 78,
    color: theme.text,
    fontSize: 13,
    fontWeight: "800",
  },
  frequencyTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.surfaceMuted,
    overflow: "hidden",
  },
  frequencyBar: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: theme.amber,
  },
  frequencyCount: {
    width: 38,
    color: theme.muted,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
  },
  sparklineBox: {
    width: 128,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  starRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  starRowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  starRowText: {
    flex: 1,
  },
  starLabel: {
    color: "#20212B",
    fontSize: 16,
    fontWeight: "800",
  },
  starDesc: {
    color: "#9096A2",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
    fontWeight: "500",
  },
  starRowRight: {
    width: 160,
    alignItems: "flex-end",
    gap: 4,
  },
  starGroup: {
    flexDirection: "row",
    gap: 4,
  },
  starScaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  starScaleText: {
    color: "#B0B3BE",
    fontSize: 10,
    fontWeight: "600",
  },
  ratingNumBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D9D8E8",
    alignItems: "center",
    justifyContent: "center",
  },
  ratingNumBtnSelected: {
    backgroundColor: "#4025E8",
    borderColor: "#4025E8",
  },
  ratingNumText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#B0B3BE",
  },
  ratingNumTextSelected: {
    color: "#FFFFFF",
  },
});
