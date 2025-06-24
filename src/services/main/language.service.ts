import { Injectable, inject } from "@angular/core";
import { DbHelperService } from "../database/db-helper.service";
import { type Language } from "../../models/main/base/language.model";
import { type RawLanguage } from "../../models/main/raw/raw.language.model";
import { BehaviorSubject } from "rxjs";
import { TreeNode } from "primeng/api";

@Injectable({
  providedIn: "root",
})
export class LanguageService {
  private dbHelper = inject(DbHelperService);
  private _languages = new BehaviorSubject<Language[]>([]);
  languages$ = this._languages.asObservable();
  private _availableLanguagesAsTreeNodes = new BehaviorSubject<TreeNode[]>([]);
  availableLanguagesAsTreeNodes$ = this._availableLanguagesAsTreeNodes.asObservable();

  public async loadLanguages(): Promise<void> {
    if (!this.dbHelper.db) {
      await this.dbHelper.initializeDB();
    }

    try {
      const rawLanguages = await this.dbHelper.executeQuery<RawLanguage>(
        "SELECT LID, LKEY, LNAME, LSHOW, LALLOW_DELETE, LCREATED_AT, LMODIFIED_AT FROM LANGUAGES ORDER BY LSHOW DESC, LKEY, LNAME ASC"
      );
      console.log("loaded languages: ", rawLanguages);
      const languages: Language[] = rawLanguages.map(
        (l) =>
          ({
            Id: l.LID,
            Key: l.LKEY,
            Name: l.LNAME,
            Show: l.LSHOW,
            AllowDelete: l.LALLOW_DELETE,
            CreatedAt: l.LCREATED_AT,
            ModifiedAt: l.LMODIFIED_AT,
          } satisfies Language)
      );
      this._languages.next(languages);
      this.mapLanguagesToTreeNodes(languages);
    } catch (error) {
      console.error(error);
    }
  }

  public mapLanguagesToTreeNodes(languages: Language[]) {
    const mappedLanguages = languages.map((l) => ({label: l.Id + " | " + l.Name + " (" + l.Key + ")", data: l, children: []} as TreeNode)).filter((l) => l.data.Show === -1);
    this._availableLanguagesAsTreeNodes.next(mappedLanguages);
  }
}
