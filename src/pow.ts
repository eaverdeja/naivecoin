import { Block, getBlockchain } from "./blockchain"
import { calculateHash } from "./hasher"
import { hashMatchesDifficulty } from "./validators/pow.validator"
import { Transaction } from "./transaction";

// in seconds
export const BLOCK_GENERATION_INTERVAL: number = 10

// in blocks
export const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10

export const getDifficulty = (aBlockchain: Block[]): number => {
    const latestBlock: Block = aBlockchain[getBlockchain().length - 1]

    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
        return getAdjustedDifficulty(latestBlock, aBlockchain)
    } else {
        return latestBlock.difficulty
    }
}

export const getAdjustedDifficulty = (latestBlock: Block, aBlockchain: Block[]) => {
    const prevAdjustmentBlock: Block = aBlockchain[getBlockchain().length - DIFFICULTY_ADJUSTMENT_INTERVAL]
    const timeExpected: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL
    const timeTaken: number = latestBlock.timestamp - prevAdjustmentBlock.timestamp
    
    if (timeTaken < timeExpected / 2) {
        return prevAdjustmentBlock.difficulty + 1
    } else if (timeTaken > timeExpected * 2) {
        return prevAdjustmentBlock.difficulty - 1
    } else {
        return prevAdjustmentBlock.difficulty
    }
}

const findBlock = (index: number, previousHash: string, timestamp: number, data: Transaction[], difficulty: number): Block => {
    let nonce = 0
    
    while (true) {
        const hash: string = calculateHash(index, previousHash, timestamp, data, difficulty, nonce)
        if (hashMatchesDifficulty(hash, difficulty)) {
            return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce)
        }
        nonce++
    }
}

export {
    findBlock
}
