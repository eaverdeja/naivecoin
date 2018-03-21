import { Block, getGenesisBlock } from './blockchain'
import { calculateHash, calculateHashForBlock } from './hasher'
import { getCurrentTimestamp, hexToBinary } from './utils'

export const isValidBlockStructure = (block: Block): boolean => {
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.timestamp === 'number'
        && typeof block.data === 'string'
}

export const isValidTimestamp = (newBlock: Block, previousBlock: Block): boolean => {
    return ( previousBlock.timestamp - 60 < newBlock.timestamp )
        && newBlock.timestamp - 60 < getCurrentTimestamp()
}

export const hasValidHash = (block: Block): boolean => {

    if (!hashMatchesBlockContent(block)) {
        console.log('invalid hash, got:' + block.hash)
        return false
    }

    if (!hashMatchesDifficulty(block.hash, block.difficulty)) {
        console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.hash)
    }
    return true
}

export const hashMatchesBlockContent = (block: Block): boolean => {
    const blockHash: string = calculateHashForBlock(block)
    return blockHash === block.hash
}

export const hashMatchesDifficulty = (hash: string, difficulty: number): boolean => {
    const hashInBinary: string = hexToBinary(hash) || ''
    const requiredPrefix: string = '0'.repeat(difficulty)
    return hashInBinary.startsWith(requiredPrefix)
}

export const isValidNewBlock = (newBlock: Block, previousBlock: Block): boolean => {
    if (!isValidBlockStructure(newBlock)) {
        console.log('invalid structure')
        return false
    }
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index')
        return false
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash')
        return false
    } else if (!isValidTimestamp(newBlock, previousBlock)) {
        console.log('invalid timestamp')
        return false
    } else if (!hasValidHash(newBlock)) {
        console.log('invalid hash')
        return false
    }
    return true
}

export const isValidChain = (blockchainToValidate: Block[]): boolean => {
    const isValidGenesis = (block: Block): boolean =>
        JSON.stringify(block) === JSON.stringify(getGenesisBlock())

    if (!isValidGenesis(blockchainToValidate[0]))
        return false

    for (let i = 1; i < blockchainToValidate.length; i++) {
        if (!isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
            return false
        }
    }
    return true
}
