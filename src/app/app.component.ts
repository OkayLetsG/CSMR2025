import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainsplitterComponent } from './mainsplitter/mainsplitter.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MainsplitterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
 
}
