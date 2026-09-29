import type { EntityName } from './types';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'percent'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'tags'
  | 'email'
  | 'phone'
  | 'url'
  | 'ref'
  | 'refmulti'
  | 'boolean'
  | 'sublist';

export interface SubField {
  key: string;
  en: string;
  zh: string;
  type: FieldType;
  options?: string[];
  ref?: EntityName;
  width?: string;
}

export interface FieldDef {
  key: string;
  en: string;
  zh: string;
  type: FieldType;
  options?: string[];
  ref?: EntityName;
  sub?: SubField[];
  /** hide from the default table column set */
  hideInTable?: boolean;
  /** never render in auto form (handled by custom UI) */
  custom?: boolean;
  half?: boolean;
  placeholder?: string;
  required?: boolean;
  /** width hint for table */
  w?: string;
  /** render as link */
  link?: boolean;
}

export interface EntityDef {
  name: EntityName;
  en: string;
  zh: string;
  enPlural?: string;
  zhPlural?: string;
  icon: string;
  /** primary display field */
  titleKey: string;
  /** secondary display field */
  subtitleKey?: string;
  statusKey?: string;
  fields: FieldDef[];
  /** columns shown in table by default (keys) */
  columns: string[];
  /** kanban grouping field */
  kanbanKey?: string;
  searchKeys: string[];
}

const staffRef: FieldDef = { key: 'x', en: '', zh: '', type: 'ref', ref: 'staff' };

/* ---------------------------------- Staff --------------------------------- */
export const STAFF: EntityDef = {
  name: 'staff',
  en: 'Staff',
  zh: '人员管理',
  icon: 'Users',
  titleKey: 'name',
  subtitleKey: 'role',
  statusKey: 'status',
  kanbanKey: 'department',
  searchKeys: ['name', 'role', 'department', 'email'],
  fields: [
    { key: 'name', en: 'Name', zh: '姓名', type: 'text', required: true },
    {
      key: 'role',
      en: 'Position / Role',
      zh: '职位 / 角色',
      type: 'select',
      required: true,
      options: [
        'Managing Director',
        'Account Manager',
        'Creative Director',
        'Content Strategist',
        'Copywriter',
        'Photographer',
        'Videographer',
        'Video Editor',
        'Graphic Designer',
        'Social Media Executive',
        'Producer',
        'Sales Executive',
        'Intern',
      ],
    },
    {
      key: 'department',
      en: 'Department',
      zh: '所属部门',
      type: 'select',
      required: true,
      options: ['Management', 'Account Servicing', 'Creative', 'Production', 'Editing', 'Sales', 'Admin'],
    },
    { key: 'email', en: 'Email', zh: '邮箱', type: 'email' },
    { key: 'phone', en: 'Phone', zh: '联系电话', type: 'phone' },
    {
      key: 'status',
      en: 'Work Status',
      zh: '工作状态',
      type: 'select',
      options: ['Active', 'On Leave', 'Inactive'],
      required: true,
    },
    { key: 'joinDate', en: 'Join Date', zh: '入职日期', type: 'date' },
    { key: 'clientIds', en: 'Assigned Clients', zh: '负责客户', type: 'refmulti', ref: 'clients', hideInTable: true },
    { key: 'projectIds', en: 'Assigned Projects', zh: '负责项目', type: 'refmulti', ref: 'shootings', hideInTable: true },
    { key: 'skills', en: 'Skills', zh: '技能标签', type: 'tags', hideInTable: true },
    { key: 'notes', en: 'Notes', zh: '备注', type: 'textarea', hideInTable: true },
  ],
  columns: ['name', 'role', 'department', 'email', 'phone', 'status', 'joinDate'],
};

/* --------------------------------- Clients -------------------------------- */
export const CLIENTS: EntityDef = {
  name: 'clients',
  en: 'Client',
  zh: '客户管理',
  icon: 'Building2',
  titleKey: 'name',
  subtitleKey: 'industry',
  statusKey: 'status',
  kanbanKey: 'status',
  searchKeys: ['name', 'contactPerson', 'industry', 'email', 'phone'],
  fields: [
    { key: 'name', en: 'Client Name', zh: '客户名称', type: 'text', required: true },
    { key: 'companyReg', en: 'Company Registration', zh: '公司注册编号', type: 'text', hideInTable: true },
    { key: 'contactPerson', en: 'Contact Person', zh: '联系人', type: 'text', required: true },
    { key: 'contactPosition', en: 'Position', zh: '职位', type: 'text', hideInTable: true },
    { key: 'phone', en: 'Phone', zh: '联系电话', type: 'phone' },
    { key: 'email', en: 'Email', zh: '邮箱', type: 'email' },
    { key: 'socialAccounts', en: 'Social Media Accounts', zh: '社交媒体账号', type: 'tags', hideInTable: true },
    {
      key: 'industry',
      en: 'Industry',
      zh: '所属行业',
      type: 'select',
      options: [
        'F&B',
        'Retail',
        'Beauty & Aesthetics',
        'Fashion',
        'Property',
        'Education',
        'Healthcare',
        'Fitness',
        'Automotive',
        'Travel & Hospitality',
        'Finance',
        'Technology',
        'E-Commerce',
        'Other',
      ],
    },
    { key: 'website', en: 'Website', zh: '网站', type: 'url', hideInTable: true, link: true },
    { key: 'location', en: 'Location', zh: '所在地区', type: 'text', hideInTable: true },
    { key: 'startDate', en: 'Cooperation Start', zh: '合作开始日期', type: 'date' },
    {
      key: 'status',
      en: 'Cooperation Status',
      zh: '合作状态',
      type: 'select',
      options: ['Active', 'Onboarding', 'Paused', 'Churned'],
      required: true,
    },
    { key: 'accountManagerId', en: 'Account Manager', zh: '负责客户经理', type: 'ref', ref: 'staff' },
    { key: 'teamIds', en: 'Team Members', zh: '团队成员', type: 'refmulti', ref: 'staff', hideInTable: true },
    { key: 'notes', en: 'Client Notes', zh: '客户备注', type: 'textarea', hideInTable: true },
  ],
  columns: ['name', 'contactPerson', 'industry', 'accountManagerId', 'startDate', 'status'],
};

