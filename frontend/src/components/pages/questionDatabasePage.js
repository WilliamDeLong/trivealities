import React, { useState, useEffect } from 'react';
//import Card from 'react-bootstrap/Card';
import axios from 'axios';
//import tailwindcss from 'tailwindcss';
import Table from "../Table";
import API_BASE from '../../api';
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
    "question_prompt": null,
    "q_category" : null,
    "q_difficulty" : null
}



const url = `${process.env.REACT_APP_BACKEND_SERVER_URI}/question/findQuestion`;
// `${API_BASE}/question/findQuestion`

function DatabasePage() {
  const [questions, setQuestions] = useState([]);
  const [data, setData] = useState(default_data);
  const [error, setError] = useState("");
  const [seed, setSeed] = useState(1);
  const fetch_questions = async () => {
      try {
        //console.log(data);
        if (data["q_category"] === "null") {
          data["q_category"] = null;
        };
        if (data["q_difficulty"] === "null") {
          data["q_difficulty"] = null;
        };
        const result = await axios.get(url, {params: data});
        setQuestions(result.data);
        setSeed(Math.random());
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
  
  useEffect(() => {
    
    fetch_questions();
    }, []);
  const handleChange = ({ currentTarget: input }) => {
      setData({ ...data, [input.name]: input.value });
      //console.log(data);
    };

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        console.log("Take 1");
        fetch_questions();
        console.log("Take 2");
        //const inputField = document.getElementById("form"); 
        //inputField.reset(); // This resets the prompts so that the page doesn't have to be reloaded to create a new question
        //setData(default_data); // This resets the values for all of the prompts
        //console.log(data); // This 
        //setError(""); // This resets the error pop-up so it doesn't stick around and bother me
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

  
  if (questions.length>0){
  return (
    <div className="table_container">
      <h1>Trivealities Question Database V0.0043</h1>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicPrompt">
          <table>
            <tbody>
              <tr>
                <td width="45%">
                  <Form.Label>Question Prompt</Form.Label>
                  <Form.Control type="question_prompt" name="question_prompt" onChange={handleChange} placeholder="Please enter words that appear in the question"/>
                </td>
                <td width="20%">
                  <Form.Label>Question Category</Form.Label>
                      <select name="q_category" id="formQuestionCategory" className="form-control" onChange={handleChange}>
                          <option value="null">Any Category</option>
                          <option value="9">General Knowledge</option>
                          <option value="10">Entertainment: Books</option>
                          <option value="11">Entertainment: Film</option>
                          <option value="12">Entertainment: Music</option>
                          <option value="13">Entertainment: Musicals &amp; Theatres</option>
                          <option value="14">Entertainment: Television</option>
                          <option value="15">Entertainment: Video Games</option>
                          <option value="16">Entertainment: Board Games</option>
                          <option value="17">Science &amp; Nature</option>
                          <option value="18">Science: Computers</option>
                          <option value="19">Science: Mathematics</option>
                          <option value="20">Mythology</option>
                          <option value="21">Sports</option>
                          <option value="22">Geography</option>
                          <option value="23">History</option>
                          <option value="24">Politics</option>
                          <option value="25">Art</option>
                          <option value="26">Celebrities</option>
                          <option value="27">Animals</option>
                          <option value="28">Vehicles</option>
                          <option value="29">Entertainment: Comics</option>
                          <option value="30">Science: Gadgets</option>
                          <option value="31">Entertainment: Japanese Anime &amp; Manga</option>
                          <option value="32">Entertainment: Cartoon &amp; Animations</option>
                      </select>
                  </td>
                  <td width="20%">
                    <Form.Label>Question Difficulty</Form.Label>
                    <select name="q_difficulty" id="formQuestionDifficulty" className="form-control" onChange={handleChange}>
                        <option value="null">Any Difficulty</option>
                        <option value="0">Easy</option>
                        <option value="1">Medium</option>
                        <option value="2">Hard</option>
                    </select>
                  </td>
                  <td width="10%">
                    <br/>
                    <Button
                      variant="primary"
                      type="submit"
                      onClick={handleSubmit}
                      className='mt-2'>
                      Filter
                    </Button>
                  </td>
                </tr>
                </tbody>
          </table>
        </Form.Group>
      </Form>
      {error && <div className='pt-3'>{error}</div>}
      <Table
        key={seed}
        data={questions}
        columns={columns}
      />
    </div>
  );}
}


export default DatabasePage;