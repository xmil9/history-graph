export class IdGenerator {
	private nextId_: number;

	constructor(startId: number = 1) {
		this.nextId_ = startId;
	}

	public nextId(): number {
		return this.nextId_++;
	}
}