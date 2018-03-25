import { Transaction } from "./transaction"

class TxOut {
    public address: string
    public amount: number

    constructor(address: string, amount: number) {
        this.address = address
        this.amount = amount
    }
}

class UnspentTxOut {
    public readonly txOutId: string
    public readonly txOutIndex: number
    public readonly address: string
    public readonly amount: number

    constructor(txOutId: string, txOutIndex: number, address: string, amount: number) {
        this.txOutId = txOutId
        this.txOutIndex = txOutIndex
        this.address = address
        this.amount = amount
    }
}

const findUnspentTxOut = (transactionId: string, index: number, aUnspentTxOuts: UnspentTxOut[]): UnspentTxOut | null =>
    aUnspentTxOuts.find((uTxO) =>
        uTxO.txOutId === transactionId
        && uTxO.txOutIndex === index
    ) || null


const updateUnspentTxOuts = (newTransactions: Transaction[], aUnspentTxOuts: UnspentTxOut[]): UnspentTxOut[] => {
    const newUnspentTxOuts: UnspentTxOut[] = newTransactions
        .map(t =>
            t.txOuts.map((txOut, index) =>
                new UnspentTxOut(t.id, index, txOut.address, txOut.amount)
            )
        )
        .reduce((a, b) => a.concat(b), [])
    
    const consumedTxOuts: UnspentTxOut[] = newTransactions
        .map(t => t.txIns)
        .reduce((a, b) => a.concat(b), [])
        .map(txIn => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0))

    const resultingUnspentTxOuts = aUnspentTxOuts
        .filter(uTxO => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts))
        .concat(newUnspentTxOuts)

    return resultingUnspentTxOuts
}

export {
    TxOut,
    UnspentTxOut,
    findUnspentTxOut,
    updateUnspentTxOuts
}
