// ══════════════════════════════════════════════════════
//  RVS GESTOR — Service Worker v1
//  ESTRATÉGIA DE CACHE:
//  ✅ Cache-First  → Arquivos estáticos do sistema
//  🌐 Network-Only → Supabase, Google APIs (banco de dados)
//  📵 Offline Page → Tela amigável quando sem internet
// ══════════════════════════════════════════════════════

const CACHE_NAME = 'rvs-gestor-v1';

// Arquivos estáticos que serão cacheados (carregados offline)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/assets/logo.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/offline.html'
];

// ── URLs que NUNCA devem ser interceptadas (vão sempre para a rede) ──
// Supabase, Google APIs, CDNs de terceiros
const NETWORK_ONLY_PATTERNS = [
  'supabase.co',
  'supabase.io',
  'script.google.com',
  'googleusercontent.com',
  'googleapis.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'esm.sh'
];

function isNetworkOnly(url) {
  return NETWORK_ONLY_PATTERNS.some(pattern => url.includes(pattern));
}

// ── INSTALL: Pré-carrega os assets estáticos no cache ──
self.addEventListener('install', event => {
  console.log('[SW] Instalando RVS Gestor v1...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        // Não deixa o install falhar se algum asset não existir ainda
        console.warn('[SW] Alguns assets não foram cacheados:', err);
      });
    })
  );
  // Ativa imediatamente sem esperar abas antigas fecharem
  self.skipWaiting();
});

// ── ACTIVATE: Remove caches de versões antigas ──
self.addEventListener('activate', event => {
  console.log('[SW] Ativando e limpando caches antigos...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Removendo cache antigo:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: Estratégia inteligente de cache ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = request.url;

  // 1. Ignora requisições que não são GET
  if (request.method !== 'GET') return;

  // 2. NETWORK ONLY — Banco de dados e APIs externas → sempre vai para a rede
  if (isNetworkOnly(url)) {
    event.respondWith(fetch(request));
    return;
  }

  // 3. CACHE FIRST com fallback para rede — Assets estáticos do sistema
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        // Atualiza o cache em background (stale-while-revalidate)
        fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, networkResponse));
          }
        }).catch(() => {}); // silencioso se offline
        return cachedResponse;
      }

      // Não está no cache → vai para a rede
      return fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.ok && request.url.startsWith('http')) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // Completamente offline → mostra página de offline
        if (request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// ── MESSAGE: Permite forçar update via app ──
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
