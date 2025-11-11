import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineLayoutSelector } from './timeline-layout-selector';

describe('TimelineLayoutSelector', () => {
  let component: TimelineLayoutSelector;
  let fixture: ComponentFixture<TimelineLayoutSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineLayoutSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineLayoutSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

