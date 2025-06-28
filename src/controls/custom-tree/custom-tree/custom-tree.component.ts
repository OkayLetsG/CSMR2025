import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeNode } from 'primeng/api';
import { forwardRef } from "@angular/core";

interface DragData {
  node: TreeNode;
  sourceIndex: number;
  sourceParent: TreeNode | null;
}

@Component({
  selector: 'app-custom-tree',
  standalone: true,
  imports: [CommonModule, forwardRef(() => CustomTreeNodeComponent)],
  template: `
    <div class="custom-tree">
      <div *ngFor="let node of nodes; let i = index" 
           class="tree-node-wrapper">
        <div class="tree-node"
             [class.selected]="selectedNode?.key === node.key"
             [class.drag-over]="dragOverNode?.key === node.key"
             [class.dragging]="draggingNode?.key === node.key"
             draggable="true"
             (dragstart)="onDragStart($event, node, i, null)"
             (dragover)="onDragOver($event, node)"
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event, node, i, null)"
             (click)="selectNode(node)"
             [style.padding-left.px]="level * 20">
          
          <span class="node-icon" 
                *ngIf="node.children && node.children.length > 0"
                (click)="toggleNode(node)"
                [class.expanded]="node.expanded">
            <i class="pi" [class.pi-chevron-right]="!node.expanded" [class.pi-chevron-down]="node.expanded"></i>
          </span>
          
          <span class="node-icon" *ngIf="node.icon">
            <i [class]="node.icon"></i>
          </span>
          
          <span class="node-label">{{ node.label }}</span>
        </div>
        
        <!-- Drop zone between nodes -->
        <div class="drop-zone"
             [class.drop-zone-active]="dropZoneActive === getDropZoneId(i, null)"
             (dragover)="onDropZoneDragOver($event, i, null)"
             (dragleave)="onDropZoneDragLeave($event)"
             (drop)="onDropZoneDrop($event, i, null)">
        </div>
        
        <!-- Render children -->
        <div *ngIf="node.expanded && node.children" class="tree-children">
          <app-custom-tree-node 
            *ngFor="let child of node.children; let j = index"
            [node]="child"
            [index]="j" 
            [parent]="node"
            [level]="level + 1"
            [selectedNode]="selectedNode"
            [draggingNode]="draggingNode"
            [dragOverNode]="dragOverNode"
            [dropZoneActive]="dropZoneActive"
            (nodeSelect)="selectNode($event)"
            (nodeDragStart)="onChildDragStart($event)"
            (nodeDragOver)="onChildDragOver($event)"
            (nodeDragLeave)="onChildDragLeave($event)"
            (nodeDrop)="onChildDrop($event)"
            (dropZoneDragOver)="onChildDropZoneDragOver($event)"
            (dropZoneDragLeave)="onChildDropZoneDragLeave($event)"
            (dropZoneDrop)="onChildDropZoneDrop($event)"
            (toggleNode)="toggleNode($event)">
          </app-custom-tree-node>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-tree {
      font-family: Arial, sans-serif;
      user-select: none;
    }
    
    .tree-node {
      display: flex;
      align-items: center;
      padding: 8px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
      min-height: 36px;
    }
    
    .tree-node:hover {
      background-color: #f5f5f5;
    }
    
    .tree-node.selected {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    
    .tree-node.dragging {
      opacity: 0.5;
      background-color: #fff3e0;
    }
    
    .tree-node.drag-over {
      background-color: #e8f5e8;
      border: 2px dashed #4caf50;
    }
    
    .node-icon {
      display: flex;
      align-items: center;
      margin-right: 8px;
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
    
    .node-icon.expanded {
      transform: rotate(90deg);
    }
    
    .node-label {
      flex: 1;
      font-size: 14px;
    }
    
    .drop-zone {
      height: 4px;
      margin: 2px 0;
      transition: all 0.2s;
    }
    
    .drop-zone-active {
      background-color: #2196f3;
      border-radius: 2px;
      height: 8px;
      margin: 4px 0;
    }
    
    .tree-children {
      margin-left: 0;
    }
  `]
})


