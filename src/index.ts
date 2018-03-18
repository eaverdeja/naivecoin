import * as  bodyParser from 'body-parser';
import * as express from 'express';

import {Block, generateNextBlock, getBlockchain} from './blockchain'
import {connectToPeers, getSockets, initP2PServer} from './p2p'

const httpPort: number = parseInt(process.env.HTTP_PORT || '3001')
const p2pPort: number = parseInt(process.env.P2P_PORT || '6001')

const initHttpServer = ( myHttpPort: number ) => {
    const app = express()
    app.use(bodyParser.json())

    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort)
    })
})

initHttpServer(httpPort)
initP2PServer(p2pPort)
