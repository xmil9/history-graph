import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineLabelLayoutSelector } from './timeline-label-layout-selector';

describe('TimelineLabelLayoutSelector', () => {
  let component: TimelineLabelLayoutSelector;
  let fixture: ComponentFixture<TimelineLabelLayoutSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineLabelLayoutSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineLabelLayoutSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

