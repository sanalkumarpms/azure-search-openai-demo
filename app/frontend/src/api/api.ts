const BACKEND_URI = "";

import { ChatAppResponse, ChatAppResponseOrError, ChatAppRequest } from "./models";
import { useLogin } from "../authConfig";

const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

function getHeaders(idToken: string | undefined): Record<string, string> {
    var headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    // If using login, add the id token of the logged in account as the authorization
    if (useLogin) {
        if (idToken) {
            headers["Authorization"] = `Bearer ${idToken}`;
        }
    }

    return headers;
}

export async function askApi(request: ChatAppRequest, idToken: string | undefined): Promise<ChatAppResponse> {
    const response = await fetch(`${BACKEND_URI}/ask`, {
        method: "POST",
        headers: getHeaders(idToken),
        body: JSON.stringify(request)
    });

    const parsedResponse: ChatAppResponseOrError = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse as ChatAppResponse;
}

export async function chatApi(request: ChatAppRequest, idToken: string | undefined): Promise<Response> {
    return await fetch(`${BACKEND_URI}/chat`, {
        method: "POST",
        headers: getHeaders(idToken),
        body: JSON.stringify(request)
    });
}

export function getCitationFilePath(citation: string): string {
    return `${BACKEND_URI}/content/${citation}`;
}

export async function logChatApi(historyRec: ChatHistory, idToken: string | undefined): Promise<Response> {
    const url = "log_chat";
    // var headers: Record<string, string> = {
    //     "Content-Type": "application/json"
    // };
    return await fetch(`${BACKEND_URI}/${url}`, {
        method: "POST",
        headers: getHeaders(idToken),
        body: JSON.stringify({
            sessionId: sessionId,
            question: historyRec.question,
            response: historyRec.response,
            responseTime: historyRec.responseTime,
            errorFlag: historyRec.errorFlag
        })
    });
}

export type ChatHistory = {
    sessionId: string,
    question: string,
    response: string,
    responseTime: number,
    errorFlag: string
}

export async function logFeedback(id: string, feedback: string, idToken: string | undefined): Promise<Response> {
    const url = "log_feedback";
    return await fetch(`${BACKEND_URI}/${url}`, {
        method: "POST",
        headers: getHeaders(idToken),
        body: JSON.stringify({
            id: id,
            sessionId: sessionId,
            feedback: feedback
        })
    });
}