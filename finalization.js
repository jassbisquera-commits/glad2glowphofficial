// ============================================
// PROGRESS ANIMATION
// ============================================
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

if (progressBar && progressText) {
  let progress = 0;
  const steps = [
    { progress: 20, text: 'Preparing your application...' },
    { progress: 45, text: 'Verifying your details...' },
    { progress: 70, text: 'Generating reference number...' },
    { progress: 90, text: 'Almost done...' },
    { progress: 100, text: '✓ Application finalized!' }
  ];

  const interval = setInterval(() => {
    progress += Math.random() * 8 + 2;
    if (progress > 100) progress = 100;
    progressBar.style.width = progress + '%';
    
    for (let i = steps.length - 1; i >= 0; i--) {
      if (progress >= steps[i].progress) {
        progressText.textContent = steps[i].text;
        break;
      }
    }

    if (progress >= 100) {
      clearInterval(interval);
      progressText.textContent = '✓ Application finalized!';
      
      // Redirect to verification after 2 seconds
      setTimeout(() => {
        window.location.href = 'verification.html';
      }, 2000);
    }
  }, 200);
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

console.log('✅ Finalization page loaded');
console.log('⏳ Redirecting to verification in 5 seconds...');