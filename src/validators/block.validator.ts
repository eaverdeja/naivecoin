import { Block } from '../blockchain'
import { calculateHash, calculateHashForBlock } from '../hasher'
import { getCurrentTimestamp } from '../utils'
import { hashMatchesDifficulty } from './powValidator'

const isValidBlockStructure = (block: Block): boolean => {
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.timestamp === 'number'
        && typeof block.data === 'string'
}

const isValidTimestamp = (newBlock: Block, previousBlock: Block): boolean => {
    return ( previousBlock.timestamp - 60 < newBlock.timestamp )
        && newBlock.timestamp - 60 < getCurrentTimestamp()
}

const hasValidHash = (block: Block): boolean => {

    if (!hashMatchesBlockContent(block)) {
        console.log('invalid hash, got:' + block.hash)
        return false
    }

    if (!hashMatchesDifficulty(block.hash, block.difficulty)) {
        console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.hash)
    }
    return true
}

const hashMatchesBlockContent = (block: Block): boolean => {
    const blockHash: string = calculateHashForBlock(block)
    return blockHash === block.hash
}

const isValidNewBlock = (newBlock: Block, previousBlock: Block): boolean => {
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

export {
    isValidBlockStructure,
    isValidTimestamp,
    hasValidHash,
    hashMatchesBlockContent,
    isValidNewBlock
}
