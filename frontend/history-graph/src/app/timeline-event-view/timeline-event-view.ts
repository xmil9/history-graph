import { Component, computed, input } from '@angular/core';
import { Point2D, Rect2D } from '../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../graphics/gfx-style';

@Component({
  selector: '[tl-event]',
  templateUrl: './timeline-event-view.html',
  styleUrl: './timeline-event-view.css'
})
export class TimelineEventView {
	// Content
	label = input.required<string>();
	eventId = input.required<string>();
	
	// Positioning
	position = input.required<Point2D>();
	markerLength = input<number>(8);
	marker = computed(() => { return new Rect2D(
		new Point2D(this.position().x, this.position().y - this.markerLength()),
		new Point2D(this.position().x, this.position().y + this.markerLength())
	)});
	labelPos = computed(() => {
		return new Point2D(this.marker().left - this.textStyle().size / 3, this.marker().bottom + 5);
	});

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);
}
