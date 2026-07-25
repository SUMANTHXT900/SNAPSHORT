import { invokeTauri } from "../lib/tauri";
import type { AppSettings } from "../types/snapshot";

// Application service: settings persistence.
export const settingsService = {
  async load(): Promise<AppSettings> {
    return invokeTauri<AppSettings>("load_settings_command");
  },
  async save(settings: AppSettings): Promise<void> {
    return invokeTauri<void>("save_settings_command", { settings });
  },
};
