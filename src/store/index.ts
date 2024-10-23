import { RootStore, EventMap } from "./root";
export const rootStore = RootStore.init<EventMap>();
export const useStore = () => RootStore.init();
export { RootStore };
