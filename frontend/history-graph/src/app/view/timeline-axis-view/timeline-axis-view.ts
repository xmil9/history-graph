import { Component, computed, effect, inject, input, Signal, signal } from '@angular/core';
import { Point2D, Rect2D } from '../../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../graphics/gfx-style';
import { EventLabelLayoutFormat, EventLayoutService } from '../../services/event-layout.service';

@Component({
  selector: '[tl-axis]',
  templateUrl: './timeline-axis-view.html',
  styleUrl: './timeline-axis-view.css'
})
export class TimelineAxisView {
	private layoutService = inject(EventLayoutService);

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
		return this.calculateLabelPosition(this.startMarker(), this.layoutService.labelLayoutFormat());
	});
	endLabelPos = computed(() => {
		return this.calculateLabelPosition(this.endMarker(), this.layoutService.labelLayoutFormat());
	});

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);
	get labelRotation(): Signal<number> {
		return this.layoutService.labelRotation;
	}

	private calculateLabelPosition(marker: Rect2D, layoutFormat: EventLabelLayoutFormat): Point2D {
		if (layoutFormat === EventLabelLayoutFormat.Vertical) {
			return new Point2D(marker.left - this.textStyle().size / 3, marker.bottom + 5);
		} else {
			// Todo - calculate position based on text bbox.
			return new Point2D(marker.left - 17, marker.bottom + 20);
		}
	}
}