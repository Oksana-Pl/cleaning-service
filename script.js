'use strict';

// Main navigation: open the mobile menu and close it after a selection or Escape.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');

function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}

menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';

  menuButton.setAttribute('aria-expanded', String(!expanded));
  navigation.classList.toggle('open', !expanded);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});

// Before / after comparison: CSS clips the dirty image at the selected position.
const comparison = document.querySelector('.comparison');
const slider = comparison.querySelector('input');

slider.addEventListener('input', () => {
  const cleanPercentage = 100 - Number(slider.value);

  comparison.style.setProperty('--position', `${slider.value}%`);
  slider.setAttribute(
    'aria-valuetext',
    `${cleanPercentage} percent clean carpet revealed`
  );
});

// Service links preselect the matching option in the enquiry form.
const serviceChoices = [...document.querySelectorAll('input[name="service"]')];

document.querySelectorAll('[data-service]').forEach((link) => {
  link.addEventListener('click', () => {
    const choice = serviceChoices.find(
      (input) => input.value === link.dataset.service
    );

    if (choice) choice.checked = true;
  });
});

// Keep the footer year current.
document.querySelector('#year').textContent = new Date().getFullYear();

// Download the enquiry details. Connect a business endpoint before enabling online submission.
const quoteForm = document.querySelector('#quote-form');
const formResult = document.querySelector('#form-result');

function downloadEnquiry(text) {
  const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = 'fresh-enquiry.txt';
  anchor.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

quoteForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(quoteForm);
  const services = data.getAll('service');

  if (!services.length) {
    serviceChoices[0].setCustomValidity('Please choose at least one service.');
    serviceChoices[0].reportValidity();
    return;
  }

  const text = [
    'Your enquiry details',
    '',
    `Services: ${services.join(', ')}`,
    `Name: ${data.get('name')}`,
    `Email: ${data.get('email')}`,
    `Location: ${data.get('location')}`,
    `Property: ${data.get('company') || '—'}`,
    '',
    data.get('details'),
  ].join('\n');

  formResult.textContent = text;

  const downloadButton = document.createElement('button');
  downloadButton.type = 'button';
  downloadButton.textContent = 'Download enquiry';
  downloadButton.addEventListener('click', () => downloadEnquiry(text));

  formResult.append(document.createElement('br'), downloadButton);
  formResult.hidden = false;
  formResult.focus();
});

serviceChoices.forEach((input) => {
  input.addEventListener('change', () => {
    serviceChoices.forEach((choice) => choice.setCustomValidity(''));
  });
});

// Background video is optional. Remove this block and the <video> to return to the photo.
const heroVideo = document.querySelector('.hero-video');
const videoToggle = document.querySelector('.hero-video-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function updateVideoButton() {
  videoToggle.textContent = heroVideo.paused ? 'PLAY VIDEO ▶' : 'PAUSE VIDEO Ⅱ';
  videoToggle.setAttribute('aria-label', heroVideo.paused ? 'Play background video' : 'Pause background video');
}

function startHeroVideo() {
  if (reducedMotion.matches) return;
  heroVideo.muted = true;
  if (!heroVideo.getAttribute('src')) heroVideo.src = heroVideo.dataset.src;
  heroVideo.play().catch(() => {
    // Autoplay may be blocked. Keep the photograph and offer manual playback.
    if (!heroVideo.error) {
      videoToggle.hidden = false;
      updateVideoButton();
    }
  });
}

heroVideo.addEventListener('playing', () => {
  heroVideo.classList.add('is-visible');
  videoToggle.hidden = reducedMotion.matches;
  updateVideoButton();
});
heroVideo.addEventListener('pause', updateVideoButton);
heroVideo.addEventListener('error', () => {
  heroVideo.classList.remove('is-visible');
  videoToggle.hidden = true;
});
videoToggle.addEventListener('click', () => {
  if (heroVideo.paused) startHeroVideo();
  else heroVideo.pause();
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    heroVideo.pause();
    heroVideo.classList.remove('is-visible');
    videoToggle.hidden = true;
    heroVideo.removeAttribute('src');
    heroVideo.load();
  } else startHeroVideo();
});
startHeroVideo();

// Keep the decorative hospitality video still for visitors who reduce motion.
const hospitalityVideo = document.querySelector('.hospitality-video');
function syncHospitalityVideo() {
  if (!hospitalityVideo) return;
  if (reducedMotion.matches) hospitalityVideo.pause();
  else hospitalityVideo.play().catch(() => {});
}
reducedMotion.addEventListener('change', syncHospitalityVideo);
syncHospitalityVideo();

// Entrance effects preserve semantic text and never reset on upward scroll.
(() => {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionPreference.matches || !('IntersectionObserver' in window)) return;
  const targets = [];
  document.querySelectorAll('h2 .accent-reveal').forEach(accent => {
    targets.push(accent);
  });
  document.querySelectorAll('#hero-title .hero-line').forEach(line => {
    targets.push(line);
  });
  document.querySelectorAll('.service-grid, .steps, .hospitality-details').forEach(group => {
    Array.from(group.children).forEach((card, index) => {
      card.classList.add('card-motion');
      card.style.setProperty('--entrance-delay', `${index * 100}ms`);
      targets.push(card);
    });
  });
  const reveal = target => {
    target.classList.remove('motion-pending');
    observer.unobserve(target);
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
  }, { threshold:0, rootMargin:'0px 0px -8% 0px' });
  targets.forEach(target => target.classList.add('motion-pending'));
  requestAnimationFrame(() => requestAnimationFrame(() => {
    targets.forEach(target => {
      target.classList.add('motion-ready');
      observer.observe(target);
    });
  }));
  document.addEventListener('focusin', event => {
    const target = event.target.closest('.motion-pending');
    if (target) {
      target.classList.remove('motion-ready');
      reveal(target);
    }
  });
  motionPreference.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    targets.forEach(target => target.classList.remove('motion-pending','motion-ready'));
  });
})();
