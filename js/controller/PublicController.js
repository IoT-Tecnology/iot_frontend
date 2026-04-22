/**
 * js/controller/PublicController.js
 * Boots the unauthenticated public map mode.
 */
const PublicController = (() => {
  let initialized = false;
  let lastMachines = [];

  function isPublicMode() {
    return new URLSearchParams(window.location.search).get('view') === 'public';
  }

  function updateStatusFromCache() {
    if (!initialized) return;
    if (!lastMachines.length) {
      PublicView.setStatus(I18nService.t('public.empty'), 'empty');
      return;
    }
    PublicView.renderMachines(lastMachines);
    PublicView.setStatus(I18nService.t('public.summary', { count: lastMachines.length }), 'ok');
  }

  async function init() {
    if (!isPublicMode()) return;

    PublicView.setBodyMode();
    PublicView.ensureMap();

    if (!initialized) {
      initialized = true;
      window.addEventListener('i18n:changed', updateStatusFromCache);
    }

    PublicView.setStatus(I18nService.t('public.loading'));

    try {
      const machines = await PublicService.listMachinesForMap();
      lastMachines = machines;
      if (!machines.length) {
        PublicView.renderMachines([]);
        PublicView.setStatus(I18nService.t('public.empty'), 'empty');
        return;
      }

      PublicView.renderMachines(machines);
      PublicView.setStatus(I18nService.t('public.summary', { count: machines.length }), 'ok');
    } catch (error) {
      console.error('[PublicController]', error);
      PublicView.renderMachines([]);
      PublicView.setStatus(error?.message || I18nService.t('public.loadError'), 'err');
    }
  }

  return {
    init,
    isPublicMode,
  };
})();
