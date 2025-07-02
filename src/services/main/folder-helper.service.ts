import { Injectable, inject } from "@angular/core";
import { DbHelperService } from "../database/db-helper.service";
import { BehaviorSubject } from "rxjs";
import { PrimeIcons, TreeNode } from "primeng/api";
import { type Folder } from "../../models/main/base/folder.model";
import { type RawFolder } from "../../models/main/raw/raw.folder.model";
import { type AddFolder } from "../../models/main/base/addFolder.model";
import { v4 as uuid } from 'uuid';
import { message } from '@tauri-apps/plugin-dialog';

@Injectable({
  providedIn: "root",
})
export class FolderHelperService {
  private dbHelper = inject(DbHelperService);
  private _folders = new BehaviorSubject<TreeNode[]>([]);
  folders$ = this._folders.asObservable();
  private isFoldersSortedAscending: boolean = true;
  selectedFolder: TreeNode | undefined = undefined;

  public async getFolders() : Promise<void> {
    if(!this.dbHelper.db) {
      await this.dbHelper.initializeDB();
    }

    try{
      const rawFolders = await this.dbHelper.executeQuery<RawFolder>(
        "SELECT FID, FNAME, FPARENT_ID, LKEY, LNAME, FLID, FGUID, FPIN ,FCREATED_AT, FMODIFIED_AT FROM FOLDERS, LANGUAGES WHERE FLID = LID ORDER BY FNAME ASC"
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
        LanguageId: f.FLID,
        Pinned: f.FPIN
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
      await message('Could not load folders: \n' + ex, { title: 'Error', kind: 'error' });
    }
  }
   
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
              UpdatedAt: timestamp,
              Pinned: 0
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

 public async updateFolderParents(foldersToMove: { folderId: number, parentId: number | undefined }[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE FOLDERS SET FPARENT_ID = CASE FID ${
      foldersToMove.map(({ folderId, parentId }) =>
        `WHEN ? THEN ${parentId === undefined ? 'NULL' : '?'}`
      ).join(' ')
    } END WHERE FID IN (${foldersToMove.map(() => '?').join(', ')})`;

    console.log('Generated SQL:', sql);

    const values: any[] = [];

    foldersToMove.forEach(({ folderId, parentId }) => {
      values.push(folderId);
      if (parentId !== undefined) {
        values.push(parentId);
      }
    });

    foldersToMove.forEach(({ folderId }) => {
      values.push(folderId);
    });

    this.dbHelper.db
      .execute(sql, values)
      .then(() => {
        const updatedTree = this.moveFoldersInTree(this._folders.getValue(), foldersToMove);
        this._folders.next(updatedTree);

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

public async Un_Pin_Folder(folderId: number, isPinned: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE FOLDERS SET FPIN = ? WHERE FID = ?`;
    const pinValue = !isPinned ? -1 : 0;

    this.dbHelper.db
      .execute(sql, [pinValue, folderId])
      .then(() => {
        const updatedTree = this.UnPinFolderInTree(this._folders.getValue(), folderId, isPinned);
        this._folders.next(updatedTree);

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


private UnPinFolderInTree(tree: TreeNode[], folderId: number, isPinned: boolean): TreeNode[] {
  const pinValue = !isPinned ? -1 : 0;

  const updateNode = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.map(node => {
      let updatedNode = { ...node };

      if (node.data.Id === folderId) {
        updatedNode = {
          ...updatedNode,
          data: {
            ...updatedNode.data,
            Pinned: pinValue
          }
        };
      }

      if (node.children && node.children.length > 0) {
        updatedNode.children = updateNode(node.children);
      }

      return updatedNode;
    });
  };
  return updateNode(tree);
}

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

  private applyIcons (nodes: TreeNode[]) {
    nodes.forEach((node) => {
      node.expandedIcon = PrimeIcons.FOLDER_OPEN;
      node.collapsedIcon = PrimeIcons.FOLDER;

      if (node.children) {
        this.applyIcons(node.children);
      }
    });
  }

  public sortFoldersASC(isFoldersSortedAscending: boolean): void {
    this.isFoldersSortedAscending = isFoldersSortedAscending;
    const sortedTree = [...this._folders.value];
    this.sortTreeNodes(sortedTree, this.isFoldersSortedAscending);
    this._folders.next(sortedTree);
  }

  public sortFoldersDESC(isFoldersSortedAscending: boolean): void {
    this.isFoldersSortedAscending = isFoldersSortedAscending;
    const sortedTree = [...this._folders.value];
    this.sortTreeNodes(sortedTree, this.isFoldersSortedAscending);
    this._folders.next(sortedTree);
  }

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
  
    private moveFoldersInTree(
    tree: TreeNode[],
    foldersToMove: { folderId: number; parentId: number | undefined }[]
  ): TreeNode[] {
    const allNodes = this.flattenTree(tree);
    const nodeMap = new Map<number, TreeNode>();

    allNodes.forEach(node => {
      nodeMap.set(node.data.Id, { ...node, children: [] });
    });

    foldersToMove.forEach(({ folderId, parentId }) => {
      const node = nodeMap.get(folderId);
      if (node) {
        node.data = { ...node.data, ParentId: parentId };
      }
    });

    const newTree: TreeNode[] = [];
    nodeMap.forEach(node => {
      const parentId = node.data.ParentId;
      if (parentId === undefined || !nodeMap.has(parentId)) {
        newTree.push(node); // Root node
      } else {
        const parent = nodeMap.get(parentId)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      }
    });

    return newTree;
  }

  private flattenTree(nodes: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = [];
    const stack = [...nodes];

    while (stack.length > 0) {
      const node = stack.pop()!;
      result.push(node);
      if (node.children) {
        stack.push(...node.children);
      }
    }

    return result;
  }

  private updateParentsNodeInTree(
    folders: TreeNode[],
    foldersToMove: { folderId: number; parentId: number | undefined }[]
  ): TreeNode[] {
    return folders.map((node) => {
      const folderToMove = foldersToMove.find((f) => f.folderId === node.data.Id);

      const updatedData = {
        ...node.data,
        ...(folderToMove ? { ParentId: folderToMove.parentId } : {})
      };

      const updatedChildren = node.children
        ? this.updateParentsNodeInTree(node.children, foldersToMove)
        : [];

      return {
        ...node,
        data: updatedData,
        children: updatedChildren
      };
    });
  }
}
