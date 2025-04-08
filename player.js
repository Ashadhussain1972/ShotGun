const start = document.getElementById("start");
const playerInput = document.getElementById("playerInput");
const output = document.getElementById("output");
const playerContainer = document.getElementById("playerContainer");
const nextTurnBtn = document.getElementById("nextTurn");

let players = [];
let currentPlayer = 0;
let shotgun = [];
let round = 1;

const itemPool = [
  {
    name: "X-ray Scanner",
    description: "Reveal shell status",
    use: (player, message) => {
      const status = shotgun[0] ? "LIVE" : "BLANK";
      message.textContent = `🔍 Shell is: ${status}`;
    },
  },
  {
    name: "Medkit",
    description: "Restore 1 life",
    use: (player, lifeDisplay, message) => {
      player.life++;
      lifeDisplay.textContent = `Life: ${player.life}`;
      message.textContent = "💉 Medkit used: +1 Life";
    },
  },
  {
    name: "Mirror Shard",
    description: "Reflect shot (1 use, auto)",
    auto: true,
    use: () => {},
  },
  {
    name: "Adrenaline",
    description: "Take 2 turns in a row",
    use: (player, message) => {
      player.extraTurn = true;
      message.textContent = "⚡ Adrenaline: Extra turn!";
    },
  },
];

function initShotgun() {
  shotgun = [];
  for (let i = 0; i < 5; i++) {
    let shell = Math.floor(Math.random() * 10);
    shotgun.push(shell % 2 === 0);
  }
  shotgun.splice(Math.floor(Math.random() * shotgun.length), 1);
}

function getRandomItems(n) {
  const shuffled = [...itemPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function setupPlayers(count) {
  players = [];
  playerContainer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const player = {
      id: i,
      life: 3,
      items: getRandomItems(3),
      dead: false,
      buttons: [],
      extraTurn: false,
      reflected: false,
    };
    createPlayerUI(player);
    players.push(player);
  }
}

function createPlayerUI(player) {
  const box = document.createElement("div");
  box.className = "player-box";
  box.id = `player-${player.id}`;

  const title = document.createElement("h3");
  title.textContent = `Player ${player.id + 1}`;

  const life = document.createElement("p");
  life.className = "life";
  life.textContent = `Life: ${player.life}`;

  const message = document.createElement("p");
  message.className = "message";

  const itemList = document.createElement("ul");

  player.items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - ${item.description}`;
    const btn = document.createElement("button");
    btn.textContent = "Use";
    btn.disabled = true;
    btn.addEventListener("click", () => {
      item.use(player, life, message);
      btn.disabled = true;
    });
    li.appendChild(btn);
    itemList.appendChild(li);
    player.buttons.push(btn);
  });

  const shootSelfBtn = document.createElement("button");
  shootSelfBtn.textContent = "🔫 Shoot Yourself";
  shootSelfBtn.disabled = true;
  shootSelfBtn.addEventListener("click", () => shootPlayer(player.id));

  player.shootSelfBtn = shootSelfBtn;

  const shootOthers = document.createElement("div");
  shootOthers.className = "shoot-others";

  player.shootBtns = [];

  box.appendChild(title);
  box.appendChild(life);
  box.appendChild(itemList);
  box.appendChild(shootSelfBtn);
  box.appendChild(shootOthers);
  box.appendChild(message);
  playerContainer.appendChild(box);
}

function updateButtons() {
  players.forEach((p, index) => {
    const isActive = index === currentPlayer && !p.dead;
    p.buttons.forEach(btn => (btn.disabled = !isActive));
    p.shootSelfBtn.disabled = !isActive;

    const shootOthersDiv = document.querySelector(`#player-${index} .shoot-others`);
    shootOthersDiv.innerHTML = "";

    if (isActive) {
      players.forEach((target, idx) => {
        if (idx !== index && !target.dead) {
          const btn = document.createElement("button");
          btn.textContent = `Shoot Player ${idx + 1}`;
          btn.addEventListener("click", () => shootPlayer(idx));
          shootOthersDiv.appendChild(btn);
          p.shootBtns.push(btn);
        }
      });
    }
  });
}

function shootPlayer(targetId) {
  const shooter = players[currentPlayer];
  const target = players[targetId];

  const isLive = shotgun.shift();
  const log = document.querySelector(`#player-${targetId} .message`);
  const lifeDisplay = document.querySelector(`#player-${targetId} .life`);

  if (isLive) {
    target.life--;
    log.textContent = `💥 BOOM! Player ${targetId + 1} got shot!`;
    lifeDisplay.textContent = `Life: ${target.life}`;
    if (target.life <= 0) {
      target.dead = true;
      disableAllButtons(target);
      log.textContent += " ☠️ DEAD!";
    }
  } else {
    log.textContent = "🫰 Blank! Lucky!";
  }

  if (shotgun.length === 0) {
    startNextRound();
    return;
  }

  if (!shooter.extraTurn) {
    nextTurn();
  } else {
    shooter.extraTurn = false;
  }
}

function disableAllButtons(player) {
  player.buttons.forEach(btn => (btn.disabled = true));
  player.shootSelfBtn.disabled = true;
  player.shootBtns.forEach(btn => (btn.disabled = true));
}

function nextTurn() {
  const alive = players.filter(p => !p.dead);
  if (alive.length <= 1) {
    alert(`🎉 Player ${alive[0].id + 1} wins!`);
    return;
  }

  do {
    currentPlayer = (currentPlayer + 1) % players.length;
  } while (players[currentPlayer].dead);

  updateButtons();
}

function startNextRound() {
  round++;
  alert(`🔄 Round ${round} begins!`);
  initShotgun();

  players.forEach(player => {
    if (!player.dead) {
      player.items = getRandomItems(3);
      player.extraTurn = false;
      const box = document.querySelector(`#player-${player.id}`);
      const list = box.querySelector("ul");
      const message = box.querySelector(".message");
      const lifeDisplay = box.querySelector(".life");

      list.innerHTML = "";
      player.buttons = [];

      player.items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.name} - ${item.description}`;
        const btn = document.createElement("button");
        btn.textContent = "Use";
        btn.addEventListener("click", () => {
          item.use(player, lifeDisplay, message);
          btn.disabled = true;
        });
        li.appendChild(btn);
        list.appendChild(li);
        player.buttons.push(btn);
      });
    }
  });

  updateButtons();
}

function startGame() {
  const count = parseInt(playerInput.value);
  if (isNaN(count) || count < 2 || count > 4) {
    output.textContent = "Please enter a number between 2–4.";
    return;
  }

  initShotgun();
  setupPlayers(count);
  currentPlayer = 0;
  round = 1;
  output.style.display = "none";
  playerInput.style.display = "none";
  start.style.display = "none";
  nextTurnBtn.style.display = "none";
  updateButtons();
}

start.addEventListener("click", startGame);
 