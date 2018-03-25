import { Transaction, getTransactionId } from "./transaction"
import { TxIn } from "./transaction.in"
import { TxOut } from "./transaction.out"

const COINBASE_AMOUNT = 50

const getCoinbaseTransaction = (address: string, blockIndex: number): Transaction => {
    const t = new Transaction()
    const txIn = new TxIn()
    txIn.signature = ''
    txIn.txOutId = ''
    txIn.txOutIndex = blockIndex
    
    t.txIns = [txIn]
    t.txOuts = [new TxOut(address, COINBASE_AMOUNT)]
    t.id = getTransactionId(t)

    return t
}

export {
    COINBASE_AMOUNT,
    getCoinbaseTransaction
}
