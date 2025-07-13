import { Component, inject, OnInit } from "@angular/core";
import { SnippetHelperService } from "../../../../services/main/snippet-helper.service";
import { Snippet } from "../../../../models/main/base/snippet.model";
import { ResponsiveModel } from "../../../../models/theme/responsive.model";
import { ResponsiveService } from "../../../../services/theme/responsive.service";
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListboxChangeEvent, ListboxModule } from 'primeng/listbox';

@Component({
  selector: "app-snippets",
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ListboxModule
  ],
  templateUrl: "./snippets.component.html",
  styleUrl: "./snippets.component.css",
})
export class SnippetsComponent implements OnInit {
  private snippetService = inject(SnippetHelperService);
  private responsiveService = inject(ResponsiveService);
  public snippets: Snippet[] = [];
  public windowValues: ResponsiveModel = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  public selectedSnippet: Snippet | undefined;
  public ngOnInit(): void {
    this.snippetService.snippets$.subscribe((s) => {
      this.snippets = s;
      console.log("snippets: ", this.snippets);
    });

    this.responsiveService.size$.subscribe((size) => {
      this.windowValues = size;
    });
  }

  public selectSnippet(event: ListboxChangeEvent) {
    
  }
}
