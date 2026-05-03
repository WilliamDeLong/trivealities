import React, { useState, useEffect, useContext } from 'react';
//import Card from 'react-bootstrap/Card';
import axios from 'axios';
//import tailwindcss from 'tailwindcss';
import ModTable from "../Tables/ModTable";
import API_BASE from '../../api';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import getUserInfo from "../../utilities/decodeJwt";
import { UserContext } from '../../App';



const columns = [
  //{ label: "ID", accessor: "_id", sortable: true, sortbyOrder: "desc" },
  { label: "Prompt", accessor: "question", sortable: false },
  { label: "Category", accessor: "category", sortable: true},
  { label: "Difficulty", accessor: "difficulty", sortable: true },
  { label: "Date", accessor: "date", sortable: true ,sortbyOrder: "desc"  },
  { label: "Correct Answer", accessor: "correct_answer", sortable: false },
  { label: "Incorrect Answer 1", accessor: "incorrect_answer1", sortable: false },
  { label: "Incorrect Answer 2", accessor: "incorrect_answer2", sortable: false },
  { label: "Incorrect Answer 3", accessor: "incorrect_answer3", sortable: false },
  //{ label: "Edit Question", accessor: "no", sortable: true, sortbyOrder: "desc" },
  
  
];


const default_data = {
    "question_prompt": null,
    "q_category" : null,
    "q_difficulty" : null
}



const url = `${API_BASE}/question/findQuestion`;
// `${API_BASE}/question/findQuestion`

function AdminDatabasePage() {
  const [user, setUser] = useState(getUserInfo());
  const [questions, setQuestions] = useState([]);
  const [data, setData] = useState(default_data);
  const [isAdmin, setAdmin] = useState();
  const [error, setError] = useState("");
  const { isLightMode } = useContext(UserContext);
  const [seed, setSeed] = useState(1);

  let PStyling = {
    background: isLightMode ? "linear-gradient(135deg, #f8fafc, #dbeafe, #ede9fe)": "linear-gradient(135deg, #020617, #0f172a, #1e1b4b)",
    color: isLightMode? "#7b0445": "#f18900", border: isLightMode? "#ffffff": "#000000",
    height:"fit-content",
    minHeight: "663px",
    };
  const fetch_admin = async () => {
    if (user["id"]) {
      //console.log(user["id"]);
      //console.log(!user["id"]);
      const result = await axios.get(`${API_BASE}/user/${user["id"]}/admin`);
      //console.log(result);
      //const otherRes = result.then(result2 => result2.data.success);
      setAdmin(result.data.success);
    }
  };
  
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
        //console.log(result);
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
    function reload_db() {
      setSeed(Math.random());
    }
    const reloader = async (e) => {
      //e.preventDefault();
      fetch_questions();
      await reload_db();
    };
    
  
  useEffect(() => {
    fetch_questions();
    fetch_admin();
    }, []);
    
  const handleChange = ({ currentTarget: input }) => {
      setData({ ...data, [input.name]: input.value });
      //console.log(data);
    };
  if (isAdmin!=true) {
    return (
      <div><h4>Only Admins can access this page.</h4></div>
    );
  }
  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        //console.log("Take 1");
        fetch_questions();
        //console.log("Take 2");
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

  
  if (questions.length>0&&isAdmin){
  return (
    <div style={PStyling}>
      <div className="modTable">
        <h1>Trivealities Question Editing Database V1</h1>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicPrompt">
            <table >
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
                        className='mt-2'
                        style = {{background: isLightMode? "#7b0445": "#f18900", border: isLightMode? "#000000": "#ffffff"}}
                        >
                        Filter
                      </Button>
                    </td>
                  </tr>
                  </tbody>
            </table>
          </Form.Group>
        </Form>
        {error && <div className='pt-3'>{error}</div>}
        {isAdmin && <ModTable 
          width='100'
          key={seed}
          data={questions}
          columns={columns}
          sed = {reloader}
        />}
      </div>
    </div>
  );
  } else if  (isAdmin==false) {
    return (
      <div><h4>Only Admins can access this page.</h4></div>
    );
  }
}


export default AdminDatabasePage;