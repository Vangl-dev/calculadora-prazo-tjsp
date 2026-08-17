/* ============================================================================
   TESTES OBRIGATÓRIOS — CALCULADORA DE PRAZOS TJSP 2026
   Executar com: node testes.js
   ============================================================================ */

const assert = require("assert");
const {
  calendario,
  dataDeISO,
  formatar,
  isDiaUtil,
  calcularPrazo
} = require("./calculadora.js");

let falhas = 0;

function ok(cond, msg) {
  if (cond) {
    console.log("  OK  " + msg);
  } else {
    falhas++;
    console.error("  FALHOU  " + msg);
  }
}

function dia(d) {
  return formatar(d);
}

console.log("=== TESTES OBRIGATÓRIOS — TJSP 2026 ===\n");

/* ------------------------------------------------------------------ */
console.log("TESTE 1 — Caso crítico (publicação 17/04/2026, prazo 5)");
{
  const r = calcularPrazo("2026-04-17", 5);
  ok(formatar(r.ultimo) === "28/04/2026", "Último dia = 28/04/2026 (obtido: " + formatar(r.ultimo) + ")");
  ok(formatar(r.inicio) === "22/04/2026", "Início da contagem = 22/04/2026");
  ok(r.diasNaoUteis === 6, "Dias não úteis excluídos = 6 (obtido: " + r.diasNaoUteis + ")");

  const motivos = r.linhas.reduce((acc, l) => {
    if (l.motivo) acc[dia(l.data)] = l.motivo;
    return acc;
  }, {});
  ok(motivos["18/04/2026"] === "Sábado", "18/04 excluído como Sábado");
  ok(motivos["19/04/2026"] === "Domingo", "19/04 excluído como Domingo");
  ok(motivos["20/04/2026"] === "Suspensão do expediente", "20/04 excluído (suspensão TJSP)");
  ok(motivos["21/04/2026"] === "Tiradentes", "21/04 excluído (Tiradentes)");
  ok(motivos["25/04/2026"] === "Sábado", "25/04 excluído como Sábado");
  ok(motivos["26/04/2026"] === "Domingo", "26/04 excluído como Domingo");

  console.log("\n  Memória de cálculo (TESTE 1):");
  r.linhas.forEach(l => {
    const contagem = l.contagem === null ? "—" : String(l.contagem);
    console.log(
      "  " + formatar(l.data).padEnd(12) +
      l.situacao.padEnd(16) +
      (l.motivo || "—").padEnd(24) +
      contagem
    );
  });
}

/* ------------------------------------------------------------------ */
console.log("\nTESTE 2 — Publicação 20/04/2026, prazo 1");
{
  const r = calcularPrazo("2026-04-20", 1);
  ok(formatar(r.ultimo) === "22/04/2026", "Último dia = 22/04/2026 (obtido: " + formatar(r.ultimo) + ")");
  ok(r.diasNaoUteis === 1, "Excluído apenas 21/04 (Tiradentes)");
}

/* ------------------------------------------------------------------ */
console.log("\nTESTE 3 — Publicação 30/04/2026, prazo 1");
{
  const r = calcularPrazo("2026-04-30", 1);
  ok(formatar(r.ultimo) === "04/05/2026", "Último dia = 04/05/2026 (obtido: " + formatar(r.ultimo) + ")");
  ok(r.diasNaoUteis === 3, "Excluídos 01/05 (Trabalho), 02/05 (sáb), 03/05 (dom)");
}

/* ------------------------------------------------------------------ */
console.log("\nTESTE 4 — Publicação 03/06/2026, prazo 2");
{
  const r = calcularPrazo("2026-06-03", 2);
  const motivos = r.linhas.reduce((acc, l) => {
    if (l.motivo) acc[dia(l.data)] = l.motivo;
    return acc;
  }, {});
  ok(motivos["04/06/2026"] === "Corpus-Christi", "04/06 excluído (Corpus-Christi)");
  ok(motivos["05/06/2026"] === "Suspensão do expediente", "05/06 excluído (suspensão)");
  ok(motivos["06/06/2026"] === "Sábado", "06/06 excluído (sábado)");
  ok(motivos["07/06/2026"] === "Domingo", "07/06 excluído (domingo)");
  ok(formatar(r.inicio) === "08/06/2026", "Início da contagem (dia 1) = 08/06/2026");
  ok(formatar(r.ultimo) === "09/06/2026",
     "Regra §1 → 08/06 é o dia 1 e 09/06 o dia 2 (último dia = 09/06/2026). " +
     "O enunciado da tarefa dizia 08/06, mas isso contradiz a regra: " +
     "a publicação (03/06) não é contada e o primeiro dia útil seguinte (08/06) é o dia 1.");
}

