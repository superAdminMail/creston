import ChatBoxLoading from "@/components/inbox/ChatBoxLoading";

export default function Loading() {
  return (
    <div className="mx-auto min-h-[calc(100dvh-7rem)] w-full max-w-none px-0 py-0">
      <section className="flex min-h-[calc(100dvh-7rem)] flex-1 justify-center">
        <ChatBoxLoading fillViewport />
      </section>
    </div>
  );
}
