import { Routes } from '@angular/router';
import { TimelineView } from './view/timeline-view/timeline-view';

export const routes: Routes = [
	{path: '', redirectTo: '/timeline', pathMatch:'full'},
	{path: 'timeline', component: TimelineView},
];
