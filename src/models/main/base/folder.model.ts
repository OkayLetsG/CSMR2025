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
  CreatedAt: Date;
  UpdatedAt: Date;
}
