import * as ecdsa from 'elliptic'
import _ from 'lodash'
import { toHexString } from '../utils'
import { findUnspentTxOut, UnspentTxOut } from './transaction.out';
import { Transaction } from './transaction'

const ec = new ecdsa.ec('secp256k1')

const getPublicKey = (aPrivateKey: string): string =>
    ec.keyFromPrivate(aPrivateKey, 'hex').getPublic().encode('hex')

class TxIn {
    public txOutId: string
    public txOutIndex: number
    public signature: string
}

const signTxIn = (transaction: Transaction, txInIndex: number,
    privateKey: string, aUnspentTxOuts: UnspentTxOut[]
): string => {
    const txIn: TxIn = transaction.txIns[txInIndex]
    const dataToSign = transaction.id
    
    const referencedUnspentTxOut: UnspentTxOut | null = findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts)
    if(referencedUnspentTxOut == null) {
        console.log('could not find referenced txOut')
        throw Error()
    }

    const referencedAddress = referencedUnspentTxOut.address
    if(getPublicKey(privateKey) !== referencedAddress) {
        console.log(`
            trying to sign an input with private
            key that does not match the address that is referenced in txIn
        `)
        throw Error()
    }

    const key = ec.keyFromPrivate(privateKey, 'hex')
    const signature: string = toHexString(key.sign(dataToSign).toDER())

    return signature
}

const getTxInAmount = (txIn: TxIn, aUnspentTxOuts: UnspentTxOut[]): number => {
    let txOut = findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts)
    if(txOut === null) {
        console.log('could not find an unspent txOut for the txIn')
        return 0
    }
    return txOut.amount
}

const hasDuplicates = (txIns: TxIn[]): boolean => {
    const groups = _(txIns).countBy((txIn) => txIn.txOutId + txIn.txOutIndex)
        .map((value, key) => {
            if(value > 1) {
                console.log('duplicate txIn: ' + key)
                return true
            } else {
                return false
            }
        })
        .value()
        
    return _.includes(groups, true)
}

export {
    TxIn,
    getTxInAmount,
    hasDuplicates,
    getPublicKey,
    signTxIn
}
