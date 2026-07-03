// ══════════════════════════════════════════════════════
//  RVS GESTOR — Service Worker v2
//  ESTRATÉGIA DE CACHE:
//  ✅ Cache-First    → Arquivos estáticos do sistema
//  🌐 Network-Only  → Supabase, Google APIs (banco de dados)
//  📵 Offline Page  → Tela amigável quando sem internet
//  🔄 BG Sync       → Sincroniza fila offline automaticamente
// ══════════════════════════════════════════════════════

const CACHE_NAME    = 'rvs-gestor-v10';
const SYNC_TAG_FREQ = 'rvs-sync-frequencias';

// Arquivos estáticos que serão cacheados (carregados offline)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/pdf.min.js',
  '/js/pdf.worker.min.js',
  '/js/pdf-lib.min.js',
  '/assets/logo.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/offline.html',
  '/topodosaber.html'
];

// ── URLs que NUNCA devem ser interceptadas (vão sempre para a rede) ──
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
  return NETWORK_ONLY_PATTERNS.some(p => url.includes(p));
}

// ── INSTALL ──
self.addEventListener('install', event => {
  console.log('[SW] Instalando RVS Gestor v2...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(STATIC_ASSETS).catch(err =>
        console.warn('[SW] Alguns assets não cacheados:', err)
      )
    )
  );
  self.skipWaiting();
});

// ── ACTIVATE ──
self.addEventListener('activate', event => {
  console.log('[SW] Ativando v2, limpando caches antigos...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Removendo cache antigo:', k);
          return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = request.url;

  if (request.method !== 'GET') return;
  if (isNetworkOnly(url)) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        // Atualiza em background (stale-while-revalidate)
        fetch(request).then(net => {
          if (net && net.ok)
            caches.open(CACHE_NAME).then(c => c.put(request, net));
        }).catch(() => {});
        return cached;
      }
      return fetch(request).then(net => {
        if (net && net.ok && url.startsWith('http')) {
          caches.open(CACHE_NAME).then(c => c.put(request, net.clone()));
        }
        return net;
      }).catch(() => {
        if (request.headers.get('accept')?.includes('text/html'))
          return caches.match('/offline.html');
      });
    })
  );
});

// ── BACKGROUND SYNC ─────────────────────────────────────────────────────────
// Disparado automaticamente pelo navegador quando a conexão é restaurada,
// mesmo que o app esteja fechado. Avisa todas as abas abertas para
// sincronizarem a fila do IndexedDB com o Supabase.
self.addEventListener('sync', event => {
  if (event.tag === SYNC_TAG_FREQ) {
    console.log('[SW] Background Sync disparado — notificando abas...');
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clients => {
          if (clients.length > 0) {
            // Avisa a aba ativa para executar sincronizarFilaOffline()
            clients.forEach(c => c.postMessage({ type: 'RVS_SYNC_NOW' }));
          } else {
            // Nenhuma aba aberta: tenta sincronizar via fetch direto
            // (sem acesso ao IndexedDB do app, apenas avisa para próxima abertura)
            console.log('[SW] Nenhuma aba aberta. Sync será feito ao abrir o app.');
          }
        })
    );
  }
});

// ── MESSAGE ──
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();

  // Quando o app está offline e quer registrar um sync futuro
  if (event.data?.type === 'REGISTER_SYNC') {
    self.registration.sync.register(SYNC_TAG_FREQ).catch(err =>
      console.warn('[SW] Background Sync não suportado:', err)
    );
  }
});
