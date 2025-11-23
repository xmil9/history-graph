import { AfterViewInit, Component, computed, effect, ElementRef, inject, input, Signal, signal } from '@angular/core';
import { INVALID_POSITION_SENTINEL, Point2D, Rect2D, Size2D } from '../../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../graphics/gfx-style';
import { HEvent } from '../../model/historic-event';
import { HDateFormat } from '../../model/historic-date';
import { SvgIcon, SvgIconOrigin } from '../svg-icon/svg-icon';
import { EventOverlayService } from '../../services/event-overlay.service';
import { EventLayoutService } from '../../services/event-layout.service';
import { LayoutFormat } from '../../services/layout-types';
import { AxisLayoutService } from '../../services/axis-layout.service';

@Component({
	selector: '[tl-event]',
	imports: [SvgIcon],
	templateUrl: './timeline-event-view.html',
	styleUrl: './timeline-event-view.css'
})
export class TimelineEventView implements AfterViewInit {
	private overlayService = inject(EventOverlayService);
	private layoutService = inject(EventLayoutService);
	private axisLayoutService = inject(AxisLayoutService);

	// Expose types for template
	SvgIconOrigin = SvgIconOrigin;
	LayoutFormat = LayoutFormat;

	// Content
	tlEvent = input.required<HEvent>();
	index = input.required<number>();
	dateFormat = input.required<HDateFormat>();
	label = computed(() => {
		return this.layoutService.formatLabel(this.tlEvent());
	});

	// Positioning
	get position(): Point2D {
		const pos = this.layoutService.getEventPositionInDisplay(this.index());
		if (pos === undefined) {
			return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
		}
		return pos;
	}
	get eventMarkerSize(): Signal<Size2D> {
		return this.axisLayoutService.eventMarkerSize;
	}
	get layoutFormat(): Signal<LayoutFormat> {
		return this.layoutService.labelLayoutFormat;
	}
	get labelPos(): Point2D {
		return this.layoutService.labelPositions[this.index()];
	}
	get labelConnectorPath(): string {
		const pos = this.layoutService.getEventPositionInDisplay(this.index());
		if (pos === undefined) {
			return '';
		}
		return this.layoutService.labelConnectorPaths[this.index()];
	}
	get labelRotation(): Signal<number> {
		return this.layoutService.labelRotation;
	}



	// Styling
	textStyle = input<TextStyle>(DEFAULT_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);

	constructor() {
	}

	ngAfterViewInit(): void {
		console.log('ngAfterViewInit EventView ', this.index());
	}

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
