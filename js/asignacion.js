       document.getElementById('transactionForm').addEventListener('submit', function(e) {
                e.preventDefault();

                // 🧠 1. CAPTURAR DATOS

                const amount = document.querySelector('input[name="amount"]').value;
                const memo = document.querySelector('textarea[name="memo"]').value;

                const type = document.querySelector('input[name="type"]:checked')?.nextElementSibling.textContent || "Ingreso";

                const child = document.querySelector('input[name="child"]:checked')?.parentElement.innerText.trim() || "Niño";

                const selectedCategory = document.querySelector('[data-selected="true"]')?.dataset.category || "Otro";

                // 🧠 2. CREAR OBJETO TRANSACCIÓN

                const transaction = {
                    amount: parseFloat(amount),
                    memo: memo,
                    type: type,
                    child: child,
                    category: selectedCategory,
                    date: new Date().toISOString()
                };

                // 🧠 3. OBTENER TRANSACCIONES EXISTENTES

                let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

                // 🧠 4. AÑADIR NUEVA

                transactions.push(transaction);

                // 🧠 5. GUARDAR

                localStorage.setItem("transactions", JSON.stringify(transactions));

                // 🧠 DEBUG (puedes quitar luego)
                console.log(transactions);

                // 🧠 6. REDIRIGIR
                window.location.href = "../padres/dashboardPadres.html";
            });