import { Currency, ExpenseItem, IntlApplication, LocationInfo, Project } from './types';

// --- Mock Data: International Applications Pool ---
export const MOCK_INTL_APPLICATIONS: IntlApplication[] = [
  {
    id: 'TRIP-INT-2024-US001',
    title: '1月CES展会及北美客户拜访',
    date: '2024-01-02',
    travelers: [
      { id: 'U1', name: '张三', level: 'M2', isMain: true, passport: 'E12345678', bankAccount: '6222 0210 **** 8888', bankName: '招商银行北京分行' },
      { id: 'U2', name: '李四', level: 'P5', isMain: false, passport: 'E87654321', bankAccount: '6217 0001 **** 1234', bankName: '建设银行上海分行' }
    ],
    trips: [
      { id: 101, country: '中国', city: '北京', toCountry: '美国', toCity: '拉斯维加斯', startDate: '2024-01-08', endDate: '2024-01-12', days: 4, areaTier: 'Tier1', mealRate: 50, miscRate: 35, isChartered: false, travelerIds: ['U1', 'U2'], businessMeals: 0 },
      { id: 102, country: '美国', city: '拉斯维加斯', toCountry: '美国', toCity: '旧金山', startDate: '2024-01-12', endDate: '2024-01-15', days: 3, areaTier: 'Tier1', mealRate: 50, miscRate: 35, isChartered: true, travelerIds: ['U1', 'U2'], businessMeals: 2 }
    ],
    corpExpenses: [
      { id: 201, source: 'corp', category: '交通', type: '国际机票', date: '2024-01-08', currency: 'CNY', exchangeRate: 1.0, originalAmount: 12500.00, cnyAmount: 12500.00, taxRate: 0, taxAmount: 0, consumerId: 'U1', payeeId: 'CORP', desc: '北京-拉斯维加斯 (UA889) 商旅预订', policyStatus: 'ok', receipt: true },
      { id: 202, source: 'corp', category: '住宿', type: '酒店', date: '2024-01-08', currency: 'USD', exchangeRate: 7.23, originalAmount: 800.00, cnyAmount: 5784.00, taxRate: 0, taxAmount: 0, consumerId: 'U1', payeeId: 'CORP', desc: '拉斯维加斯酒店 (商旅预付)', policyStatus: 'ok', receipt: true },
    ]
  },
  {
    id: 'TRIP-INT-2024-EU002',
    title: '2月欧洲研发中心调研',
    date: '2024-02-15',
    travelers: [
      { id: 'U3', name: '王五', level: 'M3', isMain: true, passport: 'E99988877', bankAccount: '6222 0000 **** 6666', bankName: '工商银行深圳分行' },
      { id: 'U4', name: '赵六', level: 'P6', isMain: false, passport: 'E55544433', bankAccount: '6217 1111 **** 2222', bankName: '中国银行上海分行' },
      { id: 'U5', name: '孙七', level: 'P5', isMain: false, passport: 'E11122233', bankAccount: '6227 0033 **** 1122', bankName: '建设银行北京分行' }
    ],
    trips: [
      { id: 103, country: '中国', city: '上海', toCountry: '德国', toCity: '法兰克福', startDate: '2024-02-20', endDate: '2024-02-21', days: 1, areaTier: 'Tier2', mealRate: 45, miscRate: 25, isChartered: false, travelerIds: ['U3', 'U4', 'U5'], businessMeals: 0 },
      { id: 104, country: '德国', city: '法兰克福', toCountry: '法国', toCity: '巴黎', startDate: '2024-02-21', endDate: '2024-02-25', days: 4, areaTier: 'Tier1', mealRate: 50, miscRate: 35, isChartered: false, travelerIds: ['U3', 'U4', 'U5'], businessMeals: 0 }
    ],
    corpExpenses: []
  }
];

// --- Mock Projects / Data Dictionaries ---
export const MOCK_PROJECTS: Project[] = [
  { code: 'GLOBAL-2024-EX-001', name: '海外市场拓展专项' },
  { code: 'RD-2024-EU-LAB-002', name: '欧洲实验室共建项目' },
  { code: 'MKT-2024-CES-003', name: 'CES展会专项预算' },
  { code: 'OP-2024-INT-004', name: '海外派驻人员管理' },
];

export const CURRENCIES: Currency[] = [
  { code: 'CNY', name: '人民币', symbol: '¥', rate: 1.00 },
  { code: 'USD', name: '美元', symbol: '$', rate: 7.23 },
  { code: 'EUR', name: '欧元', symbol: '€', rate: 7.85 },
  { code: 'GBP', name: '英镑', symbol: '£', rate: 9.12 },
  { code: 'JPY', name: '日元', symbol: '¥', rate: 0.048 },
  { code: 'HKD', name: '港币', symbol: '$', rate: 0.92 },
  { code: 'SGD', name: '新加坡元', symbol: 'S$', rate: 5.35 }
];

export const EXPENSE_ITEMS: ExpenseItem[] = [
  { id: 'TRAVEL', name: '境外差旅费', defaultFor: ['交通', '住宿', '公杂', '签证费'] },
  { id: 'ENTERTAINMENT', name: '业务招待费', defaultFor: ['餐饮', '招待'] },
  { id: 'MEETING', name: '会议费', defaultFor: ['会务'] },
  { id: 'TRAINING', name: '培训费', defaultFor: ['培训'] },
  { id: 'COMMUNICATION', name: '通讯费', defaultFor: ['通讯', '网络'] },
  { id: 'MARKETING', name: '市场推广费', defaultFor: ['广告', '宣传'] },
  { id: 'WELFARE', name: '福利费', defaultFor: [] },
  { id: 'OFFICE', name: '办公费', defaultFor: ['办公用品'] },
  { id: 'OTHER', name: '其他', defaultFor: [] },
];

export const INTERNATIONAL_LOCATIONS: LocationInfo[] = [
  { country: '美国', city: '纽约', tier: 'Tier1', mealRate: 50, miscRate: 35 },
  { country: '美国', city: '旧金山', tier: 'Tier1', mealRate: 50, miscRate: 35 },
  { country: '美国', city: '拉斯维加斯', tier: 'Tier1', mealRate: 50, miscRate: 35 },
  { country: '英国', city: '伦敦', tier: 'Tier1', mealRate: 50, miscRate: 35 },
  { country: '法国', city: '巴黎', tier: 'Tier1', mealRate: 50, miscRate: 35 },
  { country: '日本', city: '东京', tier: 'Tier1', mealRate: 55, miscRate: 30 },
  { country: '巴西', city: '里约热内卢', tier: 'Tier2', mealRate: 30, miscRate: 45 }, 
  { country: '德国', city: '柏林', tier: 'Tier2', mealRate: 45, miscRate: 25 },
  { country: '德国', city: '法兰克福', tier: 'Tier2', mealRate: 45, miscRate: 25 },
  { country: '泰国', city: '曼谷', tier: 'Tier3', mealRate: 30, miscRate: 15 },
  { country: '越南', city: '河内', tier: 'Tier3', mealRate: 30, miscRate: 15 },
];