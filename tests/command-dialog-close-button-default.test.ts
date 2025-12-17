import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "..");

test("CommandDialog default showCloseButton is false (backward compatible)", () => {
  const commandSource = readFileSync(
    path.join(repoRoot, "components", "ui", "command.tsx"),
    "utf8"
  );

  expect(commandSource).toContain("showCloseButton = false");
  expect(commandSource).toContain("showCloseButton={showCloseButton}");
});

test("DialogContent close button is conditional on showCloseButton", () => {
  const dialogSource = readFileSync(
    path.join(repoRoot, "components", "ui", "dialog.tsx"),
    "utf8"
  );

  expect(dialogSource).toContain("{showCloseButton && (");
  expect(dialogSource).toContain('data-slot="dialog-close"');
});
