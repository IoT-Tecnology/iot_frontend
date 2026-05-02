/**
 * js/view/PublicView.js
 * Renders the public map and secure machine popups.
 */
const PublicView = (() => {
  const DEFAULT_CENTER = [4.5709, -74.2973];
  const DEFAULT_ZOOM = 5;
  const MIN_ZOOM = 4;
  const MAX_ZOOM = 8;

  let publicMap = null;
  let markerLayer = null;

  function t(key, params = {}, fallback = '') {
    return I18nService.t(key, params, fallback);
  }

  function el(id) {
    return document.getElementById(id);
  }

  function setBodyMode() {
    document.body.classList.add('public-mode');
    document.body.classList.remove('auth-locked');
  }

  function setStatus(message = '', type = '') {
    const target = el('public-status');
    if (!target) return;
    target.textContent = message;
    target.className = 'public-status' + (type ? ' ' + type : '');
  }

  function ensureMap() {
    if (publicMap || typeof L === 'undefined' || !el('public-map')) return publicMap;

    publicMap = L.map('public-map', {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      doubleClickZoom: false,
      scrollWheelZoom: true,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(publicMap);

    markerLayer = L.layerGroup().addTo(publicMap);
    window.setTimeout(() => publicMap.invalidateSize(), 0);
    return publicMap;
  }

  function formatProductsPerHour(productsPerHour) {
    if (productsPerHour === null || productsPerHour === undefined || !Number.isFinite(Number(productsPerHour))) return t('common.notAvailable');
    return Number(productsPerHour).toLocaleString(I18nService.getIntlLocale(), {
      maximumFractionDigits: 2,
    });
  }

  function createMarkerIcon(machine) {
    const productsPerHourLabel = formatProductsPerHour(machine.productsPerHour);
    return L.divIcon({
      className: 'public-machine-marker-wrap',
      html:
        '<div class="public-machine-marker">' +
          '<span class="public-machine-marker__pulse"></span>' +
          '<span class="public-machine-marker__core"></span>' +
          '<span class="public-machine-marker__label">' + Helpers.escapeHtml(productsPerHourLabel) + '</span>' +
        '</div>',
      iconSize: [84, 46],
      iconAnchor: [22, 22],
      popupAnchor: [22, -10],
    });
  }

  function buildPopup(machine) {
    return (
      '<article class="public-popup">' +
        '<dl>' +
          '<div><dt>' + Helpers.escapeHtml(t('public.productsPerHour')) + '</dt><dd>' + Helpers.escapeHtml(formatProductsPerHour(machine.productsPerHour)) + '</dd></div>' +
        '</dl>' +
      '</article>'
    );
  }

  function resetViewport() {
    const map = ensureMap();
    if (!map) return;
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: false });
  }

  function renderMachines(machines = []) {
    const map = ensureMap();
    if (!map || !markerLayer) return;

    markerLayer.clearLayers();

    if (!machines.length) {
      resetViewport();
      return;
    }

    const bounds = [];
    machines.forEach(machine => {
      const point = [machine.latitude, machine.longitude];
      bounds.push(point);
      L.marker(point, {
        icon: createMarkerIcon(machine),
      })
        .bindPopup(buildPopup(machine), {
          autoPan: true,
          closeButton: true,
          className: 'public-popup-shell',
        })
        .addTo(markerLayer);
    });

    if (bounds.length === 1) {
      map.setView(bounds[0], 6, { animate: false });
      return;
    }

    map.fitBounds(bounds, {
      padding: [72, 72],
      maxZoom: MAX_ZOOM,
      animate: false,
    });
  }

  return {
    setBodyMode,
    setStatus,
    ensureMap,
    renderMachines,
  };
})();
