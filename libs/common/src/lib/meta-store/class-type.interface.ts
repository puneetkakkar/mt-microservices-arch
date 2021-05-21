export interface ClassType<T = any> {
  new (...args: any[]): T;
}

export interface ClassType<T = any> {
  new (...args: any[]): T;
}

export interface ClassWithArgs<T> extends Function {
  new (...args: any[]): T;
}
