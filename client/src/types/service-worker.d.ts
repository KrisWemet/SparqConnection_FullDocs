interface ExtendedServiceWorkerGlobalScope extends ServiceWorkerGlobalScope {
  __WB_MANIFEST: Array<{
    revision: string | null;
    url: string;
  }>;
  workbox: any;
}

declare const self: ExtendedServiceWorkerGlobalScope;

interface SyncEvent extends ExtendableEvent {
  tag: string;
  lastChance: boolean;
}

interface CacheStrategy {
  cacheFirst: (request: Request) => Promise<Response>;
  networkFirst: (request: Request) => Promise<Response>;
  staleWhileRevalidate: (request: Request) => Promise<Response>;
}

declare const CACHE_STRATEGIES: CacheStrategy;

interface PushEventData {
  json(): any;
  text(): string;
  arrayBuffer(): ArrayBuffer;
}

interface PushEvent extends ExtendableEvent {
  data: PushEventData;
} 