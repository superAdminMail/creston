"use client";

import * as PusherModule from "pusher-js";

type PusherOptions = {
  cluster: string;
  channelAuthorization?: {
    endpoint: string;
    transport: "ajax" | "jsonp";
  };
};

type PusherInstance = {
  subscribe: (channelName: string) => {
    bind: (eventName: string, callback: (...args: unknown[]) => void) => void;
    unbind: (eventName: string, callback: (...args: unknown[]) => void) => void;
    unbind_all: () => void;
  };
  unsubscribe: (channelName: string) => void;
  disconnect: () => void;
};

type PusherConstructor = new (
  key: string,
  options: PusherOptions,
) => PusherInstance;

function resolvePusherConstructor(): PusherConstructor {
  const mod = PusherModule as unknown as {
    default?: PusherConstructor;
    Pusher?: PusherConstructor;
  };

  return (mod.default ?? mod.Pusher ?? (PusherModule as unknown as PusherConstructor)) as PusherConstructor;
}

export function createPusherClient(options?: Partial<PusherOptions>) {
  const Pusher = resolvePusherConstructor();

  return new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    channelAuthorization: {
      endpoint: "/api/pusher/auth",
      transport: "ajax",
    },
    ...options,
  });
}

export const pusherClient = createPusherClient();
