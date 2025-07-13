import { Injectable, inject } from "@angular/core";
import { DbHelperService } from "../database/db-helper.service";
import { BehaviorSubject } from "rxjs";
import { type Snippet } from "../../models/main/base/snippet.model";
import { type RawSnippet } from "../../models/main/raw/raw.snippet.model";
import { v4 as uuid } from "uuid";
import { message } from "@tauri-apps/plugin-dialog";
import { Folder } from "../../models/main/base/folder.model";

@Injectable({
  providedIn: "root",
})
export class SnippetHelperService {
  private dbHelper = inject(DbHelperService);
  private _snippets = new BehaviorSubject<Snippet[]>([]);
  snippets$ = this._snippets.asObservable();

  public async loadSnippets(folderId: number): Promise<void> {
    if (!this.dbHelper.db) {
      await this.dbHelper.initializeDB();
    }
    try {
      const sql = `SELECT
        SID,
        STITLE,
        SCREATED_AT,
        SMODIFIED_AT,
        SFID,
        LNAME,
        SLID,
        LKEY,
        LNAME,
        SORDER,
        SGUID
      FROM SNIPPETS, LANGUAGES WHERE SFID = ${folderId} AND SLID = LID ORDER BY SORDER ASC`;

      const rawSnippets = await this.dbHelper.executeQuery<RawSnippet>(sql);
      const snippets: Snippet[] = rawSnippets.map(
        (s) =>
          ({
            Id: s.SID,
            Title: s.STITLE,
            CreatedAt: s.SCREATED_AT,
            ModifiedAt: s.SMODIFIED_AT,
            FolderId: s.SFID,
            LanguageKey: s.LKEY,
            LanguageId: s.SLID,
            Order: s.SORDER,
            Guid: s.SGUID,
            LanguageName: s.LNAME,
          } satisfies Snippet)
      );
      this._snippets.next(snippets);
    } catch (error) {
      this._snippets.next([]);
      await message("Could not load snippets: \n" + error, {
        title: "Error",
        kind: "error",
      });
    }
  }


  public async addSnippet(folder: Folder,folderFromSelectedNode: Folder ,snippetTitle: string): Promise<void> {
    try {
      const guid = uuid();
      const timestamp: Date = new Date();
  
      const sql = `
        INSERT INTO SNIPPETS (STITLE, SFID, SGUID, SCREATED_AT, SMODIFIED_AT, SLID, SORDER)
        SELECT
          '${snippetTitle}' as TITLE,
          ${folderFromSelectedNode.Id} as FOLDER_ID,
          '${guid}' as GUID,
          '${timestamp.toISOString()}' as CREATED_AT,
          '${timestamp.toISOString()}' as MODIFIED_AT,
          (SELECT FLID FROM FOLDERS WHERE FID = ${folder.Id} LIMIT 1),
          COALESCE((SELECT MAX(SORDER) + 1 FROM SNIPPETS WHERE SFID = ${folder.Id}), 1)
      `;
  
      const result: any = await this.dbHelper.db.execute(sql);
      const orderNumber = await this.getNewOrderNumber(folder.Id);
      const newSnippet: Snippet = {
        Id: result.lastInsertId,
        Title: snippetTitle,
        CreatedAt: timestamp,
        ModifiedAt: timestamp,
        FolderId: folder.Id,
        LanguageId: folder.LanguageId,
        LanguageKey: folder.DefaultLanguageKey,
        LanguageName: folder.DefaultLanguageName,
        Order: orderNumber,
        Guid: guid
      };
      const current = this._snippets.value;
      if(folder.Id === folderFromSelectedNode.Id) {
        this._snippets.next([...current, newSnippet]);
      }
    } catch (error: any) {
      await message("Could not add snippet: \n" + error, { title: "Error", kind: "error" });
      throw error;
    }
  }

  private async getNewOrderNumber(folderIdFromService: number): Promise<number> {
    try {
      const sql = `
        SELECT COALESCE(MAX(SORDER), 1) AS NEXT_ORDER
        FROM SNIPPETS
        WHERE SFID = ?
      `;
      const result = await this.dbHelper.db.select(sql, [folderIdFromService]) as { NEXT_ORDER: number }[];
  
      return result.length > 0 && result[0].NEXT_ORDER ? result[0].NEXT_ORDER : 1;
    } catch (error) {
      console.error("Failed to get new order number:", error);
      await message("Failed to get new order number::\n" + error, {
        title: "Fehler",
        kind: "error"
      });
      return 1;
    }
  } 
}
