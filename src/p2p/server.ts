import WebSocket from 'ws'
import {Server} from 'ws'
import {addBlockToChain, Block, getBlockchain, getLatestBlock, replaceChain} from '../blockchain'
import { isValidBlockStructure } from '../validators/block.validator'
import { Message, MessageType, write, broadcast, queryChainLengthMsg, responseLatestMsg, responseChainMsg, queryAllMsg } from './messenger';

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
    write(ws, queryChainLengthMsg())
}

const initMessageHandler = (ws: WebSocket) => {
    ws.on('message', (data: string) => {
        const message: Message = JSONToObject<Message>(data)
        if (message === null) {
            console.log('could not parse received JSON message: ' + data)
            return
        }
        console.log('Received message' + JSON.stringify(message, null, 4))
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
                    console.log('invalid blocks received:')
                    console.log(message.data)
                    break
                }
                handleBlockchainResponse(receivedBlocks)
                break
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

const JSONToObject = <T>(data: string): T => {
    try {
        return JSON.parse(data)
    } catch (e) {
        console.log(e)
        throw e
    }
}

export { sockets, connectToPeers, initP2PServer, getSockets}
