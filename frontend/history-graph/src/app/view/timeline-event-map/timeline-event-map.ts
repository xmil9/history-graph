import { Component, computed, inject, input, Signal } from '@angular/core';
import { EventLayoutService, EventPosition } from '../../services/event-layout.service';
import { LineStyle } from '../../graphics/gfx-style';
import { Point2D } from '../../graphics/gfx-coord-2d';
import { AxisLayoutService } from '../../services/axis-layout.service';
import { TimelineService } from '../../services/timeline.service';
import { toSignal } from '@angular/core/rxjs-interop';

export const DEFAULT_EVENT_MAP_LINE_STYLE: LineStyle = {
	color: '#333333',
	width: 1
};

@Component({
  selector: '[tl-event-map]',
  imports: [],
  templateUrl: './timeline-event-map.html',
  styleUrl: './timeline-event-map.css'
})
export class TimelineEventMap {
	private timelineService = inject(TimelineService);
	private eventLayoutService = inject(EventLayoutService);
	private axisLayoutService = inject(AxisLayoutService);

	timeline = toSignal(this.timelineService.timeline$, {
		initialValue: this.timelineService.timeline
	});

	// Positioning
	getOverviewEventPositions(index: number): EventPosition {
		return this.eventLayoutService.overviewEventPositions()[index];
	}
	getEventPositionsInView(index: number): Point2D | undefined {
		return this.eventLayoutService.getEventPositionInDisplay(index);
	}
	getEventEndPositionsInView(index: number): Point2D | undefined {
		return this.eventLayoutService.getEventEndPositionInDisplay(index);
	}
	get overviewStartPos(): Signal<Point2D> {
		return computed(() => new Point2D(
			this.axisLayoutService.overviewAxisBounds().left,
			this.axisLayoutService.overviewAxisBounds().center.y)
		);
	}
	get overviewEndPos(): Signal<Point2D>	 {
		return computed(() => new Point2D(
			this.axisLayoutService.overviewAxisBounds().right,
			this.axisLayoutService.overviewAxisBounds().center.y)
		);
	}
	get axisStartPos(): Signal<Point2D | undefined> {
		return computed(() => {
			const pos = this.axisLayoutService.startPos();
			if (this.axisLayoutService.displayBounds().contains(pos)) {
				return pos;
			}
			return undefined;
		});
	}
	get axisEndPos(): Signal<Point2D | undefined> {
		return computed(() => {
			const pos = this.axisLayoutService.endPos();
			if (this.axisLayoutService.displayBounds().contains(pos)) {
				return pos;
			}
			return undefined;
		});
	}

	// Styling
	lineStyle = input<LineStyle>(DEFAULT_EVENT_MAP_LINE_STYLE);
	opacity = input<number>(0.4);
}
