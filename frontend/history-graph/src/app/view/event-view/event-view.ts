import { Component, computed, inject, input, Signal } from '@angular/core';
import { INVALID_POSITION_SENTINEL, Point2D, Rect2D, Size2D } from '../../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../graphics/gfx-style';
import { HEvent } from '../../model/historic-event';
import { SvgIcon, SvgIconOrigin } from '../svg-icon/svg-icon';
import { EventOverlayService } from '../../services/event-overlay.service';
import { EventLayoutService } from '../../services/event-layout.service';
import { LayoutFormat } from '../../services/preference-types';
import { AxisLayoutService } from '../../services/axis-layout.service';
import { PreferenceService } from '../../services/preference.service';

@Component({
	selector: '[tl-event]',
	imports: [SvgIcon],
	templateUrl: './event-view.html',
	styleUrl: './event-view.css'
})
export class EventView {
	private overlayService = inject(EventOverlayService);
	private layoutService = inject(EventLayoutService);
	private axisLayoutService = inject(AxisLayoutService);
	private preferenceService = inject(PreferenceService);

	// Expose types for template
	SvgIconOrigin = SvgIconOrigin;
	LayoutFormat = LayoutFormat;

	// Content
	tlEvent = input.required<HEvent>();
	index = input.required<number>();
	label = computed(() => {
		// Trigger recompute
		this.preferenceService.dateFormat();
		return this.layoutService.formatLabel(this.tlEvent());
	});

	isPeriod(): boolean {
		return this.tlEvent().until !== undefined;
	}

	// Positioning
	get position(): Point2D {
		const pos = this.layoutService.getEventPositionInDisplay(this.index());
		if (pos === undefined) {
			return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
		}
		return pos;
	}
	get endPosition(): Point2D {
		const pos = this.layoutService.getEventEndPositionInDisplay(this.index());
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
	get periodBounds(): Signal<Rect2D> {
		return this.layoutService.getPeriodBounds(this.index());
	}
	
	// Styling
	textStyle = input<TextStyle>(DEFAULT_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);

	constructor() {
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