/* ------------------------------ Subscriptions ----------------------------- */
export const SUBSCRIPTIONS: EntityDef = {
  name: 'subscriptions',
  en: 'Subscription',
  zh: '客户订阅配套',
  icon: 'Package',
  titleKey: 'packageName',
  subtitleKey: 'clientId',
  statusKey: 'status',
  kanbanKey: 'status',
  searchKeys: ['packageName', 'services'],
  fields: [
    { key: 'clientId', en: 'Client', zh: '客户', type: 'ref', ref: 'clients', required: true },
    {
      key: 'packageName',
      en: 'Package Name',
      zh: '配套名称',
      type: 'select',
      required: true,
      options: [
        'Starter Content',
        'Monthly Content Package',
        'Social Media Management',
        'Photography Only',
        'Videography Only',
        'Video Editing Retainer',
        'Content Creation Pro',
        'Social Media Advertising',
        'Full Service Retainer',
        'Enterprise',
      ],
    },
    {
      key: 'services',
      en: 'Services Included',
      zh: '包含服务',
      type: 'multiselect',
      options: [
        'Monthly Content Package',
        'Social Media Management',
        'Photography',
        'Videography',
        'Video Editing',
        'Content Creation',
        'Social Media Advertising',
        'Graphic Design',
        'Copywriting',
        'Influencer Sourcing',
        'Community Management',
      ],
    },
    { key: 'monthlyFee', en: 'Monthly Fee (RM)', zh: '月费 (RM)', type: 'currency', required: true },
    { key: 'contractAmount', en: 'Contract Amount (RM)', zh: '合约金额 (RM)', type: 'currency', hideInTable: true },
    {
      key: 'billingCycle',
      en: 'Billing Cycle',
      zh: '计费周期',
      type: 'select',
      options: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'],
    },
    { key: 'contentPerMonth', en: 'Content / Month', zh: '每月内容数', type: 'number', required: true },
    { key: 'videosPerMonth', en: 'Videos / Month', zh: '每月视频数', type: 'number' },
    { key: 'photosPerMonth', en: 'Photos / Month', zh: '每月照片数', type: 'number' },
    { key: 'shootsPerMonth', en: 'Shoots / Month', zh: '每月拍摄次数', type: 'number' },
    { key: 'usedContent', en: 'Content Used', zh: '已用内容数', type: 'number', hideInTable: true },
    { key: 'usedVideos', en: 'Videos Used', zh: '已用视频数', type: 'number', hideInTable: true },
    { key: 'usedPhotos', en: 'Photos Used', zh: '已用照片数', type: 'number', hideInTable: true },
    { key: 'usedShoots', en: 'Shoots Used', zh: '已用拍摄次数', type: 'number', hideInTable: true },
    { key: 'startDate', en: 'Contract Start', zh: '合约开始日期', type: 'date' },
    { key: 'endDate', en: 'Contract End', zh: '合约结束日期', type: 'date' },
    {
      key: 'status',
      en: 'Package Status',
      zh: '配套状态',
      type: 'select',
      options: ['Active', 'Pending', 'Expiring', 'Expired', 'Cancelled'],
      required: true,
    },
    { key: 'autoRenew', en: 'Auto Renew', zh: '自动续约', type: 'boolean', hideInTable: true },
    { key: 'notes', en: 'Notes', zh: '备注', type: 'textarea', hideInTable: true },
  ],
  columns: ['clientId', 'packageName', 'monthlyFee', 'contentPerMonth', 'startDate', 'endDate', 'status'],
};

/* -------------------------------- Payments -------------------------------- */
export const PAYMENTS: EntityDef = {
  name: 'payments',
  en: 'Payment',
  zh: '客户付款记录',
  icon: 'CreditCard',
  titleKey: 'invoiceNo',
  subtitleKey: 'clientId',
  statusKey: 'status',
  kanbanKey: 'status',
  searchKeys: ['invoiceNo', 'reference', 'remarks'],
  fields: [
    { key: 'clientId', en: 'Client', zh: '客户', type: 'ref', ref: 'clients', required: true },
    { key: 'invoiceNo', en: 'Invoice No.', zh: '发票编号', type: 'text', required: true },
    { key: 'invoiceDate', en: 'Invoice Date', zh: '开票日期', type: 'date' },
    { key: 'dueDate', en: 'Payment Due Date', zh: '付款到期日', type: 'date', required: true },
    { key: 'paymentDate', en: 'Payment Date', zh: '付款日期', type: 'date' },
    { key: 'amount', en: 'Amount (RM)', zh: '金额 (RM)', type: 'currency', required: true },
    { key: 'paidAmount', en: 'Paid Amount (RM)', zh: '已付金额 (RM)', type: 'currency' },
    {
      key: 'status',
      en: 'Payment Status',
      zh: '付款状态',
      type: 'select',
      options: ['Paid', 'Pending', 'Partial', 'Overdue', 'Draft'],
      required: true,
    },
    {
      key: 'method',
      en: 'Payment Method',
      zh: '付款方式',
      type: 'select',
      options: ['Bank Transfer', 'Credit Card', 'E-Wallet', 'Cash', 'Cheque', 'Other'],
    },
    { key: 'reference', en: 'Reference / Receipt', zh: '收据 / 参考编号', type: 'text', hideInTable: true },
    { key: 'remarks', en: 'Remarks', zh: '付款备注', type: 'textarea', hideInTable: true },
  ],
  columns: ['invoiceNo', 'clientId', 'invoiceDate', 'dueDate', 'amount', 'paidAmount', 'status', 'method'],
};

