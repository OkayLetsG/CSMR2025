import { Component, inject, OnInit, ViewChild } from "@angular/core";
import { SnippetHelperService } from "../../../../services/main/snippet-helper.service";
import { Snippet } from "../../../../models/main/base/snippet.model";
import { ResponsiveModel } from "../../../../models/theme/responsive.model";
import { ResponsiveService } from "../../../../services/theme/responsive.service";
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListboxChangeEvent, ListboxModule } from 'primeng/listbox';
import { ContextMenuModule, ContextMenu } from "primeng/contextmenu";
import { MenuItem } from "primeng/api";
import { MessageService } from 'primeng/api';
import { FolderHelperService } from "../../../../services/main/folder-helper.service";
import { Folder } from "../../../../models/main/base/folder.model";
import { ToastModule } from "primeng/toast";


@Component({
  selector: "app-snippets",
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ListboxModule,
    ContextMenuModule,
    ToastModule
  ],
  templateUrl: "./snippets.component.html",
  styleUrl: "./snippets.component.css",
  providers: [MessageService]
})
export class SnippetsComponent implements OnInit {
  private snippetService = inject(SnippetHelperService);
  private responsiveService = inject(ResponsiveService);
  private folderService = inject(FolderHelperService);
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
    this.snippetService.pasteSnippet(this.copiedSnippet!, folder);
    this.notify.add({severity: "success", summary: "Success", detail: "Snippet pasted", key: "br", life: 3000});
  }
}
