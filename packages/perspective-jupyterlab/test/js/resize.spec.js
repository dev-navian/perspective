/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

const { test } = require("@playwright/test");
import { compareContentsToSnapshot } from "@finos/perspective-test";

test.beforeEach(async ({ page }) => {
    await page.goto("/@finos/perspective-jupyterlab/dist/umd/resize.html", {
        waitUntil: "networkidle",
    });
});

test.describe("JupyterLab resize", () => {
    test("Config should be hidden by default", async ({ page }) => {
        const contents = await page.evaluate(async () => {
            await window.__WIDGET__.viewer.getTable();
            await window.__WIDGET__.viewer.flush();

            // Linux returns ever-so-slightly different auto width
            // column values so we need to strip these.
            for (const elem of document.querySelectorAll(
                "perspective-viewer *"
            )) {
                elem.removeAttribute("style");
            }

            return window.__WIDGET__.viewer.innerHTML;
        });

        await compareContentsToSnapshot(contents, [
            "jupyterlab-resize-config-hidden.txt",
        ]);
    });

    test("Resize the container causes the widget to resize", async ({
        page,
    }) => {
        await page.evaluate(async () => {
            await document.querySelector("perspective-viewer").toggleConfig();
            await document.querySelector("perspective-viewer").getTable();
        });

        await page.evaluate(async () => {
            document
                .querySelector(".PSPContainer")
                .setAttribute(
                    "style",
                    "position:absolute;top:0;left:0;width:300px;height:300px"
                );

            await document.querySelector("perspective-viewer").notifyResize();
        });

        const contents = await page.evaluate(async () => {
            document.querySelector(".PSPContainer").style =
                "position:absolute;top:0;left:0;width:800px;height:600px";
            await document.querySelector("perspective-viewer").notifyResize();

            for (const elem of document.querySelectorAll(
                "perspective-viewer *"
            )) {
                elem.removeAttribute("style");
            }

            return window.__WIDGET__.viewer.innerHTML;
        });

        await compareContentsToSnapshot(contents, [
            "jupyterlab-resize-config-shown.txt",
        ]);
    });

    test("group_by traitlet works", async ({ page }) => {
        await page.evaluate(async () => {
            await document.querySelector("perspective-viewer").toggleConfig();
            await document.querySelector("perspective-viewer").getTable();
            await document.querySelector("perspective-viewer").flush();
        });

        const contents = await page.evaluate(async () => {
            await window.__WIDGET__.restore({ group_by: ["State"] });
            for (const elem of document.querySelectorAll(
                "perspective-viewer *"
            )) {
                elem.removeAttribute("style");
            }

            return window.__WIDGET__.viewer.innerHTML;
        });

        await compareContentsToSnapshot(contents, [
            "jupyterlab-resize-group-by-traitlet.txt",
        ]);
    });
});
