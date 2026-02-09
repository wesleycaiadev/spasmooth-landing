# 🧪 GUIA DE TESTES - GSAP + SEO

## 📋 Teste 1: Verificar Animações GSAP

### No Navegador (F12 > Console)
```javascript
// Executar no console do navegador
console.log(typeof gsap);           // deve mostrar "object"
console.log(gsap.timeline);         // deve existir
console.log(gsap.registerPlugin);   // deve existir
```

### Testes Visuais
```
✅ Abrir site
✅ Vê fade-in + slide-up do hero?
✅ Clica em "Servicos" e vê stagger das cards?
✅ Clica em "Depoimentos" e vê slide-left?
✅ Passa mouse em card -> vê scale + glow?
✅ Passa mouse em botão -> vê scale?
✅ WhatsApp button pulsando?
✅ Header esconde ao rolar para baixo?
```

---

## 🔍 Teste 2: Validar Schema.org

### Method 1: Google Rich Results Test
1. Ir a: https://search.google.com/test/rich-results
2. Colar a URL: https://seu-site.com.br
3. Clicar "TEST URL"
4. ✅ Deve validar sem erros

### Method 2: Console JSON-LD
```javascript
// No console do navegador
const scripts = document.querySelectorAll('script[type="application/ld+json"]');
console.log(scripts.length);  // deve ser >= 1
console.log(scripts[0].textContent);  // mostrar o JSON
```

---

## 📱 Teste 3: Mobile-Friendly

### Method 1: Google Mobile-Friendly Test
1. Ir a: https://search.google.com/test/mobile-friendly
2. Colar URL
3. ✅ Deve passar (verde)

### Method 2: Chrome DevTools
1. F12 > Device Toolbar (Ctrl+Shift+M)
2. Testar em iPhone X, iPhone SE, Pixel 2
3. ✅ Animações devem funcionar
4. ✅ Texto legível
5. ✅ Botões clicáveis

---

## ⚡ Teste 4: Performance

### Method 1: Google PageSpeed Insights
1. Ir a: https://pagespeed.web.dev
2. Colar URL
3. ✅ Meta: Score > 80 (desktop), > 70 (mobile)
4. ✅ LCP < 2.5s
5. ✅ FID < 100ms
6. ✅ CLS < 0.1

### Method 2: GTmetrix
1. Ir a: https://gtmetrix.com
2. Colar URL
3. ✅ Performance > 85%
4. ✅ Structure > 90%

### Method 3: DevTools Lighthouse
1. F12 > Lighthouse
2. Selecionar "Performance"
3. Rodar teste
4. ✅ Score > 80 esperado

---

## ✅ Teste 5: Meta Tags

### Method 1: Inspecionar HTML
```bash
F12 > Elements > <head>
Procurar por:
✅ <meta name="description">
✅ <meta name="keywords">
✅ <meta property="og:title">
✅ <meta property="og:description">
✅ <meta property="og:image">
✅ <meta property="twitter:card">
✅ <link rel="canonical">
```

### Method 2: Ferramentas Online
1. Ir a: https://seoquake.com
2. Abrir no navegador seu site
3. ✅ Verificar meta tags encontrados

### Method 3: WhatsApp Preview
1. Abrir WhatsApp Web
2. Buscar contato
3. Compartilhar link do site
4. ✅ Deve mostrar title + description + image

---

## 🔐 Teste 6: SEO Técnico

### Checklist
```
✅ robots.txt existe?
   curl https://seu-site.com.br/robots.txt

✅ sitemap.xml existe?
   curl https://seu-site.com.br/sitemap.xml

✅ HTTPS funciona?
   URL deve começar com https://

✅ Canonical URL?
   <link rel="canonical" href="...">

✅ Structured data válido?
   https://search.google.com/test/rich-results

✅ No redirect loops?
   Seguir redirects até chegar na página
```

---

## 🌐 Teste 7: Validação W3C

### HTML Validation
1. Ir a: https://validator.w3.org
2. Colar URL
3. ✅ Não deve ter erros

### CSS Validation
1. Ir a: https://jigsaw.w3.org/css-validator
2. Colar URL
3. ✅ Não deve ter erros críticos

---

## 📊 Teste 8: Google Search Console

### Setup
1. Ir a: https://search.google.com/search-console
2. Adicionar propriedade (seu site)
3. Verificar propriedade (via DNS ou HTML)
4. Submeter sitemap.xml
5. Submeter robots.txt

