import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineOverviewView } from './timeline-overview-view';

describe('TimelineOverviewView', () => {
  let component: TimelineOverviewView;
  let fixture: ComponentFixture<TimelineOverviewView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineOverviewView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineOverviewView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
