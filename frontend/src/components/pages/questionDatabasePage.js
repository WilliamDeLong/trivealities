import React, { useState, useEffect } from 'react';
//import Card from 'react-bootstrap/Card';
import axios from 'axios';
//import tailwindcss from 'tailwindcss';
import Table from "../Table";


const columns = [
  { label: "ID", accessor: "_id", sortable: true, sortbyOrder: "desc" },
  { label: "Prompt", accessor: "question", sortable: false },
  { label: "Category", accessor: "category", sortable: true},
  { label: "Difficulty", accessor: "difficulty", sortable: true },
  
];


function DatabasePage() {
  const [questions, setQuestions] = useState([]);


  useEffect(() => {
    async function fetchData() {
      const result = await axios(
        'http://localhost:8081/question/getAll',
      );
      setQuestions(result.data);
    }
    fetchData();
  }, []);
  if (questions.length>0){
  return (
    <div className="table_container">
      <h1>Trivealities Question Database V0.0043</h1>
      <Table
        data={questions}
        columns={columns}
      />
      <br />
      <br />
    </div>
  );}
}


export default DatabasePage;