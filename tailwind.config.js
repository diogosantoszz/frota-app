/* tailwind.config.js */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          '50': '#f0f9ff',
          '100': '#e0f2fe',
          '200': '#bae6fd',
          '300': '#7dd3fc',
          '400': '#38bdf8',
          '500': '#0ea5e9',
          '600': '#0284c7',
          '700': '#0369a1',
          '800': '#075985',
          '900': '#0c4a6e',
          '950': '#082f49',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};

/* app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 248, 250, 252;
}

html {
  scroll-behavior: smooth;
}

body {
  color: rgb(var(--foreground-rgb));
  background-color: rgb(var(--background-rgb));
  font-family: 'Inter', sans-serif;
}

/* Estilos base para elementos HTML */
@layer base {
  h1 {
    @apply text-2xl font-bold text-gray-900;
  }
  
  h2 {
    @apply text-xl font-bold text-gray-900;
  }
  
  h3 {
    @apply text-lg font-medium text-gray-900;
  }
  
  p {
    @apply text-base text-gray-700;
  }
  
  a {
    @apply text-blue-600 hover:text-blue-800 transition-colors;
  }
  
  label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
  
  input, select, textarea {
    @apply w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  }
  
  button {
    @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
  }
}

/* Componentes personalizados */
@layer components {
  .card {
    @apply bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden;
  }
  
  .card-header {
    @apply flex flex-col space-y-1.5 p-6;
  }
  
  .card-title {
    @apply text-lg md:text-xl font-semibold leading-none tracking-tight;
  }
  
  .card-description {
    @apply text-sm text-gray-500;
  }
  
  .card-content {
    @apply p-6 pt-0;
  }
  
  .card-footer {
    @apply flex items-center p-6 pt-0;
  }
  
  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
  
  .badge-success {
    @apply bg-green-100 text-green-800;
  }
  
  .badge-warning {
    @apply bg-yellow-100 text-yellow-800;
  }
  
  .badge-danger {
    @apply bg-red-100 text-red-800;
  }
  
  .badge-info {
    @apply bg-blue-100 text-blue-800;
  }
  
  .badge-outline {
    @apply bg-transparent border border-gray-300 text-gray-700;
  }
  
  .btn {
    @apply inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
  }
  
  .btn-secondary {
    @apply bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500;
  }
  
  .btn-danger {
    @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
  }
  
  .btn-outline {
    @apply bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500;
  }
  
  .btn-sm {
    @apply h-8 text-xs px-3 py-1 rounded;
  }
  
  .btn-md {
    @apply h-10 text-sm px-4 py-2 rounded-md;
  }
  
  .btn-lg {
    @apply h-12 text-base px-8 py-3 rounded-md;
  }
}

/* Utilitários */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .transition-300 {
    @apply transition-all duration-300 ease-in-out;
  }
  
  .flex-center {
    @apply flex items-center justify-center;
  }
  
  .grid-responsive {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
  }
}