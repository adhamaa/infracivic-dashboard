// js/main.js -- InfraCivic feature bootstrap

document.addEventListener('DOMContentLoaded', async () => {
  IC.initModal();
  IC.initToast();
  IC.initFilters();
  IC.initListView();
  IC.initQuickActions();
  IC.initRoutes();
  IC.initRender();
  await IC.initMap();
});