import { Component, computed, inject, input } from '@angular/core';
import { Point2D, Rect2D, Size2D } from '../../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../graphics/gfx-style';
import { HEvent } from '../../model/historic-event';
import { HDateFormat } from '../../model/historic-date';
import { SvgIcon, SvgIconOrigin } from '../svg-icon/svg-icon';
import { TimelineEventOverlayService } from '../../services/timeline-event-overlay.service';
import { TimelineEventLabelLayout, TimelineEventLayoutService } from '../../services/timeline-event-layout.service';

@Component({
  	selector: '[tl-event]',
	imports: [SvgIcon],
	templateUrl: './timeline-event-view.html',
  	styleUrl: './timeline-event-view.css'
})
export class TimelineEventView {
	private overlayService = inject(TimelineEventOverlayService);
	private layoutService = inject(TimelineEventLayoutService);

	// Expose types for template
	SvgIconOrigin = SvgIconOrigin;
	TimelineEventLabelLayout = TimelineEventLabelLayout;

	// Content
	tlEvent = input.required<HEvent>();
	dateFormat = input.required<HDateFormat>();
	label = computed(() => {
		return this.dateFormat().format(this.tlEvent().when) + ' - ' + this.tlEvent().label;
	});

	// Positioning
	position = input.required<Point2D>();
	markerSize = input<Size2D>(new Size2D(8));
	labelLayout = computed(() => this.layoutService.labelLayout());
	labelPos = computed(() => {
		switch (this.labelLayout()) {
			case TimelineEventLabelLayout.Vertical:
				this.textStyle().rotation = 90;
				return new Point2D(
					this.position().x - this.textStyle().size / 3,
					this.position().y + this.markerSize().height / 2 + 5
				);
			case TimelineEventLabelLayout.Horizontal:
				this.textStyle().rotation = 0;
				return new Point2D(
					this.position().x - this.textStyle().size / 3,
					this.position().y + this.markerSize().height / 2 + 20
				);
			default:
				return this.position();
		}
	});

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
