import GConfig from './GConfig';

export default class GLog {
  static logInfo(moduleName, ...args) {
    if (!GConfig.isOffLog) {
      console.info(`[${moduleName.constructor.name}]`, ...args);
    }
  }
}