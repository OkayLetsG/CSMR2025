import { Injectable, OnInit, NgZone, inject } from "@angular/core";
import { BehaviorSubject, fromEvent } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { ResponsiveModel } from "../../models/theme/responsive.model";

@Injectable({
  providedIn: "root",
})
export class ResponsiveService {
  private zone = inject(NgZone);
  private _size = new BehaviorSubject<ResponsiveModel>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  size$ = this._size.asObservable();

  constructor() {
    this.zone.runOutsideAngular(() => {
      fromEvent(window, "resize")
        .pipe(debounceTime(100))
        .subscribe(() => {
          const width = window.innerWidth;
          const height = window.innerHeight;

          this.zone.run(() => {
            this._size.next({ width, height });
          });
        });
    });
  }
}
