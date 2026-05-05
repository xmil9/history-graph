import { inject, Injectable, signal, WritableSignal, Signal } from "@angular/core";
import { LayoutFormat } from "./preference-types";
import { INVALID_POSITION_SENTINEL, Point2D, Viewport2D } from "../graphics/gfx-coord-2d";
import { DEFAULT_LAYOUT_INPUT, HgLayout, LayoutInput } from "./layout-types";
import { TimelineService } from "./timeline.service";
import { AxisLayoutCalculator, createAxisLayoutCalculator } from "./axis-layout-calculator";
import { Tick, TickCalculator, TickFormat } from "./tick-calculator";
import { LabelLayoutCalculator, createLabelLayoutCalculator } from "./label-layout-calculator";
import { HDate } from "../model/historic-date";
import { GraphLayoutCalculator, createGraphLayoutCalculator } from "./graph-layout-calculator";
import { EventGraphic } from "./graphic-types";

@Injectable({
	providedIn: 'root'
})
export class LayoutService {
	private timelineService = inject(TimelineService);
	private input = DEFAULT_LAYOUT_INPUT;
	layoutFormat = signal<LayoutFormat>(LayoutFormat.HorizontalCenter);
	private graphCalculator: GraphLayoutCalculator = createGraphLayoutCalculator(this.layoutFormat());
	private axisCalculator: AxisLayoutCalculator = createAxisLayoutCalculator(this.layoutFormat());
	private labelCalculator: LabelLayoutCalculator = createLabelLayoutCalculator(this.layoutFormat());
	private tickCalculator = new TickCalculator(TickFormat.DynamicEpoch);
	layout = new HgLayout();

	private ticks_: Tick[] = [];
	get ticks(): Tick[] {
		return this.ticks_;
	}

	setLayoutFormat(format: LayoutFormat): void {
		this.layoutFormat.set(format);

		this.graphCalculator = createGraphLayoutCalculator(this.layoutFormat());
		this.axisCalculator = createAxisLayoutCalculator(this.layoutFormat());
		this.labelCalculator = createLabelLayoutCalculator(this.layoutFormat());

		if (this.input.viewSize.isEmpty()) {
			return;
		}

		this.graphCalculator.updateViewSize(
			this.input.viewSize,
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		this.axisCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		this.labelCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);
	}

	setTickFormat(format: TickFormat): void {
		this.tickCalculator = new TickCalculator(format);

		if (this.input.viewSize.isEmpty()) {
			return;
		}

		this.calculateTicks(true);
	}

	resetLayout(resetTicks: boolean = false): void {
		if (this.input.viewSize.isEmpty()) {
			return;
		}
		
		this.graphCalculator.updateViewport(
			Viewport2D.identity(),
			this.input.viewSize,
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		this.axisCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		this.labelCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		if (resetTicks) {
			this.calculateTicks(true);
		}
	}

	updateLayout(input: LayoutInput): void {
		if (input.viewSize.isEmpty()) {
			return;
		}

		const hasViewSizeChanged = !input.viewSize.equals(this.input.viewSize);
		this.input = input;

		if (hasViewSizeChanged) {
			this.graphCalculator.updateViewSize(
				this.input.viewSize,
				this.timelineService.timelines(),
				this.timelineService.combinedTimeline(),
				this.layout
			);
		}

		if (hasViewSizeChanged) {
			this.axisCalculator.calculate(
				this.timelineService.timelines(),
				this.timelineService.combinedTimeline(),
				this.layout
			);
		}

		this.labelCalculator.setInput(this.input);
		this.labelCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		if (hasViewSizeChanged) {
			this.calculateTicks(true);
		}
	}

	refreshLayout(): void {
		if (this.input.viewSize.isEmpty()) {
			return;
		}

		this.graphCalculator.updateViewSize(
			this.input.viewSize,
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		this.axisCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		this.labelCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);
	}

	pan(start: Point2D, delta: Point2D): void {
		const isInAxis = this.layout.timelines.bounds.contains(start);
		const isInOverview = this.layout.overview.axisBounds.contains(start);
		if (!isInAxis && !isInOverview) {
			return;
		}

		if (isInOverview) {
			const acceleration = -10;
			delta = new Point2D(acceleration * delta.x, acceleration * delta.y);
		}

		const sharedViewport = this.layout.timelines.items.length > 0 ?
			this.layout.timelines.items[0].projection.viewport : Viewport2D.identity();
		const pannedViewport = sharedViewport.translate(delta);

		this.graphCalculator.updateViewport(
			pannedViewport,
			this.input.viewSize,
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		this.axisCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		this.labelCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		// Not recalculating the tick interval avoids jumpy ticks when panning.
		this.calculateTicks(false);
	}

	panTo(tlEvent: EventGraphic): void {
		if (this.layout.timelines.items.length === 0)
			return;

		const sharedProj = this.layout.timelines.items[0].projection;

		const projected = sharedProj.toPosition(tlEvent.hEvent.when);
		if (projected.x === INVALID_POSITION_SENTINEL)
			return;

		const dx = sharedProj.display.center.x - projected.x;

		const pannedViewport = new Viewport2D(
			new Point2D(sharedProj.viewport.offset.x + dx, sharedProj.viewport.offset.y),
			sharedProj.viewport.scale
		);

		this.graphCalculator.updateViewport(
			pannedViewport,
			this.input.viewSize,
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		this.axisCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		this.labelCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		// Not recalculating the tick interval avoids jumpy ticks when panning.
		this.calculateTicks(false);
	}

	zoom(at: Point2D, factor: number): void {
		const isInAxis = this.layout.timelines.bounds.contains(at);
		const isInOverview = this.layout.overview.axisBounds.contains(at);
		if (!isInAxis && !isInOverview) {
			return;
		}

		const sharedViewport = this.layout.timelines.items.length > 0 ?
			this.layout.timelines.items[0].projection.viewport : Viewport2D.identity();
		const zoomedViewport = sharedViewport.zoomAt(
			new Point2D(at.x - this.layout.timelines.bounds.left, at.y - this.layout.timelines.bounds.top),
			factor
		);

		this.graphCalculator.updateViewport(
			zoomedViewport,
			this.input.viewSize,
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		this.axisCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		this.labelCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		this.calculateTicks(true);
	}

	private calculateTicks(recalcInterval: boolean): void {
		this.ticks_ = this.tickCalculator.calculateTicks(
			this.timelineService.combinedTimeline().timeline.period,
			this.input.dateFormat,
			this.layout,
			recalcInterval
		);

		this.axisCalculator.updateTickPositions(
			this.ticks_,
			this.layout
		);
	}
}
