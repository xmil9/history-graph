import { Component, computed, inject, input, Signal } from '@angular/core';
import { Point2D, Rect2D, Size2D } from '../../../graphics/gfx-coord-2d';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../../graphics/gfx-style';
import { SvgIcon, SvgIconOrigin } from '../../util/svg-icon/svg-icon';
import { EventOverlayService } from '../../../services/event-overlay.service';
import { LayoutService } from '../../../services/layout.service';
import { PreferenceService } from '../../../services/preference.service';
import { EventGraphic, TimelineGraphic } from '../../../services/graphic-types';
import { formatEventLabel } from '../../../services/layout-utils';
import { MapService } from '../../../services/map.service';

@Component({
	selector: '[tl-event]',
	imports: [SvgIcon],
	templateUrl: './event-view.html',
	styleUrl: './event-view.css'
})
export class EventView {
	private overlayService = inject(EventOverlayService);
	private layoutService = inject(LayoutService);
	private preferenceService = inject(PreferenceService);
	private mapService = inject(MapService);

	// Expose types for template
	SvgIconOrigin = SvgIconOrigin;

	// Content
	tlEvent = input.required<EventGraphic>();
	eventIdx = input.required<number>();
	timeline = input.required<TimelineGraphic>();
	timelineIdx = input.required<number>();
	label = computed(() => {
		// Trigger recompute if date format changes.
		return formatEventLabel(this.tlEvent().hEvent, this.preferenceService.dateFormat().format);
	});

	isPeriod(): boolean {
		return this.tlEvent().hEvent.until !== undefined;
	}

	private get timelineLayout() {
		return this.layoutService.layout.timelines.items[this.timelineIdx()];
	}
	private get eventPosition() {
		return this.timelineLayout.eventPositions[this.eventIdx()];
	}

	// Positioning
	get position(): Point2D {
		const pos = this.eventPosition;
		if (pos === undefined) {
			return Point2D.invalid();
		}
		return pos.start;
	}
	get endPosition(): Point2D {
		const pos = this.eventPosition;
		if (pos === undefined || !pos.end) {
			return Point2D.invalid();
		}
		return pos.end;
	}
	get eventMarkerSize(): Size2D {
		return this.timelineLayout.eventMarkerSize;
	}
	get periodBounds(): Rect2D {
		const pos = this.eventPosition;
		if (pos === undefined || !pos.periodBounds) {
			return Rect2D.empty();
		}
		return pos.periodBounds;
	}
	
	// Styling
	textStyle = input<TextStyle>(DEFAULT_TEXT_STYLE);
	get labelColor(): string {
		return this.tlEvent().theme.primaryColor;
	}
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);
	get periodColor(): string {
		return this.tlEvent().theme.primaryColor;
	}
	get markerColor(): string {
		return this.tlEvent().theme.primaryColor;
	}

	onMarkerMouseEnter(mouseEvent: MouseEvent) {
		this.overlayService.setOverlay(
			this.tlEvent().hEvent,
			mouseEvent.clientX,
			mouseEvent.clientY
		);
		this.mapService.highlightTimelineEvent(this.tlEvent());
	}

	onMarkerMouseMove(mouseEvent: MouseEvent) {
		if (this.overlayService.overlay()) {
			this.overlayService.setOverlay(
				this.tlEvent().hEvent,
				mouseEvent.clientX,
				mouseEvent.clientY
			);
		}
	}

	onMarkerMouseLeave() {
		this.overlayService.clearOverlay();
		this.mapService.unhighlightTimelineEvent(this.tlEvent());
	}
}
