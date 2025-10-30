"use client";

import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState } from 'react';

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
  };
}

interface AgendaCalendarProps {
  agendamentos: AgendamentoEvent[];
}

export default function AgendaCalendar({ agendamentos }: AgendaCalendarProps) {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

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

    switch (event.resource.status) {
      case 'pendente':
        return { ...baseStyle, backgroundColor: '#f59e0b', borderLeft: '4px solid #d97706' }; // amarelo
      case 'confirmado':
        return { ...baseStyle, backgroundColor: '#10b981', borderLeft: '4px solid #059669' }; // verde
      case 'concluido':
        return { ...baseStyle, backgroundColor: '#6366f1', borderLeft: '4px solid #4f46e5' }; // azul
      case 'cancelado':
        return { ...baseStyle, backgroundColor: '#ef4444', borderLeft: '4px solid #dc2626' }; // vermelho
      default:
        return { ...baseStyle, backgroundColor: '#6b7280', borderLeft: '4px solid #4b5563' }; // cinza
    }
  };

  // Função para renderizar o título do evento
  const EventComponent = ({ event }: { event: AgendamentoEvent }) => (
    <div className="text-xs">
      <div className="font-semibold truncate text-white">{event.resource.cliente}</div>
      <div className="text-xs opacity-90 truncate text-white/90">{event.resource.servico}</div>
      <div className="text-xs opacity-75 truncate text-white/75">{event.resource.profissional}</div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Calendário de Agendamentos</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setView(Views.MONTH)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                view === Views.MONTH
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
              }`}
            >
              📅 Mês
            </button>
            <button
              onClick={() => setView(Views.WEEK)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                view === Views.WEEK
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
              }`}
            >
              📊 Semana
            </button>
            <button
              onClick={() => setView(Views.DAY)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                view === Views.DAY
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
              }`}
            >
              📋 Dia
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
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
        `}</style>
        
        <div style={{ height: '600px' }}>
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
    </div>
  );
}
