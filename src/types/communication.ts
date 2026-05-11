export interface AnnouncementDto {
  id: number;
  title: string;
  content?: string;
  category?: string;
  categoryLabel?: string;
  pinned?: boolean;
  publishedAt?: string;
  publishDate?: string;
  expiresAt?: string;
  authorName?: string;
  isRead?: boolean;
  requiresAcknowledgment?: boolean;
  acknowledged?: boolean;
  attachments?: { id: number; fileName: string; url?: string }[];
}

export interface MessageDto {
  id: number;
  subject?: string;
  body?: string;
  preview?: string;
  senderId?: number;
  senderName?: string;
  senderEmail?: string;
  recipientName?: string;
  recipientEmail?: string;
  sentAt?: string;
  receivedAt?: string;
  isRead?: boolean;
  isStarred?: boolean;
  isArchived?: boolean;
  threadId?: number;
  attachments?: { id: number; fileName: string; url?: string }[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
}
