export interface SchoolEventDto {
  id: number;
  title: string;
  description?: string;
  type?: string;
  typeLabel?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  organizerName?: string;
  registrationRequired?: boolean;
  registered?: boolean;
  imageUrl?: string;
}

export interface CalendarEventDto {
  id: number;
  title: string;
  date: string;
  endDate?: string;
  type?: string;
  color?: string;
}
