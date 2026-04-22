import TableBody from "./TableBody";
import TableHead from "./TableHead";
import { useSortableTable } from "./useSortableTable";
import { UserContext } from '../App';
import React, { useState, useEffect, useContext, useRef } from 'react';


const Table = ({ data, columns }) => {
  const [tableData, handleSorting] = useSortableTable(data, columns);
  const { isLightMode } = useContext(UserContext);

  return (
    <>
      <table className="table">
        <TableHead  {...{ columns, handleSorting }} />
        <TableBody {...{ columns, tableData }} />
      </table>
    </>
  );
};

export default Table;