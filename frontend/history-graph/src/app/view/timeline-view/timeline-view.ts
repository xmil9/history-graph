import { AfterViewInit, Component, computed, effect, ElementRef, HostListener, inject, input, Signal, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TimelineService } from '../../services/timeline.service';
import { Timeline } from '../../model/timeline';
import { Point2D, Size2D } from '../../graphics/gfx-coord-2d';
import { HDateFormat, MDYYYYFormat } from '../../model/historic-date';
import { TimelineEventView } from '../timeline-event-view/timeline-event-view';
import { TimelineAxisView } from '../timeline-axis-view/timeline-axis-view';
import { TimelineEventOverlayView } from '../timeline-event-overlay-view/timeline-event-overlay-view';
import { TimelineLabelLayoutSelector } from '../timeline-label-layout-selector/timeline-label-layout-selector';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../graphics/gfx-style';
import { EventLayoutFactors, EventLayoutService } from '../../services/event-layout.service';

const DEFAULT_TL_TEXT_STYLE: TextStyle = {
	...DEFAULT_TEXT_STYLE,
	size: 18,
	weight: 600,
	rotation: 90,
};

@Component({
	selector: 'timeline',
	imports: [TimelineEventView, TimelineAxisView, TimelineEventOverlayView, TimelineLabelLayoutSelector],
	templateUrl: './timeline-view.html',
	styleUrl: './timeline-view.css'
})
export class TimelineView implements AfterViewInit {
	private layoutService = inject(EventLayoutService);
	
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
	private readonly axisHOffset = 50;
	private readonly axisTopOffset = 100;
	axisStartPos = signal(new Point2D(this.axisHOffset, this.axisTopOffset));
	axisEndPos = signal(new Point2D(this.viewSize().width - this.axisHOffset, this.axisStartPos().y));
	eventMarkerSize = signal(new Size2D(8));

	getEventPosition(idx: number): Point2D {
		return this.layoutService.tlEventPos()[idx];
	}

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TL_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);

	// Interactions
	private panning = false;
	private panStartPos = signal(new Point2D(0, 0));

	constructor(private timelineService: TimelineService) {
		this.timeline = toSignal(this.timelineService.timeline$, {
			initialValue: this.timelineService.timeline
		});

		effect(() => {
			this.layoutService.calculateLayout({
					viewSize: this.viewSize(),
					axisStartPos: this.axisStartPos(),
					axisEndPos: this.axisEndPos(),
					markerSize: this.eventMarkerSize(),
					textStyle: this.textStyle(),
					lineStyle: this.lineStyle(),
				} satisfies EventLayoutFactors,
				this.timeline()
			);
			this.layoutService.calculateConnectorPathsDeferred();
		});
	}

	ngAfterViewInit(): void {
		console.log('ngAfterViewInit TimelineView');
		this.updateViewSize();
		this.layoutService.calculateConnectorPathsDeferred();
	}

	private updateViewSize(): void {
		if (this.containerRef?.nativeElement) {
			const rect = this.containerRef.nativeElement.getBoundingClientRect();
			this.viewSize.set(new Size2D(rect.width, rect.height));
			this.axisEndPos.set(new Point2D(this.viewSize().width - this.axisHOffset, this.axisStartPos().y));
		}
	}

	@HostListener('window:resize')
	onResize(): void {
		this.updateViewSize();
	}

	@HostListener('mousedown', ['$event'])
	onMouseDown(event: MouseEvent): void {
		this.panning = true;
		this.panStartPos.set(new Point2D(event.clientX, event.clientY));
	}

	@HostListener('mousemove', ['$event'])
	onMouseMove(event: MouseEvent): void {
		if (this.panning) {
			const delta = new Point2D(event.clientX - this.panStartPos().x, 0);
			this.pan(delta);
			this.panStartPos.set(new Point2D(event.clientX, event.clientY));
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
		this.zoom(new Point2D(event.clientX, event.clientY), zoomFactor);
	}

	private pan(delta: Point2D): void {
		this.axisStartPos.update(pos =>
			new Point2D(pos.x + delta.x, pos.y + delta.y)
		);
		this.axisEndPos.update(pos =>
			new Point2D(pos.x + delta.x, pos.y + delta.y)
		);
	}

	private zoom(at: Point2D, factor: number): void {
		let centerX = at.x;
		if (centerX < this.axisStartPos().x) {
			centerX = this.axisStartPos().x;
		} else if (centerX > this.axisEndPos().x) {
			centerX = this.axisEndPos().x;
		}
		const startDelta = (this.axisStartPos().x - centerX) * factor;
		const endDelta = (this.axisEndPos().x - centerX) * factor;

		this.axisStartPos.update(pos =>
			new Point2D(centerX + startDelta, pos.y)
		);
		this.axisEndPos.update(pos =>
			new Point2D(centerX + endDelta, pos.y)
		);
	}
}
