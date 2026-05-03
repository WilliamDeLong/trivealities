import { UserContext } from '../../App';
import React, { useState, useEffect, useContext, useRef } from 'react';
import {setSeed, seed} from "../pages/AdminDatabasePage";
import Form from "react-bootstrap/Form";
import API_BASE from '../../api';
import axios from "axios";

//import {TextInput, StyleSheet} from 'react-native';


const data_default = { question: "", correct_answer: "", incorrect_answer1: "", incorrect_answer2: "", incorrect_answer3: "", category: "any", difficulty: 'any'};

const categories = {'any': "Any Category", 
9: "General Knowledge", 
10: "Entertainment: Books", 
11: "Entertainment: Film", 
12: "Entertainment: Music", 
13: "Entertainment: Musicals & Theaters", 
14: "Entertainment: Television", 
15: "Entertainment: Video Games", 
16: "Entertainment: Board Games", 
17: "Science & Nature", 
18: "Science: Computers", 
19: "Science: Mathematics", 
20: "Mythology", 
21: "Sports", 
22: "Geography", 
23: "History", 
24: "Politics", 
25: "Art", 
26: "Celebrities", 
27: "Animals", 
28: "Vehicles", 
29: "Entertainment: Comics", 
30: "Science: Gadgets", 
31: "Entertainment: Japanese Anime & Manga", 
32: "Entertainment: Cartoon & Animations"};

const difficulties = {
  "any": "Any Difficulty",
  0: "Easy",
  1: "Medium",
  2: "Hard"
};

let EditSty = {
    color: "#ff2f00"
  };

const url = `${API_BASE}/question/editQuestion`;

const ModifyQuestionBody = ({ data, columns, q_id, set_id_funct, reset_submit}) => {
  const { isLightMode } = useContext(UserContext);
  const [error, setError] = useState("");
  const [data2, setData] = useState(data);
  const [question2mod, setQuestion2Mod] = useState(data_default);
  const [idOfEditingQ, setIDofEdit] = useState(q_id);
  //const [seed, setSeed] = useState(sed);
  const handleChange = ({ currentTarget: input }) => {
    //console.log(input.name);
    //console.log(input.id+": ",input.value);
    //const ques = newQuestionModel.findOne({ question: input.value });
    if (input.id==="category"||input.id==="difficulty") {
      //console.log("Parsed!");
      //input.value=parseInt(input.value);
      setData({ ...data2, [input.id]: parseInt(input.value) });
    }
    else {
      setData({ ...data2, [input.id]: input.value });
    }    
    //console.log(data2);
    //console.log(data);
  };
  

  const handlePush_Update = async (e) => {
    e.preventDefault();
    try {
      //console.log(data);
      //console.log(e.target.id);
      data2["questionId"] = q_id;
      await axios.post(url, data2);
      //console.log(data2);
      //const inputField = document.getElementById("form"); 
      //inputField.reset(); // This resets the prompts so that the page doesn't have to be reloaded to create a new question
      //setData(data_default); // This resets the values for all of the prompts
      //console.log(data); // This 
      reset_submit()
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
  //console.log(data2);


  return (
    <>
      <tr key={"ModifyRow_"+data2._id} style={{width:"fit-content"}}>
            {columns.map(({ accessor }) => { 
              const tData = data2[accessor];
              if (accessor === "category") {
                return <td id={accessor+"_select"} key={accessor+"_select"} style={{width:"10px"}}>
                  <select id={accessor} key={accessor+"_select"} defaultValue={tData} onChange={handleChange} style={{color: isLightMode? "#a0316e": "#ff2f00", }}>
                    <option style={{width:"10px"}} value={9}>General Knowledge</option>
                    <option style={{width:"10px"}} value={10}>Books</option>
                    <option style={{width:"10px"}} value={11}>Film</option>
                    <option style={{width:"10px"}} value={12}>Music</option>
                    <option style={{width:"10px"}} value={13}>Musicals & Theaters</option>
                    <option style={{width:"10px"}} value={14}>Television</option>
                    <option style={{width:"10px"}} value={15}>Video Games</option>
                    <option style={{width:"10px"}} value={16}>Board Games</option>
                    <option style={{width:"10px"}} value={17}>Science & Nature</option>
                    <option style={{width:"10px"}} value={18}>Science: Computers</option>
                    <option style={{width:"10px"}} value={19}>Science: Mathematics</option>
                    <option style={{width:"10px"}} value={20}>Mythology</option>
                    <option style={{width:"10px"}} value={21}>Sports</option>
                    <option style={{width:"10px"}} value={22}>Geography</option>
                    <option style={{width:"10px"}} value={23}>History</option>
                    <option style={{width:"10px"}} value={24}>Politics</option>
                    <option style={{width:"10px"}} value={25}>Art</option>
                    <option style={{width:"10px"}} value={26}>Celebrities</option>
                    <option style={{width:"10px"}} value={27}>Animals</option>
                    <option style={{width:"10px"}} value={28}>Vehicles</option>
                    <option style={{width:"10px"}} value={29}>Comics</option>
                    <option style={{width:"10px"}} value={30}>Science: Gadgets</option>
                    <option style={{width:"10px"}} value={31}>Anime & Manga</option>
                    <option style={{width:"10px"}} value={32}>Cartoon & Animations</option>
                  </select></td>;
              }
              else if (accessor === "difficulty") {
                //const tData = difficulties[data2[accessor]] ? difficulties[data2[accessor]] : 'Unknown Difficulty';
                return <td id={accessor+"_select"} key={accessor}>
                  <select id={accessor} key={accessor+"_select"} defaultValue={tData} onChange={handleChange} style={{color: isLightMode? "#a0316e": "#ff2f00"}}>
                    <option style={{width:"10px"}} value={0}>Easy</option>
                    <option style={{width:"10px"}} value={1}>Medium</option>
                    <option style={{width:"10px"}} value={2}>Hard</option>
                  </select></td>;
              }
              else if (accessor === "date") {

                const tDate = data2[accessor] ? new Date(data2[accessor]).toLocaleDateString() : "invalid date";
                return <td id={accessor} key={accessor} style={{color: isLightMode? "#a0316e": "#ff2f00"}}>{tDate}</td>;
              }
              else if (accessor === "question") {
                return <td id={accessor+"_prompt"} key={accessor}>
                  <textarea id={accessor} readOnly={false} key={accessor+"_input"} cols={30} defaultValue={tData} onChange={handleChange} style={{color: isLightMode? "#a0316e": "#ff2f00",minWidth:"100%"}}/></td>;

              }
              else {
                //const tData = data2[accessor] ? data2[accessor] : "——";
                return <td id={accessor+"_prompt"} key={accessor} style={{height: "fit-content",maxWidth:"fit-content"}}>
                  <textarea id={accessor} readOnly={false} key={accessor+"_input"} cols={7} defaultValue={tData} onChange={handleChange} style={{color: isLightMode? "#a0316e": "#ff2f00", minHeight:"fit-content"}}/></td>;
              }
            })}
            
            <td> 
              <button
          key={data2._id+"Save"} 
          onClick={handlePush_Update}
          style={{color: isLightMode? "#a0316e": "#ff2f00"}}>
            Save
            </button>
            <button 
            className={null}
          key={data2._id+"Cancel"} 
          onClick={set_id_funct}
          style={{color: isLightMode? "#a0316e": "#ff2f00"}}>Cancel
            </button>
            </td>
            </tr>
    </>
  );
};

export default ModifyQuestionBody;