import { Block, getGenesisBlock } from '../blockchain'
import { hexToBinary } from '../utils'
import { isValidNewBlock } from './block.validator'

const hashMatchesDifficulty = (hash: string, difficulty: number): boolean => {
    const hashInBinary: string = hexToBinary(hash) || ''
    const requiredPrefix: string = '0'.repeat(difficulty)
    return hashInBinary.startsWith(requiredPrefix)
}

const isValidChain = (blockchainToValidate: Block[]): boolean => {
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

export {
    hashMatchesDifficulty,
    isValidChain
}
