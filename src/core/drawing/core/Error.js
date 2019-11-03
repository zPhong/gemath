import DrawingLog from '../utils/values';

const ERROR_STYLE = 'font-weight: 700; font-size: 1rem; color: white; background-color: #f8d7da';
const WARNING_STYLE = 'font-weight: 700; font-size: 1rem; color: white; background-color: #fff3cd';

class Log {
  constructor(type, message, explanation) {
    this.type = type;
    this.message = message;
    this.explanation = explanation;

    this.toString = this.toString.bind(this);
  }

  toString() {
    let style = undefined;

    if (this.type === DrawingLog.Type.WARNING) {
      style = WARNING_STYLE;
    }
    else if (this.type === DrawingLog.Type.ERROR) {
      style = ERROR_STYLE;
    }

    console.log(
      `%c ${this.type} `, style,
      `${this.message}: `,
      `${this.explanation}`,
    );
  }
}