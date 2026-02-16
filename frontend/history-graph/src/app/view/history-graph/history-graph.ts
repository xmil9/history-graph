import { AfterViewInit, Component, computed, effect, ElementRef, HostListener, inject, input, signal, ViewChild } from '@angular/core';
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
import { TimelineView } from '../timeline-view/timeline-view';
import { EventLabels } from '../event-labels/event-labels';

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
		EventLabels,
		EventMapping,
		EventOverlay,
		HeaderView,
		PreferenceView,
		PromptView
	],
	templateUrl: './history-graph.html',
	styleUrl: './history-graph.css'
})
export class HistoryGraph implements AfterViewInit {
	private timelineService = inject(TimelineService);
	private layoutService = inject(LayoutService);
	private preferenceService = inject(PreferenceService);

	@ViewChild('historyGraphArea', { read: ElementRef }) historyGraphAreaElem!: ElementRef<HTMLDivElement>;

	// Content
	dateFormat = computed<HDateFormat>(() => {
		const labeledFormat = this.preferenceService.dateFormat();
		return labeledFormat.format;
	});
	timelines = this.timelineService.timelines;

	startLabel = computed(() => {
		const tlGraphic = this.timelineService.combinedTimeline();
		return tlGraphic ? this.dateFormat().format(tlGraphic.timeline.from) : '';
	});
	endLabel = computed(() => {
		const tlGraphic = this.timelineService.combinedTimeline();
		return tlGraphic ? this.dateFormat().format(tlGraphic.timeline.to) : '';
	});

	// Positioning
	viewSize = signal(new Size2D(0));

	// Styling
	textStyle = input<TextStyle>(DEFAULT_TL_TEXT_STYLE);
	lineStyle = input<LineStyle>(DEFAULT_LINE_STYLE);
	
	// Interactions
	isLoading = this.timelineService.isLoading;
	private panning = false;
	private panDeltaStartPos = signal(new Point2D(0, 0));
	private panStartPos = signal(new Point2D(0, 0));

	constructor() {
		try {
			// Trigger layout reset when the timeline set changes.
			effect(() => {
				this.timelines(); // The trigger signal
				this.layoutService.resetLayout(true);
			});

			// Trigger a layout update when any of the inputs change.
			effect(() => {
				try {
					this.layoutService.updateLayout({
						viewSize: this.viewSize(),
						textStyle: this.textStyle(),
						lineStyle: this.lineStyle(),
						dateFormat: this.dateFormat(),
					});
				} catch (e) {
					console.error('Error in layout update effect:', e);
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
		if (this.historyGraphAreaElem?.nativeElement) {
			const rect = this.historyGraphAreaElem.nativeElement.getBoundingClientRect();
			console.log('viewSize', rect);
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
		this.layoutService.pan(start, delta);
	}

	private zoom(at: Point2D, factor: number): void {
		this.layoutService.zoom(at, factor);
	}
}
