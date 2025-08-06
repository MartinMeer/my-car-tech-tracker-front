"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { dateUtils } from "@/lib/utils"

interface DateInputProps extends Omit<React.ComponentProps<typeof Input>, 'type' | 'value' | 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ value = '', onChange, placeholder = "дд.мм.гггг", disabled, className, ...props }, ref) => {
    const [date, setDate] = React.useState<Date | undefined>(
      value ? new Date(dateUtils.russianToISO(value)) : undefined
    )
    const [inputValue, setInputValue] = React.useState(value)

    // Update internal state when value prop changes
    React.useEffect(() => {
      if (value !== inputValue) {
        setInputValue(value)
        setDate(value ? new Date(dateUtils.russianToISO(value)) : undefined)
      }
    }, [value])

    const handleDateSelect = (selectedDate: Date | undefined) => {
      setDate(selectedDate)
      if (selectedDate) {
        const russianDate = dateUtils.isoToRussian(format(selectedDate, 'yyyy-MM-dd'))
        setInputValue(russianDate)
        onChange?.(russianDate)
      } else {
        setInputValue('')
        onChange?.('')
      }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      
      // Only update if it's a valid Russian date format
      if (dateUtils.isValidRussianDate(newValue) || newValue === '') {
        onChange?.(newValue)
        if (newValue) {
          const isoDate = dateUtils.russianToISO(newValue)
          setDate(new Date(isoDate))
        } else {
          setDate(undefined)
        }
      }
    }

    const handleInputBlur = () => {
      // Validate and format on blur
      if (inputValue && !dateUtils.isValidRussianDate(inputValue)) {
        // Reset to last valid value or empty
        setInputValue(value)
        setDate(value ? new Date(dateUtils.russianToISO(value)) : undefined)
      }
    }

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("pr-10", className)}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              className={cn(
                "absolute right-0 top-0 h-full w-10 rounded-l-none border-l-0",
                disabled && "opacity-50"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              locale={ru}
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)

DateInput.displayName = "DateInput"

export { DateInput } 