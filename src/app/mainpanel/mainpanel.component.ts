import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MainsplitterComponent } from "./mainsplitter/mainsplitter.component";
import { ToolbarModule } from "primeng/toolbar";
import { TabViewModule, TabView } from "primeng/tabview";
import { MenubarModule } from "primeng/menubar";
import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { MenuItem } from "primeng/api";
import { FoldersComponent } from "./mainsplitter/folders/folders.component";

@Component({
  selector: "app-mainpanel",
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
  templateUrl: "./mainpanel.component.html",
  styleUrl: "./mainpanel.component.css",
})
export class MainpanelComponent implements OnInit {

  @ViewChild("tabView") tabView: TabView | undefined;
  @ViewChild('mainsplitterRef') mainsplitterRef!: MainsplitterComponent;

  items: MenuItem[] = [];

  ngOnInit(): void {
    this.setupMenubarItems();
  }

  private setupMenubarItems() {
    this.items = [
      {
        label: "File",
        icon: "pi pi-fw pi-file",
        items: [
          {
            label: "Workspace",
            icon: "pi pi-briefcase",
            items: [
              {
                label: "New Folder",
                icon: "pi pi-folder-plus",
                command: () =>
                  this.mainsplitterRef?.foldersRef?.globalAddFolder(true),
              },
              {
                separator: true,
              },
              {
                label: "Copy",
                icon: "pi pi-copy",
                //command: () => this.copyFolder(this.selectedFolder as TreeNode),
              },
              {
                label: "Paste",
                icon: "pi pi-clipboard",
               // command: () => this.pasteFolder(),
              },
              {
                label: "Pin",
                icon: "pi pi-bookmark",
              },
              {
                label: "Add Snippet",
                icon: "pi pi-file-plus",
              },
              {
                separator: true,
              },
              {
                label: "Move Folder",
                icon: "pi pi-fw pi-arrow-right",
               // command: () => this.showMoveFoldersDialog(false),
              },
              {
                label: "Properties",
                icon: "pi pi-fw pi-pencil",
               // command: () => this.showChangeFolderDialog(),
              },
              {
                label: "Delete",
                icon: "pi pi-fw pi-trash",
               // command: () => this.confirmDelete(),
              },
              {
                separator: true,
              },
              {
                label: "Sort Ascending",
                icon: "pi pi-fw pi-sort-alpha-down",
               // command: () => this.sortFolders(true),
              },
              {
                label: "Sort Descending",
                icon: "pi pi-fw pi-sort-alpha-up-alt",
               // command: () => this.sortFolders(false),
              },
            ],
          },
        ],
      },
    ];
  }
}
