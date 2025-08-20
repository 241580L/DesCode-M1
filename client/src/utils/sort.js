// client/src/utils/sort.js

/**
 * Sort items by latest activity (descending).
 * - For chats: uses dateLastMessage, falls back to dateCreated
 * - For reviews: uses editDateTime, falls back to postDateTime
 */
export function sortByLatest(list, type = "chat") {
  return [...list].sort((a, b) => {
    let aTime, bTime;

    if (type === "chat") {
      aTime = new Date(a.dateLastMessage || a.dateCreated);
      bTime = new Date(b.dateLastMessage || b.dateCreated);
    } else if (type === "review") {
      aTime = new Date(a.editDateTime || a.postDateTime || a.createdAt);
      bTime = new Date(b.editDateTime || b.postDateTime || b.createdAt);
    } else {
      aTime = new Date(a.createdAt || 0);
      bTime = new Date(b.createdAt || 0);
    }

    return bTime - aTime; // latest first
  });
}
