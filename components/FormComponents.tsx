import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { Traveler } from '../types';
import { MOCK_PROJECTS, CURRENCIES, INTERNATIONAL_LOCATIONS } from '../constants';

// --- SingleSelectTraveler ---
interface SingleSelectTravelerProps {
  allTravelers: Traveler[];
  selectedId: string;
  onChange: (id: string) => void;
}

export const SingleSelectTraveler: React.FC<SingleSelectTravelerProps> = ({ allTravelers, selectedId, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = allTravelers.find(t => t.id === selectedId);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="flex items-center justify-between w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] cursor-pointer hover:border-indigo-300 transition-colors h-7"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate font-bold ${selected ? 'text-indigo-600' : 'text-slate-400'}`}>
          {selected ? selected.name : '请选择'}
        </span>
        <ChevronDown size={10} className="text-slate-400 shrink-0 ml-1"/>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-50 p-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-40 overflow-y-auto space-y-1">
            {allTravelers.map(t => (
              <div 
                key={t.id} 
                className={`px-2 py-1.5 rounded cursor-pointer text-[10px] transition-colors ${selectedId === t.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                onClick={() => { onChange(t.id); setIsOpen(false); }}
              >
                {t.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MultiSelectTraveler ---
interface MultiSelectTravelerProps {
  allTravelers: Traveler[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabledId?: string; // Hide this person from fellow list
}

export const MultiSelectTraveler: React.FC<MultiSelectTravelerProps> = ({ allTravelers, selectedIds, onChange, disabledId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTravelers = allTravelers.filter(t => 
    t.id !== disabledId && t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(sid => sid !== id)
      : [...selectedIds, id];
    onChange(newSelection);
  };

  const getDisplayText = () => {
    if (!selectedIds || selectedIds.length === 0) return '无同行人';
    const names = allTravelers.filter(t => selectedIds.includes(t.id)).map(t => t.name);
    return names.join(', ');
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="flex items-center justify-between w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] cursor-pointer hover:border-indigo-300 transition-colors h-7"
        onClick={() => setIsOpen(!isOpen)}
        title={getDisplayText()}
      >
        <span className={`truncate font-bold ${selectedIds.length > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
          {getDisplayText()}
        </span>
        <ChevronDown size={10} className="text-slate-400 shrink-0 ml-1"/>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-100 z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center gap-1 border-b border-slate-100 pb-1 mb-1">
            <Search size={10} className="text-slate-400"/>
            <input 
              className="w-full text-[10px] outline-none"
              placeholder="搜索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {filteredTravelers.map(t => {
              const isSelected = selectedIds.includes(t.id);
              return (
                <div 
                  key={t.id} 
                  className={`px-2 py-1.5 rounded cursor-pointer text-[10px] flex items-center justify-between group transition-colors ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                  onClick={() => toggleSelection(t.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 bg-white'}`}>
                      {isSelected && <Check size={8} className="text-white"/>}
                    </div>
                    <span className="truncate">{t.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- ProjectPicker ---
interface ProjectPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ProjectPicker: React.FC<ProjectPickerProps> = ({ value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!isOpen) setSearchTerm(value || ''); }, [value, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredProjects = MOCK_PROJECTS.filter(p => p.code.toLowerCase().includes(searchTerm.toLowerCase()) || p.name.includes(searchTerm));

  const handleSelect = (project: { code: string; name: string }) => {
    const displayValue = `${project.code} (${project.name})`;
    setSearchTerm(displayValue);
    onChange(displayValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="flex items-center gap-2 border-b border-slate-100 py-1 hover:border-indigo-300 transition-colors group">
        <Search size={12} className="text-slate-400 group-hover:text-indigo-500"/>
        <input 
          className="text-sm font-bold bg-transparent outline-none w-full text-indigo-700 placeholder:text-slate-300" 
          value={searchTerm} 
          onChange={(e) => { setSearchTerm(e.target.value); onChange(e.target.value); setIsOpen(true); }} 
          onFocus={() => setIsOpen(true)} 
          placeholder={placeholder}
        />
        {searchTerm && <X size={12} className="text-slate-300 hover:text-slate-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); setSearchTerm(''); onChange(''); }}/>}
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-xl border border-slate-100 z-50 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {filteredProjects.length > 0 ? (
            filteredProjects.map(p => (
              <div key={p.code} className="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0" onClick={() => handleSelect(p)}>
                <div className="text-xs font-bold text-indigo-700">{p.code}</div>
                <div className="text-[10px] text-slate-500">{p.name}</div>
              </div>
            ))
          ) : (
            <div className="px-3 py-3 text-[10px] text-slate-400 text-center">无匹配项目</div>
          )}
        </div>
      )}
    </div>
  );
};

// --- LocationPicker ---
interface LocationPickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  autoStandardsCallback?: (standards: { tier: string; mealRate: number; miscRate: number }) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange, placeholder, autoStandardsCallback }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSearchTerm(value || ''); }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filtered = INTERNATIONAL_LOCATIONS.filter(l => 
    l.city.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val);
    setIsOpen(true);
    if (autoStandardsCallback) {
        const match = INTERNATIONAL_LOCATIONS.find(l => `${l.country}-${l.city}` === val);
        if (match) autoStandardsCallback({ tier: match.tier, mealRate: match.mealRate, miscRate: match.miscRate });
    }
  };

  const handleSelect = (loc: typeof INTERNATIONAL_LOCATIONS[0]) => {
    const val = `${loc.country}-${loc.city}`;
    setSearchTerm(val);
    onChange(val);
    if (autoStandardsCallback) autoStandardsCallback({ tier: loc.tier, mealRate: loc.mealRate, miscRate: loc.miscRate });
    setIsOpen(false);
  };

  return (
    <div className="relative w-24" ref={wrapperRef}>
      <input 
        className="w-full bg-transparent border-b border-slate-300 pb-1 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 placeholder:text-slate-300 transition-colors" 
        placeholder={placeholder} 
        value={searchTerm} 
        onChange={handleInputChange} 
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-2 max-h-48 overflow-y-auto">
           {filtered.length > 0 ? filtered.map((loc, i) => (
             <div key={i} onClick={() => handleSelect(loc)} className="px-3 py-2 hover:bg-indigo-50 cursor-pointer rounded text-xs flex justify-between">
               <span className="font-bold text-slate-700">{loc.country} - {loc.city}</span>
               <div className="flex gap-1"><span className="text-[9px] text-slate-400 bg-slate-100 px-1 rounded">餐 ${loc.mealRate}</span><span className="text-[9px] text-slate-400 bg-slate-100 px-1 rounded">杂 ${loc.miscRate}</span></div>
             </div>
           )) : <div className="p-2 text-xs text-slate-400 text-center">无匹配，请手动输入</div>}
        </div>
      )}
    </div>
  );
};

// --- CurrencySelect ---
interface CurrencySelectProps {
  value: string;
  onChange: (val: string) => void;
}

export const CurrencySelect: React.FC<CurrencySelectProps> = ({ value, onChange }) => (
  <select className="bg-transparent font-bold text-xs outline-none cursor-pointer text-indigo-700 w-16" value={value} onChange={(e) => onChange(e.target.value)}>
    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
  </select>
);