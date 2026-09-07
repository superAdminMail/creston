"use client";

import * as React from "react";
import { CalendarIcon, Clock3 } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

type DateTimePickerProps = {
  name: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function DateTimePicker({
  name,
  value,
  onChange,
  placeholder = "Select date & time",
  disabled = false,
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [time, setTime] = React.useState(
    value ? format(value, "HH:mm") : "12:00",
  );

  React.useEffect(() => {
    setDate(value);

    if (value) {
      setTime(format(value, "HH:mm"));
    }
  }, [value]);

  function handleDateChange(selectedDate: Date | undefined) {
    if (!selectedDate) {
      setDate(undefined);
      onChange?.(undefined);
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);

    selectedDate.setHours(hours || 0);
    selectedDate.setMinutes(minutes || 0);
    selectedDate.setSeconds(0);
    selectedDate.setMilliseconds(0);

    setDate(selectedDate);
    onChange?.(selectedDate);
  }

  function handleTimeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextTime = event.target.value;

    setTime(nextTime);

    if (!date) {
      return;
    }

    const [hours, minutes] = nextTime.split(":").map(Number);

    const nextDate = new Date(date);

    nextDate.setHours(hours || 0);
    nextDate.setMinutes(minutes || 0);
    nextDate.setSeconds(0);
    nextDate.setMilliseconds(0);

    setDate(nextDate);
    onChange?.(nextDate);
  }

  const inputValue = date ? format(date, "yyyy-MM-dd'T'HH:mm") : "";

  return (
    <>
      <input type="hidden" name={name} value={inputValue} />

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-11 w-full justify-start rounded-2xl border-white/10 bg-white/[0.04] text-left font-normal text-white hover:bg-white/[0.07] hover:text-white",
              !date && "text-slate-500",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />

            {date ? format(date, "MMM d, yyyy · h:mm a") : placeholder}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-auto rounded-2xl border-white/10 bg-slate-950 p-0 text-white"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            initialFocus
          />

          <div className="border-t border-white/10 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              <Clock3 className="h-3.5 w-3.5" />
              Time
            </div>

            <Input
              type="time"
              value={time}
              onChange={handleTimeChange}
              className="h-10 rounded-xl border-white/10 bg-white/[0.04] text-white"
            />
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
