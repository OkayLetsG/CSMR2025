import { Injectable, inject } from "@angular/core";
import { DbHelperService } from "../database/db-helper.service";
import { BehaviorSubject } from "rxjs";
import { PrimeIcons, TreeNode } from "primeng/api";
import { type Folder } from "../../models/main/base/folder.model";
import { type RawFolder } from "../../models/main/raw/raw.folder.model";
import { type AddFolder } from "../../models/main/base/addFolder.model";
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: "root",
})
export class FolderHelperService {

  /**
   * @member dbHelper
   * 
   * Injects the DbHelperService
   */
  private dbHelper = inject(DbHelperService);

  /**
   * @member _folders
   * 
   * BehaviorSubject for the folders
   */
  private _folders = new BehaviorSubject<TreeNode[]>([]);

  /**
   * @member folders$
   * 
   * Observable for the folders
   */
  folders$ = this._folders.asObservable();

  /**
   * @member isFoldersSortedAscending
   * 
   * Boolean to determine if the folders are sorted ascending
   */
  private isFoldersSortedAscending: boolean = true;

  /**
   * @member selectedFolder
   * 
   * The selected folder
   */
  selectedFolder: TreeNode | undefined = undefined;


  /**
   * @method getFolders
   * 
   * Gets all the folders
   */
  public async getFolders() : Promise<void> {
    if(!this.dbHelper.db) {
      await this.dbHelper.initializeDB();
    }

    try{
      const rawFolders = await this.dbHelper.executeQuery<RawFolder>(
        "SELECT FID, FNAME, FPARENT_ID, LKEY, LNAME, FLID, FGUID, FCREATED_AT, FMODIFIED_AT FROM FOLDERS, LANGUAGES WHERE FLID = LID ORDER BY FNAME ASC"
      );
      console.log("loaded folders: ",rawFolders);

      const folders: Folder[] = rawFolders.map((f) => ({
        Id: f.FID,
        Name: f.FNAME,
        ParentId: f.FPARENT_ID,
        Guid: f.FGUID,
        CreatedAt: f.FCREATED_AT,
        UpdatedAt: f.FMODIFIED_AT,
        DefaultLanguageKey: f.LKEY,
        DefaultLanguageName: f.LNAME,
        LanguageId: f.FLID
      } satisfies Folder));

      const folderTree = this.buildFolderTree(folders);
      console.log("folderTree: ", folderTree);
      console.log("mapped folders to Folder[]: ", folders);
      this.applyIcons(folderTree);
      this._folders.next(folderTree);
      this.sortFoldersASC(this.isFoldersSortedAscending);
    }
    catch(ex) {
      console.error(ex);
      this._folders.next([]);
    }
  }
   
