import { HDateFormat } from "../model/historic-date";

export interface LabeledDateFormat {
	name: string;
	format: HDateFormat;
}

export enum LayoutFormat {
	None = 'none',
	Vertical = 'vertical',
	HorizontalLeft = 'horizontal-left',
	HorizontalCenter = 'horizontal-center',
}