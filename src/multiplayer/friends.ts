import Friend from "./types/Friend";

// Hardcoded default friends list. Will be expanded with Discord guild member lookup later.
const DEFAULT_FRIENDS: Friend[] = [
  {
    discordId: 'erikh2000',
    username: 'ErikH2000',
    avatarUrl: null,
  },
  {
    discordId: 'syntax',
    username: 'Syntax',
    avatarUrl: null,
  },
];

export function getFriendsList(): Friend[] {
  return DEFAULT_FRIENDS;
}
