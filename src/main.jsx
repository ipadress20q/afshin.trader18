import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const seed = [
  {id:'gold18', name:'طلای ۱۸ عیار', group:'طلا', price: 6523400, unit:'تومان', change:0.84},
  {id:'emami', name:'سکه امامی', group:'سکه', price: 74200000, unit:'تومان', change:-0.32},
  {id:'usd', name:'دلار آمریکا', group:'ارز', price: 61250, unit:'تومان', change:0.21},
  {id:'eur', name:'یورو', group:'ارز', price: 66580, unit:'تومان', change:0.12},
  {id:'oil', name:'نفت خام WTI', group:'کالا', price: 78.42, unit:'دلار', change:-0.56},
  {id:'btc', name:'بیت‌کوین', group:'رمزارز', price: 67420, unit:'دلار', change:1.72},
  {id:'silver', name:'نقره', group:'فلزات', price: 29.18, unit:'دلار', change:0.44},
  {id:'index', name:'شاخص کل بورس', group:'شاخص', price: 2184500, unit:'واحد', change:-0.18}
];
const money = (n) => Number(n).toLocaleString('fa-IR', {maximumFractionDigits:2});
function App(){
  const [markets,setMarkets]=useState(()=>JSON.parse(localStorage.getItem('md_markets')||'null')||seed);
  const [selected,setSelected]=useState('gold18');
  const [search,setSearch]=useState('');
  const [tab,setTab]=useState('markets');
  const [user,setUser]=useState(()=>localStorage.getItem('md_user')||'');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [authMode,setAuthMode]=useState('login');
  const [balance,setBalance]=useState(()=>Number(localStorage.getItem('md_balance')||100000000));
  const [orders,setOrders]=useState(()=>JSON.parse(localStorage.getItem('md_orders')||'[]'));
  const [qty,setQty]=useState('1');
  const [notice,setNotice]=useState('');
  const [sourceUrl,setSourceUrl]=useState(()=>localStorage.getItem('md_source')||'');
  const [sourceStatus,setSourceStatus]=useState('نمونه آزمایشی');
  const current=markets.find(x=>x.id===selected)||markets[0];
  useEffect(()=>{localStorage.setItem('md_markets',JSON.stringify(markets));},[markets]);
  useEffect(()=>{localStorage.setItem('md_balance',String(balance));},[balance]);
  useEffect(()=>{localStorage.setItem('md_orders',JSON.stringify(orders));},[orders]);
  // Demo-only ticker: small synthetic movement, not live market data.
  useEffect(()=>{
    const timer=setInterval(()=>setMarkets(prev=>prev.map(x=>({...x,price:Math.max(0,x.price*(1+(Math.random()-.5)*.0012))}))),5000);
    return ()=>clearInterval(timer);
  },[]);
  const filtered=useMemo(()=>markets.filter(x=>(x.name+' '+x.group).includes(search)),[markets,search]);
  function auth(){
    if(!email.trim()||password.length<6){setNotice('ایمیل و رمز حداقل ۶ کاراکتری وارد کنید.');return;}
    const users=JSON.parse(localStorage.getItem('md_users')||'{}');
    if(authMode==='register'){
      if(users[email]){setNotice('این ایمیل قبلاً ثبت شده است.');return;}
      users[email]=password;localStorage.setItem('md_users',JSON.stringify(users));
    } else if(users[email]!==password){setNotice('ایمیل یا رمز عبور اشتباه است.');return;}
    localStorage.setItem('md_user',email);setUser(email);setNotice('ورود موفق بود.');
  }
  function trade(side){
    const amount=Math.max(0,Number(qty));
    if(!amount){setNotice('حجم سفارش باید بیشتر از صفر باشد.');return;}
    const total=current.price*amount;
    if(side==='buy'&&total>balance){setNotice('موجودی مجازی کافی نیست.');return;}
    setBalance(b=>b+(side==='sell'?total:-total));
    setOrders(o=>[{id:Date.now(),side,name:current.name,qty:amount,price:current.price,total,date:new Date().toLocaleString('fa-IR')},...o]);
    setNotice(`${side==='buy'?'خرید':'فروش'} آزمایشی ثبت شد.`);
  }
  function saveSource(){localStorage.setItem('md_source',sourceUrl);setSourceStatus(sourceUrl?'آدرس ذخیره شد؛ اتصال واقعی هنوز نیازمند API معتبر است.':'نمونه آزمایشی');}
  function resetDemo(){setMarkets(seed);setBalance(100000000);setOrders([]);setNotice('داده‌های آزمایشی بازنشانی شد.');}
  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brandmark">M</div><div><b>MarketDesk</b><small>داشبورد بازارها</small></div></div>
      <div className="navlabel">منوی اصلی</div>
      {['markets','portfolio','orders','settings'].map((t,i)=><button className={'nav '+(tab===t?'active':'')} onClick={()=>setTab(t)} key={t}>{['▦','◉','↔','⚙'][i]} <span>{['بازارها','کیف پول مجازی','سفارش‌ها','تنظیمات'][i]}</span></button>)}
      <div className="sidebottom"><div className="offline"><i/> محلی و خصوصی</div><small>نسخه آزمایشی ۰.۱</small></div>
    </aside>
    <main className="main">
      <header><div><h1>{tab==='markets'?'نمای کلی بازار':tab==='portfolio'?'کیف پول مجازی':tab==='orders'?'سفارش‌های آزمایشی':'تنظیمات برنامه'}</h1><p>قیمت‌ها و معاملات در محیط آزمایشی</p></div>
      <div className="userbox">{user?<><span className="avatar">ک</span><span>{user}</span><button className="quiet" onClick={()=>{localStorage.removeItem('md_user');setUser('')}}>خروج</button></>:<button className="primary" onClick={()=>document.getElementById('auth').showModal()}>ورود / ثبت‌نام</button>}</div></header>
      {tab==='markets'&&<><section className="summary">
        <div className="stat"><span>موجودی مجازی</span><strong>{money(balance)} <small>تومان</small></strong><em>حساب آزمایشی</em></div>
        <div className="stat"><span>دارایی‌های تحت پوشش</span><strong>{money(markets.length)}</strong><em>نماد نمونه</em></div>
        <div className="stat"><span>سفارش‌های ثبت‌شده</span><strong>{money(orders.length)}</strong><em>خرید و فروش مجازی</em></div>
      </section>
      <section className="contentgrid">
        <div className="panel marketpanel"><div className="panelhead"><div><h2>بازارها</h2><p>قیمت‌های نمونه؛ هنوز زنده نیستند</p></div><input placeholder="جست‌وجوی نماد..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div className="tablewrap"><table><thead><tr><th>دارایی</th><th>قیمت</th><th>تغییر</th></tr></thead><tbody>{filtered.map(x=><tr key={x.id} onClick={()=>setSelected(x.id)} className={selected===x.id?'selected':''}><td><b>{x.name}</b><small>{x.group}</small></td><td>{money(x.price)} <small>{x.unit}</small></td><td className={x.change>=0?'up':'down'}>{x.change>=0?'▲':'▼'} {Math.abs(x.change).toLocaleString('fa-IR')}٪</td></tr>)}</tbody></table></div>
        </div>
        <div className="panel tradepanel"><div className="panelhead"><div><h2>{current.name}</h2><p>قیمت فعلی نمونه</p></div><span className="pill">Paper Trading</span></div>
          <div className="bigprice">{money(current.price)} <small>{current.unit}</small></div>
          <div className="chart"><svg viewBox="0 0 500 190" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6d8cff" stopOpacity=".25"/><stop offset="1" stopColor="#6d8cff" stopOpacity="0"/></linearGradient></defs><path d="M0 150 C35 140 42 92 80 115 S135 150 170 90 S220 75 260 105 S310 45 350 70 S410 110 450 38 S480 55 500 20 L500 190 L0 190Z" fill="url(#fill)"/><path d="M0 150 C35 140 42 92 80 115 S135 150 170 90 S220 75 260 105 S310 45 350 70 S410 110 450 38 S480 55 500 20" fill="none" stroke="#7894ff" strokeWidth="3"/></svg><div className="chartlabels"><span>۲۴ ساعت گذشته</span><span>نمایش نمودار نمونه</span></div></div>
          <div className="tradeform"><label>حجم</label><input type="number" min="0.01" step="any" value={qty} onChange={e=>setQty(e.target.value)}/><div className="tradebuttons"><button className="buy" onClick={()=>trade('buy')}>خرید آزمایشی</button><button className="sell" onClick={()=>trade('sell')}>فروش آزمایشی</button></div><small className="disclaimer">این سفارش‌ها به بازار واقعی ارسال نمی‌شوند.</small></div>
        </div>
      </section></>}
      {tab==='portfolio'&&<section className="panel standalone"><h2>کیف پول مجازی</h2><div className="bigprice">{money(balance)} <small>تومان</small></div><p>موجودی شروع نسخه آزمایشی: ۱۰۰,۰۰۰,۰۰۰ تومان</p><button className="secondary" onClick={()=>{setBalance(100000000);setNotice('موجودی مجازی بازنشانی شد.')}}>بازنشانی موجودی</button></section>}
      {tab==='orders'&&<section className="panel standalone"><h2>تاریخچه معاملات</h2><div className="tablewrap"><table><thead><tr><th>نوع</th><th>دارایی</th><th>حجم</th><th>قیمت</th><th>زمان</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td className={o.side==='buy'?'up':'down'}>{o.side==='buy'?'خرید':'فروش'}</td><td>{o.name}</td><td>{money(o.qty)}</td><td>{money(o.price)}</td><td>{o.date}</td></tr>)}</tbody></table>{!orders.length&&<p className="empty">هنوز سفارشی ثبت نشده است.</p>}</div></section>}
      {tab==='settings'&&<section className="panel standalone"><h2>تنظیمات منبع قیمت</h2><p>آدرس API رسمی یا منبع داده مجاز را وارد کنید. آدرس صفحه عادی سایت به‌تنهایی اتصال داده محسوب نمی‌شود.</p><label>آدرس API</label><input className="wideinput" value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="https://..."/><button className="primary" onClick={saveSource}>ذخیره آدرس</button><div className="sourceinfo">{sourceStatus}</div><hr/><h3>حریم خصوصی و داده‌ها</h3><p>اطلاعات این نمونه روی همین دستگاه در مرورگر داخلی برنامه ذخیره می‌شود. این نسخه برای چندکاربره واقعی یا داده مالی حساس آماده نیست.</p><button className="secondary" onClick={resetDemo}>بازنشانی همه داده‌های آزمایشی</button></section>}
      {notice&&<div className="toast" onClick={()=>setNotice('')}>{notice} <b>×</b></div>}
      <footer>MarketDesk • داده‌های نمونه و معاملات مجازی • برای استفاده واقعی، منبع قیمت و امنیت باید تکمیل شود.</footer>
    </main>
    <dialog id="auth"><div className="modalhead"><h2>{authMode==='login'?'ورود به حساب':'ساخت حساب'}</h2><button onClick={()=>document.getElementById('auth').close()}>×</button></div><p>حساب محلی آزمایشی؛ برای استفاده چندکاربره باید سرور امن اضافه شود.</p><label>ایمیل</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/><label>رمز عبور (حداقل ۶ کاراکتر)</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/><button className="primary full" onClick={auth}>{authMode==='login'?'ورود':'ثبت‌نام'}</button><button className="linkbtn" onClick={()=>setAuthMode(authMode==='login'?'register':'login')}>{authMode==='login'?'حساب ندارید؟ ثبت‌نام':'قبلاً حساب دارید؟ ورود'}</button>{notice&&<p className="modalnotice">{notice}</p>}</dialog>
  </div>
}
createRoot(document.getElementById('root')).render(<App/>);