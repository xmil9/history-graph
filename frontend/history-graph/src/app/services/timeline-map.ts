import * as L from 'leaflet';

export class TimelineMap extends L.Map {
	private tlEventPopup = L.popup();

	constructor(elementId: string) {
		super(elementId, {
			center: [39.8282, -98.5795],
			zoom: 3
		})
		this.init();
	}

	private init() {
		this.initTiles();
		this.initInteractionEvents();
	}

	private initTiles() {
		const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			minZoom: 3,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		});

		tiles.addTo(this);
	}

	private initInteractionEvents() {
		this.on('click', this.onMapClicked.bind(this));
	}

	private onMapClicked(e: L.LeafletMouseEvent) {
	}
}