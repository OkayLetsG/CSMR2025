import { Component, OnInit, AfterViewInit, inject, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SplitButtonModule } from "primeng/splitbutton";
import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { TreeModule, TreeNodeContextMenuSelectEvent } from "primeng/tree";
import { TreeSelectModule } from "primeng/treeselect";
import { DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { FloatLabelModule } from "primeng/floatlabel";
import { DropdownModule } from "primeng/dropdown";
import { ContextMenuModule, ContextMenu } from "primeng/contextmenu";
import { CheckboxModule } from "primeng/checkbox";
import { TabMenuModule } from 'primeng/tabmenu';
import { SkeletonModule } from 'primeng/skeleton';
import {
  TreeNode,
  MessageService,
  MenuItem,
  ConfirmationService,
} from "primeng/api";
import { FolderHelperService } from "../../../../services/main/folder-helper.service";
import { LanguageService } from "../../../../services/main/language.service";
import { type Language } from "../../../../models/main/base/language.model";
import { type AddFolder } from "../../../../models/main/base/addFolder.model";
import { ResponsiveService } from "../../../../services/theme/responsive.service";
import { type ResponsiveModel } from "../../../../models/theme/responsive.model";
import { SnippetHelperService } from "../../../../services/main/snippet-helper.service";
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
    CheckboxModule,
    TabMenuModule,
    SkeletonModule
  ],
  templateUrl: "./folders.component.html",
  styleUrl: "./folders.component.css",
  providers: [MessageService, ConfirmationService],
})
export class FoldersComponent implements OnInit, AfterViewInit {
  private folderService = inject(FolderHelperService);
  private languageService = inject(LanguageService);
  private responsiveService = inject(ResponsiveService);
  private notify = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private snippetService = inject(SnippetHelperService);
  @ViewChild("cm") cm!: ContextMenu;
  public isLoading: boolean = false;
  public folders: TreeNode[] = [];
  public pinnedFolders: TreeNode[] = [];
  public selectedFolder: any;
  public selectedNodeFolder: TreeNode | undefined;
  public selectedNodeLanguage: any;
  public originalFolders: TreeNode[] = [];
  public treeSelect: TreeNode[] = [];
  public cmItems: MenuItem[] = [];
  public tmItems: MenuItem[] = [];
  public filterValue: any;
  public addFolderDialogVisible: boolean = false;
  public changeFolderDialogVisible: boolean = false;
  public isAddRootFolder: boolean = false;
  public userFolderNameValue: string = "";
  public DialogTitle: string = "";
  public DialogDescription: string = "";
  public languages: Language[] = [];
  public languagesAsTreeNodes: TreeNode[] = [];
  public windowValues: ResponsiveModel = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  public moveFolderDialog: boolean = false;
  public isMoveToRoot: boolean = false;
  public selectedFoldersToMove: TreeNode[] | undefined = [];
  public multipleTreeSelect: TreeNode[] = [];
  public destinationFolder: TreeNode | undefined = undefined;
  public activeTabItem: MenuItem | undefined = undefined;
  public copiedFolder: TreeNode | undefined = undefined;
  public userAddSnippetName: string = "";
  public showAddSnippetDialog: boolean = false;

  public ngOnInit(): void {
    this.setupContextMenu();
    this.setupTabMenu();
    this.folderService.getFolders();
    this.languageService.loadLanguages();

    this.folderService.folders$.subscribe((nodes) => {
      this.isLoading = true;
      this.folders = nodes;
      this.originalFolders = nodes;
      this.treeSelect = this.cloneTreeNodes(nodes);
      this.multipleTreeSelect = this.cloneTreeNodes(nodes);
      this.pinnedFolders = this.getPinnedFolders(nodes);
      this.sortPinnedFolders(this.folderService.isFoldersSortedAscending);
      this.isLoading = false;
    });

    this.languageService.languages$.subscribe((l) => {
      this.languages = l;
    });

    this.languageService.availableLanguagesAsTreeNodes$.subscribe((l) => {
      this.languagesAsTreeNodes = l;
      console.log("languagesAsTreeNodes", this.languagesAsTreeNodes);
    });

    this.responsiveService.size$.subscribe((size) => {
      this.windowValues = size;
    });
  }