export class CustomTreeComponent implements OnInit {
  @Input() nodes: TreeNode[] = [];
  @Input() level: number = 0;
  @Input() selectedNode: TreeNode | null = null;
  @Output() nodeSelect = new EventEmitter<TreeNode>();
  @Output() nodeMove = new EventEmitter<{dragNode: TreeNode, dropNode: TreeNode | null, dropIndex: number}>();
  
  draggingNode: TreeNode | null = null;
  dragOverNode: TreeNode | null = null;
  dropZoneActive: string | null = null;
  dragData: DragData | null = null;
  
  ngOnInit() {
    // Initialize expanded state for nodes with children
    this.initializeNodes(this.nodes);
  }
  
  private initializeNodes(nodes: TreeNode[]) {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        if (node.expanded === undefined) {
          node.expanded = false;
        }
        this.initializeNodes(node.children);
      }
    });
  }
  
  selectNode(node: TreeNode) {
    this.selectedNode = node;
    this.nodeSelect.emit(node);
  }
  
  toggleNode(node: TreeNode) {
    node.expanded = !node.expanded;
  }
  
  onDragStart(event: DragEvent, node: TreeNode, index: number, parent: TreeNode | null) {
    this.draggingNode = node;
    this.dragData = {
      node: node,
      sourceIndex: index,
      sourceParent: parent
    };
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', node.key || '');
    }
  }
  
  onDragOver(event: DragEvent, node: TreeNode) {
    if (this.canDropOnNode(node)) {
      event.preventDefault();
      this.dragOverNode = node;
    }
  }
  
  onDragLeave(event: DragEvent) {
    this.dragOverNode = null;
  }
  
  onDrop(event: DragEvent, dropNode: TreeNode, dropIndex: number, dropParent: TreeNode | null) {
    event.preventDefault();
    
    if (this.dragData && this.canDropOnNode(dropNode)) {
      // Move node to be a child of dropNode
      this.moveNode(this.dragData, dropNode, 0, dropNode);
      this.resetDragState();
    }
  }
  
  onDropZoneDragOver(event: DragEvent, index: number, parent: TreeNode | null) {
    event.preventDefault();
    this.dropZoneActive = this.getDropZoneId(index, parent);
  }
  
  onDropZoneDragLeave(event: DragEvent) {
    this.dropZoneActive = null;
  }
  
  onDropZoneDrop(event: DragEvent, index: number, parent: TreeNode | null) {
    event.preventDefault();
    
    if (this.dragData) {
      this.moveNode(this.dragData, null, index, parent);
      this.resetDragState();
    }
  }
  
  private canDropOnNode(node: TreeNode): boolean {
    if (!this.dragData) return false;
    
    // Can't drop on itself
    if (this.dragData.node === node) return false;
    
    // Can't drop on its own children
    return !this.isNodeDescendant(node, this.dragData.node);
  }
  
  private isNodeDescendant(node: TreeNode, ancestor: TreeNode): boolean {
    if (!ancestor.children) return false;
    
    for (const child of ancestor.children) {
      if (child === node) return true;
      if (this.isNodeDescendant(node, child)) return true;
    }
    return false;
  }
  
  private moveNode(dragData: DragData, dropNode: TreeNode | null, dropIndex: number, dropParent: TreeNode | null) {
    // Remove from source
    if (dragData.sourceParent) {
      dragData.sourceParent.children = dragData.sourceParent.children?.filter(n => n !== dragData.node) || [];
    } else {
      this.nodes = this.nodes.filter(n => n !== dragData.node);
    }
    
    // Add to destination
    if (dropNode) {
      // Drop on a node - make it a child
      if (!dropNode.children) {
        dropNode.children = [];
      }
      dropNode.children.splice(dropIndex, 0, dragData.node);
      dropNode.expanded = true; // Expand to show the new child
    } else if (dropParent) {
      // Drop in a specific position within a parent
      if (!dropParent.children) {
        dropParent.children = [];
      }
      dropParent.children.splice(dropIndex, 0, dragData.node);
    } else {
      // Drop at root level
      this.nodes.splice(dropIndex, 0, dragData.node);
    }
    
    // Emit the move event
    this.nodeMove.emit({
      dragNode: dragData.node,
      dropNode: dropNode,
      dropIndex: dropIndex
    });
  }
  
  private resetDragState() {
    this.draggingNode = null;
    this.dragOverNode = null;
    this.dropZoneActive = null;
    this.dragData = null;
  }
  
  getDropZoneId(index: number, parent: TreeNode | null): string {
    return `${parent?.key || 'root'}-${index}`;
  }
  
  // Event handlers for child nodes
  onChildDragStart(event: any) {
    this.draggingNode = event.node;
    this.dragData = event;
  }
  
  onChildDragOver(event: any) {
    this.dragOverNode = event.node;
  }
  
  onChildDragLeave(event: any) {
    this.dragOverNode = null;
  }
  
  onChildDrop(event: any) {
    if (this.dragData) {
      this.moveNode(this.dragData, event.dropNode, event.dropIndex, event.dropParent);
      this.resetDragState();
    }
  }
  
  onChildDropZoneDragOver(event: any) {
    this.dropZoneActive = event.dropZoneId;
  }
  
  onChildDropZoneDragLeave(event: any) {
    this.dropZoneActive = null;
  }
  
  onChildDropZoneDrop(event: any) {
    if (this.dragData) {
      this.moveNode(this.dragData, null, event.index, event.parent);
      this.resetDragState();
    }
  }
}

