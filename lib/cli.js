#!/usr/bin/env node

import fs from "fs";
import program from "commander";
import path from "path";
import checkEnv from "check-env";
import stripJsonComments from "strip-json-comments";
import { endsWith } from "lodash";
import * as helpers from "./helpers";
import { ConfigurationError } from "./errors";
import { version } from "../package.json";

function readJSONConfig(filePath) {
	const configFile = fs.readFileSync(filePath, { encoding: "utf8" });

	try {
		return JSON.parse(stripJsonComments(configFile));
	} catch (err) {
		if (err instanceof SyntaxError) {
			throw new ConfigurationError(
				"The configuration file contains invalid JSON"
			);
		} else {
			throw err;
		}
	}
}

export function exit() {
	process.exit();
}

export function run_again() {
	const completePath = path.resolve(process.cwd(), process.env.CONFIG_FILE);
	const config = endsWith(process.env.CONFIG_FILE, ".js")
		? require(completePath)
		: readJSONConfig(completePath);

	helpers.createBots(config);
}

function run() {
	program
		.version(version)
		.option(
			"-c, --config <path>",
			"Sets the path to the config file, otherwise read from the env variable CONFIG_FILE."
		)
		.parse(process.argv);

	// If no config option is given, try to use the env variable:

	if (!program.config) {
		checkEnv(["CONFIG_FILE"]);
	} else {
		process.env.CONFIG_FILE = program.config;
	}

	/*
    process
        .on('SIGHUP', function() {
            that.exitWhenReady(true);
        })
        .on('exit', function() {
            process.kill(process.pid, 'SIGTERM');
        });
        */

	const completePath = path.resolve(process.cwd(), process.env.CONFIG_FILE);
	const config = endsWith(process.env.CONFIG_FILE, ".js")
		? require(completePath)
		: readJSONConfig(completePath);

	helpers.createBots(config);
}

export default run;
