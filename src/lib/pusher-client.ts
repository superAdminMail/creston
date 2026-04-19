"use client";

import Pusher from "pusher-js";

type PusherOptions = {
  cluster: string;
  channelAuthorization?: {
    endpoint: string;
    transport: "ajax" | "jsonp";
  };
};

let pusherClient: Pusher | null = null;

function requirePusherEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required Pusher environment variable: ${name}`);
  }

  return value;
}

export function createPusherClient(options?: Partial<PusherOptions>) {
  if (typeof window === "undefined") {
    throw new Error("createPusherClient() must only run in the browser.");
  }

  if (!pusherClient) {
    pusherClient = new Pusher(
      requirePusherEnv("NEXT_PUBLIC_PUSHER_KEY", process.env.NEXT_PUBLIC_PUSHER_KEY),
      {
        cluster: requirePusherEnv(
          "NEXT_PUBLIC_PUSHER_CLUSTER",
          process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        ),
        channelAuthorization: {
          endpoint: "/api/pusher/auth",
          transport: "ajax",
        },
        ...options,
      },
    );
  }

  return pusherClient;
}
