import { Page } from '@playwright/test';

// Start moving all the page objects inside of the Page Manager... (lines 4, 5...).
import { NavigationPage } from '../page-objects/navigationPage';
import { LoginPage } from '../page-objects/loginPage';
import { DashboardPage } from '../page-objects/dashboardPage';
import { ProductsPage } from '../page-objects/productsPage';
import { InventoryPage } from '../page-objects/inventoryPage';
import { NavigationBar } from '../page-objects/navigationBar';

export class PageManager{
    private readonly page: Page;
    private readonly navigationPage: NavigationPage;
    private readonly loginPage: LoginPage;
    private readonly dashboardPage: DashboardPage;
    private readonly productsPage: ProductsPage;
    private readonly inventoryPage: InventoryPage;
    private readonly navBar: NavigationBar;

    constructor(page: Page){
        // Initialize all page objects. 
        this.page = page;

        // Ensure the all pages objects will use the fixture of the page coming from the test into the PageManager, 
        // and then from the PageManager we are cascading it down to the NavigationPage right here
        this.navigationPage = new NavigationPage(this.page); 
        this.loginPage = new LoginPage(this.page);
        this.dashboardPage = new DashboardPage(this.page);
        this.productsPage = new ProductsPage(this.page);
        this.inventoryPage = new InventoryPage(this.page);
        this.navBar = new NavigationBar(this.page);
    }

    // Now we need to create methods to return the instances of the page objects
    navigateTo(): NavigationPage {
        return this.navigationPage;
    }

    onLoginPage(): LoginPage {
        return this.loginPage;
    }

    onDashboardPage(): DashboardPage {
        return this.dashboardPage;
    }

    onProductsPage(): ProductsPage {
        return this.productsPage;
    }

    onInventoryPage(): InventoryPage {
        return this.inventoryPage;
    }

    onNavigationBar(): NavigationBar {
        return this.navBar;
    }

    async logout(): Promise<void> {
        await this.navBar.logout();
        await Promise.all([
            this.loginPage.emailInput.waitFor({ state: 'visible' }),
            this.loginPage.passwordInput.waitFor({ state: 'visible' }),
            this.loginPage.loginButton.waitFor({ state: 'visible' })
        ]);
    }
}