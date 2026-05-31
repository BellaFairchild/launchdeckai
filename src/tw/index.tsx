import {
  useCssElement,
  useNativeVariable as useFunctionalVariable,
} from "react-native-css";

import { Link as RouterLink } from "expo-router";
import Animated from "react-native-reanimated";
import React from "react";
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  TouchableHighlight as RNTouchableHighlight,
  TextInput as RNTextInput,
  StyleSheet,
} from "react-native";

// CSS-enabled Link
export const Link = (
  props: React.ComponentProps<typeof RouterLink> & { className?: string }
): React.ReactElement => {
  // Cast component to simplify useCssElement's generic instantiation (avoids TS2590).
  return useCssElement(RouterLink as React.ComponentType<any>, props, {
    className: "style",
  });
};

Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

// CSS Variable hook
export const useCSSVariable =
  process.env.EXPO_OS !== "web"
    ? useFunctionalVariable
    : (variable: string) => `var(${variable})`;

// View
export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string;
};

export const View = (props: ViewProps): React.ReactElement => {
  return useCssElement(RNView as React.ComponentType<any>, props, {
    className: "style",
  });
};
View.displayName = "CSS(View)";

// Text
export const Text = (
  props: React.ComponentProps<typeof RNText> & { className?: string }
): React.ReactElement => {
  return useCssElement(RNText as React.ComponentType<any>, props, {
    className: "style",
  });
};
Text.displayName = "CSS(Text)";

// ScrollView
export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  }
): React.ReactElement => {
  return useCssElement(RNScrollView as React.ComponentType<any>, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
};
ScrollView.displayName = "CSS(ScrollView)";

// Pressable
export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string }
): React.ReactElement => {
  return useCssElement(RNPressable as React.ComponentType<any>, props, {
    className: "style",
  });
};
Pressable.displayName = "CSS(Pressable)";

// TextInput
export const TextInput = (
  props: React.ComponentProps<typeof RNTextInput> & { className?: string }
): React.ReactElement => {
  return useCssElement(RNTextInput as React.ComponentType<any>, props, {
    className: "style",
  });
};
TextInput.displayName = "CSS(TextInput)";

// AnimatedScrollView
export const AnimatedScrollView = (
  props: React.ComponentProps<typeof Animated.ScrollView> & {
    className?: string;
    contentClassName?: string;
    contentContainerClassName?: string;
  }
): React.ReactElement => {
  return useCssElement(Animated.ScrollView as React.ComponentType<any>, props, {
    className: "style",
    contentClassName: "contentContainerStyle",
    contentContainerClassName: "contentContainerStyle",
  });
};

// TouchableHighlight with underlayColor extraction
function XXTouchableHighlight(
  props: React.ComponentProps<typeof RNTouchableHighlight>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flat: any = StyleSheet.flatten(props.style) || {};
  const { underlayColor, ...style } = flat;
  return (
    <RNTouchableHighlight
      underlayColor={underlayColor}
      {...props}
      style={style}
    />
  );
}

export const TouchableHighlight = (
  props: React.ComponentProps<typeof RNTouchableHighlight> & { className?: string }
): React.ReactElement => {
  return useCssElement(XXTouchableHighlight as React.ComponentType<any>, props, {
    className: "style",
  });
};
TouchableHighlight.displayName = "CSS(TouchableHighlight)";
