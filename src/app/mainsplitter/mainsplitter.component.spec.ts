import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainsplitterComponent } from './mainsplitter.component';

describe('MainsplitterComponent', () => {
  let component: MainsplitterComponent;
  let fixture: ComponentFixture<MainsplitterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainsplitterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MainsplitterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
