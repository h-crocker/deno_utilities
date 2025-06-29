import { Element } from "./element.ts";

export type GoToFunction = (url: string) => Promise<void>;
export type CloseTabFunction = () => Promise<void>;
export type GetUrlFunction = () => string;
export type WaitForFunction = () => Promise<void>;
export type WaitForTimeFunction = (time: number) => Promise<void>;
export type SelectElementFunction = (selector: string) => Promise<Element | null>;

export class Tab {
    constructor(
        private readonly _goto: GoToFunction,
        private readonly _closeTab: CloseTabFunction,
        private readonly _getUrl: GetUrlFunction,
        private readonly _waitForIdleNetwork: WaitForFunction,
        private readonly _waitForNavigation: WaitForFunction,
        private readonly _waitForTime: WaitForTimeFunction,
        private readonly _selectElement: SelectElementFunction,
    ) {}

    get url(): string {
        return this._getUrl();
    }

    public goto(url: string): Promise<void> {
        return this._goto(url);
    }

    public async waitForNavigationTo(url: string, timeout: number = 10000, elapsedTime: number = 0): Promise<void> {
        if (elapsedTime >= timeout) {
            throw new Error("Fatal Error - Did not navigate to URL");
        }
        if (this._getUrl().includes(url)) {
            return;
        }
        const waitTime = 500;
        await this._waitForTime(waitTime);
        return this.waitForNavigationTo(url, timeout, elapsedTime + waitTime);
    }

    public close(): Promise<void> {
        return this._closeTab();
    }

    public selectElement(selector: string): Promise<Element | null> {
        return this._selectElement(selector);
    }
}
