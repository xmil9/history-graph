import { AfterViewInit, Component, computed, effect, ElementRef, HostListener, inject, input, signal, Signal, ViewChild } from '@angular/core';
import { TimelineService } from '../../services/timeline.service';
import { Point2D, Size2D } from '../../graphics/gfx-coord-2d';
import { PromptView } from '../prompt-view/prompt-view';
import { EventOverlay } from '../event-overlay/event-overlay';
import { PreferenceView } from '../preference-view/preference-view';
import { DEFAULT_LINE_STYLE, DEFAULT_TEXT_STYLE, LineStyle, TextStyle } from '../../graphics/gfx-style';
import { LayoutService } from '../../services/layout.service';
import { OverviewView } from '../overview-view/overview-view';
import { EventMapping } from '../event-mapping/event-mapping';
import { HeaderView } from '../header-view/header-view';
import { PreferenceService } from '../../services/preference.service';
import { HDateFormat } from '../../model/historic-date';
import { AxisLayoutInput } from '../../services/axis-layout.service';
import { EventLayoutInput } from '../../services/event-layout.service';
import { TimelineGraphic } from '../../services/timeline-types';
import { TimelineView } from '../timeline-view/timeline-view';

const DEFAULT_TL_TEXT_STYLE: TextStyle = {
	...DEFAULT_TEXT_STYLE,
	size: 18,
	weight: 600,
	rotation: 90,
};

@Component({
	selector: 'history-graph',
	imports: [
		OverviewView,
		TimelineView,
		EventOverlay,
		EventMapping,
		HeaderView,
		PreferenceView,
		PromptView
	],
	templateUrl: './history-graph.html',
	styleUrl: './history-graph.css'
})
export class HistoryGraph implements AfterViewInit {
	private timelineService = inject(TimelineService);
	private layout = inject(LayoutService);
	private preferenceService = inject(PreferenceService);

	@ViewChild('timelineArea', { read: ElementRef }) timelineAreaRef!: ElementRef<HTMLDivElement>;

	// Content
	dateFormat = computed<HDateFormat>(() => {
		const labeledFormat = this.preferenceService.dateFormat();
		return labeledFormat.format;
	});
	timelines: Signal<TimelineGraphic[]>;

	startLabel = computed(() => {
		const timeline = this.timelines()[0];
		return timeline ? this.dateFormat().format(timeline.from) : '';
	});
	endLabel = computed(() => {
		const timeline = this.timelines()[0];
		return timeline ? this.dateFormat().format(timeline.to) : '';
	});

	// Positioning
	viewSize = signal(new Size2D(0));

	isLoading = this.timelineService.isLoading;

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TL_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);

	// Interactions
	private panning = false;
	private panDeltaStartPos = signal(new Point2D(0, 0));
	private panStartPos = signal(new Point2D(0, 0));

	constructor() {
		try {
			this.timelines = this.timelineService.timelinesAsSignal();

			// Trigger layout reset when timeline changes.
			this.timelineService.timelines$.subscribe(() => {
				this.layout.resetLayout(true);
			});

			effect(() => {
				// Trigger axis layout update when any of the below inputs changes.
				try {
					this.layout.axis.updateLayout({
						viewSize: this.viewSize(),
						textStyle: this.textStyle(),
						dateFormat: this.dateFormat(),
					} satisfies AxisLayoutInput);
				} catch (e) {
					console.error('Error in axis layout effect:', e);
				}
			});

			effect(() => {
				// Trigger event layout update when any of the below inputs changes.
				try {
					this.layout.events.updateLayout({
						viewSize: this.viewSize(),
						textStyle: this.textStyle(),
						lineStyle: this.lineStyle(),
						dateFormat: this.dateFormat(),
					} satisfies EventLayoutInput);
				} catch (e) {
					console.error('Error in event layout effect:', e);
				}
			});
			
		} catch (e) {
			console.error('Error in HistoryGraph constructor:', e);
			throw e;
		}
	}

	ngAfterViewInit(): void {
		this.updateViewSize();
	}

	private updateViewSize(): void {
		if (this.timelineAreaRef?.nativeElement) {
			const rect = this.timelineAreaRef.nativeElement.getBoundingClientRect();
			this.viewSize.set(new Size2D(rect.width, rect.height));
		}
	}

	onPromptEntered(prompt: string): void {
		this.timelineService.generateTimeline(prompt);
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
		this.layout.pan(start, delta);
	}

	private zoom(at: Point2D, factor: number): void {
		this.layout.zoom(at, factor);
	}
}
