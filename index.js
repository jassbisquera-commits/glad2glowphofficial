// ============================================
// DASHBOARD - LOAD APPLICATIONS
// ============================================
function loadApplications() {
  // Check if there are any stored applications
  const storedData = sessionStorage.getItem('applicantData');
  if (storedData) {
    try {
      const data = JSON.parse(storedData);
      // Display the application in the dashboard
      const container = document.querySelector('.applications-list');
      if (container) {
        container.innerHTML = `
          <div class="application-card">
            <div class="app-header">
              <h3>${escapeHtml(data.fullName)}</h3>
              <span class="status-badge verified">✅ Verified</span>
            </div>
            <div class="app-details">
              <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
              <p><strong>Platform:</strong> ${escapeHtml(data.platform || 'Not specified')}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Reference:</strong> <span class="ref-code">${escapeHtml(data.referenceNumber || 'N/A')}</span></p>
            </div>
            <div class="app-actions">
              <button onclick="viewApplication()">View Details</button>
            </div>
          </div>
        `;
      }
    } catch (e) {
      console.error('Error loading application:', e);
    }
  }
}

function escapeHtml(text) {
  if (!text) return '—';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function viewApplication() {
  window.location.href = 'information.html';
}

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  loadApplications();
  console.log('✅ Dashboard loaded');
});