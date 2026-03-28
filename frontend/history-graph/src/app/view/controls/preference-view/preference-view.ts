import { Component } from '@angular/core';
import { LayoutSelector } from '../layout-selector/layout-selector';
import { DateFormatSelector } from '../date-format-selector/date-format-selector';
import { TickFormatSelector } from '../tick-format-selector/tick-format-selector';

@Component({
  selector: 'preference-view',
  standalone: true,
  imports: [LayoutSelector, DateFormatSelector, TickFormatSelector],
  templateUrl: './preference-view.html',
  styleUrl: './preference-view.css'
})
export class PreferenceView {}
