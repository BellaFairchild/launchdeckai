import { useMemo, useState } from "react";
import { Modal } from "react-native";

import { Button } from "@/components/ui/Button";
import { GradientView } from "@/components/ui/GradientView";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { cn } from "@/lib/cn";
import { haptics } from "@/lib/haptics";
import { playClick } from "@/lib/audio";
import { isValidDestinationUrl, normalizeDestinationUrl } from "@/lib/url";
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

/** Common send slots, offered as one-tap chips under the time field. */
const QUICK_TIMES = ["09:00", "12:00", "15:00", "18:00"];

const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

/** Faint teal halo applied to the field that currently holds focus. */
const FOCUS_GLOW = {
  shadowColor: colors.rocketTeal,
  shadowOpacity: 0.35,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 0 },
  elevation: 6,
} as const;

/** Stronger glow on the chosen day — the locked "transmission slot". */
const SELECTED_GLOW = {
  shadowColor: colors.rocketTeal,
  shadowOpacity: 0.55,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 },
  elevation: 10,
} as const;

type Props = {
  visible: boolean;
  /** Title shown above the picker, e.g. the signal label. */
  title?: string;
  /** Date the picker opens on. Defaults to today. */
  initialDate?: Date;
  /** When editing an existing plan: prefill day/time. */
  initialWhen?: Date;
  /** When editing an existing plan: prefill the destination URL. */
  initialUrl?: string;
  /** True when editing an existing plan (shows Remove). */
  editing?: boolean;
  onClose: () => void;
  /** Fires with the chosen broadcast date + time and destination URL. */
  onConfirm: (when: Date, url: string) => void;
  /** Remove the existing plan (only shown when editing). */
  onRemove?: () => void;
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
  initialWhen,
  initialUrl,
  editing,
  onClose,
  onConfirm,
  onRemove,
}: Props) {
  const base = initialWhen ?? initialDate ?? new Date();
  const today = new Date();

  const [year, setYear] = useState(base.getFullYear());
  const [month, setMonth] = useState(base.getMonth());
  const [day, setDay] = useState<number | null>(initialWhen ? initialWhen.getDate() : null);
  const [time, setTime] = useState(
    initialWhen
      ? `${String(initialWhen.getHours()).padStart(2, "0")}:${String(initialWhen.getMinutes()).padStart(2, "0")}`
      : "",
  );
  const [url, setUrl] = useState(initialUrl ?? "");
  const [picker, setPicker] = useState<"month" | "year" | null>(null);
  const [pastError, setPastError] = useState(false);
  const [focused, setFocused] = useState<"url" | "time" | null>(null);

  // A whole calendar day is "past" once its final minute has elapsed; such days
  // are dimmed + non-pressable so the future-only guard rarely has to fire.
  const isPastDay = (d: number) =>
    new Date(year, month, d, 23, 59, 59, 999).getTime() < today.getTime();

  const grid = useMemo(() => buildGrid(year, month), [year, month]);
  const years = useMemo(() => {
    const start = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, i) => start + i);
  }, []);

  const urlValid = isValidDestinationUrl(url);
  const timeValid = TIME_RE.test(time);
  const selectedWhen = useMemo(() => {
    if (day === null || !timeValid) return null;
    const [hh, mm] = time.split(":").map((n) => parseInt(n, 10));
    return new Date(year, month, day, hh, mm, 0, 0);
  }, [day, timeValid, time, year, month]);
  const canConfirm = urlValid && selectedWhen !== null;

  const reset = () => {
    setPicker(null);
  };

  const confirm = () => {
    if (!canConfirm || selectedWhen === null) return;
    // Date.now() lives in the handler (not render) so a future-check stays pure.
    if (selectedWhen.getTime() <= Date.now()) {
      setPastError(true);
      return;
    }
    setPastError(false);
    haptics.success();
    onConfirm(selectedWhen, normalizeDestinationUrl(url));
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
        accessibilityRole="button"
        accessibilityLabel="Close scheduler"
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

          {/* Ambient glow bleeding down from the accent bar — sets the console mood. */}
          <View pointerEvents="none" className="absolute inset-x-0 top-0 h-44">
            <GradientView
              colors={["rgba(16,183,214,0.10)", "transparent"]}
              direction="vertical"
            />
          </View>

          <View className="p-5">
            {/* Header — broadcast glyph token + scope eyebrow */}
            <View className="mb-5 flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-xl border border-brand-teal/30 bg-brand-teal/10">
                <Icon name="signal" size={18} color={colors.brandTeal} />
              </View>
              <View className="flex-1">
                <Text className="font-mono text-[10px] uppercase tracking-[2px] text-brand-teal">
                  Broadcast{title ? ` · ${title}` : ""}
                </Text>
                <Text className="font-display text-lg font-bold text-text-primary">
                  Schedule transmission
                </Text>
              </View>
            </View>

            {/* Destination */}
            <Text className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
              Destination
            </Text>
            <View
              className={cn(
                "mb-4 flex-row items-center gap-2.5 rounded-2xl border bg-bg-card px-4",
                url.length > 0 && !urlValid
                  ? "border-status-error/60"
                  : focused === "url"
                    ? "border-brand-teal"
                    : "border-border-default",
              )}
              style={focused === "url" ? FOCUS_GLOW : undefined}
            >
              <Icon
                name="link"
                size={20}
                color={
                  focused === "url" || urlValid
                    ? colors.brandTeal
                    : colors.textSecondary
                }
              />
              <TextInput
                value={url}
                onChangeText={setUrl}
                onFocus={() => setFocused("url")}
                onBlur={() => setFocused((f) => (f === "url" ? null : f))}
                placeholder="https://… where you'll post"
                placeholderTextColor={colors.textTertiary}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Broadcast destination URL"
                className="min-h-[48px] flex-1 font-body text-base text-text-primary"
              />
              {urlValid ? (
                <Icon name="check" size={18} color={colors.brandTeal} />
              ) : null}
            </View>
            {url.length > 0 && !urlValid ? (
              <Text className="-mt-2.5 mb-3 font-body text-xs text-status-error">
                Enter a link like https://x.com/compose or buffer.com/queue.
              </Text>
            ) : null}

            {/* Month / Year selectors — console pill controls */}
            <View className="flex-row items-center gap-2.5">
              <Pressable
                onPress={() => {
                  playClick();
                  setPicker((p) => (p === "month" ? null : "month"));
                }}
                accessibilityRole="button"
                accessibilityLabel={`Select month, currently ${MONTHS[month]}`}
                className={cn(
                  "flex-row items-center gap-2 rounded-xl border bg-bg-card px-3 py-2 active:opacity-80",
                  picker === "month"
                    ? "border-brand-teal/60"
                    : "border-border-default",
                )}
              >
                <Text className="font-display text-lg font-bold text-text-primary">
                  {MONTHS[month]}
                </Text>
                <Icon name="chevron-down" size={16} color={colors.brandTeal} />
              </Pressable>
              <Pressable
                onPress={() => {
                  playClick();
                  setPicker((p) => (p === "year" ? null : "year"));
                }}
                accessibilityRole="button"
                accessibilityLabel={`Select year, currently ${year}`}
                className={cn(
                  "flex-row items-center gap-2 rounded-xl border bg-bg-card px-3 py-2 active:opacity-80",
                  picker === "year"
                    ? "border-brand-teal/60"
                    : "border-border-default",
                )}
              >
                <Text className="font-display text-lg font-bold text-text-primary">
                  {year}
                </Text>
                <Icon name="chevron-down" size={16} color={colors.brandTeal} />
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
            <View className="mt-4 flex-row border-b border-border-default/60 pb-1.5">
              {WEEKDAYS.map((w) => (
                <View key={w} className="flex-1 items-center">
                  <Text className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                    {w}
                  </Text>
                </View>
              ))}
            </View>

            {/* Day grid */}
            <View className="mt-1.5 flex-row flex-wrap">
              {grid.map((d, i) => {
                const isSelected = d !== null && d === day;
                const isToday =
                  d !== null &&
                  d === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();
                const past = d !== null && !isSelected && isPastDay(d);
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
                        disabled={past}
                        onPress={
                          past
                            ? undefined
                            : () => {
                                playClick();
                                haptics.light();
                                setDay(d);
                                setPastError(false);
                              }
                        }
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected, disabled: past }}
                        style={isSelected ? SELECTED_GLOW : undefined}
                        className={cn(
                          "h-10 w-10 items-center justify-center rounded-full border-2",
                          isSelected
                            ? "border-brand-teal bg-brand-teal"
                            : isToday
                              ? "border-brand-teal/50 active:bg-bg-card"
                              : "border-transparent active:bg-bg-card",
                          past && "opacity-30",
                        )}
                      >
                        <Text
                          className={cn(
                            "font-body text-base",
                            isSelected
                              ? "font-bold text-bg-deep"
                              : isToday
                                ? "font-semibold text-brand-teal-light"
                                : "text-text-primary",
                          )}
                        >
                          {d}
                        </Text>
                        {isToday && !isSelected ? (
                          <View className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-teal" />
                        ) : null}
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Divider */}
            <View className="my-4 h-px w-full bg-border-default" />

            {/* Time */}
            <Text className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
              Select Time
            </Text>
            <View
              className={cn(
                "flex-row items-center gap-2.5 rounded-2xl border bg-bg-card px-4",
                time.length > 0 && !timeValid
                  ? "border-status-error/60"
                  : focused === "time"
                    ? "border-brand-teal"
                    : "border-border-default",
              )}
              style={focused === "time" ? FOCUS_GLOW : undefined}
            >
              <Icon
                name="clock"
                size={20}
                color={
                  focused === "time" || timeValid
                    ? colors.brandTeal
                    : colors.textSecondary
                }
              />
              <TextInput
                value={time}
                onChangeText={(t) => {
                  setTime(t);
                  setPastError(false);
                }}
                onFocus={() => setFocused("time")}
                onBlur={() => setFocused((f) => (f === "time" ? null : f))}
                placeholder="hh:mm"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                accessibilityLabel="Broadcast time (hh:mm)"
                className="min-h-[48px] flex-1 font-body text-base text-text-primary"
              />
              {timeValid ? (
                <Icon name="check" size={18} color={colors.brandTeal} />
              ) : null}
            </View>

            {/* Quick send slots */}
            <View className="mt-2.5 flex-row gap-2">
              {QUICK_TIMES.map((t) => {
                const active = time === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => {
                      playClick();
                      setTime(t);
                      setPastError(false);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    className={cn(
                      "min-h-[36px] flex-1 items-center justify-center rounded-full border active:opacity-80",
                      active
                        ? "border-brand-teal/60 bg-brand-teal/10"
                        : "border-border-default bg-bg-card",
                    )}
                  >
                    <Text
                      className={cn(
                        "font-mono text-xs",
                        active ? "text-brand-teal" : "text-text-secondary",
                      )}
                    >
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {time.length > 0 && !timeValid ? (
              <Text className="mt-1.5 font-body text-xs text-status-error">
                Enter a 24-hour time like 09:30 or 18:45.
              </Text>
            ) : null}
            {pastError ? (
              <Text className="mt-1.5 font-body text-xs text-status-error">
                Pick a future date and time.
              </Text>
            ) : null}

            {/* Assembled-slot readout — the transmission you're about to lock. */}
            {selectedWhen ? (
              <View className="mt-4 flex-row items-center gap-2.5 rounded-2xl border border-brand-teal/30 bg-brand-teal/5 px-4 py-3">
                <Icon name="signal" size={16} color={colors.brandTeal} />
                <Text className="flex-1 font-body text-sm text-text-secondary">
                  Transmitting{" "}
                  <Text className="font-semibold text-brand-teal">
                    {MONTHS_SHORT[selectedWhen.getMonth()]}{" "}
                    {selectedWhen.getDate()} · {time}
                  </Text>
                </Text>
                {urlValid ? (
                  <Icon name="arrow-right" size={16} color={colors.brandTeal} />
                ) : null}
              </View>
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

            {editing && onRemove ? (
              <Pressable
                onPress={onRemove}
                accessibilityRole="button"
                className="mt-3 items-center py-2 active:opacity-70"
              >
                <Text className="font-body text-sm text-status-error">
                  Remove broadcast
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
