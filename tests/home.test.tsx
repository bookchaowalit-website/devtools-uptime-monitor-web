// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Home from "@/app/page";
import { EndpointList } from "@/components/endpoint-list";
import { ENDPOINTS } from "@/lib/uptime";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let host: HTMLDivElement;
const button = (text: string) => [...host.querySelectorAll("button")].find((b) => b.textContent?.trim() === text) as HTMLButtonElement;
const press = (el: Element) => act(() => { el.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
const stats = () => [...host.querySelectorAll(".ds-stat")].map((tile) => tile.textContent);
const rows = () => [...host.querySelectorAll(".ds-row")].map((row) => row.textContent);

beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<Home />));
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe("uptime page", () => {
  it("opens on 7 days with board numbers that match the two logged endpoints", () => {
    expect(host.querySelector("h1")?.textContent).toBe("Endpoint uptime");
    expect(button("7 days").getAttribute("aria-pressed")).toBe("true");
    expect(stats()).toEqual(["Targets2sample scope", "Up1responding", "Down1needs a look", "Avg uptime99.0%sample window"]);
    expect(rows()).toEqual(["bookchaowalit.comLast check: 200 · 120ms · 99.9% uptimeUp", "api.exampleLast check: timeout · 98.1% uptimeDown"]);
    expect(host.querySelector(".ds-pill")?.textContent).toBe("Sample data");
    expect(host.textContent).toContain("no remote check runs behind this page");
  });

  it("recomputes the average and each endpoint's uptime for the chosen period", () => {
    press(button("24 hours"));
    expect(host.querySelector(".ds-head p")?.textContent).toContain("Last 24 hours");
    expect(stats()[3]).toBe("Avg uptime93.8%sample window");
    expect(rows()[1]).toContain("87.5% uptime");
    expect(host.querySelectorAll<HTMLElement>(".ds-meter span")[1].style.width).toBe("87.5%");
    press(button("30 days"));
    expect(stats()[3]).toBe("Avg uptime99.3%sample window");
  });

  it("says up and down in words next to the colour", () => {
    expect([...host.querySelectorAll(".ds-row .ds-pill")].map((pill) => [pill.textContent, pill.getAttribute("data-tone")])).toEqual([["Up", "green"], ["Down", "red"]]);
    expect(host.querySelector(".ds-skip")?.getAttribute("href")).toBe("#main");
  });
});

describe("endpoint list", () => {
  it("says there are no endpoints instead of showing an empty list", () => {
    act(() => root.render(<EndpointList endpoints={[]} range="7d" />));
    expect(host.querySelector("ul")).toBeNull();
    expect(host.querySelector('.ds-callout[role="status"]')?.textContent).toBe("No endpoints yetAdd an endpoint to see its last check and uptime here.");
  });

  it("lists each endpoint when there are some", () => {
    act(() => root.render(<EndpointList endpoints={ENDPOINTS} range="30d" />));
    expect(rows()).toHaveLength(2);
    expect(host.querySelector(".ds-callout")).toBeNull();
  });
});
