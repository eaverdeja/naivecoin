import WebSocket from 'ws'
import { getLatestBlock, getBlockchain } from "../blockchain";
import { sockets } from "./server";
import { getTransactionPool } from '../transactions/transaction.pool'
import { formatJSON } from '../utils';

enum MessageType {
    QUERY_LATEST = 0,
    QUERY_ALL = 1,
    RESPONSE_BLOCKCHAIN = 2,
    QUERY_TRANSACTION_POOL = 3,
    RESPONSE_TRANSACTION_POOL = 4,
}

class Message {
    public type: MessageType
    public data: any
}

const write = (ws: WebSocket, message: Message): void =>
    ws.send(formatJSON(message))

const broadcast = (message: Message): void =>
    sockets.forEach((socket) =>
        write(socket, message))

const queryChainLatestMsg = (): Message => ({
    type: MessageType.QUERY_LATEST,
    data: null
})

const queryAllMsg = (): Message => ({
    type: MessageType.QUERY_ALL,
    data: null
})

const responseChainMsg = (): Message => ({
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: formatJSON(getBlockchain())
})

const responseLatestMsg = (): Message => ({
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: formatJSON([getLatestBlock()])
})

const queryTransactionPoolMsg = (): Message => ({
    type: MessageType.QUERY_TRANSACTION_POOL,
    data: null
})

const responseTransactionPool = (): Message => ({
    type: MessageType.RESPONSE_TRANSACTION_POOL,
    data: formatJSON(getTransactionPool())
})

const broadcastLatest = (): void => {
    broadcast(responseLatestMsg())
}

const broadcastTransactionPool = (): void => {
    broadcast(responseTransactionPool())
}

export {
    MessageType,
    Message,
    write,
    broadcast,
    queryChainLatestMsg,
    queryAllMsg,
    responseChainMsg,
    responseLatestMsg,
    broadcastLatest,
    queryTransactionPoolMsg,
    responseTransactionPool,
    broadcastTransactionPool
}
