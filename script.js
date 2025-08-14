// script.js

/*
  IBDB — interactive script (2025-ready)
  Features:
  - i18n for uz/en/ru/ar (dynamic content swap + RTL handling)
  - product catalog (load from products array)
  - filtering, search
  - cart (localStorage)
  - quick & detailed calculator (kg/ton)
  - modals, animations (IntersectionObserver)
  - contact form submit via EmailJS fallback (or replace with your Telegram/Server endpoint)
  - live chat embed loader (Tawk.to by default) — configurable
  - admin helpers to add/update product prices (simple prompt-based flow)
*/

// ------------- Configuration -------------
const CONFIG = {
  currency: 'USD',
  kgPerTon: 1000,
  chatProvider: 'tawk', // 'tawk' | 'crisp' | 'none' | 'websocket'
  tawkScriptSrc: 'https://embed.tawk.to/000000000000000000000000/default', // replace with your Tawk embed src
  emailJs: {
    serviceID: 'default_service', // replace with your EmailJS service id
    templateID: 'template_ibdb', // replace with your EmailJS template id
    userID: 'user_xxx'
  }
};

// ------------- Internationalization (i18n) -------------
const MESSAGES = {
  uz: {
    'nav-overview':'Umumiy ma\'lumot',
    'nav-operations':'Faoliyat',
    'nav-catalog':'Katalog',
    'nav-calculator':'Kalkulyator',
    'nav-tour':'Virtual sayohat',
    'nav-sustainability':'Barqarorlik',
    'overview-title':'Umumiy ma\'lumot',
    'overview-text':'IBDB — quritilgan meva, sabzavot va qo\'ziqorinlarni qayta ishlash va eksport qilish bo\'yicha yetakchi korxona.',
    'hero-title':'Tabiiy ta\'m, xalqaro sifat — IBDB eksportga tayyor',
    'hero-sub':'100% tabiiy, yuqori sifatli quritilgan mahsulotlarimiz bilan jahon bozoriga yetkazib beramiz.',
    'cta-order':'Tezkor buyurtma',
    'cta-more':'Ko\'proq ma\'lumot',
    'catalog-title':'Katalog',
    'catalog-view':'To\'liq ro\'yxat',
    'calculator-title':'Kalkulyator',
    'calc-detailed':'Batafsil',
    'calc-modal-title':'Batafsil kalkulyator',
    'calc-btn-calc':'Hisoblash',
    'calc-send':'Kontaktga yuborish',
    'contact-title':'Biz bilan bog\'lanish',
    'btn-cancel':'Bekor qilish',
    'btn-send':'Jo\'natish',
    'cart-title':'Savatcha',
    'cart-total':'Jami:',
    'btn-continue':'Davom etish',
    'btn-checkout':'Buyurtma berish'
  },
  en: {
    'nav-overview':'Overview',
    'nav-operations':'Operations',
    'nav-catalog':'Catalog',
    'nav-calculator':'Calculator',
    'nav-tour':'Virtual tour',
    'nav-sustainability':'Sustainability',
    'overview-title':'Overview',
    'overview-text':'IBDB — leading processor & exporter of dried fruits, vegetables and mushrooms.',
    'hero-title':'Natural taste, international quality — IBDB ready for export',
    'hero-sub':'We supply 100% natural, high-quality dried products to global markets.',
    'cta-order':'Quick order',
    'cta-more':'Learn more',
    'catalog-title':'Catalog',
    'catalog-view':'Full list',
    'calculator-title':'Calculator',
    'calc-detailed':'Detailed',
    'calc-modal-title':'Detailed calculator',
    'calc-btn-calc':'Compute',
    'calc-send':'Send to contact',
    'contact-title':'Contact us',
    'btn-cancel':'Cancel',
    'btn-send':'Send',
    'cart-title':'Cart',
    'cart-total':'Total:',
    'btn-continue':'Continue',
    'btn-checkout':'Checkout'
  },
  ru: {
    'nav-overview':'Общая информация',
    'nav-operations':'Деятельность',
    'nav-catalog':'Каталог',
    'nav-calculator':'Калькулятор',
    'nav-tour':'Виртуальная экскурсия',
    'nav-sustainability':'Устойчивость',
    'overview-title':'Общая информация',
    'overview-text':'IBDB — ведущий производитель и экспортер сушеных фруктов, овощей и грибов.',
    'hero-title':'Натуральный вкус, международное качество — IBDB готов к экспорту',
    'hero-sub':'Мы поставляем 100% натуральную продукцию высокого качества на мировые рынки.',
    'cta-order':'Быстрый заказ',
    'cta-more':'Подробнее',
    'catalog-title':'Каталог',
    'catalog-view':'Полный список',
    'calculator-title':'Калькулятор',
    'calc-detailed':'Подробно',
    'calc-modal-title':'Подробный калькулятор',
    'calc-btn-calc':'Рассчитать',
    'calc-send':'Отправить в контакт',
    'contact-title':'Свяжитесь с нами',
    'btn-cancel':'Отмена',
    'btn-send':'Отправить',
    'cart-title':'Корзина',
    'cart-total':'Итого:',
    'btn-continue':'Продолжить',
    'btn-checkout':'Оформить'
  },
  ar: {
    'nav-overview':'نظرة عامة',
    'nav-operations':'العمليات',
    'nav-catalog':'الفهرس',
    'nav-calculator':'حاسبة',
    'nav-tour':'جولة افتراضية',
    'nav-sustainability':'الاستدامة',
    'overview-title':'نظرة عامة',
    'overview-text':'IBDB — شركة رائدة في معالجة وتصدير الفواكه المجففة والخضروات والفطر.',
    'hero-title':'طعم طبيعي، جودة عالمية — IBDB جاهز للتصدير',
    'hero-sub':'نورد منتجات مجففة عالية الجودة وطبيعية 100% إلى الأسواق العالمية.',
    'cta-order':'طلب سريع',
    'cta-more':'المزيد',
    'catalog-title':'الفهرس',
    'catalog-view':'القائمة الكاملة',
    'calculator-title':'حاسبة',
    'calc-detailed':'تفصيلي',
    'calc-modal-title':'حاسبة تفصيلية',
    'calc-btn-calc':'احسب',
    'calc-send':'أرسل إلى الاتصال',
    'contact-title':'اتصل بنا',
    'btn-cancel':'إلغاء',
    'btn-send':'أرسل',
    'cart-title':'عربة التسوق',
    'cart-total':'الإجمالي:',
    'btn-continue':'استمر',
    'btn-checkout':'اطلب'
  }
};

