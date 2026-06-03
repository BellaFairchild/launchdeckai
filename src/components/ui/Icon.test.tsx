import { render } from "@testing-library/react-native";
import { Icon } from "./Icon";

it("renders the link glyph without crashing", () => {
  // `name="link"` must be a valid IconName (enforced by tsc) and render.
  const tree = render(<Icon name="link" />).toJSON();
  expect(tree).toBeTruthy();
});
