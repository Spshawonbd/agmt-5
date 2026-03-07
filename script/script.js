let allIssues = [];

function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin123') {
        alert('✅ Login Successful!');   t

        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        fetchIssues();
    } else {
        alert('❌ Wrong username or password!');
    }
}