import GConfig from './GConfig';

export default class GLog {
  static logInfo(moduleName, ...args) {
    if (!GConfig.isOffLog) {
      console.info(`[${moduleName.constructor.name}]`, ...args);
    }
  }

  static logMsg(moduleName, msg, offThis = false) {
    if (!GConfig.isOffLog && !offThis) {
      console.log(`[${moduleName.constructor.name}]`, msg);
    }
  }
}