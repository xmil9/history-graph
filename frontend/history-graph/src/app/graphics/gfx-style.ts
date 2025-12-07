///////////////////

export const DEFAULT_CONTENT_COLOR = '#222';
export const DEFAULT_PERIOD_COLOR = 'rgba(40, 113, 230, 1)';

///////////////////

export interface TextStyle {
	font: string;
	size: number;
	weight: number;
	color: string;
	rotation?: number;
}

export const DEFAULT_TEXT_STYLE: TextStyle = {
	font: 'Lato',
	size: 12,
	weight: 400,
	color: DEFAULT_CONTENT_COLOR
};

///////////////////

export interface LineStyle {
	color: string;
	width: number;
}

export const DEFAULT_LINE_STYLE: LineStyle = {
	color: DEFAULT_CONTENT_COLOR,
	width: 2
};