let currentLang = localStorage.getItem('ibdb-lang') || 'uz';

function translatePage(lang) {
  const root = document.documentElement;
  currentLang = lang;
  localStorage.setItem('ibdb-lang', lang);
  // RTL for Arabic
  if (lang === 'ar') {
    root.setAttribute('dir', 'rtl');
    document.querySelector('html').setAttribute('lang', 'ar');
  } else {
    root.setAttribute('dir', 'ltr');
    document.querySelector('html').setAttribute('lang', lang);
  }

  // replace data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = (MESSAGES[lang] && MESSAGES[lang][key]) || MESSAGES['en'][key] || el.textContent;
    el.textContent = text;
  });
}

// init language selector
const langSelect = document.getElementById('lang-select');
if (langSelect) {
  langSelect.value = currentLang;
  langSelect.addEventListener('change', (e) => translatePage(e.target.value));
}
translatePage(currentLang);

// ------------- Products data (editable) -------------
// Each product: id, title (object per lang), category, pricePerKg (USD), stockStatus, thumb
let PRODUCTS = [
  // Mevalar
  {
    id: 'p-apricot',
    title: { uz: "Quritilgan o'rik", en: 'Dried apricot', ru: 'Курага', ar: 'مشمش مجفف' },
    category: 'Meva',
    pricePerKg: 3.5,
    stock: 1200,
    thumb: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=facearea&w=200&q=80' // o‘rik
  },
  {
    id: 'p-apple',
    title: { uz: 'Quritilgan olma', en: 'Dried apple', ru: 'Сушеное яблоко', ar: 'تفاح مجفف' },
    category: 'Meva',
    pricePerKg: 2.2,
    stock: 800,
    thumb: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=200&q=80' // olma
  },
  {
    id: 'p-pear',
    title: { uz: 'Quritilgan nok', en: 'Dried pear', ru: 'Сушеная груша', ar: 'كمثرى مجففة' },
    category: 'Meva',
    pricePerKg: 3.8,
    stock: 600,
    thumb: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=facearea&w=200&q=80' // nok
  },
  {
    id: 'p-grape',
    title: { uz: 'Quritilgan uzum', en: 'Raisin', ru: 'Изюм', ar: 'زبيب' },
    category: 'Meva',
    pricePerKg: 2.7,
    stock: 1500,
    thumb: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=200&q=80' // uzum
  },
  {
    id: 'p-plum',
    title: { uz: 'Quritilgan olxo‘ri', en: 'Dried plum', ru: 'Чернослив', ar: 'برقوق مجفف' },
    category: 'Meva',
    pricePerKg: 4.0,
    stock: 700,
    thumb: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=facearea&w=200&q=80' // olxo‘ri
  },
  {
    id: 'p-melon',
    title: { uz: 'Quritilgan qovun', en: 'Dried melon', ru: 'Сушеная дыня', ar: 'شمام مجفف' },
    category: 'Meva',
    pricePerKg: 5.0,
    stock: 400,
    thumb: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=facearea&w=200&q=80' // qovun (o‘rik rasmi qayta ishlatilgan)
  },
  {
    id: 'p-watermelon',
    title: { uz: 'Quritilgan tarvuz', en: 'Dried watermelon', ru: 'Сушеный арбуз', ar: 'بطيخ مجفف' },
    category: 'Meva',
    pricePerKg: 5.5,
    stock: 300,
    thumb: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=200&q=80' // tarvuz
  },
  {
    id: 'p-cherry',
    title: { uz: 'Quritilgan gilos', en: 'Dried cherry', ru: 'Сушеная вишня', ar: 'كرز مجفف' },
    category: 'Meva',
    pricePerKg: 6.0,
    stock: 250,
    thumb: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3c8b?auto=format&fit=facearea&w=200&q=80' // gilos
  },
  {
    id: 'p-mulberry',
    title: { uz: 'Quritilgan tut', en: 'Dried mulberry', ru: 'Сушеная шелковица', ar: 'توت مجفف' },
    category: 'Meva',
    pricePerKg: 3.0,
    stock: 900,
    thumb: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=facearea&w=200&q=80' // tut (o‘rik rasmi qayta ishlatilgan)
  },
  {
    id: 'p-peach',
    title: { uz: 'Quritilgan shaftoli', en: 'Dried peach', ru: 'Сушеный персик', ar: 'خوخ مجفف' },
    category: 'Meva',
    pricePerKg: 4.5,
    stock: 350,
    thumb: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=facearea&w=200&q=80' // shaftoli (o‘rik rasmi qayta ishlatilgan)
  },
  {
    id: 'p-quince',
    title: { uz: 'Quritilgan behi', en: 'Dried quince', ru: 'Сушеная айва', ar: 'سفرجل مجفف' },
    category: 'Meva',
    pricePerKg: 3.2,
    stock: 200,
    thumb: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=facearea&w=200&q=80' // behi (o‘rik rasmi qayta ishlatilgan)
  },
  {
    id: 'p-fig',
    title: { uz: 'Quritilgan anjir', en: 'Dried fig', ru: 'Сушеный инжир', ar: 'تين مجفف' },
    category: 'Meva',
    pricePerKg: 7.0,
    stock: 180,
    thumb: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=facearea&w=200&q=80' // anjir (o‘rik rasmi qayta ishlatilgan)
  },
  {
    id: 'p-pomegranate',
    title: { uz: 'Quritilgan anor', en: 'Dried pomegranate', ru: 'Сушеный гранат', ar: 'رمان مجفف' },
    category: 'Meva',
    pricePerKg: 6.5,
    stock: 120,
    thumb: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=200&q=80' // anor (uzum rasmi qayta ishlatilgan)
  },
  {
    id: 'p-persimmon',
    title: { uz: 'Quritilgan xurmo', en: 'Dried persimmon', ru: 'Сушеная хурма', ar: 'كاكي مجفف' },
    category: 'Meva',
    pricePerKg: 5.8,
    stock: 160,
    thumb: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=facearea&w=200&q=80' // xurmo (o‘rik rasmi qayta ishlatilgan)
  },

  // Sabzavotlar
  {
    id: 'p-carrot',
    title: { uz: 'Quritilgan sabzi', en: 'Dried carrot', ru: 'Морковь', ar: 'جزر مجفف' },
    category: 'Sabzavot',
    pricePerKg: 1.8,
    stock: 1000,
    thumb: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=facearea&w=200&q=80' // sabzi (nok rasmi qayta ishlatilgan)
  },
  {
    id: 'p-onion',
    title: { uz: 'Quritilgan piyoz', en: 'Dried onion', ru: 'Сушеный лук', ar: 'بصل مجفف' },
    category: 'Sabzavot',
    pricePerKg: 2.0,
    stock: 900,
    thumb: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=200&q=80' // piyoz (uzum rasmi qayta ishlatilgan)
  },
  {
    id: 'p-garlic',
    title: { uz: 'Quritilgan sarimsoq', en: 'Dried garlic', ru: 'Сушеный чеснок', ar: 'ثوم مجفف' },
    category: 'Sabzavot',
    pricePerKg: 3.5,
    stock: 500,
    thumb: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=facearea&w=200&q=80' // sarimsoq (nok rasmi qayta ishlatilgan)
  },
  {
    id: 'p-pepper',
    title: { uz: 'Quritilgan bulg‘or qalampiri', en: 'Dried bell pepper', ru: 'Сушеный перец', ar: 'فلفل مجفف' },
    category: 'Sabzavot',
    pricePerKg: 4.2,
    stock: 400,
    thumb: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=200&q=80' // qalampir (tarvuz rasmi qayta ishlatilgan)
  },
  {
    id: 'p-tomato',
    title: { uz: 'Quritilgan pomidor', en: 'Dried tomato', ru: 'Сушеный помидор', ar: 'طماطم مجففة' },
    category: 'Sabzavot',
    pricePerKg: 3.8,
    stock: 700,
    thumb: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=200&q=80' // pomidor (tarvuz rasmi qayta ishlatilgan)
  },
  {
    id: 'p-eggplant',
    title: { uz: 'Quritilgan baqlajon', en: 'Dried eggplant', ru: 'Сушеный баклажан', ar: 'باذنجان مجفف' },
    category: 'Sabzavot',
    pricePerKg: 3.0,
    stock: 350,
    thumb: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=200&q=80' // baqlajon (tarvuz rasmi qayta ishlatilgan)
  },
  {
    id: 'p-cabbage',
    title: { uz: 'Quritilgan karam', en: 'Dried cabbage', ru: 'Сушеная капуста', ar: 'ملفوف مجفف' },
    category: 'Sabzavot',
    pricePerKg: 2.5,
    stock: 600,
    thumb: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=200&q=80' // karam (uzum rasmi qayta ishlatilgan)
  },
  {
    id: 'p-beet',
    title: { uz: 'Quritilgan lavlagi', en: 'Dried beet', ru: 'Сушеная свекла', ar: 'شمندر مجفف' },
    category: 'Sabzavot',
    pricePerKg: 2.2,
    stock: 300,
    thumb: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=200&q=80' // lavlagi (uzum rasmi qayta ishlatilgan)
  },
  {
    id: 'p-potato',
    title: { uz: 'Quritilgan kartoshka', en: 'Dried potato', ru: 'Сушеный картофель', ar: 'بطاطس مجففة' },
    category: 'Sabzavot',
    pricePerKg: 2.0,
    stock: 500,
    thumb: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=200&q=80' // kartoshka (uzum rasmi qayta ishlatilgan)
  },
  {
    id: 'p-zucchini',
    title: { uz: 'Quritilgan qovoq', en: 'Dried zucchini', ru: 'Сушеный кабачок', ar: 'كوسة مجففة' },
    category: 'Sabzavot',
    pricePerKg: 2.8,
    stock: 200,
    thumb: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=200&q=80' // qovoq (uzum rasmi qayta ishlatilgan)
  },

  // Qo'ziqorin
  {
    id: 'p-mushroom',
    title: { uz: "Qo'ziqorin (quritilgan)", en: 'Dried mushroom', ru: 'Грибы', ar: 'فطر مجفف' },
    category: "Qo'ziqorin",
    pricePerKg: 6.0,
    stock: 200,
    thumb: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=200&q=80' // qo'ziqorin (uzum rasmi qayta ishlatilgan)
  }
];

