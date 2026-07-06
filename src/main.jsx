import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {
  Search, ShoppingBag, User, Menu, X, Trash2, Plus, LogOut, Settings,
  Package, ClipboardList, Phone, Mail, MapPin, Instagram, Upload, ImageIcon,
  ChevronRight, Minus, Check, FileText, Home as HomeIcon
} from 'lucide-react';
import './styles.css';

const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = 'valery2026';
const CATEGORIES = ['Сумки', 'Аксессуары', 'Бренды', 'Новинки'];
const ORDER_STATUSES = ['Новый', 'В обработке', 'Отправлен', 'Закрыт'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const defaultProducts = [
  {id:'mv-001', title:'Noir Top Handle Bag', category:'Сумки', price:285000, oldPrice:'', badge:'Новинка', image:'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=1200&auto=format&fit=crop', description:'Структурированная сумка из зернистой кожи с лаконичной фурнитурой.'},
  {id:'mv-002', title:'Taupe Soft Tote', category:'Сумки', price:198000, oldPrice:'', badge:'Quiet luxury', image:'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop', description:'Мягкая повседневная сумка без заметных логотипов.'},
  {id:'mv-003', title:'Black Evening Clutch', category:'Аксессуары', price:92000, oldPrice:'', badge:'Вечер', image:'https://images.unsplash.com/photo-1601924921557-45e6dea0a157?q=80&w=1200&auto=format&fit=crop', description:'Минималистичный клатч для вечерних образов.'},
  {id:'mv-004', title:'Cognac Vintage Bag', category:'Бренды', price:156000, oldPrice:184000, badge:'Archive', image:'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200&auto=format&fit=crop', description:'Винтажная сумка в теплом коньячном оттенке.'}
];

const defaultOrders = [
  {id:'ORD-1001', customer:'Анна', phone:'+7 999 111-22-33', email:'anna@mail.ru', total:285000, status:'Новый', items:'Noir Top Handle Bag', createdAt:'2026-03-01'},
  {id:'ORD-1002', customer:'Мария', phone:'+7 999 444-55-66', email:'maria@mail.ru', total:198000, status:'В обработке', items:'Taupe Soft Tote', createdAt:'2026-03-02'}
];

const defaultSettings = {
  brand:'MAISON VALERY',
  subtitle:'PARIS',
  hero:'Quiet luxury.\nTimeless essence.',
  tagline:'Выбор вне времени. Качество, которое говорит само за себя.',
  delivery:'Бесплатная доставка и возврат',
  aboutTitle:'О доме',
  aboutText:'Мы создаём подборку вещей для жизни, где качество важнее логотипов, а элегантность проявляется в деталях. Каждая вещь — это выбор вне времени.',
  email:'hello@maisonvalery.ru',
  phone:'+7 (495) 123-45-67',
  address:'Москва, Столешников переулок, 12',
  instagram:'@maisonvalery',
  telegram:'@maisonvalery',
  workingHours:'Пн–Сб 11:00–20:00',
  deliveryText:'Доставка по Москве — 1–2 дня, по России — 3–7 дней. Бесплатная доставка при заказе от 50 000 ₽. Оплата картой, переводом или при получении (по согласованию).',
  returnsText:'Возврат и обмен в течение 14 дней при сохранении товарного вида и бирок. Для оформления напишите нам на email или в Telegram.',
  faq:[
    {q:'Как оформить заказ?', a:'Добавьте товары в корзину и нажмите «Оформить заказ». Мы свяжемся с вами для подтверждения.'},
    {q:'Есть ли примерка?', a:'Да, в нашем шоуруме в Москве. Запишитесь заранее по телефону или email.'},
    {q:'Как ухаживать за изделиями?', a:'Рекомендуем хранить в пыльном мешочке, избегать влаги и прямых солнечных лучей.'}
  ]
};

function money(v){return new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(Number(v||0))}
function load(key, fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}}
function save(key, value){localStorage.setItem(key, JSON.stringify(value))}
function routeFromHash(){
  const full = location.hash.replace('#','') || '/';
  const path = full.split('?')[0] || '/';
  return {path, full};
}
function mergeSettings(s){return {...defaultSettings, ...s, faq: s?.faq?.length ? s.faq : defaultSettings.faq}}

function adminPass(){return sessionStorage.getItem('mv_admin_pass') || ''}

async function fetchStore(){
  const r = await fetch('/api/store');
  if(!r.ok) throw new Error('store');
  return r.json();
}

async function fetchAdminStore(pass){
  const r = await fetch('/api/admin/store', {headers:{'X-Admin-Password':pass}});
  if(!r.ok) throw new Error('admin');
  return r.json();
}

