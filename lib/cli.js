#!/usr/bin/env node

import fs from "fs";
import { program } from "commander";
import path from "path";
import stripJsonComments from "strip-json-comments";
import * as helpers from "./helpers.js";
import { ConfigurationError } from "./errors.js";

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
		? import(completePath)
		: readJSONConfig(completePath);

	helpers.createBots(config);
}

function run() {
	program
		// .version(version)
		.option(
			"-c, --config <path>",
			"Sets the path to the config file, otherwise read from the env variable CONFIG_FILE."
		)
		.option(
			"-e, --env <environment>",
			"Sets the environment you want [development|public(default)]."
		)
		.parse(process.argv);

	// If no config option is given, try to use the env variable:

	const options = program.opts();
	if (options.config) {
		process.env.CONFIG_FILE = options.config;
	} else if (!process.env.CONFIG_FILE) {
		throw new Error("Missing environment variable: CONFIG_FILE");
	}
	if (options.env) {
		process.env.NODE_ENV = options.env || "public";
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
	const config = process.env.CONFIG_FILE.endsWith(".js")
		? import(completePath)
		: readJSONConfig(completePath);

	helpers.createBots(config);
}

export default run;