// ------------- Utilities -------------
function formatCurrency(value){
  return value.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) + ' ' + CONFIG.currency;
}

function byId(id){ return document.getElementById(id); }

// ------------- Catalog rendering -------------
// renderProducts funksiyasida buyurtma tugmasi o'rniga input va tekshiruv
function renderProducts(list = PRODUCTS){
  const container = document.getElementById('product-list');
  container.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';

    // ...rasm va info...
    const thumb = document.createElement('div');
    thumb.className = 'product-thumb';
    thumb.innerHTML = `<img src="${p.thumb}" alt="" style="width:100%;height:100%;object-fit:cover;">`;

    const info = document.createElement('div');
    info.className = 'product-info';

    const title = document.createElement('h4');
    title.textContent = (p.title && p.title[currentLang]) || p.title.en || p.id;

    const meta = document.createElement('div');
    meta.className = 'product-meta';
    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = formatCurrency(p.pricePerKg) + ' / kg';
    const status = document.createElement('div');
    status.className = 'status ' + (p.stock>0 ? (p.stock<300 ? 'stock' : 'available') : 'out');
    status.textContent = p.stock>0 ? (p.stock<300 ? 'Cheklangan' : 'Mavjud') : 'Tugagan';

    meta.appendChild(price);
    meta.appendChild(status);

    // --- Buyurtma berish input va tugmasi ---
    const actions = document.createElement('div');
    actions.className = 'actions';

    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.min = 5000;
    qtyInput.value = 5000;
    qtyInput.style = 'width:90px;padding:0.3rem 0.5rem;border-radius:8px;border:1px solid #e6efe6;margin-right:0.5rem;';
    qtyInput.placeholder = 'kg';

    const quick = document.createElement('button');
    quick.className = 'btn-sm';
    quick.textContent = (currentLang === 'uz' ? 'Buyurtma berish' : (currentLang === 'ru' ? 'Заказать' : (currentLang === 'ar' ? 'اطلب' : 'Order')));

    quick.addEventListener('click', ()=>{
      const qty = Number(qtyInput.value);
      if (qty < 5000) {
        alert("Minimal buyurtma miqdori 5 000 kg!");
        qtyInput.value = 5000;
        qtyInput.focus();
        return;
      }
      addToCart(p.id, qty);
      openCartModal();
    });

    actions.appendChild(qtyInput);
    actions.appendChild(quick);

    info.appendChild(title);
    info.appendChild(meta);
    info.appendChild(actions);

    card.appendChild(thumb);
    card.appendChild(info);
    container.appendChild(card);
  });

  // animate elements
  observeAnimated();
}