async function saveAdminStore(pass, data){
  const r = await fetch('/api/admin/store', {
    method:'PUT',
    headers:{'Content-Type':'application/json','X-Admin-Password':pass},
    body:JSON.stringify(data)
  });
  if(!r.ok) throw new Error('save');
  return r.json();
}

async function postOrder(order){
  const r = await fetch('/api/orders', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(order)
  });
  if(!r.ok) throw new Error('order');
  return r.json();
}

function readImageFile(file){
  return new Promise((resolve, reject)=>{
    if(!file?.type?.startsWith('image/')) return reject(new Error('Выберите файл изображения'));
    if(file.size > MAX_IMAGE_SIZE) return reject(new Error('Файл больше 2 МБ. Сожмите изображение или укажите URL.'));
    const reader = new FileReader();
    reader.onload = ()=>resolve(reader.result);
    reader.onerror = ()=>reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}

function Toast({message, type, onClose}){
  useEffect(()=>{const t=setTimeout(onClose, 3200); return ()=>clearTimeout(t)}, [onClose]);
  return <div className={`toast toast-${type}`} role="status">{message}</div>;
}

function App(){
  const [route, setRoute] = useState(()=>routeFromHash().path);
  const [products, setProducts] = useState(defaultProducts);
  const [orders, setOrders] = useState(defaultOrders);
  const [cart, setCart] = useState(()=>load('mv_cart', []));
  const [settings, setSettings] = useState(()=>mergeSettings(null));
  const [auth, setAuth] = useState(()=>localStorage.getItem('mv_auth')==='true');
  const [toast, setToast] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(()=>{
    fetchStore()
      .then(data=>{
        if(data.products?.length) setProducts(data.products);
        if(data.settings) setSettings(mergeSettings(data.settings));
      })
      .catch(()=>{
        setProducts(load('mv_products', defaultProducts));
        setSettings(mergeSettings(load('mv_settings', null)));
      })
      .finally(()=>setReady(true));
  }, []);

  useEffect(()=>{
    if(!auth) return;
    const pass = adminPass();
    if(!pass) return;
    fetchAdminStore(pass)
      .then(data=>{
        if(data.products) setProducts(data.products);
        if(data.orders) setOrders(data.orders);
        if(data.settings) setSettings(mergeSettings(data.settings));
      })
      .catch(()=>notify('Не удалось загрузить данные админки', 'error'));
  }, [auth]);

  useEffect(()=>{
    const onHash = ()=>setRoute(routeFromHash().path);
    window.addEventListener('hashchange', onHash);
    return ()=>window.removeEventListener('hashchange', onHash);
  }, []);

  const notify = (message, type='success')=>setToast({message, type});
  const navigate = (r)=>{location.hash=r; setRoute(r.split('?')[0] || '/'); window.scrollTo(0,0)};

  const persistAdmin = async (patch)=>{
    const pass = adminPass();
    if(!pass) return false;
    const body = {
      products: patch.products ?? products,
      orders: patch.orders ?? orders,
      settings: patch.settings ?? settings
    };
    try{
      const saved = await saveAdminStore(pass, body);
      if(saved.products) setProducts(saved.products);
      if(saved.orders) setOrders(saved.orders);
      if(saved.settings) setSettings(mergeSettings(saved.settings));
      return true;
    }catch{
      notify('Ошибка сохранения на сервере', 'error');
      return false;
    }
  };

  const updateProducts = async (next)=>{
    setProducts(next);
    save('mv_products', next);
    if(auth) await persistAdmin({products: next});
  };
  const updateOrders = async (next)=>{
    setOrders(next);
    save('mv_orders', next);
    if(auth) await persistAdmin({orders: next});
  };
  const updateSettings = async (next)=>{
    const merged = mergeSettings(next);
    setSettings(merged);
    save('mv_settings', merged);
    if(auth) await persistAdmin({settings: merged});
  };
  const updateCart = (next)=>{setCart(next); save('mv_cart', next)};

  const handleLogin = async (password)=>{
    sessionStorage.setItem('mv_admin_pass', password);
    localStorage.setItem('mv_auth', 'true');
    setAuth(true);
    try{
      const data = await fetchAdminStore(password);
      setProducts(data.products || defaultProducts);
      setOrders(data.orders || []);
      setSettings(mergeSettings(data.settings));
    }catch{
      notify('Ошибка входа в админку', 'error');
    }
  };

  const handleLogout = ()=>{
    localStorage.removeItem('mv_auth');
    sessionStorage.removeItem('mv_admin_pass');
    setAuth(false);
  };

  const addToCart = (p)=>{
    const existing = cart.find(x=>x.id===p.id);
    const next = existing
      ? cart.map(x=>x.id===p.id ? {...x, qty:(x.qty||1)+1} : x)
      : [...cart, {...p, qty:1}];
    updateCart(next);
    notify('Товар добавлен в корзину');
  };

  const cartCount = cart.reduce((s,p)=>s+(p.qty||1),0);
  const ctx = {products, orders, cart, settings, auth, navigate, updateProducts, updateOrders, updateCart, updateSettings, setAuth, addToCart, notify, cartCount, handleLogin, handleLogout, persistAdmin};

  if(!ready) return <div className="bootScreen"><b>{defaultSettings.brand}</b><span>Загрузка…</span></div>;

  let page;
  if(route.startsWith('/admin')) page = <Admin {...ctx} route={route}/>;
  else if(route.startsWith('/product/')) page = <StoreLayout {...ctx}><ProductPage {...ctx} id={route.split('/').pop()}/></StoreLayout>;
  else if(route.startsWith('/catalog')) page = <StoreLayout {...ctx}><Catalog {...ctx}/></StoreLayout>;
  else if(route==='/cart') page = <StoreLayout {...ctx}><Cart {...ctx}/></StoreLayout>;
  else if(route==='/about') page = <StoreLayout {...ctx}><AboutPage {...ctx}/></StoreLayout>;
  else if(route==='/contacts') page = <StoreLayout {...ctx}><ContactsPage {...ctx}/></StoreLayout>;
  else if(route==='/delivery') page = <StoreLayout {...ctx}><InfoPage title="Доставка и оплата" text={settings.deliveryText}/></StoreLayout>;
  else if(route==='/returns') page = <StoreLayout {...ctx}><InfoPage title="Возврат и обмен" text={settings.returnsText}/></StoreLayout>;
  else if(route==='/faq') page = <StoreLayout {...ctx}><FaqPage faq={settings.faq}/></StoreLayout>;
  else page = <StoreLayout {...ctx}><Home {...ctx}/></StoreLayout>;

  return <>{page}{toast && <Toast {...toast} onClose={()=>setToast(null)}/>}</>;
}

function StoreLayout({children, ...ctx}){
  return <><Header {...ctx}/>{children}<Footer {...ctx}/></>;
}

function Header({settings, cartCount, navigate, products}){
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const go = (r)=>{setMenuOpen(false); setSearchOpen(false); navigate(r)};
  const onSearch = (e)=>{
    e.preventDefault();
    if(query.trim()) go('/catalog?q='+encodeURIComponent(query.trim()));
  };

  const links = [
    {label:'Новинки', to:'/catalog?cat=Новинки'},
    {label:'Сумки', to:'/catalog?cat=Сумки'},
    {label:'Аксессуары', to:'/catalog?cat=Аксессуары'},
    {label:'О доме', to:'/about'},
    {label:'Контакты', to:'/contacts'}
  ];

  return <>
    <div className="topbar">
      <span>{settings.delivery}</span>
      <span>Россия | RU</span>
    </div>
    <header className="header">
      <div className="headerSide">
        <button className="iconBtn" aria-label="Поиск" onClick={()=>setSearchOpen(v=>!v)}><Search size={19}/></button>
        <button className="iconBtn mobileOnly" aria-label="Меню" onClick={()=>setMenuOpen(true)}><Menu size={22}/></button>
      </div>
      <button onClick={()=>go('/')} className="brand">
        <b>{settings.brand}</b>
        <small>{settings.subtitle}</small>
      </button>
      <nav className="desktopNav">
        {links.map(l=><button key={l.label} onClick={()=>go(l.to)}>{l.label}</button>)}
      </nav>
      <div className="headerSide headerSideRight">
        <button className="iconBtn" aria-label="Админка" onClick={()=>go('/admin')}><User size={19}/></button>
        <button className="iconBtn cartBtn" aria-label="Корзина" onClick={()=>go('/cart')}>
          <ShoppingBag size={19}/>
          {cartCount>0 && <em>{cartCount}</em>}
        </button>
      </div>
    </header>

    {searchOpen && <form className="searchBar" onSubmit={onSearch}>
      <Search size={18}/>
      <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по каталогу…"/>
      <button type="button" className="iconBtn" onClick={()=>setSearchOpen(false)}><X size={18}/></button>
    </form>}

    {menuOpen && <div className="mobileMenu">
      <div className="mobileMenuPanel">
        <div className="mobileMenuHead">
          <b>{settings.brand}</b>
          <button className="iconBtn" onClick={()=>setMenuOpen(false)}><X size={22}/></button>
        </div>
        {links.map(l=><button key={l.label} className="mobileMenuLink" onClick={()=>go(l.to)}>{l.label}<ChevronRight size={16}/></button>)}
        <button className="mobileMenuLink" onClick={()=>go('/cart')}>Корзина {cartCount>0 && `(${cartCount})`}</button>
      </div>
      <button className="mobileMenuBackdrop" aria-label="Закрыть" onClick={()=>setMenuOpen(false)}/>
    </div>}
  </>;
}

function Home({products, settings, navigate, addToCart}){
  const featured = products.slice(0,4);
  return <main>
    <section className="hero">
      <div className="heroText">
        <h1>{settings.hero}</h1>
        <p>{settings.tagline}</p>
        <button onClick={()=>navigate('/catalog')} className="btn dark">Смотреть коллекцию</button>
      </div>
      <img src="/images/valery-editorial.jpeg" alt="Maison Valery editorial"/>
    </section>
    <section className="collection">
      <h2>Коллекция</h2>
      <p className="sectionLead">Избранные модели сезона</p>
      <div className="grid">{featured.map(p=><ProductCard key={p.id} p={p} navigate={navigate} addToCart={addToCart}/>)}</div>
      {products.length>4 && <div className="centerActions"><button className="btn outline" onClick={()=>navigate('/catalog')}>Весь каталог</button></div>}
    </section>
    <section className="about">
      <img src="/images/valery-portrait.jpeg" alt="Portrait"/>
      <div>
        <h2>{settings.aboutTitle}</h2>
        <p>{settings.aboutText}</p>
        <button onClick={()=>navigate('/about')} className="linkbtn">Узнать больше</button>
      </div>
      <img src="/images/valery-dog.jpeg" alt="Lifestyle"/>
    </section>
  </main>;
}

function ProductCard({p, navigate, addToCart}){
  return <article className="card">
    <button className="cardImageBtn" onClick={()=>navigate('/product/'+p.id)}>
      <img src={p.image} alt={p.title} loading="lazy"/>
      {p.badge && <span className="badge">{p.badge}</span>}
    </button>
    <div className="cardBody">
      <small>{p.category}</small>
      <h3>{p.title}</h3>
      <div className="priceRow">
        <p>{money(p.price)}</p>
        {p.oldPrice ? <s>{money(p.oldPrice)}</s> : null}
      </div>
      <button className="textBtn" onClick={()=>addToCart(p)}>В корзину</button>
    </div>
  </article>;
}

function Catalog({products, navigate, addToCart}){
  const params = new URLSearchParams((location.hash.split('?')[1]) || '');
  const [q, setQ] = useState(()=>params.get('q') || '');
  const [cat, setCat] = useState(()=>params.get('cat') || '');

  useEffect(()=>{
    const p = new URLSearchParams((location.hash.split('?')[1]) || '');
    setCat(p.get('cat') || '');
    setQ(p.get('q') || '');
  }, [location.hash]);

  const items = products.filter(p=>{
    const matchQ = !q || (p.title+p.category+p.description).toLowerCase().includes(q.toLowerCase());
    const matchCat = !cat || p.category===cat || (cat==='Новинки' && p.badge==='Новинка');
    return matchQ && matchCat;
  });

  return <main className="page">
    <h1>Каталог</h1>
    <p className="sectionLead">Тихая роскошь в каждой детали</p>
    <div className="catalogTools">
      <input className="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Поиск по товарам"/>
      <div className="chips">
        <button className={!cat?'chip active':'chip'} onClick={()=>setCat('')}>Все</button>
        {CATEGORIES.map(c=><button key={c} className={cat===c?'chip active':'chip'} onClick={()=>setCat(c)}>{c}</button>)}
      </div>
    </div>
    {items.length===0
      ? <div className="emptyState"><p>Ничего не найдено.</p><button className="btn outline" onClick={()=>{setQ('');setCat('')}}>Сбросить фильтры</button></div>
      : <div className="grid">{items.map(p=><ProductCard key={p.id} p={p} navigate={navigate} addToCart={addToCart}/>)}</div>}
  </main>;
}

function ProductPage({products, id, addToCart, navigate}){
  const p = products.find(x=>x.id===id);
  if(!p) return <main className="page emptyState"><p>Товар не найден.</p><button className="btn dark" onClick={()=>navigate('/catalog')}>В каталог</button></main>;
  return <main className="product">
    <div className="productGallery">
      <img src={p.image} alt={p.title}/>
    </div>
    <div className="productInfo">
      <small>{p.category}</small>
      {p.badge && <span className="badge inline">{p.badge}</span>}
      <h1>{p.title}</h1>
      <div className="priceRow large">
        <p className="price">{money(p.price)}</p>
        {p.oldPrice ? <s>{money(p.oldPrice)}</s> : null}
      </div>
      <p className="productDesc">{p.description}</p>
      <button className="btn dark" onClick={()=>addToCart(p)}>Добавить в корзину</button>
      <button className="btn outline" onClick={()=>navigate('/contacts')}>Задать вопрос</button>
    </div>
  </main>;
}

function Cart({cart, updateCart, updateOrders, orders, notify, navigate}){
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({name:'', phone:'', email:'', comment:''});
  const [error, setError] = useState('');

  const total = cart.reduce((s,p)=>s+Number(p.price)*(p.qty||1),0);
  const changeQty = (id, delta)=>{
    updateCart(cart.map(p=>{
      if(p.id!==id) return p;
      const qty = Math.max(1, (p.qty||1)+delta);
      return {...p, qty};
    }).filter(p=>(p.qty||1)>0));
  };

  const submitOrder = async ()=>{
    if(!form.name.trim() || !form.phone.trim()) return setError('Укажите имя и телефон');
    const id = 'ORD-'+Date.now().toString().slice(-6);
    const item = {id, customer:form.name.trim(), phone:form.phone.trim(), email:form.email.trim(), total, status:'Новый', items:cart.map(p=>`${p.title} ×${p.qty||1}`).join(', '), comment:form.comment, createdAt:new Date().toISOString().slice(0,10)};
    try{
      await postOrder(item);
      setOrders(prev=>[item, ...prev]);
    }catch{
      updateOrders([item, ...orders]);
    }
    updateCart([]);
    setCheckout(false);
    notify('Заказ оформлен. Мы свяжемся с вами.');
    navigate('/contacts');
  };

  return <main className="page cartPage">
    <h1>Корзина</h1>
    {cart.length===0 && !checkout
      ? <div className="emptyState"><p>Корзина пуста.</p><button className="btn dark" onClick={()=>navigate('/catalog')}>Перейти в каталог</button></div>
      : <>
        <div className="cartList">
          {cart.map(p=><div className="cartrow" key={p.id}>
            <img src={p.image} alt={p.title}/>
            <div><b>{p.title}</b><small>{p.category}</small></div>
            <div className="qtyControl">
              <button onClick={()=>changeQty(p.id,-1)} aria-label="Меньше"><Minus size={14}/></button>
              <span>{p.qty||1}</span>
              <button onClick={()=>changeQty(p.id,1)} aria-label="Больше"><Plus size={14}/></button>
            </div>
            <span className="cartPrice">{money(Number(p.price)*(p.qty||1))}</span>
            <button className="iconBtn" onClick={()=>updateCart(cart.filter(x=>x.id!==p.id))} aria-label="Удалить"><Trash2 size={18}/></button>
          </div>)}
        </div>
        <div className="cartSummary">
          <h2>Итого: {money(total)}</h2>
          {!checkout
            ? <button className="btn dark" onClick={()=>setCheckout(true)}>Оформить заказ</button>
            : <div className="checkoutPanel panel">
              <h3>Контактные данные</h3>
              <input placeholder="Имя *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
              <input placeholder="Телефон *" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
              <input placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
              <textarea placeholder="Комментарий к заказу" value={form.comment} onChange={e=>setForm({...form,comment:e.target.value})}/>
              {error && <p className="err">{error}</p>}
              <div className="rowActions">
                <button className="btn dark" onClick={submitOrder}><Check size={16}/> Подтвердить заказ</button>
                <button className="btn outline" onClick={()=>setCheckout(false)}>Отмена</button>
              </div>
            </div>}
        </div>
      </>}
  </main>;
}

function AboutPage({settings}){
  return <main className="page contentPage">
    <h1>{settings.aboutTitle}</h1>
    <div className="contentGrid">
      <img src="/images/valery-portrait.jpeg" alt="About"/>
      <div className="prose">
        <p>{settings.aboutText}</p>
        <p>Maison Valery — это философия тихой роскоши: без кричащих логотипов, с акцентом на материалы, крой и долговечность. Мы отбираем сумки и аксессуары, которые остаются актуальными годами.</p>
      </div>
    </div>
  </main>;
}

function ContactsPage({settings}){
  const items = [
    {icon:Phone, label:'Телефон', value:settings.phone, href:'tel:'+settings.phone.replace(/\s/g,'')},
    {icon:Mail, label:'Email', value:settings.email, href:'mailto:'+settings.email},
    {icon:MapPin, label:'Адрес', value:settings.address},
    {icon:Instagram, label:'Instagram', value:settings.instagram},
  ];
  return <main className="page contentPage">
    <h1>Контакты</h1>
    <p className="sectionLead">Мы всегда рады помочь с выбором и оформлением заказа</p>
    <div className="contactsGrid">
      {items.filter(i=>i.value).map(({icon:Icon,label,value,href})=>
        <div className="contactCard" key={label}>
          <Icon size={22}/>
          <small>{label}</small>
          {href ? <a href={href}>{value}</a> : <p>{value}</p>}
        </div>
      )}
      <div className="contactCard">
        <FileText size={22}/>
        <small>Часы работы</small>
        <p>{settings.workingHours}</p>
      </div>
    </div>
    {settings.telegram && <p className="contactNote">Telegram: <strong>{settings.telegram}</strong></p>}
  </main>;
}

function InfoPage({title, text}){
  return <main className="page contentPage">
    <h1>{title}</h1>
    <div className="prose wide"><p>{text}</p></div>
  </main>;
}

function FaqPage({faq}){
  return <main className="page contentPage">
    <h1>FAQ</h1>
    <div className="faqList">
      {faq.map((item,i)=><details key={i} className="faqItem" open={i===0}>
        <summary>{item.q}</summary>
        <p>{item.a}</p>
      </details>)}
    </div>
  </main>;
}

function Footer({settings, navigate}){
  const links = [
    {label:'Доставка и оплата', to:'/delivery'},
    {label:'Возврат', to:'/returns'},
    {label:'FAQ', to:'/faq'},
    {label:'Контакты', to:'/contacts'},
    {label:'О доме', to:'/about'}
  ];
  return <footer>
    <div className="footerLinks">
      {links.map(l=><button key={l.label} onClick={()=>navigate(l.to)}>{l.label}</button>)}
    </div>
    <div className="footerMeta">
      <span>{settings.email}</span>
      <span>{settings.phone}</span>
      <b>© {settings.brand}, 2026</b>
    </div>
  </footer>;
}

function Admin({auth, handleLogout, route, ...ctx}){
  if(!auth) return <Login onLogin={ctx.handleLogin}/>;
  const tab = route.includes('/orders') ? 'orders'
    : route.includes('/settings') ? 'settings'
    : route.includes('/content') ? 'content'
    : 'products';

  return <div className="admin">
    <aside>
      <h2>MAISON<br/>VALERY</h2>
      <p className="adminSub">Панель управления</p>
      <AdminNavBtn active={tab==='products'} onClick={()=>ctx.navigate('/admin/products')} icon={Package} label="Товары"/>
      <AdminNavBtn active={tab==='orders'} onClick={()=>ctx.navigate('/admin/orders')} icon={ClipboardList} label="Заказы"/>
      <AdminNavBtn active={tab==='settings'} onClick={()=>ctx.navigate('/admin/settings')} icon={Settings} label="Настройки"/>
      <AdminNavBtn active={tab==='content'} onClick={()=>ctx.navigate('/admin/content')} icon={FileText} label="Контент"/>
      <div className="adminSpacer"/>
      <AdminNavBtn onClick={()=>ctx.navigate('/')} icon={HomeIcon} label="На сайт"/>
      <AdminNavBtn onClick={handleLogout} icon={LogOut} label="Выйти"/>
    </aside>
    <section className="adminMain">
      {tab==='orders' && <OrdersAdmin {...ctx}/>}
      {tab==='settings' && <SettingsAdmin {...ctx}/>}
      {tab==='content' && <ContentAdmin {...ctx}/>}
      {tab==='products' && <ProductsAdmin {...ctx}/>}
    </section>
  </div>;
}

function AdminNavBtn({active, onClick, icon:Icon, label}){
  return <button className={active?'adminNav active':'adminNav'} onClick={onClick}><Icon size={18}/> {label}</button>;
}

function Login({onLogin}){
  const [l,setL]=useState(''), [p,setP]=useState(''), [e,setE]=useState(''), [busy,setBusy]=useState(false);
  const submit = async ()=>{
    if(l!==ADMIN_LOGIN || p!==ADMIN_PASSWORD) return setE('Неверный логин или пароль');
    setBusy(true); setE('');
    try{ await onLogin(p); }
    catch{ setE('Ошибка входа'); }
    finally{ setBusy(false); }
  };
  return <div className="login">
    <div className="loginCard">
      <h1>Admin</h1>
      <p className="loginSub">Maison Valery</p>
      <input placeholder="Логин" value={l} onChange={x=>setL(x.target.value)} onKeyDown={ev=>ev.key==='Enter'&&submit()}/>
      <input placeholder="Пароль" type="password" value={p} onChange={x=>setP(x.target.value)} onKeyDown={ev=>ev.key==='Enter'&&submit()}/>
      {e && <p className="err">{e}</p>}
      <button className="btn dark full" disabled={busy} onClick={submit}>{busy?'Вход…':'Войти'}</button>
    </div>
  </div>;
}

function ImageUploadField({value, onChange, onError}){
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const handleFile = async (file)=>{
    try{ onChange(await readImageFile(file)); }
    catch(err){ onError?.(err.message); }
  };

  return <div className="imageUpload">
    <label className={drag?'uploadZone drag':'uploadZone'} 
      onDragOver={e=>{e.preventDefault(); setDrag(true)}}
      onDragLeave={()=>setDrag(false)}
      onDrop={e=>{e.preventDefault(); setDrag(false); const f=e.dataTransfer.files?.[0]; if(f) handleFile(f);}}>
      {value
        ? <img src={value} alt="Превью" className="uploadPreview"/>
        : <div className="uploadPlaceholder"><ImageIcon size={28}/><span>Загрузить фото</span><small>JPG, PNG до 2 МБ</small></div>}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={e=>{const f=e.target.files?.[0]; if(f) handleFile(f); e.target.value='';}}/>
    </label>
    <div className="uploadActions">
      <button type="button" className="btn outline small" onClick={()=>inputRef.current?.click()}><Upload size={14}/> Выбрать файл</button>
      {value && <button type="button" className="btn outline small" onClick={()=>onChange('')}>Удалить</button>}
    </div>
    <input className="urlInput" placeholder="или вставьте URL изображения" value={value?.startsWith('data:')?'':(value||'')} onChange={e=>onChange(e.target.value)}/>
  </div>;
}

function ProductsAdmin({products, updateProducts, notify}){
  const blank = {id:'mv-'+Date.now(), title:'', category:'Сумки', price:'', oldPrice:'', badge:'', image:'', description:''};
  const [form, setForm] = useState(blank);
  const [err, setErr] = useState('');
  const editing = products.some(p=>p.id===form.id && form.title);

  const saveP = ()=>{
    if(!form.title.trim()) return setErr('Укажите название');
    if(!form.price) return setErr('Укажите цену');
    if(!form.image) return setErr('Добавьте фото или URL');
    const payload = {...form, price:Number(form.price), oldPrice:form.oldPrice?Number(form.oldPrice):''};
    const exists = products.some(p=>p.id===form.id);
    updateProducts(exists ? products.map(p=>p.id===form.id?payload:p) : [payload, ...products]);
    setForm({...blank, id:'mv-'+Date.now()});
    setErr('');
    notify(editing ? 'Товар обновлён' : 'Товар добавлен');
  };

  const edit = (p)=>{setForm({...p}); setErr(''); window.scrollTo(0,0)};
  const reset = ()=>{setForm({...blank, id:'mv-'+Date.now()}); setErr('')};

  return <>
    <div className="adminHead"><h1>Товары</h1><span>{products.length} позиций</span></div>
    <div className="adminGrid">
      <div className="panel">
        <h3>{editing ? 'Редактирование' : 'Новый товар'}</h3>
        <label className="fieldLabel">Фото товара</label>
        <ImageUploadField value={form.image} onChange={v=>setForm({...form,image:v})} onError={setErr}/>
        <label className="fieldLabel">Название *</label>
        <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        <label className="fieldLabel">Категория</label>
        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
          {CATEGORIES.map(c=><option key={c}>{c}</option>)}
        </select>
        <div className="fieldRow">
          <div><label className="fieldLabel">Цена *</label><input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></div>
          <div><label className="fieldLabel">Старая цена</label><input type="number" value={form.oldPrice} onChange={e=>setForm({...form,oldPrice:e.target.value})}/></div>
        </div>
        <label className="fieldLabel">Бейдж</label>
        <input placeholder="Новинка, Archive…" value={form.badge} onChange={e=>setForm({...form,badge:e.target.value})}/>
        <label className="fieldLabel">Описание</label>
        <textarea rows={4} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        {err && <p className="err">{err}</p>}
        <div className="rowActions">
          <button className="btn dark" onClick={saveP}><Plus size={16}/> {editing?'Сохранить':'Добавить'}</button>
          {editing && <button className="btn outline" onClick={reset}>Отмена</button>}
        </div>
      </div>
      <div className="adminList">
        {products.map(p=><div className="row" key={p.id}>
          <img src={p.image} alt=""/>
          <div><b>{p.title}</b><small>{p.category} · {money(p.price)}</small></div>
          <button className="btn outline small" onClick={()=>edit(p)}>Изменить</button>
          <button className="btn outline small danger" onClick={()=>{if(confirm('Удалить товар?')){updateProducts(products.filter(x=>x.id!==p.id)); notify('Товар удалён')}}}>Удалить</button>
        </div>)}
      </div>
    </div>
  </>;
}

function OrdersAdmin({orders, updateOrders}){
  return <>
    <div className="adminHead"><h1>Заказы</h1><span>{orders.length} заказов</span></div>
    {orders.length===0
      ? <div className="emptyState panel"><p>Заказов пока нет.</p></div>
      : orders.map(o=><div className="order" key={o.id}>
        <div><b>{o.id}</b><small>{o.createdAt}</small></div>
        <div><b>{o.customer}</b><small>{o.phone}</small>{o.email && <small>{o.email}</small>}</div>
        <div><small>Товары</small><p>{o.items}</p></div>
        <div><b>{money(o.total)}</b></div>
        <select value={o.status} onChange={e=>updateOrders(orders.map(x=>x.id===o.id?{...x,status:e.target.value}:x))}>
          {ORDER_STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>)}
  </>;
}

function SettingsAdmin({settings, updateSettings, notify}){
  const [form, setForm] = useState(settings);
  const save = ()=>{updateSettings(form); notify('Настройки сохранены')};
  return <>
    <div className="adminHead"><h1>Настройки</h1></div>
    <div className="panel wide">
      <h3>Бренд и главная</h3>
      <label className="fieldLabel">Название</label>
      <input value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}/>
      <label className="fieldLabel">Подзаголовок</label>
      <input value={form.subtitle} onChange={e=>setForm({...form,subtitle:e.target.value})}/>
      <label className="fieldLabel">Заголовок hero</label>
      <textarea rows={2} value={form.hero} onChange={e=>setForm({...form,hero:e.target.value})}/>
      <label className="fieldLabel">Слоган</label>
      <input value={form.tagline} onChange={e=>setForm({...form,tagline:e.target.value})}/>
      <label className="fieldLabel">Текст в шапке</label>
      <input value={form.delivery} onChange={e=>setForm({...form,delivery:e.target.value})}/>
      <h3>Контакты</h3>
      <div className="fieldRow">
        <div><label className="fieldLabel">Телефон</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
        <div><label className="fieldLabel">Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
      </div>
      <label className="fieldLabel">Адрес</label>
      <input value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/>
      <div className="fieldRow">
        <div><label className="fieldLabel">Instagram</label><input value={form.instagram} onChange={e=>setForm({...form,instagram:e.target.value})}/></div>
        <div><label className="fieldLabel">Telegram</label><input value={form.telegram} onChange={e=>setForm({...form,telegram:e.target.value})}/></div>
      </div>
      <label className="fieldLabel">Часы работы</label>
      <input value={form.workingHours} onChange={e=>setForm({...form,workingHours:e.target.value})}/>
      <button className="btn dark" onClick={save}>Сохранить настройки</button>
    </div>
  </>;
}

function ContentAdmin({settings, updateSettings, notify}){
  const [form, setForm] = useState(settings);
  const updateFaq = (i, key, val)=>{
    const faq = form.faq.map((item,idx)=>idx===i?{...item,[key]:val}:item);
    setForm({...form, faq});
  };
  const addFaq = ()=>setForm({...form, faq:[...form.faq, {q:'', a:''}]});
  const save = ()=>{updateSettings(form); notify('Контент сохранён')};
  return <>
    <div className="adminHead"><h1>Контент страниц</h1></div>
    <div className="panel wide">
      <h3>О доме</h3>
      <input value={form.aboutTitle} onChange={e=>setForm({...form,aboutTitle:e.target.value})}/>
      <textarea rows={4} value={form.aboutText} onChange={e=>setForm({...form,aboutText:e.target.value})}/>
      <h3>Доставка и оплата</h3>
      <textarea rows={3} value={form.deliveryText} onChange={e=>setForm({...form,deliveryText:e.target.value})}/>
      <h3>Возврат</h3>
      <textarea rows={3} value={form.returnsText} onChange={e=>setForm({...form,returnsText:e.target.value})}/>
      <h3>FAQ</h3>
      {form.faq.map((item,i)=><div key={i} className="faqEdit">
        <input placeholder="Вопрос" value={item.q} onChange={e=>updateFaq(i,'q',e.target.value)}/>
        <textarea placeholder="Ответ" rows={2} value={item.a} onChange={e=>updateFaq(i,'a',e.target.value)}/>
        <button className="btn outline small danger" onClick={()=>setForm({...form, faq:form.faq.filter((_,idx)=>idx!==i)})}>Удалить</button>
      </div>)}
      <button className="btn outline small" onClick={addFaq}>+ Вопрос</button>
      <div className="rowActions"><button className="btn dark" onClick={save}>Сохранить контент</button></div>
    </div>
  </>;
}

createRoot(document.getElementById('root')).render(<App/>);
