import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

type DesignGuide = {
  color: {
    brand: string;
    brand_dark: string;
    background: string;
    surface: string;
    lavender: string;
    text: string;
    muted: string;
    dark_background: string;
    dark_surface: string;
    dark_text: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: number[];
  radius: { card: number; field: number; modal: number };
  typography: {
    heading: string;
    body: string;
    body_px: number;
    secondary_px: number;
    heading_mobile_px: [number, number];
    money_px: [number, number];
  };
  touch_target_min_px: number;
  status_requires_text_and_icon: boolean;
};

const guide = JSON.parse(
  readFileSync(
    new URL("../../reference-design/guides/design_tokens.json", import.meta.url),
    "utf8",
  ),
) as DesignGuide;

function luminance(hex: string) {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? [...normalized].map((channel) => channel + channel).join("")
      : normalized;
  const channels = [0, 2, 4].map((index) =>
    Number.parseInt(full.slice(index, index + 2), 16) / 255,
  );
  const linear = channels.map((channel) =>
    channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return (
    0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!
  );
}

function normalizeHex(hex: string) {
  const normalized = hex.replace("#", "").toLowerCase();
  return normalized.length === 3
    ? `#${[...normalized].map((channel) => channel + channel).join("")}`
    : `#${normalized}`;
}

function contrast(foreground: string, background: string) {
  const values = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (values[0]! + 0.05) / (values[1]! + 0.05);
}

test("P4-001 computed semantic tokens follow the design guide and meet contrast", async ({
  page,
}) => {
  await page.goto("/login");

  const readPalette = () =>
    page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const read = (name: string) => root.getPropertyValue(name).trim();
      return {
        brand: read("--brand").toLowerCase(),
        brandSoft: read("--brand-soft").toLowerCase(),
        onBrand: read("--on-brand").toLowerCase(),
        background: read("--bg").toLowerCase(),
        surface: read("--surface").toLowerCase(),
        text: read("--text").toLowerCase(),
        muted: read("--muted").toLowerCase(),
        success: read("--success").toLowerCase(),
        warning: read("--warning").toLowerCase(),
        error: read("--error").toLowerCase(),
        info: read("--info").toLowerCase(),
      };
    });

  const light = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const body = getComputedStyle(document.body);
    const heading = document.createElement("h1");
    const button = document.createElement("button");
    const input = document.createElement("input");
    button.className = "button button-primary";
    document.body.append(heading, button, input);
    const headingStyle = getComputedStyle(heading);
    const buttonStyle = getComputedStyle(button);
    const inputStyle = getComputedStyle(input);
    const read = (name: string) => root.getPropertyValue(name).trim();
    return {
      palette: {
        brand: read("--brand").toLowerCase(),
        brandSoft: read("--brand-soft").toLowerCase(),
        onBrand: read("--on-brand").toLowerCase(),
        background: read("--bg").toLowerCase(),
        surface: read("--surface").toLowerCase(),
        text: read("--text").toLowerCase(),
        muted: read("--muted").toLowerCase(),
        success: read("--success").toLowerCase(),
        warning: read("--warning").toLowerCase(),
        error: read("--error").toLowerCase(),
        info: read("--info").toLowerCase(),
      },
      spacing: Array.from({ length: 10 }, (_, index) =>
        read(`--space-${index + 1}`),
      ),
      radius: {
        card: read("--radius-card"),
        field: read("--radius-field"),
        modal: read("--radius-modal"),
      },
      fontSizes: {
        body: read("--font-size-body"),
        secondary: read("--font-size-secondary"),
        headingMin: read("--font-size-heading-mobile-min"),
        headingMax: read("--font-size-heading-mobile-max"),
        moneyMin: read("--font-size-money-min"),
        moneyMax: read("--font-size-money-max"),
        renderedBody: body.fontSize,
      },
      families: { body: body.fontFamily, heading: headingStyle.fontFamily },
      targetSizes: {
        button: buttonStyle.minHeight,
        input: inputStyle.minHeight,
        token: read("--touch-target-min"),
      },
    };
  });

  expect(normalizeHex(light.palette.brand)).toBe(
    normalizeHex(guide.color.brand),
  );
  expect(normalizeHex(light.palette.brandSoft)).toBe(
    normalizeHex(guide.color.lavender),
  );
  expect(normalizeHex(light.palette.background)).toBe(
    normalizeHex(guide.color.background),
  );
  expect(normalizeHex(light.palette.surface)).toBe(
    normalizeHex(guide.color.surface),
  );
  expect(normalizeHex(light.palette.text)).toBe(
    normalizeHex(guide.color.text),
  );
  expect(normalizeHex(light.palette.muted)).toBe(
    normalizeHex(guide.color.muted),
  );
  expect(normalizeHex(light.palette.success)).toBe(
    normalizeHex(guide.color.success),
  );
  expect(normalizeHex(light.palette.warning)).toBe(
    guide.color.warning.toLowerCase(),
  );
  expect(normalizeHex(light.palette.error)).toBe(
    normalizeHex(guide.color.error),
  );
  expect(normalizeHex(light.palette.info)).toBe(
    normalizeHex(guide.color.info),
  );
  expect(light.spacing).toEqual(guide.spacing.map((value) => `${value}px`));
  expect(light.radius).toEqual({
    card: `${guide.radius.card}px`,
    field: `${guide.radius.field}px`,
    modal: `${guide.radius.modal}px`,
  });
  expect(light.fontSizes).toEqual({
    body: `${guide.typography.body_px}px`,
    secondary: `${guide.typography.secondary_px}px`,
    headingMin: `${guide.typography.heading_mobile_px[0]}px`,
    headingMax: `${guide.typography.heading_mobile_px[1]}px`,
    moneyMin: `${guide.typography.money_px[0]}px`,
    moneyMax: `${guide.typography.money_px[1]}px`,
    renderedBody: `${guide.typography.body_px}px`,
  });
  expect(light.families.body).toContain("Inter");
  expect(light.families.heading).toContain("Plus Jakarta Sans");
  expect(light.targetSizes).toEqual({
    button: `${guide.touch_target_min_px}px`,
    input: "46px",
    token: `${guide.touch_target_min_px}px`,
  });

  const checkTextContrast = (palette: Awaited<ReturnType<typeof readPalette>>) => {
    for (const foreground of [
      palette.text,
      palette.muted,
      palette.brand,
      palette.success,
      palette.warning,
      palette.error,
      palette.info,
    ]) {
      for (const background of [palette.background, palette.surface]) {
        expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
      }
    }
    expect(contrast(palette.brand, palette.brandSoft)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrast(palette.onBrand, palette.brand)).toBeGreaterThanOrEqual(
      4.5,
    );
  };
  checkTextContrast(light.palette);

  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  const dark = await readPalette();
  expect(normalizeHex(dark.brand)).toBe(normalizeHex(guide.color.brand_dark));
  expect(normalizeHex(dark.background)).toBe(
    normalizeHex(guide.color.dark_background),
  );
  expect(normalizeHex(dark.surface)).toBe(
    normalizeHex(guide.color.dark_surface),
  );
  expect(normalizeHex(dark.text)).toBe(
    normalizeHex(guide.color.dark_text),
  );
  checkTextContrast(dark);
});
