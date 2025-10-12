// src/pages/CRMInbox.tsx
import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import {
  fetchConversations,
  fetchMessages,
  CWConversation,
  CWMessage as BridgeMsg,
} from "@/lib/chatwoot";
import classifyStage, {
  CRMStageId,
  CWMessage as ClassifierMsg,
} from "@/lib/classifier";
import {
  Paperclip,
  Image as ImageIcon,
  Video,
  Mic,
  Smile,
  Send,
  Check,
  CheckCheck,
  PhoneCall,
  Plus,
  FileText,
  Camera,
  User,
  BarChart3,
  Calendar,
  Sticker,
} from "lucide-react";

/* ================= Helpers ================= */

const STAGES: CRMStageId[] = [
  "por_contestar",
  "pendiente_datos",
  "por_confirmar",
  "pendiente_guia",
  "pedido_completo",
];

// Acceso seguro sin usar `any`
type Loose = Record<string, unknown>;
const getU = (obj: unknown, key: string): unknown =>
  obj && typeof obj === "object" ? (obj as Loose)[key] : undefined;
const num = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const str = (v: unknown, fallback = ""): string => String(v ?? fallback);

// Detecta outgoing/incoming ya vengan como número o string
const isOutgoing = (v: unknown) =>
  v === 1 || v === "1" || String(v).toLowerCase() === "outgoing";
const isIncoming = (v: unknown) =>
  v === 0 || v === "0" || String(v).toLowerCase() === "incoming";

const getMsgType = (m: BridgeMsg): unknown => getU(m, "message_type");

function mapChannel(inboxId: number): string {
  if (inboxId === 1) return "whatsapp";
  if (inboxId === 2) return "instagram";
  if (inboxId === 3) return "facebook";
  return "web";
}

/** Extrae número de teléfono del contacto */
function extractPhone(contact: unknown): string {
  if (!contact) return "";
  const c = contact as Loose;
  const phone = c.phone_number || c.phone || c.phoneNumber;
  if (phone) return String(phone);
  
  // Intenta extraer de identifier si existe
  const id = c.identifier || c.id;
  if (id && String(id).match(/^\+?\d+$/)) return String(id);
  
  return "";
}

/** Extrae URL del avatar del contacto */
function extractAvatar(contact: unknown): string {
  if (!contact) return "";
  const c = contact as Loose;
  return String(c.avatar || c.avatar_url || c.thumbnail || "");
}

/** Componente de Avatar con fallback a iniciales */
function Avatar({ 
  src, 
  name, 
  size = "md" 
}: { 
  src?: string; 
  name: string; 
  size?: "sm" | "md" | "lg" 
}) {
  const [imgError, setImgError] = React.useState(false);
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg"
  };

  const initials = name ? name.substring(0, 2).toUpperCase() : "?";
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold shrink-0 overflow-hidden`}
      style={{ backgroundColor: 'hsl(var(--wa-green-dark))' }}
    >
      {src && !imgError ? (
        <img 
          src={src} 
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function fmtTime(epoch?: number) {
  if (!epoch) return "";
  const d = new Date(epoch * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Tiempo relativo (hace X minutos/horas) para la lista de conversaciones */
function fmtTimeRelative(epoch?: number): string {
  if (!epoch) return "";
  const now = Date.now();
  const msgTime = epoch * 1000;
  const diffMs = now - msgTime;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "ahora";
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours} h`;
  if (diffDays === 1) return "ayer";
  if (diffDays < 7) return `hace ${diffDays} días`;
  
  // Más de una semana: mostrar fecha corta
  const date = new Date(msgTime);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
}

/** BridgeMsg -> ClassifierMsg (garantiza solo "incoming"/"outgoing") */
function toClassifier(ms: BridgeMsg[] = []): ClassifierMsg[] {
  return ms.map((m) => ({
    id: m.id,
    content: m.content ?? "",
    message_type: isOutgoing(getMsgType(m)) ? "outgoing" : "incoming",
    created_at: m.created_at,
  }));
}

/** interés: 1 -> balinería, 2 -> joyería, por primer mensaje del cliente */
function extractInteres(messages: BridgeMsg[]): "Balinería" | "Joyería" | "—" {
  const firstClient = messages.find((m) => isIncoming(getMsgType(m)));
  if (!firstClient) return "—";
  const t = (firstClient.content || "").trim();
  if (/^1\b/.test(t)) return "Balinería";
  if (/^2\b/.test(t)) return "Joyería";
  return "—";
}

