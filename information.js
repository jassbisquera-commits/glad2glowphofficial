// ============================================
// TOAST FUNCTION
// ============================================
const toast = document.getElementById('toast');

function showToast(msg, isError) {
  if (!toast) return;
  if (isError === undefined) isError = false;
  toast.textContent = msg;
  toast.style.background = isError ? '#b03d3d' : '#2d1f1a';
  toast.classList.add('show');
  clearTimeout(toast._hide);
  toast._hide = setTimeout(function () {
    toast.classList.remove('show');
  }, 3200);
}

// ============================================
// PARTICLES
// ============================================
function createParticles() {
  const container = document.getElementById('particleNetwork');
  if (!container) return;
  for (let i = 0; i < 25; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 60 + 15;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 20 + 's';
    particle.style.animationDuration = 16 + Math.random() * 14 + 's';
    container.appendChild(particle);
  }
}
createParticles();

// ============================================
// ESCAPE HTML
// ============================================
function escapeHtml(text) {
  if (!text) return '—';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// DISPLAY APPLICANT INFO
// ============================================
function displayApplicantInfo(data) {
  const applicantInfoDisplay = document.getElementById('applicantInfoDisplay');
  if (!applicantInfoDisplay) return;
  
  const socialLinks = data.socialLinks ? data.socialLinks.split(',').map(link => link.trim()) : [];
  let socialLinksHtml = socialLinks.length > 0 ? 
    socialLinks.map(link => `<a href="${link}" target="_blank">${link}</a>`).join('<br>') : 
    'Not provided';
  
  applicantInfoDisplay.innerHTML = `
    <div class="info-row">
      <span class="info-label">Full Name</span>
      <span class="info-value">${escapeHtml(data.fullName)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Email</span>
      <span class="info-value">${escapeHtml(data.email)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Phone</span>
      <span class="info-value">${escapeHtml(data.phone || 'Not provided')}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Platform</span>
      <span class="info-value">${escapeHtml(data.platform || 'Not provided')}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Followers</span>
      <span class="info-value">${escapeHtml(data.followers || 'Not provided')}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Location</span>
      <span class="info-value">${escapeHtml(data.location || 'Not provided')}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Social Links</span>
      <span class="info-value">${socialLinksHtml}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Heard From</span>
      <span class="info-value">${escapeHtml(data.hearAbout || 'Not provided')}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Collaboration</span>
      <span class="info-value">${escapeHtml(data.collabPreference || 'Not provided')}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Message</span>
      <span class="info-value">${escapeHtml(data.additionalMessage || 'Not provided')}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Reference #</span>
      <span class="info-value" style="font-weight:700; color:var(--rose-deep);">${escapeHtml(data.referenceNumber || 'N/A')}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Submitted</span>
      <span class="info-value">${new Date().toLocaleString()}</span>
    </div>
  `;
}

// ============================================
// LOAD DATA FROM SESSION STORAGE
// ============================================
function loadApplicantData() {
  try {
    const storedData = sessionStorage.getItem('applicantData');
    if (storedData) {
      const data = JSON.parse(storedData);
      displayApplicantInfo(data);
      console.log('✅ Applicant data loaded from session storage');
    } else {
      // Fallback - try to get from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const name = urlParams.get('name');
      const email = urlParams.get('email');
      
      if (name && email) {
        const data = {
          fullName: name,
          email: email,
          phone: urlParams.get('phone') || 'Not provided',
          platform: urlParams.get('platform') || 'Not provided',
          followers: urlParams.get('followers') || 'Not provided',
          location: urlParams.get('location') || 'Not provided',
          socialLinks: urlParams.get('social') || 'Not provided',
          hearAbout: urlParams.get('hear') || 'Not provided',
          collabPreference: urlParams.get('collab') || 'Not provided',
          additionalMessage: urlParams.get('message') || 'Not provided',
          referenceNumber: 'G2G-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)
        };
        displayApplicantInfo(data);
      } else {
        // Show demo data
        const demoData = {
          fullName: 'Jane Doe',
          email: 'jane.doe@example.com',
          phone: '+1 (555) 123-4567',
          platform: 'Instagram',
          followers: '25,000+',
          location: 'Los Angeles, CA',
          socialLinks: '<a href="https://instagram.com/janedoe" target="_blank">@janedoe</a>',
          hearAbout: 'Instagram',
          collabPreference: 'Product exchange + paid collaboration',
          additionalMessage: 'I love clean beauty and would love to represent glad2glow!',
          referenceNumber: 'G2G-2025-' + Math.floor(1000 + Math.random() * 9000)
        };
        displayApplicantInfo(demoData);
      }
    }
  } catch (e) {
    console.error('Error loading applicant data:', e);
    const demoData = {
      fullName: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+1 (555) 123-4567',
      platform: 'Instagram',
      followers: '25,000+',
      location: 'Los Angeles, CA',
      socialLinks: '<a href="https://instagram.com/janedoe" target="_blank">@janedoe</a>',
      hearAbout: 'Instagram',
      collabPreference: 'Product exchange + paid collaboration',
      additionalMessage: 'I love clean beauty and would love to represent glad2glow!',
      referenceNumber: 'G2G-2025-' + Math.floor(1000 + Math.random() * 9000)
    };
    displayApplicantInfo(demoData);
  }
}

// ============================================
// COMPLETE BUTTON
// ============================================
const completeBtn = document.getElementById('completeBtn');
if (completeBtn) {
  completeBtn.addEventListener('click', function() {
    window.location.href = 'index.html';
  });
}

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  loadApplicantData();
  console.log('✅ Information page loaded');
});