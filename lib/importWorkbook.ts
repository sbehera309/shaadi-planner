import * as XLSX from 'xlsx';
import {
  WeddingProfile,
  WeddingEvent,
  BudgetItem,
  Guest,
  Vendor,
  ShagunRecord,
  RoomAllocation,
  SubEventType,
  RequirementCategory,
  RsvpStatus,
  WeddingTradition,
  VenueOption,
} from './types';

export interface ImportedWeddingData {
  profile?: Partial<WeddingProfile>;
  events?: WeddingEvent[];
  budgetItems?: BudgetItem[];
  guests?: Guest[];
  vendors?: Vendor[];
  shagunRecords?: ShagunRecord[];
  rooms?: RoomAllocation[];
  venues?: VenueOption[];
  summary: {
    eventsCount: number;
    budgetCount: number;
    guestsCount: number;
    vendorsCount: number;
    shagunCount: number;
    roomsCount: number;
    venuesCount: number;
    profileUpdated: boolean;
  };
}

export async function parseWeddingExcelFile(file: File): Promise<ImportedWeddingData> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const result: ImportedWeddingData = {
    summary: {
      eventsCount: 0,
      budgetCount: 0,
      guestsCount: 0,
      vendorsCount: 0,
      shagunCount: 0,
      roomsCount: 0,
      venuesCount: 0,
      profileUpdated: false,
    },
  };

  const sheetNames = workbook.SheetNames;

  // 1. PARSE OVERVIEW SHEET
  const overviewSheetName = sheetNames.find((n) => n.toLowerCase().includes('overview'));
  if (overviewSheetName) {
    const sheet = workbook.Sheets[overviewSheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const profileUpdates: Partial<WeddingProfile> = {};

    rows.forEach((row) => {
      if (!row || row.length < 2) return;
      const key = String(row[0] || '').trim().toLowerCase();
      const val = String(row[1] || '').trim();

      if (key.includes('couple:')) {
        const parts = val.split('&');
        if (parts.length === 2) {
          profileUpdates.brideName = parts[0].trim();
          profileUpdates.groomName = parts[1].trim();
        }
      } else if (key.includes('cultural tradition:')) {
        const lower = val.toLowerCase();
        if (lower.includes('south')) profileUpdates.tradition = 'south_indian';
        else if (lower.includes('fusion') || lower.includes('cross')) profileUpdates.tradition = 'fusion_mixed';
        else profileUpdates.tradition = 'traditional_desi';
      } else if (key.includes('start date:')) {
        if (val && !val.toLowerCase().includes('tbd') && !val.toLowerCase().includes('decided')) {
          profileUpdates.startDate = val;
        }
      } else if (key.includes('end date:')) {
        if (val && !val.toLowerCase().includes('tbd') && !val.toLowerCase().includes('decided')) {
          profileUpdates.endDate = val;
        }
      } else if (key.includes('target location') || key.includes('metro:')) {
        profileUpdates.city = val;
      } else if (key.includes('primary venue')) {
        profileUpdates.venueName = val;
      } else if (key.includes('target budget')) {
        const num = Number(String(val).replace(/[^0-9.]+/g, ''));
        if (!isNaN(num) && num > 0) profileUpdates.targetBudget = num;
      } else if (key.includes('hashtag:')) {
        profileUpdates.hashtag = val;
      }
    });

    if (Object.keys(profileUpdates).length > 0) {
      result.profile = profileUpdates;
      result.summary.profileUpdated = true;
    }
  }

  // 2. PARSE ITINERARY SHEET
  const itinerarySheetName = sheetNames.find(
    (n) => n.toLowerCase().includes('itinerary') || n.toLowerCase().includes('timing')
  );
  if (itinerarySheetName) {
    const sheet = workbook.Sheets[itinerarySheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);
    const parsedEvents: WeddingEvent[] = rawRows
      .filter((r) => r['Ceremony Name'] || r['Event Name'] || r['name'])
      .map((r, idx) => {
        const name = r['Ceremony Name'] || r['Event Name'] || r['name'] || `Event ${idx + 1}`;
        const rawType = String(r['Event Type'] || r['type'] || 'custom').toLowerCase();
        let eventType: SubEventType = 'custom';
        if (rawType.includes('sangeet')) eventType = 'sangeet';
        else if (rawType.includes('haldi')) eventType = 'haldi';
        else if (rawType.includes('mehendi') || rawType.includes('mehndi')) eventType = 'mehendi';
        else if (rawType.includes('phera') || rawType.includes('vivah') || rawType.includes('mandap')) eventType = 'pheras';
        else if (rawType.includes('baraat')) eventType = 'baraat';
        else if (rawType.includes('reception')) eventType = 'reception';
        else if (rawType.includes('roka')) eventType = 'roka';

        const vowsWindow =
          r['Main Vows / Ceremony Window'] ||
          r['Main Vows Window'] ||
          r['Muhurat'] ||
          r['muhuratTime'] ||
          '';

        return {
          id: `imp-ev-${idx}-${Date.now()}`,
          weddingId: 'wedding-1',
          name,
          type: eventType,
          date: r['Date'] && r['Date'] !== 'TBD' ? String(r['Date']) : '',
          startTime: r['Start Time'] ? String(r['Start Time']) : '18:00',
          endTime: r['End Time'] ? String(r['End Time']) : '23:00',
          muhuratTime: vowsWindow ? String(vowsWindow) : undefined,
          venueName: r['Venue Name'] ? String(r['Venue Name']) : 'Celebration Venue',
          venueAddress: r['Venue Address / Region'] || r['Venue Address'] || '',
          dressCode: r['Dress Code'] || 'Festive Indian Formal',
          colorTheme: r['Color Theme'] || '#DC2626',
          bannerGradient: 'from-amber-600 via-rose-700 to-amber-800',
          description: r['Ceremony Description'] || r['description'] || '',
          coordinatorName: r['Event Coordinator'] || '',
          coordinatorPhone: r['Coordinator Phone'] || '',
          checklist: [],
        };
      });

    if (parsedEvents.length > 0) {
      result.events = parsedEvents;
      result.summary.eventsCount = parsedEvents.length;
    }
  }

  // 3. PARSE BUDGET SHEET
  const budgetSheetName = sheetNames.find((n) => n.toLowerCase().includes('budget'));
  if (budgetSheetName) {
    const sheet = workbook.Sheets[budgetSheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);
    const parsedBudget: BudgetItem[] = rawRows
      .filter((r) => {
        const title = String(r['Expense Item'] || r['title'] || '').trim();
        return title && !title.toUpperCase().includes('TOTAL');
      })
      .map((r, idx) => {
        const title = r['Expense Item'] || r['title'] || `Expense ${idx + 1}`;
        const estCost = Number(String(r['Estimated Cost ($)'] || r['Estimated Cost'] || r['estimatedCost'] || 0).replace(/[^0-9.]+/g, '')) || 0;
        const actCost = Number(String(r['Actual Cost ($)'] || r['Actual Cost'] || r['actualCost'] || estCost).replace(/[^0-9.]+/g, '')) || estCost;
        const paidAmt = Number(String(r['Amount Paid ($)'] || r['Amount Paid'] || r['paidAmount'] || 0).replace(/[^0-9.]+/g, '')) || 0;

        const rawSplit = String(r['Family Assignment / Split'] || r['paidBy'] || '').toLowerCase();
        let paidBy: BudgetItem['paidBy'] = 'split_50_50';
        if (rawSplit.includes('bride') || rawSplit.includes('ladki')) paidBy = 'bride_side';
        else if (rawSplit.includes('groom') || rawSplit.includes('ladke')) paidBy = 'groom_side';

        const rawStatus = String(r['Payment Status'] || r['status'] || '').toLowerCase();
        let status: BudgetItem['status'] = 'pending';
        if (rawStatus.includes('paid') || paidAmt >= actCost) status = 'paid';
        else if (paidAmt > 0) status = 'partial';

        return {
          id: `imp-b-${idx}-${Date.now()}`,
          weddingId: 'wedding-1',
          title,
          category: (r['Category'] || 'Venue & Catering') as BudgetItem['category'],
          estimatedCost: estCost,
          actualCost: actCost,
          paidAmount: paidAmt,
          dueDate: r['Due Date'] && r['Due Date'] !== 'TBD' ? String(r['Due Date']) : '2026-10-15',
          paidBy,
          status,
          notes: r['Notes & Vendor Tips'] || r['Notes'] || '',
        };
      });

    if (parsedBudget.length > 0) {
      result.budgetItems = parsedBudget;
      result.summary.budgetCount = parsedBudget.length;
    }
  }

  // 4. PARSE GUESTS SHEET
  const guestSheetName = sheetNames.find((n) => n.toLowerCase().includes('guest'));
  if (guestSheetName) {
    const sheet = workbook.Sheets[guestSheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);
    const parsedGuests: Guest[] = rawRows
      .filter((r) => r['Guest Name'] || r['name'])
      .map((r, idx) => {
        const name = String(r['Guest Name'] || r['name']).trim();
        const rawSide = String(r['Family Side'] || r['side'] || '').toLowerCase();
        let side: Guest['side'] = 'mutual';
        if (rawSide.includes('bride') || rawSide.includes('ladki')) side = 'bride';
        else if (rawSide.includes('groom') || rawSide.includes('ladke')) side = 'groom';

        const adults = Number(r['Adults Count'] || r['Adults'] || r['adultsCount'] || 1);
        const kids = Number(r['Kids Count'] || r['Kids'] || r['kidsCount'] || 0);

        const rawDiet = String(r['Dietary Preference'] || r['dietaryPreference'] || 'Strict Veg');
        let dietaryPreference: Guest['dietaryPreference'] = 'Strict Veg';
        if (rawDiet.toLowerCase().includes('jain')) dietaryPreference = 'Jain';
        else if (rawDiet.toLowerCase().includes('swaminarayan')) dietaryPreference = 'Swaminarayan';
        else if (rawDiet.toLowerCase().includes('non-veg') || rawDiet.toLowerCase().includes('chicken') || rawDiet.toLowerCase().includes('meat')) dietaryPreference = 'Non-Veg';
        else if (rawDiet.toLowerCase().includes('halal')) dietaryPreference = 'Halal';
        else if (rawDiet.toLowerCase().includes('gluten')) dietaryPreference = 'Gluten-Free';

        const rawPickup = String(r['Needs Airport / Transit Pickup'] || r['needsPickup'] || '').toLowerCase();
        const needsPickup = rawPickup.includes('yes') || rawPickup.includes('true') || rawPickup.includes('1');

        // Parse RSVPs if provided in sheet
        const rsvpDetails = String(r['RSVP Details'] || '');
        const eventRsvps: Record<string, RsvpStatus> = {};
        if (rsvpDetails) {
          rsvpDetails.split('|').forEach((part) => {
            const [evId, st] = part.split(':').map((s) => s.trim().toLowerCase());
            if (evId && st) {
              if (st.includes('attend')) eventRsvps[evId] = 'attending';
              else if (st.includes('decline')) eventRsvps[evId] = 'declined';
              else if (st.includes('tentative')) eventRsvps[evId] = 'tentative';
              else eventRsvps[evId] = 'invited';
            }
          });
        }

        return {
          id: `imp-g-${idx}-${Date.now()}`,
          weddingId: 'wedding-1',
          name,
          phone: String(r['Phone Number'] || r['phone'] || ''),
          email: r['Email Address'] || r['email'] || undefined,
          side,
          familyGroup: String(r['Family Group / Household'] || r['Household'] || r['familyGroup'] || name),
          adultsCount: Math.max(1, adults),
          kidsCount: Math.max(0, kids),
          dietaryPreference,
          city: String(r['City / Origin'] || r['city'] || ''),
          needsPickup,
          hotelAssigned: r['Hotel Assigned'] || r['hotelAssigned'] || undefined,
          roomNumber: r['Room Number'] || r['roomNumber'] || undefined,
          notes: r['Notes'] || r['notes'] || undefined,
          eventRsvps,
        };
      });

    if (parsedGuests.length > 0) {
      result.guests = parsedGuests;
      result.summary.guestsCount = parsedGuests.length;
    }
  }

  // 5. PARSE VENDORS SHEET
  const vendorSheetName = sheetNames.find((n) => n.toLowerCase().includes('vendor'));
  if (vendorSheetName) {
    const sheet = workbook.Sheets[vendorSheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);
    const parsedVendors: Vendor[] = rawRows
      .filter((r) => r['Vendor Company Name'] || r['Vendor Name'] || r['name'])
      .map((r, idx) => {
        const name = r['Vendor Company Name'] || r['Vendor Name'] || r['name'] || `Vendor ${idx + 1}`;
        const agreed = Number(String(r['Agreed Total Fee ($)'] || r['Agreed Total'] || r['agreedAmount'] || 0).replace(/[^0-9.]+/g, '')) || 0;
        const deposit = Number(String(r['Deposit Paid ($)'] || r['Deposit Paid'] || r['depositPaid'] || 0).replace(/[^0-9.]+/g, '')) || 0;

        const rawStatus = String(r['Booking Status'] || r['status'] || '').toLowerCase();
        let status: Vendor['status'] = 'contacted';
        if (rawStatus.includes('confirm')) status = 'confirmed';
        else if (rawStatus.includes('complete') || rawStatus.includes('done')) status = 'completed';
        else if (rawStatus.includes('negotiat')) status = 'negotiating';

        const deliverablesRaw = String(r['Contract Deliverables'] || '');
        const deliverables = deliverablesRaw ? deliverablesRaw.split('|').map((s) => s.trim()) : [];

        const rawCategory = String(r['Service Category'] || r['category'] || 'Catering');
        let category: Vendor['category'] = 'Catering';
        if (rawCategory.includes('Pandit') || rawCategory.includes('Priest')) category = 'Pandit Ji';
        else if (rawCategory.includes('Mehendi') || rawCategory.includes('Mehndi')) category = 'Mehendi Artist';
        else if (rawCategory.includes('MUA') || rawCategory.includes('Makeup') || rawCategory.includes('Hair')) category = 'Bridal MUA & Hair';
        else if (rawCategory.includes('Photo') || rawCategory.includes('Video') || rawCategory.includes('Cinematog')) category = 'Photographer & Cinematographer';
        else if (rawCategory.includes('DJ') || rawCategory.includes('Choreo') || rawCategory.includes('Music')) category = 'Choreographer & DJ';
        else if (rawCategory.includes('Mandap') || rawCategory.includes('Decor') || rawCategory.includes('Flor')) category = 'Mandap & Floral Decorator';
        else if (rawCategory.includes('Catering') || rawCategory.includes('Food')) category = 'Catering';
        else if (rawCategory.includes('Attire') || rawCategory.includes('Outfit') || rawCategory.includes('Trousseau')) category = 'Trousseau / Attire';
        else if (rawCategory.includes('Light') || rawCategory.includes('AV')) category = 'Lighting & AV Production';
        else if (rawCategory.includes('Transport') || rawCategory.includes('Car') || rawCategory.includes('Horse') || rawCategory.includes('Baraat')) category = 'Baraat & Farewell Transport';
        else if (rawCategory.includes('Musician') || rawCategory.includes('Shehnai') || rawCategory.includes('Dhol')) category = 'Live Musicians (Nathswaram/Shehnai)';
        else if (rawCategory.includes('Planner') || rawCategory.includes('Coordinator')) category = 'Wedding Planner & Coordinator';

        return {
          id: `imp-v-${idx}-${Date.now()}`,
          weddingId: 'wedding-1',
          name,
          category,
          contactPerson: r['Contact Person'] || '',
          phone: String(r['Phone Number'] || r['phone'] || ''),
          email: r['Email Address'] || r['email'] || undefined,
          status,
          agreedAmount: agreed,
          depositPaid: deposit,
          deliverables,
          notes: r['Internal Notes & Sound Curfew Terms'] || r['Notes'] || '',
        };
      });

    if (parsedVendors.length > 0) {
      result.vendors = parsedVendors;
      result.summary.vendorsCount = parsedVendors.length;
    }
  }

  // 6. PARSE SHAGUN GIFTS SHEET
  const shagunSheetName = sheetNames.find(
    (n) => n.toLowerCase().includes('shagun') || n.toLowerCase().includes('gift')
  );
  if (shagunSheetName) {
    const sheet = workbook.Sheets[shagunSheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);
    const parsedShagun: ShagunRecord[] = rawRows
      .filter((r) => {
        const giver = String(r['Giver / Family Name'] || r['giverName'] || '').trim();
        return giver && !giver.toUpperCase().includes('TOTAL');
      })
      .map((r, idx) => {
        const giverName = r['Giver / Family Name'] || r['giverName'] || `Guest ${idx + 1}`;
        const rawSide = String(r['Family Side'] || r['side'] || '').toLowerCase();
        let side: ShagunRecord['side'] = 'mutual';
        if (rawSide.includes('bride')) side = 'bride';
        else if (rawSide.includes('groom')) side = 'groom';

        const amount = Number(String(r['Amount ($ USD)'] || r['Amount ($ USD) / Value'] || r['Amount'] || r['amount'] || 0).replace(/[^0-9.]+/g, '')) || 0;
        const rawType = String(r['Gift Type'] || r['type'] || 'cash').toLowerCase();
        let type: ShagunRecord['type'] = 'cash_lifafa';
        if (rawType.includes('silver') || rawType.includes('gold')) type = 'gold_silver';
        else if (rawType.includes('item') || rawType.includes('physical')) type = 'physical_gift';
        else if (rawType.includes('voucher') || rawType.includes('card')) type = 'voucher';

        const thankYouSent = String(r['Thank You Note Sent'] || r['Thank You Card Sent'] || r['thankYouSent'] || '').toLowerCase().includes('yes');

        return {
          id: `imp-s-${idx}-${Date.now()}`,
          weddingId: 'wedding-1',
          giverName,
          relationship: r['Relationship to Couple'] || r['Relationship'] || 'Family Friend',
          side,
          city: r['City / Origin'] || r['City'] || '',
          type,
          amount,
          giftDescription: r['Gift Description'] || undefined,
          receivedAtEvent: r['Occasion / Ceremony'] || 'General Wedding Gift',
          pastGivenRecord: r['Past Given Record / Reciprocal History'] || r['Family Reciprocal History / Return Notes'] || undefined,
          thankYouSent,
          date: r['Date Logged'] || new Date().toISOString().split('T')[0],
        };
      });

    if (parsedShagun.length > 0) {
      result.shagunRecords = parsedShagun;
      result.summary.shagunCount = parsedShagun.length;
    }
  }

  // 7. PARSE HOTEL ROOMS SHEET
  const roomSheetName = sheetNames.find(
    (n) => n.toLowerCase().includes('room') || n.toLowerCase().includes('hotel')
  );
  if (roomSheetName) {
    const sheet = workbook.Sheets[roomSheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);
    const parsedRooms: RoomAllocation[] = rawRows
      .filter((r) => r['Room / Suite Identifier'] || r['roomNumber'])
      .map((r, idx) => {
        const roomNumber = String(r['Room / Suite Identifier'] || r['roomNumber'] || `Room ${idx + 101}`);
        const rawType = String(r['Room Type'] || r['roomType'] || 'Deluxe');
        let roomType: RoomAllocation['roomType'] = 'Deluxe';
        if (rawType.includes('Suite')) roomType = 'Suite';
        else if (rawType.includes('Double')) roomType = 'Double Bed';
        else if (rawType.includes('Villa')) roomType = 'Villa';

        const cap = Number(r['Max Guest Capacity'] || r['capacity'] || 2);

        return {
          id: `imp-r-${idx}-${Date.now()}`,
          weddingId: 'wedding-1',
          hotelName: String(r['Target Hotel / Resort'] || r['hotelName'] || 'Hyatt Regency'),
          roomNumber,
          roomType,
          capacity: cap,
          checkInDate: String(r['Check-In Date'] || r['checkInDate'] || '2026-10-15'),
          checkOutDate: String(r['Check-Out Date'] || r['checkOutDate'] || '2026-10-18'),
          assignedGuestIds: [],
          notes: r['Airport Shuttle & Logistics Notes'] || r['Notes'] || undefined,
        };
      });

    if (parsedRooms.length > 0) {
      result.rooms = parsedRooms;
      result.summary.roomsCount = parsedRooms.length;
    }
  }

  // 8. PARSE VENUES & SITE TOURS SHEET
  const venueSheetName = sheetNames.find(
    (n) => n.toLowerCase().includes('venue') || n.toLowerCase().includes('tour')
  );
  if (venueSheetName) {
    const sheet = workbook.Sheets[venueSheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);
    const parsedVenues: VenueOption[] = rawRows
      .filter((r) => r['Venue Name'] || r['name'])
      .map((r, idx) => {
        const name = String(r['Venue Name'] || r['name']);
        const rawType = String(r['Venue Type'] || r['type'] || 'hotel_ballroom').toLowerCase();
        let type: VenueOption['type'] = 'hotel_ballroom';
        if (rawType.includes('estate') || rawType.includes('castle')) type = 'historic_estate';
        else if (rawType.includes('banquet')) type = 'banquet_hall';
        else if (rawType.includes('resort')) type = 'resort';
        else if (rawType.includes('golf')) type = 'golf_club';
        else if (rawType.includes('convention')) type = 'convention_center';

        const rawStatus = String(r['Status'] || r['tourStatus'] || 'researching').toLowerCase();
        let tourStatus: VenueOption['tourStatus'] = 'researching';
        if (rawStatus.includes('shortlist')) tourStatus = 'shortlisted';
        else if (rawStatus.includes('sched')) tourStatus = 'tour_scheduled';
        else if (rawStatus.includes('tour')) tourStatus = 'toured';
        else if (rawStatus.includes('select')) tourStatus = 'selected';
        else if (rawStatus.includes('declin')) tourStatus = 'declined';

        const rentalFee = Number(String(r['Rental Fee ($)'] || r['rentalFee'] || 0).replace(/[^0-9.]+/g, '')) || 0;
        const foodAndBeverageMinimum = Number(String(r['F&B Minimum ($)'] || r['foodAndBeverageMinimum'] || 0).replace(/[^0-9.]+/g, '')) || 0;
        const cateringBuyoutFeePerGuest = Number(String(r['Outside Catering Buyout/Guest ($)'] || r['cateringBuyoutFeePerGuest'] || 0).replace(/[^0-9.]+/g, '')) || 0;
        const estimatedTotalCost = Number(String(r['Est Total Cost ($)'] || r['estimatedTotalCost'] || 0).replace(/[^0-9.]+/g, '')) || rentalFee + foodAndBeverageMinimum;

        const allowsOutsideIndianCatering = String(r['Outside Indian Catering Allowed?'] || '').toLowerCase().includes('yes');
        const allowsOpenFlameHavan = String(r['Open Flame Havan Allowed?'] || '').toLowerCase().includes('yes');
        const allowsBaraatProcession = String(r['Baraat Allowed?'] || '').toLowerCase().includes('yes');
        const soundCurfewTime = String(r['Sound Curfew Time'] || '12:00 AM');
        const maxCeremonyCapacity = Number(r['Ceremony Capacity'] || 400);
        const maxReceptionCapacity = Number(r['Reception Capacity'] || 500);
        const hotelRoomsOnSite = String(r['Hotel Rooms On Site?'] || '').toLowerCase().includes('yes');

        const pros = r['Pros'] ? String(r['Pros']).split(';').map((s) => s.trim()).filter(Boolean) : [];
        const cons = r['Cons'] ? String(r['Cons']).split(';').map((s) => s.trim()).filter(Boolean) : [];

        return {
          id: `imp-v-${idx}-${Date.now()}`,
          weddingId: 'wedding-1',
          name,
          type,
          address: String(r['Address'] || r['address'] || ''),
          city: String(r['City'] || r['city'] || ''),
          state: String(r['State'] || r['state'] || 'NJ'),
          zipCode: r['Zip Code'] ? String(r['Zip Code']) : undefined,
          contactPerson: r['Contact Person'] ? String(r['Contact Person']) : undefined,
          contactPhone: r['Contact Phone'] ? String(r['Contact Phone']) : undefined,
          contactEmail: r['Contact Email'] ? String(r['Contact Email']) : undefined,
          websiteUrl: r['Website URL'] ? String(r['Website URL']) : undefined,
          pricing: {
            rentalFee,
            foodAndBeverageMinimum,
            cateringBuyoutFeePerGuest,
            serviceChargePercent: 22,
            taxPercent: 6.625,
            estimatedTotalCost,
          },
          desiFeatures: {
            allowsOutsideIndianCatering,
            allowsOpenFlameHavan,
            firePermitRequired: true,
            allowsBaraatProcession,
            soundCurfewTime,
            maxCeremonyCapacity,
            maxReceptionCapacity,
            hasBridalSuite: true,
            hasGroomSuite: true,
            hotelRoomsOnSite,
          },
          availableDates: [],
          tourStatus,
          pros,
          cons,
          rating: Number(r['Rating (1-5)'] || 5),
          notes: r['Tour Notes & Observations'] || r['Notes'] || '',
          isSelectedOfficialVenue: String(r['Selected Official Venue?'] || '').toLowerCase().includes('yes'),
        };
      });

    if (parsedVenues.length > 0) {
      result.venues = parsedVenues;
      result.summary.venuesCount = parsedVenues.length;
    }
  }

  return result;
}
