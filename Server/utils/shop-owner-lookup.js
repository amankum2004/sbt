const { normalizePhone } = require("./phone");

const isOwnerPhoneColumnError = (error) => {
  const errorText = `${error?.message || ""} ${error?.meta?.column || ""} ${error?.meta?.modelName || ""}`;
  return (
    error?.code === "P2022" &&
    /ownerphone|owner_phone/i.test(errorText)
  );
};

const buildLookupArgs = (field, phone, extraArgs = {}) => ({
  ...extraArgs,
  where: {
    [field]: phone,
  },
});

const findShopForOwner = async (prismaClient, ownerPhone, extraArgs = {}) => {
  const normalizedOwnerPhone = normalizePhone(ownerPhone);

  if (!normalizedOwnerPhone) return null;

  try {
    const ownerPhoneShop = await prismaClient.shop.findFirst(
      buildLookupArgs("ownerPhone", normalizedOwnerPhone, extraArgs)
    );

    if (ownerPhoneShop) {
      return ownerPhoneShop;
    }
  } catch (error) {
    if (!isOwnerPhoneColumnError(error)) {
      throw error;
    }

    console.warn(
      "ownerPhone lookup is unavailable in the current database schema. Falling back to shop phone lookup."
    );
  }

  return prismaClient.shop.findFirst(
    buildLookupArgs("phone", normalizedOwnerPhone, extraArgs)
  );
};

const findExistingShopForOwner = async (
  prismaClient,
  ownerPhone,
  email,
  extraArgs = {}
) => {
  const normalizedOwnerPhone = normalizePhone(ownerPhone);
  const ownerPhoneFilter = normalizedOwnerPhone
    ? [{ ownerPhone: normalizedOwnerPhone }]
    : [];
  const phoneFilter = normalizedOwnerPhone ? [{ phone: normalizedOwnerPhone }] : [];
  const emailFilter = email
    ? [
        {
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
      ]
    : [];

  try {
    return await prismaClient.shop.findFirst({
      ...extraArgs,
      where: {
        OR: [...ownerPhoneFilter, ...emailFilter],
      },
    });
  } catch (error) {
    if (!isOwnerPhoneColumnError(error)) {
      throw error;
    }

    console.warn(
      "ownerPhone duplicate-check is unavailable in the current database schema. Falling back to shop phone lookup."
    );

    return prismaClient.shop.findFirst({
      ...extraArgs,
      where: {
        OR: [...phoneFilter, ...emailFilter],
      },
    });
  }
};

module.exports = {
  findShopForOwner,
  findExistingShopForOwner,
  isOwnerPhoneColumnError,
};
