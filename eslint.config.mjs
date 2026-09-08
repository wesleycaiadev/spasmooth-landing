import nextVitals from 'eslint-config-next/core-web-vitals';
const config = [
    ...nextVitals,
    { ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'node_modules/**'] },
    // Existing React 18 effect patterns: report performance migration work without blocking security fixes.
    { rules: { 'react-hooks/set-state-in-effect': 'warn', 'react-hooks/immutability': 'warn', 'react-hooks/refs': 'warn' } },
];
export default config;
