// Type definitions for Deno Edge Functions
// These suppress TypeScript errors for Deno-specific APIs

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: { port?: number }
  ): void;
}

declare module "https://deno.land/x/xhr@0.1.0/mod.ts" {}
