import type { Notification, Member } from '../api/mockData';

export function getTeamDisplay(member: Member): string {
  if (typeof member.team === 'object') {
    return (member.team as { name: string }).name;
  }
  return 'Unassigned';
}

export function bindNotificationHandlers(
  notifications: Notification[],
  onSelect: (id: number) => void,
): (() => void)[] {
  return notifications.map(n => () => {
    onSelect(n.id);
  });
}
