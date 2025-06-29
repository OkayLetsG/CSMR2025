import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SplitButtonModule } from "primeng/splitbutton";
import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { TreeModule} from "primeng/tree";
import { TreeSelectModule } from "primeng/treeselect";
import { DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from "primeng/floatlabel";
import { DropdownModule } from "primeng/dropdown";
import { ContextMenuModule } from "primeng/contextmenu";
import { CheckboxModule } from 'primeng/checkbox';
import { 
  TreeNode, 
  MessageService,
  MenuItem, 
  ConfirmationService
   } from "primeng/api";
import { FolderHelperService } from "../../../services/main/folder-helper.service";
import { LanguageService } from "../../../services/main/language.service";
import { type Language } from "../../../models/main/base/language.model";
import { type AddFolder } from '../../../models/main/base/addFolder.model';
import { ResponsiveService } from "../../../services/theme/responsive.service";
import { type ResponsiveModel } from "../../../models/theme/responsive.model";



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
    ConfirmDialogModule,
    ButtonModule,
    FloatLabelModule,
    FormsModule,
    DropdownModule,
    ContextMenuModule,
    CheckboxModule
  ],
  templateUrl: "./folders.component.html",
  styleUrl: "./folders.component.css",
  providers: [
    MessageService,
    ConfirmationService
  ]
})
export class FoldersComponent implements OnInit {

