"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Streamdown } from "streamdown";

import { BotIcon, UserIcon } from "./icons";

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === "string" && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Streamdown>{content}</Streamdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolCallId, state } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;
                
                // Handle flight analysis results
                if (result.sentence) {
                  return (
                    <div key={toolCallId} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="font-semibold text-blue-900 dark:text-blue-100 mb-2">✈️ Flight Analysis: {result.callsign}</div>
                      <div className="text-sm text-blue-800 dark:text-blue-200 mb-3">{result.sentence}</div>
                      <div className="grid grid-cols-2 gap-3 text-xs text-blue-700 dark:text-blue-300">
                        {result.origin && <div><strong>Origin:</strong> {result.origin}</div>}
                        {result.altitude && <div><strong>Max Altitude:</strong> {result.altitude.toFixed(2)}m</div>}
                        {result.location && <div><strong>Position:</strong> {result.location.latitude.toFixed(2)}, {result.location.longitude.toFixed(2)}</div>}
                        {result.analysis && <div><strong>Status:</strong> {result.analysis}</div>}
                      </div>
                    </div>
                  );
                }
                
                // Default JSON display for other results
                return (
                  <div key={toolCallId}>
                    <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
