import React, { useState, useMemo } from 'react';
import { 
  FileText, Plus, Trash2, Zap, Wallet, Globe, 
  Building2, UserCheck, X, CheckCircle2,
  Users, CreditCard, Landmark, ArrowRight, Info,
  Briefcase, User, Calculator, 
  ToggleLeft, ToggleRight, ArrowLeftRight, Car, Coffee, Layers, Coins, RefreshCw, Wine, Utensils
} from 'lucide-react';
import { MultiSelectTraveler, ProjectPicker, LocationPicker, CurrencySelect } from './components/FormComponents';
import { BasicInfo, Expense, Traveler, Trip } from './types';
import { MOCK_INTL_APPLICATIONS, EXPENSE_ITEMS, CURRENCIES, INTERNATIONAL_LOCATIONS } from './constants';

const App: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false); 

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

  // 2. Travelers
  const [travelers, setTravelers] = useState<Traveler[]>([
    { id: 'U1', name: '张三', level: 'M2', isMain: true, passport: 'E12345678', bankAccount: '6222 0210 **** 8888', bankName: '招商银行北京分行' },
    { id: 'U2', name: '李四', level: 'P5', isMain: false, passport: 'E87654321', bankAccount: '6217 0001 **** 1234', bankName: '建设银行上海分行' }
  ]);

  // 3. Trips
  const [trips, setTrips] = useState<Trip[]>([]);

  // 4. Expenses
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 1, source: 'personal', category: '住宿', type: '酒店', date: '2024-01-09', currency: 'USD', exchangeRate: 7.23, originalAmount: 220.00, cnyAmount: 1590.60, consumerId: 'U2', payeeId: 'U1', desc: '拉斯维加斯威尼斯人酒店 (李四房费)', policyStatus: 'ok', receipt: true, expenseItem: '境外差旅费' }
  ]);

  // Helper: Date difference
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    const diffTime = e.getTime() - s.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : (diffDays === 0 ? 1 : 0);
  };

  // Logic
  const handleSelectApplication = (appId: string) => {
    if (!appId) return;
    setIsSyncing(true);
    setTimeout(() => {
      const appData = MOCK_INTL_APPLICATIONS.find(app => app.id === appId);
      if (appData) {
        setBasicInfo(prev => ({ ...prev, requestId: appData.id, description: appData.title }));
        
        let newTravelers = travelers;
        if (appData.travelers && appData.travelers.length > 0) {
          setTravelers(appData.travelers);
          newTravelers = appData.travelers;
        }

        const enrichedTrips: Trip[] = appData.trips.map(t => {
          const loc = INTERNATIONAL_LOCATIONS.find(l => l.country === t.toCountry && l.city === t.toCity);
          return {
            ...t,
            mealRate: loc ? loc.mealRate : 50,
            miscRate: loc ? loc.miscRate : 35,
            isChartered: t.isChartered || false,
            travelerIds: newTravelers.map(u => u.id), // Default select all
            days: calculateDays(t.startDate, t.endDate), 
            businessMeals: t.businessMeals || 0 
          };
        });

        setTrips(enrichedTrips);
        
        setExpenses(prev => {
          const personalExpenses = prev.filter(e => e.source === 'personal');
          return [...personalExpenses, ...appData.corpExpenses.map(e => ({...e, expenseItem: '境外差旅费'}))];
        });
      }
      setIsSyncing(false);
    }, 600);
  };

  const updateTrip = (id: number, field: keyof Trip, value: any) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newTrip = { ...t, [field]: value };
      
      // Linked Date calculation
      if (['startDate', 'endDate'].includes(field)) {
        newTrip.days = calculateDays(newTrip.startDate, newTrip.endDate);
      }
      return newTrip;
    }));
  };

  const updateTripLocation = (id: number, type: 'from' | 'to', val: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== id) return t;
      
      // Attempt to split Country-City
      // If user clears input, value is empty.
      // If user just types City without dash, we assign it to City and clear Country (or assume user knows format)
      
      let country = '';
      let city = val;
      
      const parts = val.split('-');
      if (parts.length > 1) {
          country = parts[0].trim();
          city = parts.slice(1).join('-').trim();
      }

      if (type === 'from') {
        return { ...t, country, city };
      } else {
        return { ...t, toCountry: country, toCity: city };
      }
    }));
  };

  const updateTripStandards = (id: number, standards: { tier: string; mealRate: number; miscRate: number }) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== id) return t;
      return { ...t, areaTier: standards.tier, mealRate: standards.mealRate, miscRate: standards.miscRate };
    }));
  };

  const addTrip = () => {
    setTrips([...trips, { 
      id: Date.now(), 
      country: '', city: '', toCountry: '', toCity: '', 
      startDate: '', endDate: '',
      days: 1, 
      areaTier: 'Tier1', mealRate: 50, miscRate: 35, 
      isChartered: false,
      travelerIds: travelers.map(t => t.id),
      businessMeals: 0
    }]);
  };

  const removeTrip = (id: number) => setTrips(trips.filter(t => t.id !== id));

  // Traveler Logic
  const addTraveler = () => {
    const newId = `U${Date.now()}`;
    const newTraveler: Traveler = { id: newId, name: '新同行人', level: 'P5', isMain: false, passport: '', bankAccount: '', bankName: '' };
    setTravelers([...travelers, newTraveler]);
    // Auto add to trips
    setTrips(prev => prev.map(t => ({ ...t, travelerIds: [...(t.travelerIds || []), newId] })));
  };

  const removeTraveler = (id: string) => {
    if (travelers.length > 1) {
      setTravelers(travelers.filter(t => t.id !== id));
      // Remove from trips
      setTrips(prev => prev.map(t => ({ ...t, travelerIds: (t.travelerIds || []).filter(tid => tid !== id) })));
    }
  };

  const updateTraveler = (id: string, field: keyof Traveler, value: any) => {
    setTravelers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const updateExpense = (id: number, field: keyof Expense, value: any) => {
    setExpenses(prev => prev.map(e => {
      if (e.id !== id) return e;
      const newExp = { ...e, [field]: value };
      
      // Link category to item
      if (field === 'category') {
        const matchedItem = EXPENSE_ITEMS.find(item => item.defaultFor.includes(value));
        if (matchedItem) {
           newExp.expenseItem = matchedItem.name;
        } else {
           newExp.expenseItem = '境外差旅费'; // Default
        }
      }

      if (field === 'currency') {
        const rate = CURRENCIES.find(c => c.code === value)?.rate || 1;
        newExp.exchangeRate = rate;
        newExp.cnyAmount = Number((newExp.originalAmount * rate).toFixed(2));
      } else if (field === 'exchangeRate' || field === 'originalAmount') {
        const rate = field === 'exchangeRate' ? Number(value) : newExp.exchangeRate;
        const amount = field === 'originalAmount' ? Number(value) : newExp.originalAmount;
        newExp.cnyAmount = Number((amount * rate).toFixed(2));
      }
      return newExp;
    }));
  };

  const updateExpensePerson = (expId: number, field: keyof Expense, userId: string) => {
    setExpenses(prev => prev.map(e => {
      if (e.id !== expId) return e;
      const newExp = { ...e };
      // @ts-ignore - dynamic assignment for simplicty in this specific context
      newExp[field] = userId;
      if (!isAgentMode && field === 'consumerId') {
        newExp.payeeId = userId;
      }
      return newExp;
    }));
  };

  const setAllPayeeToMain = () => {
    const mainUser = travelers.find(t => t.isMain) || travelers[0];
    setExpenses(prev => prev.map(e => e.source === 'personal' ? { ...e, payeeId: mainUser.id } : e));
    setIsAgentMode(true);
  };

  const addExpense = () => {
    const mainUser = travelers.find(t => t.isMain) || travelers[0];
    const newExp: Expense = {
      id: Date.now(), source: 'personal', category: '餐饮', type: '个人工作餐', date: basicInfo.docDate,
      currency: 'USD', exchangeRate: 7.23, originalAmount: 0, cnyAmount: 0,
      consumerId: mainUser.id, payeeId: mainUser.id,
      desc: '', policyStatus: 'ok', receipt: false,
      expenseItem: '境外差旅费'
    };
    setExpenses([...expenses, newExp]);
  };

  // Calculations
  const totals = useMemo(() => {
    let allowanceTotalCNY = 0;
    const travelerAllowanceMap: Record<string, number> = {};
    travelers.forEach(t => travelerAllowanceMap[t.id] = 0);
    
    // 1. Allowance Calc
    const subsidyDetails = trips.map(t => {
      const meal = t.mealRate || 0;
      const misc = t.isChartered ? 0 : (t.miscRate || 0); 
      
      const mealDeductionPerMeal = meal / 3;
      const totalDeductionPerPerson = (t.businessMeals || 0) * mealDeductionPerMeal;
      
      const dailyPerPersonUSD = meal + misc;
      const totalPerPersonUSD = (dailyPerPersonUSD * (t.days || 0)) - totalDeductionPerPerson;
      
      const safeTotalPerPersonUSD = Math.max(0, totalPerPersonUSD);
      const safeTotalPerPersonCNY = safeTotalPerPersonUSD * 7.23; 
      
      const involvedTravelerIds = t.travelerIds || [];
      
      involvedTravelerIds.forEach(uid => {
        if (travelerAllowanceMap[uid] !== undefined) {
           travelerAllowanceMap[uid] += safeTotalPerPersonCNY;
        }
      });

      const count = involvedTravelerIds.length;
      const totalUSD = safeTotalPerPersonUSD * count;
      const totalCNY = totalUSD * 7.23;
      
      allowanceTotalCNY += totalCNY;
      
      return {
        ...t,
        effectiveMisc: misc,
        effectiveMeal: meal,
        dailyPerPersonUSD,
        deductionPerPerson: totalDeductionPerPerson,
        personCount: count, 
        totalUSD,
        totalCNY
      };
    });

    const settlementMap: Record<string, number> = {};
    travelers.forEach(t => settlementMap[t.id] = 0);
    
    // 2. Settlement: Personal Payments
    expenses.filter(e => e.source === 'personal').forEach(e => {
      settlementMap[e.payeeId] = (settlementMap[e.payeeId] || 0) + e.cnyAmount;
    });
    
    // 3. Settlement: Allowance
    Object.keys(travelerAllowanceMap).forEach(uid => {
       settlementMap[uid] = (settlementMap[uid] || 0) + travelerAllowanceMap[uid];
    });

    const personalCNY = expenses.filter(e => e.source === 'personal').reduce((s, e) => s + e.cnyAmount, 0);
    const corpCNY = expenses.filter(e => e.source === 'corp').reduce((s, e) => s + e.cnyAmount, 0);
    const grandTotal = personalCNY + corpCNY + allowanceTotalCNY;
    const payable = personalCNY + allowanceTotalCNY;

    return { personalCNY, corpCNY, allowanceTotalCNY, grandTotal, payable, settlementMap, subsidyDetails, travelerAllowanceMap };
  }, [expenses, trips, travelers]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-indigo-900 border-b border-indigo-800 shadow-md px-8 py-3 flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold border border-white/20"><Globe size={18}/></div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">境外差旅报销单</h1>
            <p className="text-[10px] text-indigo-300 font-medium font-mono opacity-80">{basicInfo.docNo}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] bg-indigo-800 px-3 py-1 rounded-full border border-indigo-700 flex items-center gap-2">
            <span className="opacity-60">汇率基准:</span>
            <span className="font-bold text-yellow-400">USD 7.23</span>
            <span className="font-bold text-yellow-400">EUR 7.85</span>
          </div>
          <button className="px-4 py-1.5 text-xs bg-indigo-600 text-white rounded-md font-bold shadow-lg hover:bg-indigo-500 transition-all flex items-center gap-1">
            <CheckCircle2 size={12}/> 提交审批
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">总成本</span>
              <div className="text-2xl font-black text-slate-800 mt-2">¥ {totals.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              <p className="text-[10px] text-slate-400 mt-1">含商旅 + 个人 + 补贴</p>
           </div>
           <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-amber-700 uppercase">境外补贴</span>
              <div className="text-2xl font-black text-amber-600 mt-2">¥ {totals.allowanceTotalCNY.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              <p className="text-[10px] text-amber-500/60 mt-1">含伙食与公杂 (已扣减招待)</p>
           </div>
           <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-blue-700 uppercase">商旅预付</span>
              <div className="text-2xl font-black text-blue-600 mt-2">¥ {totals.corpCNY.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              <p className="text-[10px] text-blue-500/60 mt-1">公司直接支付</p>
           </div>
           <div className="bg-indigo-600 rounded-xl p-4 border border-indigo-700 flex flex-col justify-between shadow-lg text-white">
              <span className="text-[10px] font-bold text-indigo-200 uppercase">应付个人</span>
              <div className="text-3xl font-black mt-2">¥ {totals.payable.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              <p className="text-[10px] text-indigo-300 mt-1">含补贴 + 个人垫付报销</p>
           </div>
        </div>

        {/* 1. Basic Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-500 flex items-center gap-2 uppercase tracking-wider">
            <FileText size={14} className="text-indigo-600"/> 单据基本信息
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">单据编号</label>
              <div className="border-b border-slate-100 py-1 text-sm font-bold text-slate-500 font-mono bg-slate-50 px-2 rounded-t">{basicInfo.docNo}</div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">单据日期</label>
              <input type="date" className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none" value={basicInfo.docDate} onChange={(e)=>setBasicInfo({...basicInfo, docDate: e.target.value})}/>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">报销人</label>
              <div className="flex gap-2">
                 <input className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none text-indigo-600" value={basicInfo.reimburser} onChange={(e)=>setBasicInfo({...basicInfo, reimburser:e.target.value})}/>
                 <input className="w-24 border-b border-slate-100 py-1 text-xs font-mono text-slate-400 bg-transparent outline-none" value={basicInfo.passportNo} placeholder="护照号" onChange={(e)=>setBasicInfo({...basicInfo, passportNo:e.target.value})}/>
               </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">关联申请</label>
              <div className="relative">
                <select className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none text-indigo-600 truncate pr-4" value={basicInfo.requestId} onChange={(e) => handleSelectApplication(e.target.value)}>
                  <option value="">选择申请单...</option>
                  {MOCK_INTL_APPLICATIONS.map(app => <option key={app.id} value={app.id}>{app.title}</option>)}
                </select>
                {isSyncing && <RefreshCw size={12} className="absolute right-0 top-1 animate-spin text-indigo-500"/>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">费用承担组织</label>
              <div className="flex items-center gap-2 border-b border-slate-100 py-1">
                <Building2 size={12} className="text-slate-400"/>
                <input className="text-sm font-bold bg-transparent outline-none w-full" value={basicInfo.costOrg} onChange={(e) => setBasicInfo({...basicInfo, costOrg: e.target.value})}/>
              </div>
            </div>
            
            <div className="space-y-1">
               <label className="text-[10px] text-slate-400 font-bold uppercase">费用承担部门</label>
               <div className="flex items-center gap-2 border-b border-slate-100 py-1">
                 <Users size={12} className="text-slate-400"/>
                 <input className="text-sm font-bold bg-transparent outline-none w-full" value={basicInfo.costDept} onChange={(e) => setBasicInfo({...basicInfo, costDept: e.target.value})}/>
               </div>
            </div>

            {/* Project Controls */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">是否项目关联</label>
              <div className="flex items-center gap-3 py-1.5">
                <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="isProject" checked={basicInfo.isProject} onChange={() => setBasicInfo({...basicInfo, isProject: true})} className="text-indigo-600"/><span className="text-xs font-bold">是</span></label>
                <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="isProject" checked={!basicInfo.isProject} onChange={() => setBasicInfo({...basicInfo, isProject: false, projectType: '非项目支出', projectCode: ''})} className="text-indigo-600"/><span className="text-xs font-bold text-slate-500">否</span></label>
              </div>
            </div>

            {basicInfo.isProject && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Layers size={10}/> 项目类型</label>
                  <select className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none cursor-pointer" value={basicInfo.projectType} onChange={(e) => setBasicInfo({...basicInfo, projectType: e.target.value})}>
                    <option value="科研项目">科研项目</option>
                    <option value="非科研项目">非科研项目</option>
                    <option value="非项目支出">非项目支出</option>
                  </select>
                </div>
                {basicInfo.projectType !== '非项目支出' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Coins size={10}/> 资金来源</label>
                      <select className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none cursor-pointer" value={basicInfo.fundSource} onChange={(e) => setBasicInfo({...basicInfo, fundSource: e.target.value})}>
                        <option value="专项资金">专项资金</option>
                        <option value="部门预算">部门预算</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">选择关联项目</label>
                      <ProjectPicker value={basicInfo.projectCode} onChange={(val) => setBasicInfo({...basicInfo, projectCode: val})} placeholder="输入编号或名称..." />
                    </div>
                  </>
                )}
              </>
            )}

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase">报销说明</label>
              <input className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none focus:border-indigo-500 transition-colors" value={basicInfo.description} onChange={(e)=>setBasicInfo({...basicInfo, description:e.target.value})} placeholder="请输入详细的出差事由..."/>
            </div>
          </div>
        </div>

        {/* 2. Travelers Management */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-500 flex justify-between items-center uppercase tracking-wider">
            <div className="flex items-center gap-2"><Users size={14} className="text-indigo-600"/> 出行人员</div>
            <button onClick={addTraveler} className="flex items-center gap-1 text-[10px] text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors border border-transparent hover:border-indigo-100">
              <Plus size={10}/> 添加人员
            </button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {travelers.map((t, idx) => (
                <div key={t.id} className={`flex flex-col gap-2 p-3 border rounded-lg relative ${t.isMain ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-slate-100'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${t.isMain ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {t.isMain ? '主' : idx + 1}
                      </div>
                      <input className={`font-bold text-sm bg-transparent outline-none w-full ${t.isMain ? 'text-indigo-700' : 'text-slate-700'}`} value={t.name} onChange={(e) => updateTraveler(t.id, 'name', e.target.value)} placeholder="姓名"/>
                    </div>
                    {!t.isMain && <X size={14} className="text-slate-300 hover:text-red-500 cursor-pointer shrink-0" onClick={() => removeTraveler(t.id)}/>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="space-y-0.5"><label className="text-slate-400">职级</label><input className="w-full bg-transparent border-b border-dashed border-slate-300 outline-none font-medium" value={t.level} onChange={(e) => updateTraveler(t.id, 'level', e.target.value)} placeholder="M2/P5"/></div>
                    <div className="space-y-0.5"><label className="text-slate-400">护照号</label><input className="w-full bg-transparent border-b border-dashed border-slate-300 outline-none font-medium" value={t.passport} onChange={(e) => updateTraveler(t.id, 'passport', e.target.value)} placeholder="必填"/></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Intl Trip & Allowance Calculator */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
           <div className="px-6 py-2 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between text-indigo-800 font-bold text-xs min-w-[1100px]">
             <div className="flex items-center gap-2"><Calculator size={14}/> 国际行程与补贴计算器</div>
             <div className="flex items-center gap-1 text-[10px] font-normal opacity-70"><Info size={12}/><span>小计 = (天数 × 补贴标准) - 业务招待扣减</span></div>
           </div>
           
           <div className="p-0 min-w-[1100px]">
             <div className="grid grid-cols-[40px_1.5fr_140px_140px_50px_90px_60px_80px_160px_100px] bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase text-center">
               <div className="p-2 border-r border-slate-100 flex items-center justify-center">#</div>
               <div className="p-2 text-left pl-4 border-r border-slate-100 flex items-center">行程</div>
               <div className="p-2 border-r border-slate-100 flex items-center justify-center">开始日期</div>
               <div className="p-2 border-r border-slate-100 flex items-center justify-center">结束日期</div>
               <div className="p-2 border-r border-slate-100 flex items-center justify-center">天数</div>
               <div className="p-2 border-r border-slate-100 flex items-center justify-center">标准</div>
               <div className="p-2 border-r border-slate-100 flex items-center justify-center">包车</div>
               <div className="p-2 border-r border-slate-100 flex flex-col justify-center text-indigo-500"><span>业务招待</span><span className="text-[8px] opacity-60">扣减餐补</span></div>
               <div className="p-2 border-r border-slate-100 flex items-center justify-center">出行人员</div>
               <div className="p-2 flex items-center justify-end pr-4">小计 (CNY)</div>
             </div>

             {trips.map((trip, idx) => {
               const currentDetail = totals.subsidyDetails[idx];
               return (
                <div key={trip.id} className="grid grid-cols-[40px_1.5fr_140px_140px_50px_90px_60px_80px_160px_100px] border-b border-slate-50 text-xs hover:bg-slate-50/50 transition-colors min-h-[3.5rem]">
                  <div className="border-r border-slate-50/50 flex items-center justify-center font-black text-slate-300">
                    <div className="group relative"><span>#{idx+1}</span><Trash2 size={12} className="absolute -top-1 -right-3 text-slate-200 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100" onClick={() => removeTrip(trip.id)}/></div>
                  </div>
                  <div className="px-4 border-r border-slate-50/50 flex flex-col justify-center">
                    <div className="flex items-center gap-1 mb-1">
                      <LocationPicker 
                        value={[trip.country, trip.city].filter(Boolean).join('-')} 
                        placeholder="出发地" 
                        onChange={(val) => updateTripLocation(trip.id, 'from', val)} 
                      />
                      <ArrowRight size={10} className="text-slate-300"/>
                      <LocationPicker 
                        value={[trip.toCountry, trip.toCity].filter(Boolean).join('-')} 
                        placeholder="目的地" 
                        onChange={(val) => updateTripLocation(trip.id, 'to', val)} 
                        autoStandardsCallback={(stds) => updateTripStandards(trip.id, stds)}
                      />
                    </div>
                  </div>
                  <div className="px-2 border-r border-slate-50/50 flex items-center"><input type="date" className="w-full bg-transparent text-[10px] border border-slate-200 rounded px-1 outline-none focus:border-indigo-400" value={trip.startDate} onChange={(e) => updateTrip(trip.id, 'startDate', e.target.value)}/></div>
                  <div className="px-2 border-r border-slate-50/50 flex items-center"><input type="date" className="w-full bg-transparent text-[10px] border border-slate-200 rounded px-1 outline-none focus:border-indigo-400" value={trip.endDate} onChange={(e) => updateTrip(trip.id, 'endDate', e.target.value)}/></div>
                  <div className="border-r border-slate-50/50 flex items-center justify-center font-bold text-slate-700">{trip.days}</div>
                  <div className="border-r border-slate-50/50 flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded" title="伙食"><Utensils size={10}/> ${trip.mealRate}</div>
                    <div className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition-all ${trip.isChartered ? 'text-slate-300 line-through bg-slate-50' : 'text-slate-500 bg-slate-100'}`} title="公杂"><Coffee size={10}/> ${trip.miscRate}</div>
                  </div>
                  <div className="border-r border-slate-50/50 flex items-center justify-center">
                    <div className={`cursor-pointer flex items-center justify-center w-6 h-6 rounded border transition-all ${trip.isChartered ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-slate-50 border-slate-200 text-slate-400 grayscale'}`} onClick={() => updateTrip(trip.id, 'isChartered', !trip.isChartered)} title="切换包车状态"><Car size={12}/></div>
                  </div>
                  <div className="border-r border-slate-50/50 flex items-center justify-center bg-indigo-50/10">
                    <div className="relative w-12">
                      <input type="number" min="0" className={`w-full text-center text-[10px] border rounded py-0.5 outline-none focus:border-indigo-400 font-bold ${trip.businessMeals > 0 ? 'text-indigo-600 border-indigo-200 bg-white' : 'text-slate-400 border-transparent bg-transparent'}`} value={trip.businessMeals} onChange={(e) => updateTrip(trip.id, 'businessMeals', Number(e.target.value))} placeholder="0"/>
                      {trip.businessMeals > 0 && <Wine size={8} className="absolute top-1 right-1 text-indigo-400 pointer-events-none"/>}
                    </div>
                  </div>
                  <div className="px-2 border-r border-slate-50/50 flex items-center"><MultiSelectTraveler allTravelers={travelers} selectedIds={trip.travelerIds || []} onChange={(newIds) => updateTrip(trip.id, 'travelerIds', newIds)}/></div>
                  <div className="flex flex-col items-end justify-center pr-4 font-bold text-amber-600">
                    <div>¥ {currentDetail?.totalCNY?.toFixed(0)}</div>
                    {currentDetail?.deductionPerPerson > 0 && <div className="text-[8px] text-red-400 font-normal flex items-center gap-0.5"><span className="text-xs">-</span> ${(currentDetail.deductionPerPerson * currentDetail.personCount).toFixed(0)} (餐补扣减)</div>}
                  </div>
                </div>
             )})}
             {trips.length === 0 && <div className="text-center text-xs text-slate-400 py-6">请关联申请单或手动添加行程</div>}
             <div className="p-3 bg-slate-50/50 border-b border-slate-100"><button onClick={addTrip} className="w-full py-1 text-[10px] border border-dashed border-slate-300 text-slate-400 rounded hover:text-indigo-500 hover:border-indigo-300 transition-colors">+ 手动增加行程</button></div>
             {trips.length > 0 && <div className="bg-amber-50/50 p-3 flex justify-between items-center border-t border-amber-100"><div className="flex items-center gap-2 text-[10px] text-amber-700 font-bold"><Zap size={12}/>补贴金额已自动带入结算总额</div><div className="text-right"><div className="text-sm font-black text-amber-600">补贴合计: ¥ {totals.allowanceTotalCNY.toLocaleString(undefined, {minimumFractionDigits: 2})}</div></div></div>}
           </div>
        </div>

        {/* 4. Multi-currency Expenses */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-2 font-bold text-xs text-slate-600"><Wallet size={14}/> 费用明细</div>
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setIsAgentMode(!isAgentMode)}>
                  {isAgentMode ? <ToggleRight size={20} className="text-indigo-600"/> : <ToggleLeft size={20} className="text-slate-300"/>}
                  <span className={`text-[10px] font-bold ${isAgentMode ? 'text-indigo-600' : 'text-slate-400'}`}>启用代垫模式</span>
                </div>
                {isAgentMode && (
                  <button onClick={setAllPayeeToMain} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 font-bold hover:bg-indigo-100 flex items-center gap-1 transition-colors">
                    <ArrowLeftRight size={10}/> 领队统一垫付
                  </button>
                )}
                <button onClick={addExpense} className="flex items-center gap-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded transition-colors shadow-sm ml-2"><Plus size={12}/> 新增费用</button>
             </div>
          </div>
          
          {/* 4.1 Personal Expenses List */}
          <div className="bg-slate-50/50">
            <div className="px-4 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50/30 border-b border-indigo-50 flex items-center gap-2">
              <UserCheck size={12}/> 个人垫付与补贴
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="p-3 w-20">类别</th>
                  <th className="p-3 w-24 text-indigo-600">费用项目</th>
                  <th className="p-3">摘要</th>
                  <th className="p-3 w-32">
                    <div className="flex flex-col">
                      <span className={isAgentMode ? 'text-indigo-600' : ''}>{isAgentMode ? '实际消费人' : '费用归属/垫付人'}</span>
                      {isAgentMode && <span className="text-[9px] font-normal opacity-60">谁花的</span>}
                    </div>
                  </th>
                  {isAgentMode && (
                    <th className="p-3 w-32 bg-indigo-50/20 text-indigo-700">
                      <div className="flex flex-col">
                        <span>实际垫付人</span>
                        <span className="text-[9px] font-normal opacity-60">钱退给谁</span>
                      </div>
                    </th>
                  )}
                  <th className="p-3 w-24">原币种</th>
                  <th className="p-3 w-28 text-right">原币金额</th>
                  <th className="p-3 w-20 text-right">汇率</th>
                  <th className="p-3 w-28 text-right text-indigo-700 bg-indigo-50/20">折合人民币</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expenses.filter(e => e.source === 'personal').map(exp => (
                  <tr key={exp.id} className="group hover:bg-slate-50">
                    <td className="p-3">
                      <select className="bg-transparent font-bold outline-none cursor-pointer" value={exp.category} onChange={(e)=>updateExpense(exp.id, 'category', e.target.value)}>
                        <option>交通</option><option>住宿</option><option>餐饮</option><option>公杂</option><option>签证费</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <select className="bg-white border border-indigo-100 rounded px-1 py-0.5 font-bold text-indigo-600 outline-none text-[10px] cursor-pointer w-full" value={exp.expenseItem} onChange={(e)=>updateExpense(exp.id, 'expenseItem', e.target.value)}>
                        {EXPENSE_ITEMS.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                      </select>
                    </td>
                    <td className="p-3"><input className="w-full bg-transparent outline-none text-slate-600" value={exp.desc} placeholder="费用说明" onChange={(e)=>updateExpense(exp.id, 'desc', e.target.value)}/></td>
                    <td className="p-3">
                      <select className="bg-white border border-slate-200 rounded px-1 py-0.5 font-bold text-slate-700 outline-none text-[10px] cursor-pointer w-full" value={exp.consumerId} onChange={(e) => updateExpensePerson(exp.id, 'consumerId', e.target.value)}>
                        {travelers.map(t => <option key={t.id} value={t.id}>{t.name} {t.isMain ? '(主)' : ''}</option>)}
                      </select>
                    </td>
                    {isAgentMode && (
                      <td className="p-3 bg-indigo-50/10">
                        <select className="bg-indigo-50 border border-indigo-200 rounded px-1 py-0.5 font-bold text-indigo-700 outline-none text-[10px] cursor-pointer w-full" value={exp.payeeId} onChange={(e) => updateExpensePerson(exp.id, 'payeeId', e.target.value)}>
                          {travelers.map(t => <option key={t.id} value={t.id}>{t.name} {t.isMain ? '(主)' : ''}</option>)}
                        </select>
                      </td>
                    )}
                    <td className="p-3"><CurrencySelect value={exp.currency} onChange={(val)=>updateExpense(exp.id, 'currency', val)}/></td>
                    <td className="p-3 text-right"><input type="number" className="w-full text-right bg-transparent outline-none font-bold text-slate-700" value={exp.originalAmount} onChange={(e)=>updateExpense(exp.id, 'originalAmount', e.target.value)}/></td>
                    <td className="p-3 text-right"><input type="number" className="w-full text-right bg-transparent outline-none text-slate-400 text-[10px]" value={exp.exchangeRate} onChange={(e)=>updateExpense(exp.id, 'exchangeRate', e.target.value)}/></td>
                    <td className="p-3 text-right font-bold text-indigo-700 bg-indigo-50/20">¥ {exp.cnyAmount.toFixed(2)}</td>
                    <td className="p-3 text-center"><Trash2 size={12} className="text-slate-300 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100" onClick={()=>{setExpenses(expenses.filter(e=>e.id!==exp.id))}}/></td>
                  </tr>
                ))}
                
                {/* Allowance Rows */}
                {travelers.map(t => {
                  const personAllowance = totals.travelerAllowanceMap[t.id];
                  if (!personAllowance || personAllowance <= 0) return null;
                  return (
                    <tr key={`allowance-${t.id}`} className="bg-amber-50/40 border-t border-amber-100">
                      <td className="p-3 text-center"><Zap size={14} className="text-amber-500 mx-auto" fill="currentColor"/></td>
                      <td className="p-3 text-amber-700 font-bold text-[10px]">境外差旅费</td>
                      <td className="p-3 text-amber-700 font-bold italic" colSpan={isAgentMode ? 1 : 1}>
                        <div className="flex flex-col">
                          <span>境外差旅补贴 (公杂+伙食包干) - {t.name}</span>
                          <span className="text-[9px] font-normal opacity-70">系统自动计算: (日补贴 × 天数) - 招待扣减</span>
                        </div>
                      </td>
                      {isAgentMode && <td className="p-3 bg-amber-50/20 text-[10px] text-amber-600 font-medium">归集给 {t.name}</td>}
                      <td className="p-3 text-amber-700 font-bold text-[10px] align-middle">{t.name} {t.isMain ? '(主)' : ''}</td>
                      <td className="p-3 text-right text-slate-300 font-mono text-[10px] bg-slate-50/30">USD</td>
                      <td className="p-3 text-right text-amber-600 font-bold text-[10px]">${(personAllowance / 7.23).toFixed(2)}</td>
                      <td className="p-3 text-right text-slate-400 font-bold text-[10px]">7.23</td>
                      <td className="p-3 text-right font-black text-amber-700 bg-indigo-50/10">¥ {personAllowance.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4.2 Corporate Expenses */}
          <div className="mt-4 border-t border-dashed border-slate-200">
            <div className="px-4 py-1 text-[10px] font-bold text-slate-500 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2"><Building2 size={12}/> 公司统付（商旅平台预订）</div>
              <div className="text-[9px] text-slate-400">此类费用公司直接结算，不计入个人报销</div>
            </div>
            {expenses.filter(e => e.source === 'corp').length > 0 ? (
              <table className="w-full text-left text-xs text-slate-500">
                <tbody className="divide-y divide-slate-50">
                  {expenses.filter(e => e.source === 'corp').map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="p-3 w-20 text-center"><CheckCircle2 size={14} className="text-green-500 mx-auto"/></td>
                      <td className="p-3 font-bold text-indigo-600">{exp.expenseItem || '境外差旅费'}</td>
                      <td className="p-3 font-bold">{exp.category}</td>
                      <td className="p-3 w-1/3">{exp.desc}</td>
                      <td className="p-3 w-32">
                        <div className="flex items-center gap-1"><User size={10}/> {travelers.find(t => t.id === exp.consumerId)?.name || '未知'}</div>
                      </td>
                      <td className="p-3 text-right font-mono text-[10px] opacity-70">{exp.currency} {exp.originalAmount}</td>
                      <td className="p-3 text-right font-bold text-slate-700">¥ {exp.cnyAmount.toFixed(2)}</td>
                      <td className="p-3 w-10"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-[10px] text-slate-300 py-3">无关联的商旅订单</div>
            )}
          </div>
        </div>

        {/* 5. Settlement Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 font-bold text-[10px] text-slate-500 flex justify-between items-center uppercase tracking-widest">
            <div className="flex items-center gap-2"><Landmark size={14} className="text-indigo-600"/> 资金结算信息</div>
            <div className="flex items-center gap-1 text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100"><Zap size={10} fill="currentColor"/> 银行信息已校验</div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 gap-3">
              {travelers.filter(t => (totals.settlementMap[t.id] || 0) > 0).map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 shadow-sm">{t.name[0]}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700">{t.name}</span>
                        <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">收款人</span>
                        {t.isMain && <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold">主申请人</span>}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5 font-mono"><span className="flex items-center gap-1"><CreditCard size={10}/> {t.bankAccount || '待录入'}</span><span className="flex items-center gap-1"><Building2 size={10}/> {t.bankName || '待录入'}</span></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-indigo-600 italic">¥ {totals.settlementMap[t.id]?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="text-[9px] text-slate-400 font-bold">实付金额 (CNY)</div>
                  </div>
                </div>
              ))}
            </div>
            {isAgentMode && (
              <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-1">
                <Info size={12}/> 注意：已开启代垫模式，资金将直接打款给上述“实际垫付人”，而非“费用消费人”。
              </div>
            )}
          </div>
        </div>

        {/* 6. Approval Flow */}
        <div className="pt-4 border-t border-slate-200 mb-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Briefcase size={12}/> 预计审批流程</p>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex flex-col items-center gap-1 opacity-50"><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">张</div><span className="text-[9px] font-bold text-slate-400">发起人</span></div>
            <div className="h-0.5 w-8 bg-slate-200"></div>
            <div className="flex flex-col items-center gap-1"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 border border-blue-200">Bill</div><span className="text-[9px] font-bold text-slate-600">海外经理</span></div>
            <div className="h-0.5 w-8 bg-slate-200"></div>
            <div className="flex flex-col items-center gap-1 opacity-50"><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">财</div><span className="text-[9px] font-bold text-slate-400">财务复核</span></div>
            <div className="h-0.5 w-8 bg-slate-200"></div>
            <div className="flex flex-col items-center gap-1 opacity-50"><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">VP</div><span className="text-[9px] font-bold text-slate-400">分管副总</span></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;