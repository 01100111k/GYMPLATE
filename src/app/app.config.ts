import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localePh from '@angular/common/locales/en-PH';
import { routes } from './app.routes';

registerLocaleData(localePh, 'en-PH');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    ),
    { provide: LOCALE_ID, useValue: 'en-PH' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'PHP' }
  ],
};
