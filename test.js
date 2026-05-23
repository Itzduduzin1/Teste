const API = "https://testsunsa.discloud.app/api";
let token = null;
let tarefasCache = [];

// ─────────────────────────────
// CARREGAR TAREFAS
// ─────────────────────────────
function abrirModal(tarefas) {
  const overlay = document.getElementById("overlay");
  const taskList = document.getElementById("taskList");

  taskList.innerHTML = "";

  tarefas.forEach(item => {
    const div = document.createElement("div");
    div.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.id = item.id;

    const label = document.createElement("span");
    label.innerText = item.titulo;

    div.appendChild(checkbox);
    div.appendChild(label);

    taskList.appendChild(div);
  });

  overlay.classList.remove("hidden");
}

async function iniciarTarefa(id) {
  const res = await fetch("https://api-tarefa-6fw9.onrender.com/api/fazer-tarefa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id,
      token
    })
  });

  const data = await res.json();

  console.log("IA respondeu:", data.resposta);
  notify("Tarefa feita com sucesso!", "success");
}

async function carregarTarefas(type) {
  if (!type) type = "pendentes";
  try {
    const response = await fetch(`${API}/tarefas/${type}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    const pendentes = data.filter(t => !t.entregue && !t.expirada);
    const entregues = data.filter(t => t.entregue);
    const expiradas = data.filter(t => t.expirada);

    tarefasCache = {
      pendentes,
      entregues,
      expiradas
    };

    abrirModal(pendentes);

    console.log({
      pendentes,
      entregues,
      expiradas
    });

    return tarefasCache;

  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
  }
}

async function carregarProvas() {
  try {
    const response = await fetch(`${API}/provas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    console.log("PROVAS:", data);

    return data;
  } catch (error) {
    console.error("Erro ao carregar provas:", error);
  }
}

async function login(ra, senha) {
  try {
    const response = await fetch(`${API}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: ra,
        senha: senha,
      }),
    });

    const data = await response.json();
    if (!data.token) {
      notify(
        `Login falhou: ${data.message || data.erro || "Erro desconhecido"}`,
        "error"
      );
      console.log("Login falhou:", data);
      return data;
    }

    token = data.token;
    notify("Login feito com sucesso!", "success");
    console.log("Login OK");

    return data;
  } catch (error) {
    console.error("Erro no login:", error);
    notify("Login feito com sucesso!", "success");
  }
}

// ─────────────────────────────
// FORM LOGIN
// ─────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputs = form.querySelectorAll("input");

    const ra = inputs[0].value;
    const senha = inputs[1].value;

    const data = await login(ra, senha);

    if (data?.token) {
      token = data.token;
    }
  });
});

function notify(message, type = "info", time = 3000) {
  const container = document.getElementById("notify-container");

  const div = document.createElement("div");
  div.classList.add("notify", type);
  div.innerText = message;

  container.appendChild(div);

  setTimeout(() => {
    div.style.opacity = "0";
    div.style.transform = "translateX(30px)";
    div.style.transition = "0.3s";

    setTimeout(() => div.remove(), 300);
  }, time);
}

// ─────────────────────────────
// EXPOR FUNÇÕES GLOBALMENTE
// (IMPORTANTE pros botões funcionarem)
// ─────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");

  const selectAll = document.getElementById("selectAll");
  const startBtn = document.getElementById("startBtn");
  const overlay = document.getElementById("overlay");

  // LOGIN
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputs = form.querySelectorAll("input");

    const ra = inputs[0].value;
    const senha = inputs[1].value;

    const res = await login(ra, senha);

    if (res.token) {
      console.log("logado");
    }
  });

  // SELECT ALL
  selectAll.addEventListener("click", () => {
    document.querySelectorAll("#taskList input[type='checkbox']")
      .forEach(cb => cb.checked = true);
  });

  // FAZER
  startBtn.addEventListener("click", () => {
    const selecionados = [...document.querySelectorAll("#taskList input:checked")]
      .map(cb => cb.dataset.id);

    console.log("Selecionados:", selecionados);

    overlay.classList.add("hidden");

    selecionados.forEach(id => {
      iniciarTarefa(id);
    });
  });
});

// export global
window.carregarTarefas = carregarTarefas;
window.login = login;
