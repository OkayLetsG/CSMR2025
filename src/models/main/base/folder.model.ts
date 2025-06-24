/**
 * @interface Folder
 * 
 * Can be imported as a type.
 * Defines the data structure of a single folder.
 */
export interface Folder {
  Id: number;
  Name: string;
  ParentId: number;
  Guid: string;
  DefaultLanguageKey: string;
  DefaultLanguageName: string;
  LanguageId : number;
  CreatedAt: Date;
  UpdatedAt: Date;
}
