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

  // Modal logic: opens on any .hero-btn click and shows QR -> Form -> Success
  function initModal() {
    const modal = document.getElementById('howModal');
    if (!modal) {
      console.error('Modal element not found');
      return;
    }

    const dialog = modal.querySelector('.modal-dialog');
    const qr = modal.querySelector('[data-step="qr"]');
    const formStep = modal.querySelector('[data-step="form"]');
    const success = modal.querySelector('[data-step="success"]');
    const openButtons = Array.from(document.querySelectorAll('.hero-btn, .header-btn'));
    const closeButtons = Array.from(modal.querySelectorAll('.modal-close, .modal-close-btn'));
    const form = modal.querySelector('#offerForm');
    const nextButton = modal.querySelector('.modal-next');
    const backButton = modal.querySelector('.modal-back');

    console.log('Modal initialized:', { modal: !!modal, qr: !!qr, form: !!formStep, success: !!success, formEl: !!form });

    // Google Apps Script Web App endpoint (replace with your actual endpoint)
    const GOOGLE_SHEET_URL = 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/userweb?v=1';

    function showStep(stepName) {
      if (qr) qr.hidden = stepName !== 'qr';
      if (formStep) formStep.hidden = stepName !== 'form';
      if (success) success.hidden = stepName !== 'success';
    }

    function openModal() {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      showStep('qr');
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
      if (form) {
        form.reset();
        form.dataset.submitting = 'false';
        const submitBtn = form.querySelector('.modal-submit');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit';
        }
      }
    }

    function showSuccess(paymentMethod) {
      console.log('Showing success screen with payment method:', paymentMethod);
      showStep('success');
      if (success) {
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

        // prevent double submits
        if (form.dataset.submitting === 'true') return;
        form.dataset.submitting = 'true';

        const name = document.getElementById('userName')?.value || '';
        const number = document.getElementById('userNumber')?.value || '';
        const email = document.getElementById('userEmail')?.value || '';
        const paymentMethod = document.getElementById('paymentMethod')?.value || '';

        // Validate
        if (!name || !number || !email || !paymentMethod) {
          alert('Please fill all fields');
          form.dataset.submitting = 'false';
          return;
        }

        const submitBtn = form.querySelector('.modal-submit');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';
        }

        // show success immediately to avoid repeat clicks
        showSuccess(paymentMethod);

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
          form.reset();
        } catch (error) {
          console.error('Form submission error:', error);
          alert('Error submitting form. Please try again.');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
          }
          showStep('form');
          form.dataset.submitting = 'false';
        }
      });
    }

    openButtons.forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    }));

    closeButtons.forEach(b => b.addEventListener('click', closeModal));

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-backdrop')) closeModal();
    });

    if (nextButton) nextButton.addEventListener('click', () => showStep('form'));
    if (backButton) backButton.addEventListener('click', () => showStep('qr'));
  }

})();
