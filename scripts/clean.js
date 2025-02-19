/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

const { clean, exec_with_scope, run_with_scope } = require("./script_utils.js");

const glob = require("glob");
const minimatch = require("minimatch");
const args = process.argv.slice(2);

const IS_SCREENSHOTS = args.indexOf("--screenshots") !== -1;

// Question: Cleaning of screenshots can be removed, because they are not currently
// used, right?
async function clean_screenshots(scope) {
    if (args.indexOf("--all") !== -1) {
        try {
            exec_with_scope`npx rimraf test/screenshots`;
        } catch (e) {}
    } else {
        await run_with_scope`clean:screenshots`;
    }
}

async function run() {
    try {
        if (process.env.PSP_PROJECT === "python") {
            clean(
                "python/perspective/dist",
                "python/perspective/build",
                "python/perspective/docs/build",
                "python/perspective/perspective_python.egg-info",
                "python/perspective/.coverage",
                "python/perspective/.pytest_cache",
                "python/perspective/python_junit.xml",
                "python/perspective/coverage.xml",
                ...glob.sync("python/perspective/**/*.pyc"),
                ...glob.sync("python/perspective/**/__pycache__")
            );

            process.exit(0);
        }

        if (!process.env.PSP_PROJECT || args.indexOf("--deps") > -1) {
            clean(
                "cpp/perspective/dist",
                "cpp/perspective/build",
                "packages/perspective/build"
            );
        }

        let scope =
            process.env.PACKAGE && process.env.PACKAGE !== ""
                ? `${process.env.PACKAGE}`
                : "*";

        if (!IS_SCREENSHOTS) {
            if (
                !process.env.PACKAGE ||
                minimatch("perspective", process.env.PACKAGE)
            ) {
                const files = [
                    "CMakeFiles",
                    "build",
                    "cmake_install.cmake",
                    "CMakeCache.txt",
                    "compile_commands.json",
                    "libpsp.a",
                    "Makefile",
                ];
                clean(...files.map((x) => `cpp/perspective/obj/${x}`));
            }

            await run_with_scope`clean`;
            clean("docs/build", "docs/python", "docs/obj");
        }

        await clean_screenshots(scope);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
