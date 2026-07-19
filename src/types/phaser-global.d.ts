declare const Phaser: any;

declare const Sentry:
  | {
      init?: (options: Record<string, unknown>) => void;
      captureException?: (error: unknown) => void;
      captureMessage?: (message: string, level?: string) => void;
    }
  | undefined;

interface Window {
  Sentry?: typeof Sentry;
  __HUMVEE_BUG_TRACKING__?: boolean;
  __HUMVEE_GAME__?: unknown;
}

interface DeviceOrientationEventConstructor {
  requestPermission?: () => Promise<"granted" | "denied" | "default">;
}
