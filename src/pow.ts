import { Block, getBlockchain } from "./blockchain"
import { calculateHash, formatJSON } from "./utils"
import { hashMatchesDifficulty } from "./validators/pow.validator"
import { Transaction } from "./transactions/transaction";

// in seconds
const BLOCK_GENERATION_INTERVAL: number = 10

// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10

const getDifficulty = (aBlockchain: Block[]): number => {
    const latestBlock: Block = aBlockchain[getBlockchain().length - 1]

    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
        return getAdjustedDifficulty(latestBlock, aBlockchain)
    } else {
        return latestBlock.difficulty
    }
}

const getAdjustedDifficulty = (latestBlock: Block, aBlockchain: Block[]) => {
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
    let nonce: number = 0
    while (true) {
        const hash: string = calculateHash(index, previousHash, timestamp, data, difficulty, nonce)
        const { match, requiredPrefix, hashInBinary } = hashMatchesDifficulty(hash, difficulty)

        logExploration(difficulty, nonce, hashInBinary, match)
        
        if (match) {
            const block = new Block(index, hash, previousHash, timestamp, data, difficulty, nonce)
            console.log(`\r\nfound new block at ${new Date(timestamp*1000)}
                \r\n ----- starting block content
                \r\n${formatJSON(block)}
                \r\n ----- ending block content`
            )
            return block
        }
        nonce++
    }
}

const logExploration = (difficulty: number, nonce: number, hashInBinary: string, match: boolean) => {
    console.log(`\r\ncurrent difficulty: ${'0'.repeat(difficulty)}(s) must prefix the block hash!`)
    console.log(`\r\ntrying nonce: ${nonce}`)
    console.log(`\r\ntrying blockhash + nonce (binary): ${hashInBinary}
    \r\ndoes it match the difficulty? ${(match ? 'yes :) !' : 'no :( ...')}
`)
}

export {
    BLOCK_GENERATION_INTERVAL,
    DIFFICULTY_ADJUSTMENT_INTERVAL,
    getDifficulty,
    getAdjustedDifficulty,
    findBlock
}
