// Asks the browser not to clear this site's data on its own (for example under
// storage pressure). Browsers decide; some grant silently, Firefox asks the user.
// Returns null where the Storage API isn't available.

export async function isPersisted(): Promise<boolean | null> {
  try {
    return (await navigator.storage?.persisted?.()) ?? null;
  } catch {
    return null;
  }
}

export async function requestPersistence(): Promise<boolean | null> {
  try {
    if (await navigator.storage?.persisted?.()) return true;
    return (await navigator.storage?.persist?.()) ?? null;
  } catch {
    return null;
  }
}