// Child component for recursive rendering
@Component({
  selector: 'app-custom-tree-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tree-node"
         [class.selected]="selectedNode?.key === node.key"
         [class.drag-over]="dragOverNode?.key === node.key"
         [class.dragging]="draggingNode?.key === node.key"
         draggable="true"
         (dragstart)="onDragStart($event)"
         (dragover)="onDragOver($event)"
         (dragleave)="onDragLeave($event)"
         (drop)="onDrop($event)"
         (click)="selectNode(node)"
         [style.padding-left.px]="level * 20">
      
      <span class="node-icon" 
            *ngIf="node.children && node.children.length > 0"
            (click)="toggle()"
            [class.expanded]="node.expanded">
        <i class="pi" [class.pi-chevron-right]="!node.expanded" [class.pi-chevron-down]="node.expanded"></i>
      </span>
      
      <span class="node-icon" *ngIf="node.icon">
        <i [class]="node.icon"></i>
      </span>
      
      <span class="node-label">{{ node.label }}</span>
    </div>
    
    <!-- Drop zone -->
    <div class="drop-zone"
         [class.drop-zone-active]="dropZoneActive === getDropZoneId()"
         (dragover)="onDropZoneDragOver($event)"
         (dragleave)="onDropZoneDragLeave($event)"
         (drop)="onDropZoneDrop($event)">
    </div>
    
    <!-- Children -->
    <div *ngIf="node.expanded && node.children" class="tree-children">
      <app-custom-tree-node 
        *ngFor="let child of node.children; let i = index"
        [node]="child"
        [index]="i" 
        [parent]="node"
        [level]="level + 1"
        [selectedNode]="selectedNode"
        [draggingNode]="draggingNode"
        [dragOverNode]="dragOverNode"
        [dropZoneActive]="dropZoneActive"
        (nodeSelect)="nodeSelect.emit($event)"
        (nodeDragStart)="nodeDragStart.emit($event)"
        (nodeDragOver)="nodeDragOver.emit($event)"
        (nodeDragLeave)="nodeDragLeave.emit($event)"
        (nodeDrop)="nodeDrop.emit($event)"
        (dropZoneDragOver)="dropZoneDragOver.emit($event)"
        (dropZoneDragLeave)="dropZoneDragLeave.emit($event)"
        (dropZoneDrop)="dropZoneDrop.emit($event)"
        (toggleNode)="toggleNode.emit($event)">
      </app-custom-tree-node>
    </div>
  `,
  styles: [`
    .tree-node {
      display: flex;
      align-items: center;
      padding: 8px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
      min-height: 36px;
    }
    
    .tree-node:hover {
      background-color: #f5f5f5;
    }
    
    .tree-node.selected {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    
    .tree-node.dragging {
      opacity: 0.5;
      background-color: #fff3e0;
    }
    
    .tree-node.drag-over {
      background-color: #e8f5e8;
      border: 2px dashed #4caf50;
    }
    
    .node-icon {
      display: flex;
      align-items: center;
      margin-right: 8px;
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
    
    .node-icon.expanded {
      transform: rotate(90deg);
    }
    
    .node-label {
      flex: 1;
      font-size: 14px;
    }
    
    .drop-zone {
      height: 4px;
      margin: 2px 0;
      transition: all 0.2s;
    }
    
    .drop-zone-active {
      background-color: #2196f3;
      border-radius: 2px;
      height: 8px;
      margin: 4px 0;
    }
    
    .tree-children {
      margin-left: 0;
    }
  `]
})
export class CustomTreeNodeComponent {
  @Input() node!: TreeNode;
  @Input() index!: number;
  @Input() parent!: TreeNode;
  @Input() level!: number;
  @Input() selectedNode: TreeNode | null = null;
  @Input() draggingNode: TreeNode | null = null;
  @Input() dragOverNode: TreeNode | null = null;
  @Input() dropZoneActive: string | null = null;
  
  @Output() nodeSelect = new EventEmitter<TreeNode>();
  @Output() nodeDragStart = new EventEmitter<DragData>();
  @Output() nodeDragOver = new EventEmitter<{node: TreeNode}>();
  @Output() nodeDragLeave = new EventEmitter<void>();
  @Output() nodeDrop = new EventEmitter<{dropNode: TreeNode, dropIndex: number, dropParent: TreeNode}>();
  @Output() dropZoneDragOver = new EventEmitter<{dropZoneId: string}>();
  @Output() dropZoneDragLeave = new EventEmitter<void>();
  @Output() dropZoneDrop = new EventEmitter<{index: number, parent: TreeNode}>();
  @Output() toggleNode = new EventEmitter<TreeNode>();
  
  onDragStart(event: DragEvent) {
    this.nodeDragStart.emit({
      node: this.node,
      sourceIndex: this.index,
      sourceParent: this.parent
    });
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', this.node.key || '');
    }
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.nodeDragOver.emit({node: this.node});
  }
  
  onDragLeave(event: DragEvent) {
    this.nodeDragLeave.emit();
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.nodeDrop.emit({
      dropNode: this.node,
      dropIndex: 0,
      dropParent: this.node
    });
  }
  
  onDropZoneDragOver(event: DragEvent) {
    event.preventDefault();
    this.dropZoneDragOver.emit({dropZoneId: this.getDropZoneId()});
  }
  
  onDropZoneDragLeave(event: DragEvent) {
    this.dropZoneDragLeave.emit();
  }
  
  onDropZoneDrop(event: DragEvent) {
    event.preventDefault();
    this.dropZoneDrop.emit({
      index: this.index + 1,
      parent: this.parent
    });
  }
  
  getDropZoneId(): string {
    return `${this.parent?.key || 'root'}-${this.index + 1}`;
  }
  
  toggle() {
    this.node.expanded = !this.node.expanded;
    this.toggleNode.emit(this.node);
  }

  selectNode(node: TreeNode) {
    this.nodeSelect.emit(node);
  }
}
