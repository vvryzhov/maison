import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Search, ShoppingBag, User, Menu, Trash2, Plus, LogOut, Settings, Package, ClipboardList} from 'lucide-react';
import './styles.css';

const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = 'valery2026';

const defaultProducts = [
  {id:'mv-001', title:'Noir Top Handle Bag', category:'Сумки', price:285000, oldPrice:'', badge:'Новинка', image:'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=1200&auto=format&fit=crop', description:'Структурированная сумка из зернистой кожи с лаконичной фурнитурой.'},
  {id:'mv-002', title:'Taupe Soft Tote', category:'Сумки', price:198000, oldPrice:'', badge:'Quiet luxury', image:'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop', description:'Мягкая повседневная сумка без заметных логотипов.'},
  {id:'mv-003', title:'Black Evening Clutch', category:'Аксессуары', price:92000, oldPrice:'', badge:'Вечер', image:'https://images.unsplash.com/photo-1601924921557-45e6dea0a157?q=80&w=1200&auto=format&fit=crop', description:'Минималистичный клатч для вечерних образов.'},
  {id:'mv-004', title:'Cognac Vintage Bag', category:'Бренды', price:156000, oldPrice:184000, badge:'Archive', image:'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200&auto=format&fit=crop', description:'Винтажная сумка в теплом коньячном оттенке.'}
];

const defaultOrders = [
  {id:'ORD-1001', customer:'Анна', phone:'+7 999 111-22-33', total:285000, status:'Новый'},
  {id:'ORD-1002', customer:'Мария', phone:'+7 999 444-55-66', total:198000, status:'В обработке'}
];

function money(v){return new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(Number(v||0))}
function load(key, fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}}
function save(key, value){localStorage.setItem(key, JSON.stringify(value))}

function App(){
  const [route,setRoute]=useState(location.hash.replace('#','')||'/');
  const [products,setProducts]=useState(()=>load('mv_products', defaultProducts));
  const [orders,setOrders]=useState(()=>load('mv_orders', defaultOrders));
  const [cart,setCart]=useState(()=>load('mv_cart', []));
  const [settings,setSettings]=useState(()=>load('mv_settings', {brand:'MAISON VALERY', subtitle:'PARIS', hero:'Quiet luxury. Timeless essence.', delivery:'Бесплатная доставка и возврат'}));
  const [auth,setAuth]=useState(()=>localStorage.getItem('mv_auth')==='true');
  const navigate=(r)=>{location.hash=r;setRoute(r);scrollTo(0,0)};
  const updateProducts=(next)=>{setProducts(next);save('mv_products',next)};
  const updateOrders=(next)=>{setOrders(next);save('mv_orders',next)};
  const updateCart=(next)=>{setCart(next);save('mv_cart',next)};
  const updateSettings=(next)=>{setSettings(next);save('mv_settings',next)};
  const addToCart=(p)=>updateCart([...cart,{...p,qty:1}]);
  const ctx={products,orders,cart,settings,auth,navigate,updateProducts,updateOrders,updateCart,updateSettings,setAuth,addToCart};
  if(route.startsWith('/admin')) return <Admin {...ctx}/>;
  if(route.startsWith('/product/')) return <ProductPage {...ctx} id={route.split('/').pop()}/>;
  if(route==='/catalog') return <><Header {...ctx}/><Catalog {...ctx}/><Footer settings={settings}/></>;
  if(route==='/cart') return <><Header {...ctx}/><Cart {...ctx}/><Footer settings={settings}/></>;
  return <><Header {...ctx}/><Home {...ctx}/><Footer settings={settings}/></>;
}

function Header({settings,cart,navigate}){return <>
  <div className="topbar">{settings.delivery}<span>Россия | RU</span></div>
  <header className="header">
    <button className="icon"><Search size={19}/></button>
    <button className="mobile"><Menu/></button>
    <button onClick={()=>navigate('/')} className="brand"><b>{settings.brand}</b><small>{settings.subtitle}</small></button>
    <nav><button onClick={()=>navigate('/catalog')}>Новинки</button><button onClick={()=>navigate('/catalog')}>Сумки</button><button onClick={()=>navigate('/catalog')}>Аксессуары</button><button>О доме</button></nav>
    <div className="icons"><button className="icon"><User size={19}/></button><button onClick={()=>navigate('/cart')} className="icon"><ShoppingBag size={19}/><em>{cart.length}</em></button></div>
  </header>
</>}

function Home({products,settings,navigate,addToCart}){return <main>
  <section className="hero">
    <div className="heroText"><h1>{settings.hero}</h1><p>Выбор вне времени. Качество, которое говорит само за себя.</p><button onClick={()=>navigate('/catalog')} className="dark">Смотреть коллекцию</button></div>
    <img src="/images/valery-editorial.jpeg" />
  </section>
  <section className="collection"><h2>Коллекция</h2><div className="grid">{products.map(p=><ProductCard key={p.id} p={p} navigate={navigate} addToCart={addToCart}/>)}</div></section>
  <section className="about"><img src="/images/valery-portrait.jpeg"/><div><h2>{settings.brand}</h2><p>Мы создаем подборку вещей для жизни, где качество важнее логотипов, а элегантность проявляется в деталях. Каждая вещь - это выбор вне времени.</p><button onClick={()=>navigate('/catalog')} className="linkbtn">Узнать больше</button></div><img src="/images/valery-dog.jpeg"/></section>
</main>}

