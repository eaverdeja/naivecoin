import WebSocket from 'ws'
import { getLatestBlock, getBlockchain } from "../blockchain";
import { sockets } from "./server";

export enum MessageType {
    QUERY_LATEST = 0,
    QUERY_ALL = 1,
    RESPONSE_BLOCKCHAIN = 2,
}

export class Message {
    public type: MessageType
    public data: any
}

export const write = (ws: WebSocket, message: Message): void =>
    ws.send(JSON.stringify(message))

export const broadcast = (message: Message): void =>
    sockets.forEach((socket) =>
        write(socket, message))

export const queryChainLengthMsg = (): Message => ({
    'type': MessageType.QUERY_LATEST,
    'data': null
})

export const queryAllMsg = (): Message => ({
    'type': MessageType.QUERY_ALL,
    'data': null
})

export const responseChainMsg = (): Message => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify(getBlockchain())
})

export const responseLatestMsg = (): Message => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([getLatestBlock()])
})

export const broadcastLatest = (): void => {
    broadcast(responseLatestMsg())
}
