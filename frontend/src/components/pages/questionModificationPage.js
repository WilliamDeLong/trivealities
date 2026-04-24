import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import API_BASE from '../../api';
import getUserInfo from "../../utilities/decodeJwt";
import { UserContext } from '../../App';

const PRIMARY_COLOR = "#f18900";
const SECONDARY_COLOR = '#0c0c1f'
const url = `${API_BASE}/question/create`;
const data_default = { _id: "", question: "", correct_answer: "", incorrect_answer1: "", incorrect_answer2: "", incorrect_answer3: "", category: "any", difficulty: 'any'};

const QuestionModificationPage = () => {
  const [user, setUser] = useState(getUserInfo());
  const [admin, setAdmin] = useState(false);
  const [data, setData] = useState(data_default);
  const [error, setError] = useState("");
  const [light, setLight] = useState(false);
  const [bgColor, setBgColor] = useState(SECONDARY_COLOR);
  const { isLightMode } = useContext(UserContext);
  const [bgText, setBgText] = useState('Light Mode')
  const navigate = useNavigate();

  let TextyStyling = {
    color: isLightMode? "#0c0c0c": "#ffe5f3",
    //fontWeight: "lighter",
  };
 
  let labelStyling = {
    color: isLightMode? "#7b0445": "#f18900",
    fontWeight: "bold",
    textDecoration: "none",
  };
  let backgroundStyling = { background: bgColor};
  let buttonStyling = {
    background: isLightMode? "#7b0445": "#f18900",
    borderStyle: "none",
    color: bgColor,
  };

  const handleChange = ({ currentTarget: input }) => {
    //console.log(input.name);
    //console.log(input.name+":",input.value);
    //const ques = newQuestionModel.findOne({ question: input.value });
    //console.log(ques);
    setData({ ...data, [input.name]: input.value });
    //console.log(data);
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

  useEffect(() => {
    setUser(getUserInfo());
	fetch_admin();
    //console.log(isLightMode);
    if (isLightMode) {
      setBgColor("white");
      setBgText('Dark mode')
    } else {
      setBgColor(SECONDARY_COLOR);
      setBgText('Light mode')
    }
  }, [light]);
  const { username } = user;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      //console.log(data);
      const { data: res } = await axios.post(url, data);
      //console.log(data);
      //const { accessToken } = res;
      //store token in localStorage
      //localStorage.setItem("accessToken", accessToken);
      const inputField = document.getElementById("form"); 
      inputField.reset(); // This resets the prompts so that the page doesn't have to be reloaded to create a new question
      setData(data_default); // This resets the values for all of the prompts
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

  if (!admin) return (
        <div><h4>Only Administrative accounts have access to this page.</h4></div>
    ) 
  return (
    <>
      <section className="vh-100">
        <div className="container-fluid h-custom vh-100">
          <div
            className="row d-flex justify-content-center h-100 "
            style={{background: isLightMode ? "linear-gradient(135deg, #f8fafc, #dbeafe, #ede9fe)": "linear-gradient(135deg, #020617, #0f172a, #1e1b4b)",
                        color: isLightMode? "#000000": "#ffffff"}}>
            <div className="col-xl-8 offset-xl-0">
              <Form id='form'>
                <Form.Group className="mb-3" controlId="formBasicPrompt">
                  <Form.Label style={labelStyling}>Question Prompt</Form.Label>
                  <Form.Control type="question" name="question" onChange={handleChange} placeholder="Please enter the prompt that will display for the question."/>
                </Form.Group>
                <table>
                  <tbody>
                <tr>
                
                <td width="50%">
                <Form.Group className="mb-3" controlId="formBasicAnswer">
                    <Form.Label style={labelStyling}>Correct Answer</Form.Label>
                    <br></br><Form.Text className="text" style={TextyStyling}>
                      This is the correct answer to the question, there will only be one correct answer.
                    </Form.Text>
                    <Form.Control
                      type="correct_answer"
                      name="correct_answer"
                      placeholder="Insert correct answer here."
                      onChange={handleChange}
                    />
                    
                  </Form.Group>
                <Form.Group className="mb-3" controlId="formQuestionCategory">
                  <Form.Label style={labelStyling}>Question Category</Form.Label>
                  <select name="category" id="formQuestionCategory" className="form-control" onChange={handleChange}>
                      <option value="any">Any Category</option>
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
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formQuestionDifficulty">
                  <Form.Label style={labelStyling}>Question Difficulty</Form.Label>
                  <select name="difficulty" id="formQuestionDifficulty" className="form-control" onChange={handleChange}>
                      <option value="any">Any Difficulty</option>
                      <option value="0">Easy</option>
                      <option value="1">Medium</option>
                      <option value="2">Hard</option>
                </select>
                </Form.Group>
                
                </td>
                
                
                <td className="alignRight">
                <Form.Group className="mb-3" controlId="formBasicWrongAnswer1">
                  <Form.Label style={labelStyling}>Incorrect Answer 1</Form.Label>
                  <br></br>
                  <Form.Text className="text" style={TextyStyling}>
                    This is where you put the incorrect answers, try to play some mindgames.
                  </Form.Text>
                  <Form.Control
                    type="incorrect_answer1"
                    name="incorrect_answer1"
                    placeholder="Insert first incorrect answer here."
                    onChange={handleChange}
                  />

                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formBasicWrongAnswer2">
                  <Form.Label style={labelStyling}>Incorrect Answer 2</Form.Label>
                  <Form.Control
                    type="incorrect_answer2"
                    name="incorrect_answer2"
                    placeholder="Insert second incorrect answer here."
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicWrongAnswer3">
                  <Form.Label style={labelStyling}>Incorrect Answer 3</Form.Label>
                  <Form.Control
                    type="incorrect_answer3"
                    name="incorrect_answer3"
                    placeholder="Insert third incorrect answer here."
                    onChange={handleChange}
                  />
                </Form.Group>
                </td>
                </tr>
                </tbody>
                </table>

                
                {error && <div style={labelStyling} className='pt-3'>{error}</div>}
                <Button
                  variant="primary"
                  type="submit"
                  onClick={handleSubmit}
                  style={buttonStyling}
                  className='mt-2'
                  disabled = { // Disables the button's functions if options are not filled in
                    data['question'].length ===0 || 
                    data['correct_answer'].length ===0 || 
                    data['incorrect_answer1'].length ===0 || 
                    data['incorrect_answer2'].length ===0 || 
                    data['incorrect_answer3'].length ===0 || 
                    data['category'] ==='any' || 
                    data['difficulty'] ==='any'
                  }>
                  Submit question
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default QuestionModificationPage;