/* ------------------------------------------------------------------ */
console.log("\nTESTE 5 — Publicação 09/07/2026, prazo 1");
{
  const r = calcularPrazo("2026-07-09", 1);
  ok(formatar(r.ultimo) === "13/07/2026", "Último dia = 13/07/2026 (obtido: " + formatar(r.ultimo) + ")");
  ok(r.diasNaoUteis === 3, "Excluídos 10/07 (susp), 11/07 (sáb), 12/07 (dom)");
}

/* ------------------------------------------------------------------ */
console.log("\nTESTE 6 — Recesso (publicação 18/12/2026, prazo 1)");
{
  const r = calcularPrazo("2026-12-18", 1);
  ok(formatar(r.ultimo) === "21/01/2027", "Último dia = 21/01/2027 (obtido: " + formatar(r.ultimo) + ")");
  ok(r.diasNaoUteis === 33, "Excluídos: 19/12 (sáb) + recesso 20/12/2026–20/01/2027 (32 dias)");
  ok(isDiaUtil(dataDeISO("2026-12-20")) === false, "20/12/2026 não é dia útil (início do recesso)");
  ok(isDiaUtil(dataDeISO("2026-12-25")) === false, "25/12/2026 não é dia útil (recesso)");
  ok(isDiaUtil(dataDeISO("2027-01-20")) === false, "20/01/2027 não é dia útil (fim do recesso)");
  ok(isDiaUtil(dataDeISO("2027-01-21")) === true, "21/01/2027 é o primeiro dia útil após o recesso");
}

/* ------------------------------------------------------------------ */
console.log("\n=== VERIFICAÇÕES DE DATAS CRÍTICAS (nunca podem ser dias úteis) ===");
const criticas = [
  "2026-04-20", "2026-04-21", "2026-05-01",
  "2026-06-04", "2026-06-05", "2026-07-09", "2026-07-10",
  "2026-01-25", "2026-02-16", "2026-02-17", "2026-04-02", "2026-04-03",
  "2026-09-07", "2026-10-12", "2026-10-28", "2026-11-02", "2026-11-20",
  "2026-12-07", "2026-12-08", "2026-12-20", "2027-01-01"
];
criticas.forEach(iso => {
  ok(isDiaUtil(dataDeISO(iso)) === false, iso + " não é dia útil");
});

console.log("\n=== VERIFICAÇÃO DO CALENDÁRIO (exatamente as datas fornecidas) ===");
const esperadas = [
  "2026-01-25", "2026-02-16", "2026-02-17", "2026-04-02", "2026-04-03",
  "2026-04-20", "2026-04-21", "2026-05-01", "2026-06-04", "2026-06-05",
  "2026-07-09", "2026-07-10", "2026-09-07", "2026-10-12", "2026-10-28",
  "2026-11-02", "2026-11-20", "2026-12-07", "2026-12-08"
];
ok(
  esperadas.length === Object.keys(calendario.naoUteis).length,
  "Número de datas no calendário = " + esperadas.length
);
esperadas.forEach(iso => {
  ok(calendario.naoUteis[iso] !== undefined, iso + " cadastrada no calendário");
});
ok(
  calendario.recesso.inicio === "2026-12-20" && calendario.recesso.fim === "2027-01-20",
  "Recesso = 20/12/2026 a 20/01/2027"
);

console.log("\n=== RESUMO ===");
console.log(falhas === 0 ? "TODOS OS TESTES PASSARAM" : falhas + " TESTE(S) FALHARAM");
process.exit(falhas === 0 ? 0 : 1);