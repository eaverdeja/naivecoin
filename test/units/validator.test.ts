import { Block, getGenesisBlock } from '../../src/blockchain'
import { isValidBlockStructure, isValidNewBlock } from '../../src/validator'
import { chai, expect } from '../test-utils'

describe('Validator', () => {
    let block: Block
    beforeEach(() => {
        block = getGenesisBlock()
        console.log(block)
        return true
    })

    describe('isValidBlockStructure', () => {
        it('Validates a valid block', () =>
            expect(isValidBlockStructure(block)).to.equal(true)
        )

        it('Invalidates a block without data', () => {
            block.data = null
            expect(isValidBlockStructure(block)).to.equal(false)
        })
    })
})
