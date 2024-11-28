const participants = [];
const predefinedAdditionalPrizesFirst = [
  { name: "Jam Dinding ", quantity: 8 },
  { name: "Payung", quantity: 8 },
  { name: "Lunch Box Set", quantity: 8 },
];

const predefinedAdditionalPrizesSecond = [
  { name: "Lunch Box", quantity: 8 },
  { name: "CL Mug", quantity: 5 },
  { name: "Goody Backpack", quantity: 13 },
];

const predifinedPrimaryPrizes = [
  { name: "Sharp Electric Iron", quantity: 3 },
  { name: "Philips Electric Iron", quantity: 1 },
];

const prizes = [];
const winners = [];
const blacklist = [];
const pendingWinners = [];
let currentPrize = null;

const updatePrizes = () => {
  const list = document.getElementById("prizes");
  list.innerHTML = prizes
    .map(
      (p) => `
                <li class="${
                  currentPrize && p.name === currentPrize.name
                    ? "highlight"
                    : ""
                }">
                    ${p.name} (x${p.quantity})
                </li>
            `
    )
    .join("");

  // Update the dropdown menu
  const prizeDropdown = document.getElementById("prizeDropdown");
  prizeDropdown.innerHTML = `<option value="" disabled selected>Select a prize</option>`;
  prizes.forEach((p) => {
    prizeDropdown.innerHTML += `<option value="${p.name}">${p.name} (x${p.quantity})</option>`;
  });
};

// Remove Prize Functionality
const removePrize = () => {
  const prizeName = document.getElementById("prizeDropdown").value;
  const prizeQuantity = parseInt(
    document.getElementById("prizeQuantity").value,
    10
  );

  if (!prizeName || isNaN(prizeQuantity) || prizeQuantity <= 0) {
    alert("Please select a prize and enter a valid quantity.");
    return;
  }

  const prize = prizes.find((p) => p.name === prizeName);
  if (!prize) {
    alert("Prize not found in the list.");
    return;
  }

  if (prize.quantity < prizeQuantity) {
    alert("Not enough quantity to remove.");
    return;
  }

  prize.quantity -= prizeQuantity;
  if (prize.quantity === 0) {
    prizes.splice(prizes.indexOf(prize), 1);
  }

  updatePrizes();
  alert(`Removed ${prizeQuantity} of ${prizeName}.`);
  document.getElementById("removePrizeForm").reset();
};

const updateWinnersList = () => {
  const list = document.getElementById("winners");
  list.innerHTML = winners
    .map(
      (w) => `<li>${w.winner.emp_id} - ${w.winner.emp_name} won ${w.prize}</li>`
    )
    .join("");
};

const updateBlacklist = () => {
  const list = document.getElementById("blacklist");
  list.innerHTML = blacklist
    .map((b) => `<li>${b.emp_id} - ${b.emp_name}</li>`)
    .join("");
};

const populateFirstPrizes = () => {
  prizes.push(...predefinedAdditionalPrizesFirst);
  updatePrizes();
};

const populateSecondPrizes = () => {
  prizes.push(...predefinedAdditionalPrizesSecond);
  updatePrizes();
};

const populatePrimaryPrizes = () => {
  prizes.push(...predifinedPrimaryPrizes);
  updatePrizes();
};

const startDraw = () => {
  cleanPendingWinners();
  if (prizes.length === 0) {
    alert("No prizes to draw!");
    return;
  }
  if (participants.length === 0) {
    alert("No participants left!");
    return;
  }

  currentPrize = prizes[0]; // Set the current prize
  updatePrizes(); // Highlight the prize

  shuffleParticipants(() => {
    const randomIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[randomIndex];
    document.getElementById("winner").innerHTML = `
                    <div class="confirmation-container">
                        <span>Winner: ${winner.emp_id} - ${winner.emp_name} for ${currentPrize.name}</span>
                        <div class="button-group">
                            <button class="btn" onclick="confirmSingleWinner(${winner.emp_id})">Confirm</button>
                            <button class="btn blacklist-btn" onclick="blacklistParticipant(${winner.emp_id})">Blacklist</button>
                        </div>
                    </div>
                `;
  });
};