// init product select in calculator
function populateProductSelect(){
  const select = byId('product-select');
  const calcSelect = byId('calc-product');
  if (!select || !calcSelect) return;
  select.innerHTML = '';
  calcSelect.innerHTML = '';
  PRODUCTS.forEach(p=>{
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = (p.title && p.title[currentLang]) || p.id;
    select.appendChild(opt);

    const o2 = opt.cloneNode(true);
    calcSelect.appendChild(o2);
  });
}

// ------------- Filters & search -------------
function applyFilter(cat){
  document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
  const active = Array.from(document.querySelectorAll('.chip')).find(c=>c.dataset.filter===cat || (cat==='all' && c.dataset.filter==='all'));
  if (active) active.classList.add('active');
  const q = byId('search').value.toLowerCase();
  const filtered = PRODUCTS.filter(p=>{
    const inCat = (cat==='all') || (p.category===cat);
    const inQ = p.title[currentLang].toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    return inCat && inQ;
  });
  renderProducts(filtered);
}

if (byId('search')){
  byId('search').addEventListener('input', ()=> applyFilter(document.querySelector('.chip.active').dataset.filter || 'all'));
}

// Filter tugmalariga event qo'shish
document.querySelectorAll('.chip[data-filter]').forEach(btn => {
  btn.addEventListener('click', function() {
    applyFilter(this.dataset.filter);
  });
});

