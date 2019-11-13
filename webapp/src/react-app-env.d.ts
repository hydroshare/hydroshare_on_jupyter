declare module 'react-scripts'
declare module 'react-context-menu'

declare module '*.scss' {
    const content: {[className: string]: string};
    export = content;
  }