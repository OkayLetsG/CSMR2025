import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SplitButtonModule } from "primeng/splitbutton";
import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { TreeModule } from "primeng/tree";
import { TreeSelectModule } from "primeng/treeselect";
import { DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
import { ToastModule } from "primeng/toast";
import { FloatLabelModule } from "primeng/floatlabel";
import { DropdownModule } from "primeng/dropdown";
import { ContextMenuModule } from "primeng/contextmenu";
import { TreeNode, MessageService, MenuItem } from "primeng/api";
import { FolderHelperService } from "../../../services/main/folder-helper.service";

@Component({
  selector: "app-folders",
  standalone: true,
  imports: [
    SplitButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TreeModule,
    TreeSelectModule,
    DialogModule,
    DividerModule,
    ToastModule,
    ButtonModule,
    FloatLabelModule,
    FormsModule,
    DropdownModule,
    ContextMenuModule
  ],
  templateUrl: "./folders.component.html",
  styleUrl: "./folders.component.css",
  providers: [MessageService]
})
export class FoldersComponent implements OnInit {
  private folderService = inject(FolderHelperService);
  folders: TreeNode[] = [];
  originalFolders: TreeNode[] = [];
  sbItems: MenuItem[] = [];
  cmItems: MenuItem[] = [];
  filterValue: any;

  ngOnInit(): void {
    this.setupSplitButton();
    this.setupContextMenu();
    this.folderService.getFolders();

    this.folderService.folders$.subscribe((nodes) => {
      this.folders = nodes;
      this.originalFolders = nodes;
    });
  }

  applyFilter() {
    if(!this.filterValue) {
      this.folders = this.originalFolders;
      return;
    }

    const filteredNodes  = this.filterTreeNodes(this.originalFolders, this.filterValue.toLowerCase());
    this.folders = filteredNodes;
  }

  private filterTreeNodes(nodes: TreeNode[], searchText: string): TreeNode[] {
    return nodes
      .map(node => {
        const matches = node.label?.toLowerCase().includes(searchText);
        const filteredChildren = node.children ? this.filterTreeNodes(node.children, searchText): [];

        if(matches || filteredChildren.length > 0) {
          return {...node, children: filteredChildren};
        }
        return null;
      })
      .filter(node => node !== null) as TreeNode[];
  }

  private setupSplitButton() {
    this.sbItems = [
      {
        label: "Move Folders",
        icon: "pi pi-arrows-alt"
      },
      {
        label: "Add Snippet",
        icon: "pi pi-file-plus"
      },
      {
        label: "Delete",
        icon: "pi pi-fw pi-trash"
      },
      {
        label: "Sort Ascending",
        icon: "pi pi-fw pi-sort-alpha-down"
      },
      {
        label: "Sort Descending",
        icon: "pi pi-fw pi-sort-alpha-up-alt"
      }
    ]
  }

  private setupContextMenu() {
    this.cmItems = [
      {
        label: "Move Folder",
        icon: "pi pi-arrows-alt"
      },
      {
        label: "Add Snippet",
        icon: "pi pi-file-plus"
      },
      {
        label: "Change Properties",
        icon: "pi pi-fw pi-pencil"
      },
      {
        label: "Delete",
        icon: "pi pi-fw pi-trash"
      }
    ]
  }
  addFolder() {
    
  }
}