// ------------- Modals -------------
function openModal(id){ const m = byId(id); if (m){ m.classList.add('show'); m.setAttribute('aria-hidden','false'); }}
function closeModal(id){ const m = byId(id); if (m){ m.classList.remove('show'); m.setAttribute('aria-hidden','true'); }}

function openCatalogModal(){ const content = byId('catalog-modal-content'); content.innerHTML = PRODUCTS.map(p=>`<div style="padding:.6rem;border-bottom:1px solid #f1f7ef"><strong>${(p.title && p.title[currentLang])||p.id}</strong> — ${p.category} — ${formatCurrency(p.pricePerKg)} / kg</div>`).join(''); openModal('modal-catalog'); }
function closeCatalogModal(){ closeModal('modal-catalog'); }

// Contact
function openContactModal(){ openModal('modal-contact'); }
function closeContactModal(){ closeModal('modal-contact'); }

// Cart
function openCartModal(){ renderCart(); openModal('modal-cart'); }
function closeCartModal(){ closeModal('modal-cart'); }

// Calculator
function openCalculatorModal(productId){ if(productId){ byId('calc-product').value = productId; }
  openModal('modal-calc'); updateCalcUI(); }
function closeCalculatorModal(){ closeModal('modal-calc'); }

// ------------- Cart (localStorage) -------------
let CART = JSON.parse(localStorage.getItem('ibdb-cart') || '{}');

