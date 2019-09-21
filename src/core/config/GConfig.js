export default class GConfig {
  static isOffLog = false;

  static offLog() {
    GConfig.isOffLog = true;
  }

  static onLog() {
    GConfig.isOffLog = false;
  }
}