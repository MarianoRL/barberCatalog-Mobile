import { TimeSlot, BookingStatus } from '../types';

export const generateTimeSlots = (
  workingHours: { startTime: string; endTime: string; isActive: boolean }[],
  existingBookings: any[],
  selectedDate: Date,
  serviceDuration: number = 60 // default 60 minutes
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const slotInterval = 30; // 30-minute intervals
  
  // Filter active working hours
  const activeHours = workingHours.filter(h => h.isActive);
  
  if (activeHours.length === 0) {
    return [];
  }

  activeHours.forEach(period => {
    const startTime = parseTime(period.startTime);
    const endTime = parseTime(period.endTime);
    
    let currentTime = startTime;
    
    while (currentTime < endTime) {
      const slotEndTime = currentTime + serviceDuration;
      
      // Check if slot fits within working hours
      if (slotEndTime <= endTime) {
        const slotStartStr = formatTime(currentTime);
        const slotEndStr = formatTime(slotEndTime);
        
        // Check for conflicts with existing bookings
        const hasConflict = existingBookings.some(booking => {
          if (booking.status === BookingStatus.CANCELLED || 
              booking.status === BookingStatus.NO_SHOW) {
            return false;
          }
          
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          
          // Check if booking is on the same date
          if (bookingStart.toDateString() !== selectedDate.toDateString()) {
            return false;
          }
          
          const bookingStartMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes();
          const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes();
          
          // Check for overlap
          return (
            (currentTime >= bookingStartMinutes && currentTime < bookingEndMinutes) ||
            (slotEndTime > bookingStartMinutes && slotEndTime <= bookingEndMinutes) ||
            (currentTime <= bookingStartMinutes && slotEndTime >= bookingEndMinutes)
          );
        });
        
        slots.push({
          startTime: slotStartStr,
          endTime: slotEndStr,
          isAvailable: !hasConflict && isTimeSlotInFuture(selectedDate, currentTime)
        });
      }
      
      currentTime += slotInterval;
    }
  });
  
  return slots;
};

// Helper function to parse time string (HH:MM) to minutes
const parseTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to format minutes to time string (HH:MM)
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Helper function to check if time slot is in the future
const isTimeSlotInFuture = (date: Date, timeInMinutes: number): boolean => {
  const now = new Date();
  const slotDateTime = new Date(date);
  slotDateTime.setHours(Math.floor(timeInMinutes / 60), timeInMinutes % 60, 0, 0);
  
  return slotDateTime > now;
};

// Generate standard business hours if no working hours are provided
export const generateDefaultTimeSlots = (
  selectedDate: Date,
  serviceDuration: number = 60
): TimeSlot[] => {
  const defaultHours = [
    { startTime: '09:00', endTime: '20:00', isActive: true }
  ];
  
  return generateTimeSlots(defaultHours, [], selectedDate, serviceDuration);
};