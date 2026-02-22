let ioInstance = null;

const getShopRoom = (shopId) => `shop:${shopId}`;

const setSocketIO = (io) => {
  ioInstance = io;
};

const getSocketIO = () => ioInstance;

const emitShopSlotsUpdated = (shopId, payload = {}) => {
  if (!ioInstance || !shopId) {
    return false;
  }

  const eventPayload = {
    shopId: String(shopId),
    emittedAt: new Date().toISOString(),
    ...payload,
  };

  const roomName = getShopRoom(String(shopId));
  ioInstance.to(roomName).emit('shop_slots_updated', eventPayload);
  ioInstance.to(roomName).emit('shop_slot_booked', eventPayload);
  return true;
};

module.exports = {
  setSocketIO,
  getSocketIO,
  getShopRoom,
  emitShopSlotsUpdated,
};
