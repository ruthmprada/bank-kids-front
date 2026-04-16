function handleLogin() {
    const role = document.querySelector('input[name="user-role"]:checked').value;
    const username = document.getElementById('username').value;
    const password = document.querySelector('input[type="password"]').value;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Buscar usuario
    const user = users.find(u => 
        u.username === username && 
        u.password === password &&
        u.role === role
    );

    if (!user) {
        alert("Usuario o contraseña incorrectos");
        return;
    }

    // Guardar sesión
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    localStorage.setItem('familyId', user.familyId);

    // Redirigir
    if (role === 'child') {
        window.location.href = '../hijos/dashboardKids.html';
    } else {
        window.location.href = '../parent/dashboardPadres.html';
    }
}

