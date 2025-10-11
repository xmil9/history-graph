import { Component, computed, input } from '@angular/core';
import { Point2D, Rect2D } from '../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../graphics/gfx-style';

@Component({
  selector: '[tl-axis]',
  templateUrl: './timeline-axis-view.html',
  styleUrl: './timeline-axis-view.css'
})
export class TimelineAxisView {
	// Content
	startLabel = input.required<string>();
	endLabel = input.required<string>();
	
	// Positioning
	startPos = input.required<Point2D>();
	endPos = input.required<Point2D>();
	markerLength = input<number>(10);
	startMarker = computed(() => { return new Rect2D(
		new Point2D(this.startPos().x, this.startPos().y - this.markerLength()),
		new Point2D(this.startPos().x, this.startPos().y + this.markerLength())
	)});
	endMarker = computed(() => { return new Rect2D(
		new Point2D(this.endPos().x, this.endPos().y - this.markerLength()),
		new Point2D(this.endPos().x, this.endPos().y + this.markerLength())
	)});
	startLabelPos = computed(() => {
		return new Point2D(this.startMarker().left - this.textStyle().size / 3, this.startMarker().bottom + 5);
	});
	endLabelPos = computed(() => {
		return new Point2D(this.endMarker().left - this.textStyle().size / 3, this.endMarker().bottom + 5);
	});

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);
}