  /**
   * 
   * @param newFolder 
   * @returns 
   * 
   * Adds a new folder
   */
  public async addFolder(newFolder: AddFolder): Promise<number> {
    return new Promise((resolve, reject) => {
      const guid = uuid();
      const timestamp: Date = new Date();
      const sql = 
        `INSERT INTO FOLDERS (FNAME, FPARENT_ID, FGUID, FLID, FCREATED_AT, FMODIFIED_AT) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      this.dbHelper.db
        .execute(sql, [newFolder.Name, newFolder.ParentId, guid, newFolder.LanguageId, timestamp, timestamp])
        .then((result: any) => {
          const newNode: TreeNode = {
            key: guid,
            label: newFolder.Name,
            data: {
              Id: result.lastInsertId,
              Name: newFolder.Name,
              ParentId: newFolder.ParentId,
              Guid: guid,
              DefaultLanguageKey: newFolder.LanguageKey,
              DefaultLanguageName: newFolder.LanguageName,
              LanguageId: newFolder.LanguageId,
              CreatedAt: timestamp,
              UpdatedAt: timestamp
            },
            children: [],
            expandedIcon: PrimeIcons.FOLDER_OPEN,
            collapsedIcon: PrimeIcons.FOLDER
          };
          this.addNodeToTree(newNode, newFolder.ParentId);
          this.isFoldersSortedAscending
            ? this.sortFoldersASC(this.isFoldersSortedAscending)
            : this.sortFoldersDESC(this.isFoldersSortedAscending);
          resolve(result.lastInsertId);
        })
        .catch((ex: any) => {
          console.error(ex);
          reject(ex);
        });
    });
  }

  /**
   * 
   * @param folderId 
   * @returns 
   * 
   * Deletes a folder
   */
  public async deleteFolder(folderId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM FOLDERS WHERE FID = ?`;
      this.dbHelper.db
        .execute(sql, [folderId])
        .then(() => {
          const updatedFolders = this.removeNodeFromTree(
            this._folders.getValue(),
            folderId
          );
          this._folders.next(updatedFolders);

          this.isFoldersSortedAscending
            ? this.sortFoldersASC(this.isFoldersSortedAscending)
            : this.sortFoldersDESC(this.isFoldersSortedAscending);

          resolve();
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }

  /**
   * 
   * @param folderId
   * @returns 
   * 
   * Updates a folder
   */
  public async changePropertiesFolder(folderId: number, newName?: string, languageId?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!newName && languageId === undefined) {
        resolve(); 
        return;
      }
  
      const fieldsToUpdate: string[] = [];
      const values: any[] = [];
  
      if (newName !== undefined) {
        fieldsToUpdate.push("FNAME = ?");
        values.push(newName);
      }
  
      if (languageId !== undefined) {
        fieldsToUpdate.push("FLID = ?");
        values.push(languageId);
      }
  
      const sql = `UPDATE FOLDERS SET ${fieldsToUpdate.join(", ")} WHERE FID = ?`;
      values.push(folderId);
  
      this.dbHelper.db
        .execute(sql, values)
        .then(() => {
          const updatedFolders = this.updateNodeInTree(
            this._folders.getValue(),
            folderId,
            newName
          );
          this._folders.next(updatedFolders);
  
          this.isFoldersSortedAscending
            ? this.sortFoldersASC(this.isFoldersSortedAscending)
            : this.sortFoldersDESC(this.isFoldersSortedAscending);
          resolve();
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }
  
  public async updateFolderParent(folderId: number, parentId: number|undefined): Promise<void> {
    return new Promise((resolve, reject) => {
      const parentIdToUpdate = parentId === undefined ? null : parentId;
      const sql = `UPDATE FOLDERS SET FPARENT_ID = ? WHERE FID = ?`;
      this.dbHelper.db
        .execute(sql, [parentIdToUpdate, folderId])
        .then(() => {
          const updatedFolders = this.updateNodeParentInTree(
            this._folders.getValue(),
            folderId,
            parentId
          );
          this._folders.next(updatedFolders);
  
          this.isFoldersSortedAscending
            ? this.sortFoldersASC(this.isFoldersSortedAscending)
            : this.sortFoldersDESC(this.isFoldersSortedAscending);
          resolve();
        })
        .catch((error: any) => {
          reject(error);
        })
    })
  }
  /**
   * 
   * @param folders 
   * @returns 
   * 
   * Builds the folder tree
   */

  private buildFolderTree(folders: Folder[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  const rootNodes: TreeNode[] = [];

  folders.forEach(f => {
    map.set(f.Id, {
      key: f.Guid,
      label: f.Name,
      data: f,
      children: []
    });
  });

  folders.forEach(f => {
    const node = map.get(f.Id)!;
    if (f.ParentId !== null) {
      const parentNode = map.get(f.ParentId);
      if (parentNode) {
        parentNode.children!.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  });

  return rootNodes;
}

  /**
   * 
   * @param nodes 
   * 
   * Applies the folder icons
   */
  private applyIcons (nodes: TreeNode[]) {
    nodes.forEach((node) => {
      node.expandedIcon = PrimeIcons.FOLDER_OPEN;
      node.collapsedIcon = PrimeIcons.FOLDER;

      if (node.children) {
        this.applyIcons(node.children);
      }
    });
  }

  /**
   * 
   * @param isFoldersSortedAscending  (true)
   * 
   * Sorts the folders ascended
   */
  public sortFoldersASC(isFoldersSortedAscending: boolean): void {
    this.isFoldersSortedAscending = isFoldersSortedAscending;
    const sortedTree = [...this._folders.value];
    this.sortTreeNodes(sortedTree, this.isFoldersSortedAscending);
    this._folders.next(sortedTree);
  }

  /**
   * 
   * @param isFoldersSortedAscending (false)
   * 
   * Sorts the folders descended
   */
  public sortFoldersDESC(isFoldersSortedAscending: boolean): void {
    this.isFoldersSortedAscending = isFoldersSortedAscending;
    const sortedTree = [...this._folders.value];
    this.sortTreeNodes(sortedTree, this.isFoldersSortedAscending);
    this._folders.next(sortedTree);
  }

  /**
   * 
   * @param nodes 
   * @param ascending 
   * 
   * Sorts the tree nodes
   */
  private sortTreeNodes(nodes: TreeNode[], ascending: boolean) {
    nodes.sort((a, b) => {
      const nameA = a?.label?.toLowerCase() ?? "";
      const nameB = b?.label?.toLowerCase() ?? "";
      return ascending
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        this.sortTreeNodes(node.children, ascending);
      }
    });
  }

  /**
   * 
   * @param newNode 
   * @param parentId 
   * 
   * Adds a new node to the tree
   */
  private addNodeToTree(newNode: TreeNode, parentId: number | null) {
    const currentTree = this._folders.value;
    console.log("currentTree: ", currentTree);

    if (parentId === null) {
      currentTree.push(newNode);
    } else {
      const parentNode = this.findNodeById(currentTree, parentId);
      if (parentNode) {
        parentNode.children?.push(newNode);
      }
    }
    this._folders.next(currentTree);
  }

  /**
   * 
   * @param nodes 
   * @param id 
   * @returns 
   * 
   * Finds a node by its id
   */
  private findNodeById(nodes: TreeNode[], id: number): TreeNode | null {
    for (const node of nodes) {
      if (node.data.Id === id) {
        return node;
      }
      if (node.children) {
        const found = this.findNodeById(node.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  /**
   * 
   * @param nodes 
   * @param folderId 
   * @returns 
   * 
   * Removes a node from the tree
   */
  private removeNodeFromTree(nodes: TreeNode[], folderId: number): TreeNode[] {
    return nodes
      .filter((node) => node.data.Id !== folderId)
      .map((node) => ({
        ...node,
        children: node.children
          ? this.removeNodeFromTree(node.children, folderId)
          : [],
      }));
  }

  /**
   * 
   * @param nodes 
   * @param folderId 
   * @param newName 
   * @returns 
   * 
   * Updates a node in the tree
   */
  private updateNodeInTree(
    nodes: TreeNode[],
    folderId: number,
    newName: string | undefined
  ): TreeNode[] {
    return nodes.map((node) => {
      if (node.data.Id === folderId) {
        return {
          ...node,
          label: newName,
          data: {
            ...node.data,
            Name: newName,
          },
        };
      }
      return {
        ...node,
        children: node.children
          ? this.updateNodeInTree(node.children, folderId, newName)
          : [],
      };
    });
  }

  private updateNodeParentInTree(nodes: TreeNode[], folderId: number, parentId: number | undefined): TreeNode[] {
    return nodes.map((node) => {
      if (node.data.Id === folderId) {
        return {
          ...node,
          data: {
            ...node.data,
            ParentId: parentId,
          },
        };
      }
      return {
        ...node,
        children: node.children
          ? this.updateNodeParentInTree(node.children, folderId, parentId)
          : [],
      };
    });
  } 
}
