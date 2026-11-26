/* ============================================================================
   CALCULADORA DE PRAZOS TJSP — MOTOR DE CÁLCULO
   Fonte de verdade: calendário oficial de expediente forense TJSP (São Paulo).
   2026: calendário oficial do TJSP de 2026.
   2027: Provimento CSM nº 2.850/2026 (DJE de 17/11/2026) + feriado municipal
         da Capital (25/01).
   Para um novo ano: acrescente as datas em `naoUteis`, o período em `recessos`,
   o ano em `anos` e atualize `ano` (último ano cadastrado). O motor não muda.
   ============================================================================ */

var calendario = {
  ano: 2027,            /* último ano cadastrado */
  anos: [2026, 2027],
  naoUteis: {
    /* 2026 */
    "2026-01-25": "Fundação da Cidade de São Paulo",
    "2026-02-16": "Carnaval",
    "2026-02-17": "Carnaval",
    "2026-04-02": "Endoenças",
    "2026-04-03": "Sexta-feira da Paixão",
    "2026-04-20": "Suspensão do expediente",
    "2026-04-21": "Tiradentes",
    "2026-05-01": "Dia do Trabalho",
    "2026-06-04": "Corpus-Christi",
    "2026-06-05": "Suspensão do expediente",
    "2026-07-09": "Data Magna do Estado de São Paulo",
    "2026-07-10": "Suspensão do expediente",
    "2026-09-07": "Independência do Brasil",
    "2026-10-12": "Nossa Senhora Aparecida",
    "2026-10-28": "Dia do Servidor Público",
    "2026-11-02": "Finados",
    "2026-11-20": "Dia Nacional de Zumbi e da Consciência Negra",
    "2026-12-07": "Suspensão do expediente",
    "2026-12-08": "Dia da Justiça",
    /* 2027 — Provimento CSM nº 2.850/2026 (1º a 06/01 e 20 a 31/12: recesso) */
    "2027-01-25": "Fundação da Cidade de São Paulo",
    "2027-02-08": "Carnaval",
    "2027-02-09": "Carnaval",
    "2027-03-25": "Endoenças",
    "2027-03-26": "Sexta-feira da Paixão",
    "2027-04-21": "Tiradentes",
    "2027-05-27": "Corpus-Christi",
    "2027-05-28": "Suspensão do expediente",
    "2027-07-09": "Data Magna do Estado de São Paulo",
    "2027-09-06": "Suspensão do expediente",
    "2027-09-07": "Independência do Brasil",
    "2027-10-11": "Suspensão do expediente",
    "2027-10-12": "Nossa Senhora Aparecida",
    "2027-10-28": "Dia do Servidor Público",
    "2027-11-01": "Suspensão do expediente",
    "2027-11-02": "Finados",
    "2027-11-15": "Proclamação da República",
    "2027-12-08": "Dia da Justiça"
  },
  /* suspensão dos prazos de 20/12 a 20/01 (CPC, art. 220) */
  recessos: [
    { inicio: "2026-12-20", fim: "2027-01-20", motivo: "Recesso / suspensão da contagem" },
    { inicio: "2027-12-20", fim: "2028-01-20", motivo: "Recesso / suspensão da contagem" }
  ]
};

/* Período de recesso que contém a data ISO, ou null. */
function recessoDe(iso) {
  for (const r of calendario.recessos) {
    if (iso >= r.inicio && iso <= r.fim) return r;
  }
  return null;
}

/* Gera "YYYY-MM-DD" a partir de um Date, usando horário LOCAL.
   Nunca usar toISOString() aqui: desloca a data por causa de UTC/fuso. */
function toISODateLocal(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return ano + "-" + mes + "-" + dia;
}

/* Cria um Date a partir de "YYYY-MM-DD" no meio-dia local, evitando
   deslocamento de fuso na comparação de calendário. */
function dataDeISO(iso) {
  const partes = iso.split("-").map(Number);
  return new Date(partes[0], partes[1] - 1, partes[2], 12, 0, 0);
}

