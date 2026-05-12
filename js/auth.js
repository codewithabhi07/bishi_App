document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authSection = document.getElementById('auth-section');
    const appShell = document.getElementById('app-shell');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    // Toggle Forms
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    // Handle Registration
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        const users = Store.getUsers();
        if (users.find(u => u.email === email)) {
            UI.showToast('Email already registered', 'error');
            return;
        }

        const newUser = { name, email, password };
        Store.addUser(newUser);
        UI.showToast('Registration successful! Please login.');
        registerForm.reset();
        showLogin.click();
    });

    // Handle Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const users = Store.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            Store.setCurrentUser(user);
            initApp(user);
        } else {
            // Default admin login for testing
            if (email === 'admin@bishi.com' && password === 'admin123') {
                const adminUser = { name: 'Admin', email: 'admin@bishi.com' };
                Store.setCurrentUser(adminUser);
                initApp(adminUser);
            } else {
                UI.showToast('Invalid email or password', 'error');
            }
        }
    });

    // Handle Logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        Store.logout();
        location.reload();
    });

    // Check existing session
    const currentUser = Store.getCurrentUser();
    if (currentUser) {
        initApp(currentUser);
    }

    function initApp(user) {
        authSection.classList.add('hidden');
        appShell.classList.remove('hidden');
        document.getElementById('user-display-name').textContent = user.name;
        document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
        UI.showToast(`Welcome back, ${user.name}!`);
        
        // Initial dashboard load
        if (typeof Dashboard !== 'undefined') Dashboard.render();
    }
});
