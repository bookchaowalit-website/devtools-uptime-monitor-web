import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

const text = (html: string) => html.replace(/<!-- -->/g, "");

describe("home page", () => {
  it("renders the board, the sample log and the not-live notice", () => {
    const html = text(renderToString(<Home />));
    expect(html).toContain("Watch the");
    expect(html).toContain("bookchaowalit.com");
    expect(html).toContain("No remote check is running behind this screen.");
    expect(html).toContain("SAMPLE DATA · READ ONLY");
  });

  it("shows board numbers that match the two logged endpoints", () => {
    const html = text(renderToString(<Home />));
    expect(html).toMatch(/<span>Targets<\/span><strong>2<\/strong>/);
    expect(html).toMatch(/<span>Down<\/span><strong>1<\/strong>/);
    expect(html).toContain("99.0%");
  });
});
