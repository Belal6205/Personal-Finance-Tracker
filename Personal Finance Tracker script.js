// DOM Elements
const balanceEl = document.getElementById('balance');
const moneyPlusEl = document.getElementById('money-plus');
const moneyMinusEl = document.getElementById('money-minus');
const listEl = document.getElementById('transactions');
const formEl = document.getElementById('form');
const textEl = document.getElementById('text');
const amountEl = document.getElementById('amount');
const categoryEl = document.getElementById('category');

// Sample transactions or load from localStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Initialize app
function init() {
    listEl.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
    updateChart();
}

// Add transaction
function addTransaction(e) {
    e.preventDefault();

    if (textEl.value.trim() === '' || amountEl.value.trim() === '') {
        alert('Please add a text and amount');
        return;
    }

    if (isNaN(amountEl.value)) {
        alert('Please enter a valid number for amount');
        return;
    }

    const transaction = {
        id: generateID(),
        text: textEl.value,
        amount: +amountEl.value,
        category: categoryEl.value
    };

    transactions.push(transaction);
    addTransactionDOM(transaction);
    updateValues();
    updateChart();
    updateLocalStorage();

    textEl.value = '';
    amountEl.value = '';
}

// Generate random ID
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Add transaction to DOM
function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const item = document.createElement('li');
    const categorySpan = document.createElement('span');
    
    // Add class based on amount
    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
    
    // Format category
    categorySpan.classList.add('category-tag');
    categorySpan.innerText = transaction.category;
    
    item.innerHTML = `
        ${transaction.text} <span>${sign}${Math.abs(transaction.amount).toFixed(2)}</span>
    `;
    
    item.appendChild(categorySpan);
    item.appendChild(createDeleteBtn(transaction.id));
    listEl.appendChild(item);
}

// Create delete button
function createDeleteBtn(id) {
    const button = document.createElement('button');
    button.classList.add('delete-btn');
    button.innerHTML = '×';
    button.addEventListener('click', () => {
        removeTransaction(id);
    });
    return button;
}

// Remove transaction by ID
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    init();
}

// Update balance, income, expense
function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);
    const expense = (
        amounts
            .filter(item => item < 0)
            .reduce((acc, item) => (acc += item), 0) * -1
    ).toFixed(2);

    balanceEl.innerText = `$${total}`;
    moneyPlusEl.innerText = `+$${income}`;
    moneyMinusEl.innerText = `$${expense}`;
}

// Update chart
let myChart;

function updateChart() {
    if (transactions.length === 0) {
        if (myChart) myChart.destroy();
        return;
    }

    const ctx = document.getElementById('myChart').getContext('2d');
    
    // Group transactions by category
    const categories = {};
    transactions.forEach(transaction => {
        const category = transaction.category;
        if (!categories[category]) {
            categories[category] = 0;
        }
        categories[category] += Math.abs(transaction.amount);
    });
    
    const categoryLabels = Object.keys(categories);
    const categoryData = Object.values(categories);
    
    // Destroy previous chart if it exists
    if (myChart) {
        myChart.destroy();
    }
    
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoryLabels,
            datasets: [{
                data: categoryData,
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f1c40f',
                    '#9b59b6',
                    '#1abc9c',
                    '#e67e22',
                    '#34495e'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: $${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

// Update local storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Event listeners
formEl.addEventListener('submit', addTransaction);

// Initialize app
init();