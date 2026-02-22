const Appointment = require('../models/appointment-model');
const Shop = require('../models/registerShop-model');

// Get all appointments for barber's shop
exports.getBarberAppointments = async (req, res) => {
  try {
    const { shopId } = req.params;
    
    console.log('=== DEBUGGING BARBER APPOINTMENTS ===');
    console.log('Requested shopId:', shopId);

    if (!shopId) {
      return res.status(200).json({ 
        success: false,
        error: 'Shop ID is required' 
      });
    }

    const fullAppointments = await Appointment.find({ shopId: shopId })
      .populate('shopId', 'shopname city address phone email')
      .populate('timeSlot', 'date')
      .populate('userId', 'name email phone');

    console.log('Full population result:', fullAppointments.length);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    console.log('Time references:', {
      now: now.toLocaleString(),
      startOfToday: startOfToday.toLocaleString(),
      endOfToday: endOfToday.toLocaleString()
    });

    // Separate appointments based on STATUS first, then DATE
    const todaysAppointments = [];
    const upcomingAppointments = [];
    const pastAppointments = [];

    fullAppointments.forEach(appointment => {
      const appointmentDate = appointment.timeSlot?.date;
      
      // Use showtime date if available, otherwise use timeSlot date
      let appointmentDateTime;
      if (appointment.showtimes && appointment.showtimes.length > 0 && appointment.showtimes[0].date) {
        appointmentDateTime = new Date(appointment.showtimes[0].date);
      } else {
        appointmentDateTime = new Date(appointmentDate);
      }

      console.log('Processing appointment:', {
        customer: appointment.userId?.name,
        appointmentTime: appointmentDateTime.toLocaleString(),
        status: appointment.status,
        isToday: appointmentDateTime >= startOfToday && appointmentDateTime < endOfToday,
        isPast: appointmentDateTime < startOfToday,
        isFuture: appointmentDateTime >= endOfToday
      });

      // FIRST: Check if appointment is completed or cancelled - these always go to history
      if (appointment.status === 'completed' || appointment.status === 'cancelled') {
        pastAppointments.push(appointment);
        console.log('-> Added to HISTORY (completed/cancelled status)');
        return;
      }

      // SECOND: For active appointments (pending/confirmed), categorize by DATE
      const isToday = appointmentDateTime >= startOfToday && appointmentDateTime < endOfToday;
      const isPast = appointmentDateTime < startOfToday;
      const isFuture = appointmentDateTime >= endOfToday;

      if (isToday) {
        // Today's appointments - show only if not completed/cancelled
        todaysAppointments.push(appointment);
        console.log('-> Added to TODAY (today date, active status)');
      } else if (isPast) {
        // Past appointments with active status - move to history
        pastAppointments.push(appointment);
        console.log('-> Added to HISTORY (past date, active status)');
      } else if (isFuture) {
        // Future appointments - show in upcoming
        upcomingAppointments.push(appointment);
        console.log('-> Added to UPCOMING (future date, active status)');
      }
    });

    // Sort Today appointments chronologically (earliest first)
    todaysAppointments.sort((a, b) => {
      const getAppointmentDate = (appointment) => {
        return appointment.showtimes && appointment.showtimes.length > 0 
          ? appointment.showtimes[0].date 
          : appointment.timeSlot?.date;
      };
      
      const dateA = new Date(getAppointmentDate(a) || 0);
      const dateB = new Date(getAppointmentDate(b) || 0);
      return dateA - dateB; // Ascending order (earliest first)
    });

    // Sort Upcoming appointments chronologically (earliest first)
    upcomingAppointments.sort((a, b) => {
      const getAppointmentDate = (appointment) => {
        return appointment.showtimes && appointment.showtimes.length > 0 
          ? appointment.showtimes[0].date 
          : appointment.timeSlot?.date;
      };
      
      const dateA = new Date(getAppointmentDate(a) || 0);
      const dateB = new Date(getAppointmentDate(b) || 0);
      return dateA - dateB; // Ascending order (earliest first)
    });

    // Sort History appointments in reverse chronological order (most recent first)
    pastAppointments.sort((a, b) => {
      const getAppointmentDate = (appointment) => {
        return appointment.showtimes && appointment.showtimes.length > 0 
          ? appointment.showtimes[0].date 
          : appointment.timeSlot?.date;
      };
      
      const dateA = new Date(getAppointmentDate(a) || 0);
      const dateB = new Date(getAppointmentDate(b) || 0);
      return dateB - dateA; // Descending order (most recent first)
    });

    console.log('Final categorized appointments:', {
      today: todaysAppointments.length,
      upcoming: upcomingAppointments.length,
      past: pastAppointments.length,
      todayDetails: todaysAppointments.map(apt => ({
        customer: apt.userId?.name,
        date: apt.showtimes?.[0]?.date || apt.timeSlot?.date,
        status: apt.status
      })),
      pastDetails: pastAppointments.map(apt => ({
        customer: apt.userId?.name,
        date: apt.showtimes?.[0]?.date || apt.timeSlot?.date,
        status: apt.status
      }))
    });

    // Calculate statistics
    const stats = {
      total: fullAppointments.length,
      today: todaysAppointments.length,
      upcoming: upcomingAppointments.length,
      completed: pastAppointments.filter(apt => apt.status === 'completed').length,
      cancelled: pastAppointments.filter(apt => apt.status === 'cancelled').length,
      pending: todaysAppointments.filter(apt => apt.status === 'pending').length + 
               upcomingAppointments.filter(apt => apt.status === 'pending').length,
      confirmed: todaysAppointments.filter(apt => apt.status === 'confirmed').length + 
                 upcomingAppointments.filter(apt => apt.status === 'confirmed').length
    };

    res.status(200).json({
      success: true,
      todaysAppointments,
      upcomingAppointments,
      pastAppointments,
      stats,
      shop: await Shop.findById(shopId).select('name city address shopname')
    });
  } catch (error) {
    console.error('Error fetching barber appointments:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch appointments',
      details: error.message 
    });
  }
};


