import { Block, getGenesisBlock } from '../blockchain'
import { hexToBinary } from '../utils'
import { isValidNewBlock } from './block.validator'
import { UnspentTxOut } from '../transactions/transaction.out';
import { processTransactions } from '../transactions/transaction';

const hashMatchesDifficulty = (hash: string, difficulty: number) => {
    const hashInBinary: string = hexToBinary(hash) || ''
    const requiredPrefix: string = '0'.repeat(difficulty)
    const match = hashInBinary.startsWith(requiredPrefix)

    return {
        match,
        requiredPrefix,
        hashInBinary
    }
}

const isValidChain = (blockchainToValidate: Block[]): UnspentTxOut[] | null => {
    const isValidGenesis = (block: Block): boolean =>
        JSON.stringify(block) === JSON.stringify(getGenesisBlock())

    if (!isValidGenesis(blockchainToValidate[0]))
        return null

    let aUnspentTxOuts: UnspentTxOut[] | null = []
    for (let i = 1; i < blockchainToValidate.length; i++) {
        const currentBlock = blockchainToValidate[i]
        if (i !== 0 && !isValidNewBlock(currentBlock, blockchainToValidate[i - 1])) {
            return null
        }

        aUnspentTxOuts = processTransactions(currentBlock.data, aUnspentTxOuts, currentBlock.index)
        if(aUnspentTxOuts === null) {
            console.log('invalid transactions in blockchain')
            return null
        }
    }

    return aUnspentTxOuts
}

export {
    hashMatchesDifficulty,
    isValidChain
}
