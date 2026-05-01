import ModTableBody from "./ModTableBody";
import ModTableHead from "./ModTableHead";
import { useSortableModTable } from "./sortableModTable";
import { UserContext } from '../../App';
import React, { useState, useEffect, useContext, useRef } from 'react';


const ModTable = ({ data, columns }) => {
  const [tableData, handleSorting] = useSortableModTable(data, columns);
  const { isLightMode } = useContext(UserContext);

  return (
    <>
      <table className="table">
        <ModTableHead  {...{ columns, handleSorting }} />
        <ModTableBody {...{ columns, tableData }} />
      </table>
    </>
  );
};

export default ModTable;