  public ngAfterViewInit(): void {
    this.activeTabItem = this.tmItems[0];
  }

  public nodeSelect() {
    const cickedFolder: TreeNode | undefined = this.selectedFolder;
    this.folderService.selectedFolder = cickedFolder;
    const selectedFolder: TreeNode | undefined =
      this.folderService.selectedFolder;
    console.log("clicked Folder: ", cickedFolder);
  }

  public nodeUnselect() {
    this.folderService.selectedFolder = undefined;
    const unclickedFolder: TreeNode | undefined =
      this.folderService.selectedFolder;
    console.log("unclicked Folder: ", unclickedFolder);
  }

  public applyFilter() {
    this.isLoading = true;
    if (!this.filterValue) {
      this.folders = this.originalFolders;
      this.isLoading = false;
      return;
    }

    const filteredNodes = this.filterTreeNodes(
      this.originalFolders,
      this.filterValue.toLowerCase()
    );
    this.folders = filteredNodes;
    this.isLoading = false;
  }

  private filterTreeNodes(nodes: TreeNode[], searchText: string): TreeNode[] {
    return nodes
      .map((node) => {
        const matches = node.label?.toLowerCase().includes(searchText);
        const filteredChildren = node.children
          ? this.filterTreeNodes(node.children, searchText)
          : [];

        if (matches || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter((node) => node !== null) as TreeNode[];
  }

  private setupContextMenu() {
    this.cmItems = [
      {
        label: "New Folder",
        icon: "pi pi-folder-plus",
        command: () => this.addFolder(this.selectedFolder as TreeNode, false),
      },
      {
        separator: true
      },
      {
        label: "Copy",
        icon: "pi pi-copy",
        command: () => this.copyFolder(this.selectedFolder as TreeNode),
      },
      {
        label: "Paste",
        icon: "pi pi-clipboard",
        command: () => this.pasteFolder(),
      },
      {
        label: "Pin",
        icon: "pi pi-bookmark",
      },
      {
        label: "Add Snippet",
        icon: "pi pi-file-plus",
        command: () => this.showSnippetDialog()
      },
      {
        separator: true
      },
      {
        label: "Move Folder",
        icon: "pi pi-fw pi-arrow-right",
        command: () => this.showMoveFoldersDialog(false),
      },
      {
        label: "Properties",
        icon: "pi pi-fw pi-pencil",
        command: () => this.showChangeFolderDialog(),
      },
      {
        label: "Delete",
        icon: "pi pi-fw pi-trash",
        command: () => this.confirmDelete(),
      },
      {
        separator: true
      },
      {
        label: "Sort Ascending",
        icon: "pi pi-fw pi-sort-alpha-down",
        command: () => this.sortFolders(true)
      },
      {
        label: "Sort Descending",
        icon: "pi pi-fw pi-sort-alpha-up-alt",
        command: () => this.sortFolders(false)
      },
    ];
  }
  public setupTabMenu() {
    this.tmItems = [
      {
        label: 'EXPLORER'
      },
      {
        label: 'PINNED FOLDERS'
      }
    ]
  }
  public globalAddFolder(isGlobalAdd: boolean) {
    this.showGlobalAddFolderDialog(isGlobalAdd);
  }

  private addFolder(newNode: TreeNode, isGlobalAdd: boolean) {
    console.log("addFolder", newNode);
    this.showGlobalAddFolderDialog(isGlobalAdd);
  }

  private showGlobalAddFolderDialog(isGlobalAdd: boolean) {
    this.DialogTitle = "New Folder";
    this.DialogDescription = "";
    this.addFolderDialogVisible = true;
    if (this.selectedFolder && !isGlobalAdd) {
      this.selectedNodeFolder = this.selectedFolder;
      this.isAddRootFolder = false;
    }
    console.log("selectedNodeFolder", this.selectedNodeFolder);
  }
  public onSaveGlobalAddFolder() {
    const errorMessages: string[] = [];
    if (!this.userFolderNameValue || this.userFolderNameValue === "") {
      errorMessages.push("Please enter a folder name");
    }

    if (
      (!this.selectedNodeFolder || this.selectedNodeFolder === undefined) &&
      !this.isAddRootFolder
    ) {
      errorMessages.push(
        "Please select a parent folder or check the root folder checkbox"
      );
    }
    if (!this.selectedNodeLanguage || this.selectedNodeLanguage === undefined) {
      errorMessages.push("Please select a default language");
    }

    if (errorMessages.length > 0) {
      errorMessages.forEach((err) =>
        this.notify.add({
          severity: "error",
          summary: "Error",
          detail: err,
          key: "br",
          sticky: true,
        })
      );
      return;
    } else {
      this.isLoading = true;
      this.folderService
        .addFolder({
          Name: this.userFolderNameValue,
          ParentId: this.selectedNodeFolder
            ? this.selectedNodeFolder.data.Id
            : null,
          LanguageId: this.selectedNodeLanguage.data.Id,
          LanguageKey: this.selectedNodeLanguage.data.Key,
          LanguageName: this.selectedNodeLanguage.data.Name,
        } satisfies AddFolder)
        .then(() => {
          this.onCancleAddFolder(false);
          this.isLoading = false;
        });
    }
  }

  public onCancleAddFolder(showError: boolean) {
    this.DialogDescription = "";
    this.DialogTitle = "";
    this.isAddRootFolder = false;
    this.addFolderDialogVisible = false;
    this.userFolderNameValue = "";
    this.selectedNodeFolder = undefined;
    this.selectedNodeLanguage = undefined;
    if (showError)
      this.notify.add({
        severity: "info",
        summary: "Information",
        detail: "Folder creation canceled",
        key: "br",
        life: 3000,
      });
    else
      this.notify.add({
        severity: "success",
        summary: "Success",
        detail: "Folder created",
        key: "br",
        life: 3000,
      });
  }
  public onChangeCheckboxRootFolder() {
    console.log("Checkbox isAddRootFolder", this.isAddRootFolder);
    if (this.isAddRootFolder) {
      this.selectedNodeFolder = undefined;
    }
  }

  public cloneTreeNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes.map((node) => {
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
      message: "Are you sure you want to delete this folder?",
      header: "Delete Folder",
      icon: "pi pi-exclamation-triangle",
      acceptIcon: "none",
      rejectIcon: "none",
      acceptLabel: "Yes",
      rejectLabel: "No",
      rejectButtonStyleClass: "p-button-outlined",
      accept: () => {
        this.isLoading = true;
        if (!this.selectedFolder) {
          this.notify.add({
            severity: "error",
            summary: "Error",
            detail: "Please select a folder to delete",
            key: "br",
            sticky: true,
          });
          this.isLoading = false;
          return;
        }
        this.folderService
          .deleteFolder(this.selectedFolder.data.Id)
          .then(() => {
            this.notify.add({
              severity: "success",
              summary: "Success",
              detail: "Folder deleted",
              key: "br",
              life: 3000,
            });
            this.isLoading = false;
          });
      },
      reject: () => {
        this.notify.add({
          severity: "info",
          summary: "Information",
          detail: "Folder deletion canceled",
          key: "br",
          life: 3000,
        });
      },
    });
  }

  public showChangeFolderDialog() {
    if (!this.selectedFolder) {
      this.notify.add({
        severity: "error",
        summary: "Error",
        detail: "Please select a folder",
        key: "br",
        sticky: true,
      });
      return;
    }

    this.DialogTitle = "Properties";
    this.DialogDescription = "";
    this.changeFolderDialogVisible = true;
    this.userFolderNameValue = this.selectedFolder
      ? this.selectedFolder.data.Name
      : "";
    this.selectedNodeLanguage = this.languagesAsTreeNodes.find(
      (node) => node.data.Id === this.selectedFolder!.data.LanguageId
    );
  }

  public onChangeFolderSave() {
    const errorMessages: string[] = [];
    if (!this.selectedFolder) {
      errorMessages.push("Please select a folder");
    }
    if (!this.userFolderNameValue || this.userFolderNameValue === "") {
      errorMessages.push("Please enter a folder name");
    }
    if (!this.selectedNodeLanguage || this.selectedNodeLanguage === undefined) {
      errorMessages.push("Please select a default language");
    }

    if (errorMessages.length > 0) {
      errorMessages.forEach((err) =>
        this.notify.add({
          severity: "error",
          summary: "Error",
          detail: err,
          key: "br",
          sticky: true,
        })
      );
      return;
    } else {
      this.isLoading = true;
      this.folderService
        .changePropertiesFolder(
          this.selectedFolder!.data.Id,
          this.userFolderNameValue,
          this.selectedNodeLanguage.data.Id
        )
        .then(() => {
          this.onChangeFolderCancel(false);
          this.isLoading = false;
        });
    }
  }

  public onChangeFolderCancel(showError: boolean) {
    this.DialogTitle = "";
    this.DialogDescription = "";
    this.changeFolderDialogVisible = false;
    this.userFolderNameValue = "";
    this.selectedNodeLanguage = undefined;

    if (showError)
      this.notify.add({
        severity: "info",
        summary: "Information",
        detail: "Folder change canceled",
        key: "br",
        life: 3000,
      });
    else
      this.notify.add({
        severity: "success",
        summary: "Success",
        detail: "Folder changed",
        key: "br",
        life: 3000,
      });
  }

  public showMoveFoldersDialog(isGlobalMove: boolean) {
    this.moveFolderDialog = true;
    this.DialogTitle = "Move Folders";
    this.DialogDescription = "";
    if (this.selectedFolder && !isGlobalMove) {
      this.selectedFoldersToMove = this.cloneTreeNodes([this.selectedFolder]);
    }
  }

    public onMoveFolders() {
      const errorMessages: string[] = [];
    
      if (!this.selectedFoldersToMove || this.selectedFoldersToMove.length === 0) {
        errorMessages.push("Please select folders to move");
      }
    
      if (!this.isMoveToRoot && !this.destinationFolder) {
        errorMessages.push("Please select a destination folder");
      }
    
      const newParentId = this.isMoveToRoot
        ? undefined
        : this.destinationFolder!.data.Id;
    
      if (this.selectedFoldersToMove) {
        if (
          newParentId &&
          this.selectedFoldersToMove.some((f) => f.data.Id === newParentId)
        ) {
          errorMessages.push("A folder cannot be moved into itself.");
        }
    
        for (const folder of this.selectedFoldersToMove) {
          if (
            newParentId &&
            this.isDescendantFolder(folder, newParentId)
          ) {
            errorMessages.push(
              `Cannot move folder '${folder.label}' into one of its own subfolders.`
            );
          }
        }
      }
    
      if (errorMessages.length > 0) {
        errorMessages.forEach((err) =>
          this.notify.add({
            severity: "error",
            summary: "Error",
            detail: err,
            key: "br",
            sticky: true,
          })
        );
        return;
      }
    
      this.isLoading = true;
    
      const folderIds = this.selectedFoldersToMove?.map(
        (folder) => folder.data.Id
      );
    
      const foldersToMove: {
        folderId: number;
        parentId: number | undefined;
      }[] =
        folderIds?.map((folderId) => ({ folderId, parentId: newParentId })) || [];
    
      if (foldersToMove.length > 0) {
        this.folderService.updateFolderParents(foldersToMove).then(() => {
          this.onCancelMoveFolders(false);
          this.isLoading = false;
        });
      } else {
        this.notify.add({
          severity: "info",
          summary: "Information",
          detail: "No folders to move",
          key: "br",
          life: 3000,
        });
        this.isLoading = false;
      }
    }
    

  private isDescendantFolder(
    parent: TreeNode,
    potentialChildId: number
  ): boolean {
    if (!parent.children) return false;
  
    for (const child of parent.children) {
      if (child.data.Id === potentialChildId) return true;
      if (this.isDescendantFolder(child, potentialChildId)) return true;
    }
  
    return false;
  }

  private isDescendant(parent: TreeNode, target: TreeNode): boolean {
    if (!parent.children) return false;
    for (const child of parent.children) {
      if (child.key === target.key || this.isDescendant(child, target)) {
        return true;
      }
    }
    return false;
  }
  
  

  public onCancelMoveFolders(showError: boolean) {
    this.moveFolderDialog = false;
    this.DialogTitle = "";
    this.DialogDescription = "";
    this.selectedFoldersToMove = undefined;
    this.destinationFolder = undefined;
    this.isMoveToRoot = false;

    if (showError)
      this.notify.add({
        severity: "info",
        summary: "Information",
        detail: "Folder move canceled",
        key: "br",
        life: 3000,
      });
    else
      this.notify.add({
        severity: "success",
        summary: "Success",
        detail: "Folder moved",
        key: "br",
        life: 3000,
      });
  }

  public onChangeMoveAsCheckboxRootFolder() {
    if (this.isMoveToRoot) {
      this.destinationFolder = undefined;
    }
  }

  public nodeContextMenuSelect(event: TreeNodeContextMenuSelectEvent) {
    if (this.cm === undefined || this.cm === null) {
      this.notify.add({
        severity: "error",
        summary: "Error",
        detail: "Context menu not initialized",
        key: "br",
        sticky: true,
      });
      return;
    }

    if (!event.node) {
      this.notify.add({
        severity: "error",
        summary: "Error",
        detail: "Something went wrong with the context menu",
        key: "br",
        sticky: true,
      });
      return;
    }

    const pinMenuItem = this.cmItems.find(
      (item) => item.label === "Pin" || item.label === "Unpin"
    );

    if (!pinMenuItem) {
      this.notify.add({
        severity: "error",
        summary: "Error",
        detail: "No context menu item 'Pin' or 'Unpin' was found",
        key: "br",
        sticky: true,
      });
      return;
    }

    const isPinned = event.node.data.Pinned === -1 ? true : false;
    pinMenuItem.icon = isPinned ? "pi pi-bookmark" : "pi pi-bookmark-fill";
    pinMenuItem.label = isPinned ? "Unpin" : "Pin";
    pinMenuItem.command = () => {
      this.folderService.Un_Pin_Folder(event.node.data.Id, isPinned).then(() => {
        this.notify.add({
          severity: "success",
          summary: "Success",
          detail: isPinned ? "Unpinned folder" : "Pinned folder",
          key: "br",
          life: 3000,
        });
      });
    };
  }

 private getPinnedFolders(nodes: TreeNode[]): TreeNode[] {
    const pinned: TreeNode[] = [];

    const collectPinned = (nodeList: TreeNode[]) => {
      for (const node of nodeList) {
        if (node.data?.Pinned === -1) {
          pinned.push({
            ...node,
            children: []
          });
        }
        if (node.children && node.children.length > 0) {
          collectPinned(node.children);
        }
      }
    };
    collectPinned(nodes);
    return pinned;
  }

  private copyFolder(node: TreeNode) {
    if (!node) {
      this.notify.add({
        severity: "info",
        summary: "Information",
        detail: "No folder selected",
        key: "br",
        life: 3000,
      });
      this.copiedFolder = undefined;
      return;
    }
  
    this.copiedFolder = this.deepCloneNode(node);
    console.log("this.copiedFolder", this.copiedFolder);
    this.notify.add({
      severity: "success",
      summary: "Success",
      detail: "Folder copied",
      key: "br",
      life: 3000,
    })
  }
  

  private async pasteFolder() {
    if (!this.copiedFolder) {
      this.notify.add({
        severity: "info",
        summary: "Information",
        detail: "No folder to paste",
        key: "br",
        life: 3000,
      });
      return;
    }
  
    if (!this.selectedFolder || !this.selectedFolder.data?.Id) {
      this.notify.add({
        severity: "info",
        summary: "Information",
        detail: "Please select a destination folder",
        key: "br",
        life: 3000,
      });
      return;
    }

    if (this.isDescendant(this.copiedFolder, this.selectedFolder)) {
      this.notify.add({
        severity: "error",
        summary: "Error",
        detail: "Cannot paste a folder into itself or one of its subfolders.",
        key: "br",
        life: 3000,
      });
      return;
    }
    
  
    try {
      this.isLoading = true;
      await this.pasteFolderRecursively(this.copiedFolder, this.selectedFolder.data.Id);
      this.isLoading = false;
  
      this.notify.add({
        severity: "success",
        summary: "Success",
        detail: "Folder and its subfolders pasted successfully",
        key: "br",
        life: 3000,
      });
    } catch (error) {
      console.error(error);
      this.notify.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to paste folder",
        key: "br",
        life: 3000,
      });
      this.isLoading = false;
    }
  }
  private async pasteFolderRecursively(
    nodeToCopy: TreeNode,
    targetParentId: number
  ): Promise<void> {
    const now = new Date();
    const formatted = now.toISOString().slice(2, 16).replace(/[-T:]/g, '');
    const newFolder: AddFolder = {
      Name: `${nodeToCopy.label}_copy_${formatted}`,
      ParentId: targetParentId,
      LanguageId: nodeToCopy.data.LanguageId,
      LanguageKey: nodeToCopy.data.DefaultLanguageKey,
      LanguageName: nodeToCopy.data.DefaultLanguageName
    };
  
    const newId = await this.folderService.addFolder(newFolder);
    if (nodeToCopy.children && nodeToCopy.children.length > 0) {
      for (const child of nodeToCopy.children) {
        await this.pasteFolderRecursively(child, newId);
      }
    }
  }
  
