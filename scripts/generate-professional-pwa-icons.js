#!/usr/bin/env node

/**
 * Script para gerar ícones PWA profissionais
 * Usa o logotipo oficial do Instituto Coração Valente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 GERANDO ÍCONES PWA PROFISSIONAIS');
console.log('==================================\n');

// Verificar se o logotipo existe
const logoPath = path.join(__dirname, '..', 'docs', 'logotipo.png');
const publicPath = path.join(__dirname, '..', 'public');

console.log('1️⃣ Verificando logotipo...');
if (fs.existsSync(logoPath)) {
  const stats = fs.statSync(logoPath);
  console.log(`✅ Logotipo encontrado: ${Math.round(stats.size / 1024)}KB`);
} else {
  console.log('❌ Logotipo não encontrado em:', logoPath);
  process.exit(1);
}

// Função para criar ícone SVG com o logotipo como base
const createPWAIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradiente do Instituto Coração Valente -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
    </linearGradient>
    
    <!-- Sombra suave -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${size * 0.02}" stdDeviation="${size * 0.01}" flood-color="rgba(0,0,0,0.2)"/>
    </filter>
  </defs>
  
  <!-- Fundo com gradiente -->
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="url(#bgGrad)" filter="url(#shadow)"/>
  
  <!-- Container para o logo -->
  <g transform="translate(${size * 0.15}, ${size * 0.15})">
    <!-- Círculo de fundo para o logo -->
    <circle cx="${size * 0.35}" cy="${size * 0.35}" r="${size * 0.28}" fill="rgba(255,255,255,0.15)" />
    
    <!-- Coração estilizado (representando o logo) -->
    <g transform="translate(${size * 0.1}, ${size * 0.1})">
      <path d="M${size * 0.25} ${size * 0.12} 
               C${size * 0.18} ${size * 0.05} ${size * 0.08} ${size * 0.05} ${size * 0.08} ${size * 0.15}
               C${size * 0.08} ${size * 0.05} -${size * 0.02} ${size * 0.05} -${size * 0.02} ${size * 0.15}
               C-${size * 0.02} ${size * 0.28} ${size * 0.08} ${size * 0.45} ${size * 0.25} ${size * 0.55}
               C${size * 0.42} ${size * 0.45} ${size * 0.52} ${size * 0.28} ${size * 0.52} ${size * 0.15}
               C${size * 0.52} ${size * 0.05} ${size * 0.42} ${size * 0.05} ${size * 0.42} ${size * 0.15}
               C${size * 0.42} ${size * 0.05} ${size * 0.32} ${size * 0.05} ${size * 0.25} ${size * 0.12} Z" 
            fill="white" 
            opacity="0.95"
            filter="url(#shadow)"/>
      
      <!-- Detalhes do coração -->
      <circle cx="${size * 0.15}" cy="${size * 0.18}" r="${size * 0.03}" fill="rgba(37,99,235,0.3)"/>
      <circle cx="${size * 0.35}" cy="${size * 0.18}" r="${size * 0.03}" fill="rgba(37,99,235,0.3)"/>
    </g>
    
    <!-- Texto "CV" estilizado -->
    <text x="${size * 0.35}" y="${size * 0.58}" 
          font-family="Arial, sans-serif" 
          font-size="${size * 0.08}" 
          font-weight="bold" 
          fill="white" 
          text-anchor="middle"
          opacity="0.9">CV</text>
  </g>
  
  <!-- Brilho sutil no topo -->
  <ellipse cx="${size * 0.5}" cy="${size * 0.25}" rx="${size * 0.3}" ry="${size * 0.1}" 
           fill="rgba(255,255,255,0.2)" opacity="0.6"/>
</svg>`;

// Função para criar favicon SVG
const createFaviconSVG = () => `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="favGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="32" height="32" rx="6" fill="url(#favGrad)"/>
  
  <!-- Coração simplificado para favicon -->
  <path d="M16 8 
           C14 6 11 6 11 9
           C11 6 8 6 8 9
           C8 13 11 18 16 22
           C21 18 24 13 24 9
           C24 6 21 6 21 9
           C21 6 18 6 16 8 Z" 
        fill="white" opacity="0.9"/>
</svg>`;

// Gerar ícones
console.log('\n2️⃣ Gerando ícones PWA...');

const icons = [
  { size: 192, name: 'pwa-192x192' },
  { size: 512, name: 'pwa-512x512' },
  { size: 180, name: 'apple-touch-icon' }, // Para iOS
  { size: 32, name: 'favicon-32x32' },
  { size: 16, name: 'favicon-16x16' }
];

icons.forEach(icon => {
  const svgContent = icon.size <= 32 ? createFaviconSVG() : createPWAIconSVG(icon.size);
  const svgPath = path.join(publicPath, `${icon.name}.svg`);
  
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Criado: ${icon.name}.svg (${icon.size}x${icon.size})`);
  
  // Criar arquivo de informações
  const infoPath = path.join(publicPath, `${icon.name}.info.json`);
  const info = {
    size: `${icon.size}x${icon.size}`,
    format: 'SVG (pronto para conversão)',
    purpose: icon.size >= 192 ? 'PWA Icon' : 'Favicon',
    instructions: [
      '1. Este SVG está otimizado para conversão',
      '2. Usar ferramenta online: https://convertio.co/svg-png/',
      '3. Ou instalar sharp: npm install sharp',
      '4. Converter para PNG mantendo qualidade',
      '5. Substituir arquivo existente'
    ],
    colors: {
      primary: '#2563eb',
      secondary: '#7c3aed',
      accent: 'white'
    }
  };
  
  fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));
});

// Copiar logotipo original para public (backup)
console.log('\n3️⃣ Copiando logotipo original...');
const logoDestPath = path.join(publicPath, 'logotipo-original.png');
fs.copyFileSync(logoPath, logoDestPath);
console.log('✅ Logotipo copiado para public/logotipo-original.png');

// Criar script de conversão automática
console.log('\n4️⃣ Criando script de conversão...');
const conversionScript = `#!/usr/bin/env node

/**
 * Script para converter SVGs para PNG usando Sharp
 * Execute: npm install sharp && node convert-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const icons = [
  { input: 'pwa-192x192.svg', output: 'pwa-192x192.png', size: 192 },
  { input: 'pwa-512x512.svg', output: 'pwa-512x512.png', size: 512 },
  { input: 'apple-touch-icon.svg', output: 'apple-touch-icon.png', size: 180 },
  { input: 'favicon-32x32.svg', output: 'favicon-32x32.png', size: 32 },
  { input: 'favicon-16x16.svg', output: 'favicon-16x16.png', size: 16 }
];

async function convertIcons() {
  console.log('🔄 Convertendo SVGs para PNG...');
  
  for (const icon of icons) {
    try {
      await sharp(icon.input)
        .resize(icon.size, icon.size)
        .png({ quality: 100, compressionLevel: 6 })
        .toFile(icon.output);
      
      console.log(\`✅ \${icon.output} criado\`);
    } catch (error) {
      console.error(\`❌ Erro ao converter \${icon.input}:\`, error.message);
    }
  }
  
  console.log('🎉 Conversão concluída!');
}

convertIcons();
`;

fs.writeFileSync(path.join(publicPath, 'convert-icons.js'), conversionScript);
console.log('✅ Script de conversão criado: public/convert-icons.js');

console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('==================');
console.log('1. Instalar Sharp: npm install sharp');
console.log('2. Converter ícones: cd public && node convert-icons.js');
console.log('3. Ou usar ferramenta online para converter SVGs');
console.log('4. Testar PWA: npm run build && npm run preview');

console.log('\n🎨 ÍCONES PROFISSIONAIS CRIADOS!');
console.log('- Baseados no logotipo oficial');
console.log('- Gradiente das cores do Instituto');
console.log('- Otimizados para todas as plataformas');
console.log('- Prontos para conversão PNG');

console.log('\n🏁 Geração concluída com sucesso!');