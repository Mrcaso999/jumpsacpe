// API Configuration
const API_URL = 'https://api.coingecko.com/api/v3';
const CURRENCY = 'usd';
const UPDATE_INTERVAL = 60000; // Cập nhật mỗi 60 giây

// Cache data
let cryptoData = [];
let searchTimeout;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const cryptoGrid = document.querySelector('.crypto-grid');

// Khởi tạo ứng dụng
async function initializeApp() {
    await fetchCryptoData();
    setupEventListeners();
    startAutoUpdate();
}

// Thiết lập các event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    window.addEventListener('offline', showOfflineMessage);
    window.addEventListener('online', () => {
        hideOfflineMessage();
        fetchCryptoData();
    });
}

// Xử lý tìm kiếm
function handleSearch(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const filteredData = cryptoData.filter(coin => 
            coin.name.toLowerCase().includes(searchTerm) || 
            coin.symbol.toLowerCase().includes(searchTerm)
        );
        renderCryptoCards(filteredData);
    }, 300);
}

// Lấy dữ liệu từ API
async function fetchCryptoData() {
    try {
        showLoadingState();
        const response = await fetch(
            `${API_URL}/coins/markets?vs_currency=${CURRENCY}&order=market_cap_desc&per_page=100&sparkline=false`
        );
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        cryptoData = await response.json();
        renderCryptoCards(cryptoData);
    } catch (error) {
        showErrorMessage('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        console.error('Error fetching data:', error);
    }
}

// Render crypto cards
function renderCryptoCards(coins) {
    cryptoGrid.innerHTML = coins.map(coin => `
        <div class="crypto-card">
            <div class="crypto-header">
                <img src="${coin.image}" alt="${coin.name}" loading="lazy">
                <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
            </div>
            <div class="crypto-body">
                <p class="price">$${formatNumber(coin.current_price)}</p>
                <p class="change ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                    ${coin.price_change_percentage_24h.toFixed(2)}%
                </p>
                <div class="crypto-info">
                    <p>Vốn hóa: $${formatNumber(coin.market_cap)}</p>
                    <p>Volume 24h: $${formatNumber(coin.total_volume)}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Utility Functions
function formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }).format(num);
}

function showLoadingState() {
    cryptoGrid.innerHTML = `
        <div class="loading-message">
            <div class="spinner"></div>
            <p>Đang tải dữ liệu...</p>
        </div>
    `;
}

function showErrorMessage(message) {
    cryptoGrid.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
            <button onclick="fetchCryptoData()">Thử lại</button>
        </div>
    `;
}

function showOfflineMessage() {
    const message = document.createElement('div');
    message.className = 'offline-message';
    message.textContent = 'Mất kết nối internet';
    document.body.appendChild(message);
}

function hideOfflineMessage() {
    const message = document.querySelector('.offline-message');
    if (message) message.remove();
}

function startAutoUpdate() {
    setInterval(fetchCryptoData, UPDATE_INTERVAL);
}

// Thêm một số style CSS cần thiết
const style = document.createElement('style');
style.textContent = `
    .crypto-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .crypto-header img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .crypto-header h3 {
        font-size: 1.2rem;
        margin: 0;
        color: #1a237e;
    }

    .price {
        font-size: 1.8rem;
        font-weight: 700;
        color: #1a237e;
        margin-bottom: 0.5rem;
    }

    .change {
        padding: 0.5rem 1rem;
        border-radius: 25px;
        font-size: 0.9rem;
        font-weight: 500;
        display: inline-block;
        margin-bottom: 1rem;
    }

    .positive {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
    }

    .negative {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
    }

    .crypto-info {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: #64748b;
        display: grid;
        gap: 0.5rem;
    }

    .loading-message,
    .error-message {
        grid-column: 1/-1;
        text-align: center;
        padding: 3rem;
        background: white;
        border-radius: 20px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
    }

    .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #e2e8f0;
        border-top: 4px solid #1a237e;
        border-radius: 50%;
        margin: 0 auto 1.5rem;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .offline-message {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ef4444;
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.3s ease;
        z-index: 1000;
    }

    @keyframes slideUp {
        from { transform: translate(-50%, 100%); }
        to { transform: translate(-50%, 0); }
    }

    .error-message button {
        margin-top: 1rem;
        padding: 0.8rem 2rem;
        background: #1a237e;
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .error-message button:hover {
        background: #0d47a1;
        transform: translateY(-2px);
    }
`;

document.head.appendChild(style);

// Khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', initializeApp); 