const drawAllForPrize = () => {
  cleanPendingWinners();
  if (prizes.length === 0) {
    alert("No prizes to draw!");
    return;
  }

  currentPrize = prizes[0]; // Set the current prize
  updatePrizes(); // Highlight the prize

  const prize = prizes[0];
  if (prize.quantity > participants.length) {
    alert("Not enough participants for this prize!");
    return;
  }

  shuffleParticipants(() => {
    pendingWinners.length = 0; // Clear pending winners for fresh draw
    for (let i = 0; i < prize.quantity; i++) {
      const randomIndex = Math.floor(Math.random() * participants.length);
      const winner = participants.splice(randomIndex, 1)[0];
      pendingWinners.push({ prize: prize.name, winner });
    }

    const winnerHtml = pendingWinners
      .map(
        (w) => `
                    <div class="winner-container">
                        <span class="winner-text">Winner: ${w.winner.emp_id} for ${w.prize}</span>
                        <br>
                        <button class="btn winner-btn" onclick="confirmAllWinner(${w.winner.emp_id}, this)">Confirm</button>
                    </div>
                `
      )
      .join("");

    document.getElementById("winner").innerHTML = winnerHtml;

    prize.quantity = 0;
    prizes.shift();
    updatePrizes();
  });
};

const confirmSingleWinner = (emp_id) => {
  const winner = participants.find((p) => p.emp_id === emp_id);
  if (!winner) return;

  winners.push({ prize: currentPrize.name, winner });
  participants.splice(participants.indexOf(winner), 1);

  currentPrize.quantity--;

  if (currentPrize.quantity === 0) prizes.shift();
  document.getElementById("winner").innerText = "Draw confirmed!";
  updateWinnersList();
};

const confirmAllWinner = (emp_id, buttonElement) => {
  const winnerData = pendingWinners.find((p) => p.winner.emp_id === emp_id);
  if (!winnerData) return;

  winners.push(winnerData);
  pendingWinners.splice(pendingWinners.indexOf(winnerData), 1);

  // Hide the clicked button
  buttonElement.style.display = "none";

  updateWinnersList();
};

const blacklistParticipant = (emp_id) => {
  const winner = participants.find((p) => p.emp_id === emp_id);
  if (!winner) return;

  blacklist.push(winner);
  participants.splice(participants.indexOf(winner), 1);

  pendingWinners.splice(
    pendingWinners.findIndex((p) => p.winner.emp_id === emp_id),
    1
  );

  document.getElementById("winner").innerText = "Participant blacklisted!";
  updateBlacklist();
};

const cleanPendingWinners = () => {
  // Return unconfirmed winners to the participant pool
  pendingWinners.forEach((p) => participants.push(p.winner));
  pendingWinners.length = 0;
};

const shuffleParticipants = (callback) => {
  const nameElement = document.getElementById("winner");
  let iterations = 0;

  const animation = anime({
    targets: nameElement,
    duration: 200,
    easing: "linear",
    loop: true,
    update: () => {
      const randomIndex = Math.floor(Math.random() * participants.length);
      nameElement.textContent = `Drawing: ${participants[randomIndex].emp_id}`;
    },
  });

  setTimeout(() => {
    animation.pause();
    callback();
  }, 3000); // Shuffle for 3 seconds
};

const exportToExcel = () => {
  const data = [
    ["Type", "Emp ID", "Prize"],
    ...winners.map((w) => ["Winner", w.winner.emp_id, w.prize]),
    ...blacklist.map((b) => ["Blacklisted", b.emp_id, "N/A"]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

  XLSX.writeFile(workbook, "Lucky_Draw_Results.xlsx");
};

const importExcel = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const importedData = XLSX.utils.sheet_to_json(sheet);

    importedData.forEach((row) => {
      if (row.emp_id && row.emp_name) {
        participants.push({ emp_id: row.emp_id, emp_name: row.emp_name });
      }
    });

    alert(`Imported ${participants.length} participants successfully.`);
  };

  reader.readAsArrayBuffer(file);
};
