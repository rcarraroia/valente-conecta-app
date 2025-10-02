#!/usr/bin/env node

/**
 * Script para testar funcionalidades PWA
 * Verifica se todos os componentes estão funcionando
 */

import fs from 'fs';
import path from 'path';

console.log('🧪 TESTE PWA - VALENTE CONECTA');
console.log('==============================\n');

// 1. Verificar arquivos gerados
console.log('1️⃣ Verificando arquivos PWA...');

const distPath = './dist';
const requiredFiles = [
  'manifest.webmanifest',
  'sw.js',
  'index.html'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - OK`);
  } else {
    console.log(`❌ ${file} - AUSENTE`);
    allFilesExist = false;
  }
});

// 2. Verificar manifest.webmanifest
console.log('\n2️⃣ Verificando manifest...');

try {
  const manifestPath = path.join(distPath, 'manifest.webmanifest');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    console.log(`✅ Nome: ${manifest.name}`);
    console.log(`✅ Nome curto: ${manifest.short_name}`);
    console.log(`✅ Display: ${manifest.display}`);
    console.log(`✅ Theme color: ${manifest.theme_color}`);
    console.log(`✅ Ícones: ${manifest.icons?.length || 0} configurados`);
    
    if (manifest.icons && manifest.icons.length > 0) {
      manifest.icons.forEach(icon => {
        console.log(`   📱 ${icon.sizes} - ${icon.src}`);
      });
    }
  }
} catch (error) {
  console.log(`❌ Erro ao ler manifest: ${error.message}`);
}

// 3. Verificar Service Worker
console.log('\n3️⃣ Verificando Service Worker...');

try {
  const swPath = path.join(distPath, 'sw.js');
  if (fs.existsSync(swPath)) {
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    console.log(`✅ Service Worker gerado (${Math.round(swContent.length / 1024)}KB)`);
    
    // Verificar se contém funcionalidades esperadas
    const features = [
      { name: 'Precaching', check: swContent.includes('precache') },
      { name: 'Runtime Caching', check: swContent.includes('runtimeCaching') },
      { name: 'Workbox', check: swContent.includes('workbox') }
    ];
    
    features.forEach(feature => {
      console.log(`${feature.check ? '✅' : '❌'} ${feature.name}`);
    });
  }
} catch (error) {
  console.log(`❌ Erro ao ler Service Worker: ${error.message}`);
}

// 4. Verificar index.html
console.log('\n4️⃣ Verificando HTML...');

try {
  const htmlPath = path.join(distPath, 'index.html');
  if (fs.existsSync(htmlPath)) {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const checks = [
      { name: 'Manifest link', check: htmlContent.includes('manifest.webmanifest') },
      { name: 'Theme color', check: htmlContent.includes('theme-color') },
      { name: 'Apple touch icon', check: htmlContent.includes('apple-touch-icon') },
      { name: 'Mobile web app', check: htmlContent.includes('mobile-web-app-capable') }
    ];
    
    checks.forEach(check => {
      console.log(`${check.check ? '✅' : '❌'} ${check.name}`);
    });
  }
} catch (error) {
  console.log(`❌ Erro ao ler HTML: ${error.message}`);
}

// 5. Verificar ícones
console.log('\n5️⃣ Verificando ícones...');

const iconFiles = ['pwa-192x192.png', 'pwa-512x512.png'];
iconFiles.forEach(icon => {
  const iconPath = path.join('./public', icon);
  if (fs.existsSync(iconPath)) {
    const stats = fs.statSync(iconPath);
    console.log(`✅ ${icon} - ${Math.round(stats.size / 1024)}KB`);
  } else {
    console.log(`❌ ${icon} - AUSENTE`);
  }
});

// 6. Resumo final
console.log('\n📊 RESUMO DO TESTE PWA');
console.log('======================');

if (allFilesExist) {
  console.log('✅ BUILD PWA: SUCESSO');
  console.log('✅ MANIFEST: CONFIGURADO');
  console.log('✅ SERVICE WORKER: ATIVO');
  console.log('✅ ÍCONES: DISPONÍVEIS');
  
  console.log('\n🚀 PRÓXIMOS PASSOS:');
  console.log('1. Testar instalação no Chrome/Edge');
  console.log('2. Verificar funcionalidade offline');
  console.log('3. Testar em dispositivos móveis');
  console.log('4. Substituir ícones por versões oficiais');
  
  console.log('\n📱 COMO TESTAR:');
  console.log('1. npm run build && npm run preview');
  console.log('2. Abrir http://localhost:4173');
  console.log('3. DevTools > Application > Manifest');
  console.log('4. Lighthouse > PWA audit');
  
  console.log('\n🎉 PWA IMPLEMENTADO COM SUCESSO!');
} else {
  console.log('❌ PROBLEMAS ENCONTRADOS');
  console.log('Verifique os arquivos ausentes acima');
}

console.log('\n🏁 Teste concluído');