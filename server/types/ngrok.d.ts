declare module 'ngrok' {
  interface NgrokOptions {
    addr: number | string;
    authtoken?: string;
    subdomain?: string;
    region?: string;
    configPath?: string;
  }

  interface Ngrok {
    connect(options: NgrokOptions): Promise<string>;
    disconnect(url?: string): Promise<void>;
    kill(): void;
  }

  const ngrok: Ngrok;
  export default ngrok;
} 