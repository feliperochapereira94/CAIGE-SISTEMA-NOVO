(function () {
  function resolveLocale() {
    if (!window.flatpickr || !window.flatpickr.l10ns) {
      return 'pt';
    }

    if (window.flatpickr.l10ns.pt && window.flatpickr.l10ns.default !== window.flatpickr.l10ns.pt) {
      window.flatpickr.localize(window.flatpickr.l10ns.pt);
    }

    return 'pt';
  }

  function initPtBrDatePicker(selector, options = {}) {
    if (!window.flatpickr) {
      return [];
    }

    const locale = resolveLocale();
    const elements = document.querySelectorAll(selector);
    if (!elements.length) {
      return [];
    }

    const defaultConfig = {
      locale,
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd/m/Y',
      allowInput: false,
      disableMobile: true,
      onReady: function (selectedDates, dateStr, instance) {
        if (instance.altInput && instance.input && instance.input.id) {
          const altId = `${instance.input.id}-display`;
          instance.altInput.id = altId;
          const label = document.querySelector(`label[for="${instance.input.id}"]`);
          if (label) {
            label.setAttribute('for', altId);
          }
        }
        if (typeof options.onReady === 'function') {
          options.onReady(selectedDates, dateStr, instance);
        }
      },
      onDestroy: function (selectedDates, dateStr, instance) {
        if (instance.input && instance.input.id) {
          const altId = `${instance.input.id}-display`;
          const label = document.querySelector(`label[for="${altId}"]`);
          if (label) {
            label.setAttribute('for', instance.input.id);
          }
        }
        if (typeof options.onDestroy === 'function') {
          options.onDestroy(selectedDates, dateStr, instance);
        }
      },
      onChange: function (selectedDates, dateStr, instance) {
        const inputEvent = new Event('input', { bubbles: true });
        const changeEvent = new Event('change', { bubbles: true });
        instance.input.dispatchEvent(inputEvent);
        instance.input.dispatchEvent(changeEvent);
        if (typeof options.onChange === 'function') {
          options.onChange(selectedDates, dateStr, instance);
        }
      }
    };

    return Array.from(elements).map((element) => window.flatpickr(element, { ...defaultConfig, ...options }));
  }

  window.initPtBrDatePicker = initPtBrDatePicker;
})();
