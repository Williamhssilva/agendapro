"use client";

import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useMemo, useState } from 'react';

// Configurar moment para português
import 'moment/locale/pt-br';
moment.locale('pt-br');

const localizer = momentLocalizer(moment);

interface AgendamentoEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    cliente: string;
    servico: string;
    profissional: string;
    status: string;
    ids?: {
      agendamentoId: string;
      profissionalId: string;
      servicoId: string;
    };
  };
}

interface AgendaCalendarProps {
  agendamentos: AgendamentoEvent[];
}

export default function AgendaCalendar({ agendamentos }: AgendaCalendarProps) {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<AgendamentoEvent | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const isPastSelectedDate = useMemo(() => {
    if (!selectedDateStr) return false;
    const selected = new Date(`${selectedDateStr}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected < today;
  }, [selectedDateStr]);

  const closeModal = () => {
    setSelectedEvent(null);
    setSlots([]);
    setSelectedSlot('');
    setSelectedDateStr('');
    setErrorMsg('');
    setSuccessMsg('');
    setSaving(false);
  };

  // Carregar horários automaticamente ao abrir o modal e quando a data mudar
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedEvent?.resource.ids || !selectedDateStr) return;
      // Se a data selecionada for no passado, não carregar horários
      if (isPastSelectedDate) {
        setSlots([]);
        setSelectedSlot('');
        return;
      }
      try {
        setLoadingSlots(true);
        setErrorMsg('');
        setSuccessMsg('');
        const url = new URL('/api/horarios-disponiveis', window.location.origin);
        url.searchParams.set('profissionalId', selectedEvent.resource.ids.profissionalId);
        url.searchParams.set('servicoId', selectedEvent.resource.ids.servicoId);
        url.searchParams.set('data', selectedDateStr);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Falha ao buscar horários');
        const data = await res.json();
        const horarios: string[] = Array.isArray(data) ? data : (data.horarios || []);
        setSlots(horarios);
        setSelectedSlot(horarios[0] || '');
      } catch {
        setSlots([]);
        setSelectedSlot('');
        setErrorMsg('Não foi possível carregar horários disponíveis.');
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedEvent, selectedDateStr, isPastSelectedDate]);

  // Função para determinar a cor do evento baseado no status
  const getEventStyle = (event: AgendamentoEvent) => {
    const baseStyle = {
      borderRadius: '8px',
      border: 'none',
      color: 'white',
      fontSize: '11px',
      padding: '4px 6px',
      fontWeight: '500',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease',
    };

    let style;
    switch (event.resource.status) {
      case 'pendente':
        style = { ...baseStyle, backgroundColor: '#f59e0b', borderLeft: '4px solid #d97706' }; // amarelo
        break;
      case 'confirmado':
        style = { ...baseStyle, backgroundColor: '#10b981', borderLeft: '4px solid #059669' }; // verde
        break;
      case 'concluido':
        style = { ...baseStyle, backgroundColor: '#6366f1', borderLeft: '4px solid #4f46e5' }; // azul
        break;
      case 'cancelado':
        style = { ...baseStyle, backgroundColor: '#ef4444', borderLeft: '4px solid #dc2626' }; // vermelho
        break;
      default:
        style = { ...baseStyle, backgroundColor: '#6b7280', borderLeft: '4px solid #4b5563' }; // cinza
        break;
    }
    return { style };
  };

  // Função para renderizar o título do evento
  const EventComponent = ({ event }: { event: AgendamentoEvent }) => (
    <div className="text-xs">
      <div className="font-semibold truncate text-black">{event.resource.cliente}</div>
      <div className="text-xs opacity-90 truncate text-black/90">{event.resource.servico}</div>
      <div className="text-xs opacity-75 truncate text-black/75">{event.resource.profissional}</div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 text-center sm:text-left">Calendário de Agendamentos</h2>
      </div>
      
      <div className="p-2 sm:p-6">
        <style jsx global>{`
          .rbc-calendar {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          .rbc-header {
            background: #f8fafc;
            color: #374151;
            font-weight: 600;
            padding: 12px 8px;
            border: 1px solid #e5e7eb;
            font-size: 14px;
          }
          
          .rbc-today {
            background-color: #f0f9ff !important;
            border: 2px solid #3b82f6 !important;
          }
          
          .rbc-date-cell {
            padding: 8px;
            font-weight: 500;
          }
          
          .rbc-off-range-bg {
            background-color: #f8fafc;
          }
          
          .rbc-event {
            border-radius: 8px !important;
            border: none !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
            transition: all 0.2s ease !important;
          }
          
          .rbc-event:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
          }
          
          .rbc-time-view {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .rbc-time-header {
            border-bottom: 2px solid #e5e7eb;
          }
          
          .rbc-time-content {
            border-top: none;
          }
          
          .rbc-timeslot-group {
            border-bottom: 1px solid #f3f4f6;
          }
          
          .rbc-time-slot {
            color: #6b7280;
            font-size: 12px;
          }
          
          .rbc-toolbar {
            margin-bottom: 20px;
            padding: 16px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            border: 1px solid #e5e7eb;
          }
          
          .rbc-toolbar button {
            background: white;
            border: 1px solid #d1d5db;
            color: #374151;
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.2s ease;
          }
          
          .rbc-toolbar button:hover {
            background: #f3f4f6;
            border-color: #9ca3af;
            transform: translateY(-1px);
          }
          
          .rbc-toolbar button.rbc-active {
            background: #3b82f6;
            border-color: #3b82f6;
            color: white;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
          }
          
          .rbc-toolbar-label {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
          }
          
          .rbc-show-more {
            background: #f3f4f6;
            color: #6b7280;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 11px;
            font-weight: 500;
          }

          /* Mobile Responsive Styles */
          @media (max-width: 768px) {
            .rbc-calendar {
              font-size: 12px;
            }
            
            .rbc-header {
              padding: 8px 4px;
              font-size: 12px;
              font-weight: 600;
            }
            
            .rbc-date-cell {
              padding: 4px 2px;
              font-size: 11px;
            }
            
            .rbc-toolbar {
              padding: 12px;
              margin-bottom: 16px;
              flex-direction: column;
              gap: 12px;
            }
            
            .rbc-toolbar .rbc-btn-group {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              justify-content: center;
            }
            
            .rbc-toolbar button {
              padding: 6px 12px;
              font-size: 12px;
              min-width: 60px;
            }
            
            .rbc-toolbar-label {
              font-size: 16px;
              text-align: center;
              margin-bottom: 8px;
            }
            
            .rbc-event {
              font-size: 10px !important;
              padding: 2px 4px !important;
              border-radius: 4px !important;
            }
            
            .rbc-time-slot {
              font-size: 10px;
            }
            
            .rbc-timeslot-group {
              min-height: 40px;
            }
            
            .rbc-time-view .rbc-time-content {
              min-height: 400px;
            }
            
            .rbc-month-view .rbc-date {
              min-height: 60px;
            }
            
            .rbc-month-view .rbc-date-cell {
              padding: 2px;
            }
            
            .rbc-month-view .rbc-off-range-bg {
              min-height: 60px;
            }
          }

          @media (max-width: 480px) {
            .rbc-calendar {
              font-size: 11px;
            }
            
            .rbc-header {
              padding: 6px 2px;
              font-size: 11px;
            }
            
            .rbc-date-cell {
              padding: 2px 1px;
              font-size: 10px;
            }
            
            .rbc-toolbar {
              padding: 8px;
            }
            
            .rbc-toolbar button {
              padding: 4px 8px;
              font-size: 11px;
              min-width: 50px;
            }
            
            .rbc-toolbar-label {
              font-size: 14px;
            }
            
            .rbc-event {
              font-size: 9px !important;
              padding: 1px 2px !important;
            }
            
            .rbc-month-view .rbc-date {
              min-height: 50px;
            }
            
            .rbc-month-view .rbc-off-range-bg {
              min-height: 50px;
            }
            
            .rbc-time-view .rbc-time-content {
              min-height: 300px;
            }
          }
        `}</style>
        
        <div className="h-96 sm:h-[600px]">
          <Calendar
            localizer={localizer}
            events={agendamentos}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            eventPropGetter={getEventStyle}
            components={{
              event: EventComponent,
            }}
            onSelectEvent={(event: AgendamentoEvent) => {
              setErrorMsg('');
              setSuccessMsg('');
              setSelectedEvent(event);
              const d = event.start instanceof Date ? event.start : new Date(event.start);
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              setSelectedDateStr(`${yyyy}-${mm}-${dd}`);
            }}
            messages={{
              next: 'Próximo',
              previous: 'Anterior',
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
              agenda: 'Agenda',
              date: 'Data',
              time: 'Hora',
              event: 'Evento',
              noEventsInRange: 'Nenhum agendamento neste período',
              showMore: (total: number) => `+${total} mais`,
            }}
            culture="pt-BR"
            step={30}
            timeslots={2}
            min={new Date(2024, 0, 1, 7, 0)} // 7:00 AM
            max={new Date(2024, 0, 1, 22, 0)} // 10:00 PM
          />
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">Agendamento</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedEvent.resource.cliente} — {selectedEvent.resource.servico} — {selectedEvent.resource.profissional}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-gray-500">Status:</span>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 font-medium"
                      style={{
                        backgroundColor:
                          selectedEvent.resource.status === 'pendente' ? '#FEF3C7' :
                          selectedEvent.resource.status === 'confirmado' ? '#D1FAE5' :
                          selectedEvent.resource.status === 'cancelado' ? '#FEE2E2' : '#E0E7FF',
                        color:
                          selectedEvent.resource.status === 'pendente' ? '#92400E' :
                          selectedEvent.resource.status === 'confirmado' ? '#065F46' :
                          selectedEvent.resource.status === 'cancelado' ? '#991B1B' : '#3730A3',
                      }}
                    >
                      {selectedEvent.resource.status}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Fechar modal"
                  className="rounded-full p-2 text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
            </div>

            <div className="px-4 py-4">
              {!selectedEvent.resource.ids ? (
                <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  Este evento não possui metadados para reagendamento. Atualize a fonte dos eventos para incluir IDs.
                </div>
              ) : (
                <>
                  {errorMsg && (
                    <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</div>
                  )}
                  {successMsg && (
                    <div className="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{successMsg}</div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Data</label>
                      <input
                        type="date"
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={selectedDateStr}
                        onChange={(e) => setSelectedDateStr(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Horário</label>
                      <select
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        disabled={!slots.length || isPastSelectedDate}
                      >
                        <option value="" disabled>
                          {loadingSlots ? 'Carregando…' : 'Selecione um horário'}
                        </option>
                        {slots.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {isPastSelectedDate && (
                        <p className="mt-1 text-xs text-gray-500">Data no passado. Selecione uma data futura para reagendar.</p>
                      )}
                      {!slots.length && !loadingSlots && (
                        <p className="mt-1 text-xs text-gray-500">Nenhum horário disponível para a data selecionada.</p>
                      )}
                      {loadingSlots && (
                        <p className="mt-1 text-xs text-gray-500">Carregando horários…</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  disabled={!selectedEvent?.resource.ids || selectedEvent.resource.status === 'confirmado'}
                  onClick={async () => {
                    if (!selectedEvent?.resource.ids) return;
                    try {
                      const res = await fetch(`/api/agendamentos/${selectedEvent.resource.ids.agendamentoId}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'confirmado' }),
                      });
                      if (!res.ok) throw new Error('Falha ao confirmar');
                      setSuccessMsg('Agendamento confirmado.');
                      setTimeout(() => {
                        if (typeof window !== 'undefined') window.location.reload();
                      }, 500);
                    } catch {
                      setErrorMsg('Não foi possível confirmar.');
                    }
                  }}
                >
                  Confirmar
                </button>

                <button
                  type="button"
                  className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                  disabled={!selectedEvent?.resource.ids || selectedEvent.resource.status === 'cancelado'}
                  onClick={async () => {
                    if (!selectedEvent?.resource.ids) return;
                    try {
                      const res = await fetch(`/api/agendamentos/${selectedEvent.resource.ids.agendamentoId}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'cancelado' }),
                      });
                      if (!res.ok) throw new Error('Falha ao cancelar');
                      setSuccessMsg('Agendamento cancelado.');
                      setTimeout(() => {
                        if (typeof window !== 'undefined') window.location.reload();
                      }, 500);
                    } catch {
                      setErrorMsg('Não foi possível cancelar.');
                    }
                  }}
                >
                  Cancelamento
                </button>
              </div>

              <button
                type="button"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                disabled={!selectedEvent?.resource.ids || !selectedDateStr || !selectedSlot || saving}
                onClick={async () => {
                  if (!selectedEvent?.resource.ids) return;
                  try {
                    setSaving(true);
                    setErrorMsg('');
                    setSuccessMsg('');
                    const horario = selectedSlot;
                    if (!horario) {
                      setErrorMsg('Selecione um horário.');
                      setSaving(false);
                      return;
                    }
                    const iso = new Date(`${selectedDateStr}T${horario}:00`);
                    const res = await fetch(`/api/agendamentos/${selectedEvent.resource.ids.agendamentoId}/reagendar`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        dataHora: iso.toISOString(),
                        profissionalId: selectedEvent.resource.ids.profissionalId,
                      }),
                    });
                    if (res.status === 409) {
                      setErrorMsg('Este horário está indisponível para o reagendamento.');
                      setSaving(false);
                      return;
                    }
                    if (!res.ok) throw new Error('Falha ao reagendar');
                    setSuccessMsg('Agendamento reagendado com sucesso.');
                    // Atualização simples: fechar modal após breve delay
                    setTimeout(() => {
                      closeModal();
                      // Opcional: refresh da página
                      if (typeof window !== 'undefined') window.location.reload();
                    }, 800);
                  } catch {
                    setErrorMsg('Não foi possível reagendar.');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? 'Salvando…' : 'Reagendar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
