/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...await importOriginal<typeof import("@tanstack/react-router")>(),
  Outlet: () => <main><div contentEditable suppressContentEditableWarning data-testid="editor-input">Editor content</div></main>,
}));
import { Route } from "./__root";

afterEach(cleanup);

it("renders only the editor route with no debug launcher or Shift+A popup", () => {
  const Root = Route.options.component;
  if (!Root) throw new Error("The root route needs a component");
  const { container } = render(<Root />);
  expect(container.children.length).toBe(1);
  expect(container.firstElementChild?.tagName).toBe("MAIN");
  const content = document.body.innerHTML;
  fireEvent.keyDown(screen.getByTestId("editor-input"), { key: "A", code: "KeyA", shiftKey: true });
  fireEvent.keyUp(screen.getByTestId("editor-input"), { key: "A", code: "KeyA", shiftKey: true });
  expect(document.body.innerHTML).toBe(content);
  expect(screen.queryByText(/Tanstack Router/i)).toBeNull();
  expect(screen.queryByRole("dialog")).toBeNull();
});
