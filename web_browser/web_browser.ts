import { Browser as AstralBrowser, launch, Page as AstralPage } from "@astral/astral";
import { Tab } from "./tab.ts";
import { Element } from "./element.ts";

const HOMEPAGE_URL = "https://www.google.com/";

export class WebBrowser {
    private astralBrowser: AstralBrowser | null = null;

    public async newTab(url = HOMEPAGE_URL): Promise<Tab> {
        const browser = await this.getAstralBrowser();
        const page = await browser.newPage(url);
        const tab = new Tab(
            url => page.goto(url),
            () => page.close(),
            () => page.url,
            () => page.waitForNetworkIdle({ idleTime: 1000 }),
            () => page.waitForNavigation(),
            time => page.waitForTimeout(time),
            selector => this.selectElement(page, selector),
        );
        return tab;
    }

    private async getAstralBrowser(): Promise<AstralBrowser> {
        if (this.astralBrowser == null) {
            const astralBrowser = await launch({ headless: false });
            this.astralBrowser = astralBrowser;
            return astralBrowser;
        }
        return this.astralBrowser;
    }

    private async selectElement(page: AstralPage, selector: string): Promise<Element | null> {
        const astralElement = await page.$(selector);
        if (!astralElement) {
            return null;
        }
        return new Element(
            () => astralElement.click(),
        );
    }
}
