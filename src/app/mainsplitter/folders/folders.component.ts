import { languages } from './../../../../dist/csmr2025/browser/assets/monaco/esm/metadata.d';
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
import { CheckboxModule } from 'primeng/checkbox';
import { TreeNode, MessageService, MenuItem } from "primeng/api";
import { FolderHelperService } from "../../../services/main/folder-helper.service";
import { LanguageService } from "../../../services/main/language.service";
import { type Language } from "../../../models/main/base/language.model";
import { AddFolder } from '../../../models/main/base/addFolder.model';

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
    ContextMenuModule,
    CheckboxModule
  ],
  templateUrl: "./folders.component.html",
  styleUrl: "./folders.component.css",
  providers: [MessageService]
})
export class FoldersComponent implements OnInit {
  private folderService = inject(FolderHelperService);
  private languageService = inject(LanguageService);
  private notify = inject(MessageService);
  folders: TreeNode[] = [];
  selectedFolder: TreeNode | undefined; 
  selectedNodeFolder: any;
  selectedNodeLanguage: any;
  originalFolders: TreeNode[] = [];
  sbItems: MenuItem[] = [];
  cmItems: MenuItem[] = [];
  filterValue: any;
  addFolderDialogVisible: boolean = false;
  isAddRootFolder: boolean = false;
  userAddFolderNameValue: string = '';
  DialogTitle: string = '';
  DialogDescription: string = '';
  languages: Language[] = [];
  languagesAsTreeNodes: TreeNode[] = [];

  ngOnInit(): void {
    this.setupSplitButton();
    this.setupContextMenu();
    this.folderService.getFolders();
    this.languageService.loadLanguages();

    this.folderService.folders$.subscribe((nodes) => {
      this.folders = nodes;
      this.originalFolders = nodes;
    });

    this.languageService.languages$.subscribe((l) => {
      this.languages = l;
    });

    this.languageService.availableLanguagesAsTreeNodes$.subscribe((l) => {
      this.languagesAsTreeNodes = l;
      console.log('languagesAsTreeNodes',this.languagesAsTreeNodes);
    });
  }

  public nodeSelect() {
    const cickedFolder: TreeNode | undefined = this.selectedFolder;
    this.folderService.selectedFolder = cickedFolder;
    const selectedFolder: TreeNode | undefined = this.folderService.selectedFolder;
    console.log('clicked Folder: ',cickedFolder);
  }
  
  public nodeUnselect() {
    this.folderService.selectedFolder = undefined;
    const unclickedFolder: TreeNode | undefined = this.folderService.selectedFolder;
    console.log('unclicked Folder: ',unclickedFolder);
  }

  public applyFilter() {
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
        icon: "pi pi-fw pi-sort-alpha-down",
        command: () => this.folderService.sortFoldersASC(true)
      },
      {
        label: "Sort Descending",
        icon: "pi pi-fw pi-sort-alpha-up-alt",
        command: () => this.folderService.sortFoldersDESC(false)
      }
    ]
  }

  private setupContextMenu() {
    this.cmItems = [
      {
        label: "New Folder",
        icon: "pi pi-folder-plus"
      },
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
      },
      {
        label: "Sort Ascending",
        icon: "pi pi-fw pi-sort-alpha-down",
        command: () => this.folderService.sortFoldersASC(true)
      },
      {
        label: "Sort Descending",
        icon: "pi pi-fw pi-sort-alpha-up-alt",
        command: () => this.folderService.sortFoldersDESC(false)
      }
    ]
  }
  public globalAddFolder() {
    this.showGlobalAddFolderDialog();
  }

  private showGlobalAddFolderDialog() {
    this.DialogTitle = 'Create a new Folder';
    this.DialogDescription = '';
    this.addFolderDialogVisible = true;
  }
  public onSaveGlobalAddFolder() {
    const errorMessages: string[] = [];
    if (!this.userAddFolderNameValue || this.userAddFolderNameValue === '') {
      errorMessages.push('Please enter a folder name');
    }

    if ((!this.selectedNodeFolder || this.selectedNodeFolder === undefined) && !this.isAddRootFolder) {
      errorMessages.push('Please select a parent folder or check the root folder checkbox');
    }
    if (!this.selectedNodeLanguage || this.selectedNodeLanguage === undefined) {
      errorMessages.push('Please select a default language');
    }

    if (errorMessages.length > 0) {
      errorMessages.forEach(err =>
        this.notify.add({ severity: "error", summary: "Error",  detail: err, key: 'br', sticky: true })
      );
      return;
    }
    else {

      this.folderService.addFolder({
        Name: this.userAddFolderNameValue,
        ParentId: this.selectedNodeFolder ? this.selectedNodeFolder.data.Id : null,
        LanguageId: this.selectedNodeLanguage.data.Id,
        LanguageKey: this.selectedNodeLanguage.data.Key,
        LanguageName: this.selectedNodeLanguage.data.Name
      } satisfies AddFolder).then(() => {
        this.onCancleAddFolder(false);
      });
    }
  }

  public onCancleAddFolder(showError: boolean) {
    this.DialogDescription = '';
    this.DialogTitle = '';
    this.isAddRootFolder = false;
    this.addFolderDialogVisible = false; 
    this.userAddFolderNameValue = '';
    this.selectedNodeFolder = undefined;
    this.selectedNodeLanguage = undefined;
    if(showError)
      this.notify.add({ severity: "info", summary: "Information", detail: "Folder creation canceled", key: 'br', life: 3000 });
    else
      this.notify.add({ severity: "success", summary: "Success", detail: "Folder created", key: 'br', life: 3000 });
    
  }
  public onChangeCheckboxRootFolder() {
    console.log('Checkbox isAddRootFolder',this.isAddRootFolder);
  }
}
