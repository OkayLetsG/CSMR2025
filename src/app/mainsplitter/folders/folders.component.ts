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
import { DropdownModule } from 'primeng/dropdown';
import { TreeNode, MessageService, MenuItem } from "primeng/api";

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
    DropdownModule
  ],
  templateUrl: "./folders.component.html",
  styleUrl: "./folders.component.css",
})
export class FoldersComponent {}
