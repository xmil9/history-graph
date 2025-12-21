import { inject, Injectable } from "@angular/core";
import { AxisLayoutService } from "./axis-layout.service";
import { EventLayoutService } from "./event-layout.service";
import { LayoutFormat } from "./preference-types";
import { EventLayoutInput } from "./event-layout.service";
import { AxisLayoutInput } from "./axis-layout.service";
import { Point2D } from "../graphics/gfx-coord-2d";

// External data that affects the layout of events.
export interface LayoutInput extends EventLayoutInput, AxisLayoutInput {
}

@Injectable({
	providedIn: 'root'
})
export class LayoutService {
	private axisLayout = inject(AxisLayoutService);
	private eventLayout = inject(EventLayoutService);

	get axis(): AxisLayoutService {
		return this.axisLayout;
	}

	get events(): EventLayoutService {
		return this.eventLayout;
	}

	setLayoutFormat(format: LayoutFormat): void {
		console.debug('Setting layout format');
		this.axisLayout.setLayoutFormat(format);
		this.eventLayout.setLabelLayoutFormat(format);
	}

	resetLayout(): void {
		console.debug('Resetting layout');
		this.axisLayout.resetLayout();
		this.eventLayout.resetLayout();
	}

	updateLayout(input: LayoutInput): void {
		console.debug('Updating layout');
		this.axisLayout.updateLayout(input);
		this.eventLayout.updateLayout(input);
	}

	pan(start: Point2D, delta: Point2D): void {
		this.axisLayout.pan(start, delta);
	}

	zoom(at: Point2D, factor: number): void {
		this.axisLayout.zoom(at, factor);
	}
}
