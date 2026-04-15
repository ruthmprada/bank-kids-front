// 🔐 Seguridad
if (localStorage.getItem("role") !== "parent") {
    window.location.href = "../login.html";
}

// 📦 Datos
const users = JSON.parse(localStorage.getItem("users")) || [];
const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
const familyId = localStorage.getItem("familyId");

// 👨‍👩‍👧‍👦 Filtrar hijos
const children = users.filter(u => 
    u.role === "child" && u.familyId === familyId
);

// 💰 Calcular saldo
function getBalance(childName) {
    let balance = 0;

    transactions.forEach(t => {
        if (t.child === childName) {
            if (t.type === "Ingreso") {
                balance += t.amount;
            } else {
                balance -= t.amount;
            }
        }
    });

    return balance;
}

// 🎨 Pintar hijos
const container = document.getElementById("childrenList");

if (children.length === 0) {
    container.innerHTML = "<p>No hay hijos vinculados aún</p>";
} else {
    children.forEach(child => {
        const balance = getBalance(child.username);

        const div = document.createElement("div");
        div.className = "bg-surface-container-lowest p-6 rounded-lg flex items-center justify-between";

        div.innerHTML = `
            <div>
                <h3 class="font-bold text-lg">${child.username}</h3>
                <p class="font-bold ${balance >= 0 ? 'text-primary' : 'text-error'}">
                    ${balance.toFixed(2)} €
                </p>
            </div>
            <button onclick="addMoneyToChild('${child.username}')" 
                class="bg-secondary text-white px-4 py-2 rounded-xl font-bold text-sm">
                Agregar
            </button>
        `;

        container.appendChild(div);
    });
}

// ➕ Añadir dinero (
function addMoneyToChild(childName) {
    const amount = prompt(`¿Cuánto dinero deseas agregar a ${childName}?`);
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;

    const numAmount = parseFloat(amount);

    transactions.push({
        child: childName,
        type: "Ingreso",
        amount: numAmount,
        date: new Date().toISOString()
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));

    location.reload();
}