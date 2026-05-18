Siga totalmente as instruções abaixo e aplique de forma explendida cada instrução, documentando tudo.

1 - Gere uma pasta chamada Guide e nela você vai criar um arquivo chamado Style.md relatando como funciona totalmente a parte visual, fontes, bibliotoca de icones, cores e etc.

2 - Crie um arquivo chamado guide.md, que relate como funciona toda a plataforma, estrutura de pastas, dependencias e como funciona cada arquivo. e tudo que for relevante para o projeto. Ele será o guia do projeto.

3 - Crie um arquivo chamado models.md voltado somente para estrutura do banco de dados, mesmo que esteja em desenvolvimento.

4 - Crie um arquivo chamado rules, onde será definido toda a regra de negócio de acordo com o tópico. 

5 - crie um espaço, para solicitações que forem feitas, após a implementação seja documentado daqui em diante. A pasta deve se chamar de features, e dentro dela, deve ficar uma pasta chamada implemented, e outra pending para demandas em criação, análise. Com isso toda demanda que for atualizada e ficar na pasta implemented, deverá ser documetnada automaticamente no models.md, rules e no guide.md.

6 - Crie um arquivo chamado changelog.md para relatar todas as mudanças e correções feitas de acordo com a versão, tipo 

## [2.5.7] - 2026-05-14

### Alterado
- Relatórios: em `/reports/installment-analysis`, os cards de parcelas passam a usar o logo do estabelecimento como avatar principal; o logo do cartão agora aparece menor ao lado do nome do cartão, tanto no card quanto no modal de detalhes.
- Relatórios: a página de análise de parcelas pré-carrega os mapeamentos de logos de estabelecimentos para evitar troca visual após o primeiro render.
- Lançamentos: o campo de anexos no modal agora aceita arquivos colados com `Ctrl+V`, mantendo o botão para buscar arquivos normalmente.
- Lançamentos: o modal agora usa uma única área interna de rolagem, com cabeçalho e rodapé estáveis, reduzindo travadas ao rolar e ao abrir "Condições, anotações e anexos".
- Anotações: tarefas agora podem ser editadas inline no modal "Atualizar anotação"; clicar no texto abre o input e o botão de remover vira botão de salvar naquela linha.

### Corrigido
- Relatórios: o join com cartões na análise de parcelas agora também valida `cards.userId`, mantendo o filtro de ownership explícito na consulta.

E isso deverá ficar registrado automaticamente no modal de novidades. Então o arquivo changelogModal.tsx deve ler tudo que tiver nesse arquivo, que será separado por versões:

2.5.7.md
2.5.6.md
2.5.5.md

