import 'zone.js';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { providePrimeNG } from 'primeng/config';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';

registerLocaleData(localePt, 'pt-BR');

/** Sakai's Aura foundation with the established Orfina violet identity. */
const OrfinaSakaiPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{violet.50}', 100: '{violet.100}', 200: '{violet.200}', 300: '{violet.300}', 400: '{violet.400}',
      500: '{violet.500}', 600: '{violet.600}', 700: '{violet.700}', 800: '{violet.800}', 900: '{violet.900}', 950: '{violet.950}',
    },
  },
});

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    // Sakai 20 is built on PrimeNG's Aura preset. The application keeps its
    // own semantic tokens, while PrimeNG owns light/dark palette generation.
    providePrimeNG({ theme: { preset: OrfinaSakaiPreset, options: { darkModeSelector: '.app-dark' } } }),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
}).catch((error: unknown) => console.error(error));
