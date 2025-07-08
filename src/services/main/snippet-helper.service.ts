import { Injectable, inject } from "@angular/core";
import { DbHelperService } from "../database/db-helper.service";
import { BehaviorSubject } from "rxjs";
import { type Snippet } from "../../models/main/base/snippet.model";
import { type RawSnippet } from "../../models/main/raw/raw.snippet.model";

@Injectable({
  providedIn: "root",
})
export class SnippetHelperService {
  private dbHelper = inject(DbHelperService);
  private _snippets = new BehaviorSubject<Snippet[]>([]);
  snippets$ = this._snippets.asObservable();

  public async loadSnippets(folderId: number) : Promise<void> {
    if(!this.dbHelper.db) {
      await this.dbHelper.initializeDB();
    }
    
  }
}
