import { ref } from "vue";
import { useTracker } from "@/tracker/useTracker";
import {
  BackupError,
  backupFileName,
  buildBackupFile,
  downloadText,
  readBackupFile,
  type ParsedBackup,
} from "./backup";
import { isPersisted, requestPersistence } from "./persist";

// Shared between the sidebar section and the reminder banner.
const persisted = ref<boolean | null>(null);
const pendingImport = ref<ParsedBackup | null>(null);
const importError = ref<string | null>(null);

isPersisted().then((value) => (persisted.value = value));

export function useBackup() {
  const { backupData, markBackedUp } = useTracker();

  async function protectStorage() {
    persisted.value = await requestPersistence();
  }

  function download() {
    downloadText(buildBackupFile(backupData()), backupFileName());
    markBackedUp();
    // A good moment to ask: the user has just shown they care about this data.
    void protectStorage();
  }

  async function chooseFile(file: File) {
    importError.value = null;
    try {
      pendingImport.value = await readBackupFile(file);
    } catch (error) {
      importError.value =
        error instanceof BackupError
          ? error.message
          : "This file couldn't be read.";
    }
  }

  return {
    persisted,
    pendingImport,
    importError,
    protectStorage,
    download,
    chooseFile,
  };
}

export function timeAgo(iso: string | null, now = Date.now()) {
  if (!iso) return "never";
  const days = Math.floor((now - Date.parse(iso)) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}
