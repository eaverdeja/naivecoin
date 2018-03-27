# naivecoin
##### uma implementação ingênua de uma blockchain

Um fork do projeto *naivecoin*
https://github.com/lhartikk/naivecoin

*Esse repositório ainda está em desenvolvimento!*

## objetivo

Esse fork tem alguns objetivos
 - Seguir o passo a passo do [tutorial original](https://lhartikk.github.io/) para aprender sobre o funcionamento interno básico de uma blockchain
 - Adaptar o projeto original para atender outros casos de uso e estimular o senso crítico
 - Traduzir o tutorial para português, a fim de tornar o material mais acessível para programadores brasileiros sem domínio do inglês

## estrutura de pastas
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
        - define a estrutura de um bloco, os passos para a criação de um bloco e sua inclusão no blockchain
    - pow.ts
        - define as regras do *proof-of-work*, utilizando constantes para controlar a dificuldade do *puzzle* e o tempo médio de geração de novos blocos
    - wallet.ts
        - Cria uma carteira de moedas e define as regras básicas para trabalhar com as chaves pública e privada
    - utils.ts
        - funções utilitárias (*hex2Binary*, *hashes*, *timestamps* etc.)
    - index.ts
        - definição de endpoints HTTP para interagir com uma blockchain
- test/
    - diretório de testes automatizados

## tutorial traduzido
//todo
