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

  static logMsgWithLineBreaks(moduleName, ...msgs) {
    if (!GConfig.isOffLog && moduleName && moduleName.constructor) {
      let msg = undefined;
      if (Array.isArray(msgs)) {
        msg = msgs.join('\n');
      }
      console.log(`[${moduleName.constructor.name}]`, `\n${msg}`);
    }
  }

  static logError(moduleName, error, offThis = false) {
    if (!GConfig.isOffLog && moduleName && moduleName.constructor && !offThis) {
      console.error(`[${moduleName.constructor.name}]`, error);
    }
  }
}