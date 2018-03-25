import * as bodyParser from 'body-parser'
const express = require('express')

import { Block, generateRawNextBlock, generateNextBlock, getBlockchain, getAccountBalance, generateNextBlockWithTransaction } from './blockchain'
import { connectToPeers, getSockets, initP2PServer } from './p2p/server'
import { initWallet } from './wallet';

const httpPort: number = parseInt(process.env.HTTP_PORT || '3001')
const p2pPort: number = parseInt(process.env.P2P_PORT || '6001')

const initHttpServer = ( myHttpPort: number ) => {
    const app = express()
    app.use(bodyParser.json())

    app.get('/blocks', (req, res) => {
        res.send(JSON.stringify(getBlockchain(), null, 3))
    })

    app.post('/mineRawBlock', (req, res) => {
        if (req.body.data == null) {
            res.send('data parameter is missing')
            return
        }
        const newBlock: Block | null = generateRawNextBlock(req.body.data)
        if (newBlock === null) {
            res.status(400).send('could not generate block')
        } else {
            res.send(JSON.stringify(newBlock, null, 3))
        }
    })

    app.post('/mineBlock', (req, res) => {
        const newBlock: Block | null = generateNextBlock()
        if (newBlock === null) {
            res.status(400).send('could not generate block')
        } else {
            res.send(JSON.stringify(newBlock, null, 3))
        }
    })

    app.get('/balance', (req, res) => {
        const balance: number = getAccountBalance()
        res.send({'balance': balance})
    })

    app.post('/mineTransaction', (req, res) => {
        const address = req.body.address
        const amount = req.body.amount
        try {
            const resp = generateNextBlockWithTransaction(address, amount)
            res.send(JSON.stringify(resp, null, 3))
        } catch (e) {
            console.log(e.message)
            res.status(400).send(e.message)
        }
    })

    app.get('/peers', (req, res) => {
        res.send(getSockets().map(( s: any ) => s._socket.remoteAddress + ':' + s._socket.remotePort))
    })
    
    app.post('/addPeer', (req, res) => {
        connectToPeers(req.body.peer)
        res.send()
    })

    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort)
    })
}

initHttpServer(httpPort)
initP2PServer(p2pPort)
initWallet()
