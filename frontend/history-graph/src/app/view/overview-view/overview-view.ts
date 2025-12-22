import { Component, computed, inject, input, signal, Signal } from '@angular/core';
import { SvgIcon, SvgIconOrigin } from '../svg-icon/svg-icon';
import { INVALID_POSITION_SENTINEL, Point2D, Rect2D, Size2D } from '../../graphics/gfx-coord-2d';
import { DEFAULT_PERIOD_COLOR, LineStyle } from '../../graphics/gfx-style';
import { TimelineService } from '../../services/timeline.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { LayoutService } from '../../services/layout.service';

export const DEFAULT_OVERVIEW_BACKGROUND = '#d0d0d0';
export const DEFAULT_OVERVIEW_LINE_STYLE: LineStyle = {
	color: '#333333',
	width: 1
};

export const DEFAULT_OVERVIEW_DISPLAYED_BACKGROUND = '#f8f8f8';
export const DEFAULT_OVERVIEW_DISPLAYED_LINE_STYLE: LineStyle = {
	color: DEFAULT_OVERVIEW_BACKGROUND,
	width: 0.2
};

export const NON_DISPLAYED_ICON_OPACITY = 0.6;
export const DISPLAYED_ICON_OPACITY = 0.9;

@Component({
	selector: '[tl-overview]',
	imports: [SvgIcon],
	templateUrl: './overview-view.html',
	styleUrl: './overview-view.css'
})
export class OverviewView {
	private timelineService = inject(TimelineService);
	private layout = inject(LayoutService);

	// Expose types for template
	SvgIconOrigin = SvgIconOrigin;

	// Content
	timeline = toSignal(this.timelineService.timeline$, {
		initialValue: this.timelineService.timeline
	});

	// Positioning
	get displayBounds(): Signal<Rect2D> {
		return this.layout.axis.overviewBounds;
	}
	get axisBounds(): Signal<Rect2D> {
		return this.layout.axis.overviewAxisBounds;
	}
	get displayedBounds(): Signal<Rect2D> {
		return this.layout.axis.overviewDisplayedBounds;
	}
	get startPos(): Signal<Point2D> {
		return computed(() => new Point2D(this.axisBounds().left, this.axisBounds().center.y));
	}
	get endPos(): Signal<Point2D> {
		return computed(() => new Point2D(this.axisBounds().right, this.axisBounds().center.y));
	}
	get markerSize(): Signal<Size2D> {
		return this.layout.axis.overviewMarkerSize;
	}
	getOverviewEventPosition(index: number): Signal<Point2D> {
		return computed(() => {
			return this.layout.events.overviewEventPositions()[index].start;
		});
	}
	getOverviewEventEndPosition(index: number): Signal<Point2D> {
		return computed(() => {
			const pos = this.layout.events.overviewEventPositions()[index].end;
			if (pos === undefined) {
				return new Point2D(INVALID_POSITION_SENTINEL, INVALID_POSITION_SENTINEL);
			}
			return pos;
		});
	}
	get eventMarkerSize(): Signal<Size2D> {
		return this.layout.axis.overviewEventMarkerSize;
	}
	getOverviewPeriodBounds(index: number): Signal<Rect2D> {
		return this.layout.events.getOverviewPeriodBounds(index);
	}

	// Styling
	lineStyle = input<LineStyle>(DEFAULT_OVERVIEW_LINE_STYLE);
	background = input<string>(DEFAULT_OVERVIEW_BACKGROUND);
	displayedBackground = input<string>(DEFAULT_OVERVIEW_DISPLAYED_BACKGROUND);
	displayedLineStyle = input<LineStyle>(DEFAULT_OVERVIEW_DISPLAYED_LINE_STYLE);
	periodColor = input<string>(DEFAULT_PERIOD_COLOR);

	get startIconOpacity(): number {
		if (this.layout.axis.displayBounds().contains(this.layout.axis.startPosition())) {
			return DISPLAYED_ICON_OPACITY;
		}
		return NON_DISPLAYED_ICON_OPACITY;
	}
	get endIconOpacity(): number {
		if (this.layout.axis.displayBounds().contains(this.layout.axis.endPosition())) {
			return DISPLAYED_ICON_OPACITY;
		}
		return NON_DISPLAYED_ICON_OPACITY;
	}

	getEventIconOpacity(index: number): number {
		const pos = this.layout.events.getEventPositionInDisplay(index);
		if (pos !== undefined) {
			return DISPLAYED_ICON_OPACITY;
		}
		return NON_DISPLAYED_ICON_OPACITY;
	}
}	
