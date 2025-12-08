import { Component, computed, inject, input, Signal } from '@angular/core';
import { EventPosition } from '../../services/event-layout.service';
import { LineStyle } from '../../graphics/gfx-style';
import { Point2D } from '../../graphics/gfx-coord-2d';
import { TimelineService } from '../../services/timeline.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { LayoutService } from '../../services/layout.service';

export const DEFAULT_EVENT_MAP_LINE_STYLE: LineStyle = {
	color: '#333333',
	width: 1
};

@Component({
	selector: '[event-mapping]',
	imports: [],
	templateUrl: './event-mapping.html',
	styleUrl: './event-mapping.css'
})
export class EventMapping {
	private timelineService = inject(TimelineService);
	private layout = inject(LayoutService);

	timeline = toSignal(this.timelineService.timeline$, {
		initialValue: this.timelineService.timeline
	});

	// Positioning
	getOverviewEventPositions(index: number): EventPosition {
		return this.layout.events.overviewEventPositions()[index];
	}
	getEventPositionsInView(index: number): Point2D | undefined {
		return this.layout.events.getEventPositionInDisplay(index);
	}
	getEventEndPositionsInView(index: number): Point2D | undefined {
		return this.layout.events.getEventEndPositionInDisplay(index);
	}
	get overviewStartPos(): Signal<Point2D> {
		return computed(() => new Point2D(
			this.layout.axis.overviewAxisBounds().left,
			this.layout.axis.overviewAxisBounds().center.y)
		);
	}
	get overviewEndPos(): Signal<Point2D> {
		return computed(() => new Point2D(
			this.layout.axis.overviewAxisBounds().right,
			this.layout.axis.overviewAxisBounds().center.y)
		);
	}
	get axisStartPos(): Signal<Point2D | undefined> {
		return computed(() => {
			const pos = this.layout.axis.startPos();
			if (this.layout.axis.displayBounds().contains(pos)) {
				return pos;
			}
			return undefined;
		});
	}
	get axisEndPos(): Signal<Point2D | undefined> {
		return computed(() => {
			const pos = this.layout.axis.endPos();
			if (this.layout.axis.displayBounds().contains(pos)) {
				return pos;
			}
			return undefined;
		});
	}

	// Styling
	lineStyle = input<LineStyle>(DEFAULT_EVENT_MAP_LINE_STYLE);
	opacity = input<number>(0.4);
}
