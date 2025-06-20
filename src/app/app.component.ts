import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainsplitterComponent } from './mainsplitter/mainsplitter.component';
import { ResponsiveModel } from '../models/theme/responsive.model';
import { ResponsiveService } from '../services/theme/responsive.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MainsplitterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private responsiveService = inject(ResponsiveService);
  responsiveSize: ResponsiveModel = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  ngOnInit(): void {
    this.responsiveService.size$.subscribe((size) => {
      this.responsiveSize = size;
      console.log(this.responsiveSize);
    });
  }
}
