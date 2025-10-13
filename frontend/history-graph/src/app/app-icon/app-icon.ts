import { Component, computed, input } from '@angular/core';
import { Point2D, Size2D } from '../graphics/gfx-coord-2d';

export enum IconOrigin {
	TopLeft,
	Center,
}

@Component({
  selector: '[app-icon]',
  imports: [],
  templateUrl: './app-icon.html',
  styleUrl: './app-icon.css'
})
export class AppIcon {
	name = input.required<string>();
	icon = computed(() => {
		return `icons/${this.name()}.svg`;
	});

	origin = input<IconOrigin>(IconOrigin.TopLeft);
	position = input.required<Point2D>();
	size = input<Size2D>(new Size2D(24, 24));
	x = computed(() => {
		return this.origin() === IconOrigin.TopLeft ? this.position().x : this.position().x - this.size().width / 2;
	});
	y = computed(() => {
		return this.origin() === IconOrigin.TopLeft ? this.position().y : this.position().y - this.size().height / 2;
	});
}
