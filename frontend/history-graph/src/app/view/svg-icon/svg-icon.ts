import { Component, computed, input } from '@angular/core';
import { Point2D, Size2D } from '../../graphics/gfx-coord-2d';

export enum SvgIconOrigin {
	TopLeft,
	Center,
	CenterLeft,
	CenterRight,
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
		switch (this.origin()) {
			case SvgIconOrigin.TopLeft:
			case SvgIconOrigin.CenterLeft:
				return this.position().x;
			case SvgIconOrigin.Center:
				return this.position().x - this.size().width / 2;
			case SvgIconOrigin.CenterRight:
				return this.position().x - this.size().width;
		}
	});
	y = computed(() => {
		switch (this.origin()) {
			case SvgIconOrigin.TopLeft:
				return this.position().y;
			case SvgIconOrigin.Center:
			case SvgIconOrigin.CenterLeft:
			case SvgIconOrigin.CenterRight:
				return this.position().y - this.size().height / 2;
			}
	});
	opacity = input<number>(1.0);
}
