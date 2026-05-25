// mobile hamburger menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
let menuOpen = false;

hamburger.addEventListener('click', () => {
    if (menuOpen == false) {
        navLinks.style.display = "block";
    }
    else if (menuOpen == true) {
        navLinks.style.display = "none";
        menuOpen = false;
    }
})

// ===== CONVERTER LOGIC =====
const currencyFirstEl = document.getElementById("currency-first");
const worthFirstEl = document.getElementById("worth-first");
const currencySecondEl = document.getElementById("currency-second");
const worthSecondEl = document.getElementById("worth-second");
const datePicker = document.getElementById("date-picker");
const errorMsg = document.getElementById("errorMsg");
const loadingEl = document.getElementById("loading");

let debounceTimer;

const coinGeckoMap = {
    bitcoin: { id: 'bitcoin', type: 'crypto' },
    ethereum: { id: 'ethereum', type: 'crypto' },
    usd: { id: 'usd', type: 'fiat' },
    gbp: { id: 'gbp', type: 'fiat' },
    eur: { id: 'eur', type: 'fiat' },
    ngn: { id: 'ngn', type: 'fiat' },
    jpy: { id: 'jpy', type: 'fiat' },
    cad: { id: 'cad', type: 'fiat' },
    inr: { id: 'inr', type: 'fiat' },
    aud: { id: 'aud', type: 'fiat' },
    cny: { id: 'cny', type: 'fiat' },
    chf: { id: 'chf', type: 'fiat' }
};

// Set date picker limits
const today = new Date();
const maxDate = today.toISOString().split('T')[0];
const minDate = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0];
datePicker.value = maxDate;
datePicker.max = maxDate;
datePicker.min = minDate;

async function convertCurrency() {
    const from = currencyFirstEl.value;
    const to = currencySecondEl.value;
    const amount = parseFloat(worthFirstEl.value);
    const dateValue = datePicker.value;
    const isToday = dateValue === maxDate;

    if (!amount || amount <= 0) {
        worthSecondEl.value = '';
        return;
    }

    if (from === to) {
        worthSecondEl.value = amount;
        return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        try {
            loadingEl.classList.remove('hidden');
            errorMsg.style.display = 'none';
            worthSecondEl.classList.add('loading');

            const fromData = coinGeckoMap[from];
            const toData = coinGeckoMap[to];
            let rate;

            if (!isToday && fromData.type === 'crypto') {
                const formattedDate = dateValue.split('-').reverse().join('-');
                const res = await fetch(`https://api.coingecko.com/api/v3/coins/${fromData.id}/history?date=${formattedDate}`);
                if (!res.ok) throw new Error('Historical data error');
                const data = await res.json();
                if (toData.type === 'fiat') {
                    rate = data.market_data.current_price[toData.id];
                } else {
                    const toRes = await fetch(`https://api.coingecko.com/api/v3/coins/${toData.id}/history?date=${formattedDate}`);
                    const toDataHist = await toRes.json();
                    rate = data.market_data.current_price.usd / toDataHist.market_data.current_price.usd;
                }
            } else {
                if (fromData.type === 'crypto' && toData.type === 'fiat') {
                    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${fromData.id}&vs_currencies=${toData.id}`);
                    const data = await res.json();
                    rate = data[fromData.id];
                } else if (fromData.type === 'fiat' && toData.type === 'crypto') {
                    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${toData.id}&vs_currencies=${fromData.id}`);
                    const data = await res.json();
                    rate = 1 / data[toData.id];
                } else if (fromData.type === 'crypto' && toData.type === 'crypto') {
                    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${fromData.id},${toData.id}&vs_currencies=usd`);
                    const data = await res.json();
                    rate = data[fromData.id].usd / data[toData.id].usd;
                } else {
                    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${fromData.id},${toData.id}`);
                    const data = await res.json();
                    rate = data.bitcoin[toData.id] / data.bitcoin[fromData.id];
                }
            }

            const result = (amount * rate).toFixed(4).replace(/\.?0+$/, '');
            worthSecondEl.value = result;

        } catch (err) {
            console.error('API error:', err);
            errorMsg.textContent = 'Couldn’t fetch rate. Try again or check date.';
            errorMsg.style.display = 'block';
            worthSecondEl.value = '';
        } finally {
            loadingEl.classList.add('hidden');
            worthSecondEl.classList.remove('loading');
        }
    }, 400);
}

