/* ============================================================================
   CALCULADORA DE PRAZOS TJSP — CAMADA DE INTERFACE (DOM)
   Motor de cálculo: calculadora.js (não alterado).
   ============================================================================ */

var MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function dataExtensa(data) {
  return String(data.getDate()).padStart(2, "0") + " " + MESES[data.getMonth()] + " " + data.getFullYear();
}

function calcular() {
  const inicioInput = document.getElementById("dataInicio").value;
  const prazo = Number.parseInt(document.getElementById("prazo").value, 10);

  if (!inicioInput) {
    alert("Informe a data da publicação.");
    return;
  }
  if (!Number.isInteger(prazo) || prazo < 1) {
    alert("Informe um prazo inteiro maior que zero.");
    return;
  }

  const publicacao = dataDeISO(inicioInput);
  if (publicacao.getFullYear() !== calendario.ano) {
    alert(
      "Esta versão está configurada para o calendário TJSP de " +
      calendario.ano +
      ". Atualize o calendário antes de calcular outra competência."
    );
    return;
  }

  const r = calcularPrazo(inicioInput, prazo);

  const tabela = document.getElementById("tabela");
  tabela.innerHTML = "";
  r.linhas.forEach(adicionarLinha);

  const prazoTexto = prazo === 1 ? "1 dia útil" : prazo + " dias úteis";

  const resultado = document.getElementById("resultado");
  resultado.innerHTML =
    '<div class="resultado-card">' +
      "<div>" +
        '<div class="resultado-label">Último dia do prazo</div>' +
        '<div class="resultado-data">' + dataExtensa(r.ultimo) + "</div>" +
      "</div>" +
      '<div class="resultado-meta">' +
        metaItem("Publicação", formatar(r.publicacao)) +
        metaItem("Início", formatar(r.inicio)) +
        metaItem("Prazo", prazoTexto) +
        metaItem("Dias não úteis", String(r.diasNaoUteis)) +
      "</div>" +
    "</div>";

  resultado.style.display = "block";
  document.getElementById("detalhes").style.display = "block";
}

function metaItem(rotulo, valor) {
  return (
    '<div class="meta-item"><span>' + rotulo + "</span><strong>" + valor + "</strong></div>"
  );
}

function adicionarLinha(linha) {
  const tr = document.createElement("tr");
  tr.className = linha.tipo;

  const contagem = linha.contagem === null ? "—" : String(linha.contagem);
  const motivo = linha.motivo || "—";

  tr.innerHTML =
    "<td>" + formatar(linha.data) + "</td>" +
    '<td><span class="status ' + linha.tipo + '">' + linha.situacao + "</span></td>" +
    "<td>" + motivo + "</td>" +
    "<td>" + contagem + "</td>";

  document.getElementById("tabela").appendChild(tr);
}

function montarCalendario() {
  const ul = document.getElementById("calLista");
  ul.innerHTML = "";

  Object.keys(calendario.naoUteis).sort().forEach(function (iso) {
    const partes = iso.split("-");
    const li = document.createElement("li");

    const spanDia = document.createElement("span");
    spanDia.className = "cal-dia";
    spanDia.textContent = partes[2] + "/" + partes[1] + "/" + partes[0];

    const spanNome = document.createElement("span");
    spanNome.className = "cal-nome";
    spanNome.textContent = calendario.naoUteis[iso];

    li.appendChild(spanDia);
    li.appendChild(spanNome);
    ul.appendChild(li);
  });
}

document.getElementById("calc-form").addEventListener("submit", function (e) {
  e.preventDefault();
  calcular();
});

document.getElementById("btnCalendario").addEventListener("click", function () {
  const detalhe = document.getElementById("calDetalhe");
  const abrir = detalhe.hidden;
  detalhe.hidden = !abrir;
  this.setAttribute("aria-expanded", String(abrir));
  if (abrir) montarCalendario();
});

window.calcular = calcular;