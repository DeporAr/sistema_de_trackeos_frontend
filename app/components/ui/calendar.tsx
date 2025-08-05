"use client";

import * as React from "react";
import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, getDay, isSameMonth, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarProps = {
  selected?: Date;
  onSelect: (date: Date) => void;
};

const Calendar: React.FC<CalendarProps> = ({ selected, onSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderHeader = () => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
      <button onClick={handlePrevMonth} style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Mes anterior">
        <ChevronLeft size={20} />
      </button>
      <div style={{ fontWeight: "bold", textTransform: "capitalize" }}>
        {format(currentMonth, "LLLL yyyy", { locale: es })}
      </div>
      <button onClick={handleNextMonth} style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Mes siguiente">
        <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderDays = () => {
    const weekdays = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", padding: "4px 0" }}>
        {weekdays.map((day) => (
          <div key={day} style={{ fontWeight: "bold", fontSize: "0.8rem" }}>
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selected && isSameDay(day, selected);
          const isCurrentDay = isToday(day);

          const baseStyle: React.CSSProperties = {
            padding: "8px",
            textAlign: "center",
            cursor: "pointer",
            border: "1px solid transparent",
            borderRadius: "4px",
            background: "transparent",
            width: "100%",
          };

          const selectedStyle: React.CSSProperties = {
            background: "#F27122",
            color: "white",
            fontWeight: "bold",
          };

          const todayStyle: React.CSSProperties = {
            borderColor: "#F27122",
          };

          const otherMonthStyle: React.CSSProperties = {
            color: "#ccc",
          };

          const currentMonthStyle: React.CSSProperties = {
            color: "black",
          };

          let style = {...baseStyle};
          if(isCurrentMonth) {
              style = {...style, ...currentMonthStyle};
          } else {
              style = {...style, ...otherMonthStyle};
          }
          if(isCurrentDay) {
              style = {...style, ...todayStyle};
          }
          if(isSelected) {
              style = {...style, ...selectedStyle};
          }


          return (
            <button
              key={day.toString()}
              onClick={() => onSelect(day)}
              style={style}
              aria-label={`Seleccionar ${format(day, 'PPPP', { locale: es })}`}
              disabled={!isCurrentMonth}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", width: "320px", background: "white" }}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export { Calendar };
