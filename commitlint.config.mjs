export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nouvelle fonctionnalité
        'fix', // Correction de bug
        'docs', // Documentation
        'style', // Style/formatage (pas de changement de code)
        'refactor', // Refactorisation
        'perf', // Performance
        'test', // Tests
        'chore', // Maintenance/Configuration
        'revert', // Revert d'un commit
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-case': [0], // Désactivé pour permettre plus de flexibilité
    'subject-max-length': [2, 'always', 72],
  },
}
