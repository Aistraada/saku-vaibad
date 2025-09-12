#!/usr/bin/env node
/*
 Syncs text content from content/site-text.md into HTML files.
 Focused replacements using simple regex patterns.
*/

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const mdPath = path.join(root, 'content', 'site-text.md');
const indexPath = path.join(root, 'index.html');
const galleryPath = path.join(root, 'galerii.html');

function read(p) { return fs.readFileSync(p, 'utf8'); }
function write(p, s) { fs.writeFileSync(p, s, 'utf8'); }

function extract(md, label, re) {
  const m = md.match(re);
  if (!m) return null;
  return m[1].trim();
}

function extractAll(md, re) {
  const results = {};
  for (const m of md.matchAll(re)) {
    results[m[1].trim()] = m[2].trim();
  }
  return results;
}

function main() {
  const md = read(mdPath);

  // Global items
  const title = extract(md, 'title', /Lehe\s*<title>:\s*(.+)/i) || null;
  const metaDesc = extract(md, 'meta', /Meta\s*description:\s*(.+)/i) || null;
  const heroH1 = extract(md, 'h1', /H1\s*pealkiri:\s*(.+)/i) || null;

  // Pre-second section small heading
  const preSec2 = extract(md, 'pre2', /\n4\)\s*Väike pealkiri[^\n]*\n-\s*(.+)\n/i) || null;

  // Section 2 paragraph
  const sec2Para = extract(md, 's2p', /5\)\s*Sektsioon 2[\s\S]*?\n-\s*([\s\S]*?)\n\n/i) || extract(md, 's2p2', /5\)\s*Sektsioon 2[\s\S]*?-\s*(.+)\n/i) || null;

  // Section 3 heading and text
  const sec3Heading = extract(md, 's3h', /Sektsioon\s*3\s*–\s*Tegija Lugu[\s\S]*?Pealkiri:\s*(.+)/i) || 'Tegija Lugu';
  const sec3Para = extract(md, 's3p', /Sektsioon\s*3[\s\S]*?Tekst:\s*([\s\S]*?)\n\n/i) || null;

  // Materials heading
  const materialsHeading = extract(md, 'mhead', /Sektsioon\s*4[^\n]*\n-\s*(Vaipade materjalid)/i) || 'Vaipade materjalid';

  // Materials subsections
  const puuvillH3 = extract(md, 'pvh3', /7\.1\)\s*1\.\s*([^\n]+)\n/i) || '1. Puuvillavaibad';
  const puuvillSub = extract(md, 'pvs', /7\.1\)[\s\S]*?Alapealkiri:\s*([^\n]+)/i) || null;
  const puuvillT1 = extract(md, 'pvt1', /7\.1\)[\s\S]*?Tekst\s*1:\s*([\s\S]*?)\n/i) || null;
  const puuvillT2 = extract(md, 'pvt2', /7\.1\)[\s\S]*?Tekst\s*2.*?:\s*([\s\S]*?)\n/i) || null;

  const kaltsH3 = extract(md, 'kh3', /7\.2\)\s*2\.\s*([^\n]+)\n/i) || '2. Kaltsuvaibad';
  const kaltsSub = extract(md, 'ksub', /7\.2\)[\s\S]*?Alapealkiri:\s*([^\n]+)/i) || null;
  const kaltsT1 = extract(md, 'kt1', /7\.2\)[\s\S]*?Tekst\s*1:\s*([\s\S]*?)\n/i) || null;
  const kaltsT2 = extract(md, 'kt2', /7\.2\)[\s\S]*?Tekst\s*2:\s*([\s\S]*?)\n/i) || null;

  const villH3 = extract(md, 'vh3', /7\.3\)\s*3\.\s*([^\n]+)\n/i) || '3. Villavaibad';
  const villSub = extract(md, 'vsub', /7\.3\)[\s\S]*?Alapealkiri:\s*([^\n]+)/i) || null;
  const villT1 = extract(md, 'vt1', /7\.3\)[\s\S]*?Tekst\s*1:\s*([\s\S]*?)\n/i) || null;
  const villT2 = extract(md, 'vt2', /7\.3\)[\s\S]*?Tekst\s*2:\s*([\s\S]*?)\n/i) || null;

  // Contact
  const contactH2 = extract(md, 'ch2', /Sektsioon\s*5\s*–\s*Võta ühendust.*?Pealkiri:\s*([^\n]+)/i) || 'Võta ühendust';
  const contactLead = extract(md, 'clead', /Sektsioon\s*5[\s\S]*?Lause:\s*([^\n]+)/i) || null;
  const phone = extract(md, 'phone', /Telefon:\s*([^\n]+)/i) || null;
  const email = extract(md, 'email', /E-post:\s*([^\n]+)/i) || null;
  const location = extract(md, 'loc', /Asukoht:\s*([^\n]+)/i) || null;

  // Gallery
  const galleryTitle = extract(md, 'gt', /Galerii.*?Lehe\s*pealkiri:\s*([^\n]+)/i) || null;
  const galleryIntro = extract(md, 'gi', /Sissejuhatus:\s*([^\n]+)/i) || null;
  const galleryItems = extractAll(md, /-\s*Vaip nr\.\s*(\d+)\s*—\s*([^\n]+)/g);

  // Update index.html
  let index = read(indexPath);
  if (title) index = index.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  if (metaDesc) index = index.replace(/<meta name=\"description\" content=\"[\s\S]*?\">/, `<meta name="description" content="${metaDesc}">`);
  if (heroH1) index = index.replace(/<h1[^>]*>[\s\S]*?<\/h1>/, (m)=> m.replace(/>[^<]*</, `>${heroH1}<`));
  if (preSec2) index = index.replace(/<h2 class=\"text-center[\s\S]*?>[\s\S]*?<\/h2>\n\s*<div class=\"bg-white p-8/, `<h2 class="text-center text-2xl md:text-3xl font-semibold text-brand-title mb-8">${preSec2}</h2>\n                <div class="bg-white p-8`);
  if (sec2Para) index = index.replace(/(<h2 class=\"sr-only\">Tervitustekst<\/h2>[\s\S]*?<p[^>]*>)[\s\S]*?(<\/p>)/, `$1${sec2Para}$2`);
  if (sec3Heading) index = index.replace(/<section id=\"lugu\"[\s\S]*?<h2[^>]*>[\s\S]*?<\/h2>/, (m)=> m.replace(/>[^<]*</, `>${sec3Heading}<`));
  if (sec3Para) index = index.replace(/(<section id=\"lugu\"[\s\S]*?<div class=\"prose[\s\S]*?<p[^>]*>)[\s\S]*?(<\/p>)/, `$1${sec3Para}$2`);
  if (materialsHeading) index = index.replace(/(<div class=\"text-center max-w-3xl mx-auto\">[\s\S]*?<h2[^>]*>)[\s\S]*?(<\/h2>)/, `$1${materialsHeading}$2`);

  // Materials sub-sections replacements (simple blocks)
  function replaceAfter(h3, parts) {
    const [sub, t1, t2] = parts;
    // Replace sub (first <p> after h3)
    if (sub) {
      const reSub = new RegExp(`(<h3[^>]*>${h3}<\\/h3><p[^>]*>)[\\s\\S]*?(<\\/p>)`);
      index = index.replace(reSub, `$1${sub}$2`);
    }
    if (t1) {
      const reFirst = new RegExp(`(<h3[^>]*>${h3}<\\/h3><p[^>]*>[\\s\\S]*?<\\/p><p[^>]*>)[\\s\\S]*?(<\\/p>)`);
      index = index.replace(reFirst, `$1${t1}$2`);
    }
    if (t2) {
      const reSecond = new RegExp(`(<h3[^>]*>${h3}<\\/h3><p[^>]*>[\\s\\S]*?<\\/p><p[^>]*>[\\s\\S]*?<\\/p><p[^>]*>)[\\s\\S]*?(<\\/p>)`);
      index = index.replace(reSecond, `$1${t2}$2`);
    }
  }
  replaceAfter(puuvillH3, [puuvillSub, puuvillT1, puuvillT2]);
  replaceAfter(kaltsH3, [kaltsSub, kaltsT1, kaltsT2]);
  replaceAfter(villH3, [villSub, villT1, villT2]);

  // Contact
  if (contactH2) index = index.replace(/(<section id=\"kontakt\"[\s\S]*?<h2[^>]*>)[\s\S]*?(<\/h2>)/, `$1${contactH2}$2`);
  if (contactLead) index = index.replace(/(<section id=\"kontakt\"[\s\S]*?<p class=\"max-w-xl text-lg[^>]*>)[\s\S]*?(<\/p>)/, `$1${contactLead}$2`);
  if (phone) index = index.replace(/(<a href=\"tel:[^\"]*\"[^>]*>)[^<]+(<\/a>)/, `$1${phone}$2`)
                         .replace(/href=\"tel:[^\"]*\"/, `href="tel:${phone.replace(/\s+/g,'').replace(/^\+?/, '+')}"`);
  if (email) index = index.replace(/(<a href=\"mailto:[^\"]*\"[^>]*>)[^<]+(<\/a>)/, `$1${email}$2`)
                          .replace(/href=\"mailto:[^\"]*\"/, `href="mailto:${email}"`);
  if (location) index = index.replace(/(<span class=\"text-brand-title\">)[\s\S]*?(<\/span>)/, `$1${location}$2`);

  write(indexPath, index);

  // Update galerii.html
  let gal = read(galleryPath);
  if (galleryTitle) gal = gal.replace(/<h1[^>]*>[\s\S]*?<\/h1>/, (m)=> m.replace(/>[^<]*</, `>${galleryTitle}<`));
  if (galleryIntro) gal = gal.replace(/(<h1[\s\S]*?<\/h1>\n\s*<p[^>]*>)[\s\S]*?(<\/p>)/, `$1${galleryIntro}$2`);

  // Replace each item's short text
  for (const [num, desc] of Object.entries(galleryItems)) {
    const re = new RegExp(`(<h3[^>]*>Vaip nr\. ${num}<\\/h3><p[^>]*>)[\\s\\S]*?(<\\/p>)`);
    gal = gal.replace(re, `$1${desc}$2`);
  }

  write(galleryPath, gal);

  console.log('✅ Content synced from content/site-text.md');
}

main();

