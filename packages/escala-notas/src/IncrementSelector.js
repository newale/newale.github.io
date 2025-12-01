import React from "react";
import { Select } from "baseui/select";

const increments = [1, 0.5, 0.25, 0.1, 5, 10];

export default function IncrementSelector({ value, onChange }) {
  const options = increments.map(inc => ({ label: inc.toString(), id: inc }));
  return (
    <Select
      options={options}
      value={options.filter(opt => opt.id === value)}
      onChange={params => {
        if (params.value && params.value[0]) {
          onChange(Number(params.value[0].id));
        }
      }}
      clearable={false}
      searchable={false}
      overrides={{ Root: { style: { minWidth: '100px' } } }}
    />
  );
}
