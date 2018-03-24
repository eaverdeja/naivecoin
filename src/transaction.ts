import * as CryptoJS from 'crypto-js'
import { TxOut, UnspentTxOut, findUnspentTxOut } from './transactions/transaction.out'
import { TxIn } from './transactions/transaction.in'

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


export {
    Transaction,
    getTransactionId
}
