import { getMasters, saveMasters } from "./masters.js";

export const getServicesForMaster = (masterId) => {
  const masters = getMasters();
  const master = masters.find((m) => m.id === masterId);
  return master?.services || [];
};

export const addServiceForMaster = (masterId, service) => {
  const masters = getMasters();
  const updatedMasters = masters.map((m) => {
    if (m.id === masterId) {
      return { ...m, services: [...m.services, service] };
    }
    return m;
  });
  saveMasters(updatedMasters);
};

export const removeServiceForMaster = (masterId, serviceId) => {
  const masters = getMasters();
  const updatedMasters = masters.map((m) => {
    if (m.id === masterId) {
      return {
        ...m,
        services: m.services.filter((s) => s.id !== serviceId)
      };
    }
    return m;
  });
  saveMasters(updatedMasters);
};
