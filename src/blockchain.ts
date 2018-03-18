import { broadcastLatest } from './p2p'
import { calculateHash } from './utils'
import { isValidBlockStructure, isValidNewBlock, isValidChain } from './validator'

class Block {

    public index: number
    public hash: string
    public previousHash: string
    public timestamp: number
    public data: string

    constructor(index: number, hash: string, previousHash: string, timestamp: number, data: string) {
        this.index = index
        this.previousHash = previousHash
        this.timestamp = timestamp
        this.data = data
        this.hash = hash
    }
}

const genesisBlock: Block = new Block(
    0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', '0', 1465154705, 'my genesis block!!'
)

let blockchain: Block[] = [genesisBlock]

const getBlockchain = (): Block[] => blockchain

const getGenesisBlock = (): Block => blockchain[0]

const getLatestBlock = (): Block => blockchain[blockchain.length - 1]

const generateNextBlock = (blockData: string) => {
    const previousBlock: Block = getLatestBlock()
    const nextIndex: number = previousBlock.index + 1
    const nextTimestamp: number = new Date().getTime() / 1000
    const nextHash: string = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData)
    const newBlock: Block = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData)
    addBlockToChain(newBlock);
    broadcastLatest();
    return newBlock
}

const addBlockToChain = (newBlock: Block) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock)
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
    generateNextBlock,
    replaceChain,
    addBlockToChain
}
