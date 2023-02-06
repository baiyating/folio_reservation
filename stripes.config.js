module.exports = {
  okapi: {
    url: 'http://58.33.104.58:41209',
    tenant: 'shlibrary',
    local: 'zh_CN',
  },
  config: {
    logCategories: 'core,path,action,xhr',
    logPrefix: '--',
    showPerms: false,
    hasAllPerms: true,
    // languages: ['zh_CN', 'zh'],
  },
  modules: {
    '@folio/stripes-smart-components-jt': {},
    '@folio/stripes-components': {},
    '@folio/reservation': {},
  },
};