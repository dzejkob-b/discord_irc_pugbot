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
        .map((k) => (since[k] == 0 ? '' : since[k] + k))
        .join(' ');
    return result.trim();
}

function timeRemaining(endtime) {
    const total = new Date(endtime) - new Date();
    return secondsToDuration(total);
}

function timeRemainingAsString(endtime) {
    const remaining = timeRemaining(endtime);
    const result = Object.keys(remaining)
        .map((k) => (remaining[k] == 0 ? '' : remaining[k] + k))
        .join(' ');
    return result.trim();
}

function addHours(date, h) {
    return new Date(date).getTime() + h * 60 * 60 * 1000;
}

export default {
    timeSince,
    timeSinceAsString,
    timeRemaining,
    timeRemainingAsString,
    addHours,
};
