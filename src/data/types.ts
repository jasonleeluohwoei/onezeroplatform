export type ID = string;

export interface BaseRecord {
  id: ID;
  createdAt?: string;
  updatedAt?: string;
}

/* ---------------------------------- Staff --------------------------------- */
export interface Staff extends BaseRecord {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  joinDate: string;
  clientIds: ID[];
  projectIds: ID[];
  skills: string[];
  notes: string;
}

/* --------------------------------- Clients -------------------------------- */
export interface Client extends BaseRecord {
  name: string;
  companyReg: string;
  contactPerson: string;
  contactPosition: string;
  phone: string;
  email: string;
  socialAccounts: string[];
  industry: string;
  website: string;
  location: string;
  startDate: string;
  status: 'Active' | 'Onboarding' | 'Paused' | 'Churned';
  accountManagerId: ID;
  teamIds: ID[];
  notes: string;
}

/* ------------------------------ Subscriptions ----------------------------- */
export interface Subscription extends BaseRecord {
  clientId: ID;
  packageName: string;
  services: string[];
  monthlyFee: number;
  contractAmount: number;
  billingCycle: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
  contentPerMonth: number;
  videosPerMonth: number;
  photosPerMonth: number;
  shootsPerMonth: number;
  usedContent: number;
  usedVideos: number;
  usedPhotos: number;
  usedShoots: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Pending' | 'Expiring' | 'Expired' | 'Cancelled';
  autoRenew: boolean;
  notes: string;
}

/* -------------------------------- Payments -------------------------------- */
export interface Payment extends BaseRecord {
  clientId: ID;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  paymentDate: string;
  amount: number;
  paidAmount: number;
  status: 'Paid' | 'Pending' | 'Partial' | 'Overdue' | 'Draft';
  method: 'Bank Transfer' | 'Credit Card' | 'E-Wallet' | 'Cash' | 'Cheque' | 'Other';
  reference: string;
  remarks: string;
}

/* -------------------------------- Equipment ------------------------------- */
export interface BorrowRecord {
  id: ID;
  staffId: ID;
  borrowDate: string;
  returnDate: string;
  project: string;
  condition: string;
}

export interface MaintenanceRecord {
  id: ID;
  date: string;
  issue: string;
  vendor: string;
  cost: number;
  notes: string;
}

export interface Equipment extends BaseRecord {
  name: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  status: 'Available' | 'In Use' | 'Borrowed' | 'Maintenance' | 'Lost';
  assignedTo: ID;
  location: string;
  warrantyUntil: string;
  photo: string;
  accessories: string[];
  borrowRecords: BorrowRecord[];
  maintenanceRecords: MaintenanceRecord[];
  notes: string;
}

/* -------------------------------- Proposals ------------------------------- */
export interface ProposalFeedback {
  id: ID;
  date: string;
  author: string;
  comment: string;
}

export interface ProposalVersion {
  id: ID;
  version: string;
  date: string;
  author: string;
  changes: string;
}

export interface Proposal extends BaseRecord {
  clientId: ID;
  campaign: string;
  title: string;
  contentType: string;
  idea: string;
  objective: string;
  targetAudience: string;
  keyMessage: string;
  references: string[];
  captionIdea: string;
  shootingConcept: string;
  location: string;
  talent: string;
  props: string[];
  estimatedDuration: string;
  platform: string[];
  productionNotes: string;
  status: 'Idea' | 'Draft' | 'Internal Review' | 'Sent to Client' | 'Client Review' | 'Approved' | 'Rejected' | 'Production';
  ownerId: ID;
  targetDate: string;
  feedback: ProposalFeedback[];
  versions: ProposalVersion[];
}

/* -------------------------------- Shootings ------------------------------- */
export interface ShotItem {
  id: ID;
  shot: string;
  description: string;
  done: boolean;
}

export interface Shooting extends BaseRecord {
  clientId: ID;
  campaign: string;
  projectName: string;
  shootingDate: string;
  shootingTime: string;
  endTime: string;
  location: string;
  photographerId: ID;
  videographerId: ID;
  directorId: ID;
  crewIds: ID[];
  talent: string;
  equipmentIds: ID[];
  shotList: ShotItem[];
  productionNotes: string;
  status: 'Planning' | 'Confirmed' | 'Shooting' | 'Completed' | 'Post Production';
  deliverables: string;
}

