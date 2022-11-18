import _ from "lodash";
import Bot from "./bot.js";
import { ConfigurationError } from "./errors.js";

/**
 * Reads from the provided config file and returns an array of bots
 * @return {object[]}
 */
export function createBots(configFile) {
	if (Array.isArray(configFile)) {
		let bot = new Bot(configFile[0]);

		bot.connect();
	} else if (_.isObject(configFile)) {
		let bot = new Bot(configFile);

		bot.connect();
	} else {
		throw new ConfigurationError();
	}
}

export function secsAgoFormat(seconds) {
	var interval = Math.floor(seconds / 31536000);
	var level = false,
		out = "";

	if (interval >= 1) {
		out += interval + " years ";
		seconds -= interval * 31536000;
		level = 5;
	}

	interval = Math.floor(seconds / 2592000);

	if (interval >= 1) {
		out += interval + " months ";
		seconds -= interval * 2592000;

		if (level == false) level = 4;
	}

	interval = Math.floor(seconds / 86400);

	if (interval >= 1) {
		out += interval + " days ";
		seconds -= interval * 86400;

		if (level == false) level = 3;
		else if (level >= 4) return out.substr(0, out.length - 1);
	}

	interval = Math.floor(seconds / 3600);

	if (interval >= 1) {
		out += interval + " hours ";
		seconds -= interval * 3600;

		if (level == false) level = 2;
		else if (level >= 3) return out.substr(0, out.length - 1);
	}

	interval = Math.floor(seconds / 60);

	if (interval >= 1) {
		out += interval + " minutes ";
		seconds -= interval * 60;

		if (level == false) level = 1;
	}

	out += Math.floor(seconds) + " seconds";

	return out;
}
