import { Component, OnInit, ViewChild } from '@angular/core';
import { MainsplitterComponent } from './mainsplitter/mainsplitter.component';
import { ToolbarModule } from 'primeng/toolbar';
import { TabViewModule, TabView } from 'primeng/tabview';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-mainpanel',
  standalone: true,
  imports: [
    MainsplitterComponent,
    ToolbarModule,
    TabViewModule,
    MenubarModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule
  ],
  templateUrl: './mainpanel.component.html',
  styleUrl: './mainpanel.component.css'
})
export class MainpanelComponent implements OnInit {
  @ViewChild('tabView') tabView: TabView | undefined;
  items: MenuItem[] = [];
  ngOnInit(): void {
    this.setupMenubarItems();
  }

  private setupMenubarItems() {
    this.items = [
      { label: 'File', icon: 'pi pi-fw pi-file', items: [
        { label: 'New', icon: 'pi pi-fw pi-plus', items: [
          { label: 'Bookmark', icon: 'pi pi-fw pi-bookmark' },
          { label: 'Video', icon: 'pi pi-fw pi-video' },
        ] },
        { label: 'Delete', icon: 'pi pi-fw pi-trash' },
        { label: 'Refresh', icon: 'pi pi-fw pi-refresh' }
      ] },
      { label: 'Edit', icon: 'pi pi-fw pi-pencil', items: [
        { label: 'Left', icon: 'pi pi-fw pi-align-left' },
        { label: 'Right', icon: 'pi pi-fw pi-align-right' },
        { label: 'Center', icon: 'pi pi-fw pi-align-center' },
        { label: 'Justify', icon: 'pi pi-fw pi-align-justify' },
      ] }
    ]
  }
}
