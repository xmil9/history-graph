import { inject, Injectable, signal } from "@angular/core";
import { LayoutFormat } from "./preference-types";
import { INVALID_POSITION_SENTINEL, Point2D, Viewport2D } from "../graphics/gfx-coord-2d";
import { DEFAULT_LAYOUT_INPUT, HgLayout, LayoutInput } from "./layout-types";
import { TimelineService } from "./timeline.service";
import { AxisLayoutCalculator, createAxisLayoutCalculator } from "./axis-layout-calculator";
import { Tick, TickCalculator, TickFormat } from "./tick-calculator";
import { LabelLayoutCalculator, createLabelLayoutCalculator } from "./label-layout-calculator";
import { GraphLayoutCalculator, createGraphLayoutCalculator } from "./graph-layout-calculator";
import { EventGraphic } from "./graphic-types";
import { DateProjection } from "../model/projection";

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

		// Recreate the calculators for the new layout format.
		this.graphCalculator = createGraphLayoutCalculator(this.layoutFormat());
		this.axisCalculator = createAxisLayoutCalculator(this.layoutFormat());
		this.labelCalculator = createLabelLayoutCalculator(this.layoutFormat());

		if (this.input.viewSize.isEmpty()) {
			return;
		}

		// Update the layout.
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

		this.labelCalculator.setInput(this.input);
		this.labelCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);

		// Not recalculating the tick interval avoids jumpy ticks.
		const recalcInterval = false;
		this.calculateTicks(recalcInterval);
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

		this.labelCalculator.setInput(this.input);
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

		// If the view size has changed, we need to update more parts of the layout.
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

		this.labelCalculator.setInput(this.input);
		this.labelCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);
	}

	pan(start: Point2D, delta: Point2D): void {
		// Check if the start point is within the axis or overview.
		const isInAxis = this.layout.timelines.bounds.contains(start);
		const isInOverview = this.layout.overview.axisBounds.contains(start);
		if (!isInAxis && !isInOverview) {
			return;
		}

		// Faster panning in the overview.
		if (isInOverview) {
			const acceleration = -10;
			delta = new Point2D(acceleration * delta.x, acceleration * delta.y);
		}

		// Calculate the panned viewport.
		const pannedViewport = this.layout.timelines.viewport.translate(delta);

		// Update the layout.
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

		// Not recalculating the tick interval avoids jumpy ticks.
		this.calculateTicks(false);
	}

	panTo(tlEvent: EventGraphic): void {
		if (this.layout.timelines.items.length === 0)
			return;

		// Calculate the viewport to center the event.
		const tlProjection = new DateProjection(
			this.layout.timelines.viewport,
			this.layout.timelines.bounds,
			this.timelineService.combinedTimeline().timeline.period
		);

		const projected = tlProjection.toPosition(tlEvent.hEvent.when);
		if (projected.x === INVALID_POSITION_SENTINEL)
			return;

		const dx = tlProjection.display.center.x - projected.x;

		const pannedViewport = new Viewport2D(
			new Point2D(tlProjection.viewport.offset.x + dx, tlProjection.viewport.offset.y),
			tlProjection.viewport.scale
		);

		// Update the layout.
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
		// Check if the at point is within the axis or overview.
		const isInAxis = this.layout.timelines.bounds.contains(at);
		const isInOverview = this.layout.overview.axisBounds.contains(at);
		if (!isInAxis && !isInOverview) {
			return;
		}

		// Calculate the zoomed viewport.
		const zoomedViewport = this.layout.timelines.viewport.zoomAt(
			new Point2D(at.x - this.layout.timelines.bounds.left, at.y - this.layout.timelines.bounds.top),
			factor
		);

		// Update the layout.
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
