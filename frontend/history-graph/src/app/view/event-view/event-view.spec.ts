import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineEventView } from './event-view';

describe('TimelineEventView', () => {
  let component: TimelineEventView;
  let fixture: ComponentFixture<TimelineEventView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineEventView]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TimelineEventView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