function saveCart(){ localStorage.setItem('ibdb-cart', JSON.stringify(CART)); updateCartCount(); }

function addToCart(productId, qty){ qty = Number(qty) || 1; CART[productId] = (CART[productId] || 0) + qty; saveCart(); }

function removeFromCart(productId){ delete CART[productId]; saveCart(); renderCart(); }

function renderCart(){ const itemsEl = byId('cart-items'); itemsEl.innerHTML = ''; let total = 0;
  Object.keys(CART).forEach(id=>{
    const p = PRODUCTS.find(x=>x.id===id);
    if(!p) return;
    const qty = CART[id];
    const subtotal = qty * p.pricePerKg;
    total += subtotal;
    const div = document.createElement('div'); div.className='cart-item';
    div.innerHTML = `<div><strong>${p.title[currentLang]}</strong><div class='muted' style='font-size:.85rem'>${qty} kg</div></div><div style='text-align:right'><div>${formatCurrency(subtotal)}</div><div style='margin-top:.4rem'><button class='btn-ghost' onclick="removeFromCart('${id}')">X</button></div></div>`;
    itemsEl.appendChild(div);
  });
  byId('cart-total').textContent = formatCurrency(total);
}

function updateCartCount(){ const c = Object.values(CART).reduce((s,v)=>s+v,0); byId('cart-count').textContent = c; }
updateCartCount();

