document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const jwt = await getJwt(username, password);
        localStorage.setItem('jwt', jwt);
        loadProfilePage();
    } catch (error) {
        document.getElementById('error-message').textContent = 'Invalid credentials';
    }
});

document.getElementById('logout').addEventListener('click', function() {
    localStorage.removeItem('jwt');
    document.getElementById('profile-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'block';
});

async function getJwt(username, password) {
    const response = await fetch('https://learn.01founders.co/api/auth/signin', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(username + ':' + password)
        }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error('Login failed');
    }
    return data.jwt;
}

async function loadProfilePage() {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) return;

    document.getElementById('login-page').style.display = 'none';
    document.getElementById('profile-page').style.display = 'block';

    const userInfo = await fetchGraphQL(`{ user { id login } }`);
    document.getElementById('user-info').textContent = `ID: ${userInfo.data.user[0].id}, Login: ${userInfo.data.user[0].login}`;

    const xpAmount = await fetchGraphQL(`{ transaction(where: { type: { _eq: "xp" }}) { amount } }`);
    document.getElementById('xp-amount').textContent = `XP: ${xpAmount.data.transaction.map(t => t.amount).reduce((a, b) => a + b, 0)}`;

    const grades = await fetchGraphQL(`{ progress { grade } }`);
    document.getElementById('grades').textContent = `Grades: ${grades.data.progress.map(p => p.grade).join(', ')}`;

    generateGraphs();
}

async function fetchGraphQL(query) {
    const response = await fetch('https://learn.01founders.co/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('jwt')
        },
        body: JSON.stringify({ query })
    });
    return response.json();
}

function generateGraphs() {
    // Example graph generation (XP earned over time)
    const svg = `<svg width="500" height="300">
        <polyline fill="none" stroke="blue" stroke-width="2"
            points="0,50 50,100 100,150 150,200 200,250 250,300" />
    </svg>`;
    document.getElementById('graphs').innerHTML = svg;
}

// Check if user is already logged in
if (localStorage.getItem('jwt')) {
    loadProfilePage();
}