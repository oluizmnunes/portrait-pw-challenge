import { Page } from "@playwright/test";
import { HelperBase } from "./helperBase";

export class NavigationPage extends HelperBase {

    // when extending the HelperBase by NavigationPage page, page conflicts with the page field in the HelperBase class
    // so we need to use the super constructor to pass the page parameter to the HelperBase class
    constructor (page: Page) {
        super(page);
    }

    async loginPage(){
        await this.page.goto('/login')
    }

    async dashboardPage(){
        await this.page.goto('/dashboard')
    }

    async productsPage(){
        await this.page.goto('/products')
    }

    async inventoryPage(){
        await this.page.goto('/inventory')
    }
}