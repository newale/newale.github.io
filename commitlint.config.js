module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [
      'dashboard',
      'por-hacer',
      'hecho',
      'escala-notas',
      'ui',
      'main-site',
      'deploy',
      'deps',
    ]],
    'scope-empty': [1, 'never'], // warn si no hay scope
  },
};
