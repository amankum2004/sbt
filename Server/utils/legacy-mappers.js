const mapUser = (user) => {
  if (!user) return user;
  const { id, password, ...rest } = user;
  return { _id: id, ...rest };
};

const mapShopService = (service) => {
  if (!service) return service;
  const { id, shopId, ...rest } = service;
  return { _id: id, ...rest, shopId };
};

const mapShop = (shop) => {
  if (!shop) return shop;
  const { id, services, ...rest } = shop;
  return {
    _id: id,
    ...rest,
    services: Array.isArray(services) ? services.map(mapShopService) : services,
  };
};

const mapTimeSlotShowtime = (showtime) => {
  if (!showtime) return showtime;
  const { id, date, isBooked } = showtime;
  return {
    _id: id,
    date,
    is_booked: isBooked,
  };
};

const mapTimeSlot = (slot) => {
  if (!slot) return slot;
  const { id, shopOwnerId, showtimes, ...rest } = slot;
  return {
    _id: id,
    shop_owner_id: shopOwnerId,
    ...rest,
    showtimes: Array.isArray(showtimes) ? showtimes.map(mapTimeSlotShowtime) : showtimes,
  };
};

const mapTemplate = (template) => {
  if (!template) return template;
  const { id, shopOwnerId, ...rest } = template;
  return {
    _id: id,
    shop_owner_id: shopOwnerId,
    ...rest,
  };
};

const mapAppointmentShowtime = (showtime) => {
  if (!showtime) return showtime;
  const { id, showtimeId, date, serviceName, servicePrice, showtime: slotShowtime } = showtime;
  const mapped = {
    _id: id,
    showtimeId: slotShowtime
      ? {
          _id: slotShowtime.id,
          date: slotShowtime.date,
          is_booked: slotShowtime.isBooked,
        }
      : showtimeId,
    date,
    service: {
      name: serviceName,
      price: servicePrice,
    },
  };
  return mapped;
};

const mapAppointment = (appointment) => {
  if (!appointment) return appointment;
  const {
    id,
    userId,
    shopId,
    timeSlotId,
    user,
    shop,
    timeSlot,
    showtimes,
    ...rest
  } = appointment;

  return {
    _id: id,
    ...rest,
    userId: user ? mapUser(user) : userId,
    shopId: shop ? mapShop(shop) : shopId,
    timeSlot: timeSlot ? mapTimeSlot(timeSlot) : timeSlotId,
    showtimes: Array.isArray(showtimes) ? showtimes.map(mapAppointmentShowtime) : showtimes,
  };
};

const mapReview = (review) => {
  if (!review) return review;
  const { id, userId, shopId, appointmentId, user, shop, appointment, ...rest } = review;
  return {
    _id: id,
    ...rest,
    userId: user ? mapUser(user) : userId,
    shopId: shop ? mapShop(shop) : shopId,
    appointmentId: appointment ? mapAppointment(appointment) : appointmentId,
  };
};

const mapContact = (contact) => {
  if (!contact) return contact;
  const { id, ...rest } = contact;
  return { _id: id, ...rest };
};

const mapDonation = (donation) => {
  if (!donation) return donation;
  const { id, ...rest } = donation;
  return { _id: id, ...rest };
};

module.exports = {
  mapUser,
  mapShop,
  mapShopService,
  mapTimeSlot,
  mapTimeSlotShowtime,
  mapTemplate,
  mapAppointment,
  mapAppointmentShowtime,
  mapReview,
  mapContact,
  mapDonation,
};