// checkout (placeholder)
function checkout(){ // Here you'd connect to order backend / create invoice / payment
  if(Object.keys(CART).length===0){ alert('Savatcha bo\'sh'); return; }
  // simple success
  alert('Buyurtma qabul qilindi — demo. Backend bilan bog\'lang.');
  CART = {}; saveCart(); renderCart(); closeCartModal();
}

// ------------- Calculator logic -------------
function updatePrice(){ const productId = byId('product-select').value; const qty = Number(byId('quantity').value) || 0; const unit = byId('unit').value;
  const p = PRODUCTS.find(x=>x.id===productId);
  if(!p){ byId('total-price').textContent = '—'; return; }
  const factor = (unit==='ton') ? CONFIG.kgPerTon : 1;
  const kg = qty * factor;
  const total = kg * p.pricePerKg;
  byId('total-price').textContent = formatCurrency(total);
}

function updateCalcUI(){ const prod = byId('calc-product').value; const qEl = byId('calc-quantity'); const unitEl = byId('calc-unit'); const out = byId('calc-output');
  const p = PRODUCTS.find(x=>x.id===prod);
  if(!p) { out.textContent='Natija: —'; return; }
  const qty = Number(qEl.value) || 0; const factor = unitEl.value==='ton'? CONFIG.kgPerTon:1; const total = qty*factor*p.pricePerKg;
  out.textContent = `Natija: ${formatCurrency(total)} (${qty} ${unitEl.value})`;
}

function calcCompute(){ updateCalcUI(); }

function prefillContactFromCalc(){ const prod = byId('calc-product').value; const q = byId('calc-quantity').value; const u = byId('calc-unit').value; const p = PRODUCTS.find(x=>x.id===prod);
  byId('contact-order').value = `${p.title[currentLang]} — ${q} ${u} — Narx: ${formatCurrency(p.pricePerKg)} / kg`;
  closeCalculatorModal(); openContactModal();
}

// ------------- Contact form submission -------------
const contactForm = byId('contact-form');
if(contactForm){
  contactForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const status = byId('contact-status');
    status.textContent = 'Yuborilmoqda...';
    const data = {
      name: byId('contact-name').value,
      family: byId('contact-family').value,
      phone: byId('contact-phone').value,
      email: byId('contact-email').value,
      order: byId('contact-order').value
    };
    try{
      // Attempt EmailJS if configured
      if(window.emailjs){
        await emailjs.send(CONFIG.emailJs.serviceID, CONFIG.emailJs.templateID, data, CONFIG.emailJs.userID);
        status.textContent = 'Jo\'natildi — tez orada aloqaga chiqamiz.';
        contactForm.reset();
      } else {
        // Fallback: POST to /api/contact (you should implement server endpoint)
        await fetch('/api/contact', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
        status.textContent = 'Jo\'natildi — demo endpoint.';
        contactForm.reset();
      }
    }catch(err){
      console.error(err);
      status.textContent = 'Xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.';
    }
  });
}

// ------------- Small admin helper to edit prices (prompt-based) -------------
function adminEditPrices(){
  // quick auth (prompt) — replace with real admin UI
  const key = prompt('Admin kalitni kiriting:');
  if(!key || key!=='admin2025') return alert('Noto\'g\'ri kalit');
  PRODUCTS.forEach(p=>{
    const val = prompt(`Narx (USD/kg) — ${p.id} — hozirgi: ${p.pricePerKg}`, p.pricePerKg);
    const num = parseFloat(val);
    if(!isNaN(num)) p.pricePerKg = num;
  });
  populateProductSelect(); renderProducts(); saveProductsLocal();
}

