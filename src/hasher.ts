import * as CryptoJS from 'crypto-js'
import { Block } from './blockchain'

export const calculateHash = ( index: number,
    previousHash: string, timestamp: number,
    data: string, difficulty: number, nonce: number
): string =>
    CryptoJS.SHA256(index + previousHash + timestamp + data).toString()

export const calculateHashForBlock = (block: Block): string =>
    calculateHash(
        block.index,
        block.previousHash,
        block.timestamp,
        block.data,
        block.difficulty,
        block.nonce
    )
