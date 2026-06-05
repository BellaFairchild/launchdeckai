import { useSavedResourcesStore } from "./savedResources";

beforeEach(() => {
  useSavedResourcesStore.setState({ saved: [], convexToggle: null });
});

it("toggles a resource id on and off locally", () => {
  const { toggle } = useSavedResourcesStore.getState();
  toggle("r1");
  expect(useSavedResourcesStore.getState().isSaved("r1")).toBe(true);
  toggle("r1");
  expect(useSavedResourcesStore.getState().isSaved("r1")).toBe(false);
});

it("delegates to the Convex adapter when signed in", () => {
  const convexToggle = jest.fn();
  useSavedResourcesStore.setState({ convexToggle });
  useSavedResourcesStore.getState().toggle("r2");
  expect(convexToggle).toHaveBeenCalledWith("r2");
  expect(useSavedResourcesStore.getState().isSaved("r2")).toBe(true);

  useSavedResourcesStore.getState().toggle("r2");
  expect(convexToggle).toHaveBeenCalledTimes(2);
  expect(useSavedResourcesStore.getState().isSaved("r2")).toBe(false);
});

it("hydrate replaces the saved set from the server", () => {
  useSavedResourcesStore.getState().hydrate(["r5", "r6"]);
  expect(useSavedResourcesStore.getState().saved).toEqual(["r5", "r6"]);
});
