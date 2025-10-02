#!/usr/bin/env node

/**
 * Script para converter SVGs para PNG usando Sharp
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const icons = [
  { input: 'public/pwa-192x192.svg', output: 'public/pwa-192x192.png', size: 192 },
  { input: 'public/pwa-512x512.svg', output: 'public/pwa-512x512.png', size: 512 },
  { input: 'public/apple-touch-icon.svg', output: 'public/apple-touch-icon.png', size: 180 },
  { input: 'public/favicon-32x32.svg', output: 'public/favicon-32x32.png', size: 32 },
  { input: 'public/favicon-16x16.svg', output: 'public/favicon-16x16.png', size: 16 }
];

async function convertIcons() {
  console.log('🔄 Convertendo SVGs para PNG com Sharp...');
  
  for (const icon of icons) {
    try {
      if (!fs.existsSync(icon.input)) {
        console.log(`⚠️ Arquivo não encontrado: ${icon.input}`);
        continue;
      }
      
      await sharp(icon.input)
        .resize(icon.size, icon.size)
        .png({ quality: 100, compressionLevel: 6 })
        .toFile(icon.output);
      
      const stats = fs.statSync(icon.output);
      console.log(`✅ ${icon.output} criado (${Math.round(stats.size / 1024)}KB)`);
    } catch (error) {
      console.error(`❌ Erro ao converter ${icon.input}:`, error.message);
    }
  }
  
  console.log('\n🎉 Conversão concluída!');
  console.log('📋 Próximo passo: npm run build && npm run preview');
}

convertIcons();