import { inject, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { RawFragment } from "../../models/main/raw/raw.fragment.model";
import { Fragment } from "../../models/main/base/fragment.model";
import { DbHelperService } from "../database/db-helper.service";
import { Snippet } from "../../models/main/base/snippet.model";
import { message } from '@tauri-apps/plugin-dialog';
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: "root",
})
export class FragmentHelperService {
  private dbHelper = inject(DbHelperService);
  private _fragments = new BehaviorSubject<Fragment[]>([]);
  fragments$ = this._fragments.asObservable();

  public async loadFragments(snippet: Snippet): Promise<void> {
    if (!this.dbHelper.db) {
      await this.dbHelper.initializeDB();
    }

    try {
      const rawFragments = await this.dbHelper.executeQuery<RawFragment>(
        `SELECT FRID, FRSID, FRNAME, FRCONTENT, FRCREATED_AT, FRMODIFIED_AT, FRGUID FROM FRAGMENTS WHERE FRSID = ${snippet.Id}`
      );
      console.log("loaded fragments: ", rawFragments);

      const fragment: Fragment[] = rawFragments.map((f) => ({
        Id: f.FRID,
        SnippetId: f.FRSID,
        Name: f.FRNAME,
        Content: f.FRCONTENT,
        CreatedAt: f.FRCREATED_AT,
        ModifiedAt: f.FRMODIFIED_AT,
        Guid: f.FRGUID
      }satisfies Fragment));

      this._fragments.next(fragment);
    } catch (error) {
      await message("Could not load fragments: \n" + error, {
        title: "Error",
        kind: "error"
      });
      throw error;
    }
  }

  public async addFragment(fragment: Fragment): Promise<void> {
    try {
      const sql = `INSERT INTO FRAGMENTS (FRSID, FRNAME, FRCONTENT, FRCREATED_AT, FRMODIFIED_AT, FRGUID) VALUES (?, ?, ?, ?, ?, ?)`;
      const guid = uuid(); 
      await this.dbHelper.db.execute(sql, [fragment.SnippetId, fragment.Name, fragment.Content, fragment.CreatedAt, fragment.ModifiedAt, fragment.Guid]);
      const current = this._fragments.value;
      const updatedFragments = [...current, fragment];
      this._fragments.next(updatedFragments);
    } catch (error: any) {
      await message("Could not add fragment: \n" + error, {
        title: "Error",
        kind: "error"
      });
      throw error;
    }
  }

  public async deleteFragment(fragment: Fragment): Promise<void> {
    try {
      const sql = `DELETE FROM FRAGMENTS WHERE FRID = ${fragment.Id}`; 
      await this.dbHelper.db.execute(sql);
      const current = this._fragments.value;
      const updatedFragments = current.filter(f => f.Id !== fragment.Id);
      this._fragments.next(updatedFragments);
    } catch (error: any) {
      await message("Could not delete fragment: \n" + error, {
        title: "Error",
        kind: "error"
      });
      throw error;
    }
  }

  public async updateContent (fragment: Fragment, code: string): Promise<void> {
    try {
      const sql = `UPDATE FRAGMENTS SET FRCONTENT = ? WHERE FRID = ?`; 
      await this.dbHelper.db.execute(sql, [code, fragment.Id]);
    } catch (error: any) {
      await message("Could not update fragment: \n" + error, {
        title: "Error",
        kind: "error"
      });
      throw error;
    }
  }

  public async updateFields (fragment: Fragment, name: string) {
    try {
      const sql = `UPDATE FRAGMENTS SET FRNAME = ? WHERE FRID = ?`; 
      await this.dbHelper.db.execute(sql, [name, fragment.Id]);
      const current = this._fragments.value;
      const updatedFragment = current.find(f => f.Id === fragment.Id);
      if (updatedFragment) {
        updatedFragment.Name = name;
      }
      this._fragments.next(current);
    } catch (error: any) {
      await message("Could not update fragment: \n" + error, {
        title: "Error",
        kind: "error"
      });
      throw error;
    }
  }
}