/* -------------------------------- Equipment ------------------------------- */
export const EQUIPMENT: EntityDef = {
  name: 'equipment',
  en: 'Equipment',
  zh: '器材管理',
  icon: 'Camera',
  titleKey: 'name',
  subtitleKey: 'model',
  statusKey: 'status',
  kanbanKey: 'status',
  searchKeys: ['name', 'brand', 'model', 'serialNumber', 'category'],
  fields: [
    { key: 'name', en: 'Equipment Name', zh: '器材名称', type: 'text', required: true },
    {
      key: 'category',
      en: 'Category',
      zh: '类别',
      type: 'select',
      required: true,
      options: ['Camera', 'Lens', 'Gimbal', 'Tripod', 'Microphone', 'Lighting', 'Memory Card', 'Battery', 'Drone', 'Monitor', 'Other Accessories'],
    },
    { key: 'brand', en: 'Brand', zh: '品牌', type: 'text' },
    { key: 'model', en: 'Model', zh: '型号', type: 'text' },
    { key: 'serialNumber', en: 'Serial Number', zh: '序列号', type: 'text', hideInTable: true },
    { key: 'purchaseDate', en: 'Purchase Date', zh: '购买日期', type: 'date', hideInTable: true },
    { key: 'purchasePrice', en: 'Purchase Price (RM)', zh: '购买价格 (RM)', type: 'currency', hideInTable: true },
    {
      key: 'status',
      en: 'Status',
      zh: '当前状态',
      type: 'select',
      options: ['Available', 'In Use', 'Borrowed', 'Maintenance', 'Lost'],
      required: true,
    },
    { key: 'assignedTo', en: 'Current User', zh: '当前使用者', type: 'ref', ref: 'staff' },
    { key: 'location', en: 'Location', zh: '所在位置', type: 'text' },
    { key: 'warrantyUntil', en: 'Warranty Until', zh: '保修到期', type: 'date', hideInTable: true },
    { key: 'photo', en: 'Photo URL', zh: '器材照片链接', type: 'url', hideInTable: true },
    { key: 'accessories', en: 'Accessories', zh: '配件', type: 'tags', hideInTable: true },
    {
      key: 'borrowRecords',
      en: 'Borrow / Return Log',
      zh: '借出 / 归还记录',
      type: 'sublist',
      hideInTable: true,
      sub: [
        { key: 'staffId', en: 'Staff', zh: '人员', type: 'ref', ref: 'staff' },
        { key: 'borrowDate', en: 'Borrow Date', zh: '借出日期', type: 'date' },
        { key: 'returnDate', en: 'Return Date', zh: '归还日期', type: 'date' },
        { key: 'project', en: 'Project', zh: '项目', type: 'text' },
        { key: 'condition', en: 'Condition on Return', zh: '归还状况', type: 'text' },
      ],
    },
    {
      key: 'maintenanceRecords',
      en: 'Maintenance Log',
      zh: '维修记录',
      type: 'sublist',
      hideInTable: true,
      sub: [
        { key: 'date', en: 'Date', zh: '日期', type: 'date' },
        { key: 'issue', en: 'Issue', zh: '问题', type: 'text' },
        { key: 'vendor', en: 'Vendor', zh: '维修商', type: 'text' },
        { key: 'cost', en: 'Cost (RM)', zh: '费用 (RM)', type: 'currency' },
        { key: 'notes', en: 'Notes', zh: '备注', type: 'text' },
      ],
    },
    { key: 'notes', en: 'Notes', zh: '备注', type: 'textarea', hideInTable: true },
  ],
  columns: ['name', 'category', 'brand', 'model', 'assignedTo', 'location', 'status'],
};

