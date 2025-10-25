import { Component, computed, inject, input } from '@angular/core';
import { Point2D, Rect2D, Size2D } from '../../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../graphics/gfx-style';
import { HEvent } from '../../model/historic-event';
import { HDateFormat } from '../../model/historic-date';
import { SvgIcon, SvgIconOrigin } from '../svg-icon/svg-icon';
import { EventOverlayService } from '../../services/event-overlay.service';
import { EventLabelLayoutFormat, EventLayoutService } from '../../services/event-layout.service';

@Component({
  	selector: '[tl-event]',
	imports: [SvgIcon],
	templateUrl: './timeline-event-view.html',
  	styleUrl: './timeline-event-view.css'
})
export class TimelineEventView {
	private overlayService = inject(EventOverlayService);
	private layoutService = inject(EventLayoutService);

	// Expose types for template
	SvgIconOrigin = SvgIconOrigin;
	EventLabelLayoutFormat = EventLabelLayoutFormat;

	// Content
	tlEvent = input.required<HEvent>();
	index = input.required<number>();
	dateFormat = input.required<HDateFormat>();
	label = computed(() => {
		return this.dateFormat().format(this.tlEvent().when) + ' - ' + this.tlEvent().label;
	});

	// Positioning
	position = input.required<Point2D>();
	markerSize = input<Size2D>(new Size2D(8));
	get labelLayoutFormat(): EventLabelLayoutFormat {
		return this.layoutService.labelLayoutFormat;
	}
	get labelPos(): Point2D {
		return this.layoutService.labelPos[this.index()];
	}
	get labelRotation(): number {
		return this.layoutService.labelRotation;
	}

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);

	onMarkerMouseEnter(mouseEvent: MouseEvent) {
		this.overlayService.setOverlay(
			this.tlEvent(),
			mouseEvent.clientX,
			mouseEvent.clientY
		);
	}

	onMarkerMouseMove(mouseEvent: MouseEvent) {
		if (this.overlayService.overlay()) {
			this.overlayService.setOverlay(
				this.tlEvent(),
				mouseEvent.clientX,
				mouseEvent.clientY
			);
		}
	}

	onMarkerMouseLeave() {
		this.overlayService.clearOverlay();
	}
}
