import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import getUserInfo from "../../utilities/decodeJwt";
import Container from 'react-bootstrap/Container';

const PRIMARY_COLOR = "#cc5c99";
const SECONDARY_COLOR = '#0c0c1f'
const url = `${process.env.REACT_APP_BACKEND_SERVER_URI}/question/create`;

const QuestionCreationPage = () => {
  const [user, setUser] = useState(null)
  const [data, setData] = useState({ questionPrompt: "", correctAnswer: "", incorrectAnswer1: "", incorrectAnswer2: "", incorrectAnswer3: "", category: 0, difficulty: 0});
  const [error, setError] = useState("");
  const [light, setLight] = useState(false);
  const [bgColor, setBgColor] = useState(SECONDARY_COLOR);
  const [bgText, setBgText] = useState('Light Mode')
  const navigate = useNavigate();

  let labelStyling = {
    color: PRIMARY_COLOR,
    fontWeight: "bold",
    textDecoration: "none",
  };
  let backgroundStyling = { background: bgColor};
  let buttonStyling = {
    background: PRIMARY_COLOR,
    borderStyle: "none",
    color: bgColor,
  };
  let tbleStyling = {
    width: 800,
  };

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  useEffect(() => {

    const obj = getUserInfo(user)
    setUser(obj)

    if (light) {
      setBgColor("white");
      setBgText('Dark mode')
    } else {
      setBgColor(SECONDARY_COLOR);
      setBgText('Light mode')
    }
  }, [light]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: res } = await axios.post(url, data);
      const { accessToken } = res;
      //store token in localStorage
      localStorage.setItem("accessToken", accessToken);
      navigate("/questionCreate");
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


  return (
    <>
      <section className="vh-100">
        <div className="container-fluid h-custom vh-100">
          <div
            className="row d-flex justify-content-center h-100 "
            style={backgroundStyling}>
            <div className="col-xl-8 offset-xl-0">
              <Form>
                <Form.Group className="mb-3" controlId="formBasicPrompt">
                  <Form.Label style={labelStyling}>Question Prompt</Form.Label>
                  <Form.Control type="questionPrompt" name="questionPrompt" onChange={handleChange} placeholder="Please enter the prompt that will display for the question."/>
                  </Form.Group>
                <table style={tbleStyling}>
                <tr>
                
                <td>
                  <Form.Group className="mb-3" controlId="formBasicAnswer">
                    <Form.Label style={labelStyling}>Correct Answer</Form.Label>
                    <br></br><Form.Text className="text-muted">
                      Insert the correct answer to the question, there will only be one correct answer.
                    </Form.Text>
                    <Form.Control
                      type="correctAnswer"
                      name="correctAnswer"
                      placeholder="Insert correct answer here."
                      onChange={handleChange}
                    />
                    
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formQuestionCategory">
                  <Form.Label style={labelStyling}>Question Category</Form.Label>
                  <select name="trivia_category" class="form-control">
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
                  <select name="difficulty" class="form-control">
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
                  <Form.Text className="text-muted">
                    This is where you put the answers that are incorrect, but will still show up in the question.
                    Try to play some mindgames.
                  </Form.Text>
                  <Form.Control
                    type="incorrectAnswer1"
                    name="incorrectAnswer1"
                    placeholder="Insert first incorrect answer here."
                    onChange={handleChange}
                  />

                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formBasicWrongAnswer2">
                  <Form.Label style={labelStyling}>Incorrect Answer 2</Form.Label>
                  <Form.Control
                    type="incorrectAnswer2"
                    name="incorrectAnswer2"
                    placeholder="Insert second incorrect answer here."
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicWrongAnswer3">
                  <Form.Label style={labelStyling}>Incorrect Answer 3</Form.Label>
                  <Form.Control
                    type="incorrectAnswer3"
                    name="incorrectAnswer3"
                    placeholder="Insert third incorrect answer here."
                    onChange={handleChange}
                  />
                </Form.Group>
                </td>
                </tr>
                </table>

                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                  <Form.Text className="text-muted pt-1">
                    Dont have an account?
                    <span>
                      <Link to="/signup" style={labelStyling}> Sign up
                      </Link>
                    </span>
                  </Form.Text>
                </Form.Group>
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="flexSwitchCheckDefault"
                    onChange={() => { setLight(!light) }}
                  />
                  <label class="form-check-label" for="flexSwitchCheckDefault" className='text-muted'>
                    {bgText}
                  </label>
                </div>
                {error && <div style={labelStyling} className='pt-3'>{error}</div>}
                <Button
                  variant="primary"
                  type="submit"
                  onClick={handleSubmit}
                  style={buttonStyling}
                  className='mt-2'
                >
                  Log In
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default QuestionCreationPage;
