import { broadcastLatest } from './p2p/messenger'
import { calculateHash } from './utils'
import { isValidBlockStructure, isValidNewBlock } from './validators/block.validator'
import { isValidChain } from './validators/pow.validator'
import { getDifficulty, findBlock } from './pow';
import { getCoinbaseTransaction } from './transactions/transaction.coinbase';
import { Transaction, createTransaction, processTransactions } from './transactions/transaction';
import { getPublicFromWallet, getPrivateFromWallet, getBalance } from './wallet';
import { UnspentTxOut } from './transactions/transaction.out';
import { isValidAddress } from './validators/transaction.validator';

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

const genesisBlock: Block = new Block(
    0,
    '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
    '0',
    1465154705,
    [],
    0,
    0
)

let blockchain: Block[] = [genesisBlock]

const getBlockchain = (): Block[] => blockchain

const getGenesisBlock = (): Block => blockchain[0]

const getLatestBlock = (): Block => blockchain[blockchain.length - 1]

let unspentTxOuts: UnspentTxOut[] = [];

const getAccountBalance = (): number => {
    return getBalance(getPublicFromWallet(), unspentTxOuts)
}

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
    const blockData: Transaction[] = [coinbaseTx]
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

        if(uTxO == null) {
            return false
        }
        
        blockchain.push(newBlock)
        unspentTxOuts = uTxO
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
    getAccountBalance
}
