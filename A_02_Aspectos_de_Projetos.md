# Aspectos de Projetos
## SISTEMAS DISTRIBUÍDOS

---

## Requisitos Gerais

Requisitos de Software para Projeto de um Sistema Distribuído:

- Flexibilidade
- Escalabilidade
- Transparência
- Desempenho
- Confiabilidade

---

Todos tendem a ter uma mesma importância dentro de um projeto distribuído;

Pode se priorizar um dos elementos, normalmente diminuindo a qualidade de outro ou de todos os outros;

A priorização vai depender do projeto em si e dos resultados que o mesmo gostaria de alcançar;

---

## Definição

**Fracamente Acoplado:**
- Independentes;
- Cooperam de alguma forma;
- A falha de uma CPU acarreta pouca degradação ao sistema;

**Fortemente Acoplado:**
- Divide um problema por várias CPUs;
- Cada CPU trabalha em paralelo;
- Um único resultado;

---

## Escalabilidade

Um SD é escalável se, ao adicionarmos novos recursos e usuários, seu desempenho permanece satisfatório;

Exemplos:
- Endereços IPv4 de 32 bits => IPv6 128 bits;
- DNS, no início, era uma tabela => foi particionada e é tratada localmente contendo replicações;

Técnicas para garantir escalabilidade:
- Replicação de dados;
- Caching;
- Replicação de serviços;

---

Um sistema é descrito como escalável se permanece eficiente quando há um aumento significativo no número de recursos utilizados e no número de usuários;

O projeto de sistemas distribuídos escaláveis apresenta os seguintes desafios:
- Controlar os custos dos recursos físicos;
- Controlar a perda de desempenho;
- Evitar gargalos de desempenho;

A escalabilidade de um sistema pode ser medida segundo três dimensões diferentes:
- Um sistema pode ser escalável em relação a seu tamanho, o que significa que é fácil adicionar mais usuários e recursos ao sistema;
- Um sistema escalável em termos geográficos é um sistema no qual usuários e recursos podem estar longe uns dos outros;
- Um sistema pode ser escalável em termos administrativos, o que significa que ele ainda pode ser fácil de gerenciar, mesmo que abranja muitas organizações administrativas diferentes;

Escalabilidade – "soluções que funcionam para 200 máquinas podem falhar completamente para 200.000.000 máquinas" – algoritmos centralizados não são convenientes para Sistemas Distribuídos e devem ser evitados.

Aspectos de algoritmos descentralizados:
- Nenhuma máquina tem informação completa do estado do sistema;
- Máquinas devem tomar decisões apenas baseadas em informações locais disponíveis;
- A falha de uma máquina não deve comprometer o algoritmo;
- Não existe um relógio global (nem sincronismo entre relógios locais);

---

## Transparência

Até onde e o quanto é desejável?

"Como é que o projetista de sistemas distribuídos engana a todos fazendo com que pareça ao usuário que a coleção de máquinas se comporte como o velho conhecido sistema de tempo compartilhado monoprocessado?"

O sistema deve ser visto pelo usuário e pelo programador como um todo e não como uma coleção de componentes;

Pode ser conseguida em dois níveis diferentes:
- Esconder a distribuição do usuário;
- Em um nível mais baixo: A interface das chamadas do sistema pode ser projetada de tal forma que a existência de múltiplos processadores não seja visível;

**Transparência de Localização:**
- Os usuários não precisam (devem?) saber onde os recursos de hardware e software estão exatamente localizados;
- Serviço de nomes (diretório);

**Transparência para Migração ou Mobilidade:**
- Os recursos devem ser livres para mover de uma localização para outra sem a necessidade de alteração de nomes;
- Propriedade interessante para tolerância a falhas;

**Transparência para Replicação:**
- O sistema operacional deve permitir a criação de novas cópias de recursos;
- O número de réplicas deve ser transparente ao usuário;
- O estado das réplicas deve ser consistente;
- A criação de réplicas pode ser espontânea (Sistema Operacional) ou intencional (programado);

