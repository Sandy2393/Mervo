// @ts-nocheck
import { renderTemplate } from "../../server/notifications/templateEngine";

test("renders tokens", () => {
  const out = renderTemplate("Hello {{ name }}", { name: "Pat" });
  expect(out).toBe("Hello Pat");
});

test("escapes html by default", () => {
  const out = renderTemplate("Hi {{ name }}", { name: "<script>" });
  expect(out).toBe("Hi &lt;script&gt;");
});

test("allows unescaped", () => {
  const out = renderTemplate("Hi {{ name }}", { name: "<b>" }, { escapeHtml: false });
  expect(out).toBe("Hi <b>");
});

test("missing token -> empty", () => {
  const out = renderTemplate("Hi {{ missing }}", {});
  expect(out).toBe("Hi ");
});
