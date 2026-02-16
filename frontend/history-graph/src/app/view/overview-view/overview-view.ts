import { Component, inject, input } from '@angular/core';
import { SvgIcon, SvgIconOrigin } from '../svg-icon/svg-icon';
import { Point2D, Rect2D, Size2D } from '../../graphics/gfx-coord-2d';
import { LineStyle } from '../../graphics/gfx-style';
import { LayoutService } from '../../services/layout.service';
import { EventPosition } from '../../services/layout-types';

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
	private layoutService = inject(LayoutService);

	// Expose types for template
	SvgIconOrigin = SvgIconOrigin;

	// Content
	get combinedEventPositions(): EventPosition[] {
		return this.layoutService.layout.overview.combinedEventPositions;
	}

	// Positioning
	get overviewBounds(): Rect2D {
		return this.layoutService.layout.overview.bounds;
	}
	get axisBounds(): Rect2D {
		return this.layoutService.layout.overview.axisBounds;
	}
	get viewedBounds(): Rect2D {
		return this.layoutService.layout.overview.viewedBounds;
	}
	get startPosition(): Point2D {
		return new Point2D(this.axisBounds.left, this.axisBounds.center.y);
	}
	get endPosition(): Point2D {
		return new Point2D(this.axisBounds.right, this.axisBounds.center.y);
	}
	get markerSize(): Size2D {
		return this.layoutService.layout.overview.endMarkerSize;
	}
	getOverviewEventPosition(index: number): Point2D {
		return this.layoutService.layout.overview.combinedEventPositions[index].start;
	}
	getOverviewEventEndPosition(index: number): Point2D {
		const pos = this.layoutService.layout.overview.combinedEventPositions[index].end;
		return pos ? pos : Point2D.invalid();
	}
	getOverviewPeriodBounds(index: number): Rect2D {
		const bounds = this.layoutService.layout.overview.combinedEventPositions[index].periodBounds;
		return bounds ? bounds : Rect2D.empty();
	}
	get eventMarkerSize(): Size2D {
		return this.layoutService.layout.overview.eventMarkerSize;
	}

	// Styling
	lineStyle = input<LineStyle>(DEFAULT_OVERVIEW_LINE_STYLE);
	background = input<string>(DEFAULT_OVERVIEW_BACKGROUND);
	displayedBackground = input<string>(DEFAULT_OVERVIEW_DISPLAYED_BACKGROUND);
	displayedLineStyle = input<LineStyle>(DEFAULT_OVERVIEW_DISPLAYED_LINE_STYLE);
	getPeriodColor(index: number): string {
		return this.layoutService.layout.overview.combinedEventPositions[index].event.theme.primaryColor;
	}
	getMarkerColor(index: number): string {
		return this.layoutService.layout.overview.combinedEventPositions[index].event.theme.primaryColor;
	}

	get startIconOpacity(): number {
		return DISPLAYED_ICON_OPACITY;
	}
	get endIconOpacity(): number {
		return DISPLAYED_ICON_OPACITY;
	}
	get eventIconOpacity(): number {
		return DISPLAYED_ICON_OPACITY;
	}
}	
