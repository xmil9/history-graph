import { Component } from '@angular/core';
import { LayoutSelector } from '../layout-selector/layout-selector';
import { DateFormatSelector } from '../date-format-selector/date-format-selector';

@Component({
  selector: 'settings-view',
  standalone: true,
  imports: [LayoutSelector, DateFormatSelector],
  templateUrl: './settings-view.html',
  styleUrl: './settings-view.css'
})
export class SettingsView {}
