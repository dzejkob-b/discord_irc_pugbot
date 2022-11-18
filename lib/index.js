#!/usr/bin/env node

import logger from "winston";
// import * as logger from "winston";
import run from "./cli.js";

run();
/* istanbul ignore next */
if (process.env.NODE_ENV === "development") {
	logger.level = "debug";
}