  private folderService = inject(FolderHelperService);
  private languageService = inject(LanguageService);
  private responsiveService = inject(ResponsiveService);
  private notify = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  folders: TreeNode[] = [];
  selectedFolder: any; 
  selectedNodeFolder: TreeNode | undefined;
  selectedNodeLanguage: any;
  originalFolders: TreeNode[] = [];
  treeSelect: TreeNode[] = [];
  sbItems: MenuItem[] = [];
  cmItems: MenuItem[] = [];
  filterValue: any;
  addFolderDialogVisible: boolean = false;
  changeFolderDialogVisible: boolean = false;
  isAddRootFolder: boolean = false;
  userFolderNameValue: string = '';
  DialogTitle: string = '';
  DialogDescription: string = '';
  languages: Language[] = [];
  languagesAsTreeNodes: TreeNode[] = [];
  windowValues: ResponsiveModel = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  ngOnInit(): void {
    this.setupSplitButton();
    this.setupContextMenu();
    this.folderService.getFolders(); 
    this.languageService.loadLanguages();

    this.folderService.folders$.subscribe((nodes) => {
      this.folders = nodes;
      this.originalFolders = nodes;
      this.treeSelect = this.cloneTreeNodes(nodes);
    });

    this.languageService.languages$.subscribe((l) => {
      this.languages = l;
    });

    this.languageService.availableLanguagesAsTreeNodes$.subscribe((l) => {
      this.languagesAsTreeNodes = l;
      console.log('languagesAsTreeNodes',this.languagesAsTreeNodes);
    });
 
    this.responsiveService.size$.subscribe((size) => {
      this.windowValues = size;
    })
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
        icon: "pi pi-folder-plus",
        command:() => this.addFolder(this.selectedFolder as TreeNode)
      },
      {
        label: "Add Snippet",
        icon: "pi pi-file-plus"
      },
      {
        label: "Move Folder",
        icon: "pi pi-fw pi-arrow-right",
      }, 
      {
        label: "Properties",
        icon: "pi pi-fw pi-pencil",
        command: () => this.showChangeFolderDialog()
      },
      {
        label: "Delete",
        icon: "pi pi-fw pi-trash",
        command: () => this.confirmDelete()
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

  private addFolder(newNode: TreeNode) {
    console.log('addFolder',newNode);
    this.showGlobalAddFolderDialog();
  }

  private showGlobalAddFolderDialog() {
    this.DialogTitle = 'New Folder';
    this.DialogDescription = '';
    this.addFolderDialogVisible = true;
    if(this.selectedFolder) {
      this.selectedNodeFolder = this.selectedFolder;
      this.isAddRootFolder = false;
    }
    console.log('selectedNodeFolder',this.selectedNodeFolder);
  }
  public onSaveGlobalAddFolder() {
    const errorMessages: string[] = [];
    if (!this.userFolderNameValue || this.userFolderNameValue === '') {
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
        Name: this.userFolderNameValue,
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
    this.userFolderNameValue = '';
    this.selectedNodeFolder = undefined;
    this.selectedNodeLanguage = undefined;
    if(showError)
      this.notify.add({ severity: "info", summary: "Information", detail: "Folder creation canceled", key: 'br', life: 3000 });
    else
      this.notify.add({ severity: "success", summary: "Success", detail: "Folder created", key: 'br', life: 3000 });
    
  }
  public onChangeCheckboxRootFolder() {                                                                                                                               
    console.log('Checkbox isAddRootFolder',this.isAddRootFolder);
    if(this.isAddRootFolder) {
      this.selectedNodeFolder = undefined;
    }
  }

  public cloneTreeNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes.map(node => {
      const clonedNode: TreeNode = {
        label: node.label,
        data: node.data,
        children: node.children ? this.cloneTreeNodes(node.children) : [],
        expandedIcon: node.expandedIcon,
        collapsedIcon: node.collapsedIcon,
        selectable: node.selectable,
        icon: node.icon,
        key: node.key,
        styleClass: node.styleClass,
        type: node.type,
      };

      return clonedNode;
    });
  }

  public confirmDelete() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this folder?',
      header: 'Delete Folder',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      rejectButtonStyleClass: 'p-button-outlined',
      accept: () => {
        if(!this.selectedFolder) {
          this.notify.add({ severity: "error", summary: "Error", detail: "Please select a folder to delete", key: 'br', sticky: true });
          return;
        }
        this.folderService.deleteFolder(this.selectedFolder.data.Id).then(() => {
          this.notify.add({ severity: "success", summary: "Success", detail: "Folder deleted", key: 'br', life: 3000 });
        });
      },
      reject: () => {
        this.notify.add({ severity: "info", summary: "Information", detail: "Folder deletion canceled", key: 'br', life: 3000 });
      }
    });
  }

  public showChangeFolderDialog() {
    if(!this.selectedFolder){
      this.notify.add({ severity: "error", summary: "Error", detail: "Please select a folder", key: 'br', sticky: true });
      return;
    }

    this.DialogTitle = 'Properties';
    this.DialogDescription = '';
    this.changeFolderDialogVisible = true;
    this.userFolderNameValue = this.selectedFolder ? this.selectedFolder.data.Name : '';
    this.selectedNodeLanguage = this.languagesAsTreeNodes.find(node => node.data.Id === this.selectedFolder!.data.LanguageId);
  }

 public onChangeFolderSave() {
   const errorMessages: string[] = [];
   if(!this.selectedFolder) {
     errorMessages.push('Please select a folder');
   }
   if (!this.userFolderNameValue || this.userFolderNameValue === '') {
     errorMessages.push('Please enter a folder name');
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
    this.folderService.changePropertiesFolder(this.selectedFolder!.data.Id, this.userFolderNameValue, this.selectedNodeLanguage.data.Id).then(() => {
      this.onChangeFolderCancel(false);
    })
   }
 }

  public onChangeFolderCancel (showError: boolean) {
    this.DialogTitle = '';
    this.DialogDescription = '';
    this.changeFolderDialogVisible = false;
    this.userFolderNameValue = '';
    this.selectedNodeLanguage = undefined;

    if(showError)
      this.notify.add({ severity: "info", summary: "Information", detail: "Folder change canceled", key: 'br', life: 3000 });
    else
      this.notify.add({ severity: "success", summary: "Success", detail: "Folder changed", key: 'br', life: 3000 });
  }
}
