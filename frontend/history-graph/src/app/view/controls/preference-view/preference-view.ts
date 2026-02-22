import { Component } from '@angular/core';
import { LayoutSelector } from '../layout-selector/layout-selector';
import { DateFormatSelector } from '../date-format-selector/date-format-selector';

@Component({
  selector: 'preference-view',
  standalone: true,
  imports: [LayoutSelector, DateFormatSelector],
  templateUrl: './preference-view.html',
  styleUrl: './preference-view.css'
})
export class PreferenceView {}