function ProductCard({p,navigate,addToCart}){return <article className="card"><button onClick={()=>navigate('/product/'+p.id)}><img src={p.image}/></button><div><small>{p.badge}</small><h3>{p.title}</h3><p>{money(p.price)}</p><button onClick={()=>addToCart(p)}>В корзину</button></div></article>}
function Catalog(props){const [q,setQ]=useState(''); const items=props.products.filter(p=>(p.title+p.category).toLowerCase().includes(q.toLowerCase())); return <main className="page"><h1>Каталог</h1><input className="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Поиск по товарам"/><div className="grid">{items.map(p=><ProductCard key={p.id} p={p} {...props}/>)}</div></main>}
function ProductPage(props){const p=props.products.find(x=>x.id===props.id)||props.products[0]; return <><Header {...props}/><main className="product"><img src={p.image}/><div><small>{p.category}</small><h1>{p.title}</h1><p className="price">{money(p.price)}</p><p>{p.description}</p><button className="dark" onClick={()=>props.addToCart(p)}>Добавить в корзину</button></div></main><Footer settings={props.settings}/></>}
function Cart({cart,updateCart}){const total=cart.reduce((s,p)=>s+Number(p.price),0); return <main className="page"><h1>Корзина</h1>{cart.length===0?<p>Корзина пуста.</p>:cart.map((p,i)=><div className="cartrow" key={i}><img src={p.image}/><b>{p.title}</b><span>{money(p.price)}</span><button onClick={()=>updateCart(cart.filter((_,x)=>x!==i))}><Trash2 size={18}/></button></div>)}<h2>Итого: {money(total)}</h2><button className="dark">Оформить заказ</button></main>}

function Admin(props){if(!props.auth)return <Login {...props}/>; return <div className="admin"><aside><h2>MAISON<br/>VALERY</h2><button onClick={()=>props.navigate('/admin/products')}><Package/> Товары</button><button onClick={()=>props.navigate('/admin/orders')}><ClipboardList/> Заказы</button><button onClick={()=>props.navigate('/admin/settings')}><Settings/> Настройки</button><button onClick={()=>props.navigate('/')}><ShoppingBag/> На сайт</button><button onClick={()=>{localStorage.removeItem('mv_auth');props.setAuth(false)}}><LogOut/> Выйти</button></aside><section>{location.hash.includes('orders')?<OrdersAdmin {...props}/>:location.hash.includes('settings')?<SettingsAdmin {...props}/>:<ProductsAdmin {...props}/>}</section></div>}
function Login({setAuth}){const [l,setL]=useState(''),[p,setP]=useState(''),[e,setE]=useState(''); return <div className="login"><div><h1>Admin</h1><input placeholder="login" value={l} onChange={x=>setL(x.target.value)}/><input placeholder="password" type="password" value={p} onChange={x=>setP(x.target.value)}/>{e&&<p className="err">{e}</p>}<button className="dark" onClick={()=>{if(l===ADMIN_LOGIN&&p===ADMIN_PASSWORD){localStorage.setItem('mv_auth','true');setAuth(true)}else setE('Неверный логин или пароль')}}>Войти</button></div></div>}
function ProductsAdmin({products,updateProducts}){const blank={id:'mv-'+Date.now(),title:'',category:'Сумки',price:'',badge:'',image:'',description:''}; const [form,setForm]=useState(blank); const edit=(p)=>setForm(p); const saveP=()=>{const exists=products.some(p=>p.id===form.id); updateProducts(exists?products.map(p=>p.id===form.id?form:p):[form,...products]); setForm({...blank,id:'mv-'+Date.now()})}; return <><h1>Товары</h1><div className="adminGrid"><div className="panel"><input placeholder="Название" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><input placeholder="Категория" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/><input placeholder="Цена" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/><input placeholder="Бейдж" value={form.badge} onChange={e=>setForm({...form,badge:e.target.value})}/><input placeholder="URL картинки" value={form.image} onChange={e=>setForm({...form,image:e.target.value})}/><textarea placeholder="Описание" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><button className="dark" onClick={saveP}><Plus size={16}/> Сохранить</button></div><div>{products.map(p=><div className="row" key={p.id}><img src={p.image}/><span><b>{p.title}</b><small>{money(p.price)}</small></span><button onClick={()=>edit(p)}>Редактировать</button><button onClick={()=>updateProducts(products.filter(x=>x.id!==p.id))}>Удалить</button></div>)}</div></div></>}
function OrdersAdmin({orders,updateOrders}){return <><h1>Заказы</h1>{orders.map(o=><div className="order" key={o.id}><b>{o.id}</b><span>{o.customer}</span><span>{o.phone}</span><span>{money(o.total)}</span><select value={o.status} onChange={e=>updateOrders(orders.map(x=>x.id===o.id?{...x,status:e.target.value}:x))}><option>Новый</option><option>В обработке</option><option>Отправлен</option><option>Закрыт</option></select></div>)}</>}
function SettingsAdmin({settings,updateSettings}){return <><h1>Настройки</h1><div className="panel wide"><input value={settings.brand} onChange={e=>updateSettings({...settings,brand:e.target.value})}/><input value={settings.subtitle} onChange={e=>updateSettings({...settings,subtitle:e.target.value})}/><input value={settings.hero} onChange={e=>updateSettings({...settings,hero:e.target.value})}/><input value={settings.delivery} onChange={e=>updateSettings({...settings,delivery:e.target.value})}/></div></>}
function Footer({settings}){return <footer><span>Доставка и оплата</span><span>Возврат</span><span>FAQ</span><span>Контакты</span><b>© {settings.brand}, 2026</b></footer>}

createRoot(document.getElementById('root')).render(<App/>);
