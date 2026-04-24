import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const googleChatWebhookUrl = env.GOOGLE_CHAT_WEBHOOK_URL;
  const googleChatWebhook = googleChatWebhookUrl ? new URL(googleChatWebhookUrl) : null;

  return {
    plugins: [react()],
    server: googleChatWebhook
      ? {
          proxy: {
            "/api/google-chat-webhook": {
              target: googleChatWebhook.origin,
              changeOrigin: true,
              rewrite: () => `${googleChatWebhook.pathname}${googleChatWebhook.search}`,
            },
          },
        }
      : undefined,
  };
});
