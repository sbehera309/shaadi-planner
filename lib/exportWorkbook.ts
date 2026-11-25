import * as XLSX from 'xlsx';
import {
  WeddingProfile,
  WeddingEvent,
  BudgetItem,
  Guest,
  Vendor,
  ShagunRecord,
  RoomAllocation,
  VenueOption,
  SangeetVenueOption,
  ReceptionFloorPlan,
} from './types';
import { getVendorCategorySpec } from './vendorCategorySpecs';
import { formatMinutesTo12h, parseTimeToMinutes } from './timelinePresets';

export interface ExportWeddingData {
  wedding: WeddingProfile | null;
  events: WeddingEvent[];
  budgetItems: BudgetItem[];
  guests: Guest[];
  vendors: Vendor[];
  shagunRecords: ShagunRecord[];
  rooms: RoomAllocation[];
  venues?: VenueOption[];
  officialSangeetVenue?: SangeetVenueOption | null;
  seatingPlan?: ReceptionFloorPlan | null;
}

const CURRENCY_FMT = '$#,##0';

/**
 * Helper: auto-size columns based on header + cell text lengths, and apply Excel AutoFilter to row 1.
 */
function enhanceSheet(
  ws: XLSX.WorkSheet,
  aoa: any[][],
  options?: {
    autoFilter?: boolean;
    currencyCols?: number[]; // 0-indexed column indices to format as $#,##0
    startCurrencyRow?: number; // 1-indexed Excel row where numeric data starts (default 2)
    minWidth?: number;
    maxWidth?: number;
  }
) {
  const minW = options?.minWidth ?? 12;
  const maxW = options?.maxWidth ?? 44;
  const colCount = aoa.reduce((max, row) => Math.max(max, row.length), 0);

  const cols: XLSX.ColInfo[] = [];
  for (let c = 0; c < colCount; c++) {
    let maxLen = minW;
    for (let r = 0; r < aoa.length; r++) {
      const val = aoa[r]?.[c];
      if (val === undefined || val === null) continue;
      const str =
        typeof val === 'object' && val !== null && 'v' in val
          ? String(val.v)
          : typeof val === 'object' && val !== null && 'f' in val
          ? '$100,000'
          : String(val);
      // Use longest single line if multiline
      const longestLine = str.split('\n').reduce((m, l) => Math.max(m, l.length), 0);
      maxLen = Math.max(maxLen, longestLine + 3);
    }
    cols.push({ wch: Math.min(maxW, maxLen) });
  }
  ws['!cols'] = cols;

  // Apply AutoFilter on row 1 for table sheets
  if (options?.autoFilter && colCount > 0 && aoa.length >= 1) {
    const lastColLetter = XLSX.utils.encode_col(colCount - 1);
    const lastRow = Math.max(1, aoa.length);
    ws['!autofilter'] = { ref: `A1:${lastColLetter}${lastRow}` };
  }

  // Apply USD currency number format to currency columns
  if (options?.currencyCols && options.currencyCols.length > 0) {
    const startRow = options.startCurrencyRow ?? 2;
    for (let r = startRow; r <= aoa.length; r++) {
      for (const c of options.currencyCols) {
        const addr = XLSX.utils.encode_cell({ r: r - 1, c });
        const cell = ws[addr];
        if (cell && (cell.t === 'n' || cell.f)) {
          cell.z = CURRENCY_FMT;
        }
      }
    }
  }
}

