import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineHeader } from './header-view';

describe('TimelineHeader', () => {
	let component: TimelineHeader;
	let fixture: ComponentFixture<TimelineHeader>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TimelineHeader]
		})
			.compileComponents();

		fixture = TestBed.createComponent(TimelineHeader);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

