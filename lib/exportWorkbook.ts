import * as XLSX from 'xlsx';
import {
  WeddingProfile,
  WeddingEvent,
  BudgetItem,
  Guest,
  Vendor,
  ShagunRecord,
  RoomAllocation,
} from './types';

interface ExportWeddingData {
  wedding: WeddingProfile | null;
  events: WeddingEvent[];
  budgetItems: BudgetItem[];
  guests: Guest[];
  vendors: Vendor[];
  shagunRecords: ShagunRecord[];
  rooms: RoomAllocation[];
}

export function exportWeddingToExcel({
  wedding,
  events,
  budgetItems,
  guests,
  vendors,
  shagunRecords,
  rooms,
}: ExportWeddingData) {
  const wb = XLSX.utils.book_new();

  const coupleTitle =
    wedding?.brideName && wedding?.groomName
      ? `${wedding.brideName} & ${wedding.groomName}`
      : 'Our Wedding';

  // 1. SHEET 1: OVERVIEW & PROFILE
  const overviewData = [
    ['VIVAAH — DESI AMERICAN WEDDING PLANNER'],
    ['Master Wedding Planning Workbook & Spreadsheet Export'],
    ['Generated on:', new Date().toLocaleString('en-US')],
    [],
    ['WEDDING PROFILE SUMMARY', ''],
    ['Couple:', coupleTitle],
    ['Cultural Tradition:', wedding?.tradition ? wedding.tradition.replace('_', ' ').toUpperCase() : 'TRADITIONAL DESI'],
    ['Celebration Start Date:', wedding?.startDate || 'Dates to be decided (scouting venues)'],
    ['Celebration End Date:', wedding?.endDate || 'Dates to be decided'],
    ['Target Location / Metro:', wedding?.city || 'USA'],
    ['Primary Venue / Resort:', wedding?.venueName || 'Venue to be decided'],
    ['Target Budget ($ USD):', wedding?.targetBudget || 150000],
    ['Wedding Hashtag:', wedding?.hashtag || '#VivaahWedding'],
    ['Total Planned Ceremonies:', events.length],
    ['Total Invited Guests:', guests.length],
    ['Confirmed Attendees:', guests.reduce((acc, g) => {
      const isAttending = Object.values(g.eventRsvps || {}).some((s) => s === 'attending');
      return isAttending ? acc + (g.adultsCount || 0) + (g.kidsCount || 0) : acc;
    }, 0)],
    ['Total Budgeted Expenses ($):', budgetItems.reduce((acc, b) => acc + (b.estimatedCost || 0), 0)],
    ['Total Actual Expenses ($):', budgetItems.reduce((acc, b) => acc + (b.actualCost || 0), 0)],
    ['Total Payments Completed ($):', budgetItems.reduce((acc, b) => acc + (b.paidAmount || 0), 0)],
    ['Total Balance Remaining Due ($):', budgetItems.reduce((acc, b) => acc + Math.max(0, (b.actualCost || b.estimatedCost) - b.paidAmount), 0)],
    [],
    ['COUPLE STORY & WELCOME NOTE:', ''],
    [wedding?.story || 'Planning our dream multi-day Indian wedding in the United States.'],
  ];

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Wedding Overview');

  // 2. SHEET 2: MULTI-EVENT ITINERARY & TIMINGS
  const itineraryHeaders = [
    'Ceremony Name',
    'Event Type',
    'Date',
    'Start Time',
    'End Time',
    'Main Vows / Ceremony Window',
    'Venue Name',
    'Venue Address / Region',
    'Dress Code',
    'Color Theme',
    'Event Coordinator',
    'Coordinator Phone',
    'Decisions & Checklist Items Completed',
    'Total Checklist Items',
    'Ceremony Description',
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

  const wsItinerary = XLSX.utils.aoa_to_sheet([itineraryHeaders, ...itineraryRows]);
  XLSX.utils.book_append_sheet(wb, wsItinerary, 'Itinerary & Timings');

  // 3. SHEET 3: BUDGET & EXPENSES
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

  const budgetRows = budgetItems.map((b) => {
    const cost = b.actualCost || b.estimatedCost || 0;
    const due = Math.max(0, cost - (b.paidAmount || 0));
    const paidByLabel =
      b.paidBy === 'bride_side'
        ? "Bride's Family (Ladkiwale)"
        : b.paidBy === 'groom_side'
        ? "Groom's Family (Ladkewale)"
        : 'Shared 50-50 Split';

    return [
      b.title,
      b.category,
      b.estimatedCost,
      b.actualCost,
      b.paidAmount,
      due,
      paidByLabel,
      b.status.toUpperCase(),
      b.dueDate || 'TBD',
      b.notes || '',
    ];
  });

  // Calculate totals
  const totalEst = budgetItems.reduce((acc, b) => acc + (b.estimatedCost || 0), 0);
  const totalAct = budgetItems.reduce((acc, b) => acc + (b.actualCost || 0), 0);
  const totalPaid = budgetItems.reduce((acc, b) => acc + (b.paidAmount || 0), 0);
  const totalDue = budgetItems.reduce((acc, b) => acc + Math.max(0, (b.actualCost || b.estimatedCost) - b.paidAmount), 0);

  budgetRows.push([]);
  budgetRows.push([
    'TOTALS',
    'All Categories',
    totalEst,
    totalAct,
    totalPaid,
    totalDue,
    '-',
    '-',
    '-',
    'Final Calculated Ledger Balance',
  ]);

  const wsBudget = XLSX.utils.aoa_to_sheet([budgetHeaders, ...budgetRows]);
  XLSX.utils.book_append_sheet(wb, wsBudget, 'Budget & Splits');

  // 4. SHEET 4: GUEST LIST & RSVPS
  const guestHeaders = [
    'Guest Name',
    'Family Side',
    'Family Group / Household',
    'Adults Count',
    'Kids Count',
    'Total Party Size',
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

  const guestRows = guests.map((g) => {
    const sideLabel =
      g.side === 'bride'
        ? "Bride's Family (Ladkiwale)"
        : g.side === 'groom'
        ? "Groom's Family (Ladkewale)"
        : 'Mutual Friends';

    const totalParty = (g.adultsCount || 0) + (g.kidsCount || 0);
    const rsvpSummary = Object.entries(g.eventRsvps || {})
      .map(([evId, status]) => `${evId}: ${String(status).toUpperCase()}`)
      .join(' | ');

    return [
      g.name,
      sideLabel,
      g.familyGroup || g.name,
      g.adultsCount || 0,
      g.kidsCount || 0,
      totalParty,
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

  const wsGuests = XLSX.utils.aoa_to_sheet([guestHeaders, ...guestRows]);
  XLSX.utils.book_append_sheet(wb, wsGuests, 'Guest List & RSVPs');

  // 5. SHEET 5: VENDOR CRM & CONTRACTS
  const vendorHeaders = [
    'Vendor Company Name',
    'Service Category',
    'Contact Person',
    'Phone Number',
    'Email Address',
    'Booking Status',
    'Agreed Total Fee ($)',
    'Deposit Paid ($)',
    'Balance Due ($)',
    'Contract Deliverables',
    'Internal Notes & Sound Curfew Terms',
  ];

  const vendorRows = vendors.map((v) => {
    const balance = Math.max(0, (v.agreedAmount || 0) - (v.depositPaid || 0));
    return [
      v.name,
      v.category,
      v.contactPerson || '',
      v.phone || '',
      v.email || '',
      v.status.toUpperCase(),
      v.agreedAmount || 0,
      v.depositPaid || 0,
      balance,
      (v.deliverables || []).join(' | '),
      v.notes || '',
    ];
  });

  const wsVendors = XLSX.utils.aoa_to_sheet([vendorHeaders, ...vendorRows]);
  XLSX.utils.book_append_sheet(wb, wsVendors, 'Vendors & Contracts');

  // 6. SHEET 6: WEDDING GIFTS & SHAGUN
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

  const shagunRows = shagunRecords.map((s) => {
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

  const totalShagun = shagunRecords.reduce((acc, s) => acc + (s.amount || 0), 0);
  shagunRows.push([]);
  shagunRows.push([
    'TOTAL SHAGUN GIFTS RECEIVED',
    '-',
    '-',
    '-',
    '-',
    totalShagun,
    '-',
    '-',
  ]);

  const wsShagun = XLSX.utils.aoa_to_sheet([shagunHeaders, ...shagunRows]);
  XLSX.utils.book_append_sheet(wb, wsShagun, 'Wedding Gifts (Shagun)');

  // 7. SHEET 7: HOTEL ROOMS & TRANSIT LOGISTICS
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

  const roomRows = rooms.map((r) => {
    const assignedNames = (r.assignedGuestIds || [])
      .map((gId) => {
        const found = guests.find((g) => g.id === gId);
        return found ? found.name : gId;
      })
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

  const wsRooms = XLSX.utils.aoa_to_sheet([roomHeaders, ...roomRows]);
  XLSX.utils.book_append_sheet(wb, wsRooms, 'Rooms & Hotel Logistics');

  // Trigger browser download of .xlsx file
  const filename = `${coupleTitle.replace(/[^a-zA-Z0-9]+/g, '_')}_Wedding_Planning_Master.xlsx`;
  XLSX.writeFile(wb, filename);
}