export function exportWeddingToExcel({
  wedding,
  events,
  budgetItems,
  guests,
  vendors,
  shagunRecords,
  rooms,
  venues = [],
  officialSangeetVenue = null,
  seatingPlan = null,
}: ExportWeddingData) {
  const wb = XLSX.utils.book_new();

  const coupleTitle =
    wedding?.brideName && wedding?.groomName
      ? `${wedding.brideName} & ${wedding.groomName}`
      : 'Our Wedding';

  const officialVenue =
    venues.find((v) => v.isSelectedOfficialVenue) ||
    venues.find((v) => v.tourStatus === 'selected') ||
    null;

  const primaryVenueLabel = officialVenue?.name || wedding?.venueName || 'Venue to be decided';
  const sangeetVenueLabel = officialSangeetVenue
    ? `${officialSangeetVenue.name} (${officialSangeetVenue.city}, ${officialSangeetVenue.state})`
    : 'Not selected yet';

  // Row ranges for cross-sheet live formulas
  const guestLastRow = Math.max(2, guests.length + 1);
  const budgetLastRow = Math.max(2, budgetItems.length + 1);
  const shagunLastRow = Math.max(2, shagunRecords.length + 1);

  // =========================================================================
  // SHEET 1: WEDDING OVERVIEW (LIVE FORMULA DASHBOARD)
  // =========================================================================
  const overviewData: any[][] = [
    ['VIVAAH — DESI AMERICAN WEDDING PLANNER', ''],
    ['Master Wedding Planning Workbook (Live Formulas Enabled)', ''],
    ['Generated on:', new Date().toLocaleString('en-US')],
    [],
    ['WEDDING PROFILE SUMMARY', 'VALUE'],
    ['Couple:', coupleTitle],
    ['Cultural Tradition:', wedding?.tradition ? wedding.tradition.replace('_', ' ').toUpperCase() : 'TRADITIONAL DESI'],
    ['Celebration Start Date:', wedding?.startDate || 'Dates to be decided'],
    ['Celebration End Date:', wedding?.endDate || 'Dates to be decided'],
    ['Target Location / Metro:', wedding?.city || 'USA'],
    ['Primary Venue / Resort:', primaryVenueLabel],
    ['Official Sangeet Venue:', sangeetVenueLabel],
    ['Target Budget ($ USD):', { t: 'n', v: wedding?.targetBudget || 150000, z: CURRENCY_FMT }],
    ['Wedding Hashtag:', wedding?.hashtag || '#VivaahWedding'],
    [],
    ['LIVE PLANNING METRICS (AUTO-CALCULATED FROM SHEETS)', 'VALUE'],
    ['Total Planned Ceremonies:', events.length],
    [
      'Total Guest Cards (Households):',
      guests.length > 0 ? { t: 'n', f: `COUNTA('Guest List & RSVPs'!A2:A${guestLastRow})` } : 0,
    ],
    [
      'Total Invited Headcount (Adults + Kids):',
      guests.length > 0 ? { t: 'n', f: `SUM('Guest List & RSVPs'!G2:G${guestLastRow})` } : 0,
    ],
    [
      'Tier A — Must Invite Headcount:',
      guests.length > 0 ? { t: 'n', f: `SUMIF('Guest List & RSVPs'!C2:C${guestLastRow},"Tier A",'Guest List & RSVPs'!G2:G${guestLastRow})` } : 0,
    ],
    [
      'Tier B — If Space Allows Headcount:',
      guests.length > 0 ? { t: 'n', f: `SUMIF('Guest List & RSVPs'!C2:C${guestLastRow},"Tier B",'Guest List & RSVPs'!G2:G${guestLastRow})` } : 0,
    ],
    [
      'Tier C — Backup / Waitlist Headcount:',
      guests.length > 0 ? { t: 'n', f: `SUMIF('Guest List & RSVPs'!C2:C${guestLastRow},"Tier C",'Guest List & RSVPs'!G2:G${guestLastRow})` } : 0,
    ],
    [
      'Total Estimated Budget ($):',
      budgetItems.length > 0
        ? { t: 'n', f: `SUM('Budget & Splits'!C2:C${budgetLastRow})`, z: CURRENCY_FMT }
        : { t: 'n', v: 0, z: CURRENCY_FMT },
    ],
    [
      'Total Actual / Contracted Cost ($):',
      budgetItems.length > 0
        ? { t: 'n', f: `SUM('Budget & Splits'!D2:D${budgetLastRow})`, z: CURRENCY_FMT }
        : { t: 'n', v: 0, z: CURRENCY_FMT },
    ],
    [
      'Total Payments Completed ($):',
      budgetItems.length > 0
        ? { t: 'n', f: `SUM('Budget & Splits'!E2:E${budgetLastRow})`, z: CURRENCY_FMT }
        : { t: 'n', v: 0, z: CURRENCY_FMT },
    ],
    [
      'Total Balance Remaining Due ($):',
      budgetItems.length > 0
        ? { t: 'n', f: `SUM('Budget & Splits'!F2:F${budgetLastRow})`, z: CURRENCY_FMT }
        : { t: 'n', v: 0, z: CURRENCY_FMT },
    ],
    [
      'Remaining Target Budget Buffer ($):',
      { t: 'n', f: 'B13-B24', z: CURRENCY_FMT },
    ],
    [
      'Total Shagun / Gifts Received ($):',
      shagunRecords.length > 0
        ? { t: 'n', f: `SUM('Wedding Gifts (Shagun)'!G2:G${shagunLastRow})`, z: CURRENCY_FMT }
        : { t: 'n', v: 0, z: CURRENCY_FMT },
    ],
    [],
    ['COUPLE STORY & WELCOME NOTE:', ''],
    [wedding?.story || 'Planning our dream multi-day Indian wedding in the United States.', ''],
  ];

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  enhanceSheet(wsOverview, overviewData, { minWidth: 26, maxWidth: 55 });
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Wedding Overview');

  // =========================================================================
  // SHEET 2: MULTI-EVENT ITINERARY & TIMINGS
  // =========================================================================
  const itineraryHeaders = [
    'Ceremony Name',
    'Event Type',
    'Date',
    'Start Time',
    'End Time',
    'Main Vows / Muhurat Window',
    'Venue Name',
    'Venue Address / Region',
    'Dress Code',
    'Color Theme',
    'Event Coordinator',
    'Coordinator Phone',
    'Checklist Completed',
    'Total Checklist Items',
    'Ceremony Description',
    'Checklist Summary',
  ];

  const itineraryRows = events.map((ev) => {
    const checklist = ev.checklist || [];
    const completedCount = checklist.filter((c) => c.isArranged).length;
    const checklistSummary = checklist
      .map((c) => `[${c.isArranged ? 'X' : ' '}] ${c.title}`)
      .join(' | ');

    return [
      ev.name,
      ev.type.toUpperCase(),
      ev.date || 'TBD',
      ev.startTime,
      ev.endTime,
      ev.muhuratTime || 'N/A',
      ev.venueName,
      ev.venueAddress,
      ev.dressCode,
      ev.colorTheme,
      ev.coordinatorName || '',
      ev.coordinatorPhone || '',
      completedCount,
      checklist.length,
      ev.description,
      checklistSummary,
    ];
  });

  const itineraryAoa = [itineraryHeaders, ...itineraryRows];
  const wsItinerary = XLSX.utils.aoa_to_sheet(itineraryAoa);
  enhanceSheet(wsItinerary, itineraryAoa, { autoFilter: true });
  XLSX.utils.book_append_sheet(wb, wsItinerary, 'Itinerary & Timings');

  // =========================================================================
  // SHEET 2B: EVENT RUN-OF-SHOW TIMELINES
  // =========================================================================
  const timelineHeaders = [
    'Event Name',
    'Event Date',
    'Step #',
    'Start Time',
    'End Time',
    'Duration (min)',
    'Category',
    'Timeline Piece',
    'Song / DJ Cue',
    'Lead / Vendor',
    'Notes',
  ];

  const timelineRows: any[][] = [];
  events.forEach((ev) => {
    const segs = ev.runOfShow || [];
    let cursor = parseTimeToMinutes(ev.startTime);
    segs.forEach((seg, idx) => {
      const dur = Math.max(1, seg.durationMinutes || 5);
      const startLbl = formatMinutesTo12h(cursor);
      const endLbl = formatMinutesTo12h(cursor + dur);
      cursor += dur;
      timelineRows.push([
        ev.name,
        ev.date || 'TBD',
        idx + 1,
        startLbl,
        endLbl,
        dur,
        seg.category.toUpperCase(),
        seg.title,
        seg.songOrCue || '',
        seg.leadPerson || '',
        seg.notes || '',
      ]);
    });
  });

  const timelineAoa = [timelineHeaders, ...timelineRows];
  const wsTimelines = XLSX.utils.aoa_to_sheet(timelineAoa);
  enhanceSheet(wsTimelines, timelineAoa, { autoFilter: true });
  XLSX.utils.book_append_sheet(wb, wsTimelines, 'Event Timelines');

  // =========================================================================
  // SHEET 3: BUDGET & FAMILY SPLITS (LIVE FORMULAS)
  // =========================================================================
  const budgetHeaders = [
    'Expense Item',
    'Category',
    'Estimated Cost ($)',
    'Actual Cost ($)',
    'Amount Paid ($)',
    'Balance Due ($)',
    'Family Assignment / Split',
    'Payment Status',
    'Due Date',
    'Notes & Vendor Tips',
  ];

  const budgetRows: any[][] = budgetItems.map((b, idx) => {
    const r = idx + 2;
    const paidByLabel =
      b.paidBy === 'bride_side'
        ? "Bride's Family (Ladkiwale)"
        : b.paidBy === 'groom_side'
        ? "Groom's Family (Ladkewale)"
        : b.paidBy === 'couple'
        ? 'Couple'
        : 'Shared 50-50 Split';

    return [
      b.title,
      b.category,
      b.estimatedCost || 0,
      b.actualCost || 0,
      b.paidAmount || 0,
      { t: 'n', f: `MAX(0,IF(D${r}>0,D${r},C${r})-E${r})`, z: CURRENCY_FMT },
      paidByLabel,
      b.status.toUpperCase(),
      b.dueDate || 'TBD',
      b.notes || '',
    ];
  });

  if (budgetItems.length > 0) {
    budgetRows.push([]);
    budgetRows.push([
      'TOTALS',
      'All Categories',
      { t: 'n', f: `SUM(C2:C${budgetLastRow})`, z: CURRENCY_FMT },
      { t: 'n', f: `SUM(D2:D${budgetLastRow})`, z: CURRENCY_FMT },
      { t: 'n', f: `SUM(E2:E${budgetLastRow})`, z: CURRENCY_FMT },
      { t: 'n', f: `SUM(F2:F${budgetLastRow})`, z: CURRENCY_FMT },
      '-',
      '-',
      '-',
      'Auto-calculated via Excel SUM formulas',
    ]);
  }

  const budgetAoa = [budgetHeaders, ...budgetRows];
  const wsBudget = XLSX.utils.aoa_to_sheet(budgetAoa);
  enhanceSheet(wsBudget, budgetAoa, {
    autoFilter: true,
    currencyCols: [2, 3, 4, 5],
  });
  XLSX.utils.book_append_sheet(wb, wsBudget, 'Budget & Splits');

  // =========================================================================
  // SHEET 4: PAYMENT MILESTONES & INSTALLMENTS (UNIFIED LEDGER)
  // =========================================================================
  const milestoneHeaders = [
    'Source Type',
    'Venue / Vendor / Expense',
    'Milestone Label',
    'Amount ($)',
    'Status',
    'Due Date',
    'Paid Date',
    'Paid By',
    'Payment Method',
    'Notes',
  ];

  const milestoneRows: any[][] = [];
  const pushMilestones = (sourceType: string, title: string, schedule?: BudgetItem['paymentSchedule']) => {
    (schedule || []).forEach((m) => {
      milestoneRows.push([
        sourceType,
        title,
        m.label,
        m.amount || 0,
        m.status.toUpperCase(),
        m.dueDate || 'TBD',
        m.paidDate || '',
        m.paidBy === 'bride_side'
          ? "Bride's Side"
          : m.paidBy === 'groom_side'
          ? "Groom's Side"
          : m.paidBy === 'couple'
          ? 'Couple'
          : 'Split 50/50',
        m.paymentMethod || '',
        m.notes || '',
      ]);
    });
  };

  venues.forEach((v) => pushMilestones('Venue', v.name, v.paymentSchedule));
  budgetItems.forEach((b) => pushMilestones('Budget Item', b.title, b.paymentSchedule));
  vendors.forEach((v) => pushMilestones('Vendor', v.name, v.paymentSchedule));

  // Sort by due date
  milestoneRows.sort((a, b) => String(a[5]).localeCompare(String(b[5])));

  const milestoneLastRow = Math.max(2, milestoneRows.length + 1);
  if (milestoneRows.length > 0) {
    milestoneRows.push([]);
    milestoneRows.push([
      'TOTAL PAID',
      '',
      '',
      { t: 'n', f: `SUMIF(E2:E${milestoneLastRow},"PAID",D2:D${milestoneLastRow})`, z: CURRENCY_FMT },
      'PAID',
      '',
      '',
      '',
      '',
      '',
    ]);
    milestoneRows.push([
      'TOTAL UPCOMING',
      '',
      '',
      { t: 'n', f: `SUMIF(E2:E${milestoneLastRow},"SCHEDULED",D2:D${milestoneLastRow})`, z: CURRENCY_FMT },
      'SCHEDULED',
      '',
      '',
      '',
      '',
      '',
    ]);
  }

  const milestoneAoa = [milestoneHeaders, ...milestoneRows];
  const wsMilestones = XLSX.utils.aoa_to_sheet(milestoneAoa);
  enhanceSheet(wsMilestones, milestoneAoa, {
    autoFilter: true,
    currencyCols: [3],
  });
  XLSX.utils.book_append_sheet(wb, wsMilestones, 'Payment Milestones');

  // =========================================================================
  // SHEET 5: GUEST LIST, GROUPS, TIERS & RSVPS (LIVE FORMULAS)
  // =========================================================================
  const eventNameById = new Map(events.map((e) => [e.id, e.name]));

  const guestHeaders = [
    'Guest Name',
    'Family Side',
    'Invite Tier',
    'Card Color',
    'Adults Count',
    'Kids Count',
    'Total Party Size',
    'Guest Group',
    'Dietary Preference',
    'City / Origin',
    'Needs Airport / Transit Pickup',
    'Hotel Assigned',
    'Room Number',
    'Email Address',
    'Phone Number',
    'RSVP Details',
    'Notes',
  ];

  const guestRows: any[][] = guests.map((g, idx) => {
    const r = idx + 2;
    const sideLabel =
      g.side === 'bride'
        ? "Bride's Family (Ladkiwale)"
        : g.side === 'groom'
        ? "Groom's Family (Ladkewale)"
        : 'Mutual Friends';

    const tierLabel = g.tier ? `Tier ${g.tier}` : 'Unassigned';
    const rsvpSummary = Object.entries(g.eventRsvps || {})
      .map(([evId, status]) => `${eventNameById.get(evId) || evId}: ${String(status).toUpperCase()}`)
      .join(' | ');

    return [
      g.name,
      sideLabel,
      tierLabel,
      g.cardColor || 'default',
      g.adultsCount || 0,
      g.kidsCount || 0,
      { t: 'n', f: `E${r}+F${r}` },
      g.familyGroup || 'Unassigned',
      g.dietaryPreference || 'Strict Veg',
      g.city || '',
      g.needsPickup ? 'YES' : 'NO',
      g.hotelAssigned || '',
      g.roomNumber || '',
      g.email || '',
      g.phone || '',
      rsvpSummary || 'No RSVPs logged yet',
      g.notes || '',
    ];
  });

  if (guests.length > 0) {
    guestRows.push([]);
    guestRows.push([
      'TOTALS',
      `${guests.length} Guest Cards`,
      'All Tiers',
      '',
      { t: 'n', f: `SUM(E2:E${guestLastRow})` },
      { t: 'n', f: `SUM(F2:F${guestLastRow})` },
      { t: 'n', f: `SUM(G2:G${guestLastRow})` },
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
  }

  const guestAoa = [guestHeaders, ...guestRows];
  const wsGuests = XLSX.utils.aoa_to_sheet(guestAoa);
  enhanceSheet(wsGuests, guestAoa, { autoFilter: true });
  XLSX.utils.book_append_sheet(wb, wsGuests, 'Guest List & RSVPs');

  // =========================================================================
  // SHEET 6: RECEPTION SEATING CHART (FLOOR PLAN)
  // =========================================================================
  const seatingHeaders = [
    'Table Label',
    'Floor Plan Zone',
    'Seat Capacity',
    'Seated People',
    'Open Seats',
    'Guest Groups at Table',
    'Seated Guests (with Headcount)',
  ];

  const guestById = new Map(guests.map((g) => [g.id, g]));
  const seatingTables = seatingPlan?.tables || [];
  const seatingRows: any[][] = seatingTables.map((t, idx) => {
    const r = idx + 2;
    const zoneLabel =
      t.zone === 'left'
        ? 'Left of Dance Floor'
        : t.zone === 'right'
        ? 'Right of Dance Floor'
        : 'Back / Perimeter';
    const seatedGuestObjs = (t.assignedGuestIds || [])
      .map((id) => guestById.get(id))
      .filter((g): g is Guest => Boolean(g));
    const seatedPeople = seatedGuestObjs.reduce(
      (sum, g) => sum + (g.adultsCount || 0) + (g.kidsCount || 0),
      0
    );
    const groupsAtTable = Array.from(
      new Set(seatedGuestObjs.map((g) => g.familyGroup || 'Unassigned'))
    ).join(', ');
    const namesList = seatedGuestObjs
      .map((g) => `${g.name} (${(g.adultsCount || 0) + (g.kidsCount || 0)})`)
      .join(', ');

    return [
      t.label,
      zoneLabel,
      t.capacity,
      seatedPeople,
      { t: 'n', f: `C${r}-D${r}` },
      groupsAtTable,
      namesList,
    ];
  });

  if (seatingTables.length > 0) {
    const seatLastRow = seatingTables.length + 1;
    seatingRows.push([]);
    seatingRows.push([
      'BALLROOM TOTALS',
      `${seatingTables.length} Tables`,
      { t: 'n', f: `SUM(C2:C${seatLastRow})` },
      { t: 'n', f: `SUM(D2:D${seatLastRow})` },
      { t: 'n', f: `SUM(E2:E${seatLastRow})` },
      '',
      '',
    ]);
  }

  const seatingAoa = [seatingHeaders, ...seatingRows];
  const wsSeating = XLSX.utils.aoa_to_sheet(seatingAoa);
  enhanceSheet(wsSeating, seatingAoa, { autoFilter: true });
  XLSX.utils.book_append_sheet(wb, wsSeating, 'Reception Seating Chart');

  // =========================================================================
  // SHEET 7: VENDORS, QUOTE SPECS & CONTRACTS (LIVE FORMULAS)
  // =========================================================================
  const vendorHeaders = [
    'Vendor Company Name',
    'Service Category',
    'Contact Person',
    'Phone Number',
    'Email Address',
    'Booking Status',
    'Agreed / Quoted Fee ($)',
    'Deposit Paid ($)',
    'Balance Due ($)',
    'Quote Expires On',
    'Quote Book URL',
    'Package Specs Summary',
    'Event Coverage Breakdown',
    'Optional Add-Ons',
    'Contract Deliverables',
    'Internal Notes & Terms',
  ];

  const vendorRows: any[][] = vendors.map((v, idx) => {
    const r = idx + 2;
    const spec = getVendorCategorySpec(v.category);
    const details = v.categoryDetails || {};
    const specSummaryParts: string[] = [];
    spec.fields.forEach((f) => {
      const val = details[f.key];
      if (f.type === 'boolean' && val === true) {
        specSummaryParts.push(`✓ ${f.shortLabel || f.label}`);
      } else if (f.type === 'text' && typeof val === 'string' && val.trim()) {
        specSummaryParts.push(`${f.shortLabel || f.label}: ${val.trim()}`);
      }
    });

    const eventBreakdownSummary = (v.eventBreakdown || [])
      .filter((e) => e.eventName.trim())
      .map((e) =>
        [e.eventName, e.hours, e.teamSize, e.rate, e.priceLabel].filter(Boolean).join(' • ')
      )
      .join(' | ');

    const addOnsSummary = (v.addOns || [])
      .filter((a) => a.name.trim())
      .map((a) => `${a.selected ? '[SELECTED] ' : ''}${a.name} ($${a.price || 0})`)
      .join(' | ');

    return [
      v.name,
      v.category === 'Lighting & AV Production' ? 'Choreographer & DJ' : v.category,
      v.contactPerson || '',
      v.phone || '',
      v.email || '',
      v.status.toUpperCase(),
      v.agreedAmount || 0,
      v.depositPaid || 0,
      { t: 'n', f: `MAX(0,G${r}-H${r})`, z: CURRENCY_FMT },
      v.quoteExpiresAt || '',
      v.quoteUrl || '',
      specSummaryParts.join(' | '),
      eventBreakdownSummary,
      addOnsSummary,
      (v.deliverables || []).join(' | '),
      v.notes || '',
    ];
  });

  if (vendors.length > 0) {
    const vendorLastRow = vendors.length + 1;
    vendorRows.push([]);
    vendorRows.push([
      'TOTALS',
      `${vendors.length} Vendors`,
      '',
      '',
      '',
      '',
      { t: 'n', f: `SUM(G2:G${vendorLastRow})`, z: CURRENCY_FMT },
      { t: 'n', f: `SUM(H2:H${vendorLastRow})`, z: CURRENCY_FMT },
      { t: 'n', f: `SUM(I2:I${vendorLastRow})`, z: CURRENCY_FMT },
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
  }

  const vendorAoa = [vendorHeaders, ...vendorRows];
  const wsVendors = XLSX.utils.aoa_to_sheet(vendorAoa);
  enhanceSheet(wsVendors, vendorAoa, {
    autoFilter: true,
    currencyCols: [6, 7, 8],
  });
  XLSX.utils.book_append_sheet(wb, wsVendors, 'Vendors & Contracts');

  // =========================================================================
  // SHEET 8: WEDDING GIFTS & SHAGUN (LIVE FORMULAS)
  // =========================================================================
  const shagunHeaders = [
    'Giver / Family Name',
    'Family Side',
    'Relationship to Couple',
    'City / Origin',
    'Occasion / Ceremony',
    'Gift Type',
    'Amount ($ USD)',
    'Gift Description',
    'Past Given Record / Reciprocal History',
    'Thank You Card Sent',
    'Date Logged',
  ];

  const shagunRows: any[][] = shagunRecords.map((s) => {
    const side =
      s.side === 'bride'
        ? "Bride's Side"
        : s.side === 'groom'
        ? "Groom's Side"
        : 'Mutual';

    return [
      s.giverName,
      side,
      s.relationship || '',
      s.city || '',
      s.receivedAtEvent || 'General Wedding Gift',
      s.type.toUpperCase(),
      s.amount || 0,
      s.giftDescription || '',
      s.pastGivenRecord || '',
      s.thankYouSent ? 'YES' : 'PENDING',
      s.date || new Date().toISOString().split('T')[0],
    ];
  });

  if (shagunRecords.length > 0) {
    shagunRows.push([]);
    shagunRows.push([
      'TOTAL SHAGUN GIFTS RECEIVED',
      '',
      '',
      '',
      '',
      '',
      { t: 'n', f: `SUM(G2:G${shagunLastRow})`, z: CURRENCY_FMT },
      '',
      '',
      '',
      '',
    ]);
  }

  const shagunAoa = [shagunHeaders, ...shagunRows];
  const wsShagun = XLSX.utils.aoa_to_sheet(shagunAoa);
  enhanceSheet(wsShagun, shagunAoa, {
    autoFilter: true,
    currencyCols: [6],
  });
  XLSX.utils.book_append_sheet(wb, wsShagun, 'Wedding Gifts (Shagun)');

  // =========================================================================
  // SHEET 9: HOTEL ROOMS & TRANSIT LOGISTICS
  // =========================================================================
  const roomHeaders = [
    'Room / Suite Identifier',
    'Room Type',
    'Target Hotel / Resort',
    'Max Guest Capacity',
    'Assigned Guest Count',
    'Assigned Guest Names',
    'Check-In Date',
    'Check-Out Date',
    'Airport Shuttle & Logistics Notes',
  ];

  const roomRows: any[][] = rooms.map((r) => {
    const assignedNames = (r.assignedGuestIds || [])
      .map((gId) => guestById.get(gId)?.name || gId)
      .join(', ');

    return [
      r.roomNumber,
      r.roomType,
      r.hotelName,
      r.capacity,
      (r.assignedGuestIds || []).length,
      assignedNames,
      r.checkInDate,
      r.checkOutDate,
      r.notes || '',
    ];
  });

  if (rooms.length > 0) {
    const roomLastRow = rooms.length + 1;
    roomRows.push([]);
    roomRows.push([
      'TOTALS',
      `${rooms.length} Rooms`,
      '',
      { t: 'n', f: `SUM(D2:D${roomLastRow})` },
      { t: 'n', f: `SUM(E2:E${roomLastRow})` },
      '',
      '',
      '',
      '',
    ]);
  }

  const roomAoa = [roomHeaders, ...roomRows];
  const wsRooms = XLSX.utils.aoa_to_sheet(roomAoa);
  enhanceSheet(wsRooms, roomAoa, { autoFilter: true });
  XLSX.utils.book_append_sheet(wb, wsRooms, 'Rooms & Hotel Logistics');

  // =========================================================================
  // SHEET 10: VENUES & SITE TOUR SCOUTING
  // =========================================================================
  const venueHeaders = [
    'Venue Name',
    'Venue Type',
    'Address',
    'City',
    'State',
    'Zip Code',
    'Status',
    'Rating (1-5)',
    'Selected Official Venue?',
    'Contact Person',
    'Contact Phone',
    'Contact Email',
    'Website URL',
    'Rental Fee ($)',
    'F&B Minimum ($)',
    'Outside Catering Buyout/Guest ($)',
    'Est Total Cost ($)',
    'Outside Indian Catering Allowed?',
    'Open Flame Havan Allowed?',
    'Baraat Allowed?',
    'Sound Curfew Time',
    'Ceremony Capacity',
    'Reception Capacity',
    'Hotel Rooms On Site?',
    'Pros',
    'Cons',
    'Tour Notes & Observations',
  ];

  const venueRows = venues.map((v) => [
    v.name,
    v.type,
    v.address,
    v.city,
    v.state,
    v.zipCode || '',
    v.tourStatus.toUpperCase(),
    v.rating || 5,
    v.isSelectedOfficialVenue ? 'YES' : 'NO',
    v.contactPerson || '',
    v.contactPhone || '',
    v.contactEmail || '',
    v.websiteUrl || '',
    v.pricing.rentalFee,
    v.pricing.foodAndBeverageMinimum,
    v.pricing.cateringBuyoutFeePerGuest || 0,
    v.pricing.estimatedTotalCost,
    v.desiFeatures.allowsOutsideIndianCatering ? 'YES' : 'NO',
    v.desiFeatures.allowsOpenFlameHavan ? 'YES' : 'NO',
    v.desiFeatures.allowsBaraatProcession ? 'YES' : 'NO',
    v.desiFeatures.soundCurfewTime,
    v.desiFeatures.maxCeremonyCapacity,
    v.desiFeatures.maxReceptionCapacity,
    v.desiFeatures.hotelRoomsOnSite ? 'YES' : 'NO',
    (v.pros || []).join('; '),
    (v.cons || []).join('; '),
    v.notes || '',
  ]);

  const venueAoa = [venueHeaders, ...venueRows];
  const wsVenues = XLSX.utils.aoa_to_sheet(venueAoa);
  enhanceSheet(wsVenues, venueAoa, {
    autoFilter: true,
    currencyCols: [13, 14, 15, 16],
  });
  XLSX.utils.book_append_sheet(wb, wsVenues, 'Venues & Site Tours');

  // Trigger browser download of .xlsx file
  const filename = `${coupleTitle.replace(/[^a-zA-Z0-9]+/g, '_')}_Wedding_Planning_Master.xlsx`;
  XLSX.writeFile(wb, filename);
}
