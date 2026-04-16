    document.addEventListener("DOMContentLoaded", () => {
        const roleInputs = document.querySelectorAll('input[name="role"]');
        const familyCodeContainer = document.getElementById('familyCodeContainer');

        roleInputs.forEach(input => {
            input.addEventListener('change', () => {
                if (input.value === "child") {
                    familyCodeContainer.classList.remove('hidden');
                } else {
                    familyCodeContainer.classList.add('hidden');
                }
            });
   

document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const pass = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;
    const role = document.querySelector('input[name="role"]:checked').value;

    const errorBox = document.getElementById('errorBox');
    const errorMessage = document.getElementById('errorMessage');
    const form = document.getElementById('registrationForm');
    const successOverlay = document.getElementById('successOverlay');

    errorBox.classList.add('hidden');

    // ✅ Validaciones
    if (pass !== confirm) {
        errorMessage.textContent = "Las contraseñas no coinciden";
        errorBox.classList.remove('hidden');
        return;
    }

    if (pass.length < 6) {
        errorMessage.textContent = "La contraseña debe tener al menos 6 caracteres";
        errorBox.classList.remove('hidden');
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // 🔥 GENERAR / USAR familyId
    let familyId;

    if (role === "parent") {
        // Padre genera código
        familyId = Math.random().toString(36).substring(2, 8);
    } else {
        // Niño usa código
        familyId = document.getElementById("familyCode").value;

        // Validar código
        const familyExists = users.some(u => u.familyId === familyId);

        if (!familyExists) {
            errorMessage.textContent = "Código familiar inválido";
            errorBox.classList.remove('hidden');
            return;
        }
    }

    // ✅ Crear usuario
    const newUser = {
        username: username,
        password: pass,
        role: role,
        familyId: familyId
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Mostrar éxito
    form.classList.add('hidden');
    successOverlay.classList.remove('hidden');

    // Mostrar código al padre
    if (role === "parent") {
        alert("Tu código familiar es: " + familyId);
    }

});

 });
 });