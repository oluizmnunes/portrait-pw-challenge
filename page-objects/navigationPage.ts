import { Page } from "@playwright/test";
import { HelperBase } from "./helperBase";

export class NavigationPage extends HelperBase {

    // when extending the HelperBase by NavigationPage page, page conflicts with the page field in the HelperBase class
    // so we need to use the super constructor to pass the page parameter to the HelperBase class
    constructor (page: Page) {
        super(page);
    }

    private async gotoPath(path: string) {
        const current = new URL(this.page.url(), 'http://localhost').pathname;
        if (current === path) return;
        try {
            await this.page.goto(path, { waitUntil: 'load' });
        } catch (e) {
            await this.page.waitForLoadState('load').catch(() => {});
            await this.page.goto(path, { waitUntil: 'load' });
        }
        await this.page.waitForURL(path);
    }

    async loginPage(){
        await this.gotoPath('/login')
    }

    async dashboardPage(){
        await this.gotoPath('/dashboard')
    }

    async productsPage(){
        await this.gotoPath('/products')
    }

    async inventoryPage(){
        await this.gotoPath('/inventory')
    }
}