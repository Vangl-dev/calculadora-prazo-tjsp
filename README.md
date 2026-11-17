# Calculadora de Prazos TJSP

Calculadora de prazos processuais para o Tribunal de Justiça de São Paulo (TJSP).

A ferramenta roda **localmente no navegador** — sem backend e sem dependência de API externa para o cálculo.

## Características

- Cálculo em **dias úteis**;
- A data da publicação **não entra** na contagem;
- O primeiro dia útil seguinte à publicação é o **dia 1**;
- Calendário oficial do TJSP (feriados, emendas e suspensões de expediente);
- Recesso / suspensão da contagem (20/12 a 20/01);
- Sábados e domingos sempre excluídos;
- **Memória detalhada da contagem**: cada dia percorrido, o motivo da exclusão e a contagem;
- Interface responsiva para desktop e celular.

## Calendário atual

**TJSP — São Paulo — 2026.**

O calendário é mantido manualmente a cada ano a partir da fonte oficial do TJSP. Para trocar de ano, basta substituir o objeto `calendario` em `calculadora.js` pela nova competência — o motor de cálculo não precisa de alterações.

## Testes

Existe uma bateria de testes automatizados em `testes.js`, cobrindo casos críticos (feriados, emendas, suspensões, recesso) e a regra de contagem.

```bash
node testes.js
```

O resultado esperado é a saída `TODOS OS TESTES PASSARAM` (exit code `0`).

## Estrutura

| Arquivo | Descrição |
| --- | --- |
| `index.html` | Interface da calculadora |
| `style.css` | Estilos |
| `app.js` | Camada de interface (DOM) |
| `calculadora.js` | Motor de cálculo e calendário TJSP 2026 |
| `testes.js` | Bateria de testes automatizados |

## Fonte

Calendário de expediente forense do TJSP:

https://www.tjsp.jus.br/CanaisComunicacao/Feriados/ExpedienteForense

> **Aviso:** esta ferramenta é apenas auxiliar. A conferência do calendário de expediente aplicável ao processo continua sendo necessária antes de qualquer ato processual.

## Licença

Copyright (c) 2026 Vanessa GLdev. Distribuído sob a licença MIT. Veja o arquivo
[LICENSE](LICENSE).