  private deepCloneNode(node: TreeNode): TreeNode {
    const newNode: TreeNode = {
      ...node,
      data: { ...node.data },
      children: node.children
        ? node.children.map(child => this.deepCloneNode(child))
        : undefined
    };
  
    return newNode;
  }

  public sortFolders(isAscended: boolean) {
    if(isAscended) {
      this.folderService.sortFoldersASC(isAscended);
    }
    else {
      this.folderService.sortFoldersDESC(isAscended);
    }

    this.sortPinnedFolders(isAscended);
  }

  private sortPinnedFolders(isAscended: boolean) {
    this.pinnedFolders = this.pinnedFolders.sort((a, b) => {
      const nameA = a?.label?.toLowerCase() ?? "";
      const nameB = b?.label?.toLowerCase() ?? "";
      return isAscended
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  }

  public onRefreshAddFolder () {
    this.isAddRootFolder = false;
    this.userFolderNameValue = "";
    this.selectedNodeFolder = undefined;
    this.selectedNodeLanguage = undefined;
  }

  public onRefreshChangeFolder () {
    this.userFolderNameValue = "";
    this.selectedNodeLanguage = undefined;
  }

  public onRefreshMoveFolders () {
    this.selectedFoldersToMove = undefined;
    this.destinationFolder = undefined;
    this.isMoveToRoot = false;
  }

  public showSnippetDialog() {
    this.DialogTitle = "New Snippet";
    this.DialogDescription = "";
    this.showAddSnippetDialog = true;
    if(this.selectedFolder) {
      this.selectedNodeFolder = this.deepCloneNode(this.selectedFolder);
    }
  }

  public onSaveSnippet() {
    const errors: string[] = [];
    if(!this.userAddSnippetName || this.userAddSnippetName === "") {
      errors.push("Please enter a snippet name");
    }
    if(this.selectedNodeFolder === null || this.selectedNodeFolder === undefined) {
      errors.push("Please select a folder");
    }
    if(errors.length > 0) {
      errors.forEach(err => this.notify.add({
        severity: "error",
        summary: "Error",
        detail: err,
        key: "br",
        sticky: true
      }));
      return;
    }
    this.snippetService.addSnippet(this.selectedNodeFolder?.data.Id, this.userAddSnippetName).then(() => {
      this.notify.add({
        severity: "success",
        summary: "Success",
        detail: "Snippet added",
        key: "br",
        life: 3000
      });
      this.onCancelSaveSnippet(false);
    })
  }

  public onCancelSaveSnippet(showError: boolean) {
    this.userAddSnippetName = "";
    this.showAddSnippetDialog = false;
    this.selectedNodeFolder = undefined;
    this.DialogTitle = "";
    this.DialogDescription = "";
    if(showError) {
      this.notify.add({
        severity: "info",
        summary: "Information",
        detail: "Snippet creation canceled",
        key: "br",
        life: 3000
      });
    }
  }

  public onRefreshSnippet() {
    this.userAddSnippetName = "";
    this.selectedNodeFolder = undefined;
  }
}
