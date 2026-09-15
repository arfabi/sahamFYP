import React from 'react';
import {BarChart,Bar,XAxis,YAxis,ResponsiveContainer,PieChart,Pie,Cell} from 'recharts';
import {supabase} from '../services/supabase';
const C=['#F2A93B','#4CAF7D','#E4572E','#3B82F6','#8B5CF6','#EC4899','#14B8A6','#F97316'];
function Card({label,value,icon,color}){return <div className="bg-white rounded-2xl border border-slate-200 p-4"><div className="flex items-center gap-3"><div className={"w-10 h-10 rounded-xl flex items-center justify-center text-lg "+color}>{icon}</div><div><p className="text-2xl font-bold text-slate-800">{value}</p><p className="text-xs text-slate-500">{label}</p></div></div></div>;}
function fmtDate(iso){if(!iso)return'-';try{const d=new Date(iso);if(isNaN(d.getTime()))return'-';return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})+' '+d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});}catch{return'-';}}
const dateOf=(r)=>(r&&(r.published_at||r.timestamp||r.created_at))||null;
const domainOf=(u)=>{try{return new URL(u).hostname.replace(/^www\./,'');}catch{return'-';}};
function getTodayStr() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export default function NewsMonitoring() {
  const [selectedTicker, setSelectedTicker] = React.useState(null);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [detailItem, setDetailItem] = React.useState(null);
  const [tagFilter, setTagFilter] = React.useState(null);
  const [sectorFilter, setSectorFilter] = React.useState(null);
  const [symbolSearch, setSymbolSearch] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState(getTodayStr());
  const [availableTags, setAvailableTags] = React.useState([]);
  const [availableSectors, setAvailableSectors] = React.useState([]);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      let query = supabase.from('sector_trigger_news').select('*');
      if (sectorFilter) query = query.eq('sector', sectorFilter);
      if (tagFilter) query = query.contains('tags', [tagFilter]);
      if (dateFilter) {
        query = query.gte('published_at', `${dateFilter}T00:00:00`).lte('published_at', `${dateFilter}T23:59:59`);
      }
      query = query.order('published_at', { ascending: false }).limit(200);
      const { data, error } = await query;
      if (cancelled) return;
      if (error) {
        console.error(error);
        setRows([]);
      } else {
        setRows(data || []);
      }
      setLoading(false);
    }
    run();
    return () => { cancelled = true; };
  }, [sectorFilter, tagFilter, dateFilter]);

  React.useEffect(() => {
    let cancelled = false;
    async function loadOpts() {
      const [tg, sc] = await Promise.all([
        supabase.from('sector_trigger_news').select('tags').limit(1000),
        supabase.from('sector_trigger_news').select('sector').limit(1000),
      ]);
      if (cancelled) return;
      const at = new Set(), as = new Set();
      (tg.data || []).forEach(r => { (r.tags || []).forEach(t => { if (t) at.add(t); }); });
      (sc.data || []).forEach(r => { if (r.sector) as.add(r.sector); });
      setAvailableTags([...at].sort());
      setAvailableSectors([...as].sort());
    }
    loadOpts();
    return () => { cancelled = true; };
  }, []);

  const filteredRows = React.useMemo(() => {
    if (!symbolSearch.trim()) return rows;
    const term = symbolSearch.trim().toLowerCase();
    return rows.filter(r => (r.symbols || []).some(s => (s || '').toLowerCase().includes(term)));
  }, [rows, symbolSearch]);

  const total = filteredRows.length;
  const gen = filteredRows.filter(r => (r.tags || []).includes('Bullish')).length;
  const pass = filteredRows.filter(r => (r.tags || []).includes('Bearish')).length;
  const tc = {};
  for (const r of filteredRows) {
    for (const s of (r.symbols || [])) {
      const t = (s || '').replace(/\.JK$/i, '');
      if (t) tc[t] = (tc[t] || 0) + 1;
    }
  }
  const td = Object.entries(tc).map(([ticker, count]) => ({ ticker, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  const tickers = td.length;
  const tickerNews = selectedTicker ? filteredRows.filter(r => (r.symbols || []).some(s => (s || '').replace(/\.JK$/i, '') === selectedTicker)) : [];
  const sc = {};
  for (const r of filteredRows) {
    for (const t of (r.tags || [])) {
      sc[t] = (sc[t] || 0) + 1;
    }
  }
  const sd = Object.keys(sc).map(k => ({ name: k, value: sc[k] })).sort((a, b) => b.value - a.value).slice(0, 6);
  const bySec = {};
  for (const r of filteredRows) {
    const k = r.sector || 'unknown';
    bySec[k] = (bySec[k] || 0) + 1;
  }
  const secData = Object.entries(bySec).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">News Monitoring</h1>
        <p className="text-sm text-slate-500 mt-1">Data dari sector trigger news</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Filter Tanggal</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Filter Tag</label>
            <select
              value={tagFilter || ''}
              onChange={(e) => setTagFilter(e.target.value || null)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="">Semua Tag</option>
              {availableTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Filter Sektor</label>
            <select
              value={sectorFilter || ''}
              onChange={(e) => setSectorFilter(e.target.value || null)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="">Semua Sektor</option>
              {availableSectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Filter Symbol (Ketik)</label>
            <input
              type="text"
              placeholder="Cari Ticker (misal: ANTM, BBCA)..."
              value={symbolSearch}
              onChange={(e) => setSymbolSearch(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm w-56 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          {(tagFilter || sectorFilter || symbolSearch || dateFilter !== getTodayStr()) && (
            <button
              onClick={() => { setTagFilter(null); setSectorFilter(null); setSymbolSearch(''); setDateFilter(getTodayStr()); }}
              className="px-3 py-2 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Total Berita" value={total} icon="NEWS" color="bg-blue-50 text-blue-600" />
        <Card label="Bullish" value={gen} icon="UP" color="bg-green-50 text-green-600" />
        <Card label="Bearish" value={pass} icon="DN" color="bg-orange-50 text-orange-600" />
        <Card label="Emiten" value={tickers} icon="TK" color="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-base font-semibold text-slate-700 mb-3">Top Tags</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sd} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => (percent > 0.05 ? name : '')}>
                {sd.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {sd.slice(0, 5).map((s, i) => (
              <span key={s.name} className="text-xs">
                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: C[i] }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-base font-semibold text-slate-700 mb-3">Top Sektor</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={secData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => (percent > 0.05 ? name : '')}>
                {secData.map((_, i) => <Cell key={i} fill={C[(i + 2) % C.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {secData.slice(0, 5).map((s, i) => (
              <span key={s.name} className="text-xs">
                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: C[(i + 2) % C.length] }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-base font-semibold text-slate-700 mb-3">Emiten Trending <span className="text-xs text-slate-400 font-normal">(klik untuk detail)</span></h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={td} layout="vertical" onClick={(e) => { if (e && e.activeLabel) setSelectedTicker(e.activeLabel); }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="ticker" width={60} tick={{ fontSize: 12, cursor: 'pointer' }} />
              <Bar dataKey="count" fill="#F2A93B" radius={[0, 4, 4, 0]} style={{ cursor: 'pointer' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-base font-semibold text-slate-700 mb-3">Ranking Emiten</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="pb-2 pr-4">#</th>
                <th className="pb-2 pr-4">Ticker</th>
                <th className="pb-2 pr-4">Jumlah</th>
                <th className="pb-2">Trend</th>
              </tr>
            </thead>
            <tbody>
              {td.map((t, i) => (
                <tr key={t.ticker} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedTicker(t.ticker)}>
                  <td className="py-2 pr-4 text-slate-400">{i + 1}</td>
                  <td className="py-2 pr-4 font-semibold">{t.ticker}</td>
                  <td className="py-2 pr-4">{t.count}</td>
                  <td className="py-2">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: ((t.count / (td[0]?.count || 1)) * 100) + '%' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-base font-semibold text-slate-700 mb-4">Tabel Berita ({total})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="pb-3 pr-4">Tgl/Waktu</th>
                <th className="pb-3 pr-4">Thumb</th>
                <th className="pb-3 pr-4">Judul</th>
                <th className="pb-3 pr-4">Tag</th>
                <th className="pb-3 pr-4">Sektor</th>
                <th className="pb-3 pr-4">Symbol</th>
                <th className="pb-3 pr-4">Media</th>
                <th className="pb-3 text-center">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.slice(0, 50).map(r => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 pr-4 text-xs text-slate-500 whitespace-nowrap">{fmtDate(dateOf(r))}</td>
                  <td className="py-3 pr-4">{r.thumbnail_url ? (<img src={r.thumbnail_url} alt="" className="w-16 h-10 object-cover rounded-lg border border-slate-200" loading="lazy" />) : (<span className="text-slate-300 text-xs">-</span>)}</td>
                  <td className="py-3 pr-4 max-w-[300px]"><span className="truncate block text-slate-700" title={r.title || ''}>{r.title || '-'}</span></td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {(r.tags || []).slice(0, 3).map((t, i) => (
                        <button key={i} onClick={() => setTagFilter(t)} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs hover:bg-amber-200">{t}</button>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-600 text-xs">{r.sector || '-'}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {(r.symbols || []).slice(0, 3).map((s, i) => (
                        <button key={i} onClick={() => setSymbolSearch(s)} className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono hover:bg-slate-200">{s}</button>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-500 text-xs">{domainOf(r.source_url)}</td>
                  <td className="py-3 text-center">
                    <button onClick={() => setDetailItem(r)} className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600">Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {total > 50 && <p className="text-xs text-slate-400 text-center mt-3">Menampilkan 50 dari {total} berita</p>}
        </div>
      </div>

      {selectedTicker && tickerNews.length > 0 && <TickerModal ticker={selectedTicker} news={tickerNews} onClose={() => setSelectedTicker(null)} onDetail={(item) => { setSelectedTicker(null); setDetailItem(item); }} />}
      {detailItem && <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />}
    </div>
  );
}

function TickerModal({ ticker, news, onClose, onDetail }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Berita: {ticker}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">X</button>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          {(news || []).length === 0 ? <p className="p-5 text-center text-slate-400">Tidak ada berita</p> : <table className="w-full text-sm"><tbody>{(news || []).map(r => (<tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50"><td className="px-5 py-3 max-w-[350px]"><span className="truncate block text-slate-700">{r.title || '-'}</span><span className="text-xs text-slate-400">{fmtDate(dateOf(r))}</span></td><td className="px-5 py-3 text-right"><button onClick={() => onDetail(r)} className="text-xs text-amber-600 hover:text-amber-700 font-medium">Detail</button></td></tr>))}</tbody></table>}
        </div>
      </div>
    </div>
  );
}

function DetailModal({ item, onClose }) {
  const tags = (item.tags || []);
  const syms = (item.symbols || []);
  const subSectors = item.sub_sectors || item.sub_sector || [];
  const dims = item.dimensions || item.dimension || null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white p-5 border-b border-slate-200 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-slate-800 truncate pr-4">{item.title || 'Detail Berita'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 flex-shrink-0">X</button>
        </div>
        <div className="p-5 space-y-4">
          {item.thumbnail_url && <img src={item.thumbnail_url} alt={item.title || ''} className="w-full max-h-64 object-cover rounded-xl border border-slate-200" />}
          <div className="flex flex-wrap gap-2 items-center">
            {tags.map((tag, i) => <span key={i} className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">{tag}</span>)}
            <span className="px-3 py-1 bg-slate-50 rounded-md text-xs text-slate-500">Sector: {item.sector || '-'}</span>
            {subSectors.length > 0 && <span className="px-3 py-1 bg-slate-50 rounded-md text-xs text-slate-500">Sub: {subSectors.join(', ')}</span>}
            {syms.slice(0, 6).map((s, i) => <span key={i} className="px-3 py-1 bg-slate-100 rounded-md font-mono text-sm font-medium">{s}</span>)}
            {item.is_selected && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Dipilih trigger</span>}
          </div>
          <div><h4 className="text-xs font-medium text-slate-500 mb-1">Tanggal</h4><p className="text-sm text-slate-700">{fmtDate(dateOf(item))}</p></div>
          <div><h4 className="text-xs font-medium text-slate-500 mb-1">Source URL</h4><a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-600 break-all">{item.source_url}</a></div>
          {item.body && <div><h4 className="text-xs font-medium text-slate-500 mb-1">Deskripsi</h4><p className="text-sm text-slate-700 leading-relaxed">{item.body}</p></div>}
          {dims && typeof dims === 'object' && <div><h4 className="text-xs font-medium text-slate-500 mb-1">Dimensi</h4><div className="flex flex-wrap gap-1.5">{Object.entries(dims).map(([k, v]) => <span key={k} className="px-2 py-1 bg-slate-100 rounded-md text-xs">{k}: <b>{String(v)}</b></span>)}</div></div>}
        </div>
      </div>
    </div>
  );
}