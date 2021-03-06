import _ from 'lodash'
import { ec } from 'elliptic'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { getPublicKey, TxIn, signTxIn } from './transactions/transaction.in'
import { findUnspentTxOut, UnspentTxOut, TxOut, findUnspentTxOuts } from './transactions/transaction.out'
import { Transaction, getTransactionId } from './transactions/transaction';
import { getUnspentTxOuts } from './blockchain';

const privateKeyLocation = 'node/wallet/private_key'

const EC = new ec('secp256k1')

const getPrivateFromWallet = (): string => {
    const buffer = readFileSync(privateKeyLocation, 'utf8')
    return buffer.toString()
}

const getPublicFromWallet = (): string => {
    const privateKey = getPrivateFromWallet()
    const key = EC.keyFromPrivate(privateKey, 'hex')
    return key.getPublic().encode('hex')
}

const generatePrivateKey = (): string => {
    const keyPair = EC.genKeyPair()
    const privateKey = keyPair.getPrivate()
    return privateKey.toString(16)
}

const initWallet = () => {
    //let's not override existing private keys
    if (existsSync(privateKeyLocation)) {
        return
    }
    const newPrivateKey = generatePrivateKey()

    writeFileSync(privateKeyLocation, newPrivateKey)
    console.log('new wallet with private key created')
}

const getBalance = (address: string, unspentTxOuts: UnspentTxOut[]): number => {
    return _(unspentTxOuts)
        .filter((uTxO: UnspentTxOut) => uTxO.address === address)
        .map((uTxO: UnspentTxOut) => uTxO.amount)
        .sum()
}

const findTxOutsForAmount = (amount: number, myUnspentTxOuts: UnspentTxOut[]) => {
    let currentAmount = 0
    const includedUnspentTxOuts: UnspentTxOut[] = []
    for (const myUnspentTxOut of myUnspentTxOuts) {
        includedUnspentTxOuts.push(myUnspentTxOut)
        currentAmount = currentAmount + myUnspentTxOut.amount
        if (currentAmount >= amount) {
            const leftOverAmount = currentAmount - amount
            return {includedUnspentTxOuts, leftOverAmount}
        }
    }
    throw Error('not enough coins to send transaction')
}

const createTxOuts = (receiverAddress: string, myAddress: string, amount, leftOverAmount: number) => {
    const txOut1: TxOut = new TxOut(receiverAddress, amount)
    if (leftOverAmount === 0) {
        return [txOut1]
    } else {
        const leftOverTx = new TxOut(myAddress, leftOverAmount)
        return [txOut1, leftOverTx]
    }
}


// gets the unspent transaction outputs owned by the wallet
const getMyUnspentTransactionOutputs = () => {
    return findUnspentTxOuts(getPublicFromWallet(), getUnspentTxOuts())
}

export {
    generatePrivateKey,
    initWallet,
    getPublicFromWallet,
    getPrivateFromWallet,
    getBalance,
    createTxOuts,
    findTxOutsForAmount,
    getMyUnspentTransactionOutputs
}
