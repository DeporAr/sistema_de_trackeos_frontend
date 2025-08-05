"use client";

import * as React from "react";
import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, getDay, isSameMonth, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarProps = {
  selected?: Date;
  onSelect: (date: Date) => void;
  initialFocus?: boolean;
  mode?: "single";
  className?: string;
};

const Calendar: React.FC<CalendarProps> = ({ selected, onSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderHeader = () => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
      <button onClick={handlePrevMonth} style={{ background: "none", border: "none", cursor: "pointer" }}>
        <ChevronLeft size={20} />
      </button>
      <div style={{ fontWeight: "bold", textTransform: "capitalize" }}>
        {format(currentMonth, "LLLL yyyy", { locale: es })}
      </div>
      <button onClick={handleNextMonth} style={{ background: "none", border: "none", cursor: "pointer" }}>
        <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderDays = () => {
    const weekdays = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];
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

    const getDayOffset = (day: Date) => {
        const jsDay = getDay(day);
        return jsDay === 0 ? 6 : jsDay -1;
    }

    const gridCells = Array.from({length: 42}, (_, i) => {
        const day = days.find(d => getDayOffset(d) === i % 7 && Math.floor(i/7) === Math.floor(days.indexOf(d)/7) );
        if(!day){
            return <div key={i} style={{visibility: "hidden"}}/>
        }

        const isCurrentMonth = isSameMonth(day, currentMonth);
        const isSelected = selected && isSameDay(day, selected);

        return(
            <div
            key={day.toString()}
            onClick={() => onSelect(day)}
            style={{
              padding: "8px",
              textAlign: "center",
              cursor: "pointer",
              background: isSelected ? "#F27122" : "transparent",
              color: isSelected ? "white" : isCurrentMonth ? "black" : "#ccc",
              borderRadius: "4px",
            }}
          >
            {format(day, "d")}
          </div>
        )
    })

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {gridCells}
      </div>
    );
  };

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", width: "300px" }}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export { Calendar };
