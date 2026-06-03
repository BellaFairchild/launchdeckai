import { useMemo, useState } from "react";
import { Modal } from "react-native";

import { Button } from "@/components/ui/Button";
import { GradientView } from "@/components/ui/GradientView";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { cn } from "@/lib/cn";
import { haptics } from "@/lib/haptics";
import { playClick } from "@/lib/audio";
import { Pressable, ScrollView, Text, TextInput, View } from "@/tw";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;

type Props = {
  visible: boolean;
  /** Title shown above the picker, e.g. the signal label. */
  title?: string;
  /** Date the picker opens on. Defaults to today. */
  initialDate?: Date;
  onClose: () => void;
  /** Fires with the chosen broadcast date + time on confirm. */
  onConfirm: (when: Date) => void;
};

function buildGrid(year: number, month: number): (number | null)[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/**
 * Dark, on-brand date + time picker shown when scheduling a broadcast.
 * Self-contained overlay (RN Modal) — month/year dropdowns, a weekday grid with
 * the selected day ringed in brand teal, and an hh:mm time field.
 */
export function BroadcastScheduler({
  visible,
  title,
  initialDate,
  onClose,
  onConfirm,
}: Props) {
  const base = initialDate ?? new Date();
  const today = new Date();

  const [year, setYear] = useState(base.getFullYear());
  const [month, setMonth] = useState(base.getMonth());
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState("");
  const [picker, setPicker] = useState<"month" | "year" | null>(null);

  const grid = useMemo(() => buildGrid(year, month), [year, month]);
  const years = useMemo(() => {
    const start = today.getFullYear();
    return Array.from({ length: 8 }, (_, i) => start + i);
  }, [today]);

  const timeValid = TIME_RE.test(time);
  const canConfirm = day !== null && timeValid;

  const reset = () => {
    setPicker(null);
  };

  const confirm = () => {
    if (!canConfirm || day === null) return;
    const [hh, mm] = time.split(":").map((n) => parseInt(n, 10));
    const when = new Date(year, month, day, hh, mm, 0, 0);
    haptics.success();
    onConfirm(when);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/70 px-5"
      >
        {/* Stop the backdrop press from closing when tapping the card. */}
        <Pressable
          onPress={reset}
          className="w-full max-w-[420px] overflow-hidden rounded-3xl border border-border-med bg-bg-surface"
        >
          {/* Top accent bar */}
          <View className="h-1.5 w-full overflow-hidden">
            <GradientView
              colors={[colors.deepIndigo, colors.rocketTeal]}
              direction="horizontal"
            />
          </View>

          <View className="p-5">
            {title ? (
              <Text className="mb-3 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                Schedule · {title}
              </Text>
            ) : null}

            {/* Month / Year selectors */}
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => {
                  playClick();
                  setPicker((p) => (p === "month" ? null : "month"));
                }}
                className="flex-row items-center gap-1.5 rounded-xl px-1 py-1 active:opacity-70"
                accessibilityRole="button"
              >
                <Text className="font-display text-xl font-bold text-text-primary">
                  {MONTHS[month]}
                </Text>
                <Icon name="chevron-down" size={18} color={colors.brandTeal} />
              </Pressable>
              <Pressable
                onPress={() => {
                  playClick();
                  setPicker((p) => (p === "year" ? null : "year"));
                }}
                className="flex-row items-center gap-1.5 rounded-xl px-1 py-1 active:opacity-70"
                accessibilityRole="button"
              >
                <Text className="font-display text-xl font-bold text-text-primary">
                  {year}
                </Text>
                <Icon name="chevron-down" size={18} color={colors.brandTeal} />
              </Pressable>
            </View>

            {/* Dropdown panel for month/year */}
            {picker ? (
              <View className="mt-2 max-h-56 overflow-hidden rounded-2xl border border-border-default bg-bg-card">
                <ScrollView contentContainerClassName="p-1">
                  {(picker === "month"
                    ? MONTHS.map((label, i) => ({ label, value: i }))
                    : years.map((y) => ({ label: String(y), value: y }))
                  ).map((opt) => {
                    const active =
                      picker === "month"
                        ? opt.value === month
                        : opt.value === year;
                    return (
                      <Pressable
                        key={opt.label}
                        onPress={() => {
                          playClick();
                          if (picker === "month") setMonth(opt.value);
                          else setYear(opt.value);
                          setDay(null);
                          setPicker(null);
                        }}
                        className={cn(
                          "min-h-[40px] flex-row items-center justify-between rounded-xl px-3 active:bg-bg-surface",
                          active && "bg-brand-teal/10",
                        )}
                      >
                        <Text
                          className={cn(
                            "font-body text-base",
                            active ? "text-brand-teal" : "text-text-primary",
                          )}
                        >
                          {opt.label}
                        </Text>
                        {active ? (
                          <Icon
                            name="check"
                            size={16}
                            color={colors.brandTeal}
                          />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            {/* Weekday header */}
            <View className="mt-4 flex-row">
              {WEEKDAYS.map((w) => (
                <View key={w} className="flex-1 items-center">
                  <Text className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                    {w}
                  </Text>
                </View>
              ))}
            </View>

            {/* Day grid */}
            <View className="mt-1 flex-row flex-wrap">
              {grid.map((d, i) => {
                const isSelected = d !== null && d === day;
                const isToday =
                  d !== null &&
                  d === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();
                return (
                  <View
                    key={i}
                    className="items-center justify-center py-1"
                    style={{ width: `${100 / 7}%` }}
                  >
                    {d === null ? (
                      <View className="h-10 w-10" />
                    ) : (
                      <Pressable
                        onPress={() => {
                          playClick();
                          haptics.light();
                          setDay(d);
                        }}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        className={cn(
                          "h-10 w-10 items-center justify-center rounded-full border-2",
                          isSelected
                            ? "border-brand-teal bg-brand-teal/15"
                            : "border-transparent active:bg-bg-card",
                        )}
                      >
                        <Text
                          className={cn(
                            "font-body text-base",
                            isSelected
                              ? "font-bold text-brand-teal"
                              : isToday
                                ? "font-semibold text-brand-teal-light"
                                : "text-text-primary",
                          )}
                        >
                          {d}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Divider */}
            <View className="my-4 h-px w-full bg-border-default" />

            {/* Time */}
            <Text className="font-display text-lg font-bold text-text-primary">
              Select Time
            </Text>
            <View
              className={cn(
                "mt-2 flex-row items-center gap-2.5 rounded-2xl border bg-bg-card px-4",
                time.length > 0 && !timeValid
                  ? "border-status-error/60"
                  : "border-border-default",
              )}
            >
              <Icon name="clock" size={20} color={colors.textSecondary} />
              <TextInput
                value={time}
                onChangeText={setTime}
                placeholder="hh:mm"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                className="min-h-[48px] flex-1 font-body text-base text-text-primary"
              />
            </View>
            {time.length > 0 && !timeValid ? (
              <Text className="mt-1.5 font-body text-xs text-status-error">
                Enter a 24-hour time like 09:30 or 18:45.
              </Text>
            ) : null}

            {/* Actions */}
            <View className="mt-5 flex-row gap-3">
              <Button
                label="Cancel"
                variant="secondary"
                fullWidth
                className="flex-1"
                onPress={onClose}
              />
              <View className="flex-1">
                <Button
                  label="Schedule"
                  fullWidth
                  disabled={!canConfirm}
                  onPress={confirm}
                />
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
