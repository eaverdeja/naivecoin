import _ from 'lodash'
import { Transaction, createTransaction } from './transaction'
import { TxIn } from './transaction.in'
import { TxOut, UnspentTxOut } from './transaction.out'
import { validateTransaction, isValidTxForPool, hasValidTxIn } from '../validators/transaction.validator'
import { getPrivateFromWallet } from '../wallet';
import { getUnspentTxOuts } from '../blockchain';
import { broadcastTransactionPool } from '../p2p/messenger';
import { formatJSON } from '../utils';

let transactionPool: Transaction[] = []

const getTransactionPool = () => {
    console.log(transactionPool)
    return _.cloneDeep(transactionPool)
}

const addToTransactionPool = (tx: Transaction, unspentTxOuts: UnspentTxOut[]) => {
    if(!validateTransaction(tx, unspentTxOuts)) {
        throw Error('Trying to add invalid tx to pool!')
    }

    if(!isValidTxForPool(tx, transactionPool)) {
        throw Error('Trying to ad invalid tx to pool!')
    }

    console.log(`adding to txPool: ${formatJSON(tx)}`)
    transactionPool.push(tx)
}

const updateTransactionPol = (unspentTxOuts: UnspentTxOut[]): void => {
    const invalidTxs: Transaction[] = []
    for(const tx of transactionPool) {
        for(const txIn of tx.txIns) {
            if(!hasValidTxIn(txIn, unspentTxOuts)) {
                invalidTxs.push(tx)
                break
            }
        }
    }
    if(invalidTxs.length > 0) {
        console.log(`removing the following transactions from txPool: ${formatJSON(invalidTxs)}`)
        transactionPool = _.without(transactionPool, ...invalidTxs)
    }
}

const sendTransaction = (address: string, amount: number): Transaction => {
    const tx: Transaction = createTransaction(address, amount, getPrivateFromWallet(), getUnspentTxOuts())
    addToTransactionPool(tx, getUnspentTxOuts())
    broadcastTransactionPool()
    return tx
}

export {
    addToTransactionPool,
    getTransactionPool,
    updateTransactionPol,
    sendTransaction
}
