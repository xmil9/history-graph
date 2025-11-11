import { Component, computed, effect, inject, input, Signal, signal } from '@angular/core';
import { Point2D, Rect2D } from '../../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../graphics/gfx-style';
import { EventLayoutService } from '../../services/event-layout.service';
import { LayoutFormat } from '../../services/layout-types';
import { AxisLayoutService } from '../../services/axis-layout.service';

@Component({
  selector: '[tl-axis]',
  templateUrl: './timeline-axis-view.html',
  styleUrl: './timeline-axis-view.css'
})
export class TimelineAxisView {
	private eventLayoutService = inject(EventLayoutService);
	private axisLayoutService = inject(AxisLayoutService);

	// Content
	startLabel = input.required<string>();
	endLabel = input.required<string>();
	
	// Positioning
	get startPos(): Signal<Point2D> {
		return this.axisLayoutService.startPos;
	}
	get endPos(): Signal<Point2D> {
		return this.axisLayoutService.endPos;
	}
	get displayBounds(): Signal<Rect2D> {
		return this.axisLayoutService.displayBounds;
	}
	markerLength = input<number>(10);
	startMarker = computed(() => {
		return new Rect2D(
			new Point2D(this.displayBounds().left, this.displayBounds().center.y - this.markerLength()),
			new Point2D(this.displayBounds().left, this.displayBounds().center.y + this.markerLength())
		);
	});
	endMarker = computed(() => {
		return new Rect2D(
			new Point2D(this.displayBounds().right, this.displayBounds().center.y - this.markerLength()),
			new Point2D(this.displayBounds().right, this.displayBounds().center.y + this.markerLength())
		);
	});
	startLabelPos = computed(() => {
		return this.calculateLabelPosition(
			this.startPos(),
			this.startMarker(),
			this.eventLayoutService.labelLayoutFormat()
		);
	});
	endLabelPos = computed(() => {
		return this.calculateLabelPosition(
			this.endPos(),
			this.endMarker(),
			this.eventLayoutService.labelLayoutFormat()
		);
	});

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);

	get labelRotation(): Signal<number> {
		return this.eventLayoutService.labelRotation;
	}

	private calculateLabelPosition(virtualPos: Point2D, marker: Rect2D, layoutFormat: LayoutFormat): Point2D {
		if (layoutFormat === LayoutFormat.Vertical) {
			return new Point2D(virtualPos.x - this.textStyle().size / 3, marker.bottom + 5);
		} else {
			// Todo - calculate position based on text bbox.
			return new Point2D(virtualPos.x - 17, marker.bottom + 20);
		}
	}
}