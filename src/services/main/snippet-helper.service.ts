import { Injectable, inject } from "@angular/core";
import { DbHelperService } from "../database/db-helper.service";
import { BehaviorSubject } from "rxjs";
import { type Snippet } from "../../models/main/base/snippet.model";
import { type RawSnippet } from "../../models/main/raw/raw.snippet.model";
import { v4 as uuid } from "uuid";
import { message } from "@tauri-apps/plugin-dialog";

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
        SLNAME,
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

  public async addSnippet(folderId: number, title: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const guid = uuid();
      const timestamp: Date = new Date();
      const sql = `
        INSERT INTO SNIPPETS (STITLE, SFID, SGUID, SCREATED_AT, SMODIFIED_AT, SLID, SORDER)
        SELECT
          '${title}' as TITLE,
          ${folderId} as FOLDER_ID,
          '${guid}' as GUID,
          '${timestamp.toISOString()}' as CREATED_AT,
          '${timestamp.toISOString()}' as MODIFIED_AT,
          (SELECT FLID FROM FOLDERS WHERE FID = ${folderId} LIMIT 1),
          COALESCE((SELECT MAX(SORDER) + 1 FROM SNIPPETS WHERE SFID = ${folderId}), 1)
        `;
        this.dbHelper.db
          .execute(sql)
          .then((result: any) => {
            resolve(result.lastInsertId);
          })
          .catch((error: any) => {
            message('Could not add snippet: \n' + error, { title: 'Error', kind: 'error' });
            reject(error);
          })
    });
  }
}
