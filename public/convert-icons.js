#!/usr/bin/env node

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
      
      console.log(`✅ ${icon.output} criado`);
    } catch (error) {
      console.error(`❌ Erro ao converter ${icon.input}:`, error.message);
    }
  }
  
  console.log('🎉 Conversão concluída!');
}

convertIcons();
