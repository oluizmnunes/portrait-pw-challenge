import { Page } from '@playwright/test';

// Start moving all the page objects inside of the Page Manager... (lines 4, 5...).
import { NavigationPage } from '../page-objects/navigationPage';
import { LoginPage } from '../page-objects/loginPage';
import { DashboardPage } from '../page-objects/dashboardPage';

export class PageManager{
    private readonly page: Page;
    private readonly navigationPage: NavigationPage;
    private readonly loginPage: LoginPage;
    private readonly dashboardPage: DashboardPage;

    constructor(page: Page){
        // Initialize all page objects. 
        this.page = page;

        // Ensure the all pages objects will use the fixture of the page coming from the test into the PageManager, 
        // and then from the PageManager we are cascading it down to the NavigationPage right here
        this.navigationPage = new NavigationPage(this.page); 
        this.loginPage = new LoginPage(this.page);
        this.dashboardPage = new DashboardPage(this.page);
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
}