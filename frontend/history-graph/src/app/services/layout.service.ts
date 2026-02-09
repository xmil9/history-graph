import { inject, Injectable, signal } from "@angular/core";
import { LayoutFormat } from "./preference-types";
import { Point2D } from "../graphics/gfx-coord-2d";
import { DEFAULT_LAYOUT_INPUT, DEFAULT_VIEWPORT, HgLayout, LayoutInput, TimelineViewport } from "./layout-types";
import { TimelineService } from "./timeline.service";
import { AxisLayoutCalculator, createAxisLayoutCalculator } from "./axis-layout-calculator";
import { calculateTicks, Tick } from "./tick-calculator";
import { LabelLayoutCalculator, createLabelLayoutCalculator } from "./label-layout-calculator";

@Injectable({
	providedIn: 'root'
})
export class LayoutService {
	private timelineService = inject(TimelineService);
	layoutFormat = signal<LayoutFormat>(LayoutFormat.HorizontalCenter);
	private axisCalculator: AxisLayoutCalculator = createAxisLayoutCalculator(this.layoutFormat());
	private labelCalculator: LabelLayoutCalculator = createLabelLayoutCalculator(this.layoutFormat());
	layout = new HgLayout();
	private input = DEFAULT_LAYOUT_INPUT;

	private ticks_: Tick[] = [];
	get ticks(): Tick[] {
		return this.ticks_;
	}

	setLayoutFormat(format: LayoutFormat): void {
		const keepViewport = this.layout.timelines.viewport;

		this.layoutFormat.set(format);
		this.axisCalculator = createAxisLayoutCalculator(this.layoutFormat());
		this.labelCalculator = createLabelLayoutCalculator(this.layoutFormat());

		this.calculateLayout(keepViewport);
	}

	resetLayout(resetTicks: boolean = false): void {
		if (resetTicks) {
			this.calculateTicks();
		}
		this.calculateLayout(DEFAULT_VIEWPORT);
	}

	updateLayout(input: LayoutInput): void {
		this.input = input;
		this.calculateLayout(this.layout.timelines.viewport);
	}

	pan(start: Point2D, delta: Point2D): void {
		this.axisCalculator.pan(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			start,
			delta,
			this.ticks_,
			this.layout
		);
	}

	zoom(at: Point2D, factor: number): void {
		this.axisCalculator.zoom(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			at,
			factor,
			this.ticks_,
			this.layout
		);
	}

	private calculateLayout(targetViewport: TimelineViewport): void {
		this.axisCalculator.setInput(this.input);
		this.axisCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			targetViewport,
			this.ticks_,
			this.layout
		);

		this.labelCalculator.setInput(this.input);
		this.labelCalculator.calculate(
			this.timelineService.timelines(),
			this.timelineService.combinedTimeline(),
			this.layout
		);
	}

	private calculateTicks(): void {
		this.ticks_ = calculateTicks(
			this.timelineService.combinedTimeline().timeline.period,
			this.input.dateFormat
		);
	}
}
