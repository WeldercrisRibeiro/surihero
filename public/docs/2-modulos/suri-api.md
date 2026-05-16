# Suri API

O módulo **Suri API** permite testar endpoints da API TOTVS de forma rápida, sem precisar de ferramentas externas como Postman.

## Como usar

1. Acesse o módulo **Suri API** no dashboard.
2. Insira suas credenciais na barra superior (usuário e senha TOTVS).
3. Selecione o endpoint desejado ou configure um customizado.
4. Clique em **Executar** para ver o resultado.

> [!WARNING]
> As credenciais inseridas são armazenadas apenas localmente no navegador. Nunca compartilhe o dispositivo logado com pessoas não autorizadas.

## Exemplo de resposta

```json
{
  "status": 200,
  "data": {
    "id": "00123",
    "nome": "João Silva",
    "ativo": true
  }
}
```

## Erros comuns

- **401 Unauthorized** – Credenciais inválidas ou expiradas.
- **404 Not Found** – Endpoint incorreto ou recurso não encontrado.
- **500 Internal Server Error** – Problema no servidor TOTVS. Tente novamente mais tarde.
