import { describe, expect, it } from 'vitest';
import { productRoutes as appRoutes } from './app.routes';

describe('appRoutes', () => {
  it('mounts product URLs through lazy standalone content', () => {
    const productRoutes = appRoutes.filter((route) => route.path && route.path !== '' && route.path !== '**');

    expect(productRoutes).toHaveLength(29);
    expect(productRoutes.every((route) => typeof route.loadComponent === 'function')).toBe(true);

    const overview = productRoutes.find((route) => route.path === 'visao-geral');
    expect(overview?.data?.['view']).toBe('overview');
    expect(overview?.loadComponent).toBeTypeOf('function');
  });
});
