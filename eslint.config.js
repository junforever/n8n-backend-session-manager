import globals from 'globals';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_', // Ignorar argumentos que comienzan con _
          varsIgnorePattern: '^_', // Ignorar variables que comienzan con _
          caughtErrorsIgnorePattern: '^_', // Ignorar errores capturados que comienzan con _
        },
      ],
    },
  },
];
