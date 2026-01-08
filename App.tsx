
import React, { useState, useMemo, useRef } from 'react';
import { 
  FileText, Plus, Trash2, Zap, Wallet, Globe, 
  Building2, UserCheck, X, CheckCircle2,
  Users, CreditCard, Landmark, ArrowRight, Info,
  Briefcase, User, Calculator, 
  ToggleLeft, ToggleRight, ArrowLeftRight, Car, Coffee, Layers, Coins, RefreshCw, Wine, Utensils, Settings2, Receipt, Plane,
  FileUp, Paperclip, UploadCloud
} from 'lucide-react';
import { MultiSelectTraveler, SingleSelectTraveler, ProjectPicker, LocationPicker, CurrencySelect } from './components/FormComponents';
import { BasicInfo, Expense, Traveler, Trip, LoanRecord } from './types';
import { MOCK_INTL_APPLICATIONS, EXPENSE_ITEMS, CURRENCIES, INTERNATIONAL_LOCATIONS } from './constants';

const App: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false); 
  const [showPoolManager, setShowPoolManager] = useState(false);
  
  // Invoice Modal State
  const [invoiceMode, setInvoiceMode] = useState<'create' | 'edit'>('edit');
  const [activeInvoiceId, setActiveInvoiceId] = useState<number | null>(null);
  const [invoiceForm, setInvoiceForm] = useState<{file: string, no: string}>({file: '', no: ''});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Basic Info
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    docNo: 'INTL20240105009', 
    docDate: '2024-01-20', 
    reimburser: '张三', 
    costOrg: '海外事业部', 
    costDept: '北美销售组', 
    requestId: '', 
    description: '', 
    passportNo: 'E12345678', 
    isProject: true, 
    projectType: '科研项目', 
    projectCode: '', 
    fundSource: '专项资金' 
  });

  // 2. Personnel Pool
  const [travelers, setTravelers] = useState<Traveler[]>([
    { id: 'U1', name: '张三', level: 'M2', isMain: true, passport: 'E12345678', bankAccount: '6222 0210 **** 8888', bankName: '招商银行北京分行' },
    { id: 'U2', name: '李四', level: 'P5', isMain: false, passport: 'E87654321', bankAccount: '6217 0001 **** 1234', bankName: '建设银行上海分行' }
  ]);

  // 3. Trips
  const [trips, setTrips] = useState<Trip[]>([]);

  // 4. Expenses
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 1, source: 'personal', category: '住宿', type: '酒店', date: '2024-01-09', currency: 'USD', exchangeRate: 7.23, originalAmount: 220.00, cnyAmount: 1590.60, consumerId: 'U2', payeeId: 'U1', desc: '拉斯维加斯威尼斯人酒店 (李四房费)', policyStatus: 'ok', receipt: true, expenseItem: '境外差旅费', invoiceNo: 'INV-2024-001', invoiceFile: 'hotel_receipt.pdf' },
    { id: 2, source: 'corp', category: '交通', type: '国际机票', date: '2024-01-08', currency: 'CNY', exchangeRate: 1.00, originalAmount: 12500.00, cnyAmount: 12500.00, consumerId: 'U1', payeeId: 'CORP', desc: '北京-拉斯维加斯 (UA889) 商旅预订', policyStatus: 'ok', receipt: true, expenseItem: '境外差旅费' }
  ]);

  // 5. Loans
  const [loans, setLoans] = useState<LoanRecord[]>([]);

  // Helpers
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    const diffTime = e.getTime() - s.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : (diffDays === 0 ? 1 : 0);
  };

  const handleSelectApplication = (appId: string) => {
    if (!appId) return;
    setIsSyncing(true);
    setTimeout(() => {
      const appData = MOCK_INTL_APPLICATIONS.find(app => app.id === appId);
      if (appData) {
        setBasicInfo(prev => ({ ...prev, requestId: appData.id, description: appData.title }));
        if (appData.travelers?.length > 0) setTravelers(appData.travelers);

        const enrichedTrips: Trip[] = appData.trips.map(t => {
          const loc = INTERNATIONAL_LOCATIONS.find(l => l.country === t.toCountry && l.city === t.toCity);
          return {
            ...t,
            mealRate: loc ? loc.mealRate : 50,
            miscRate: loc ? loc.miscRate : 35,
            isChartered: t.isChartered || false,
            mainTravelerId: t.mainTravelerId || 'U1',
            fellowTravelerIds: t.fellowTravelerIds || [],
            days: calculateDays(t.startDate, t.endDate), 
            businessMeals: t.businessMeals || 0 
          };
        });
        setTrips(enrichedTrips);
        setExpenses(prev => [...prev.filter(e => e.source === 'personal'), ...appData.corpExpenses.map(e => ({...e, expenseItem: '境外差旅费'}))]);
      }
      setIsSyncing(false);
    }, 600);
  };

  const updateTrip = (id: number, field: keyof Trip, value: any) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nt = { ...t, [field]: value };
      if (field === 'startDate' || field === 'endDate') nt.days = calculateDays(nt.startDate, nt.endDate);
      return nt;
    }));
  };

  const updateTripLocation = (id: number, type: 'from' | 'to', val: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== id) return t;
      let country = '', city = val;
      const parts = val.split('-');
      if (parts.length > 1) { country = parts[0].trim(); city = parts.slice(1).join('-').trim(); }
      return type === 'from' ? { ...t, country, city } : { ...t, toCountry: country, toCity: city };
    }));
  };

  const addTrip = () => setTrips([...trips, { 
    id: Date.now(), country: '', city: '', toCountry: '', toCity: '', 
    startDate: '', endDate: '', days: 1, areaTier: 'Tier1', mealRate: 50, miscRate: 35, 
    isChartered: false, mainTravelerId: travelers[0]?.id || '', fellowTravelerIds: [], businessMeals: 0
  }]);

  const removeTrip = (id: number) => setTrips(trips.filter(t => t.id !== id));

  const addTraveler = () => setTravelers([...travelers, { id: `U${Date.now()}`, name: '新人员', level: 'P5', isMain: false, passport: '', bankAccount: '', bankName: '' }]);
  const removeTraveler = (id: string) => travelers.length > 1 && setTravelers(travelers.filter(t => t.id !== id));
  const updateTraveler = (id: string, field: keyof Traveler, value: any) => setTravelers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));

  const updateExpense = (id: number, field: keyof Expense, value: any) => {
    setExpenses(prev => prev.map(e => {
      if (e.id !== id) return e;
      const n = { ...e, [field]: value };
      if (field === 'category') n.expenseItem = EXPENSE_ITEMS.find(i => i.defaultFor.includes(value))?.name || '境外差旅费';
      if (field === 'currency' || field === 'exchangeRate' || field === 'originalAmount') {
        const rate = field === 'currency' ? (CURRENCIES.find(c => c.code === value)?.rate || 1) : (field === 'exchangeRate' ? Number(value) : n.exchangeRate);
        const amt = field === 'originalAmount' ? Number(value) : n.originalAmount;
        n.exchangeRate = rate; n.cnyAmount = Number((amt * rate).toFixed(2));
      }
      return n;
    }));
  };

  const updateLoan = (id: number, field: keyof LoanRecord, value: any) => {
    setLoans(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  // Invoice Actions
  const openInvoiceModal = (expense?: Expense) => {
    if (expense) {
      setInvoiceMode('edit');
      setActiveInvoiceId(expense.id);
      setInvoiceForm({
        file: expense.invoiceFile || '',
        no: expense.invoiceNo || ''
      });
    } else {
      setInvoiceMode('create');
      setActiveInvoiceId(null);
      setInvoiceForm({ file: '', no: '' });
    }
  };

  const handleInvoiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setInvoiceForm(prev => ({ ...prev, file: e.target.files![0].name }));
    }
  };

  const saveInvoice = () => {
    if (invoiceMode === 'edit' && activeInvoiceId) {
      setExpenses(prev => prev.map(e => {
        if (e.id !== activeInvoiceId) return e;
        return { 
          ...e, 
          invoiceFile: invoiceForm.file, 
          invoiceNo: invoiceForm.no,
          receipt: !!(invoiceForm.file || invoiceForm.no) 
        };
      }));
    } else if (invoiceMode === 'create') {
      const newExpense: Expense = {
        id: Date.now(),
        source: 'personal',
        category: '餐饮', // Default
        type: '工作餐',
        date: basicInfo.docDate,
        currency: 'USD',
        exchangeRate: 7.23,
        originalAmount: 0,
        cnyAmount: 0,
        consumerId: travelers[0]?.id || '',
        payeeId: travelers[0]?.id || '',
        desc: '',
        policyStatus: 'ok',
        receipt: !!(invoiceForm.file || invoiceForm.no),
        expenseItem: '境外差旅费',
        invoiceFile: invoiceForm.file,
        invoiceNo: invoiceForm.no
      };
      setExpenses(prev => [...prev, newExpense]);
    }
    setActiveInvoiceId(null);
    setInvoiceMode('edit'); // Reset
  };

  const totals = useMemo(() => {
    let allowanceTotalCNY = 0;
    const travelerAllowanceMap: Record<string, number> = {};
    travelers.forEach(t => travelerAllowanceMap[t.id] = 0);
    
    const subsidyDetails = trips.map(t => {
      const meal = t.mealRate || 0, misc = t.isChartered ? 0 : (t.miscRate || 0); 
      const deductionPerPerson = (t.businessMeals || 0) * (meal / 3);
      const totalPerPersonUSD = Math.max(0, (meal + misc) * (t.days || 0) - deductionPerPerson);
      const totalPerPersonCNY = totalPerPersonUSD * 7.23; 
      
      const ids = [t.mainTravelerId, ...t.fellowTravelerIds].filter(Boolean);
      ids.forEach(uid => { if (travelerAllowanceMap[uid] !== undefined) travelerAllowanceMap[uid] += totalPerPersonCNY; });
      
      const totalCNY = totalPerPersonCNY * ids.length;
      allowanceTotalCNY += totalCNY;
      return { ...t, totalCNY, personCount: ids.length, deductionTotal: deductionPerPerson * ids.length };
    });

    const settlementMap: Record<string, number> = {};
    travelers.forEach(t => settlementMap[t.id] = (travelerAllowanceMap[t.id] || 0));
    
    // Add Personal Expenses
    expenses.filter(e => e.source === 'personal').forEach(e => {
      settlementMap[e.payeeId] = (settlementMap[e.payeeId] || 0) + e.cnyAmount;
    });

    // Subtract Cleared Loans
    loans.forEach(l => {
      settlementMap[l.travelerId] = (settlementMap[l.travelerId] || 0) - Number(l.clearedAmount || 0);
    });

    const personalCNY = expenses.filter(e => e.source === 'personal').reduce((s, e) => s + e.cnyAmount, 0);
    const corpCNY = expenses.filter(e => e.source === 'corp').reduce((s, e) => s + e.cnyAmount, 0);
    const loanOffsetTotal = loans.reduce((s, l) => s + Number(l.clearedAmount || 0), 0);
    
    return { 
      personalCNY, 
      corpCNY, 
      allowanceTotalCNY, 
      grandTotal: personalCNY + corpCNY + allowanceTotalCNY, 
      payable: personalCNY + allowanceTotalCNY - loanOffsetTotal, 
      loanOffsetTotal,
      settlementMap, 
      subsidyDetails, 
      travelerAllowanceMap 
    };
  }, [expenses, trips, travelers, loans]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-indigo-900 border-b border-indigo-800 shadow-md px-8 py-3 flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold border border-white/20"><Globe size={18}/></div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">境外差旅报销单</h1>
            <p className="text-[10px] text-indigo-300 font-mono opacity-80">{basicInfo.docNo}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] bg-indigo-800 px-3 py-1 rounded-full border border-indigo-700 flex items-center gap-2">
            <span className="opacity-60">汇率基准:</span>
            <span className="font-bold text-yellow-400">USD 7.23</span>
            <span className="font-bold text-yellow-400">EUR 7.85</span>
          </div>
          <button className="px-4 py-1.5 text-xs bg-indigo-600 rounded-md font-bold shadow-lg hover:bg-indigo-500 flex items-center gap-1 transition-all">
            <CheckCircle2 size={12}/> 提交审批
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
        {/* Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">总成本 (预算口径)</span>
              <div className="text-2xl font-black text-slate-800 mt-2">¥ {totals.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
           </div>
           <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">补贴/垫付</span>
              <div className="text-2xl font-black text-amber-600 mt-2">¥ {(totals.personalCNY + totals.allowanceTotalCNY).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
           </div>
           <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">企业支付/预订</span>
              <div className="text-2xl font-black text-blue-600 mt-2">¥ {totals.corpCNY.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
           </div>
           <div className="bg-indigo-600 rounded-xl p-4 shadow-lg text-white">
              <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">实付个人 (扣减借款)</span>
              <div className="text-3xl font-black mt-2">¥ {totals.payable.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
           </div>
        </div>

        {/* 1. Basic Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <div className="space-y-1"><label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">单据编号</label><div className="border-b border-slate-100 py-1 text-sm font-bold text-slate-500 bg-slate-50 px-2 rounded">{basicInfo.docNo}</div></div>
            <div className="space-y-1"><label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">单据日期</label><input type="date" className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none" value={basicInfo.docDate} onChange={(e)=>setBasicInfo({...basicInfo, docDate: e.target.value})}/></div>
            <div className="space-y-1"><label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">报销人/护照</label><div className="flex gap-2"><input className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none text-indigo-600" value={basicInfo.reimburser} onChange={(e)=>setBasicInfo({...basicInfo, reimburser:e.target.value})}/><input className="w-24 border-b border-slate-100 py-1 text-[10px] text-slate-400 font-mono" value={basicInfo.passportNo} onChange={(e)=>setBasicInfo({...basicInfo, passportNo:e.target.value})}/></div></div>
            <div className="space-y-1"><label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">关联申请单</label><div className="relative"><select className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none text-indigo-600 truncate pr-4" value={basicInfo.requestId} onChange={(e) => handleSelectApplication(e.target.value)}><option value="">选择申请单...</option>{MOCK_INTL_APPLICATIONS.map(app => <option key={app.id} value={app.id}>{app.title}</option>)}</select>{isSyncing && <RefreshCw size={12} className="absolute right-0 top-1 animate-spin text-indigo-500"/>}</div></div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">是否项目</label>
              <div className="flex gap-4 items-center h-7">
                <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="radio" checked={basicInfo.isProject} onChange={()=>setBasicInfo({...basicInfo, isProject:true})} className="text-indigo-600 focus:ring-indigo-500"/> 是</label>
                <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="radio" checked={!basicInfo.isProject} onChange={()=>setBasicInfo({...basicInfo, isProject:false})} className="text-indigo-600 focus:ring-indigo-500"/> 否</label>
              </div>
            </div>

            {/* Project Conditional Fields */}
            {basicInfo.isProject ? (
              <>
                <div className="md:col-span-2 space-y-1 animate-in fade-in zoom-in-95">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">关联项目</label>
                  <ProjectPicker value={basicInfo.projectCode} onChange={(val) => setBasicInfo({...basicInfo, projectCode: val})} placeholder="输入项目编号或名称..." />
                </div>
                <div className="space-y-1 animate-in fade-in zoom-in-95">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">项目类型</label>
                  <select className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none text-indigo-600" value={basicInfo.projectType} onChange={(e) => setBasicInfo({...basicInfo, projectType: e.target.value})}>
                    <option value="科研项目">科研项目</option>
                    <option value="非科研项目">非科研项目</option>
                    <option value="非项目支出">非项目支出</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="md:col-span-3"></div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">资金来源</label>
              <select className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none text-slate-700" value={basicInfo.fundSource} onChange={(e) => setBasicInfo({...basicInfo, fundSource: e.target.value})}>
                <option value="专项资金">专项资金</option>
                <option value="自筹">自筹</option>
              </select>
            </div>

            <div className="md:col-span-3 space-y-1"><label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">报销事由</label><input className="w-full border-b border-slate-100 py-1 text-sm font-bold outline-none focus:border-indigo-500" value={basicInfo.description} onChange={(e)=>setBasicInfo({...basicInfo, description:e.target.value})} placeholder="说明出差目的与成果..."/></div>
        </div>

        {/* 2. Intl Trip Table with Refactored Personnel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto relative">
           <div className="px-6 py-2 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between text-indigo-800 font-bold text-xs min-w-[1100px]">
             <div className="flex items-center gap-2"><Calculator size={14}/> 国际行程与补贴计算器</div>
             <button 
               onClick={() => setShowPoolManager(!showPoolManager)}
               className="flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-100 rounded text-indigo-600 hover:bg-indigo-50 transition-all text-[10px] font-bold shadow-sm"
             >
               <Users size={12}/> 人员池管理 {showPoolManager ? <X size={12}/> : <Settings2 size={12}/>}
             </button>
           </div>
           
           {/* Popover for Global Traveler Pool */}
           {showPoolManager && (
             <div className="absolute top-10 right-4 z-40 w-80 bg-white border border-slate-200 shadow-2xl rounded-xl p-4 animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-center mb-3 border-b pb-2">
                 <h3 className="text-[10px] font-black uppercase text-slate-400">所有出行人库</h3>
                 <button onClick={addTraveler} className="text-indigo-600 hover:text-indigo-700 text-[10px] font-bold">+ 新增</button>
               </div>
               <div className="max-h-60 overflow-y-auto space-y-2">
                 {travelers.map(t => (
                   <div key={t.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg">
                     <div className="flex-1">
                       <input className="font-bold text-[10px] bg-transparent outline-none w-full" value={t.name} onChange={(e)=>updateTraveler(t.id, 'name', e.target.value)}/>
                       <input className="text-[8px] text-slate-400 block w-full bg-transparent outline-none font-mono" placeholder="护照号" value={t.passport} onChange={(e)=>updateTraveler(t.id, 'passport', e.target.value)}/>
                     </div>
                     <button onClick={() => removeTraveler(t.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={12}/></button>
                   </div>
                 ))}
               </div>
             </div>
           )}

           <div className="p-0 min-w-[1100px]">
             {/* Updated Grid for Trip Table */}
             <div className="grid grid-cols-[40px_220px_110px_110px_40px_80px_50px_70px_110px_140px_110px] bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase text-center">
               <div className="p-2 border-r border-slate-100">#</div>
               <div className="p-2 text-left pl-4 border-r border-slate-100">行程 (城市联动)</div>
               <div className="p-2 border-r border-slate-100">开始日期</div>
               <div className="p-2 border-r border-slate-100">结束日期</div>
               <div className="p-2 border-r border-slate-100">天数</div>
               <div className="p-2 border-r border-slate-100">标准(USD)</div>
               <div className="p-2 border-r border-slate-100">包车</div>
               <div className="p-2 border-r border-slate-100 text-indigo-500">业务招待</div>
               <div className="p-2 border-r border-slate-100 text-indigo-700 bg-indigo-50/20">出行人</div>
               <div className="p-2 border-r border-slate-100 text-indigo-700 bg-indigo-50/20">同行人</div>
               <div className="p-2 text-right pr-4">补贴合计</div>
             </div>

             {trips.map((trip, idx) => {
               const detail = totals.subsidyDetails[idx];
               return (
                <div key={trip.id} className="grid grid-cols-[40px_220px_110px_110px_40px_80px_50px_70px_110px_140px_110px] border-b border-slate-50 text-xs items-center hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-center justify-center font-black text-slate-300 relative group h-full border-r border-slate-50/50">
                    <span>{idx+1}</span>
                    <button onClick={() => removeTrip(trip.id)} className="absolute opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"><Trash2 size={12}/></button>
                  </div>
                  <div className="px-4 py-2 border-r border-slate-50/50 flex items-center gap-1">
                    <LocationPicker value={`${trip.country}-${trip.city}`} placeholder="始发" onChange={(v)=>updateTripLocation(trip.id, 'from', v)}/>
                    <ArrowRight size={10} className="text-slate-300 mx-1"/>
                    <LocationPicker value={`${trip.toCountry}-${trip.toCity}`} placeholder="目的" onChange={(v)=>updateTripLocation(trip.id, 'to', v)} autoStandardsCallback={(s)=>setTrips(prev => prev.map(t => t.id === trip.id ? {...t, areaTier:s.tier, mealRate:s.mealRate, miscRate:s.miscRate} : t))}/>
                  </div>
                  <div className="px-1 border-r border-slate-50/50"><input type="date" className="w-full text-[10px] border rounded py-0.5 outline-none font-bold" value={trip.startDate} onChange={(e)=>updateTrip(trip.id, 'startDate', e.target.value)}/></div>
                  <div className="px-1 border-r border-slate-50/50"><input type="date" className="w-full text-[10px] border rounded py-0.5 outline-none font-bold" value={trip.endDate} onChange={(e)=>updateTrip(trip.id, 'endDate', e.target.value)}/></div>
                  <div className="text-center font-black text-slate-700 border-r border-slate-50/50">{trip.days}</div>
                  <div className="flex flex-col items-center gap-0.5 text-[9px] text-slate-400 border-r border-slate-50/50"><span>餐 ${trip.mealRate}</span><span className={trip.isChartered ? 'line-through text-slate-200' : ''}>杂 ${trip.miscRate}</span></div>
                  <div className="flex justify-center border-r border-slate-50/50"><button onClick={()=>updateTrip(trip.id, 'isChartered', !trip.isChartered)} className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${trip.isChartered ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-slate-50 border-slate-200 text-slate-300'}`} title="包车无公杂"><Car size={12}/></button></div>
                  <div className="px-2 border-r border-slate-50/50"><input type="number" className="w-full text-center text-[10px] border border-slate-200 rounded py-0.5 font-black text-indigo-600" value={trip.businessMeals} onChange={(e)=>updateTrip(trip.id, 'businessMeals', Number(e.target.value))} placeholder="0"/></div>
                  
                  {/* Personnel Integration */}
                  <div className="px-1.5 border-r border-slate-50/50 bg-indigo-50/10 h-full flex items-center">
                    <SingleSelectTraveler allTravelers={travelers} selectedId={trip.mainTravelerId} onChange={(id) => updateTrip(trip.id, 'mainTravelerId', id)}/>
                  </div>
                  <div className="px-1.5 border-r border-slate-50/50 bg-indigo-50/10 h-full flex items-center">
                    <MultiSelectTraveler allTravelers={travelers} selectedIds={trip.fellowTravelerIds} disabledId={trip.mainTravelerId} onChange={(ids) => updateTrip(trip.id, 'fellowTravelerIds', ids)}/>
                  </div>

                  <div className="text-right pr-4 font-black text-amber-600">¥ {detail.totalCNY.toFixed(0)}</div>
                </div>
             )})}
             <div className="p-3 bg-slate-50/20"><button onClick={addTrip} className="w-full py-2 border border-dashed border-slate-300 text-slate-400 rounded hover:text-indigo-600 hover:border-indigo-200 text-[10px] font-bold transition-all">+ 增加行程航段</button></div>
           </div>
        </div>

        {/* 3. Expenses Detailed (Personal) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center font-bold text-xs text-slate-600">
             <div className="flex items-center gap-2"><Wallet size={14}/> 垫付费用明细 (个人支付)</div>
             <div className="flex items-center gap-2">
               <button 
                 onClick={() => openInvoiceModal()} 
                 className="text-[10px] bg-white border border-indigo-200 text-indigo-600 px-3 py-1 rounded font-bold hover:bg-indigo-50 shadow-sm flex items-center gap-1 transition-all"
               >
                 <UploadCloud size={12}/> 上传发票/凭证
               </button>
               <button 
                 onClick={() => setExpenses([...expenses, {id:Date.now(), source:'personal', category:'餐饮', type:'工作餐', date:basicInfo.docDate, currency:'USD', exchangeRate:7.23, originalAmount:0, cnyAmount:0, consumerId:'U1', payeeId:'U1', desc:'', policyStatus:'ok', receipt:false, expenseItem:'境外差旅费'}])} 
                 className="text-[10px] bg-indigo-600 text-white px-3 py-1 rounded font-bold hover:bg-indigo-500 shadow-sm flex items-center gap-1 transition-all"
               >
                 <Plus size={12}/> 手工录入
               </button>
             </div>
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/30 text-slate-400 text-[10px] uppercase font-bold border-b">
              <tr>
                <th className="p-3">费用项目</th><th className="p-3">类别</th><th className="p-3">摘要</th><th className="p-3">消费人</th><th className="p-3">币种/金额</th><th className="p-3 text-right">汇率</th><th className="p-3 text-right text-indigo-700 bg-indigo-50/20">折合人民币</th><th className="p-3">发票/凭证</th><th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.filter(e => e.source === 'personal').map(exp => (
                <tr key={exp.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 text-slate-500">{exp.expenseItem}</td>
                  <td className="p-3 font-bold">{exp.category}</td>
                  <td className="p-3"><input className="w-full bg-transparent outline-none text-slate-600" value={exp.desc} onChange={(e)=>updateExpense(exp.id, 'desc', e.target.value)} placeholder="事由说明..."/></td>
                  <td className="p-3">
                    <select className="bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] font-bold" value={exp.consumerId} onChange={(e)=>updateExpense(exp.id, 'consumerId', e.target.value)}>
                      {travelers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <CurrencySelect value={exp.currency} onChange={(v)=>updateExpense(exp.id, 'currency', v)}/>
                      <input type="number" className="w-16 text-right font-black outline-none border-b border-dashed border-slate-200" value={exp.originalAmount} onChange={(e)=>updateExpense(exp.id, 'originalAmount', e.target.value)}/>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <input type="number" className="w-10 text-right font-bold text-slate-400 bg-transparent outline-none border-b border-dashed border-slate-200 focus:text-indigo-600 focus:border-indigo-400" value={exp.exchangeRate} onChange={(e)=>updateExpense(exp.id, 'exchangeRate', Number(e.target.value))}/>
                  </td>
                  <td className="p-3 text-right font-black text-indigo-700 bg-indigo-50/10 italic">¥ {exp.cnyAmount.toFixed(2)}</td>
                  <td className="p-3">
                    <button onClick={() => openInvoiceModal(exp)} className={`flex items-center gap-1 px-2 py-1 rounded border transition-all ${exp.invoiceNo || exp.invoiceFile ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-dashed border-slate-300 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'}`}>
                      {exp.invoiceNo || exp.invoiceFile ? <><Paperclip size={10}/><span className="max-w-[80px] truncate">{exp.invoiceNo || '已上传'}</span></> : <Paperclip size={10}/>}
                    </button>
                  </td>
                  <td className="p-3"><button onClick={()=>setExpenses(expenses.filter(x=>x.id!==exp.id))} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={12}/></button></td>
                </tr>
              ))}
              {travelers.map(t => totals.travelerAllowanceMap[t.id] > 0 && (
                <tr key={`sum-${t.id}`} className="bg-amber-50/20 font-bold border-t border-amber-50">
                  <td className="p-3 text-amber-600 flex items-center gap-1"><Zap size={10} fill="currentColor"/> 补贴</td>
                  <td className="p-3 text-slate-500 italic font-normal text-[10px]" colSpan={6}>境外行程全段补贴自动汇总 ({t.name})</td>
                  <td className="p-3 text-right text-amber-700 bg-amber-100/20">¥ {totals.travelerAllowanceMap[t.id].toFixed(2)}</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Corporate Payment (Restored Read-Only Module) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-2 bg-blue-50/50 border-b border-blue-100 flex justify-between items-center font-bold text-xs text-blue-800">
             <div className="flex items-center gap-2"><Plane size={14}/> 企业支付明细 (公司统付/商旅预订)</div>
             <div className="text-[10px] text-blue-400 font-normal italic">系统自动同步 • 不可编辑</div>
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-blue-50/20 text-slate-400 text-[10px] uppercase font-bold border-b">
              <tr>
                <th className="p-3">费用项目</th><th className="p-3">类别</th><th className="p-3">摘要</th><th className="p-3">消费人</th><th className="p-3">币种/金额</th><th className="p-3 text-right text-blue-700 bg-blue-50/10">折合人民币</th><th className="p-3">发票/凭证</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.filter(e => e.source === 'corp').map(exp => (
                <tr key={exp.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 text-slate-500">{exp.expenseItem}</td>
                  <td className="p-3 font-bold">{exp.category}</td>
                  <td className="p-3 text-slate-600">{exp.desc}</td>
                  <td className="p-3 font-bold text-slate-700">
                    {travelers.find(t => t.id === exp.consumerId)?.name || exp.consumerId}
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-600">
                    {exp.currency} {exp.originalAmount.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-black text-blue-700 bg-blue-50/10 italic">¥ {exp.cnyAmount.toFixed(2)}</td>
                  <td className="p-3">
                    {exp.invoiceNo || exp.invoiceFile ? (
                      <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                        <Paperclip size={10}/>
                        <span className="max-w-[80px] truncate">{exp.invoiceNo || '已上传'}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-[10px]">--</span>
                    )}
                  </td>
                </tr>
              ))}
              {expenses.filter(e => e.source === 'corp').length === 0 && (
                 <tr>
                   <td colSpan={7} className="p-8 text-center text-slate-300 text-[10px] italic">无关联的企业支付记录</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Clearance of Loans */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center font-bold text-xs text-slate-600">
             <div className="flex items-center gap-2 uppercase tracking-wider"><Receipt size={14} className="text-indigo-600"/> 核销借款</div>
             <button onClick={() => setLoans([...loans, { id: Date.now(), travelerId: travelers[0]?.id || '', loanNo: '', loanAmount: 0, clearedAmount: 0 }])} className="text-[10px] bg-slate-600 text-white px-3 py-1 rounded font-bold hover:bg-slate-700 shadow-sm flex items-center gap-1 transition-all"><Plus size={12}/> 添加借款核销</button>
          </div>
          {loans.length > 0 ? (
            <div className="p-0">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/30 text-slate-400 text-[10px] uppercase font-bold border-b">
                  <tr>
                    <th className="p-3">借款人</th>
                    <th className="p-3">借款单号</th>
                    <th className="p-3 text-right">借款金额 (CNY)</th>
                    <th className="p-3 text-right text-indigo-700 bg-indigo-50/10">本次核销金额</th>
                    <th className="p-3 text-right text-slate-500">剩余借款金额</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loans.map(loan => (
                    <tr key={loan.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <select className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] font-bold outline-none" value={loan.travelerId} onChange={(e)=>updateLoan(loan.id, 'travelerId', e.target.value)}>
                          {travelers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </td>
                      <td className="p-3"><input className="w-full bg-transparent outline-none border-b border-dashed border-slate-200 focus:border-indigo-400 font-mono text-[10px]" placeholder="如: LOAN2023..." value={loan.loanNo} onChange={(e)=>updateLoan(loan.id, 'loanNo', e.target.value)}/></td>
                      <td className="p-3 text-right"><input type="number" className="w-24 text-right bg-transparent outline-none font-bold text-slate-600" value={loan.loanAmount} onChange={(e)=>updateLoan(loan.id, 'loanAmount', Number(e.target.value))}/></td>
                      <td className="p-3 text-right bg-indigo-50/10"><input type="number" className="w-24 text-right bg-transparent outline-none font-black text-indigo-700" value={loan.clearedAmount} onChange={(e)=>updateLoan(loan.id, 'clearedAmount', Number(e.target.value))}/></td>
                      <td className="p-3 text-right font-bold text-slate-400 italic">¥ {(loan.loanAmount - loan.clearedAmount).toFixed(2)}</td>
                      <td className="p-3"><button onClick={() => setLoans(loans.filter(l => l.id !== loan.id))} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={12}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-[10px] text-slate-300 italic">无历史借款核销记录</div>
          )}
        </div>

        {/* 6. Settlement & Approval Flow */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 font-bold text-[10px] text-slate-500 uppercase flex justify-between items-center tracking-widest">
            <div className="flex items-center gap-2"><Landmark size={14} className="text-indigo-600"/> 资金结算明细 (最终执行)</div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {travelers.filter(t => (totals.settlementMap[t.id] || 0) !== 0).map(t => {
                const amount = totals.settlementMap[t.id];
                const isNegative = amount < 0;
                return (
                  <div key={t.id} className={`flex items-center justify-between p-4 border rounded-xl transition-all ${isNegative ? 'bg-red-50 border-red-100' : 'bg-slate-50/50 border-slate-100 hover:border-indigo-300'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${isNegative ? 'bg-red-200 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>{t.name[0]}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-black text-slate-700">{t.name}</span>
                          <span className="text-[8px] bg-slate-200 px-1 rounded text-slate-500 uppercase tracking-tighter">收款人</span>
                        </div>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 font-mono"><CreditCard size={10}/> {t.bankAccount || '银行账号未锁定'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-black italic ${isNegative ? 'text-red-600' : 'text-indigo-600'}`}>¥ {amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                      <p className="text-[9px] text-slate-400 font-bold">实付余额 (已抵扣借款)</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sub-section: Approval Flow (As requested, kept here) */}
            <div className="mt-8 pt-6 border-t border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Briefcase size={12}/> 审批链路执行预估</p>
               <div className="flex items-center gap-3 text-xs">
                 <div className="flex flex-col items-center gap-1 opacity-50"><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-black text-[10px]">发</div><span className="text-[9px] font-bold text-slate-400">发起</span></div>
                 <div className="h-[1px] w-6 bg-slate-200"></div>
                 <div className="flex flex-col items-center gap-1"><div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-black text-[10px] text-indigo-600">领</div><span className="text-[9px] font-bold text-slate-600">部门经理</span></div>
                 <div className="h-[1px] w-6 bg-slate-200"></div>
                 <div className="flex flex-col items-center gap-1"><div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-black text-[10px] text-indigo-600">财</div><span className="text-[9px] font-bold text-slate-600">财务复核</span></div>
                 <div className="h-[1px] w-6 bg-slate-200"></div>
                 <div className="flex flex-col items-center gap-1 opacity-50"><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-black text-[10px]">总</div><span className="text-[9px] font-bold text-slate-400">财务总监</span></div>
               </div>
            </div>
          </div>
        </div>

        {/* Invoice Modal */}
        {(activeInvoiceId !== null || invoiceMode === 'create') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-sm font-black text-slate-700 flex items-center gap-2"><FileText size={16} className="text-indigo-600"/> {invoiceMode === 'create' ? '上传发票以新增记录' : '发票/凭证管理'}</h3>
                  <button onClick={() => { setActiveInvoiceId(null); setInvoiceMode('edit'); }} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={16}/></button>
                </div>
                <div className="p-6 space-y-4">
                  <div 
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-indigo-50/10 transition-colors cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleInvoiceFileChange} accept="image/*,.pdf"/>
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      {invoiceForm.file ? <FileText size={20} className="text-indigo-600"/> : <UploadCloud size={20} className="text-indigo-400"/>}
                    </div>
                    {invoiceForm.file ? (
                      <div>
                        <p className="text-xs font-bold text-indigo-700 break-all">{invoiceForm.file}</p>
                        <p className="text-[10px] text-indigo-400 mt-1">点击更换文件</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-600">点击上传发票文件</p>
                        <p className="text-[10px] text-slate-400 mt-1">支持 PDF, JPG, PNG</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">发票号码 / 备注</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                      placeholder="例如: INV-2024001..." 
                      value={invoiceForm.no}
                      onChange={(e) => setInvoiceForm(prev => ({...prev, no: e.target.value}))}
                    />
                  </div>
                </div>
                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button onClick={() => { setActiveInvoiceId(null); setInvoiceMode('edit'); }} className="px-4 py-1.5 rounded text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors">取消</button>
                  <button onClick={saveInvoice} className="px-4 py-1.5 rounded bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md transition-all">{invoiceMode === 'create' ? '生成记录' : '保存信息'}</button>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
