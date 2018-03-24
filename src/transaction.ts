import * as CryptoJS from 'crypto-js'
import { TxOut, UnspentTxOut, findUnspentTxOut, updateUnspentTxOuts } from './transactions/transaction.out'
import { TxIn } from './transactions/transaction.in'
import { isValidTransactionsStructure, validateBlockTransactions } from './validators/transaction.validator'

class Transaction {
    public id: string
    public txIns: TxIn[]
    public txOuts: TxOut[]
}

const getTransactionId = (transaction: Transaction): string => {
    const txInContent: string = transaction.txIns
        .map((txIn: TxIn) => txIn.txOutId + txIn.txOutIndex)
        .reduce((a, b) => a + b, '')

    const txOutContent: string = transaction.txOuts
        .map((txOut: TxOut) => txOut.address + txOut.amount)
        .reduce((a, b) => a + b, '')

    return CryptoJS.SHA256(txInContent + txOutContent).toString()
}

const processTransactions = (aTransactions: Transaction[], aUnspentTxOuts: UnspentTxOut[], blockIndex: number) => {
    if(!isValidTransactionsStructure(aTransactions)) {
        return null
    }

    if(!validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex)) {
        console.log('invalid block transactions')
        return null
    }

    return updateUnspentTxOuts(aTransactions, aUnspentTxOuts)
}


export {
    Transaction,
    getTransactionId
}
