import { Transaction, getTransactionId } from '../transaction'
import { TxOut, UnspentTxOut } from '../transactions/transaction.out'
import { TxIn, getTxInAmount, hasDuplicates } from '../transactions/transaction.in'
import { COINBASE_AMOUNT, getCoinbaseTransaction } from '../transactions/transaction.coinbase'
import * as ecdsa from 'elliptic'

const ec = new ecdsa.ec('secp256k1')

const validateBlockTransactions = (aTransactions: Transaction[], aUnspentTxOuts: UnspentTxOut[], blockIndex: number): boolean => {
    const coinbaseTx = aTransactions[0]
    if(!validateCoinbaseTransaction(coinbaseTx, blockIndex)) {
        console.log('invalid coinbase transaction: ' + JSON.stringify(coinbaseTx))
        return false
    }

    const txIns: TxIn[] = _(aTransactions)
        .map(tx => tx.txIns)
        .flatten()
        .value()

    if(hasDuplicates(txIns)) {
        return false
    }

    const normalTransactions: Transaction[] = aTransactions.slice(1)
    return normalTransactions
        .map(tx => validateTransaction(tx, aUnspentTxOuts))
        .reduce((a, b) => (a && b), true)
}

const validateTransaction = (transaction: Transaction, aUnspentTxOuts: UnspentTxOut[]): boolean => {
    if(getTransactionId(transaction) !== transaction.id) {
        console.log('invalid tx id: ' + transaction.id)
        return false
    }

    const hasValidTxIns: boolean = transaction.txIns
        .map((txIn) => validateTxIn(txIn, transaction, aUnspentTxOuts))
        .reduce((a, b) => (a && b), true)

    if(!hasValidTxIns) {
        console.log('some of the txIns are invalid in tx: ' + transaction.id)
        return false
    }

    const totalTxInValues: number = transaction.txIns
        .map(txIn => getTxInAmount(txIn, aUnspentTxOuts))
        .reduce((a, b) => (a + b), 0)

    const totalTxOutValues: number = transaction.txOuts
        .map(txOut => txOut.amount)
        .reduce((a, b) => (a + b), 0)

    if(totalTxOutValues !== totalTxInValues) {
        console.log('totalTxOutValues !== totalTxInValues in tx: ' + transaction.id)
        return false
    }

    return true
}

const validateCoinbaseTransaction = (transaction: Transaction, blockIndex: number): boolean => {
    if(getTransactionId(transaction) !== transaction.id) {
        console.log('invalid coinbase tx id: ' + transaction.id)
        return false
    }

    if(transaction.txIns.length !== 1) {
        console.log('one txIn must be specified in the coinbase transaction')
        return false
    }

    if(transaction.txOuts.length !== 1) {
        console.log('one txOut must be specified in the coinbase transaction')
        return false
    }

    if(transaction.txIns[0].txOutIndex !== blockIndex) {
        console.log('the txIn index in the coinbase tx must be the block height')
        return false
    }

    if(transaction.txOuts[0].amount !== COINBASE_AMOUNT) {
        console.log('invalid coinbase amount in coinbase transaction')
        return false
    }

    return true
}

const validateTxIn = (txIn: TxIn, transaction: Transaction, aUnspentTxOuts: UnspentTxOut[]): boolean => {
    const referencedUTxOut: UnspentTxOut =
        aUnspentTxOuts.find((uTxO) =>
            uTxO.txOutId === txIn.txOutId
            && uTxO.txOutIndex === txIn.txOutIndex)
    
    if(referencedUTxOut == null) {
        console.log('referenced txOut not found: ' + JSON.stringify(txIn, null, 3))
        return false
    }

    const address = referencedUTxOut.address

    const key = ec.keyFromPublic(address, 'hex')
    return key.verify(transaction.id, txIn.signature)
}

const isValidTxInStructure =(txIn: TxIn): boolean => {
    if(txIn == null) {
        console.log('txIn is null')
    } else if (typeof txIn.signature !== 'string') {
        console.log('invalid signature type in txIn')
        return false
    } else if (typeof txIn.txOutId !== 'string') {
        console.log('invalid txOutId type in txIn')
        return false
    } else if (typeof  txIn.txOutIndex !== 'number') {
        console.log('invalid txOutIndex type in txIn')
        return false
    } else {
        return true
    }
}


const isValidTxOutStructure = (txOut: TxOut): boolean => {
    if (txOut == null) {
        console.log('txOut is null')
        return false
    } else if (typeof txOut.address !== 'string') {
        console.log('invalid address type in txOut')
        return false
    } else if (!isValidAddress(txOut.address)) {
        console.log('invalid TxOut address')
        return false
    } else if (typeof txOut.amount !== 'number') {
        console.log('invalid amount type in txOut')
        return false
    } else {
        return true
    }
}

const isValidTransactionStructure = (transaction: Transaction) => {
    if(typeof transaction.id !== 'string') {
        console.log('transactionId missing')
        return false
    }

    if(!(transaction.txIns instanceof Array)) {
        console.log('invalid txIns type in transaction')
        return false
    }

    if(!transaction.txIns
        .map(isValidTxInStructure)
        .reduce((a, b) => (a && b), true)
    ) {
        return false
    }
    
    if(!(transaction.txOuts instanceof Array)) {
        console.log('invalid txIns type in transaction')
        return false
    }

    if(!transaction.txOuts
        .map(isValidTxOutStructure)
        .reduce((a, b) => (a && b), true)
    ) {
        return false
    }

    return true
}

const isValidAddress = (address: string): boolean => {
    if(address.length !== 130) {
        console.log('invalid public key length')
        return false
    } else if(address.match('^[a-fA-F0-9]+$') === null) {
        console.log('public key must containt only hex characters')
        return false
    } else if(!address.startsWith('04')) {
        console.log('public key must start with 04')
        return false
    }
    
    return true
}