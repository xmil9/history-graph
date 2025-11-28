import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineEventOverlayView } from './event-overlay';

describe('TimelineEventOverlayView', () => {
	let component: TimelineEventOverlayView;
	let fixture: ComponentFixture<TimelineEventOverlayView>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TimelineEventOverlayView]
		})
			.compileComponents();

		fixture = TestBed.createComponent(TimelineEventOverlayView);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

