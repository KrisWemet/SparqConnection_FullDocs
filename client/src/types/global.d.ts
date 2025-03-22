/// <reference types="react" />
/// <reference types="styled-components" />

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare interface Window {
  workbox: any;
  firebase: any;
  registration: ServiceWorkerRegistration;
} 