// persist products so admin changes survive refresh (only local)
function saveProductsLocal(){ localStorage.setItem('ibdb-products', JSON.stringify(PRODUCTS)); }
function loadProductsLocal(){ const raw = localStorage.getItem('ibdb-products'); if(raw){ try{ PRODUCTS = JSON.parse(raw); }catch(e){ console.warn('Invalid local product data'); } } }
loadProductsLocal();

// ------------- Animations (IntersectionObserver) -------------
let observer;
function observeAnimated(){ const els = document.querySelectorAll('.animate-on-scroll'); if(!('IntersectionObserver' in window)) return; if(observer) observer.disconnect();
  observer = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting){ ent.target.style.transition='opacity .5s ease, transform .6s cubic-bezier(.2,.9,.25,1)'; ent.target.style.opacity=1; ent.target.style.transform='translateY(0)'; observer.unobserve(ent.target); }
    });
  }, { threshold: .12 });
  els.forEach(el=>{ el.style.opacity=0; el.style.transform='translateY(12px)'; observer.observe(el); });
}

// init
populateProductSelect(); renderProducts(); applyFilter('all'); updatePrice();

// ------------- Page-level small interactions -------------
// sticky header shadow handled in CSS; add back-to-top
(function addBackToTop(){ const btn = document.createElement('button'); btn.className='fab'; btn.title='Back to top'; btn.style.right='18px'; btn.style.bottom='84px'; btn.textContent='⬆'; btn.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'})); document.body.appendChild(btn); })();

// floating cart open
const openCartBtn = byId('open-cart'); if(openCartBtn) openCartBtn.addEventListener('click', openCartModal);

// close modals on backdrop click
document.querySelectorAll('.modal-backdrop').forEach(b=>{ b.addEventListener('click',(e)=>{ if(e.target===b){ b.classList.remove('show'); } }); });

// ------------- Live chat loader -------------
function loadLiveChat(){ if(CONFIG.chatProvider==='tawk'){
  const s = document.createElement('script'); s.async = true; s.src = CONFIG.tawkScriptSrc; s.charset='UTF-8'; s.setAttribute('crossorigin','*'); document.head.appendChild(s);
} else if(CONFIG.chatProvider==='crisp'){
  window.$crisp=[]; window.CRISP_WEBSITE_ID="YOUR_CRISP_ID"; const d=document; const s=d.createElement('script'); s.src='https://client.crisp.chat/l.js'; s.async=1; d.head.appendChild(s);
} else if(CONFIG.chatProvider==='websocket'){
  // placeholder: open WS to your server
  const ws = new WebSocket('wss://yourserver.example/ws');
  ws.addEventListener('open', ()=> console.log('WS connected'));
  ws.addEventListener('message',(m)=> console.log('WS message',m.data));
}
}
loadLiveChat();

// ------------- Export / utilities for HTML inline handlers -------------
window.applyFilter = applyFilter;
window.openCatalogModal = openCatalogModal;
window.closeCatalogModal = closeCatalogModal;
window.openCalculatorModal = openCalculatorModal;
window.closeCalculatorModal = closeCalculatorModal;
window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;
window.updatePrice = updatePrice;
window.calcCompute = calcCompute;
window.prefillContactFromCalc = prefillContactFromCalc;
window.addToCart = addToCart;
window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;
window.checkout = checkout;
window.adminEditPrices = adminEditPrices;

// expose for debugging
window.IBDB = { PRODUCTS, CONFIG };

// ------------- Final notes -------------
// To integrate real-time chat with your server: implement a WebSocket server and set CONFIG.chatProvider='websocket' and update the URL.
// To send contacts to Telegram: create a server endpoint that accepts contact POSTs and forwards them to Telegram Bot API (do not embed secrets in client JS).
// For production, move product data and pricing to a secured server-side API and remove prompt-based admin.

