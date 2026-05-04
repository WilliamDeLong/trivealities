import { UserContext } from '../../App';
import React, { useState, useEffect, useContext, useRef } from 'react';
//import {setSeed, seed} from "../pages/AdminDatabasePage";
import ModifyQuestionBody from './ModifyQuestionBody';

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
    color: "#f18900"
  };

const ModTableBody = ({ tableData, columns, sed }) => {
  const { isLightMode } = useContext(UserContext);
  const [error, setError] = useState("");
  const [data, setData] = useState(data_default);
  const [question2mod, setQuestion2Mod] = useState(data_default);
  const [idOfEditingQ, setIDofEdit] = useState(null);
  //const [seed, setSeed] = useState(sed);
  

  // used useMemo because i want to update my planDropDownOptions only if data or planToCompare values gets changed
  const setEdittingID = async (e) => {
    e.preventDefault();
    try {
      //console.log(e);
      //console.log(e);
      setIDofEdit(e.target.className);
      //setQuestion2Mod()
      
      //setSeed(Math.random());
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
  function resetID_Submit () {
    setIDofEdit(null);
    sed();
    sed();
  };
  const reset_ID = async (e) => {
    e.preventDefault();
    try {
      //console.log(e);
      //console.log(e);
      setIDofEdit(null);
      //setQuestion2Mod()
      
      //setSeed(Math.random());
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
  //console.log(columns);


  return (
    //<tbody >
    <>
      {tableData.map((data) => {
        return (
          <tbody key={data._id}>
          <tr key={"Row_"+data._id} >
            {columns.map(({ accessor }) => { 
              if (accessor === "category") {
                const tData = categories[data[accessor]] ? categories[data[accessor]] : 'Unknown Category';
                return <td key={accessor} style={{color: isLightMode? "#7b0445": "#f18900"}}>{tData}</td>;
              }
              else if (accessor === "difficulty") {
                const tData = difficulties[data[accessor]] ? difficulties[data[accessor]] : 'Unknown Difficulty';
                return <td key={accessor} style={{color: isLightMode? "#7b0445": "#f18900"}}>{tData}</td>;
              }
              else if (accessor === "date") {

                const tData = data[accessor] ? new Date(data[accessor]).toLocaleDateString() : "invalid date";
                return <td key={accessor} style={{color: isLightMode? "#7b0445": "#f18900"}}>{tData}</td>;
              }
              else {
                const tData = data[accessor] ? data[accessor] : "——";
                return <td key={accessor} style={{color: isLightMode? "#7b0445": "#f18900"}}>{tData}</td>;
              }
            })}
            
            <td 
            className = {data._id}
          key={data._id+"Edit"} 
          onClick={setEdittingID}
          style={{color: isLightMode? "#7b0445": "#f18900"}}>
            Edit
            </td>
            </tr>
            
            {idOfEditingQ===data._id && <ModifyQuestionBody 
          width='100'
          key={"QModify_"+data._id}
          data={data}
          columns={columns}
          q_id={idOfEditingQ}
          set_id_funct = {reset_ID}
          reset_submit = {resetID_Submit}
        />}
            
            
            </tbody>
        );
      })}
    </>//</tbody>
  );
};

export default ModTableBody;