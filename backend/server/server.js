const express = require("express");
const app = express();
const cors = require('cors')
const loginRoute = require('./routes/userLogin')
const getAllUsersRoute = require('./routes/userGetAllUsers')
const registerRoute = require('./routes/userSignUp')
const getUserByIdRoute = require('./routes/userGetUserById')
const dbConnection = require('./config/db.config')
const editUser = require('./routes/userEditUser')
const deleteUser = require('./routes/userDeleteAll')
const newQuestionRoute = require('./routes/questionCreate')
const getAllQuestionsRoute = require('./routes/questionGetAllQuestions')
const editQuestionRoute = require('./routes/questionEditQuestion')
const getQuestionByIdRoute = require('./routes/questionGetQuestionById')
const deleteQuestion = require('./routes/questionDeleteAll')
const userAddXp = require("./routes/userAddXp");
const userGetLevels = require("./routes/userGetLevels");
const profileImageUpload = require("./routes/profileImageUpload");


require('dotenv').config();
const SERVER_PORT = 8081

dbConnection()
app.use(cors({origin: '*'}))
app.use(express.json())
app.use('/user', loginRoute)
app.use('/user', registerRoute)
app.use('/user', getAllUsersRoute)
app.use('/user', getUserByIdRoute)
app.use('/user', editUser)
app.use('/user', deleteUser)
app.use('/question', newQuestionRoute)
app.use('/question', getAllQuestionsRoute)
app.use('/question', editQuestionRoute)
app.use('/question', getQuestionByIdRoute)
app.use('/question', deleteQuestion)
app.use("/user", userAddXp);
app.use("/user", userGetLevels);
app.use("/user", profileImageUpload);

app.listen(SERVER_PORT, (req, res) => {
    console.log(`The backend service is running on port ${SERVER_PORT} and waiting for requests.`);
})
