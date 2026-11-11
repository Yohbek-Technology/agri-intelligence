export class EventEmitter {
  addListener() { return { remove: () => {} }; }
  removeListener() {}
  emit() {}
}
export const NativeModulesProxy = {};
export const requireNativeModule = () => ({});
export default { EventEmitter, NativeModulesProxy, requireNativeModule };

