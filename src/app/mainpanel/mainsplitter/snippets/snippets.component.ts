import { Component, inject, OnInit, ViewChild } from "@angular/core";
import { SnippetHelperService } from "../../../../services/main/snippet-helper.service";
import { Snippet } from "../../../../models/main/base/snippet.model";
import { ResponsiveModel } from "../../../../models/theme/responsive.model";
import { ResponsiveService } from "../../../../services/theme/responsive.service";
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListboxChangeEvent, ListboxModule } from 'primeng/listbox';
import { ContextMenuModule, ContextMenu } from "primeng/contextmenu";
import { MenuItem, ConfirmationService } from "primeng/api";
import { MessageService } from 'primeng/api';
import { FolderHelperService } from "../../../../services/main/folder-helper.service";
import { Folder } from "../../../../models/main/base/folder.model";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";

@Component({
  selector: "app-snippets",
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ListboxModule,
    ContextMenuModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: "./snippets.component.html",
  styleUrl: "./snippets.component.css",
  providers: [MessageService, ConfirmationService]
})
export class SnippetsComponent implements OnInit {
  private snippetService = inject(SnippetHelperService);
  private responsiveService = inject(ResponsiveService);
  private folderService = inject(FolderHelperService);
  private confirmationService = inject(ConfirmationService);
  private notify = inject(MessageService);
  public snippets: Snippet[] = [];
  public windowValues: ResponsiveModel = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  public selectedSnippet: Snippet | undefined;
  public selectedRightClickedSnippet: Snippet | undefined;
  public cmItems: MenuItem[] = [];
  public copiedSnippet: Snippet | undefined;
  @ViewChild("listBoxCm") cm!: ContextMenu
  public ngOnInit(): void {
    this.setupContextMenu();
    this.snippetService.snippets$.subscribe((s) => {
      this.snippets = s;
      console.log("snippets: ", this.snippets);
    });

    this.responsiveService.size$.subscribe((size) => {
      this.windowValues = size;
    });
  }
  private setupContextMenu() {
    this.cmItems = [
      {
        label: "Copy",
        icon: "pi pi-copy",
        command: () => this.copySnippet()
      },
      {
        label: "Paste",
        icon: "pi pi-clipboard",
        command: () => this.pasteSnippet()
      },
      {
        separator: true
      },
      {
        label: "Delete",
        icon: "pi pi-trash",
        command: () => this.confirmDeleteSnippet()
      }
    ]
  }

  public selectSnippet(event: ListboxChangeEvent) {
    if(event.value == null || event.value == undefined) return;
    const clickedSnippet:Snippet = {
      Id: event.value.Id,
      Title: event.value.Title,
      CreatedAt: event.value.CreatedAt,
      ModifiedAt: event.value.ModifiedAt,
      FolderId: event.value.FolderId,
      LanguageId: event.value.LanguageId,
      LanguageKey: event.value.LanguageKey,
      LanguageName: event.value.LanguageName,
      Order: event.value.Order,
      Guid: event.value.Guid
    };
    this.selectedSnippet = clickedSnippet;
    console.log("clicked snippet2 ", clickedSnippet);
    this.snippetService.setSnippet(clickedSnippet);
  }

  public onRightClick(event: MouseEvent, snippet: any) {
    this.cm.show(event);
    console.log("right-clicked snippet ", snippet);
    if(snippet !== undefined || snippet !== null) {
      this.selectedSnippet = snippet as Snippet;
    }
  }

  private copySnippet() {
    this.snippetService.setCopiedSnippet(this.selectedSnippet);
    this.copiedSnippet = this.selectedSnippet;
  }

  private pasteSnippet() {
    const folder = this.folderService.selectedFolder?.data as Folder;
    if(folder === undefined || folder === null) {
      this.notify.add({severity: "error", summary: "Error", detail: "Please select a folder", key: "br", life: 3000});
    }
    this.snippetService.pasteSnippet(this.copiedSnippet!, folder).then(() => {
      this.notify.add({severity: "success", summary: "Success", detail: "Snippet pasted", key: "br", life: 3000});
    })
    
  }

  private confirmDeleteSnippet() {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this snippet?",
      header: "Delete Snippet",
      icon: "pi pi-exclamation-triangle",
      acceptIcon: "none",
      rejectIcon: "none",
      acceptLabel: "Yes",
      rejectLabel: "No",
      rejectButtonStyleClass: "p-button-outlined",
      accept: () => {
        if(this.selectedSnippet === undefined || this.selectedSnippet === null) {
          this.notify.add({severity: "error", summary: "Error", detail: "Please select a snippet to delete", key: "br", life: 3000});
          return;
        }
        this.snippetService.deleteSnippet(this.selectedSnippet).then(() => {
          this.notify.add({severity: "success", summary: "Success", detail: "Snippet deleted", key: "br", life: 3000});
        });
      },
      reject: () => {
        this.notify.add({severity: "info", summary: "Info", detail: "Snippet not deleted", key: "br", life: 3000});
      }
    })
  }
}
