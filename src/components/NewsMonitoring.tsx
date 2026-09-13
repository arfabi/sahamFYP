import React from 'react';
import {BarChart,Bar,XAxis,YAxis,ResponsiveContainer,PieChart,Pie,Cell} from 'recharts';
import {supabase} from '../services/supabase';
const C=['#F2A93B','#4CAF7D','#E4572E','#3B82F6','#8B5CF6','#EC4899','#14B8A6','#F97316'];
function Card({label,value,icon,color}){return <div className="bg-white rounded-2xl border border-slate-200 p-4"><div className="flex items-center gap-3"><div className={"w-10 h-10 rounded-xl flex items-center justify-center text-lg "+color}>{icon}</div><div><p className="text-2xl font-bold text-slate-800">{value}</p><p className="text-xs text-slate-500">{label}</p></div></div></div>;}
export default function NewsMonitoring(){
const [period,setPeriod]=React.useState('today');
const [rows,setRows]=React.useState([]);
const [loading,setLoading]=React.useState(true);
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
const pie=[{name:'Generate',value:gen},{name:'Pass',value:pass}];
if(loading)return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"/></div>;
return(
<div className="p-6 max-w-7xl mx-auto">
<div className="flex items-center justify-between mb-6">
<h1 className="text-2xl font-bold text-slate-800">News Monitoring</h1>
<div className="flex gap-1 bg-slate-100 rounded-xl p-1">
{[{id:'today',l:'Hari Ini'},{id:'week',l:'Minggu Ini'},{id:'month',l:'Bulan Ini'},{id:'year',l:'Tahun Ini'}].map(p=>(<button key={p.id} onClick={()=>setPeriod(p.id)} className={"px-4 py-2 rounded-lg text-sm font-medium "+(period===p.id?'bg-white text-slate-800 shadow-sm':'text-slate-500')}>{p.l}</button>))}
</div></div>
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
<div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5"><h3 className="text-base font-semibold text-slate-700 mb-3">Emiten Trending</h3>
<ResponsiveContainer width="100%" height={200}><BarChart data={td} layout="vertical"><XAxis type="number" hide/><YAxis type="category" dataKey="ticker" width={50} tick={{fontSize:12}}/><Bar dataKey="count" fill="#F2A93B" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer>
</div></div>
<div className="bg-white rounded-2xl border border-slate-200 p-5"><h3 className="text-base font-semibold text-slate-700 mb-4">Tabel Berita ({total})</h3>
<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-slate-500 border-b border-slate-200"><th className="pb-3 pr-4">Link</th><th className="pb-3 pr-4">Judul</th><th className="pb-3 pr-4 text-center">Score</th><th className="pb-3 pr-4">Ticker</th><th className="pb-3 pr-4">Situs</th><th className="pb-3 text-center">Status</th></tr></thead>
<tbody>{rows.slice(0,50).map(r=>(<tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50"><td className="py-3 pr-4"><a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs">boka</a></td><td className="py-3 pr-4 max-w-[300px]"><span className="truncate block text-slate-700" title={r.title||''}>{r.title||'-'}</span></td><td className="py-3 pr-4 text-center"><span className={"inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold "+(r.score>=9?'bg-green-100 text-green-700':r.score>=7?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600')}>{r.score??'-'}</span></td><td className="py-3 pr-4">{r.ticker?<span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">{r.ticker}</span>:<span className="text-slate-300">-</span>}</td><td className="py-3 pr-4 text-slate-500 text-xs">{r.sitename||'-'}</td><td className="py-3 text-center"><span className={"inline-flex px-2 py-0.5 rounded-full text-xs font-medium "+(r.decision==='GENERATE'?'bg-green-100 text-green-700':'bg-orange-100 text-orange-600')}>{r.decision==='GENERATE'?'GENERATE':'PASS'}</span></td></tr>))}</tbody>
</table></div></div></div>
);
}
