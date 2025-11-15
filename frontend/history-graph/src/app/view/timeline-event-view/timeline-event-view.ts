import { AfterViewInit, Component, computed, effect, ElementRef, inject, input, Signal, signal } from '@angular/core';
import { INVALID_POSITION_SENTINEL, Point2D, Rect2D, Size2D } from '../../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../graphics/gfx-style';
import { HEvent } from '../../model/historic-event';
import { HDateFormat } from '../../model/historic-date';
import { SvgIcon, SvgIconOrigin } from '../svg-icon/svg-icon';
import { EventOverlayService } from '../../services/event-overlay.service';
import { EventLayoutService } from '../../services/event-layout.service';
import { LayoutFormat } from '../../services/layout-types';

@Component({
  	selector: '[tl-event]',
	imports: [SvgIcon],
	templateUrl: './timeline-event-view.html',
  	styleUrl: './timeline-event-view.css'
})
export class TimelineEventView implements AfterViewInit {
	private overlayService = inject(EventOverlayService);
	private layoutService = inject(EventLayoutService);

	// Expose types for template
	SvgIconOrigin = SvgIconOrigin;
	LayoutFormat = LayoutFormat;

	// Content
	tlEvent = input.required<HEvent>();
	index = input.required<number>();
	dateFormat = input.required<HDateFormat>();
	label = computed(() => {
		return this.dateFormat().format(this.tlEvent().when) + ' - ' + this.tlEvent().label;
	});

	// Positioning
	get position(): Point2D {
		const pos = this.layoutService.getEventPositionInDisplay(this.index());
		if (pos === undefined) {
			return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
		}
		return pos;
	}
	markerSize = input<Size2D>(new Size2D(8));
	get layoutFormat(): Signal<LayoutFormat> {
		return this.layoutService.labelLayoutFormat;
	}
	get labelPos(): Point2D {
		return this.layoutService.labelPos[this.index()];
	}
	get labelConnectorPath(): string {
		const pos = this.layoutService.getEventPositionInDisplay(this.index());
		if (pos === undefined) {
			return '';
		}
		return this.layoutService.labelConnectorPath[this.index()];
	}
	get labelRotation(): Signal<number> {
		return this.layoutService.labelRotation;
	}
	
	// Get text bounding box for clipping (only for horizontal layout)
	get textBBox(): { x: number; y: number; width: number; height: number } | null {
		if (this.layoutFormat() !== LayoutFormat.Horizontal) {
			return null;
		}
		// Get the text element's bounding box
		const labelElement = document.querySelector(`#event-label-${this.index()}`) as SVGTextElement | null;
		if (!labelElement) {
			return null;
		}
		try {
			return labelElement.getBBox();
		} catch (e) {
			return null;
		}
	}
	
	// Check if the connector path extends into the text area (needs masking).
	get needsMask(): boolean {
		if (this.layoutFormat() !== LayoutFormat.Horizontal) {
			return false;
		}
		const path = this.labelConnectorPath;
		if (!path) {
			return false;
		}
		// If the path contains two line-to ('L') commands, it's an L-shaped path that extends horizontally
		// and might go into the text area, so it needs masking.
		const lCount = (path.match(/L/g) || []).length;
		return lCount >= 2;
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
