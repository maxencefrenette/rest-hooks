import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { ReactNode } from 'react';
import {
  State,
  reducer,
  ExternalCacheProvider,
  CacheProvider,
  Manager,
} from '../index';

// Extension of the DeepPartial type defined by Redux which handles unknown
type DeepPartialWithUnknown<T> = {
  [K in keyof T]?: T[K] extends unknown
    ? any
    : (T[K] extends object ? DeepPartialWithUnknown<T[K]> : T[K])
};

const makeExternalCacheProvider = (
  managers: Manager[],
  initialState?: DeepPartialWithUnknown<State<any>>,
) => {
  const store = createStore(
    reducer,
    initialState,
    applyMiddleware(...managers.map(manager => manager.getMiddleware())),
  );

  return ({ children }: { children: ReactNode }) => (
    <ExternalCacheProvider store={store} selector={s => s}>
      {children}
    </ExternalCacheProvider>
  );
};

const makeCacheProvider = (
  managers: Manager[],
  initialState?: State<unknown>,
) => {
  return ({ children }: { children: ReactNode }) => (
    <CacheProvider managers={managers} initialState={initialState}>
      {children}
    </CacheProvider>
  );
};

export { makeExternalCacheProvider, makeCacheProvider };