/* ---------------------------------- Media --------------------------------- */
export interface MediaAsset extends BaseRecord {
  clientId: ID;
  campaign: string;
  projectId: ID;
  shootingId: ID;
  shootingDate: string;
  content: string;
  fileName: string;
  fileType: 'RAW' | 'JPG' | 'MOV' | 'MP4' | 'Audio' | 'B-Roll' | 'Thumbnail' | 'Graphics' | 'Other';
  fileFormat: string;
  resolution: string;
  size: string;
  camera: string;
  lens: string;
  author: string;
  fileLocation: string;
  cloudLink: string;
  tags: string[];
  notes: string;
}

/* ---------------------------- Video / Editing ----------------------------- */
export interface VideoVersion {
  id: ID;
  version: string;
  date: string;
  link: string;
  notes: string;
  isFinal: boolean;
}

export interface ReviewNote {
  id: ID;
  date: string;
  author: string;
  comment: string;
}

export interface VideoProject extends BaseRecord {
  title: string;
  clientId: ID;
  campaign: string;
  editorId: ID;
  proposalId: ID;
  duration: string;
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  platform: string[];
  status: 'Footage' | 'Editing' | 'Draft V1' | 'Client Review' | 'Revision V2' | 'Final Approved' | 'Published';
  currentVersion: string;
  versions: VideoVersion[];
  reviewNotes: ReviewNote[];
  approvalDate: string;
  finalLink: string;
  publishedDate: string;
  publishedPlatform: string;
  deadline: string;
}

/* ---------------------------------- Tasks --------------------------------- */
export interface Task extends BaseRecord {
  title: string;
  clientId: ID;
  projectId: ID;
  assigneeId: ID;
  stage: string;
  startDate: string;
  dueDate: string;
  completionDate: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  description: string;
}

/* --------------------------------- Learning ------------------------------- */
export interface LearningItem extends BaseRecord {
  title: string;
  category: string;
  description: string;
  source: string;
  url: string;
  materialType: 'Video' | 'PDF' | 'Document' | 'Course' | 'Article' | 'Template';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  notes: string;
  status: 'To Learn' | 'Learning' | 'Completed';
  progress: number;
  ownerId: ID;
  personalNotes: string;
}

/* ---------------------------- Leads / Potential --------------------------- */
export interface LeadActivity {
  id: ID;
  date: string;
  type: string;
  note: string;
  by: string;
}

export interface Lead extends BaseRecord {
  companyName: string;
  contactPerson: string;
  position: string;
  phone: string;
  email: string;
  socialAccount: string;
  industry: string;
  companySize: string;
  location: string;
  website: string;
  leadSource: string;
  dateAdded: string;
  assignedTo: ID;
  notes: string;

  stage: string;
  requirements: string;
  interestedServices: string[];
  estimatedBudget: number;
  proposedPackage: string;
  expectedStartDate: string;
  probability: number;
  competitor: string;
  painPoints: string;
  decisionMaker: string;
  lastContactDate: string;
  nextFollowUpDate: string;
  followUpNotes: string;
  salesRemarks: string;

  proposalDate: string;
  proposalVersion: string;
  quotationAmount: number;
  discount: number;
  approvalStatus: string;
  contractStatus: string;

  lostDate: string;
  lostReason: string;
  lostRemarks: string;

  activities: LeadActivity[];
}

export type EntityName =
  | 'staff'
  | 'clients'
  | 'subscriptions'
  | 'payments'
  | 'equipment'
  | 'proposals'
  | 'shootings'
  | 'media'
  | 'videos'
  | 'tasks'
  | 'learning'
  | 'leads';

export interface Database {
  staff: Staff[];
  clients: Client[];
  subscriptions: Subscription[];
  payments: Payment[];
  equipment: Equipment[];
  proposals: Proposal[];
  shootings: Shooting[];
  media: MediaAsset[];
  videos: VideoProject[];
  tasks: Task[];
  learning: LearningItem[];
  leads: Lead[];
}
