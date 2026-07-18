"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ChatWidget } from "@/components/chat-widget";
import { VoiceAgent } from "@/components/voice-agent";
import { VoiceProactivePrompts } from "@/components/voice-proactive-prompts";
import { AgentProvider } from "@/components/agent-provider";
import { AppointmentModal } from "@/components/appointment-modal";
import { SceneProvider } from "@/components/scene-context";
import { ActionProvider } from "@/lib/actions/registry";

const accountRoutePrefixes = [
  "/account",
  "/admin",
  "/dashboard",
  "/forgot-password",
  "/login",
  "/portal",
  "/register",
  "/reset-password",
  "/unauthorized",
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAccountRoute = accountRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isAccountRoute) return children;

  return (
    <SceneProvider>
      <ActionProvider>
        <AgentProvider>
          <Navbar />
          {children}
          <AppointmentModal />
          <VoiceAgent />
          <VoiceProactivePrompts />
          <ChatWidget />
        </AgentProvider>
      </ActionProvider>
    </SceneProvider>
  );
}
