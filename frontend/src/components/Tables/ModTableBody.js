import { UserContext } from '../../App';
import React, { useState, useEffect, useContext, useRef } from 'react';

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

const ModTableBody = ({ tableData, columns }) => {
  const { isLightMode } = useContext(UserContext);
  return (
    <tbody >
      {tableData.map((data) => {
        return (
          <>
          <tr key={data._id} >
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
            key="Edit" 
            //onClick={EditSty = {color:"#1500ff"}}
            style={{color: isLightMode? "#7b0445": EditSty}}>
              Edit Question
              </td>
          </tr>
          </>
        );
      })}
    </tbody>
  );
};

export default ModTableBody;