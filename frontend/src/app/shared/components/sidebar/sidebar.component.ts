import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard',    icon: 'dashboard',     route: '/dashboard' },
    { label: 'Add Expense',  icon: 'add_circle',    route: '/expenses/add' },
    { label: 'My Expenses',  icon: 'receipt_long',  route: '/expenses/list' },
  ];

  constructor(public router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
