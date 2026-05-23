const DATE_UNITS = [
  { name: 'year', seconds: 31536000 },
  { name: 'month', seconds: 2592000 },
  { name: 'day', seconds: 86400 },
  { name: 'hour', seconds: 3600 },
  { name: 'minute', seconds: 60 },
] as const;

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const diffSeconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);

  if (diffSeconds < 60) {
    return 'Just now';
  }

  for (const unit of DATE_UNITS) {
    const interval = Math.floor(diffSeconds / unit.seconds);
    if (interval >= 1) {
      return `${interval} ${unit.name}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
}

export function formatTime(date: Date | string): string {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  return inputDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(date: Date | string): string {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  return inputDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMessageDate(date: Date | string): string {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - inputDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return inputDate.toLocaleDateString([], { weekday: 'long' });
  } else {
    return formatDate(inputDate);
  }
}
