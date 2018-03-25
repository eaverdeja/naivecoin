# naivecoin
### uma implementação ingênua de uma blockchain

Um fork do projeto *naivecoin*
https://github.com/lhartikk/naivecoin

### estrutura de pastas
- node/wallet
    - diretório de armazenamento da chave privada gerada para as transações
- src
    - p2p/
        - inicializa um servidor p2p com websockets e configura as mensagens e os handlers necessários para interagir com uma blockchain
    - transactions/
        - definições e regras para se trabalhar com transações, inputs e outputs
    - validators/
        - regras de validação para blocos, proof-of-work e transações
    - blockchain.ts
        - define a estrutura de um bloco e todas as regras
- test/
    - diretório de testes automatizados
- .gitignore
- README.md
- package-lock.json
- package.json
- tsconfig.json
- tslint.json
