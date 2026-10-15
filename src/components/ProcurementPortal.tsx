import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash, Check, X, Building, Users, FileText, 
  Layers, ShoppingBag, DollarSign, CheckCircle2, 
  Clock, ArrowRight, ShieldCheck, Database, FileSpreadsheet, Eye
} from 'lucide-react';

interface ProcurementItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number; // Stored in cents
}

interface ApprovalStep {
  role: string;
  approverEmail: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
  actionDate?: string;
}

interface ProcurementPO {
  id: string;
  entity: string;
  department: string;
  costCenter: string;
  vendorName: string;
  vendorEmail: string;
  items: ProcurementItem[];
  totalAmount: number; // Stored in cents
  status: 'DRAFT' | 'COMMITTED' | 'RECEIVED' | 'INVOICE_MATCHED' | 'PAID' | 'REJECTED';
  approvalChain: ApprovalStep[];
  currentApprovalLevel: number;
  createdAt: string;
  updatedAt: string;
  commitmentTxId?: string;
  matchingTxId?: string;
  paymentTxId?: string;
}

interface ProcurementPortalProps {
  onRefreshStats: () => void;
  onPostMessage: (text: string, type: 'success' | 'error' | 'info') => void;
  isAdminMode: boolean;
}

const MULTI_ENTITIES = [
  'CloudboyX Americas LLC', 
  'CloudboyX Europe GmbH', 
  'CloudboyX Asia-Pacific Ltd'
];

const DEPARTMENTS = [
  { name: 'Research & Development', code: 'RND', costCenter: 'CC-801' },
  { name: 'Operations & Engineering', code: 'OPS', costCenter: 'CC-900' },
  { name: 'Sales & Marketing', code: 'MKT', costCenter: 'CC-202' },
  { name: 'Clinical Quality & Systems', code: 'QA', costCenter: 'CC-850' },
  { name: 'Corporate Administration', code: 'ADM', costCenter: 'CC-500' }
];

const SUGGESTED_ITEMS = [
  { sku: 'STEEL-RIVET-100', name: 'Industrial Grade Reinforced Steel Rivets', price: 15 }, // $0.15
  { sku: 'CAB-FBR-OP', name: 'Fiber Optic High-Speed Network Cabling (100m)', price: 3200 }, // $32.00
  { sku: 'LAB-PH-SENS', name: 'Precision pH Electrochemical Sensor probes', price: 12500 }, // $125.00
  { sku: 'SRV-ST-ND', name: 'Secured Xeon Dual-Socket Rack Server Node', price: 245000 }, // $2450.00
  { sku: 'SF-SHD-GLS', name: 'Safety Tempered Reinforced Shield Glass 2m', price: 8500 } // $85.00
];

