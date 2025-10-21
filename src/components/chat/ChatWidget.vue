<template>
  <!-- Botón flotante -->
  <button
    class="fixed bottom-5 right-5 rounded-full p-4 shadow-lg border bg-white hover:bg-gray-50 transition"
    @click="isOpen = !isOpen"
    aria-label="Abrir chat"
    title="Soporte"
  >
    💬
  </button>

  <!-- Ventana del chat -->
  <div
    v-if="isOpen"
    class="fixed bottom-24 right-5 w-[380px] bg-white shadow-2xl rounded-2xl border overflow-hidden z-50"
  >
    <!-- Header -->
    <div class="px-4 py-3 text-white bg-gradient-to-r from-slate-900 to-indigo-700 flex items-center justify-between">
      <div class="leading-tight">
        <div class="text-[13px] opacity-95">Soporte</div>
        <div class="text-[11px] opacity-80">Conectado</div>
      </div>
      <button class="text-white/90 hover:text-white" @click="isOpen = false">✕</button>
    </div>

    <!-- Lista de mensajes (alineación por perspectiva) -->
    <div ref="scrollBox" class="h-80 overflow-y-auto bg-slate-50 p-3 space-y-2">
      <!-- separador por día -->
      <template v-for="(bucket, i) in withDateSeparators" :key="i">
        <div v-if="bucket.type === 'date'" class="flex justify-center my-2">
          <div class="text-[11px] text-slate-600 bg-white border rounded-full px-3 py-1 shadow-sm">
            {{ bucket.label }}
          </div>
        </div>

        <!-- mensaje suelto -->
        <div v-else class="flex w-full" :class="bucket.msg.from === role ? 'justify-end' : 'justify-start'">
          <div
            class="max-w-[78%] rounded-2xl px-3 py-2 shadow-sm border"
            :class="bucket.msg.from === role
              ? 'bg-indigo-600 text-white border-indigo-600 rounded-tr-sm'
              : 'bg-white text-slate-900 border-slate-200 rounded-tl-sm'"
            :title="formatDate(bucket.msg.ts)"
          >
            <div class="whitespace-pre-wrap break-words text-[13px] leading-snug">
              {{ bucket.msg.text }}
            </div>
            <div class="mt-1 text-[10px] opacity-75 flex items-center gap-1"
                 :class="bucket.msg.from === role ? 'justify-end' : 'justify-start'">
              <span>{{ timeOnly(bucket.msg.ts) }}</span>
              <span v-if="bucket.msg.from === role && bucket.msg.read">✓</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Input -->
    <div class="p-3 bg-white border-t">
      <div class="flex gap-2">
        <input
          v-model="draft"
          @keyup.enter="send"
          placeholder="Escribe un mensaje…"
          class="flex-1 border rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
        />
        <button
          @click="send"
          class="px-4 py-2 rounded-xl text-[13px] font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
          Enviar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  role: { type: String, required: true, validator: v => ['user', 'admin'].includes(v) }, // <- PERSPECTIVA
  room: { type: String, default: 'soporte' },
});

const role = props.role; // 'user' o 'admin'
const channelName = `chat:${props.room}`;
const storageKey = `chat_msgs:${props.room}`;

const isOpen = ref(true);
const draft = ref('');
const messages = ref([]);         // [{id, from: 'user'|'admin', to: 'admin'|'user', text, ts, read}]
const scrollBox = ref(null);
let bc;

/* helpers */
function formatDate(ts) { try { return new Date(ts).toLocaleString(); } catch { return ''; } }
function timeOnly(ts) { try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } }
function sameDay(a, b) {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function loadMessages() {
  try { messages.value = JSON.parse(localStorage.getItem(storageKey)) || []; }
  catch { messages.value = []; }
}
function persist() { localStorage.setItem(storageKey, JSON.stringify(messages.value)); }
function scrollToBottom() { nextTick(() => { if (scrollBox.value) scrollBox.value.scrollTop = scrollBox.value.scrollHeight; }); }

function send() {
  const text = draft.value.trim();
  if (!text) return;
  const msg = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    from: role,
    to: role === 'admin' ? 'user' : 'admin',
    text,
    ts: Date.now(),
    read: false,
  };
  messages.value.push(msg);
  persist();
  scrollToBottom();
  bc?.postMessage({ type: 'message', payload: msg });
  draft.value = '';
}

function markReadAll(fromWho) {
  let changed = false;
  messages.value = messages.value.map(m => (m.from === fromWho && !m.read) ? (changed = true, { ...m, read: true }) : m);
  if (changed) { persist(); bc?.postMessage({ type: 'read', payload: { from: fromWho } }); }
}

function handleIncoming(evt) {
  const { type, payload } = evt.data || {};
  if (type === 'message') {
    messages.value.push(payload);
    persist();
    scrollToBottom();
    if (isOpen.value && payload.to === role) markReadAll(payload.from);
  } else if (type === 'read') {
    let changed = false;
    messages.value = messages.value.map(m => (m.from === role && !m.read) ? (changed = true, { ...m, read: true }) : m);
    if (changed) persist();
  } else if (type === 'sync_request') {
    bc?.postMessage({ type: 'sync_snapshot', payload: messages.value });
  } else if (type === 'sync_snapshot' && Array.isArray(payload)) {
    const byId = new Map(messages.value.map(m => [m.id, m]));
    for (const m of payload) if (!byId.has(m.id)) byId.set(m.id, m);
    messages.value = Array.from(byId.values()).sort((a, b) => a.ts - b.ts);
    persist();
  }
}

/* lista con separadores por día (pero sin agrupar burbujas) */
const withDateSeparators = computed(() => {
  const out = [];
  let last = null;
  for (const m of messages.value) {
    if (!last || !sameDay(last.ts, m.ts)) {
      out.push({
        type: 'date',
        label: new Date(m.ts).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
      });
    }
    out.push({ type: 'msg', msg: m });
    last = m;
  }
  return out;
});

onMounted(() => {
  loadMessages();
  bc = new BroadcastChannel(channelName);
  bc.onmessage = handleIncoming;

  window.addEventListener('storage', (e) => { if (e.key === storageKey) loadMessages(); });

  bc.postMessage({ type: 'sync_request' });

  watch(isOpen, open => {
    if (open) {
      // al abrir, marca leídos los del otro
      markReadAll(role === 'admin' ? 'user' : 'admin');
      scrollToBottom();
    }
  });
});

onBeforeUnmount(() => { try { bc && bc.close(); } catch {} });
</script>
