import GConfig from './GConfig';

export default class GLog {
  static logInfo(moduleName, ...args) {
    if (!GConfig.isOffLog && moduleName && moduleName.constructor) {
      console.info(`[${moduleName.constructor.name}]`, ...args);
    }
  }

  static logMsg(moduleName, msg, offThis = false) {
    if (!GConfig.isOffLog && moduleName && moduleName.constructor && !offThis) {
      console.log(`[${moduleName.constructor.name}]`, msg);
    }
  }
}