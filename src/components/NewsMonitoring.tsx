import React from 'react';
import {BarChart,Bar,XAxis,YAxis,ResponsiveContainer,PieChart,Pie,Cell} from 'recharts';
import {supabase} from '../services/supabase';
const C=['#F2A93B','#4CAF7D','#E4572E','#3B82F6','#8B5CF6','#EC4899','#14B8A6','#F97316'];
function Card({label,value,icon,color}){return <div className="bg-white rounded-2xl border border-slate-200 p-4"><div className="flex items-center gap-3"><div className={"w-10 h-10 rounded-xl flex items-center justify-center text-lg "+color}>{icon}</div><div><p className="text-2xl font-bold text-slate-800">{value}</p><p className="text-xs text-slate-500">{label}</p></div></div></div>;}
function fmtDate(iso){if(!iso)return'-';const d=new Date(iso);return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})+' '+d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});}
export default function NewsMonitoring(){
const [period,setPeriod]=React.useState('today');
const [rows,setRows]=React.useState([]);
const [loading,setLoading]=React.useState(true);
const [selectedTicker,setSelectedTicker]=React.useState(null);
const [detailItem,setDetailItem]=React.useState(null);
React.useEffect(()=>{setLoading(true);const now=new Date();const end=new Date(now.getFullYear(),now.getMonth(),now.getDate(),23,59,59);
let start=new Date(0);
if(period==='today')start=new Date(now.getFullYear(),now.getMonth(),now.getDate());
else if(period==='week'){start=new Date(now);start.setDate(now.getDate()-7);}
else if(period==='month')start=new Date(now.getFullYear(),now.getMonth()-1,now.getDate());
else if(period==='year')start=new Date(now.getFullYear()-1,now.getMonth(),now.getDate());
supabase.from('news_scrape').select('*').gte('time_scrape',start.toISOString()).lte('time_scrape',end.toISOString()).order('time_scrape',{ascending:false}).then(({data,error})=>{if(error){console.error(error);setRows([]);}else{setRows(data||[]);}setLoading(false);});},[period]);
const total=rows.length;const gen=rows.filter(r=>r.decision==='GENERATE').length;const pass=rows.filter(r=>r.decision==='PASS').length;
const tickers=[...new Set(rows.map(r=>r.ticker).filter(Boolean))].length;
const tc={};for(const r of rows){if(r.ticker)tc[r.ticker]=(tc[r.ticker]||0)+1;}
const td=Object.entries(tc).map(([ticker,count])=>({ticker,count})).sort((a,b)=>b.count-a.count).slice(0,10);
const sc={};for(const r of rows){const s=r.sitename||'Unknown';sc[s]=(sc[s]||0)+1;}
const sd=Object.entries(sc).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,10);
const pie=[{name:'Generate',value:gen},{name:'Pass',value:pass}];
const tickerNews=selectedTicker?rows.filter(r=>r.ticker===selectedTicker):[];
if(loading)return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"/></div>;
return(
  <div className="p-6 max-w-7xl mx-auto">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-slate-800">News Monitoring</h1>
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {[{id:'today',l:'Hari Ini'},{id:'week',l:'Minggu Ini'},{id:'month',l:'Bulan Ini'},{id:'year',l:'Tahun Ini'}].map(p=>(<button key={p.id} onClick={()=>setPeriod(p.id)} className={"px-4 py-2 rounded-lg text-sm font-medium "+(period===p.id?'bg-white text-slate-800 shadow-sm':'text-slate-500')}>{p.l}</button>))}
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card label="Total Berita" value={total} icon="N" color="bg-blue-50 text-blue-600"/>
      <Card label="Generate" value={gen} icon="G" color="bg-green-50 text-green-600"/>
      <Card label="Pass" value={pass} icon="P" color="bg-orange-50 text-orange-600"/>
      <Card label="Unique Ticker" value={tickers} icon="T" color="bg-purple-50 text-purple-600"/>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5"><h3 className="text-base font-semibold text-slate-700 mb-3">Generate vs Pass</h3>
        <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={pie} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">{pie.map((_,i)=><Cell key={i} fill={C[i]}/>)}</Pie></PieChart></ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2 text-xs"><span><span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1"/>Generate</span><span><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"/>Pass</span></div>
      </div>
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5"><h3 className="text-base font-semibold text-slate-700 mb-3">Emiten Trending <span className="text-xs text-slate-400 font-normal">(klik untuk detail)</span></h3>
        <ResponsiveContainer width="100%" height={200}><BarChart data={td} layout="vertical" onClick={(e)=>{if(e&&e.activeLabel)setSelectedTicker(e.activeLabel)}}><XAxis type="number" hide/><YAxis type="category" dataKey="ticker" width={50} tick={{fontSize:12,cursor:'pointer'}}/><Bar dataKey="count" fill="#F2A93B" radius={[0,4,4,0]} style={{cursor:'pointer'}}/></BarChart></ResponsiveContainer>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5"><h3 className="text-base font-semibold text-slate-700 mb-3">Media Sumber</h3>
        <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={sd} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name,percent})=>(percent>0.05?name:'')}>{sd.map((_,i)=><Cell key={i} fill={C[i%C.length]}/>)}</Pie></PieChart></ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-2 mt-2">{sd.slice(0,5).map((s,i)=>(<span key={i} className="text-xs"><span className="inline-block w-2 h-2 rounded-full mr-1" style={{backgroundColor:C[i]}}/>{s.name} ({s.value})</span>))}</div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5"><h3 className="text-base font-semibold text-slate-700 mb-3">Ranking Emiten</h3>
        <table className="w-full text-sm"><thead><tr className="text-left text-slate-500 border-b border-slate-100"><th className="pb-2 pr-4">#</th><th className="pb-2 pr-4">Ticker</th><th className="pb-2 pr-4">Jumlah</th><th className="pb-2">Trend</th></tr></thead>
        <tbody>{td.map((t,i)=>(<tr key={t.ticker} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={()=>setSelectedTicker(t.ticker)}><td className="py-2 pr-4 text-slate-400">{i+1}</td><td className="py-2 pr-4 font-semibold">{t.ticker}</td><td className="py-2 pr-4">{t.count}</td><td className="py-2"><div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{width:((t.count/(td[0]?.count||1))*100)+'%'}}/></div></td></tr>))}</tbody></table>
      </div>
    </div>
    <div className="bg-white rounded-2xl border border-slate-200 p-5"><h3 className="text-base font-semibold text-slate-700 mb-4">Tabel Berita ({total})</h3>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-slate-500 border-b border-slate-200"><th className="pb-3 pr-4">Tgl/Waktu</th><th className="pb-3 pr-4">Judul</th><th className="pb-3 pr-4 text-center">Score</th><th className="pb-3 pr-4">Ticker</th><th className="pb-3 pr-4">Situs</th><th className="pb-3 text-center">Status</th><th className="pb-3 text-center">Detail</th></tr></thead>
      <tbody>{rows.slice(0,50).map(r=>(<tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50"><td className="py-3 pr-4 text-xs text-slate-500 whitespace-nowrap">{fmtDate(r.time_scrape)}</td><td className="py-3 pr-4 max-w-[300px]"><span className="truncate block text-slate-700" title={r.title||''}>{r.title||'-'}</span></td><td className="py-3 pr-4 text-center"><span className={"inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold "+(r.score>=9?'bg-green-100 text-green-700':r.score>=7?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600')}>{r.score??'-'}</span></td><td className="py-3 pr-4">{r.ticker?<span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">{r.ticker}</span>:<span className="text-slate-300">-</span>}</td><td className="py-3 pr-4 text-slate-500 text-xs">{r.sitename||'-'}</td><td className="py-3 text-center"><span className={"inline-flex px-2 py-0.5 rounded-full text-xs font-medium "+(r.decision==='GENERATE'?'bg-green-100 text-green-700':'bg-orange-100 text-orange-600')}>{r.decision==='GENERATE'?'GENERATE':'PASS'}</span></td><td className="py-3 text-center"><button onClick={()=>setDetailItem(r)} className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></td></tr>))}</tbody></table>{total>50&&<p className="text-xs text-slate-400 text-center mt-3">Menampilkan 50 dari {total} berita</p>}</div>
    </div>
    {selectedTicker&&<TickerModal ticker={selectedTicker} news={tickerNews} onClose={()=>setSelectedTicker(null)} onDetail={(item)=>{setSelectedTicker(null);setDetailItem(item);}}/>}
    {detailItem&&<DetailModal item={detailItem} onClose={()=>setDetailItem(null)}/>}
  </div>
);}
function TickerModal({ticker,news,onClose,onDetail}){
return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}><div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e=>e.stopPropagation()}><div className="p-5 border-b border-slate-200 flex items-center justify-between"><h3 className="text-lg font-bold text-slate-800">Berita: {ticker}</h3><button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div><div className="overflow-y-auto max-h-[60vh]">{news.length===0?<p className="p-5 text-center text-slate-400">Tidak ada berita</p>:<table className="w-full text-sm"><tbody>{news.map(r=>(<tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50"><td className="px-5 py-3 max-w-[350px]"><span className="truncate block text-slate-700">{r.title||'-'}</span><span className="text-xs text-slate-400">{fmtDate(r.time_scrape)}</span></td><td className="px-5 py-3 text-center"><span className={"inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold "+(r.score>=9?'bg-green-100 text-green-700':r.score>=7?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600')}>{r.score??'-'}</span></td><td className="px-5 py-3 text-right"><button onClick={()=>onDetail(r)} className="text-xs text-amber-600 hover:text-amber-700 font-medium">Detail</button></td></tr>))}</tbody></table>}</div></div></div>;
}
function DetailModal({item,onClose}){
return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}><div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}><div className="sticky top-0 bg-white p-5 border-b border-slate-200 flex items-center justify-between z-10"><h3 className="text-lg font-bold text-slate-800 truncate pr-4">{item.title||'Detail Berita'}</h3><button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div><div className="p-5 space-y-4">{item.image&&<img src={item.image} alt={item.title||''} className="w-full max-h-64 object-cover rounded-xl border border-slate-200"/>}<div className="flex flex-wrap gap-3"><span className={"px-3 py-1 rounded-full text-sm font-medium "+(item.decision==='GENERATE'?'bg-green-100 text-green-700':'bg-orange-100 text-orange-600')}>{item.decision}</span><span className={"inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold "+(item.score>=9?'bg-green-100 text-green-700':item.score>=7?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600')}>{item.score??'-'}</span>{item.ticker&&<span className="px-3 py-1 bg-slate-100 rounded-md font-mono text-sm font-medium">{item.ticker}</span>}<span className="px-3 py-1 bg-slate-50 rounded-md text-xs text-slate-500">{item.sitename||'-'}</span></div><div><h4 className="text-xs font-medium text-slate-500 mb-1">Tanggal Scrape</h4><p className="text-sm text-slate-700">{fmtDate(item.time_scrape)}</p></div><div><h4 className="text-xs font-medium text-slate-500 mb-1">Link Sumber</h4><a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-600 break-all">{item.url}</a></div>{item.description&&<div><h4 className="text-xs font-medium text-slate-500 mb-1">Deskripsi</h4><p className="text-sm text-slate-700 leading-relaxed">{item.description}</p></div>}{item.reason&&<div><h4 className="text-xs font-medium text-slate-500 mb-1">Alasan Score</h4><p className="text-sm text-slate-700 bg-amber-50 p-3 rounded-lg">{item.reason}</p></div>}{item.content&&<div><h4 className="text-xs font-medium text-slate-500 mb-1">Konten</h4><div className="text-sm text-slate-600 leading-relaxed max-h-60 overflow-y-auto bg-slate-50 p-4 rounded-lg whitespace-pre-wrap">{item.content}</div></div>}</div></div></div>;
}
