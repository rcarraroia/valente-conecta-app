#!/usr/bin/env node

/**
 * Script para gerar ícones PWA básicos
 * Cria ícones temporários até que sejam substituídos pelos oficiais
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG básico para ícone PWA temporário
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <g transform="translate(${size * 0.2}, ${size * 0.2})">
    <!-- Coração -->
    <path d="M${size * 0.3} ${size * 0.15} 
             C${size * 0.25} ${size * 0.1} ${size * 0.15} ${size * 0.1} ${size * 0.15} ${size * 0.2}
             C${size * 0.15} ${size * 0.1} ${size * 0.05} ${size * 0.1} 0 ${size * 0.15}
             C0 ${size * 0.25} ${size * 0.15} ${size * 0.4} ${size * 0.3} ${size * 0.5}
             C${size * 0.45} ${size * 0.4} ${size * 0.6} ${size * 0.25} ${size * 0.6} ${size * 0.15}
             C${size * 0.55} ${size * 0.1} ${size * 0.45} ${size * 0.1} ${size * 0.45} ${size * 0.2}
             C${size * 0.45} ${size * 0.1} ${size * 0.35} ${size * 0.1} ${size * 0.3} ${size * 0.15} Z" 
          fill="white" opacity="0.9"/>
    <!-- Texto CV -->
    <text x="${size * 0.3}" y="${size * 0.4}" 
          font-family="Arial, sans-serif" 
          font-size="${size * 0.08}" 
          font-weight="bold" 
          fill="white" 
          text-anchor="middle">CV</text>
  </g>
</svg>`;

// Função para converter SVG para PNG (simulado - em produção usar sharp ou canvas)
const createIconFile = (size, filename) => {
  const svgContent = createIconSVG(size);
  const base64 = Buffer.from(svgContent).toString('base64');
  
  // Para desenvolvimento, vamos criar um arquivo de referência
  const iconInfo = {
    size: size,
    format: 'SVG (converter para PNG em produção)',
    content: svgContent,
    instructions: [
      '1. Usar este SVG como base',
      '2. Converter para PNG usando ferramenta online ou sharp',
      '3. Salvar como ' + filename,
      '4. Ou usar logo oficial do Instituto Coração Valente'
    ]
  };
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'public', filename + '.info.json'), 
    JSON.stringify(iconInfo, null, 2)
  );
  
  // Criar arquivo SVG temporário
  fs.writeFileSync(
    path.join(__dirname, '..', 'public', filename.replace('.png', '.svg')), 
    svgContent
  );
  
  console.log(`✅ Criado: ${filename} (SVG temporário + instruções)`);
};

// Gerar ícones
console.log('🎨 Gerando ícones PWA...\n');

createIconFile(192, 'pwa-192x192.png');
createIconFile(512, 'pwa-512x512.png');

console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('1. Converter os SVGs para PNG usando:');
console.log('   - https://convertio.co/svg-png/');
console.log('   - Ou usar sharp: npm install sharp');
console.log('2. Substituir pelos ícones oficiais do Instituto');
console.log('3. Testar PWA com: npm run build && npm run preview');

console.log('\n🎉 Ícones PWA configurados!');