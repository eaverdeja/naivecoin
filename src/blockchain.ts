import _ from 'lodash'
import { broadcastLatest } from './p2p/messenger'
import { calculateHash } from './utils'

import { getDifficulty, findBlock } from './pow';
import { getPublicFromWallet, getPrivateFromWallet, getBalance } from './wallet';

import { getCoinbaseTransaction } from './transactions/transaction.coinbase';
import { UnspentTxOut } from './transactions/transaction.out'
import { Transaction, createTransaction, processTransactions } from './transactions/transaction';
import { updateTransactionPol, getTransactionPool } from './transactions/transaction.pool';

import { isValidBlockStructure, isValidNewBlock } from './validators/block.validator'
import { isValidChain } from './validators/pow.validator'
import { isValidAddress } from './validators/transaction.validator'

class Block {

    public index: number
    public hash: string
    public previousHash: string
    public timestamp: number
    public data: Transaction[]
    public difficulty: number
    public nonce: number

    constructor(
        index: number, hash: string, previousHash: string,
        timestamp: number, data: Transaction[], difficulty: number,
        nonce: number
    ) {
        this.index = index
        this.previousHash = previousHash
        this.timestamp = timestamp
        this.data = data
        this.hash = hash
        this.difficulty = difficulty
        this.nonce = nonce
    }
}

const genesisTransaction = {
    txIns: [{'signature': '', 'txOutId': '', 'txOutIndex': 0}],
    txOuts: [{
        address: '04c68a65303e8ab0800e9b5703a9b25c0ef901b17f613208c929c48180c92ba480dcb41e4f90f88d9c7078f0a5ce7c8abe7149ffee4c3f6a7090cd50ae0861c427',
        amount: 50
    }],
    id: '666937eb13aa309b8b7ed53c01b22898f772baf9cb3f228309c13caf02179de1'
}

const genesisBlock: Block = new Block(
    0,
    'some_hash',
    '0',
    1465154705,
    [genesisTransaction],
    0,
    0
)

let blockchain: Block[] = [genesisBlock]

const getBlockchain = (): Block[] => blockchain

const getGenesisBlock = (): Block => blockchain[0]

const getLatestBlock = (): Block => blockchain[blockchain.length - 1]

let unspentTxOuts: UnspentTxOut[] = processTransactions(blockchain[0].data, [], 0) || []

const getUnspentTxOuts = (): UnspentTxOut[] =>
    _.cloneDeep(unspentTxOuts)

const setUnspentTxOuts = (newUnspentTxOuts: UnspentTxOut[]) => {
    console.log(`replacing unspentTxOuts with:
        ${JSON.stringify(newUnspentTxOuts, null, 3)}
    `)
    unspentTxOuts = newUnspentTxOuts
}

const getAccountBalance = (): number =>
    getBalance(getPublicFromWallet(), unspentTxOuts)


const generateRawNextBlock = (blockData: Transaction[]) => {
    const previousBlock: Block = getLatestBlock()
    const difficulty: number = getDifficulty(getBlockchain());
    const nextIndex: number = previousBlock.index + 1
    const nextTimestamp: number = new Date().getTime() / 1000
    const newBlock = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty)
    if(addBlockToChain(newBlock)) {
        broadcastLatest()
        return newBlock
    } else {
        return null
    }
}

const generateNextBlock = () => {
    const coinbaseTx: Transaction = getCoinbaseTransaction(getPublicFromWallet(), getLatestBlock().index + 1)
    const blockData: Transaction[] = [coinbaseTx].concat(getTransactionPool())
    return generateRawNextBlock(blockData)
}

const generateNextBlockWithTransaction = (receiverAddress: string, amount: number) => {
    if (!isValidAddress(receiverAddress)) {
        throw Error('invalid address')
    }
    if (typeof amount !== 'number') {
        throw Error('invalid amount')
    }
    const coinbaseTx: Transaction = getCoinbaseTransaction(getPublicFromWallet(), getLatestBlock().index + 1)
    const tx: Transaction = createTransaction(receiverAddress, amount, getPrivateFromWallet(), unspentTxOuts)
    const blockData: Transaction[] = [coinbaseTx, tx]
    return generateRawNextBlock(blockData)
}

const addBlockToChain = (newBlock: Block) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        const uTxO: UnspentTxOut[] | null =
            processTransactions(newBlock.data, unspentTxOuts, newBlock.index)

        if(uTxO === null) {
            return false
        }
        
        blockchain.push(newBlock)
        setUnspentTxOuts(uTxO)
        updateTransactionPol(unspentTxOuts)
        return true
    }
    return false
}

const replaceChain = (newBlocks: Block[]) => {
    if (isValidChain(newBlocks) && newBlocks.length > getBlockchain().length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain')
        blockchain = newBlocks
        broadcastLatest()
    } else {
        console.log('Received blockchain invalid')
    }
}

export {
    Block,
    getBlockchain,
    getGenesisBlock,
    getLatestBlock,
    generateRawNextBlock,
    generateNextBlock,
    generateNextBlockWithTransaction,
    replaceChain,
    addBlockToChain,
    getAccountBalance,
    getUnspentTxOuts
}
