import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineView } from './timeline-view';

describe('Timeline', () => {
  let component: TimelineView;
  let fixture: ComponentFixture<TimelineView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
