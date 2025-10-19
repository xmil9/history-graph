import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineAxisView } from './timeline-axis-view';

describe('TimelineAxisView', () => {
  let component: TimelineAxisView;
  let fixture: ComponentFixture<TimelineAxisView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineAxisView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineAxisView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