/** tipo cliente simple */
function guessTipoCliente(conv: CWConversation): "Nuevo" | "Recurrente" {
  const count =
    num(getU(conv, "contact_inboxes_count"), 0) ||
    num(getU(conv, "conversations_count"), 0) ||
    1;
  return count > 1 ? "Recurrente" : "Nuevo";
}

/* ================= Emoji Picker ================= */

const EMOJIS = [
  "😀","😁","😂","🤣","😃","😄","😅","😉",
  "😊","😍","😘","😜","🤪","🤩","😎","🤔",
  "😐","😑","😴","😮","😯","😲","😳","🥹",
  "😢","😭","😤","😡","👍","👎","🙏","👏",
  "🔥","💯","✨","🎉","🌟","💡","📦","🛒",
];

function insertAtCursor(textarea: HTMLTextAreaElement, toInsert: string) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  textarea.value = before + toInsert + after;
  const pos = start + toInsert.length;
  textarea.selectionStart = textarea.selectionEnd = pos;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function EmojiPicker({
  onPick,
  open,
  onClose,
}: {
  open: boolean;
  onPick: (e: string) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div 
      className="absolute bottom-16 left-0 bg-white rounded-lg shadow-2xl border border-border p-3 z-50"
      style={{ width: '352px', maxHeight: '320px' }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="grid grid-cols-8 gap-2 overflow-y-auto max-h-[280px]">
        {EMOJIS.map((e) => (
          <button
            key={e}
            className="text-2xl hover:bg-muted rounded p-2 transition-colors"
            onClick={() => {
              onPick(e);
              onClose();
            }}
            title={e}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================= Left Pane ================= */

type LeftProps = {
  items: CWConversation[];
  activeId?: number | string | undefined;
  onSelect: (c: CWConversation) => void;
  stageFilter: CRMStageId | "all";
  setStageFilter: (s: CRMStageId | "all") => void;
  search: string;
  setSearch: (s: string) => void;
  stageCounts: Record<string, number>;
};

function LeftPane({
  items,
  activeId,
  onSelect,
  stageFilter,
  setStageFilter,
  search,
  setSearch,
  stageCounts,
}: LeftProps) {
  return (
    <aside className="w-80 border-r flex flex-col" style={{ backgroundColor: 'hsl(var(--wa-panel-bg))', borderColor: 'hsl(var(--wa-divider))' }}>
      {/* Búsqueda */}
      <div className="p-3 border-b" style={{ backgroundColor: 'hsl(var(--wa-panel-header))', borderColor: 'hsl(var(--wa-divider))' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar…"
          className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1"
          style={{ 
            backgroundColor: 'hsl(var(--wa-input-bg))', 
            border: '1px solid hsl(var(--wa-input-border))',
            color: 'hsl(var(--wa-header-text))'
          }}
        />
      </div>

      {/* Estados (vertical) */}
      <div className="px-3 py-3 border-b" style={{ borderColor: 'hsl(var(--wa-divider))' }}>
        <div className="text-[11px] uppercase tracking-wider text-wa-muted mb-2">
          Estados
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setStageFilter("all")}
            className="text-left text-sm px-3 py-2 rounded-md transition-colors font-medium flex items-center justify-between"
            style={{
              backgroundColor: stageFilter === "all" ? 'hsl(var(--wa-green) / 0.15)' : 'transparent',
              color: stageFilter === "all" ? 'hsl(var(--wa-green-dark))' : 'hsl(var(--wa-muted))',
            }}
            onMouseEnter={(e) => {
              if (stageFilter !== "all") {
                e.currentTarget.style.backgroundColor = 'hsl(var(--wa-panel-hover))';
              }
            }}
            onMouseLeave={(e) => {
              if (stageFilter !== "all") {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span>Todas</span>
            {stageCounts.all > 0 && (
              <span className="badge-count">{stageCounts.all}</span>
            )}
          </button>
          {STAGES.map((s) => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className="text-left text-sm px-3 py-2 rounded-md capitalize transition-colors font-medium flex items-center justify-between"
              style={{
                backgroundColor: stageFilter === s ? 'hsl(var(--wa-green) / 0.15)' : 'transparent',
                color: stageFilter === s ? 'hsl(var(--wa-green-dark))' : 'hsl(var(--wa-muted))',
              }}
              onMouseEnter={(e) => {
                if (stageFilter !== s) {
                  e.currentTarget.style.backgroundColor = 'hsl(var(--wa-panel-hover))';
                }
              }}
              onMouseLeave={(e) => {
                if (stageFilter !== s) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{s.replace(/_/g, " ")}</span>
              {stageCounts[s] > 0 && (
                <span className="badge-count">{stageCounts[s]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="px-3 py-2">
        <div className="text-[11px] uppercase tracking-wider text-wa-muted mb-2">
          Conversaciones
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.map((c) => {
          const active = String(c.id) === String(activeId);
          const unread = num(getU(c, "unread_count"), 0);
          const lastActivityAt = num(getU(c, "last_activity_at"));
          const timeRelative = fmtTimeRelative(lastActivityAt);
          const channel = mapChannel(num(getU(c, "inbox_id"), 0));
          const lastMsg = str(getU(c, "last_message"), "—");
          const contactName = str(getU(c, "contact")) || `Conv #${c.id}`;
          const avatarUrl = extractAvatar(getU(c, "contact"));

          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="w-full text-left px-3 py-3 border-b transition-colors"
              style={{
                backgroundColor: active ? 'hsl(var(--wa-panel-active))' : 'transparent',
                borderColor: 'hsl(var(--wa-divider))',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'hsl(var(--wa-panel-hover))';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div className="flex items-center gap-3">
                {/* Avatar con imagen real */}
                <Avatar src={avatarUrl} name={contactName} size="md" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">
                      {contactName}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-wa-muted text-[11px]">{timeRelative}</span>
                      {unread > 0 && (
                        <span className="badge-unread">{unread}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-wa-muted">
                    <span className="capitalize">{channel}</span>
                    <span>•</span>
                    <span className="truncate">{lastMsg}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {!items.length && (
          <div className="p-4 text-sm text-wa-muted">No hay conversaciones.</div>
        )}
      </div>
    </aside>
  );
}

/* ================= Chat Pane ================= */

function ChatPane({
  active,
  messages,
  stage,
  onSend,
  seen,
  typingRemote,
  onAttachFiles,
  onSendVoiceNote,
}: {
  active: CWConversation;
  messages: BridgeMsg[];
  stage: CRMStageId;
  onSend: (text: string) => void;
  seen: boolean;
  typingRemote: boolean;  // cuando la otra persona escribe
  onAttachFiles: (files: File[], kind: "file" | "image" | "video") => void;
  onSendVoiceNote: (audioBlob: Blob) => void;
}) {
  const [text, setText] = React.useState("");
  const [openEmoji, setOpenEmoji] = React.useState(false);
  const [openAttachMenu, setOpenAttachMenu] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const emojiBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const recordingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // autoscroll
  React.useEffect(() => {
    const el = document.getElementById("msg-scroll");
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // typingLocal ya no se usa - solo typingRemote para la otra persona

  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const imgRef = React.useRef<HTMLInputElement | null>(null);
  const vidRef = React.useRef<HTMLInputElement | null>(null);

  // Funciones de grabación de voz
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onSendVoiceNote(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Contador de tiempo
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
      setIsRecording(false);
      setRecordingTime(0);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // Formatear tiempo de grabación
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const doSend = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  const lastMine =
    messages.length > 0
      ? messages
          .slice()
          .reverse()
          .find((m) => isOutgoing(getMsgType(m)))
      : undefined;

  return (
    <section className="flex flex-col h-full whatsapp-bg">
      {/* Header */}
      <div className="h-16 border-b px-4 flex items-center justify-between shrink-0" style={{ backgroundColor: 'hsl(var(--wa-header-bg))', borderColor: 'hsl(var(--wa-divider))' }}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="font-semibold" style={{ color: 'hsl(var(--wa-header-text))' }}>
              {extractPhone(getU(active, "contact")) || str(getU(active, "contact")) || `Conv #${active.id}`}
            </div>
            <div className="text-xs text-wa-muted">
              {mapChannel(num(getU(active, "inbox_id"), 0))}
            </div>
            {typingRemote && (
              <div className="typing mt-0.5">
                <span>escribiendo</span>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-1 border border-blue-200 text-blue-700 rounded capitalize bg-blue-50">
            {stage.replace(/_/g, " ")}
          </span>
          {/* Llamada tipo WhatsApp (al lado derecho) */}
          <button
            title="Llamar"
            className="p-2 rounded-full hover:bg-muted transition-colors"
            onClick={() => {
              const phone = extractPhone(getU(active, "contact"));
              if (phone) {
                window.open(`tel:${phone}`, '_blank');
              } else {
                alert("No hay número de teléfono disponible");
              }
            }}
          >
            <PhoneCall className="w-5 h-5 text-wa-green" />
          </button>
        </div>
      </div>

      {/* Mensajes */}
      <div id="msg-scroll" className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m) => {
          const mine = isOutgoing(getMsgType(m));
          const contactName = str(getU(active, "contact")) || "?";
          const avatarUrl = extractAvatar(getU(active, "contact"));
          
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"} items-end gap-2`}>
              {/* Avatar solo para mensajes entrantes con imagen real */}
              {!mine && (
                <Avatar src={avatarUrl} name={contactName} size="sm" />
              )}
              
              <div
                className={`max-w-[70%] px-3 py-2 text-sm shadow-sm rounded-2xl ${
                  mine ? "bubble-out" : "bubble-in"
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
                <div className="mt-1 flex items-center gap-1 text-[10px] justify-end" style={{ color: mine ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)' }}>
                  <span>{fmtTime(m.created_at)}</span>
                  {mine && (lastMine?.id === m.id ? (
                    seen ? <CheckCheck className="w-3 h-3 text-blue-400" /> : <Check className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.6)' }} />
                  ) : <Check className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.6)' }} />)}
                </div>
              </div>
            </div>
          );
        })}

        {!messages.length && (
          <div className="text-sm text-wa-muted text-center py-10">
            Selecciona una conversación
          </div>
        )}
      </div>

      {/* Composer (siempre abajo) - Estilo WhatsApp */}
      <div className="border-t p-3 flex items-center gap-2 relative" style={{ backgroundColor: 'hsl(var(--wa-header-bg))', borderColor: 'hsl(var(--wa-divider))' }}>
        {/* Inputs ocultos */}
        <input type="file" hidden ref={fileRef} multiple onChange={(e) => e.target.files && onAttachFiles(Array.from(e.target.files), "file")} />
        <input type="file" hidden accept="image/*,video/*" ref={imgRef} multiple onChange={(e) => e.target.files && onAttachFiles(Array.from(e.target.files), "image")} />
        <input type="file" hidden accept="audio/*" ref={vidRef} multiple onChange={(e) => e.target.files && onAttachFiles(Array.from(e.target.files), "video")} />

        {/* Botón + (Menú de adjuntos) */}
        <div className="relative">
          <button
            title="Adjuntar"
            className="p-2 rounded-full hover:bg-muted transition-colors"
            onClick={() => setOpenAttachMenu((v) => !v)}
          >
            <Plus className="w-6 h-6 text-gray-600" />
          </button>
          
          {/* Menú flotante de adjuntos estilo WhatsApp */}
          {openAttachMenu && (
            <div className="absolute bottom-16 left-0 bg-white rounded-2xl shadow-2xl py-4 z-50 w-52 border border-gray-200">
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                onClick={() => { fileRef.current?.click(); setOpenAttachMenu(false); }}
              >
                <FileText className="w-6 h-6 text-purple-600 shrink-0" />
                <span className="text-sm text-gray-800">Documento</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                onClick={() => { imgRef.current?.click(); setOpenAttachMenu(false); }}
              >
                <ImageIcon className="w-6 h-6 text-blue-600 shrink-0" />
                <span className="text-sm text-gray-800">Fotos y videos</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                onClick={() => { setOpenAttachMenu(false); }}
              >
                <Camera className="w-6 h-6 text-pink-600 shrink-0" />
                <span className="text-sm text-gray-800">Cámara</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                onClick={() => { vidRef.current?.click(); setOpenAttachMenu(false); }}
              >
                <Mic className="w-6 h-6 text-orange-600 shrink-0" />
                <span className="text-sm text-gray-800">Audio</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                onClick={() => { setOpenAttachMenu(false); }}
              >
                <User className="w-6 h-6 text-blue-500 shrink-0" />
                <span className="text-sm text-gray-800">Contacto</span>
              </button>
            </div>
          )}
        </div>

        {/* Contenedor del input y emoji */}
        <div className="flex-1 flex items-center gap-2 bg-white rounded-full border border-border px-3 py-1">
          {/* Emoji */}
          <div className="relative">
            <button
              ref={emojiBtnRef}
              title="Emoji"
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setOpenEmoji((v) => !v)}
            >
              <Smile className="w-5 h-5 text-gray-500" />
            </button>
            <EmojiPicker
              open={openEmoji}
              onClose={() => setOpenEmoji(false)}
              onPick={(emoji) => {
                if (textareaRef.current) {
                  insertAtCursor(textareaRef.current, emoji);
                  setText(textareaRef.current.value);
                  textareaRef.current.focus();
                }
              }}
            />
          </div>

          {/* Caja de texto */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                doSend();
              }
            }}
            rows={1}
            placeholder="Escribe un mensaje"
            className="flex-1 resize-none text-sm focus:outline-none bg-transparent max-h-32 py-2"
            style={{ minHeight: '24px' }}
          />
        </div>

        {/* Botón de enviar o micrófono */}
        {text.trim() ? (
          <button
            onClick={doSend}
            className="p-3 text-sm rounded-full transition-colors"
            style={{ backgroundColor: 'hsl(var(--wa-green))' }}
            title="Enviar"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        ) : isRecording ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-700 font-medium">
              {formatRecordingTime(recordingTime)}
            </span>
            <button
              title="Cancelar grabación"
              className="p-1 hover:bg-red-100 rounded"
              onClick={cancelRecording}
            >
              ✕
            </button>
            <button
              title="Enviar nota de voz"
              className="p-1 hover:bg-red-100 rounded"
              onClick={stopRecording}
            >
              ✓
            </button>
          </div>
        ) : (
          <button
            title="Grabar nota de voz"
            className="p-3 rounded-full hover:bg-muted transition-colors"
            onClick={startRecording}
          >
            <Mic className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
    </section>
  );
}

/* ================= Right Pane ================= */

function RightPane({
  active,
  stage,
  interes,
  tipoCliente,
}: {
  active: CWConversation;
  stage: CRMStageId;
  interes: "Balinería" | "Joyería" | "—";
  tipoCliente: "Nuevo" | "Recurrente";
}) {
  return (
    <aside className="w-90 max-w-[360px] border-l p-4 space-y-4" style={{ backgroundColor: 'hsl(var(--wa-panel-bg))', borderColor: 'hsl(var(--wa-divider))' }}>
      <div className="rounded-lg border p-3" style={{ borderColor: 'hsl(var(--wa-divider))', backgroundColor: 'hsl(var(--wa-input-bg))' }}>
        <div className="font-semibold" style={{ color: 'hsl(var(--wa-header-text))' }}>
          {str(getU(active, "contact")) || `Conv #${active.id}`}
        </div>
        <div className="mt-1 text-xs text-wa-muted capitalize">
          {mapChannel(num(getU(active, "inbox_id"), 0))}
        </div>
        <div className="mt-2 text-xs px-2 py-1 border text-blue-700 rounded capitalize inline-block" style={{ borderColor: 'hsl(var(--wa-blue))', backgroundColor: 'hsl(var(--wa-blue) / 0.1)' }}>
          {stage.replace(/_/g, " ")}
        </div>
      </div>

      <div className="rounded-lg border p-3" style={{ borderColor: 'hsl(var(--wa-divider))', backgroundColor: 'hsl(var(--wa-input-bg))' }}>
        <div className="font-semibold mb-2" style={{ color: 'hsl(var(--wa-header-text))' }}>Detalles</div>
        <div className="text-sm space-y-1">
          <div>
            <span className="text-wa-muted">Interés: </span>
            <span className="font-medium" style={{ color: 'hsl(var(--wa-header-text))' }}>{interes}</span>
          </div>
          <div>
            <span className="text-wa-muted">Tipo de cliente: </span>
            <span className="font-medium" style={{ color: 'hsl(var(--wa-header-text))' }}>{tipoCliente}</span>
          </div>
          <div>
            <span className="text-wa-muted">Canal: </span>
            <span className="capitalize" style={{ color: 'hsl(var(--wa-header-text))' }}>
              {mapChannel(num(getU(active, "inbox_id"), 0))}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-3" style={{ borderColor: 'hsl(var(--wa-divider))', backgroundColor: 'hsl(var(--wa-input-bg))' }}>
        <div className="font-semibold" style={{ color: 'hsl(var(--wa-header-text))' }}>Notas</div>
        <textarea 
          className="mt-2 w-full h-28 rounded-md p-2 text-sm focus:outline-none focus:ring-1" 
          style={{ 
            border: '1px solid hsl(var(--wa-input-border))', 
            backgroundColor: 'hsl(var(--wa-panel-bg))',
            color: 'hsl(var(--wa-header-text))'
          }}
        />
      </div>
    </aside>
  );
}

/* ================= Main Page ================= */

export default function CRMInbox() {
  const [stageFilter, setStageFilter] =
    React.useState<CRMStageId | "all">("all");
  const [search, setSearch] = React.useState("");
  const [active, setActive] = React.useState<CWConversation | null>(null);
  const [messages, setMessages] = React.useState<BridgeMsg[]>([]);
  const [stage, setStage] = React.useState<CRMStageId>("por_contestar");

  // typing remoto: indica cuando la otra persona está escribiendo
  const [typingRemote, setTypingRemote] = React.useState(false);

  const convQ = useQuery({
    queryKey: ["cw-convs"],
    queryFn: fetchConversations,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });

  // evitar warning de exhaustive-deps
  const convs = React.useMemo(
    () => ((convQ.data ?? []) as CWConversation[]),
    [convQ.data]
  );

  const filteredConvs = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return convs.filter((c) => {
      const match =
        !q ||
        str(getU(c, "contact"))
          .toLowerCase()
          .includes(q) ||
        String(c.id).includes(q);
      if (!match) return false;
      if (stageFilter === "all") return true;
      
      // Filtrar por estado: clasificar la conversación
      const msgs = getU(c, "messages");
      const msgsArray = Array.isArray(msgs) ? (msgs as BridgeMsg[]) : [];
      const clsMsgs = toClassifier(msgsArray);
      const convStage = classifyStage(clsMsgs);
      
      return convStage === stageFilter;
    });
  }, [convs, search, stageFilter]);

  // Contar conversaciones por estado
  const stageCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: 0,
      por_contestar: 0,
      pendiente_datos: 0,
      por_confirmar: 0,
      pendiente_guia: 0,
      pedido_completo: 0,
    };

    convs.forEach((c) => {
      counts.all++;
      const msgs = getU(c, "messages");
      const msgsArray = Array.isArray(msgs) ? (msgs as BridgeMsg[]) : [];
      const clsMsgs = toClassifier(msgsArray);
      const stage = classifyStage(clsMsgs);
      counts[stage] = (counts[stage] || 0) + 1;
    });

    return counts;
  }, [convs]);

  const handleSelect = React.useCallback(async (id: number | string) => {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return;

    const conv = convs.find((c) => c.id === numericId);
    if (!conv) return;

    setActive(conv);

    const ms = await fetchMessages(numericId);
    setMessages(ms);

    // Si hay un filtro de estado seleccionado, usar ese estado
    // Si no, clasificar automáticamente
    if (stageFilter !== "all") {
      setStage(stageFilter);
    } else {
      const clsStage = classifyStage(toClassifier(ms));
      setStage(clsStage);
    }
  }, [convs, stageFilter]);

  // Auto-selección de primera conversación disponible
  React.useEffect(() => {
    if (filteredConvs.length > 0) {
      // Si no hay conversación activa, o si la conversación activa no está en la lista filtrada
      const activeInFiltered = active && filteredConvs.some(c => c.id === active.id);
      
      if (!active || !activeInFiltered) {
        const firstConv = filteredConvs[0];
        setActive(firstConv);
        // Cargar mensajes y clasificar estado de la primera conversación
        handleSelect(firstConv.id);
      }
    } else {
      // Si no hay conversaciones filtradas, limpiar la selección
      setActive(null);
      setMessages([]);
    }
  }, [filteredConvs, handleSelect]);

  // Actualizar estado cuando cambia el filtro
  React.useEffect(() => {
    // Si hay un filtro de estado activo, mostrar ese estado
    if (stageFilter !== "all") {
      setStage(stageFilter);
    } else if (active && messages.length > 0) {
      // Si el filtro es "all", reclasificar la conversación
      const clsStage = classifyStage(toClassifier(messages));
      setStage(clsStage);
    }
  }, [stageFilter, active, messages]);

  const handleSend = async (text: string) => {
    if (!active) return;

    const optimistic: BridgeMsg = {
      id: Date.now(),
      content: text,
      message_type: "outgoing",
      created_at: Math.floor(Date.now() / 1000),
    };

    setMessages((prev) => [...prev, optimistic]);
    
    // Enviar mensaje real a Chatwoot vía bridge
    try {
      const response = await fetch('http://localhost:4000/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: active.id,
          content: text
        })
      });
      
      if (!response.ok) {
        console.error('Error enviando mensaje a Chatwoot');
      } else {
        // Refrescar mensajes después de enviar
        const updatedMessages = await fetchMessages(active.id as number);
        setMessages(updatedMessages);
        
        // Re-clasificar estado después del nuevo mensaje
        const newStage = classifyStage(toClassifier(updatedMessages));
        setStage(newStage);
      }
    } catch (error) {
      console.error('Error conectando con Chatwoot bridge:', error);
    }
  };

  const handleAttachFiles = (files: File[], kind: "file" | "image" | "video") => {
    const msg: BridgeMsg = {
      id: Date.now(),
      content: `Adjuntado ${files.length} ${kind === "file" ? "archivo(s)" : kind}`,
      // ✅ tipo literal correcto para CWMessage
      message_type: "outgoing",
      created_at: Math.floor(Date.now() / 1000),
    };
    setMessages((prev) => [...prev, msg]);
  };

  const handleSendVoiceNote = async (audioBlob: Blob) => {
    if (!active) return;

    // Mensaje optimista
    const optimisticMsg: BridgeMsg = {
      id: Date.now(),
      content: "🎤 Nota de voz",
      message_type: "outgoing",
      created_at: Math.floor(Date.now() / 1000),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    // Enviar audio a Chatwoot
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-note.webm');
      formData.append('conversation_id', String(active.id));
      formData.append('message_type', 'outgoing');

      const response = await fetch('http://localhost:4000/send-voice-note', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        console.error('Error enviando nota de voz a Chatwoot');
      } else {
        // Refrescar mensajes después de enviar
        const updatedMessages = await fetchMessages(active.id as number);
        setMessages(updatedMessages);
      }
    } catch (error) {
      console.error('Error conectando con Chatwoot bridge para nota de voz:', error);
    }
  };

  const interes = React.useMemo(() => extractInteres(messages), [messages]);
  const tipoCliente = React.useMemo(
    () => (active ? guessTipoCliente(active) : "Nuevo"),
    [active]
  );

  const seen = React.useMemo(() => {
    if (!active) return false;
    const unread = num(getU(active, "unread_count"), 0);
    return unread === 0;
  }, [active]);

  /* ========= TIPING REAL =========
     Llama a setTypingRemote(true/false) desde tu listener real.
     Ejemplo (pseudocódigo):
     bridge.on('typing:start', (cid)=> active?.id===cid && setTypingRemote(true))
     bridge.on('typing:stop',  (cid)=> active?.id===cid && setTypingRemote(false))
  */

  return (
    <DashboardLayout>
      {/* Grid de 3 columnas - columna 2 con altura completa */}
      <div className="grid grid-cols-[320px_1fr_360px] h-[calc(100vh-64px)] bg-white overflow-hidden">
        <LeftPane
          items={filteredConvs}
          activeId={active?.id}
          onSelect={(c) => handleSelect(c.id)}
          stageFilter={stageFilter}
          setStageFilter={setStageFilter}
          search={search}
          setSearch={setSearch}
          stageCounts={stageCounts}
        />

        <div className="flex flex-col h-full border-r border-l border-border">
          <ChatPane
            active={
              active || ({ id: 0, contact: "", inbox_id: 0 } as unknown as CWConversation)
            }
            messages={messages}
            stage={stage}
            onSend={handleSend}
            seen={seen}
            typingRemote={typingRemote}
            onAttachFiles={handleAttachFiles}
            onSendVoiceNote={handleSendVoiceNote}
          />
        </div>

        <RightPane
          active={
            active || ({ id: 0, contact: "", inbox_id: 0 } as unknown as CWConversation)
          }
          stage={stage}
          interes={interes}
          tipoCliente={tipoCliente}
        />
      </div>
    </DashboardLayout>
  );
}
