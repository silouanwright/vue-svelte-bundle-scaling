import { expect, test } from "@playwright/test";

const implementations = [
  { name: "Vue", url: "http://127.0.0.1:4374" },
  { name: "Svelte", url: "http://127.0.0.1:4375" },
];

for (const implementation of implementations) {
  test(`${implementation.name} satisfies the core Weather Workspace contract`, async ({
    page,
  }) => {
    await page.goto(implementation.url);

    const current = page.getByTestId("current-weather");
    await expect(current.getByRole("heading")).toHaveText("Chicago, Illinois");
    await expect(current.getByText("23°C")).toBeVisible();
    await expect(page.getByTestId("forecast").getByRole("listitem")).toHaveCount(
      7,
    );

    await page.getByRole("button", { name: "°F" }).click();
    await expect(current.getByText("73°F")).toBeVisible();

    await page.getByLabel("Location").fill("Tokyo");
    const suggestions = page.getByRole("list", { name: "Locations" });
    await expect(suggestions.getByRole("button")).toHaveCount(1);
    await suggestions.getByRole("button", { name: /Tokyo, Kantō/ }).click();

    await expect(current.getByRole("heading")).toHaveText("Tokyo, Kantō");
    await expect(current.getByText("81°F")).toBeVisible();
    await expect(
      page.getByLabel(/Light rain, 81°F, humidity 66%/),
    ).toBeVisible();
  });
}
