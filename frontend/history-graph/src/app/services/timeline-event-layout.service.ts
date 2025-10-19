import { Injectable, signal } from '@angular/core';

export enum TimelineEventLabelLayout {
	None = 'none',
	Vertical = 'vertical',
	Horizontal = 'horizontal',
}

@Injectable({
	providedIn: 'root'
})
export class TimelineEventLayoutService {
	labelLayout = signal<TimelineEventLabelLayout>(TimelineEventLabelLayout.None);

	setLabelLayout(labelLayout: TimelineEventLabelLayout) {
		this.labelLayout.set(labelLayout);
	}
}

