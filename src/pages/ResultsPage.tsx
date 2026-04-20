import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getElectionResults } from '../api';
import type { Election, Candidate } from '../types';
import { ERROR_MESSAGES, UI } from '../config';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';

export default function ResultsPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<{
    election: Election;
    candidates: Candidate[];
    totalVotes: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadResults = async () => {
      if (!inviteCode) return;
      try {
        const result = await getElectionResults(inviteCode);
        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.error || ERROR_MESSAGES.ELECTION_NOT_FOUND);
        }
      } catch (err) {
        setError(ERROR_MESSAGES.NETWORK_ERROR);
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [inviteCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 transition-colors duration-500">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Sonuçlar Güncelleniyor</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 text-center transition-colors duration-500">
        <div className="max-w-xs">
          <h2 className="text-2xl font-light text-slate-900 mb-4">Veri Yok</h2>
          <p className="text-slate-400 text-sm mb-12">{error}</p>
          <button onClick={() => navigate('/')} className="text-indigo-600 font-bold uppercase text-[10px] tracking-widest">
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  const { election, candidates, totalVotes } = data;
  const sortedCandidates = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
  
  // Grafik için veri hazırlama
  const chartData = sortedCandidates.map(c => ({
    name: c.name,
    value: c.voteCount,
    shortName: c.name.split(' ')[0]
  }));

  const COLORS = UI.CHART_COLORS;

  return (
    <div className="min-h-screen bg-white py-20 px-8 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        <header className="mb-20 text-center">
          <button onClick={() => navigate(-1)} className="text-slate-300 hover:text-slate-900 transition-colors mb-8 text-[10px] font-black uppercase tracking-widest">
            ← Geri Dön
          </button>
          <h1 className="text-4xl font-light text-slate-900 mb-2">{election.title}</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Canlı Sonuçlar</p>
        </header>

        {/* Özet Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center p-8 border border-slate-50 rounded-[2rem]">
            <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mb-1">Toplam Oy</p>
            <p className="text-3xl font-light text-slate-900">{totalVotes}</p>
          </div>
          <div className="text-center p-8 border border-slate-50 rounded-[2rem]">
            <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mb-1">Aday Sayısı</p>
            <p className="text-3xl font-light text-slate-900">{candidates.length}</p>
          </div>
          <div className="text-center p-8 border border-slate-50 rounded-[2rem] bg-indigo-50/30">
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Lider</p>
            <p className="text-3xl font-light text-indigo-600 truncate px-2">{sortedCandidates[0].name.split(' ')[0]}</p>
          </div>
          <div className="text-center p-8 border border-slate-50 rounded-[2rem]">
            <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mb-1">Durum</p>
            <p className="text-2xl font-light text-emerald-500">Aktif</p>
          </div>
        </div>

        {/* Grafikler Alanı */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          
          {/* Dağılım Grafiği (Pie) */}
          <section className="bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100">
            <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-8 text-center">Oy Dağılımı</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Karşılaştırma Grafiği (Bar) */}
          <section className="bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100">
            <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-8 text-center">Aday Karşılaştırma</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <XAxis 
                    dataKey="shortName" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Detaylı Liste */}
        <div className="space-y-12">
          <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-8">Detaylı Liste</h2>
          {sortedCandidates.map((candidate, index) => {
            const percentage = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0;
            const isWinner = index === 0 && candidate.voteCount > 0;

            return (
              <div key={candidate.id} className="group">
                <div className="flex justify-between items-end mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <div>
                      <span className={`font-bold transition-colors ${isWinner ? 'text-indigo-600' : 'text-slate-700'}`}>
                        {candidate.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-300 text-[10px] font-black mr-4 uppercase tracking-widest">{candidate.voteCount} Oy</span>
                    <span className="text-slate-900 font-light text-3xl">%{percentage}</span>
                  </div>
                </div>
                <div className="h-1 w-full bg-slate-50 relative overflow-hidden rounded-full">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        <footer className="mt-40 text-center text-[10px] text-slate-300 font-black uppercase tracking-widest">
            Şeffaf, Güvenli ve Tamamen Anonim.
        </footer>
      </div>
    </div>
);
}