/* -------------------------------- Proposals ------------------------------- */
export const PROPOSALS: EntityDef = {
  name: 'proposals',
  en: 'Content Proposal',
  zh: '内容提案',
  icon: 'Lightbulb',
  titleKey: 'title',
  subtitleKey: 'campaign',
  statusKey: 'status',
  kanbanKey: 'status',
  searchKeys: ['title', 'campaign', 'idea', 'objective'],
  fields: [
    { key: 'clientId', en: 'Client', zh: '客户', type: 'ref', ref: 'clients', required: true },
    { key: 'campaign', en: 'Campaign', zh: 'Campaign', type: 'text' },
    { key: 'title', en: 'Content Title', zh: '内容标题', type: 'text', required: true },
    {
      key: 'contentType',
      en: 'Content Type',
      zh: '内容类型',
      type: 'select',
      options: ['Reels', 'TikTok', 'Short Video', 'Brand Video', 'Photo Post', 'Carousel', 'Story', 'Live', 'Testimonial', 'Behind the Scene', 'Educational', 'Promo'],
    },
    { key: 'idea', en: 'Content Idea', zh: '内容创意', type: 'textarea', required: true },
    { key: 'objective', en: 'Objective', zh: '目标', type: 'textarea', hideInTable: true },
    { key: 'targetAudience', en: 'Target Audience', zh: '目标受众', type: 'text', hideInTable: true },
    { key: 'keyMessage', en: 'Key Message', zh: '核心信息', type: 'text', hideInTable: true },
    { key: 'references', en: 'References', zh: '参考', type: 'tags', hideInTable: true },
    { key: 'captionIdea', en: 'Caption Idea', zh: '文案构思', type: 'textarea', hideInTable: true },
    { key: 'shootingConcept', en: 'Shooting Concept', zh: '拍摄概念', type: 'textarea', hideInTable: true },
    { key: 'location', en: 'Location', zh: '拍摄地点', type: 'text', hideInTable: true },
    { key: 'talent', en: 'Talent / Requirement', zh: '出镜人员 / 需求', type: 'text', hideInTable: true },
    { key: 'props', en: 'Props', zh: '道具', type: 'tags', hideInTable: true },
    { key: 'estimatedDuration', en: 'Estimated Duration', zh: '预计时长', type: 'text', hideInTable: true },
    {
      key: 'platform',
      en: 'Platform',
      zh: '发布平台',
      type: 'multiselect',
      options: ['Instagram', 'TikTok', 'Facebook', 'YouTube', 'Xiaohongshu', 'LinkedIn', 'WeChat', 'Other'],
      hideInTable: true,
    },
    { key: 'productionNotes', en: 'Production Notes', zh: '制作备注', type: 'textarea', hideInTable: true },
    {
      key: 'status',
      en: 'Proposal Status',
      zh: '提案状态',
      type: 'select',
      required: true,
      options: ['Idea', 'Draft', 'Internal Review', 'Sent to Client', 'Client Review', 'Approved', 'Rejected', 'Production'],
    },
    { key: 'ownerId', en: 'Owner', zh: '负责人', type: 'ref', ref: 'staff', hideInTable: true },
    { key: 'targetDate', en: 'Target Date', zh: '目标日期', type: 'date' },
    {
      key: 'feedback',
      en: 'Client Feedback',
      zh: '客户反馈',
      type: 'sublist',
      hideInTable: true,
      sub: [
        { key: 'date', en: 'Date', zh: '日期', type: 'date' },
        { key: 'author', en: 'Author', zh: '反馈人', type: 'text' },
        { key: 'comment', en: 'Comment', zh: '内容', type: 'textarea' },
      ],
    },
    {
      key: 'versions',
      en: 'Version History',
      zh: '版本记录',
      type: 'sublist',
      hideInTable: true,
      sub: [
        { key: 'version', en: 'Version', zh: '版本', type: 'text' },
        { key: 'date', en: 'Date', zh: '日期', type: 'date' },
        { key: 'author', en: 'Author', zh: '修改人', type: 'text' },
        { key: 'changes', en: 'Changes', zh: '修改内容', type: 'textarea' },
      ],
    },
  ],
  columns: ['title', 'clientId', 'campaign', 'contentType', 'status', 'ownerId', 'targetDate'],
};

/* -------------------------------- Shootings ------------------------------- */
export const SHOOTINGS: EntityDef = {
  name: 'shootings',
  en: 'Shooting Project',
  zh: '拍摄项目',
  icon: 'Clapperboard',
  titleKey: 'projectName',
  subtitleKey: 'campaign',
  statusKey: 'status',
  kanbanKey: 'status',
  searchKeys: ['projectName', 'campaign', 'location', 'talent'],
  fields: [
    { key: 'clientId', en: 'Client', zh: '客户', type: 'ref', ref: 'clients', required: true },
    { key: 'campaign', en: 'Campaign', zh: 'Campaign', type: 'text' },
    { key: 'projectName', en: 'Project Name', zh: '项目名称', type: 'text', required: true },
    { key: 'shootingDate', en: 'Shooting Date', zh: '拍摄日期', type: 'date', required: true },
    { key: 'shootingTime', en: 'Start Time', zh: '开始时间', type: 'text', hideInTable: true },
    { key: 'endTime', en: 'End Time', zh: '结束时间', type: 'text', hideInTable: true },
    { key: 'location', en: 'Location', zh: '拍摄地点', type: 'text' },
    { key: 'photographerId', en: 'Photographer', zh: '摄影师', type: 'ref', ref: 'staff', hideInTable: true },
    { key: 'videographerId', en: 'Videographer', zh: '摄像师', type: 'ref', ref: 'staff', hideInTable: true },
    { key: 'directorId', en: 'Director', zh: '导演', type: 'ref', ref: 'staff', hideInTable: true },
    { key: 'crewIds', en: 'Assigned Crew', zh: '参与人员', type: 'refmulti', ref: 'staff', hideInTable: true },
    { key: 'talent', en: 'Talent / Model', zh: '出镜人员', type: 'text', hideInTable: true },
    { key: 'equipmentIds', en: 'Equipment', zh: '使用器材', type: 'refmulti', ref: 'equipment', hideInTable: true },
    {
      key: 'shotList',
      en: 'Shot List',
      zh: '拍摄清单',
      type: 'sublist',
      hideInTable: true,
      sub: [
        { key: 'shot', en: 'Shot', zh: '镜头', type: 'text' },
        { key: 'description', en: 'Description', zh: '描述', type: 'textarea' },
      ],
    },
    { key: 'deliverables', en: 'Deliverables', zh: '交付物', type: 'text', hideInTable: true },
    { key: 'productionNotes', en: 'Production Notes', zh: '拍摄备注', type: 'textarea', hideInTable: true },
    {
      key: 'status',
      en: 'Shooting Status',
      zh: '拍摄状态',
      type: 'select',
      required: true,
      options: ['Planning', 'Confirmed', 'Shooting', 'Completed', 'Post Production'],
    },
  ],
  columns: ['projectName', 'clientId', 'campaign', 'shootingDate', 'location', 'status'],
};

