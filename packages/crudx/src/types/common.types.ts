export type ClassType<T> = {
  new (...args: any[]): T;
};

export type ObjectLiteral = {
  [key: string]: any;
};
