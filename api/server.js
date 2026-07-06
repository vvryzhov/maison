import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import {randomBytes} from 'crypto';

const app = express();
const PORT = 3000;
const DATA_DIR = process.env.DATA_DIR || '/data';
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'valery2026';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const defaultStore = {
  products: [
    {id:'mv-001', title:'Noir Top Handle Bag', category:'Сумки', price:285000, oldPrice:'', badge:'Новинка', image:'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=1200&auto=format&fit=crop', description:'Структурированная сумка из зернистой кожи с лаконичной фурнитурой.'},
    {id:'mv-002', title:'Taupe Soft Tote', category:'Сумки', price:198000, oldPrice:'', badge:'Quiet luxury', image:'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop', description:'Мягкая повседневная сумка без заметных логотипов.'},
    {id:'mv-003', title:'Black Evening Clutch', category:'Аксессуары', price:92000, oldPrice:'', badge:'Вечер', image:'https://images.unsplash.com/photo-1601924921557-45e6dea0a157?q=80&w=1200&auto=format&fit=crop', description:'Минималистичный клатч для вечерних образов.'},
    {id:'mv-004', title:'Cognac Vintage Bag', category:'Бренды', price:156000, oldPrice:184000, badge:'Archive', image:'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200&auto=format&fit=crop', description:'Винтажная сумка в теплом коньячном оттенке.'}
  ],
  orders: [],
  settings: {
    brand:'MAISON VALERY',
    subtitle:'PARIS',
    hero:'Quiet luxury.\nTimeless essence.',
    tagline:'Выбор вне времени. Качество, которое говорит само за себя.',
    delivery:'Бесплатная доставка и возврат',
    aboutTitle:'О доме',
    aboutText:'Мы создаём подборку вещей для жизни, где качество важнее логотипов, а элегантность проявляется в деталях.',
    email:'hello@maisonvalery.ru',
    phone:'+7 (495) 123-45-67',
    address:'Москва, Столешников переулок, 12',
    instagram:'@maisonvalery',
    telegram:'@maisonvalery',
    workingHours:'Пн–Сб 11:00–20:00',
    deliveryText:'Доставка по Москве — 1–2 дня, по России — 3–7 дней.',
    returnsText:'Возврат и обмен в течение 14 дней при сохранении товарного вида и бирок.',
    faq:[
      {q:'Как оформить заказ?', a:'Добавьте товары в корзину и нажмите «Оформить заказ».'},
      {q:'Есть ли примерка?', a:'Да, в нашем шоуруме в Москве.'}
    ]
  }
};

function ensureDataDir(){
  if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, {recursive:true});
  if(!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, {recursive:true});
}

function readStore(){
  ensureDataDir();
  if(!fs.existsSync(STORE_FILE)){
    fs.writeFileSync(STORE_FILE, JSON.stringify(defaultStore, null, 2));
    return structuredClone(defaultStore);
  }
  try{
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    return {
      products: parsed.products ?? defaultStore.products,
      orders: parsed.orders ?? defaultStore.orders,
      settings: {...defaultStore.settings, ...(parsed.settings || {})}
    };
  }catch(err){
    console.error('store read error', err);
    return structuredClone(defaultStore);
  }
}

function writeStore(data){
  ensureDataDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
}

function checkAdmin(req, res){
  const pass = req.get('X-Admin-Password') || '';
  if(pass !== ADMIN_PASSWORD){
    res.status(401).json({error:'Unauthorized'});
    return false;
  }
  return true;
}

function parseDataUrl(image){
  const match = String(image).match(/^data:image\/([\w+.-]+);base64,(.+)$/s);
  if(!match) return null;
  let ext = match[1].toLowerCase();
  if(ext === 'jpeg') ext = 'jpg';
  if(!['jpg','png','webp','gif'].includes(ext)) ext = 'jpg';
  const buf = Buffer.from(match[2], 'base64');
  return {ext, buf};
}

function saveUploadBuffer(buf, ext){
  ensureDataDir();
  const name = `${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, name), buf);
  return `/api/uploads/${name}`;
}

app.use(cors());
app.use(express.json({limit:'20mb'}));

app.get('/api/health', (_req, res)=>res.json({ok:true}));

app.get('/api/uploads/:name', (req, res)=>{
  const name = path.basename(req.params.name);
  const file = path.join(UPLOADS_DIR, name);
  if(!name || !fs.existsSync(file)) return res.status(404).end();
  res.sendFile(path.resolve(file));
});

app.post('/api/admin/upload', (req, res)=>{
  if(!checkAdmin(req, res)) return;
  const parsed = parseDataUrl(req.body?.image);
  if(!parsed) return res.status(400).json({error:'Invalid image'});
  if(parsed.buf.length > MAX_UPLOAD_BYTES) return res.status(400).json({error:'File too large'});
  try{
    const url = saveUploadBuffer(parsed.buf, parsed.ext);
    res.json({url});
  }catch(err){
    console.error('upload error', err);
    res.status(500).json({error:'Upload failed'});
  }
});

app.get('/api/store', (_req, res)=>{
  const store = readStore();
  res.json({products: store.products, settings: store.settings});
});

app.post('/api/orders', (req, res)=>{
  const order = req.body;
  if(!order?.customer || !order?.phone) return res.status(400).json({error:'Invalid order'});
  const store = readStore();
  store.orders = [order, ...store.orders];
  writeStore(store);
  res.json({ok:true, order});
});

app.get('/api/admin/store', (req, res)=>{
  if(!checkAdmin(req, res)) return;
  res.json(readStore());
});

app.put('/api/admin/store', (req, res)=>{
  if(!checkAdmin(req, res)) return;
  const current = readStore();
  const next = {
    products: req.body.products ?? current.products,
    orders: req.body.orders ?? current.orders,
    settings: {...current.settings, ...(req.body.settings || {})}
  };
  try{
    writeStore(next);
    res.json(next);
  }catch(err){
    console.error('store write error', err);
    res.status(500).json({error:'Save failed'});
  }
});

app.listen(PORT, ()=>console.log(`API listening on ${PORT}`));
