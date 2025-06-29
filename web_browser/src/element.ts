export type ClickElementFunction = () => Promise<void>;

export class Element {
    constructor(
        private readonly _click: ClickElementFunction,
    ) {}

    public click(): Promise<void> {
        return this._click();
    }
}
