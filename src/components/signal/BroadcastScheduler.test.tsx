import { render, screen, fireEvent } from "@testing-library/react-native";
import { BroadcastScheduler } from "./BroadcastScheduler";

jest.mock("@/components/ui/GradientView", () => ({
  GradientView: () => null,
}));

jest.mock("@/tw", () => {
  const RN = require("react-native");
  return {
    View: RN.View,
    Text: RN.Text,
    Pressable: RN.Pressable,
    ScrollView: RN.ScrollView,
    TextInput: RN.TextInput,
    useCSSVariable: () => "",
  };
});

function setup(overrides = {}) {
  const onConfirm = jest.fn();
  const onClose = jest.fn();
  const onRemove = jest.fn();
  render(
    <BroadcastScheduler
      visible
      title="Dev log thread"
      onClose={onClose}
      onConfirm={onConfirm}
      onRemove={onRemove}
      {...overrides}
    />,
  );
  return { onConfirm, onClose, onRemove };
}

it("does not confirm until url + day + time are all valid", () => {
  // Pin to a fixed future month so day 15 is always in the future (the
  // scheduler blocks past date/times).
  const { onConfirm } = setup({ initialDate: new Date(2099, 0, 1) });
  fireEvent.press(screen.getByText("Schedule"));
  expect(onConfirm).not.toHaveBeenCalled();

  fireEvent.changeText(screen.getByPlaceholderText("https://… where you'll post"), "https://x.com/compose");
  fireEvent.press(screen.getByText("15"));
  fireEvent.changeText(screen.getByPlaceholderText("hh:mm"), "09:30");

  fireEvent.press(screen.getByText("Schedule"));
  expect(onConfirm).toHaveBeenCalledTimes(1);
  const [when, url] = onConfirm.mock.calls[0];
  expect(when).toBeInstanceOf(Date);
  expect(when.getDate()).toBe(15);
  expect(url).toBe("https://x.com/compose");
});

it("prefills when editing and Remove fires onRemove", () => {
  const initialWhen = new Date(2026, 5, 20, 12, 0, 0);
  const { onRemove } = setup({ editing: true, initialWhen, initialUrl: "https://buffer.com" });
  expect(screen.getByDisplayValue("https://buffer.com")).toBeTruthy();
  expect(screen.getByDisplayValue("12:00")).toBeTruthy();
  fireEvent.press(screen.getByText("Remove broadcast"));
  expect(onRemove).toHaveBeenCalledTimes(1);
});