/* ---------------------------------- Media --------------------------------- */
export const MEDIA: EntityDef = {
  name: 'media',
  en: 'Media Asset',
  zh: '素材',
  icon: 'FolderOpen',
  titleKey: 'fileName',
  subtitleKey: 'campaign',
  statusKey: 'fileType',
  kanbanKey: 'fileType',
  searchKeys: ['fileName', 'campaign', 'tags', 'author', 'camera'],
  fields: [
    { key: 'clientId', en: 'Client', zh: '客户', type: 'ref', ref: 'clients', required: true },
    { key: 'campaign', en: 'Campaign', zh: 'Campaign', type: 'text' },
    { key: 'projectId', en: 'Project', zh: '项目', type: 'ref', ref: 'shootings', hideInTable: true },
    { key: 'shootingDate', en: 'Shooting Date', zh: '拍摄日期', type: 'date' },
    { key: 'content', en: 'Content / Title', zh: '内容标题', type: 'text', hideInTable: true },
    { key: 'fileName', en: 'File Name', zh: '文件名', type: 'text', required: true },
    {
      key: 'fileType',
      en: 'File Type',
      zh: '文件类型',
      type: 'select',
      required: true,
      options: ['RAW', 'JPG', 'MOV', 'MP4', 'Audio', 'B-Roll', 'Thumbnail', 'Graphics', 'Other'],
    },
    { key: 'fileFormat', en: 'Format', zh: '格式', type: 'text', hideInTable: true },
    { key: 'resolution', en: 'Resolution', zh: '分辨率', type: 'text' },
    { key: 'size', en: 'File Size', zh: '文件大小', type: 'text', hideInTable: true },
    { key: 'camera', en: 'Camera', zh: '相机', type: 'text', hideInTable: true },
    { key: 'lens', en: 'Lens', zh: '镜头', type: 'text', hideInTable: true },
    { key: 'author', en: 'Photographer / Videographer', zh: '摄影 / 摄像', type: 'text' },
    { key: 'fileLocation', en: 'File Location', zh: '文件位置', type: 'text', hideInTable: true },
    { key: 'cloudLink', en: 'Cloud Link', zh: '云端链接', type: 'url', hideInTable: true, link: true },
    { key: 'tags', en: 'Tags', zh: '标签', type: 'tags', hideInTable: true },
    { key: 'notes', en: 'Notes', zh: '备注', type: 'textarea', hideInTable: true },
  ],
  columns: ['fileName', 'clientId', 'campaign', 'fileType', 'resolution', 'author', 'shootingDate'],
};

/* ---------------------------- Video / Editing ----------------------------- */
export const VIDEOS: EntityDef = {
  name: 'videos',
  en: 'Video Project',
  zh: '视频剪辑',
  icon: 'Film',
  titleKey: 'title',
  subtitleKey: 'campaign',
  statusKey: 'status',
  kanbanKey: 'status',
  searchKeys: ['title', 'campaign', 'currentVersion'],
  fields: [
    { key: 'title', en: 'Video Title', zh: '视频标题', type: 'text', required: true },
    { key: 'clientId', en: 'Client', zh: '客户', type: 'ref', ref: 'clients', required: true },
    { key: 'campaign', en: 'Campaign', zh: 'Campaign', type: 'text' },
    { key: 'editorId', en: 'Editor', zh: '剪辑师', type: 'ref', ref: 'staff' },
    { key: 'proposalId', en: 'Source Proposal', zh: '来源提案', type: 'ref', ref: 'proposals', hideInTable: true },
    { key: 'duration', en: 'Duration', zh: '时长', type: 'text', hideInTable: true },
    {
      key: 'aspectRatio',
      en: 'Aspect Ratio',
      zh: '画面比例',
      type: 'select',
      options: ['9:16', '16:9', '1:1', '4:5'],
      hideInTable: true,
    },
    {
      key: 'platform',
      en: 'Target Platform',
      zh: '目标平台',
      type: 'multiselect',
      options: ['Instagram', 'TikTok', 'Facebook', 'YouTube', 'Xiaohongshu', 'LinkedIn', 'WeChat', 'Other'],
      hideInTable: true,
    },
    {
      key: 'status',
      en: 'Editing Status',
      zh: '剪辑状态',
      type: 'select',
      required: true,
      options: ['Footage', 'Editing', 'Draft V1', 'Client Review', 'Revision V2', 'Final Approved', 'Published'],
    },
    { key: 'currentVersion', en: 'Current Version', zh: '当前版本', type: 'text' },
    { key: 'deadline', en: 'Deadline', zh: '截止日期', type: 'date' },
    {
      key: 'versions',
      en: 'Version Control (V1/V2/V3/Final)',
      zh: '版本管理 (V1/V2/V3/Final)',
      type: 'sublist',
      hideInTable: true,
      sub: [
        { key: 'version', en: 'Version', zh: '版本', type: 'text' },
        { key: 'date', en: 'Date', zh: '日期', type: 'date' },
        { key: 'link', en: 'Link', zh: '链接', type: 'url' },
        { key: 'notes', en: 'Notes', zh: '说明', type: 'text' },
        { key: 'isFinal', en: 'Is Final', zh: '最终版', type: 'boolean' },
      ],
    },
    {
      key: 'reviewNotes',
      en: 'Client Feedback / Revision Notes',
      zh: '客户反馈 / 修改记录',
      type: 'sublist',
      hideInTable: true,
      sub: [
        { key: 'date', en: 'Date', zh: '日期', type: 'date' },
        { key: 'author', en: 'Author', zh: '反馈人', type: 'text' },
        { key: 'comment', en: 'Comment', zh: '内容', type: 'textarea' },
      ],
    },
    { key: 'approvalDate', en: 'Final Approval Date', zh: '定版日期', type: 'date', hideInTable: true },
    { key: 'finalLink', en: 'Final Video Link', zh: '最终视频链接', type: 'url', hideInTable: true, link: true },
    { key: 'publishedDate', en: 'Published Date', zh: '发布日期', type: 'date', hideInTable: true },
    { key: 'publishedPlatform', en: 'Published Platform', zh: '发布平台', type: 'text', hideInTable: true },
  ],
  columns: ['title', 'clientId', 'campaign', 'editorId', 'currentVersion', 'status', 'deadline'],
};

