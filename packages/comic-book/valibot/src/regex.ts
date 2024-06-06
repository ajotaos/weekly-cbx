const PUBLISHER_NAME_REGEX_STRING = '\\S+(?:\\s\\S+)*';
const SERIES_NAME_REGEX_STRING = '\\S+(?:\\s\\S+)* \\(\\d{4}\\)';
const ISSUE_NUMBER_REGEX_STRING = '\\d+(?:\\.[A-Z0-9]+)?';

const IMAGE_WIDTH_REGEX_STRING = '\\d+';
const IMAGE_HEIGHT_REGEX_STRING = '\\d+';

export const PUBLISHER_NAME_REGEX = new RegExp(
	`^${PUBLISHER_NAME_REGEX_STRING}$`,
	'u',
);
export const SERIES_NAME_REGEX = new RegExp(
	`^${SERIES_NAME_REGEX_STRING}$`,
	'u',
);
export const ISSUE_NUMBER_REGEX = new RegExp(
	`^${ISSUE_NUMBER_REGEX_STRING}$`,
	'u',
);

export const PUBLISHER_TITLE_REGEX = new RegExp(
	`^${PUBLISHER_NAME_REGEX_STRING}$`,
	'u',
);
export const SERIES_TITLE_REGEX = new RegExp(
	`^${PUBLISHER_NAME_REGEX_STRING} \\|> ${SERIES_NAME_REGEX_STRING}$`,
	'u',
);
export const ISSUE_TITLE_REGEX = new RegExp(
	`^${PUBLISHER_NAME_REGEX_STRING} \\|> ${SERIES_NAME_REGEX_STRING} \\|> ${ISSUE_NUMBER_REGEX_STRING}$`,
	'u',
);

export const PUBLISHER_TITLE_PARTS_REGEX = new RegExp(
	`^(?<name>${PUBLISHER_NAME_REGEX_STRING})$`,
	'u',
);
export const SERIES_TITLE_PARTS_REGEX = new RegExp(
	`^(?<publisher>${PUBLISHER_NAME_REGEX_STRING}) \\|> (?<name>${SERIES_NAME_REGEX_STRING})$`,
	'u',
);
export const ISSUE_TITLE_PARTS_REGEX = new RegExp(
	`^(?<publisher>${PUBLISHER_NAME_REGEX_STRING}) \\|> (?<series>${SERIES_NAME_REGEX_STRING}) \\|> (?<number>${ISSUE_NUMBER_REGEX_STRING})$`,
	'u',
);

// TODO: Re-export from shared package
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export const IMAGE_DIMENSIONS_META_REGEX = new RegExp(
	`^${IMAGE_WIDTH_REGEX_STRING}x${IMAGE_HEIGHT_REGEX_STRING}$`,
	'u',
);

export const IMAGE_DIMENSIONS_META_PARTS_REGEX = new RegExp(
	`^(?<width>${IMAGE_WIDTH_REGEX_STRING})x(?<height>${IMAGE_HEIGHT_REGEX_STRING})$`,
	'u',
);
