import { Component, computed, inject, input, signal, Signal } from '@angular/core';
import { SvgIcon, SvgIconOrigin } from '../svg-icon/svg-icon';
import { Point2D, Rect2D, Size2D } from '../../graphics/gfx-coord-2d';
import { AxisLayoutService } from '../../services/axis-layout.service';
import { LineStyle } from '../../graphics/gfx-style';
import { EventLayoutService } from '../../services/event-layout.service';

export const DEFAULT_OVERVIEW_LINE_STYLE: LineStyle = {
	color: '#333333',
	width: 1
};
export const DEFAULT_OVERVIEW_BACKGROUND = '#f8f8f8';

@Component({
  selector: '[tl-overview]',
  imports: [SvgIcon],
  templateUrl: './timeline-overview-view.html',
  styleUrl: './timeline-overview-view.css'
})
export class TimelineOverviewView {
	private axisLayoutService = inject(AxisLayoutService);
	private eventLayoutService = inject(EventLayoutService);
	
	// Expose types for template
	SvgIconOrigin = SvgIconOrigin;

	// Positioning
	get displayBounds(): Signal<Rect2D> {
		return this.axisLayoutService.overviewBounds;
	}
	get axisBounds(): Signal<Rect2D> {
		return this.axisLayoutService.overviewAxisBounds;
	}
	get displayedBounds(): Signal<Rect2D> {
		return this.axisLayoutService.overviewDisplayedBounds;
	}
	get startPos(): Signal<Point2D> {
		return computed(() => new Point2D(this.axisBounds().left, this.axisBounds().center.y));
	}
	get endPos(): Signal<Point2D> {
		return computed(() => new Point2D(this.axisBounds().right, this.axisBounds().center.y));
	}
	get markerSize(): Signal<Size2D> {
		return this.axisLayoutService.overviewMarkerSize;
	}
	get overviewEventPositions(): Signal<Point2D[]> {
		return this.eventLayoutService.overviewEventPositions;
	}
	get eventMarkerSize(): Signal<Size2D> {
		return this.axisLayoutService.overviewEventMarkerSize;
	}

	// Styling
	lineStyle = input<LineStyle>(DEFAULT_OVERVIEW_LINE_STYLE);
	background = input<string>(DEFAULT_OVERVIEW_BACKGROUND);
}	
