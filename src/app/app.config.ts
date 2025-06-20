import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideMonacoEditor } from "ngx-monaco-editor-v2";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideMonacoEditor(), provideAnimations()],
};