/* ---------------------------------- Tasks --------------------------------- */
export const TASKS: EntityDef = {
  name: 'tasks',
  en: 'Task',
  zh: '工作任务',
  icon: 'ListChecks',
  titleKey: 'title',
  subtitleKey: 'stage',
  statusKey: 'status',
  kanbanKey: 'status',
  searchKeys: ['title', 'stage', 'description'],
  fields: [
    { key: 'title', en: 'Task', zh: '任务', type: 'text', required: true },
    { key: 'clientId', en: 'Client', zh: '客户', type: 'ref', ref: 'clients' },
    { key: 'projectId', en: 'Project', zh: '项目', type: 'ref', ref: 'shootings', hideInTable: true },
    { key: 'assigneeId', en: 'Assigned Staff', zh: '负责人', type: 'ref', ref: 'staff', required: true },
    {
      key: 'stage',
      en: 'Workflow Stage',
      zh: '流程阶段',
      type: 'select',
      options: [
        'Content Proposal',
        'Client Approval',
        'Pre-production',
        'Shooting',
        'Footage Upload',
        'Editing',
        'Client Review',
        'Revision',
        'Final Approval',
        'Publishing',
      ],
    },
    { key: 'startDate', en: 'Start Date', zh: '开始日期', type: 'date', hideInTable: true },
    { key: 'dueDate', en: 'Due Date', zh: '截止日期', type: 'date', required: true },
    { key: 'completionDate', en: 'Completion Date', zh: '完成日期', type: 'date', hideInTable: true },
    {
      key: 'status',
      en: 'Status',
      zh: '状态',
      type: 'select',
      required: true,
      options: ['Todo', 'In Progress', 'Review', 'Done', 'Blocked'],
    },
    { key: 'priority', en: 'Priority', zh: '优先级', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'] },
    { key: 'description', en: 'Description', zh: '任务描述', type: 'textarea', hideInTable: true },
  ],
  columns: ['title', 'clientId', 'stage', 'assigneeId', 'dueDate', 'priority', 'status'],
};

/* --------------------------------- Learning ------------------------------- */
export const LEARNING: EntityDef = {
  name: 'learning',
  en: 'Learning Material',
  zh: '学习资料',
  icon: 'GraduationCap',
  titleKey: 'title',
  subtitleKey: 'category',
  statusKey: 'status',
  kanbanKey: 'status',
  searchKeys: ['title', 'category', 'source', 'tags', 'notes'],
  fields: [
    { key: 'title', en: 'Title', zh: '标题', type: 'text', required: true },
    {
      key: 'category',
      en: 'Category',
      zh: '分类',
      type: 'select',
      required: true,
      options: [
        'Video Shooting',
        'Photography',
        'Camera Knowledge',
        'Lighting',
        'Audio',
        'Editing',
        'Color Grading',
        'Storytelling',
        'Content Creation',
        'Social Media Marketing',
        'AI Tools',
        'Marketing Strategy',
        'Software Tutorials',
        'Sales & Client Servicing',
      ],
    },
    { key: 'description', en: 'Description', zh: '简介', type: 'textarea', hideInTable: true },
    { key: 'source', en: 'Source', zh: '来源', type: 'text' },
    { key: 'url', en: 'URL', zh: '链接', type: 'url', hideInTable: true, link: true },
    {
      key: 'materialType',
      en: 'Material Type',
      zh: '资料类型',
      type: 'select',
      options: ['Video', 'PDF', 'Document', 'Course', 'Article', 'Template'],
    },
    { key: 'difficulty', en: 'Difficulty', zh: '难度', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
    { key: 'tags', en: 'Tags', zh: '标签', type: 'tags', hideInTable: true },
    { key: 'notes', en: 'Notes', zh: '笔记', type: 'textarea', hideInTable: true },
    {
      key: 'status',
      en: 'Learning Status',
      zh: '学习状态',
      type: 'select',
      options: ['To Learn', 'Learning', 'Completed'],
      required: true,
    },
    { key: 'progress', en: 'Progress (%)', zh: '学习进度 (%)', type: 'percent' },
    { key: 'ownerId', en: 'Assigned To', zh: '学习人员', type: 'ref', ref: 'staff', hideInTable: true },
    { key: 'personalNotes', en: 'Personal Study Notes', zh: '个人学习笔记', type: 'textarea', hideInTable: true },
  ],
  columns: ['title', 'category', 'source', 'materialType', 'difficulty', 'status', 'progress'],
};

/* ---------------------------------- Leads --------------------------------- */
export const LEADS: EntityDef = {
  name: 'leads',
  en: 'Potential Client',
  zh: '潜在客户',
  icon: 'Target',
  titleKey: 'companyName',
  subtitleKey: 'contactPerson',
  statusKey: 'stage',
  kanbanKey: 'stage',
  searchKeys: ['companyName', 'contactPerson', 'industry', 'email', 'phone', 'notes'],
  fields: [
    { key: 'companyName', en: 'Company Name', zh: '公司名称', type: 'text', required: true },
    { key: 'contactPerson', en: 'Contact Person', zh: '联系人', type: 'text', required: true },
    { key: 'position', en: 'Position', zh: '职位', type: 'text', hideInTable: true },
    { key: 'phone', en: 'Phone Number', zh: '联系电话', type: 'phone' },
    { key: 'email', en: 'Email', zh: '邮箱', type: 'email' },
    { key: 'socialAccount', en: 'Social Media Account', zh: '社交媒体账号', type: 'text', hideInTable: true },
    {
      key: 'industry',
      en: 'Industry',
      zh: '所属行业',
      type: 'select',
      options: [
        'F&B',
        'Retail',
        'Beauty & Aesthetics',
        'Fashion',
        'Property',
        'Education',
        'Healthcare',
        'Fitness',
        'Automotive',
        'Travel & Hospitality',
        'Finance',
        'Technology',
        'E-Commerce',
        'Other',
      ],
    },
    {
      key: 'companySize',
      en: 'Company Size',
      zh: '公司规模',
      type: 'select',
      options: ['1-10', '11-50', '51-200', '201-500', '500+'],
      hideInTable: true,
    },
    { key: 'location', en: 'Location', zh: '所在地区', type: 'text', hideInTable: true },
    { key: 'website', en: 'Website', zh: '网站', type: 'url', hideInTable: true, link: true },
    {
      key: 'leadSource',
      en: 'Lead Source',
      zh: '客户来源',
      type: 'select',
      required: true,
      options: [
        'Facebook',
        'Instagram',
        'TikTok',
        'Website',
        'WhatsApp',
        'Referral',
        'Existing Client',
        'Networking',
        'Event',
        'Cold Outreach',
        'Advertisement',
        'Other',
      ],
    },
    { key: 'dateAdded', en: 'Date Added', zh: '建档日期', type: 'date' },
    { key: 'assignedTo', en: 'Assigned Sales / AM', zh: '负责销售 / 客户经理', type: 'ref', ref: 'staff' },
    {
      key: 'stage',
      en: 'Pipeline Stage',
      zh: '销售阶段',
      type: 'select',
      required: true,
      options: [
        'New Lead',
        'Contacted',
        'Meeting / Consultation',
        'Requirement Collected',
        'Proposal Sent',
        'Quotation Sent',
        'Negotiation',
        'Follow-up',
        'Won / Converted',
        'Lost / Not Interested',
      ],
    },
    { key: 'requirements', en: 'Client Requirements', zh: '客户需求', type: 'textarea', hideInTable: true },
    {
      key: 'interestedServices',
      en: 'Interested Services',
      zh: '感兴趣服务',
      type: 'multiselect',
      options: [
        'Monthly Content Package',
        'Social Media Management',
        'Photography',
        'Videography',
        'Video Editing',
        'Content Creation',
        'Social Media Advertising',
        'Graphic Design',
        'Influencer Marketing',
      ],
      hideInTable: true,
    },
    { key: 'estimatedBudget', en: 'Estimated Budget (RM)', zh: '预估预算 (RM)', type: 'currency' },
    { key: 'proposedPackage', en: 'Proposed Package', zh: '建议配套', type: 'text', hideInTable: true },
    { key: 'expectedStartDate', en: 'Expected Start Date', zh: '预计开始日期', type: 'date', hideInTable: true },
    { key: 'probability', en: 'Probability (%)', zh: '成交概率 (%)', type: 'percent' },
    { key: 'competitor', en: 'Competitor / Alternative', zh: '竞争对手 / 替代方案', type: 'text', hideInTable: true },
    { key: 'painPoints', en: 'Client Pain Points', zh: '客户痛点', type: 'textarea', hideInTable: true },
    { key: 'decisionMaker', en: 'Decision Maker', zh: '决策人', type: 'text', hideInTable: true },
    { key: 'lastContactDate', en: 'Last Contact Date', zh: '最后联系日期', type: 'date' },
    { key: 'nextFollowUpDate', en: 'Next Follow-up Date', zh: '下次跟进日期', type: 'date' },
    { key: 'followUpNotes', en: 'Follow-up Notes', zh: '跟进备注', type: 'textarea', hideInTable: true },
    { key: 'salesRemarks', en: 'Sales Remarks', zh: '销售备注', type: 'textarea', hideInTable: true },

    { key: 'proposalDate', en: 'Proposal Date', zh: '提案日期', type: 'date', hideInTable: true },
    { key: 'proposalVersion', en: 'Proposal Version', zh: '提案版本', type: 'text', hideInTable: true },
    { key: 'quotationAmount', en: 'Quotation Amount (RM)', zh: '报价金额 (RM)', type: 'currency', hideInTable: true },
    { key: 'discount', en: 'Discount (%)', zh: '折扣 (%)', type: 'percent', hideInTable: true },
    {
      key: 'approvalStatus',
      en: 'Approval Status',
      zh: '审批状态',
      type: 'select',
      options: ['Not Sent', 'Sent', 'Under Review', 'Revision Requested', 'Approved', 'Rejected'],
      hideInTable: true,
    },
    {
      key: 'contractStatus',
      en: 'Contract Status',
      zh: '合约状态',
      type: 'select',
      options: ['N/A', 'Drafting', 'Sent', 'Signed', 'Deposit Received'],
      hideInTable: true,
    },
    { key: 'lostDate', en: 'Lost Date', zh: '流失日期', type: 'date', hideInTable: true },
    {
      key: 'lostReason',
      en: 'Lost Reason',
      zh: '流失原因',
      type: 'select',
      options: [
        '',
        'Not Interested',
        'Budget Too Low',
        'Chose Competitor',
        'No Response',
        'Project Cancelled',
        'Timing Not Suitable',
        'Other',
      ],
      hideInTable: true,
    },
    { key: 'lostRemarks', en: 'Lost Remarks', zh: '流失备注', type: 'textarea', hideInTable: true },
    {
      key: 'activities',
      en: 'Follow-up Timeline',
      zh: '跟进时间线',
      type: 'sublist',
      hideInTable: true,
      sub: [
        { key: 'date', en: 'Date', zh: '日期', type: 'date' },
        {
          key: 'type',
          en: 'Activity',
          zh: '活动',
          type: 'select',
          options: [
            'Initial Contact',
            'WhatsApp Follow-up',
            'Call',
            'Email',
            'Meeting',
            'Proposal Sent',
            'Quotation Sent',
            'Revision Requested',
            'Negotiation',
            'Contract Signed',
            'Other',
          ],
        },
        { key: 'note', en: 'Note', zh: '记录', type: 'textarea' },
        { key: 'by', en: 'By', zh: '跟进人', type: 'text' },
      ],
    },
    { key: 'notes', en: 'Notes', zh: '备注', type: 'textarea', hideInTable: true },
  ],
  columns: ['companyName', 'contactPerson', 'leadSource', 'estimatedBudget', 'probability', 'assignedTo', 'nextFollowUpDate', 'stage'],
};

export const ENTITIES: EntityDef[] = [
  STAFF,
  CLIENTS,
  SUBSCRIPTIONS,
  PAYMENTS,
  EQUIPMENT,
  PROPOSALS,
  SHOOTINGS,
  MEDIA,
  VIDEOS,
  TASKS,
  LEARNING,
  LEADS,
];

export const ENTITY_MAP: Record<EntityName, EntityDef> = ENTITIES.reduce((acc, e) => {
  acc[e.name] = e;
  return acc;
}, {} as Record<EntityName, EntityDef>);

export const LEAD_STAGES = LEADS.fields.find((f) => f.key === 'stage')!.options!;
export const LOST_STAGES = ['Lost / Not Interested'];
export const WON_STAGE = 'Won / Converted';

/* ------------------------------ Status colours ---------------------------- */
export type Tone = 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'gray' | 'teal' | 'pink';

export const STATUS_TONE: Record<string, Tone> = {
  // generic
  Active: 'green',
  Available: 'green',
  Completed: 'green',
  Done: 'green',
  Paid: 'green',
  Approved: 'green',
  Published: 'green',
  Signed: 'green',
  'Final Approved': 'green',
  'Won / Converted': 'green',
  'Deposit Received': 'green',

  'In Progress': 'blue',
  'In Use': 'blue',
  Editing: 'blue',
  Learning: 'blue',
  Shooting: 'blue',
  Confirmed: 'blue',
  Planning: 'blue',
  Onboarding: 'blue',
  'Internal Review': 'blue',
  'Client Review': 'blue',
  Review: 'blue',
  Contacted: 'blue',
  'Meeting / Consultation': 'blue',
  'Requirement Collected': 'blue',
  Negotiation: 'blue',
  'Follow-up': 'blue',
  Sent: 'blue',
  'Under Review': 'blue',
  'New Lead': 'blue',
  Drafting: 'blue',
  'Draft V1': 'blue',

  Pending: 'amber',
  Partial: 'amber',
  Expiring: 'amber',
  'To Learn': 'amber',
  'On Leave': 'amber',
  Paused: 'amber',
  Borrowed: 'amber',
  Idea: 'amber',
  Draft: 'amber',
  'Sent to Client': 'amber',
  'Revision V2': 'amber',
  'Revision Requested': 'amber',
  'Post Production': 'amber',
  Footage: 'amber',
  Blocked: 'amber',
  Medium: 'amber',
  'Proposal Sent': 'amber',
  'Quotation Sent': 'amber',

  Overdue: 'red',
  Rejected: 'red',
  Lost: 'red',
  Expired: 'red',
  Cancelled: 'red',
  Churned: 'red',
  'Lost / Not Interested': 'red',
  Urgent: 'red',
  High: 'red',
  Inactive: 'red',

  Production: 'purple',
  Maintenance: 'purple',
  Todo: 'purple',
  'Not Sent': 'gray',
  'N/A': 'gray',
  Incomplete: 'gray',
};

export const TONE_CLASS: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  purple: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  gray: 'bg-ink-100 text-ink-600 ring-ink-400/20',
  teal: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  pink: 'bg-pink-50 text-pink-700 ring-pink-600/20',
};

export const TONE_DOT: Record<Tone, string> = {
  green: 'bg-emerald-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  red: 'bg-rose-500',
  purple: 'bg-violet-500',
  gray: 'bg-ink-400',
  teal: 'bg-teal-500',
  pink: 'bg-pink-500',
};

export function toneOf(value: string): Tone {
  return STATUS_TONE[value] || 'gray';
}
