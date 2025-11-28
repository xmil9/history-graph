import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineEventMap } from './event-mapping';

describe('TimelineEventMap', () => {
  let component: TimelineEventMap;
  let fixture: ComponentFixture<TimelineEventMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineEventMap]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TimelineEventMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
