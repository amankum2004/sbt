import React from 'react';

const ServiceInput = ({ service, index, handleServiceChange, handleRemoveService }) => {
  return (
    <div className="service-input">
      <input
        type="text"
        name="service"
        placeholder="Service"
        value={service.service}
        onChange={(e) => handleServiceChange(e, index)}
        required
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={service.price}
        onChange={(e) => handleServiceChange(e, index)}
        required
      />
      <button type="button" onClick={() => handleRemoveService(index)}>Remove</button>
    </div>
  );
};

export default ServiceInput;
