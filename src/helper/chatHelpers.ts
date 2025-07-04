import axios from "axios";
import status from "http-status";
import prisma from "../shared/prisma";
import { PrismaClient } from "@prisma/client";
import { AppWebSocket } from "../app/interfaces/websocket";
import { ActiveSession } from "../app/modules/Chats/chat.webSocket";

// Error creation utility
export const createError = (
  message: string,
  path: string,
  statusCode: number = status.BAD_REQUEST
) => {
  return { message, path, statusCode };
};

// Handle conversation request
export const handleConversationRequest = async (
  ws: AppWebSocket,
  sessionId: string
) => {
  const prisma = new PrismaClient();
  try {
    const conversation = await prisma.aIChat.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      include: { children: true },
    });

    ws.send(
      JSON.stringify({
        type: "conversation",
        data: conversation,
        sessionId,
      })
    );
  } catch (error) {
    console.error("Error fetching conversation:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Failed to fetch conversation",
        statusCode: status.INTERNAL_SERVER_ERROR,
      })
    );
  } finally {
    await prisma.$disconnect();
  }
};

// Call AI service
export const callAI = async (business_idea: string) => {
  try {
    const response = await axios.post(
      "http://172.252.13.71:8070/validate",
      { business_idea },
      {
        timeout: 600000,
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw createError(
      "Failed to get AI response",
      "aiService",
      status.INTERNAL_SERVER_ERROR
    );
  }
};

// Extract answer from AI response
export const extractAnswer = (res: any): string => {
  if (!res) throw createError("Empty AI response", "aiResponse");

  // Handle different response formats
  if (typeof res === "string") return res;
  if (res.answer) return res.answer;
  if (res.response) return res.response;
  if (res.data?.answer) return res.data.answer;

  throw createError("Invalid AI response format", "aiResponse");
};

// Extract sources from AI response
export const extractSources = (res: any): string[] => {
  if (!res) return [];

  // Handle different response formats
  if (Array.isArray(res.sources)) return res.sources;
  if (Array.isArray(res.data_sources)) return res.data_sources;
  if (Array.isArray(res.data?.sources)) return res.data.sources;

  return [];
};

// Format WebSocket error response
export const formatWsError = (err: any) => {
  const isKnown =
    typeof err === "object" && err !== null && "statusCode" in err;

  return {
    type: "error",
    message: isKnown ? err.message : "Operation failed",
    statusCode: isKnown ? err.statusCode : status.INTERNAL_SERVER_ERROR,
    errors: [
      {
        path: isKnown ? err.path : "unknown",
        message: err instanceof Error ? err.message : "Unknown error",
        ...(process.env.NODE_ENV === "development" && {
          stack: err instanceof Error ? err.stack : undefined,
        }),
      },
    ],
    timestamp: new Date().toISOString(),
  };
};

new Map<string, ActiveSession>();

export const handleMessage = async (
  businessIdea: string,
  userId: string,
  sessionId: string,
  isFollowUp: boolean,
  parentId?: string,
  activeSessions?: Map<string, ActiveSession>
) => {
  try {
    const apiResponse = await callAI(businessIdea);

    const updatedChat = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw createError("User not found", "userId", status.NOT_FOUND);
      }

      const now = new Date();
      const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      // Check and reset quota if needed
      if (!user.monthlyResetAt || user.monthlyResetAt < firstOfThisMonth) {
        await tx.user.update({
          where: { id: userId },
          data: {
            monthlyRequestCount: 1,
            monthlyResetAt: nextReset,
          },
        });
      } else if (user.monthlyRequestCount >= 10) {
        throw createError(
          "Monthly quota exceeded. Wait for next month.",
          "quota",
          status.FORBIDDEN
        );
      } else {
        await tx.user.update({
          where: { id: userId },
          data: {
            monthlyRequestCount: {
              increment: 1,
            },
          },
        });
      }

      const createdChat = await tx.aIChat.create({
        data: {
          userId,
          businessIdea,
          status: "PROCESSING",
          sessionId,
          isFollowUp,
          parentId,
        },
      });

      const updated = await tx.aIChat.update({
        where: { id: createdChat.id },
        data: {
          response: extractAnswer(apiResponse),
          status: "COMPLETED",
        },
        include: { children: true },
      });

      return { updated, user };
    });

    const session = activeSessions?.get(userId);
    if (session) {
      session.ws.send(
        JSON.stringify({
          type: "message",
          response: updatedChat.updated.response,
        })
      );
    }

    return updatedChat.updated;
  } catch (error) {
    console.error("Transaction error:", error);
    throw error;
  }
};

export const uploadFileToAI = async (base64File: string, fileName: string) => {
  try {
    // Convert base64 to Blob
    const byteCharacters = atob(base64File.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length)
      .fill(null)
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray]);

    // Create FormData and append the file
    const formData = new FormData();
    formData.append("file", blob, fileName); // <-- field name must be "file"

    const response = await axios.post(
      "http://172.252.13.71:8070/upload",
      formData,
      {
        timeout: 600000,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("AI Upload Service Error:", error);
    throw createError(
      "Failed to process uploaded file",
      "uploadService",
      status.INTERNAL_SERVER_ERROR
    );
  }
};