export default function ProcurementPortal({ onRefreshStats, onPostMessage, isAdminMode }: ProcurementPortalProps) {
  const [pos, setPOs] = useState<ProcurementPO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter conditions
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Creation form state
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [formEntity, setFormEntity] = useState<string>(MULTI_ENTITIES[0]);
  const [formDeptIndex, setFormDeptIndex] = useState<number>(0);
  const [formVendorName, setFormVendorName] = useState<string>('');
  const [formVendorEmail, setFormVendorEmail] = useState<string>('');
  const [formItems, setFormItems] = useState<{ sku: string; name: string; quantity: number; unitPrice: number }[]>([
    { sku: SUGGESTED_ITEMS[0].sku, name: SUGGESTED_ITEMS[0].name, quantity: 100, unitPrice: SUGGESTED_ITEMS[0].price }
  ]);

  // Selected view detailed PO
  const [selectedPO, setSelectedPO] = useState<ProcurementPO | null>(null);
  const [actionComment, setActionComment] = useState<string>('');
  const [recentSql, setRecentSql] = useState<string>('');

  const fetchPOs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/procurement');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPOs(data.pos);
          if (data.pos.length > 0 && !selectedPO) {
            setSelectedPO(data.pos[0]);
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const savePOsToServer = async (updatedPOs: ProcurementPO[]) => {
    try {
      await fetch('/api/procurement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pos: updatedPOs })
      });
    } catch (e) {
      console.error('Failed to save POs', e);
    }
  };

  const handleAddItemRow = () => {
    setFormItems([...formItems, { sku: SUGGESTED_ITEMS[0].sku, name: SUGGESTED_ITEMS[0].name, quantity: 1, unitPrice: SUGGESTED_ITEMS[0].price }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter((_, i) => i !== idx));
  };

  const handleFormItemChange = (idx: number, field: string, value: any) => {
    const updated = [...formItems];
    if (field === 'sku') {
      const template = SUGGESTED_ITEMS.find(item => item.sku === value);
      if (template) {
        updated[idx] = {
          ...updated[idx],
          sku: value,
          name: template.name,
          unitPrice: template.price
        };
      } else {
        updated[idx].sku = value;
      }
    } else if (field === 'quantity') {
      updated[idx].quantity = Math.max(1, parseInt(value) || 1);
    } else if (field === 'unitPrice') {
      updated[idx].unitPrice = Math.max(0, Math.round(parseFloat(value) * 100) || 0);
    }
    setFormItems(updated);
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVendorName.trim() || !formVendorEmail.trim()) {
      onPostMessage('Please provide vendor name and billing email address', 'error');
      return;
    }

    const dept = DEPARTMENTS[formDeptIndex];
    const totalAmount = formItems.reduce((acc, curve) => acc + (curve.quantity * curve.unitPrice), 0);
    
    // Construct default 3-tier approval chain with real emails
    const approvalChain: ApprovalStep[] = [
      { role: `Requestor (${dept.name})`, approverEmail: `${dept.code.toLowerCase()}-staff@cloudboyx.net`, status: 'APPROVED', comment: 'Initiated original purchase order requisition.', actionDate: new Date().toISOString() },
      { role: `Department Chief (${dept.name} Lead)`, approverEmail: `${dept.code.toLowerCase()}-boss@cloudboyx.net`, status: 'PENDING', comment: '', actionDate: '' },
      { role: 'CFO (Financial Director)', approverEmail: 'clara-cfo@cloudboyx.net', status: 'PENDING', comment: '', actionDate: '' }
    ];

    const newPO: ProcurementPO = {
      id: `PO-2026-${Math.floor(Math.random() * 900 + 100)}`,
      entity: formEntity,
      department: dept.name,
      costCenter: dept.costCenter,
      vendorName: formVendorName,
      vendorEmail: formVendorEmail,
      items: formItems.map((item, index) => ({
        id: `it-f-${index}-${Date.now()}`,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      totalAmount,
      status: 'DRAFT',
      approvalChain,
      currentApprovalLevel: 1, // First Approved by requestor automatically
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newPO, ...pos];
    setPOs(updated);
    setSelectedPO(newPO);
    setShowCreateForm(false);
    
    // Save state
    await savePOsToServer(updated);
    onPostMessage(`Created procurement request ${newPO.id} successfully! Active review chain initiated.`, 'success');

    // Reset Form
    setFormVendorName('');
    setFormVendorEmail('');
    setFormItems([{ sku: SUGGESTED_ITEMS[0].sku, name: SUGGESTED_ITEMS[0].name, quantity: 1, unitPrice: SUGGESTED_ITEMS[0].price }]);
  };

  const handleWorkflowAction = async (action: 'APPROVE' | 'REJECT' | 'RECEIVE' | 'MATCH_INVOICE' | 'PAY') => {
    if (!selectedPO) return;

    try {
      const res = await fetch('/api/procurement/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poId: selectedPO.id,
          action,
          comment: actionComment,
          approverEmail: action === 'APPROVE' ? selectedPO.approvalChain[selectedPO.currentApprovalLevel]?.approverEmail : 'finance@cloudboyx.net'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Update selected item in POs
          const updatedPOs = pos.map(p => p.id === selectedPO.id ? data.po : p);
          setPOs(updatedPOs);
          setSelectedPO(data.po);
          setActionComment('');
          
          if (data.sqlGenerated) {
            setRecentSql(data.sqlGenerated);
          }

          let messageSuffix = '';
          if (action === 'APPROVE') messageSuffix = 'Approver chain level validated!';
          if (action === 'RECEIVE') messageSuffix = 'Goods received! Accrued accounting entries logged and commitment reversed.';
          if (action === 'MATCH_INVOICE') messageSuffix = 'Three-way match verified! Accounts payable ledger created.';
          if (action === 'PAY') messageSuffix = 'Disbursed treasury cash! Accounts payable balance closed.';
          if (action === 'REJECT') messageSuffix = 'Requisition rejected.';

          onPostMessage(`[Workflow Success] PO ${selectedPO.id} transitioned! ${messageSuffix}`, 'success');
          onRefreshStats(); // Trigger upper parent stats refresh so counters update!
        } else {
          onPostMessage(data.error || 'Transition failed', 'error');
        }
      } else {
        onPostMessage('Network error processing transition', 'error');
      }
    } catch (err: any) {
      onPostMessage(`Error: ${err.message}`, 'error');
    }
  };

  const filteredPOs = pos.filter(po => {
    if (entityFilter !== 'all' && po.entity !== entityFilter) return false;
    if (statusFilter !== 'all' && po.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 mb-12 text-slate-800 text-left">
      {/* Upper Status Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
        <div>
          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold font-mono tracking-wider px-2 py-1 rounded uppercase">
            3-Way Matched Corporate Purchasing
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            📥 CloudboyX Procurement Lifecycle Control Room
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit trail automation: PO Commitments (GAAP Code 1900/2400) → Goods Receipts Accruals & 3-Way Match (2150/1400) → AP Settlement (2100/1010).
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => {
              setShowCreateForm(true);
              setError(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 text-xs font-bold font-mono uppercase tracking-wider shadow hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Requisition
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Filter and List of Procurement Documents */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold font-mono text-slate-400 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-indigo-500" /> Filter Ingestion Streams
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Entity Company</label>
                <select 
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className="w-full text-xs p-1.5 rounded border border-slate-200 bg-white"
                >
                  <option value="all">All Entities</option>
                  {MULTI_ENTITIES.map((ent, i) => (
                    <option key={i} value={ent}>{ent.split(' ')[1]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Posting Status</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-xs p-1.5 rounded border border-slate-200 bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="DRAFT">DRAFT / PENDING</option>
                  <option value="COMMITTED">COMMITTED PO</option>
                  <option value="RECEIVED">RECEIVED (GR)</option>
                  <option value="INVOICE_MATCHED">MATCHED (3-WAY)</option>
                  <option value="PAID">PAID (SETTLED)</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
            <div className="p-3 bg-slate-900 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-widest flex justify-between">
              <span>Procurement Ledger Ledger-Docs</span>
              <span>Count: {filteredPOs.length}</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 font-mono text-xs">Loading CloudboyX procurement registers...</div>
            ) : filteredPOs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-mono text-xs">No procurement matches found.</div>
            ) : (
              <div className="divide-y divide-slate-150">
                {filteredPOs.map(po => {
                  const isSelected = selectedPO?.id === po.id;
                  let badgeColor = "bg-slate-100 text-slate-700";
                  if (po.status === 'COMMITTED') badgeColor = "bg-blue-100 text-blue-800 border border-blue-200";
                  if (po.status === 'RECEIVED') badgeColor = "bg-amber-100 text-amber-800 border border-amber-200";
                  if (po.status === 'INVOICE_MATCHED') badgeColor = "bg-indigo-100 text-indigo-800 border border-indigo-200";
                  if (po.status === 'PAID') badgeColor = "bg-emerald-100 text-emerald-80 border border-emerald-200";
                  if (po.status === 'REJECTED') badgeColor = "bg-red-100 text-red-800 border border-red-250";

                  return (
                    <button
                      key={po.id}
                      onClick={() => {
                        setSelectedPO(po);
                        setRecentSql('');
                      }}
                      className={`w-full p-4 flex text-left justify-between items-start hover:bg-slate-50 transition-all cursor-pointer ${isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : ''}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-slate-900">{po.id}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-extrabold uppercase ${badgeColor}`}>
                            {po.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1 truncate max-w-[200px]">
                          {po.vendorName}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono mt-1">
                          <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {po.entity.split(' ')[1]}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {po.department.split(' ')[0]}</span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <span className="font-mono font-extrabold text-sm text-slate-900">
                          ${(po.totalAmount / 100).toFixed(2)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5">{po.items.length} line item(s)</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Requisition details & Interactive Lifecycle match */}
        <div className="lg:col-span-7">
          {showCreateForm ? (
            <form onSubmit={handleCreatePO} className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 flex flex-col gap-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-150">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" /> New Procurement Requisition Form
                </h3>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Affiliated Entity</label>
                  <select 
                    value={formEntity}
                    onChange={(e) => setFormEntity(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-mono"
                  >
                    {MULTI_ENTITIES.map((ent, i) => (
                      <option key={i} value={ent}>{ent}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Department / Cost Center Allocation</label>
                  <select 
                    value={formDeptIndex}
                    onChange={(e) => setFormDeptIndex(parseInt(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-mono"
                  >
                    {DEPARTMENTS.map((dept, i) => (
                      <option key={i} value={i}>{dept.name} [{dept.costCenter}]</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Vendor / Contractor Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SteelCorp Industrial Supplies"
                    value={formVendorName}
                    onChange={(e) => setFormVendorName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Vendor Billing Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. receivables@steelcorp.com"
                    value={formVendorEmail}
                    onChange={(e) => setFormVendorEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Items Table Form */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">Procurement Items</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-indigo-600 font-mono font-bold hover:bg-indigo-50 border border-indigo-200 rounded-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-xs divide-y divide-slate-150">
                    <thead className="bg-slate-50 font-mono text-[10px] text-slate-500 font-bold">
                      <tr>
                        <th className="p-2 text-left">SKU Catalog</th>
                        <th className="p-2 text-left">Item Description</th>
                        <th className="p-2 text-center w-20">Quantity</th>
                        <th className="p-2 text-right w-24">Unit Price ($)</th>
                        <th className="p-2 text-center w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {formItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <select
                              value={item.sku}
                              onChange={(e) => handleFormItemChange(idx, 'sku', e.target.value)}
                              className="w-full border border-slate-200 p-1 rounded text-xs font-mono"
                            >
                              {SUGGESTED_ITEMS.map((si, i) => (
                                <option key={i} value={si.sku}>{si.sku}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <span className="text-[11px] text-slate-500 font-medium block max-w-[200px] truncate">
                              {item.name}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <input 
                              type="number" 
                              value={item.quantity}
                              onChange={(e) => handleFormItemChange(idx, 'quantity', e.target.value)}
                              className="w-full border border-slate-200 p-1 text-center font-mono rounded text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              step="0.01"
                              value={(item.unitPrice / 100).toFixed(2)}
                              onChange={(e) => handleFormItemChange(idx, 'unitPrice', e.target.value)}
                              className="w-full border border-slate-200 p-1 text-right font-mono rounded text-xs"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              disabled={formItems.length === 1}
                              className="text-red-500 hover:bg-red-50 p-1 rounded disabled:opacity-30 cursor-pointer"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-slate-250 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-lg shadow-sm cursor-pointer"
                >
                  Post Requisition
                </button>
              </div>
            </form>
          ) : selectedPO ? (
            <div className="flex flex-col gap-6">
              
              {/* Core Header Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-inner border border-slate-800 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 font-mono font-black text-6xl text-slate-850 select-none">
                  PO
                </div>

                <div className="relative">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-mono font-black text-white">{selectedPO.id}</span>
                        <span className="bg-slate-800 border border-slate-700 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded tracking-wide">
                          {selectedPO.entity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                        <span>Allocated Cost:</span>
                        <span className="text-white font-mono bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-900 border-dashed">
                          {selectedPO.department} ({selectedPO.costCenter})
                        </span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-mono font-black text-emerald-400 block">
                        ${(selectedPO.totalAmount / 100).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-450 font-mono">General Ledger Commit Block</span>
                    </div>
                  </div>

                  {/* 3-Way Match Tracker Map */}
                  <div className="mt-8 pt-6 border-t border-slate-800">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-4">
                      Three-Way Match Verification Flow
                    </span>

                    <div className="grid grid-[1fr_auto_1fr_auto_1fr_auto_1fr] grid-cols-7 text-center items-center gap-1">
                      
                      {/* Step A: Requisition Approved (DRAFT) */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedPO.currentApprovalLevel === selectedPO.approvalChain.length ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-800 text-slate-450'}`}>
                          {selectedPO.currentApprovalLevel === selectedPO.approvalChain.length ? <Check className="w-4 h-4 stroke-[3px]" /> : '1'}
                        </div>
                        <span className="text-[9px] font-mono mt-1 font-bold text-slate-300">REQ OK</span>
                      </div>

                      <ArrowRight className={`w-3.5 h-3.5 text-slate-600 ${selectedPO.status !== 'DRAFT' && selectedPO.status !== 'REJECTED' ? 'text-emerald-500' : ''}`} />

                      {/* Step B: Committed / Ordered */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${['COMMITTED', 'RECEIVED', 'INVOICE_MATCHED', 'PAID'].includes(selectedPO.status) ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-800 text-slate-450'}`}>
                          {['COMMITTED', 'RECEIVED', 'INVOICE_MATCHED', 'PAID'].includes(selectedPO.status) ? <Check className="w-4 h-4 stroke-[3px]" /> : '2'}
                        </div>
                        <span className="text-[9px] font-mono mt-1 font-bold text-slate-300">PO COM</span>
                      </div>

                      <ArrowRight className={`w-3.5 h-3.5 text-slate-600 ${['RECEIVED', 'INVOICE_MATCHED', 'PAID'].includes(selectedPO.status) ? 'text-emerald-500' : ''}`} />

                      {/* Step C: Goods Receipt (GR) */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${['RECEIVED', 'INVOICE_MATCHED', 'PAID'].includes(selectedPO.status) ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-800 text-slate-450'}`}>
                          {['RECEIVED', 'INVOICE_MATCHED', 'PAID'].includes(selectedPO.status) ? <Check className="w-4 h-4 stroke-[3px]" /> : '3'}
                        </div>
                        <span className="text-[9px] font-mono mt-1 font-bold text-slate-300">GOODS RX</span>
                      </div>

                      <ArrowRight className={`w-3.5 h-3.5 text-slate-600 ${['INVOICE_MATCHED', 'PAID'].includes(selectedPO.status) ? 'text-emerald-500' : ''}`} />

                      {/* Step D: Invoice matched AP */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${['INVOICE_MATCHED', 'PAID'].includes(selectedPO.status) ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-800 text-slate-450'}`}>
                          {['INVOICE_MATCHED', 'PAID'].includes(selectedPO.status) ? <Check className="w-4 h-4 stroke-[3px]" /> : '4'}
                        </div>
                        <span className="text-[9px] font-mono mt-1 font-bold text-slate-300">INV PAY</span>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

              {/* Items breakdown panel */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider block mb-3">
                  Authorized Requisition Items
                </span>
                
                <div className="divide-y divide-slate-100 font-mono text-xs text-slate-700">
                  {selectedPO.items.map(item => (
                    <div key={item.id} className="py-2.5 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900">{item.sku}</p>
                        <p className="text-[10px] text-slate-500 font-sans mt-0.5">{item.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">Qty: {item.quantity}</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">@ ${(item.unitPrice / 100).toFixed(2)} / ea</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval chain steps documentation */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider block mb-3">
                  Document Audit Approval Chain Sign-offs
                </span>

                <div className="flex flex-col gap-3">
                  {selectedPO.approvalChain.map((step, idx) => {
                    let stepIcon = <Clock className="w-4 h-4 text-slate-400" />;
                    let stepBg = "bg-white border-slate-200";
                    
                    if (step.status === 'APPROVED') {
                      stepIcon = <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3px]" />;
                      stepBg = "bg-emerald-50 border-emerald-200";
                    } else if (step.status === 'REJECTED') {
                      stepIcon = <X className="w-3.5 h-3.5 text-red-600 stroke-[3px]" />;
                      stepBg = "bg-red-50 border-red-200";
                    }

                    return (
                      <div key={idx} className={`border p-3 rounded-lg flex items-start gap-3 ${stepBg}`}>
                        <div className={`w-6 h-6 rounded-full flex shrink-0 items-center justify-center ${step.status === 'APPROVED' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                          {stepIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline flex-wrap">
                            <span className="font-mono font-black text-xs text-slate-800">{step.role}</span>
                            <span className="text-[10px] text-slate-450 font-mono italic">{step.approverEmail}</span>
                          </div>
                          {step.comment && (
                            <p className="text-xs text-slate-600 mt-1 italic font-sans">
                              "{step.comment}"
                            </p>
                          )}
                          {step.actionDate && (
                            <span className="text-[9px] font-mono text-slate-400 mt-1 block">
                              Timestamp: {new Date(step.actionDate).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Workflow Actions */}
              <div className="border-t border-slate-200 pt-6 mt-4">
                <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider block mb-4">
                  Ledger Action Terminal Controls
                </span>

                {/* Condition 1: PO needs approvals */}
                {selectedPO.status === 'DRAFT' && (
                  <div className="flex flex-col gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-150">
                    <p className="text-xs text-indigo-900 font-semibold">
                      This requisition currently requires authorized sign-off from{' '}
                      <span className="font-mono text-indigo-750 underline">
                        {selectedPO.approvalChain[selectedPO.currentApprovalLevel]?.role}
                      </span>
                    </p>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Write signature note comment..."
                        value={actionComment}
                        onChange={(e) => setActionComment(e.target.value)}
                        className="flex-1 text-xs border border-indigo-200 bg-white p-2.5 rounded-lg"
                      />
                      <button
                        onClick={() => handleWorkflowAction('REJECT')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold font-mono tracking-wide uppercase hover:bg-red-700 cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleWorkflowAction('APPROVE')}
                        className="px-5 py-2 bg-emerald-600 text-slate-900 font-black font-mono text-xs tracking-wide uppercase hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 shrink-0" /> Approve Sign
                      </button>
                    </div>
                  </div>
                )}

                {/* Condition 2: PO is COMMITTED, awaiting Goods Receipt */}
                {selectedPO.status === 'COMMITTED' && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-150 flex flex-col gap-3">
                    <p className="text-xs text-blue-900 font-semibold">
                      Commitment posted! Requisition holds order commitments on accounts 1900/2400. Next, log shipment arrival to clear commitment of <span className="font-bold underline">${(selectedPO.totalAmount / 100).toFixed(2)}</span>.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleWorkflowAction('RECEIVE')}
                        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold font-mono text-xs tracking-wide uppercase rounded-lg hover:from-blue-700 active:scale-95 cursor-pointer"
                      >
                        📦 Log Goods Delivery & GR Accrual
                      </button>
                    </div>
                  </div>
                )}

                {/* Condition 3: Received, awaiting supplier invoice matching */}
                {selectedPO.status === 'RECEIVED' && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-150 flex flex-col gap-3">
                    <p className="text-xs text-amber-950 font-semibold">
                      Items successfully logged into inventory. Standard GAAP compliance requires matches on Vendor invoice billing before trade AP settlement.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleWorkflowAction('MATCH_INVOICE')}
                        className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black font-mono text-xs tracking-wide uppercase rounded-lg hover:from-amber-600 active:scale-95 cursor-pointer"
                      >
                        ⚖️ Audit & Match 3-Way Supplier Invoice
                      </button>
                    </div>
                  </div>
                )}

                {/* Condition 4: Invoice matched, awaiting payment disbursement */}
                {selectedPO.status === 'INVOICE_MATCHED' && (
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-150 flex flex-col gap-3">
                    <p className="text-xs text-indigo-950 font-semibold">
                      Invoices matched and finalized against AP account 2100. Disburse cash liquidity to settle supplier accounts.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleWorkflowAction('PAY')}
                        className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold font-mono text-xs tracking-wide uppercase rounded-lg hover:from-emerald-700 active:scale-95 cursor-pointer"
                      >
                        💵 Disburse Vendor Cash & Settle AP
                      </button>
                    </div>
                  </div>
                )}

                {/* Condition 5: Paid */}
                {selectedPO.status === 'PAID' && (
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-150 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-xs text-emerald-900 font-semibold">
                      Ledger Match fully complete! Requisition has successfully transacted all double-entry stages to direct cash settlement.
                    </p>
                  </div>
                )}

                {/* Condition 6: Rejected */}
                {selectedPO.status === 'REJECTED' && (
                  <div className="bg-red-50 p-4 rounded-xl border border-red-150 flex items-center gap-2">
                    <X className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="text-xs text-red-900 font-semibold">
                      This requisition was rejected and cannot be matching-advanced.
                    </p>
                  </div>
                )}
              </div>

              {/* Real-time generated SQL logging panel */}
              {recentSql && (
                <div className="border border-slate-200 bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] mt-2 relative">
                  <div className="flex justify-between items-center mb-2 text-slate-400 text-[10px]">
                    <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5 text-amber-500" /> Active Posting SQL Commands</span>
                    <span className="bg-slate-800 text-[9px] px-1.5 py-0.5 rounded font-mono">POSTGRESQL DIALECT</span>
                  </div>
                  <pre className="overflow-x-auto max-h-48 whitespace-pre text-emerald-400">
                    {recentSql}
                  </pre>
                </div>
              )}

            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-400 text-xs font-mono">
              Please select a ledger document to view details
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
