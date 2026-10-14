'use client';

import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { useWedding } from '@/lib/store';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import { exportWeddingToExcel } from '@/lib/exportWorkbook';
import { parseWeddingExcelFile, ImportedWeddingData } from '@/lib/importWorkbook';

interface ExcelSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'export' | 'import';
}

export const ExcelSyncModal: React.FC<ExcelSyncModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'export',
}) => {
  const {
    wedding,
    events,
    budgetItems,
    guests,
    vendors,
    shagunRecords,
    rooms,
    importFullWeddingData,
  } = useWedding();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>(defaultTab);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ImportedWeddingData | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportWeddingToExcel({
      wedding,
      events,
      budgetItems,
      guests,
      vendors,
      shagunRecords,
      rooms,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParseError(null);
    setIsParsing(true);
    setParsedData(null);
    setImportSuccess(false);

    try {
      const data = await parseWeddingExcelFile(file);
      setParsedData(data);
    } catch (err: any) {
      console.error('Failed to parse excel file:', err);
      setParseError(err?.message || 'Could not parse the spreadsheet. Please verify it is a valid .xlsx or .xls file.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleApplyImport = () => {
    if (!parsedData) return;

    importFullWeddingData({
      wedding: parsedData.profile,
      events: parsedData.events,
      budgetItems: parsedData.budgetItems,
      guests: parsedData.guests,
      vendors: parsedData.vendors,
      shagunRecords: parsedData.shagunRecords,
      rooms: parsedData.rooms,
    });

    setImportSuccess(true);
    setTimeout(() => {
      onClose();
      setImportSuccess(false);
      setSelectedFile(null);
      setParsedData(null);
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Excel & Google Sheets Sync Hub"
      maxWidth="xl"
    >
      <div className="space-y-5 text-xs">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export to Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-purple-600" />
            <span>Import / Sync Updates (.xlsx)</span>
          </button>
        </div>

        {/* TAB 1: EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">
                  Complete 7-Sheet Master Wedding Workbook
                </h4>
                <p className="text-[11px] text-emerald-900 leading-relaxed mt-0.5">
                  Downloads a fully formatted Microsoft Excel (.xlsx) file. Compatible with Google Sheets, Apple Numbers, and Excel. You can freely edit offline or share with parents and your wedding coordinator!
                </p>
              </div>
            </div>

            {/* Sheets Preview List */}
            <div className="space-y-2">
              <span className="font-bold text-stone-700 block">Worksheets included in this export:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span><strong>1. Wedding Overview:</strong> Dates, Venue & Budget</span>
                </div>
                <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span><strong>2. Itinerary & Timings:</strong> {events.length} Ceremonies & Vows</span>
                </div>
                <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span><strong>3. Budget & Splits:</strong> {budgetItems.length} Expenses & Ledger</span>
                </div>
                <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span><strong>4. Guest List:</strong> {guests.length} Guests & RSVPs</span>
                </div>
                <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span><strong>5. Vendor CRM:</strong> {vendors.length} Vendors & Contracts</span>
                </div>
                <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span><strong>6. Wedding Gifts:</strong> {shagunRecords.length} Shagun Records</span>
                </div>
                <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center gap-2 sm:col-span-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span><strong>7. Rooms & Logistics:</strong> Hotel allocations & airport transits</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Master Excel File (.xlsx)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: IMPORT & SYNC */}
        {activeTab === 'import' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-purple-950 text-sm">
                  Two-Way Sync: Update the Web App from Your Spreadsheet
                </h4>
                <p className="text-[11px] text-purple-900 leading-relaxed mt-0.5">
                  Made changes in Excel or Google Sheets (e.g. updated RSVP counts, vendor payments, or guest tables)? Upload the updated file below and the web app will immediately reflect your latest updates.
                </p>
              </div>
            </div>

            {/* Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 hover:border-purple-500 bg-stone-50/50 hover:bg-purple-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto shadow-2xs">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-stone-800 block text-xs">
                  {selectedFile ? selectedFile.name : 'Click to select or drag & drop your updated Excel file'}
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  Supports .xlsx exported from Vivaah or Google Sheets
                </span>
              </div>
            </div>

            {isParsing && (
              <div className="p-4 rounded-xl bg-stone-100 text-center text-xs font-semibold text-stone-700 animate-pulse">
                Parsing spreadsheet worksheets...
              </div>
            )}

            {parseError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="text-xs font-medium">{parseError}</span>
              </div>
            )}

            {/* Parsed Preview Summary */}
            {parsedData && (
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="font-bold text-stone-900 text-xs">Spreadsheet Analysis Ready</span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Valid Workbook
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                    <span className="text-stone-500 block">Ceremonies</span>
                    <strong className="text-stone-900 text-xs">{parsedData.summary.eventsCount} events</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                    <span className="text-stone-500 block">Budget Items</span>
                    <strong className="text-stone-900 text-xs">{parsedData.summary.budgetCount} items</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                    <span className="text-stone-500 block">Guests</span>
                    <strong className="text-stone-900 text-xs">{parsedData.summary.guestsCount} guests</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                    <span className="text-stone-500 block">Vendors</span>
                    <strong className="text-stone-900 text-xs">{parsedData.summary.vendorsCount} vendors</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                    <span className="text-stone-500 block">Gifts (Shagun)</span>
                    <strong className="text-stone-900 text-xs">{parsedData.summary.shagunCount} records</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                    <span className="text-stone-500 block">Profile Data</span>
                    <strong className="text-stone-900 text-xs">{parsedData.summary.profileUpdated ? 'Updated' : 'Preserved'}</strong>
                  </div>
                </div>

                {importSuccess ? (
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Successfully synced to Vivaah! Updating dashboard...</span>
                  </div>
                ) : (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleApplyImport}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 via-rose-700 to-amber-700 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>Apply Spreadsheet Updates to Web App</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
