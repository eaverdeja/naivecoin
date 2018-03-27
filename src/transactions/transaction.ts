import * as CryptoJS from 'crypto-js'
import { TxOut, UnspentTxOut, findUnspentTxOut, updateUnspentTxOuts } from './transaction.out'
import { TxIn, getPublicKey, signTxIn } from './transaction.in'
import { isValidTransactionsStructure, validateBlockTransactions } from '../validators/transaction.validator'
import { findTxOutsForAmount, createTxOuts } from '../wallet';
import { getUnspentTxOuts } from '../blockchain';

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

const createTransaction = (receiverAddress: string, amount: number,
    privateKey: string, unspentTxOuts: UnspentTxOut[]): Transaction => {

    const myAddress: string = getPublicKey(privateKey)
    const myUnspentTxOuts = unspentTxOuts.filter((uTxO: UnspentTxOut) => uTxO.address === myAddress)

    const {includedUnspentTxOuts, leftOverAmount} = findTxOutsForAmount(amount, myUnspentTxOuts)

    const toUnsignedTxIn = (unspentTxOut: UnspentTxOut) => {
        const txIn: TxIn = new TxIn()
        txIn.txOutId = unspentTxOut.txOutId
        txIn.txOutIndex = unspentTxOut.txOutIndex
        return txIn
    }

    const unsignedTxIns: TxIn[] = includedUnspentTxOuts.map(toUnsignedTxIn)

    const tx: Transaction = new Transaction()
    tx.txIns = unsignedTxIns
    tx.txOuts = createTxOuts(receiverAddress, myAddress, amount, leftOverAmount)
    tx.id = getTransactionId(tx)

    tx.txIns = tx.txIns.map((txIn: TxIn, index: number) => {
        txIn.signature = signTxIn(tx, index, privateKey, unspentTxOuts)
        return txIn
    })

    return tx
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
    getTransactionId,
    createTransaction,
    processTransactions,
}
