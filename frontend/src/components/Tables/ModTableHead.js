import { UserContext } from '../../App';
import React, { useState, useEffect, useContext, useRef } from 'react';
const ModTableHead = ({ columns, handleSorting }) => {
  const [sortField, setSortField] = useState("");
  const [order, setOrder] = useState("asc");
  const { isLightMode } = useContext(UserContext);

  const handleSortingChange = (accessor) => {
    const sortOrder =
      accessor === sortField && order === "asc" ? "desc" : "asc";
    setSortField(accessor);
    setOrder(sortOrder);
    handleSorting(accessor, sortOrder);
  };

  return (
    <thead >
      <tr>
        {columns.map(({ label, accessor, sortable }) => {
          const cl = sortable
            ? sortField === accessor && order === "asc"
              ? "up"
              : sortField === accessor && order === "desc"
              ? "down"
              : "default"
            : "";
          return (
            <th
              key={accessor}
              onClick={sortable ? () => handleSortingChange(accessor) : null}
              className={cl} 
              style={{color: isLightMode? "#7b0445": "#f18900"}}
            >
              {label}
            </th>
          );
        })}
        <th key="Edit" style={{color: isLightMode? "#7b0445": "#f18900"}}>Edit</th>
      </tr>
      
    </thead>
  );
};

export default ModTableHead;