// Quick currency buttons
document.querySelectorAll('.quick-currencies span').forEach(btn => {
    btn.addEventListener('click', () => {
        currencySecondEl.value = btn.dataset.currency;
        convertCurrency();
    });
});

// Email form
function handleSubmit(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    alert(`Thanks! We'll contact you at ${email}`);
    e.target.reset();
}

// Converter event listeners
worthFirstEl.addEventListener('input', convertCurrency);
currencyFirstEl.addEventListener('change', convertCurrency);
currencySecondEl.addEventListener('change', convertCurrency);
datePicker.addEventListener('change', convertCurrency);

// ===== STATS COUNTER ANIMATION =====
const animateStats = () => {
    const stats = document.querySelectorAll('.stat-item h2');
    stats.forEach(stat => {
        const target = stat.textContent;
        const num = parseInt(target.replace(/[^0-9]/g, ''));
        const suffix = target.replace(/[0-9]/g, '');
        let current = 0;
        const increment = num / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= num) {
                stat.textContent = target;
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current) + suffix;
            }
        }, 30);
    });
};

// Run stats when visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) statsObserver.observe(statsSection);

// ===== TESTIMONIALS =====
const testimonials = [
    { name: "Sarah Chen", role: "CEO Motion Design Agency", text: "CryptoZ made crypto trading so simple. The converter is instant and the fees are transparent. Best platform I've used." },
    { name: "Marcus Johnson", role: "Crypto Trader", text: "I've tried Coinbase, Binance, and others. CryptoZ has the cleanest UI and fastest execution. Sync across devices is flawless." },
    { name: "Elena Rodriguez", role: "Portfolio Manager", text: "The security features give me peace of mind. Love the real-time alerts and historical data for tax reporting." },
    { name: "David Kim", role: "Tech Founder", text: "Finally a crypto app that doesn't feel like it's from 2015. The mobile app is gorgeous and the desktop sync works perfectly." },
    { name: "Aisha Okafor", role: "DeFi Investor", text: "Being able to convert NGN to BTC instantly changed the game for me. No more expensive P2P middlemen." },
    { name: "James Wilson", role: "Student Investor", text: "Started with $50 and the tutorials walked me through everything. Now managing a small portfolio confidently." },
    { name: "Priya Sharma", role: "Financial Analyst", text: "The charting tools and API access make this perfect for both casual users and pros. Highly recommend." },
    { name: "Lucas Mueller", role: "E-commerce Owner", text: "We accept crypto payments through CryptoZ. Settlement to EUR is instant and fees beat PayPal by 70%." }
];

// Render testimonials
const grid = document.getElementById('testimonialGrid');
if (grid) {
    testimonials.forEach((t, i) => {
        const initials = t.name.split(' ').map(n => n[0]).join('');
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];
        const color = colors[i % colors.length];

        const card = document.createElement('div');
        card.className = 'testimonial-card';
        card.innerHTML = `
            <div class="user-info">
                <div class="user-avatar" style="background: ${color}">${initials}</div>
                <div class="user-details">
                    <h4>${t.name}</h4>
                    <p>${t.role}</p>
                </div>
            </div>
            <p class="testimonial-text">
                <span class="quote">"</span>${t.text}<span class="quote">"</span>
            </p>
        `;
        grid.appendChild(card);
    });
}

// CTA button
function handleGetStarted() {
    alert('Redirecting to signup...');
    // window.location.href = '/signup';
}

// Fade-in animations
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.card,.step-card,.testimonial-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.05}s, transform 0.6s ease ${i * 0.05}s`;
    fadeObserver.observe(el);
});

// Initial converter load
window.addEventListener('DOMContentLoaded', convertCurrency);

// Update mobile status bar time
function updateStatusTime() {
  const timeEl = document.getElementById('statusTime');
  if (!timeEl) return;

  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  minutes = minutes < 10? '0' + minutes : minutes;

  // 12-hour format like iOS
  const ampm = hours >= 12? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours? hours : 12; // 0 becomes 12

  timeEl.textContent = `${hours}:${minutes}`;
}

// Update every 30s
updateStatusTime();
setInterval(updateStatusTime, 30000);
