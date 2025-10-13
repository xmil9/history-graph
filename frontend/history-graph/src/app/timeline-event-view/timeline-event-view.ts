import { Component, computed, input } from '@angular/core';
import { Point2D, Rect2D, Size2D } from '../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../graphics/gfx-style';
import { HEvent } from '../model/historic-event';
import { HDateFormat } from '../model/historic-date';
import { AppIcon, IconOrigin } from '../app-icon/app-icon';

@Component({
  	selector: '[tl-event]',
	imports: [AppIcon],
	templateUrl: './timeline-event-view.html',
  	styleUrl: './timeline-event-view.css'
})
export class TimelineEventView {
	// Expose enum for template
	IconOrigin = IconOrigin;

	// Content
	event = input.required<HEvent>();
	dateFormat = input.required<HDateFormat>();
	label = computed(() => {
		return this.dateFormat().format(this.event().when) + ' - ' + this.event().label;
	});

	// Positioning
	position = input.required<Point2D>();
	markerSize = input<Size2D>(new Size2D(16));
	labelPos = computed(() => {
		return new Point2D(
			this.position().x - this.textStyle().size / 3,
			this.position().y + this.markerSize().height / 2 + 5
		);
	});

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);
}
