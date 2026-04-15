import React, { useState, useEffect } from 'react';
//import Card from 'react-bootstrap/Card';
import axios from 'axios';
//import tailwindcss from 'tailwindcss';
import Table from "../Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";




const columns = [
  
  { label: "Prompt", accessor: "question", sortable: false },
  { label: "Category", accessor: "category", sortable: true},
  { label: "Difficulty", accessor: "difficulty", sortable: true },
  { label: "Date Created", accessor: "date", sortable: true },
  { label: "ID", accessor: "_id", sortable: true, sortbyOrder: "desc" },
];


const default_data = {
    "question_prompt": "Who",
    "q_category" : null,
    "q_difficulty" : null
}



const url = `${process.env.REACT_APP_BACKEND_SERVER_URI}/question/getAll`;


function DatabasePage() {
  const [questions, setQuestions] = useState([]);
  const [data, setData] = useState(default_data);
  const [error, setError] = useState("");
  const [seed, setSeed] = useState(1);
  
  useEffect(() => {
    const fetch_questions = async () => {
    const result = await axios.get(url);
    //const flterd = result.data.filter(item => item.question === {"$regex": question_prompt})
    setQuestions(result.data);};
      fetch_questions();
    }, []);
  const handleChange = ({ currentTarget: input }) => {
      setData({ ...data, [input.name]: input.value });
      //console.log(data);
    };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setSeed(Math.random());
      try {
        console.log(data);
        //console.log(data!==default_data);
        if (data!==default_data) {
          console.log(url);
          console.log(data);
          //useEffect();
          
          //const result = await axios.get(url, data);
          //console.log(result.data);
          //setQuestions(result.data);
          
        }
        //const { data: res } = await axios.post(url, data);
        //console.log(data);
        const inputField = document.getElementById("form"); 
        inputField.reset(); // This resets the prompts so that the page doesn't have to be reloaded to create a new question
        setData(default_data); // This resets the values for all of the prompts
        //console.log(data); // This 
        setError(""); // This resets the error pop-up so it doesn't stick around and bother me
      } catch (error) {
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status <= 500
        ) {
          setError(error.response.data.message);
        }
      }
      
    };
  function onUpdateTable(updatedTable) {
    const updatedQuestions = data.map(
      question => {
        console.log(question.question_prompt);
        console.log(updatedTable.question_prompt);
        if (question.question_prompt === updatedTable.question_prompt) {
          return updatedTable;
        } else {return question}
      }
    )
    setQuestions(updatedQuestions)
  }

  /*
  <Form>
        <Form.Group className="mb-3" controlId="formBasicPrompt">
          <Form.Label>Question Prompt</Form.Label>
          <Form.Control type="question_prompt" name="question_prompt" onChange={handleChange} placeholder="Please enter words that appear in the question"/>
        </Form.Group>
        <Button
                  variant="primary"
                  type="submit"
                  onClick={handleSubmit}
                  className='mt-2'>
                  Filter
                </Button>
      </Form>
  */
  
  if (questions.length>0){
  return (
    <div className="table_container">
      <h1>Trivealities Question Database V0.0043</h1>
      
      <Table
        key={seed}
        data={questions}
        columns={columns}
      />
    </div>
  );}
}


export default DatabasePage;