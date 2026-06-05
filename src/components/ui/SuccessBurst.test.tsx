import { render, screen } from "@testing-library/react-native";

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  const animation = { springify: () => animation, duration: () => animation };
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: (c: unknown) => c },
    FadeIn: animation,
    FadeOut: animation,
    ZoomIn: animation,
  };
});

import { SuccessBurst } from "./SuccessBurst";

it("renders its glyph when active", () => {
  render(<SuccessBurst active glyph="✓" testID="burst" />);
  expect(screen.getByTestId("burst")).toBeTruthy();
});

it("renders nothing when inactive", () => {
  render(<SuccessBurst active={false} glyph="✓" testID="burst" />);
  expect(screen.queryByTestId("burst")).toBeNull();
});
