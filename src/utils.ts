import * as CryptoJS from 'crypto-js'
import { Block } from './blockchain'
import { Transaction } from './transactions/transaction'

export const calculateHash = ( index: number,
    previousHash: string, timestamp: number,
    data: Transaction[], difficulty: number, nonce: number
): string =>
    CryptoJS.SHA256(index + previousHash + timestamp + data + nonce).toString()

export const calculateHashForBlock = (block: Block): string =>
    calculateHash(
        block.index,
        block.previousHash,
        block.timestamp,
        block.data,
        block.difficulty,
        block.nonce
    )

const getCurrentTimestamp = (): number => Math.round(new Date().getTime() / 1000)

const hexToBinary = (s: string): string | null => {
    let ret: string = ''
    const lookupTable = {
        '0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100',
        '5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001',
        'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
        'e': '1110', 'f': '1111'
    }
    for (let i: number = 0; i < s.length; i = i + 1) {
        if (lookupTable[s[i]]) {
            ret += lookupTable[s[i]]
        } else {
            return null
        }
    }
    return ret
}

const toHexString = (byteArray): string =>
    Array.from(byteArray, (byte: any) =>
        ('0' + (byte & 0xFF).toString(16)).slice(-2)
    ).join('')

const formatJSON = (data): string =>
    JSON.stringify(data, null, 2)

export {
    getCurrentTimestamp,
    hexToBinary,
    toHexString,
    formatJSON
}
