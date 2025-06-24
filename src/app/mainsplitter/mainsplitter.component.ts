import { Component, inject, OnInit } from "@angular/core";
import { SplitterModule } from "primeng/splitter";
import { FormsModule } from "@angular/forms";
import { FoldersComponent } from "./folders/folders.component";
import { SnippetsComponent } from "./snippets/snippets.component";
import { EditorComponent } from "./editor/editor.component";
import { ResponsiveModel } from "../../models/theme/responsive.model";

@Component({
  selector: "app-mainsplitter",
  standalone: true,
  imports: [
    SplitterModule,
    FormsModule,
    FoldersComponent,
    SnippetsComponent,
    EditorComponent,
  ],
  templateUrl: "./mainsplitter.component.html",
  styleUrl: "./mainsplitter.component.css",
})
export class MainsplitterComponent {}
