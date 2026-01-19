import { Routes } from '@angular/router';
import { HistoryGraph } from './view/history-graph/history-graph';

export const routes: Routes = [
	{path: '', redirectTo: '/graph', pathMatch:'full'},
	{path: 'graph', component: HistoryGraph},
];
