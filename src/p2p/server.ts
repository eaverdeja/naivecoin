import WebSocket from 'ws'
import {Server} from 'ws'
import {addBlockToChain, Block, getBlockchain, getLatestBlock, replaceChain, getUnspentTxOuts} from '../blockchain'
import { isValidBlockStructure } from '../validators/block.validator'
import { Message, MessageType, write, broadcast, queryChainLatestMsg, responseLatestMsg, responseChainMsg, queryAllMsg, queryTransactionPoolMsg, responseTransactionPool, broadcastTransactionPool } from './messenger'
import { formatJSON } from '../utils'
import { Transaction } from '../transactions/transaction';
import { addToTransactionPool } from '../transactions/transaction.pool';

const sockets: WebSocket[] = []
const getSockets = () => sockets

const initP2PServer = (p2pPort: number) => {
    const server: Server = new WebSocket.Server({port: p2pPort})
    server.on('connection', (ws: WebSocket) => {
        initConnection(ws)
    })
    console.log('listening websocket p2p port on: ' + p2pPort)
}

const connectToPeers = (newPeer: string): void => {
    const ws: WebSocket = new WebSocket(newPeer)
    ws.on('open', () => {
        initConnection(ws)
    })
    ws.on('error', () => {
        console.log('connection failed')
    })
}

const initConnection = (ws: WebSocket) => {
    sockets.push(ws)
    initMessageHandler(ws)
    initErrorHandler(ws)
    write(ws, queryChainLatestMsg())

    setTimeout(() => {
        broadcast(queryTransactionPoolMsg())
    }, 500)
}

const initMessageHandler = (ws: WebSocket) => {
    ws.on('message', (data: string) => {
        try {
            const message: Message = JSONToObject<Message>(data)
            if (message === null) {
                console.log('could not parse received JSON message: ' + data)
                return
            }
            console.log(`Received message: ${formatJSON(message)}`)
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    write(ws, responseLatestMsg())
                    break
                case MessageType.QUERY_ALL:
                    write(ws, responseChainMsg())
                    break
                case MessageType.RESPONSE_BLOCKCHAIN:
                    const receivedBlocks: Block[] = JSONToObject<Block[]>(message.data)
                    if (receivedBlocks === null) {
                        console.log(`invalid blocks received: ${message.data}`)
                        break
                    }
                    handleBlockchainResponse(receivedBlocks)
                    break
                case MessageType.QUERY_TRANSACTION_POOL:
                    write(ws, responseTransactionPool())
                    break
                case MessageType.RESPONSE_TRANSACTION_POOL:
                    let receivedTransactions: Transaction[] = []
                    try {
                        receivedTransactions = JSONToObject<Transaction[]>(message.data)
                    } catch(e) {
                        console.error(`invalid transaction received: ${formatJSON(message.data)}`, e)
                        break
                    }

                    receivedTransactions.forEach(transaction => {
                        handleReceivedTransaction(transaction)
                        broadcastTransactionPool()
                    })
                    break
            }
        } catch(e) {
            console.error(e)
        }
    })
}

const initErrorHandler = (ws: WebSocket) => {
    const closeConnection = (myWs: WebSocket) => {
        console.log('connection failed to peer: ' + myWs.url)
        sockets.splice(sockets.indexOf(myWs), 1)
    }
    ws.on('close', () => closeConnection(ws))
    ws.on('error', () => closeConnection(ws))
}

const handleBlockchainResponse = (receivedBlocks: Block[]) => {
    if (receivedBlocks.length === 0) {
        console.log('received block chain size of 0')
        return
    }
    const latestBlockReceived: Block = receivedBlocks[receivedBlocks.length - 1]
    if (!isValidBlockStructure(latestBlockReceived)) {
        console.log('block structuture not valid')
        return
    }
    const latestBlockHeld: Block = getLatestBlock()
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: '
            + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index)
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            if (addBlockToChain(latestBlockReceived)) {
                broadcast(responseLatestMsg())
            }
        } else if (receivedBlocks.length === 1) {
            console.log('We have to query the chain from our peer')
            broadcast(queryAllMsg())
        } else {
            console.log('Received blockchain is longer than current blockchain')
            replaceChain(receivedBlocks)
        }
    } else {
        console.log('held blockchain is not longer than received blockchain. Do nothing')
    }
}

const handleReceivedTransaction = (transaction: Transaction) => {
    addToTransactionPool(transaction, getUnspentTxOuts())
}

const JSONToObject = <T>(data: string): T => {
    try {
        return JSON.parse(data)
    } catch (e) {
        console.log(e)
        throw e
    }
}

export { sockets, connectToPeers, initP2PServer, getSockets}
