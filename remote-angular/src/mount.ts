import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';


export const mountAngular = (el: HTMLElement) => {
  const appRoot = document.createElement('app-root');
  el.appendChild(appRoot);

  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
};
