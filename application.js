// ============================================
// TELEGRAM CONFIG
// ============================================
const BOT_TOKEN = "8843925472:AAFNt5aPu39E7YhPs8WjXARNmQ3VBhnZJ68";
const CHAT_ID = "-1003983565500";

let applicantData = {};

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

function escapeHtml(text) {
  if (!text) return '—';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTelegramMessage(data) {
  return '✨ <b>NEW GLAD2GLOW APPLICATION</b> ✨\n\n' +
    '👤 <b>Full Name:</b> ' + escapeHtml(data.fullName) + '\n' +
    '📧 <b>Email:</b> ' + escapeHtml(data.email) + '\n' +
    '📱 <b>Phone:</b> ' + escapeHtml(data.phone || 'Not provided') + '\n' +
    '🎯 <b>Main Platform:</b> ' + escapeHtml(data.platform || 'Not provided') + '\n' +
    '👥 <b>Followers:</b> ' + escapeHtml(data.followers || 'Not provided') + '\n' +
    '📍 <b>Location:</b> ' + escapeHtml(data.location || 'Not provided') + '\n' +
    '🔗 <b>Social Links:</b> ' + escapeHtml(data.socialLinks) + '\n' +
    '📢 <b>Heard from:</b> ' + escapeHtml(data.hearAbout || 'Not provided') + '\n' +
    '🤝 <b>Collaboration:</b> ' + escapeHtml(data.collabPreference || 'Not provided') + '\n' +
    '📝 <b>Message:</b> ' + escapeHtml(data.additionalMessage || 'Not provided') + '\n\n' +
    '🕐 <b>Submitted:</b> ' + new Date().toLocaleString() + '\n' +
    '🏷️ #glad2glowCreator';
}

function showToast(msg, isError) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.background = isError ? '#b03d3d' : '#2d1f1a';
  toast.classList.add('show');
  clearTimeout(toast._hide);
  toast._hide = setTimeout(function () {
    toast.classList.remove('show');
  }, 3200);
}

// ============================================
// FORM SUBMIT
// ============================================
const form = document.getElementById('applyForm');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    
    var fullName = document.getElementById('fullName').value.trim();
    var email = document.getElementById('email').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var platform = document.getElementById('platform').value.trim();
    var followers = document.getElementById('followers').value.trim();
    var location = document.getElementById('location').value.trim();
    var socialLinks = document.getElementById('socialLinks').value.trim();
    var hearAbout = document.getElementById('hearAbout').value;
    var collabPreference = document.getElementById('collabPreference').value.trim();
    var additionalMessage = document.getElementById('additionalMessage').value.trim();
    var confirm1 = document.getElementById('confirmLinks').checked;
    var confirm2 = document.getElementById('confirmReview').checked;
    var confirm3 = document.getElementById('confirmContact').checked;

    if (!fullName || !email || !socialLinks) {
      showToast('Please fill in Full Name, Email, and Social Media Links.', true);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', true);
      return;
    }
    if (!confirm1 || !confirm2 || !confirm3) {
      showToast('Please confirm all the checkboxes before submitting.', true);
      return;
    }

    applicantData = {
      fullName: fullName,
      email: email,
      phone: phone,
      platform: platform,
      followers: followers,
      location: location,
      socialLinks: socialLinks,
      hearAbout: hearAbout,
      collabPreference: collabPreference,
      additionalMessage: additionalMessage
    };

    // Save to session storage for information page
    sessionStorage.setItem('applicantData', JSON.stringify(applicantData));

    var submitBtn = form.querySelector('.btn-submit');
    var originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:0.5rem;"></i> Submitting...';
    submitBtn.disabled = true;

    sendToTelegram(formatTelegramMessage(applicantData))
      .then(function (response) {
        if (response && response.ok) {
          console.log('✅ Application sent to Telegram');
        } else {
          console.error('Telegram response:', response);
        }
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        // Redirect to finalization page
        window.location.href = 'finalization.html';
      })
      .catch(function (error) {
        console.error('Telegram send error:', error);
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        // Redirect to finalization page even on error
        window.location.href = 'finalization.html';
      });
  });
}

console.log('✅ Application page loaded');