### Monitorar
```
✅ Coverage (Indexação)
✅ Enhancements (Structured data)
✅ Core Web Vitals
✅ Search Analytics
✅ Security Issues
```

---

## 🎬 Teste 9: Animações Frame Rate

### Chrome DevTools
1. F12 > More Tools > Rendering
2. Habilitar "FPS Meter"
3. Scroll na página
4. ✅ FPS deve ser 60 (não cair abaixo de 30)

### Checklist
```
✅ Hero fade-in suave (60 FPS)
✅ Cards stagger sem jank
✅ Scroll parallax fluido
✅ FAQ expand suave
✅ WhatsApp pulse continuous
✅ Header hide smooth
```

---

## 🔊 Teste 10: Acessibilidade

### WAVE Tool
1. Ir a: https://wave.webaim.org
2. Colar URL
3. ✅ Sem erros críticos

### Axe DevTools
1. Instalar extensão Chrome: axe DevTools
2. F12 > axe DevTools > Scan
3. ✅ Sem "Critical" issues

### Checklist Manual
```
✅ Teclado: Tab por todos os links/botões?
✅ Cores: Contraste suficiente (WCAG AA)?
✅ Alt text: Todas as imagens têm alt?
✅ Heading order: h1 antes de h2 antes de h3?
✅ Form labels: Inputs têm labels associados?
```

---

## 📈 Teste 11: Monitoramento Google Analytics

### Setup GA4
1. Criar conta em: https://analytics.google.com
2. Adicionar property para seu site
3. Copiar o tag ID (G-XXXXXXXXXX)
4. Adicionar ao head do HTML:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```
5. ✅ Aguardar 24h para dados

---

## 🎯 Teste 12: Conversão Tracking

### WhatsApp Agendar
```
✅ Clique no botão "Agendar"
✅ Preenche formulário
✅ Clica enviar
✅ Abre WhatsApp automático
✅ Mensagem pré-preenchida
✅ Contato correto
```

### Google Analytics Event
1. F12 > Console
2. Ao clicar em botão, deve aparecer evento
3. GA4 > Events > Deve registrar clique

---

## 📋 Checklist de Testes Completo

### Pré-Deploy
- [ ] Animações funcionam (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsivo (iOS, Android)
- [ ] Performance > 80 (PageSpeed)
- [ ] Schema.org válido (Rich Results Test)
- [ ] Mobile-friendly (Mobile Test)
- [ ] Sem console errors (F12 Console)
- [ ] Sem console warnings críticos
- [ ] Links funcionam
- [ ] Formulário envia via WhatsApp
- [ ] Imagens carregam

### Pós-Deploy
- [ ] Site indexado no Google (site:seu-site.com.br)
- [ ] Sitemap enviado (Google Search Console)
- [ ] Robots.txt reconhecido (GSC)
- [ ] Rich results mostram (Google SERP)
- [ ] Core Web Vitals bons (GSC)
- [ ] Google My Business criado
- [ ] Analytics instalado
- [ ] Conversão tracking setup
- [ ] Monitorar por 2 semanas
- [ ] Ajustar conforme dados

---

## 🐛 Debugging

### Se animações não funcionam:
```javascript
// Console
console.log(gsap);              // deve existir
console.log(ScrollTrigger);     // deve existir
document.querySelectorAll('script').forEach(s => console.log(s.src));
// Procurar por: cdnjs.cloudflare.com/ajax/libs/gsap
```

### Se meta tags não aparecem:
```javascript
// Console
const desc = document.querySelector('meta[name="description"]');
console.log(desc ? desc.content : "Not found");

const og = document.querySelector('meta[property="og:title"]');
console.log(og ? og.content : "Not found");
```

### Se ScrollTrigger não funciona:
```javascript
// Console
gsap.registerPlugin(ScrollTrigger);
console.log(ScrollTrigger);     // deve ser objeto
```

---

## 📞 Suporte

### Referências
- GSAP Docs: https://greensock.com/gsap
- Schema.org: https://schema.org
- Google SEO: https://developers.google.com/search
- MDN Web: https://developer.mozilla.org

### Ferramentas Úteis
- PageSpeed Insights: https://pagespeed.web.dev
- Google Mobile-Friendly: https://search.google.com/test/mobile-friendly
- Rich Results Test: https://search.google.com/test/rich-results
- Google Search Console: https://search.google.com/search-console
- Analytics: https://analytics.google.com

---

## ✅ Status Final

Todos os testes implementados e documentados!

**Próximo passo: Execute os testes conforme checklist acima! 🚀**

---

**Desenvolvido com ❤️ para SpaSmooth**