/* Soma dias corridos preservando o horário local (meio-dia). */
function addDias(data, dias) {
  const nova = new Date(data.getFullYear(), data.getMonth(), data.getDate(), 12, 0, 0);
  nova.setDate(nova.getDate() + dias);
  return nova;
}

/* Motivo da não utilidade do dia (ordem: fim de semana, calendário, recesso). */
function motivoNaoUtil(data) {
  const iso = toISODateLocal(data);
  const dia = data.getDay();
  if (dia === 0) return "Domingo";
  if (dia === 6) return "Sábado";
  if (calendario.naoUteis[iso]) return calendario.naoUteis[iso];
  const rec = recessoDe(iso);
  if (rec) return rec.motivo;
  return "Não informado";
}

/* 1. sábado; 2. domingo; 3. calendário TJSP; 4. recesso; 5. dia útil. */
function isDiaUtil(data) {
  const iso = toISODateLocal(data);
  const dia = data.getDay();

  if (dia === 0 || dia === 6) return false;
  if (calendario.naoUteis[iso]) return false;
  if (recessoDe(iso)) return false;

  return true;
}

/* Formata um Date como "DD/MM/YYYY". */
function formatar(data) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return dia + "/" + mes + "/" + data.getFullYear();
}

/* Primeiro dia útil após a publicação (dia 1 da contagem). */
function dataInicialDoPrazo(publicacao) {
  let data = addDias(publicacao, 1);
  while (!isDiaUtil(data)) data = addDias(data, 1);
  return data;
}

/* ============================================================================
   MOTOR PRINCIPAL
   A publicação NÃO é contada. A contagem começa no primeiro dia útil seguinte
   à publicação (dia 1) e segue até completar `prazo` dias úteis.

   Retorna { publicacao, inicio, ultimo, prazo, diasNaoUteis, linhas }.
   `linhas` é a memória de cálculo com cada dia percorrido.
   ============================================================================ */
function calcularPrazo(publicacaoISO, prazo) {
  const publicacao = dataDeISO(publicacaoISO);

  const linhas = [{
    data: publicacao,
    situacao: "Publicação",
    motivo: "Publicação",
    contagem: null,
    tipo: "pub"
  }];

  let data = addDias(publicacao, 1);
  let contador = 0;
  let pulados = 0;

  while (contador < prazo) {
    if (isDiaUtil(data)) {
      contador++;
      const eUltimo = contador === prazo;
      const situacao = contador === 1 ? "Início do prazo" : (eUltimo ? "Último dia" : "Dia útil");
      const tipo = contador === 1 ? "inicio" : (eUltimo ? "final" : "ok");
      const motivo = contador === 1 ? "Dia útil" : "";
      linhas.push({
        data: data,
        situacao: situacao,
        motivo: motivo,
        contagem: contador,
        tipo: tipo
      });
    } else {
      pulados++;
      linhas.push({
        data: data,
        situacao: "Não útil",
        motivo: motivoNaoUtil(data),
        contagem: null,
        tipo: "skip"
      });
    }
    if (contador < prazo) data = addDias(data, 1);
  }

  return {
    publicacao: publicacao,
    inicio: dataInicialDoPrazo(publicacao),
    ultimo: data,
    prazo: prazo,
    diasNaoUteis: pulados,
    linhas: linhas
  };
}

/* Exposição: navegador e Node.js (para os testes). */
if (typeof window !== "undefined") {
  window.calendario = calendario;
  window.toISODateLocal = toISODateLocal;
  window.dataDeISO = dataDeISO;
  window.addDias = addDias;
  window.motivoNaoUtil = motivoNaoUtil;
  window.recessoDe = recessoDe;
  window.isDiaUtil = isDiaUtil;
  window.formatar = formatar;
  window.dataInicialDoPrazo = dataInicialDoPrazo;
  window.calcularPrazo = calcularPrazo;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calendario: calendario,
    toISODateLocal: toISODateLocal,
    dataDeISO: dataDeISO,
    addDias: addDias,
    motivoNaoUtil: motivoNaoUtil,
    recessoDe: recessoDe,
    isDiaUtil: isDiaUtil,
    formatar: formatar,
    dataInicialDoPrazo: dataInicialDoPrazo,
    calcularPrazo: calcularPrazo
  };
}