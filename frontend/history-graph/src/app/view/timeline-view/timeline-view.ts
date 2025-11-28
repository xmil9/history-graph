import { AfterViewInit, Component, computed, effect, ElementRef, HostListener, inject, input, Signal, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TimelineService } from '../../services/timeline.service';
import { Timeline } from '../../model/timeline';
import { Point2D, Size2D } from '../../graphics/gfx-coord-2d';
import { HDateFormat, MDYYYYFormat } from '../../model/historic-date';
import { EventView } from '../event-view/event-view';
import { AxisView } from '../axis-view/axis-view';
import { EventOverlay } from '../event-overlay/event-overlay';
import { LayoutSelector } from '../layout-selector/layout-selector';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../graphics/gfx-style';
import { EventLayoutInput, EventLayoutService } from '../../services/event-layout.service';
import { AxisLayoutInput, AxisLayoutService } from '../../services/axis-layout.service';
import { OverviewView } from '../overview-view/overview-view';
import { EventMapping } from '../event-mapping/event-mapping';
import { HeaderView } from '../header-view/header-view';

const DEFAULT_TL_TEXT_STYLE: TextStyle = {
	...DEFAULT_TEXT_STYLE,
	size: 18,
	weight: 600,
	rotation: 90,
};

@Component({
	selector: 'timeline',
	imports: [
		OverviewView,
		AxisView,
		EventView,
		EventOverlay,
		LayoutSelector,
		EventMapping,
		HeaderView,
	],
	templateUrl: './timeline-view.html',
	styleUrl: './timeline-view.css'
})
export class TimelineView implements AfterViewInit {
	private timelineService = inject(TimelineService);
	private eventLayoutService = inject(EventLayoutService);
	private axisLayoutService = inject(AxisLayoutService);

	@ViewChild('container', { read: ElementRef }) containerRef!: ElementRef<HTMLDivElement>;

	// Content
	dateFormat: Signal<HDateFormat> = signal(new MDYYYYFormat('-'));
	timeline: Signal<Timeline | undefined>;

	startLabel = computed(() => {
		const timeline = this.timeline();
		return timeline ? this.dateFormat().format(timeline.from) : '';
	});
	endLabel = computed(() => {
		const timeline = this.timeline();
		return timeline ? this.dateFormat().format(timeline.to) : '';
	});

	// Positioning
	viewSize = signal(new Size2D(0));
	get axisStartPos(): Signal<Point2D> {
		return this.axisLayoutService.startPos;
	}
	get axisEndPos(): Signal<Point2D> {
		return this.axisLayoutService.endPos;
	}

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TL_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);

	// Interactions
	private panning = false;
	private panDeltaStartPos = signal(new Point2D(0, 0));
	private panStartPos = signal(new Point2D(0, 0));

	constructor() {
		this.timeline = this.timelineService.timelineAsSignal();

		effect(() => {
			this.axisLayoutService.calculateLayout({
				viewSize: this.viewSize(),
				textStyle: this.textStyle(),
			} satisfies AxisLayoutInput);
		});

		effect(() => {
			this.eventLayoutService.calculateLayout({
				viewSize: this.viewSize(),
				textStyle: this.textStyle(),
				lineStyle: this.lineStyle(),
				dateFormat: this.dateFormat(),
			} satisfies EventLayoutInput);
		});
	}

	ngAfterViewInit(): void {
		this.updateViewSize();
	}

	private updateViewSize(): void {
		if (this.containerRef?.nativeElement) {
			const rect = this.containerRef.nativeElement.getBoundingClientRect();
			this.viewSize.set(new Size2D(rect.width, rect.height));
		}
	}

	@HostListener('window:resize')
	onResize(): void {
		this.updateViewSize();
	}

	@HostListener('mousedown', ['$event'])
	onMouseDown(event: MouseEvent): void {
		this.panning = true;
		this.panStartPos.set(new Point2D(event.offsetX, event.offsetY));
		this.panDeltaStartPos.set(this.panStartPos());
	}

	@HostListener('mousemove', ['$event'])
	onMouseMove(event: MouseEvent): void {
		if (this.panning) {
			const delta = new Point2D(event.offsetX - this.panDeltaStartPos().x, 0);
			this.pan(this.panStartPos(), delta);
			this.panDeltaStartPos.set(new Point2D(event.offsetX, event.offsetY));
		}
	}

	@HostListener('mouseup', ['$event'])
	onMouseUp(event: MouseEvent): void {
		this.panning = false;
	}

	@HostListener('wheel', ['$event'])
	onWheel(event: WheelEvent): void {
		event.preventDefault();
		const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
		this.zoom(new Point2D(event.offsetX, event.offsetY), zoomFactor);
	}

	private pan(start: Point2D, delta: Point2D): void {
		this.axisLayoutService.pan(start, delta);
	}

	private zoom(at: Point2D, factor: number): void {
		this.axisLayoutService.zoom(at, factor);
	}
}