// Get today's appointments only
exports.getTodaysAppointments = async (req, res) => {
  try {
    const { shopId } = req.params;
    
    if (!shopId) {
      return res.status(200).json({ 
        success: false,
        error: 'Shop ID is required' 
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({ 
      shopId,
      $or: [
        { 'timeSlot.date': { $gte: today, $lt: tomorrow } },
        { 'showtimes.date': { $gte: today, $lt: tomorrow } }
      ]
    })
    .populate('shopId', 'shopname city address')
    .populate('timeSlot', 'date')
    .populate('userId', 'name email phone')
    .sort({ 'showtimes.date': 1 }); // Sort chronologically

    if(!appointments){
      res.status(200).json({
        success: false,
        message: 'No appointments for today',   
      });
    }

    res.status(200).json({
      success: true,
      todaysAppointments: appointments,
      date: today.toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch today\'s appointments' 
    });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!appointmentId || !status) {
      return res.status(400).json({
        success: false,
        error: 'Appointment ID and status are required'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: pending, confirmed, completed, cancelled'
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    )
    .populate('shopId', 'shopname city address')
    .populate('timeSlot', 'date')
    .populate('userId', 'name email phone');

    if (!appointment) {
      return res.status(200).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment status'
    });
  }
};


const ANALYTICS_PERIODS = new Set(['day', 'week', 'month', 'year']);

const roundCurrency = (value) => Number((Number(value) || 0).toFixed(2));

const parseDateFromQuery = (rawDate) => {
  if (typeof rawDate !== 'string') return null;
  const match = rawDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsedDate = new Date(year, monthIndex, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== monthIndex ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
};

const parseValidYear = (rawYear, fallbackYear) => {
  const parsed = Number.parseInt(rawYear, 10);
  if (!Number.isFinite(parsed)) return fallbackYear;
  if (parsed < 1970 || parsed > 2100) return fallbackYear;
  return parsed;
};

const parseValidMonthIndex = (rawMonth, fallbackMonthIndex) => {
  const parsed = Number.parseInt(rawMonth, 10);
  if (!Number.isFinite(parsed)) return fallbackMonthIndex;
  if (parsed < 1 || parsed > 12) return fallbackMonthIndex;
  return parsed - 1;
};

const getAppointmentDate = (appointment) => {
  const showtimeDate =
    appointment?.showtimes &&
    appointment.showtimes.length > 0 &&
    appointment.showtimes[0]?.date
      ? new Date(appointment.showtimes[0].date)
      : null;

  if (showtimeDate && !Number.isNaN(showtimeDate.getTime())) {
    return showtimeDate;
  }

  const bookedDate = new Date(appointment?.bookedAt);
  return Number.isNaN(bookedDate.getTime()) ? null : bookedDate;
};

const getPeriodRange = (rawPeriod, filters = {}) => {
  const period = ANALYTICS_PERIODS.has(rawPeriod) ? rawPeriod : 'month';
  const now = new Date();
  const referenceDate = parseDateFromQuery(filters.date) || now;
  const yearFromQuery = parseValidYear(filters.year, now.getFullYear());
  const monthFromQuery = parseValidMonthIndex(filters.month, now.getMonth());
  let startDate;
  let endDate;

  if (period === 'day') {
    startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    return { period, startDate, endDate };
  }

  if (period === 'week') {
    const currentDay = referenceDate.getDay();
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
    startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
    startDate.setDate(startDate.getDate() - diffToMonday);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    return { period, startDate, endDate };
  }

  if (period === 'month') {
    startDate = new Date(yearFromQuery, monthFromQuery, 1);
    endDate = new Date(yearFromQuery, monthFromQuery + 1, 1);
    return { period, startDate, endDate };
  }

  startDate = new Date(yearFromQuery, 0, 1);
  endDate = new Date(yearFromQuery + 1, 0, 1);
  return { period, startDate, endDate };
};

const getBucketKeyAndLabel = (date, period) => {
  if (period === 'day') {
    const hour = date.getHours();
    const key = `h-${hour.toString().padStart(2, '0')}`;
    const label = `${hour.toString().padStart(2, '0')}:00`;
    return { key, label };
  }

  if (period === 'year') {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    const label = date.toLocaleString('en-IN', { month: 'short' });
    return { key, label };
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const key = `${year}-${month}-${day}`;

  const label =
    period === 'week'
      ? date.toLocaleString('en-IN', { weekday: 'short', day: '2-digit' })
      : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  return { key, label };
};

const createBuckets = (startDate, endDate, period) => {
  const buckets = new Map();

  if (period === 'day') {
    for (let hour = 0; hour < 24; hour += 1) {
      const key = `h-${hour.toString().padStart(2, '0')}`;
      buckets.set(key, {
        key,
        label: `${hour.toString().padStart(2, '0')}:00`,
        bookings: 0,
        completed: 0,
        cancelled: 0,
        revenue: 0,
        grossRevenue: 0,
      });
    }
    return buckets;
  }

  if (period === 'year') {
    for (let month = 0; month < 12; month += 1) {
      const current = new Date(startDate.getFullYear(), month, 1);
      const { key, label } = getBucketKeyAndLabel(current, 'year');
      buckets.set(key, {
        key,
        label,
        bookings: 0,
        completed: 0,
        cancelled: 0,
        revenue: 0,
        grossRevenue: 0,
      });
    }
    return buckets;
  }

  const cursor = new Date(startDate);
  while (cursor < endDate) {
    const { key, label } = getBucketKeyAndLabel(cursor, period);
    buckets.set(key, {
      key,
      label,
      bookings: 0,
      completed: 0,
      cancelled: 0,
      revenue: 0,
      grossRevenue: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return buckets;
};

// Get appointment analytics
exports.getAppointmentAnalytics = async (req, res) => {
  try {
    const { shopId } = req.params;
    const {
      period: periodQuery = 'month',
      date: dateQuery,
      month: monthQuery,
      year: yearQuery,
    } = req.query;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        error: 'Shop ID is required'
      });
    }

    const { period, startDate, endDate } = getPeriodRange(periodQuery, {
      date: dateQuery,
      month: monthQuery,
      year: yearQuery,
    });

    const appointments = await Appointment.find({ shopId })
      .select('status totalAmount showtimes bookedAt')
      .lean();

    const periodAppointments = [];
    for (const appointment of appointments) {
      const appointmentDate = getAppointmentDate(appointment);
      if (!appointmentDate) continue;
      if (appointmentDate >= startDate && appointmentDate < endDate) {
        periodAppointments.push({ ...appointment, appointmentDate });
      }
    }

    const summary = {
      totalAppointments: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      grossRevenue: 0,
      realizedRevenue: 0,
      expectedRevenue: 0,
      cancelledRevenueLoss: 0,
      averageTicketSize: 0,
      completionRate: 0,
      cancellationRate: 0,
    };

    const serviceMap = new Map();
    const buckets = createBuckets(startDate, endDate, period);

    for (const appointment of periodAppointments) {
      const amount = Number(appointment.totalAmount) || 0;
      const status = appointment.status || 'pending';

      summary.totalAppointments += 1;
      summary.grossRevenue += amount;

      if (status === 'pending') summary.pending += 1;
      if (status === 'confirmed') summary.confirmed += 1;
      if (status === 'completed') summary.completed += 1;
      if (status === 'cancelled') summary.cancelled += 1;
      if (status === 'completed') summary.realizedRevenue += amount;
      if (status === 'pending' || status === 'confirmed') summary.expectedRevenue += amount;
      if (status === 'cancelled') summary.cancelledRevenueLoss += amount;

      const bucketMeta = getBucketKeyAndLabel(appointment.appointmentDate, period);
      if (!buckets.has(bucketMeta.key)) {
        buckets.set(bucketMeta.key, {
          key: bucketMeta.key,
          label: bucketMeta.label,
          bookings: 0,
          completed: 0,
          cancelled: 0,
          revenue: 0,
          grossRevenue: 0,
        });
      }

      const bucket = buckets.get(bucketMeta.key);
      bucket.bookings += 1;
      bucket.grossRevenue += amount;
      if (status === 'completed') {
        bucket.completed += 1;
        bucket.revenue += amount;
      }
      if (status === 'cancelled') {
        bucket.cancelled += 1;
      }

      if (Array.isArray(appointment.showtimes) && appointment.showtimes.length > 0) {
        for (const showtime of appointment.showtimes) {
          const serviceName = showtime?.service?.name?.trim() || 'Unknown Service';
          const servicePrice = Number(showtime?.service?.price);
          const serviceRevenue = Number.isFinite(servicePrice) ? servicePrice : amount;

          if (!serviceMap.has(serviceName)) {
            serviceMap.set(serviceName, { name: serviceName, bookings: 0, revenue: 0 });
          }
          const serviceStats = serviceMap.get(serviceName);
          serviceStats.bookings += 1;
          if (status === 'completed') {
            serviceStats.revenue += serviceRevenue;
          }
        }
      } else {
        const fallbackService = 'Unknown Service';
        if (!serviceMap.has(fallbackService)) {
          serviceMap.set(fallbackService, { name: fallbackService, bookings: 0, revenue: 0 });
        }
        const serviceStats = serviceMap.get(fallbackService);
        serviceStats.bookings += 1;
        if (status === 'completed') {
          serviceStats.revenue += amount;
        }
      }
    }

    summary.averageTicketSize =
      summary.totalAppointments > 0 ? summary.grossRevenue / summary.totalAppointments : 0;
    summary.completionRate =
      summary.totalAppointments > 0 ? (summary.completed / summary.totalAppointments) * 100 : 0;
    summary.cancellationRate =
      summary.totalAppointments > 0 ? (summary.cancelled / summary.totalAppointments) * 100 : 0;

    const analytics = Array.from(buckets.values()).map((bucket) => ({
      ...bucket,
      revenue: roundCurrency(bucket.revenue),
      grossRevenue: roundCurrency(bucket.grossRevenue),
    }));

    const topServices = Array.from(serviceMap.values())
      .map((service) => ({
        ...service,
        revenue: roundCurrency(service.revenue),
      }))
      .sort((a, b) => {
        if (b.bookings !== a.bookings) return b.bookings - a.bookings;
        return b.revenue - a.revenue;
      })
      .slice(0, 8);

    res.status(200).json({
      success: true,
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      summary: {
        ...summary,
        grossRevenue: roundCurrency(summary.grossRevenue),
        realizedRevenue: roundCurrency(summary.realizedRevenue),
        expectedRevenue: roundCurrency(summary.expectedRevenue),
        cancelledRevenueLoss: roundCurrency(summary.cancelledRevenueLoss),
        averageTicketSize: roundCurrency(summary.averageTicketSize),
        completionRate: Number(summary.completionRate.toFixed(2)),
        cancellationRate: Number(summary.cancellationRate.toFixed(2)),
      },
      analytics,
      topServices,
    });

  } catch (error) {
    console.error('Error fetching appointment analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment analytics'
    });
  }
};

// Get appointment by ID
exports.getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res.status(400).json({ 
        success: false,
        error: 'Appointment ID is required' 
      });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('shopId', 'shopname city address phone email services')
      .populate('timeSlot', 'date')
      .populate('userId', 'name email phone')
      .populate({
        path: 'timeSlot',
        populate: {
          path: 'showtimes',
          match: { _id: { $in: appointment?.showtimes?.map(st => st.showtimeId) } }
        }
      });

    if (!appointment) {
      return res.status(200).json({ 
        success: false,
        error: 'Appointment not found' 
      });
    }

    res.status(200).json({
      success: true,
      appointment
    });

  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch appointment details' 
    });
  }
};
