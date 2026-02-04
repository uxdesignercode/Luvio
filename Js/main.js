// Centralized frontend scripts for Luvio
// Handles header scrolled state and hypno background scaling
(function () {
  'use strict';

  function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    const check = () => {
      if (window.scrollY > 10) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };

    window.addEventListener('scroll', check, { passive: true });
    // run once on load
    check();
  }

  function initHypnoScale() {
  const wrapper = document.querySelector('.hypno-wrapper');
  if (!wrapper) return;

  const onScroll = () => {
    const rect = wrapper.getBoundingClientRect();
    const vh = window.innerHeight;

    // Trigger when section is mostly in view
    const isActive = rect.top < vh * 0.75 && rect.bottom > vh * 0.25;

    if (isActive) {
      wrapper.classList.add('scrolling');
    } else {
      wrapper.classList.remove('scrolling');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll(); // run once on load
}

document.addEventListener('DOMContentLoaded', initHypnoScale);

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initHeader();
    initHypnoScale();
    // initialize modal handlers if present
    try { initModal(); } catch (e) { /* ignore if modal not defined */ }
  });

  // Modal logic: opens on any .hero-btn click and shows 'How it works' after Done
  function initModal() {
    const modal = document.getElementById('howModal');
    if (!modal) {
      console.error('Modal element not found');
      return;
    }

    const dialog = modal.querySelector('.modal-dialog');
    const intro = modal.querySelector('[data-step="intro"]');
    const how = modal.querySelector('[data-step="how"]');
    const success = modal.querySelector('[data-step="success"]');
    const openButtons = Array.from(document.querySelectorAll('.hero-btn, .header-btn'));
    const closeButtons = Array.from(modal.querySelectorAll('.modal-close, .modal-close-btn'));
    const form = modal.querySelector('#offerForm');
    const doneButton = modal.querySelector('.modal-done');

    console.log('Modal initialized:', { modal: !!modal, intro: !!intro, how: !!how, success: !!success, form: !!form });

    // Google Apps Script Web App endpoint (replace with your actual endpoint)
    const GOOGLE_SHEET_URL = 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/userweb?v=1';

    function openModal() {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      if (intro) intro.hidden = false;
      if (how) how.hidden = true;
      if (success) success.hidden = true;
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        if (dialog) dialog.focus();
      }, 150);
    }

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      // reset form
      if (form) form.reset();
    }

    function showHow() {
      if (intro) intro.hidden = true;
      if (how) how.hidden = false;
    }

    function showSuccess(paymentMethod) {
      console.log('Showing success screen with payment method:', paymentMethod);
      if (intro) intro.hidden = true;
      if (how) how.hidden = true;
      if (success) {
        success.hidden = false;
        const msg = success.querySelector('.success-message');
        if (msg) {
          msg.textContent = `Thank you! We'll send your link via ${paymentMethod === 'mail' ? 'email' : 'WhatsApp'}.`;
        }
      } else {
        console.error('Success element not found!');
      }
    }

    // Form submission
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('userName')?.value || '';
        const number = document.getElementById('userNumber')?.value || '';
        const email = document.getElementById('userEmail')?.value || '';
        const paymentMethod = document.getElementById('paymentMethod')?.value || '';

        // Validate
        if (!name || !number || !email || !paymentMethod) {
          alert('Please fill all fields');
          return;
        }

        try {
          // Send to Google Sheet via Apps Script
          const payload = { name, number, email, paymentMethod, timestamp: new Date().toISOString() };
          
          console.log('Sending data to Google Sheets:', payload);
          
            const response = await fetch(
            'https://script.google.com/macros/s/AKfycbzBuF-gVOmqbJSS1ru8NEs-zv-QmcPgVKn7hqGY3F6mNQCBuSEeW-zvfqp1Cq1ZXzWsCA/exec',
            {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          console.log('Form submitted successfully');
          showSuccess(paymentMethod);
          form.reset();
        } catch (error) {
          console.error('Form submission error:', error);
          alert('Error submitting form. Please try again.');
        }
      });
    }

    openButtons.forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    }));

    closeButtons.forEach(b => b.addEventListener('click', closeModal));

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    if (doneButton) doneButton.addEventListener('click', showHow);
  }

})();
