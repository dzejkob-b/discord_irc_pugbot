function secondsToDuration(total) {
	const seconds = Math.floor((total / 1000) % 60);
	const minutes = Math.floor((total / 1000 / 60) % 60);
	const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
	const days = Math.floor(total / (1000 * 60 * 60 * 24));

	return {
		//total,
		days,
		hours,
		minutes,
		seconds,
	};
}

function timeSince(date) {
	const spread = new Date() - date;
	return secondsToDuration(spread);
}

function timeSinceAsString(date) {
	const since = timeSince(date);
	const result = Object.keys(since)
		.map((k) => (since[k] == 0 ? "" : since[k] + k[0]))
		.join(" ");
	return result.trim();
}

function timeRemaining(endtime) {
	const total = new Date(endtime) - new Date();
	return secondsToDuration(total);
}

function timeRemainingAsString(endtime) {
	const remaining = timeRemaining(endtime);
	const result = Object.keys(remaining)
		.map((k) => (remaining[k] == 0 ? "" : remaining[k] + k[0]))
		.join(" ");
	return result.trim();
}

function addHours(date, h) {
	return new Date(date).getTime() + h * 60 * 60 * 1000;
}

function getDaysList(numDays) {
	var cdate = new Date(),
		result = [];

	while (numDays > 0) {
		// fuck ... this javascript Date class is hell ...

		result.push(cdate);

		if (cdate.getDate() > 1) {
			cdate = new Date(
				cdate.getFullYear(),
				cdate.getMonth(),
				cdate.getDate() - 1
			);
		} else {
			var cYear = cdate.getFullYear(),
				cMonth = cdate.getMonth();

			cMonth--;

			if (cMonth < 0) {
				cMonth = 11;
				cYear--;
			}

			cdate = new Date(cYear, cMonth, new Date(cYear, cMonth + 1, 0).getDate());
		}

		numDays--;
	}

	return result;
}

function dateToSql(dateRef) {
	var year = parseInt(dateRef.getFullYear());
	var month = parseInt(dateRef.getMonth()) + 1;
	var day = parseInt(dateRef.getDate());

	return (
		"" +
		year +
		"-" +
		(month < 10 ? "0" : "") +
		month +
		"-" +
		(day < 10 ? "0" : "") +
		day
	);
}

function lessThenInSecs(dateTicks, seconds) {
	return new Date() - new Date(dateTicks) < seconds;
}

export default {
	timeSince,
	timeSinceAsString,
	timeRemaining,
	timeRemainingAsString,
	addHours,
	getDaysList,
	dateToSql,
	lessThenInSecs,
};