**Transparência para Concorrência:**
- Vários processos podem acessar o mesmo recurso sem interferir na utilização um do outro nem no recurso;
- Vários usuários compartilhando os mesmos recursos (sem relacionamento entre os mesmos) – sistema de lock automático para os recursos;

**Transparência quanto ao Paralelismo:**
- Atividades podem acontecer em paralelo sem o conhecimento dos usuários;

**Transparência de Acesso:**
- Recursos locais e remotos são acessados através de operações idênticas;

---

## Flexibilidade

Capacidade de suportar mudanças em sua estrutura depois de ser desenvolvido, sem comprometimento da execução das aplicações;

É muito importante que o sistema seja flexível às decisões do projeto. Situações que hoje parecem bem razoáveis poderão revelar-se erradas mais tarde;

A melhor maneira de se evitar problemas é mantendo várias opções em aberto;

Um sistema deve ser capaz de interagir com largo número de outros sistemas e serviços;

A inserção de novos módulos no sistema deve ser uma tarefa simples;

Permitir alterações e modificações no próprio sistema operacional:
- Conceitos atuais podem não ser os melhores no futuro.
- Como a tecnologia ainda não está consolidada, a flexibilidade é importante como um meio para caminhos alternativos.

---

## Confiabilidade

- Disponibilidade;
- Resiliência;
- Segurança;

Teoria: se uma máquina falhar, outra máquina continua o serviço, sem prejuízo do cliente;

Prática: o sistema distribuído depende de um número de máquinas-chave;

"Sistema Distribuído é aquele onde você não consegue trabalhar porque alguma máquina, da qual você nunca ouviu falar, saiu do ar...";

---

## Disponibilidade

Propriedade de um sistema poder funcionar continuamente sem falha.

Para ser confiável, um sistema deve possuir alta disponibilidade e segurança.

Sistemas distribuídos podem ser potencialmente mais confiáveis devido à multiplicidade e a um certo grau de autonomia de suas partes;

É notório que a distribuição física não é tão importante quanto a distribuição lógica. Esta última pode ser implementada tanto a um único processador quanto a vários processadores localizados em um mesmo ambiente ou em ambientes distintos;

### Tabela de Disponibilidade

| Disponibilidade (%) | Downtime/ano      | Downtime/mês      |
|---------------------|-------------------|-------------------|
| 95%                 | 18 dias 6:00:00   | 1 dias 12:00:00   |
| 96%                 | 14 dias 14:24:00  | 1 dias 4:48:00    |
| 97%                 | 10 dias 22:48:00  | 0 dias 21:36:00   |
| 98%                 | 7 dias 7:12:00    | 0 dias 14:24:00   |
| 99%                 | 3 dias 15:36:00   | 0 dias 7:12:00    |
| 99,9%               | 0 dias 8:45:35.99 | 0 dias 0:43:11.99 |
| 99,99%              | 0 dias 0:52:33.60 | 0 dias 0:04:19.20 |
| 99,999%             | 0 dias 0:05:15.36 | 0 dias 0:00:25.92 |

---

## Desempenho

Um Sistema Distribuído não será útil se não tiver desempenho razoável.

Como medir desempenho?
- Tempo de resposta;
- Throughput (número de jobs por hora);
- Taxa de utilização do sistema;
- Capacidade de rede consumida;

---

## Exemplo

Tempo de criação de um bloco em diversas redes de cripto ativos:
- Ethereum: 13 segundos;
- Solana: 0,4 segundos;
- Cardano: 20 segundos;
- Binance Smart Chain: 3 segundos;
- Avalanche: 1,7 segundos;
- Polygon: 2,2 segundos;
- Polkadot: 7 segundos;
- BitCoin: 10 minutos;

---

## Exercício

Conforme instruções em sala.
