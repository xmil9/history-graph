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
	color: 'black'
};

///////////////////

export interface LineStyle {
	color: string;
	width: number;
}

export const DEFAULT_LINE_STYLE: LineStyle = {
	color: 'black',
	width: 2
};
