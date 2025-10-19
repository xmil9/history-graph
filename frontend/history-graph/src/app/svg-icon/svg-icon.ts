import { Component, computed, input } from '@angular/core';
import { Point2D, Size2D } from '../graphics/gfx-coord-2d';

export enum SvgIconOrigin {
	TopLeft,
	Center,
}

@Component({
  selector: '[svg-icon]',
  imports: [],
  templateUrl: './svg-icon.html',
  styleUrl: './svg-icon.css'
})
export class SvgIcon {
	name = input.required<string>();
	icon = computed(() => {
		return `icons/${this.name()}.svg`;
	});

	origin = input<SvgIconOrigin>(SvgIconOrigin.TopLeft);
	position = input.required<Point2D>();
	size = input<Size2D>(new Size2D(24, 24));
	x = computed(() => {
		return this.origin() === SvgIconOrigin.TopLeft ? this.position().x : this.position().x - this.size().width / 2;
	});
	y = computed(() => {
		return this.origin() === SvgIconOrigin.TopLeft ? this.position().y : this.position().y - this.size().height / 2;
	});
}

